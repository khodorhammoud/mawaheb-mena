#!/usr/bin/env node

import postgres from 'postgres';
import { config } from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get current directory
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, '../');

// Load environment variables from the test env file
const envPath = path.resolve(currentDir, '../apps/frontend/.env.test');
config({ path: envPath });

async function setupTestDb() {
  console.log('Setting up test database from schema definitions...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in test environment');
  }

  console.log('Using connection string:', connectionString);

  // Schema file path
  const schemaPath = path.resolve(projectRoot, 'packages/db/src/schema/schema.ts');
  const enumsPath = path.resolve(projectRoot, 'packages/db/src/types/enums.ts');
  console.log('Schema path:', schemaPath);
  console.log('Enums path:', enumsPath);

  try {
    // Read the schema file to extract table definitions
    console.log('\nReading schema files...');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }
    if (!fs.existsSync(enumsPath)) {
      throw new Error(`Enums file not found at ${enumsPath}`);
    }

    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const enumsContent = fs.readFileSync(enumsPath, 'utf8');

    // Connect to the database
    const sql = postgres(connectionString, {
      onnotice: () => {}, // Suppress notices
    });

    // Extract all enum declarations from schema to build a comprehensive mapping
    console.log('\nAnalyzing schema for enum declarations...');

    // Map enum variable names to their actual DB type names
    const enumVarToDbName = {};

    // 1. Capture all pgEnum declarations with Object.values
    const objectValuesEnumRegex =
      /export const (\w+Enum) = pgEnum\(['"](\w+)['"],\s*Object\.values\((\w+)\)/g;
    const objectValuesEnumMatches = [...schemaContent.matchAll(objectValuesEnumRegex)];

    // 2. Capture all pgEnum declarations with direct values
    const directValuesEnumRegex = /export const (\w+Enum) = pgEnum\(['"](\w+)['"],\s*\[(.*?)\]\)/g;
    const directValuesEnumMatches = [...schemaContent.matchAll(directValuesEnumRegex)];

    // 3. Capture all other pgEnum declarations that might be using different patterns
    const otherEnumRegex = /export const (\w+Enum) = pgEnum\(['"](\w+)['"]/g;
    const otherEnumMatches = [...schemaContent.matchAll(otherEnumRegex)].filter(match => {
      // Filter out matches that are already covered by the first two patterns
      const [_, enumVarName] = match;
      const alreadyCaptured = [...objectValuesEnumMatches, ...directValuesEnumMatches].some(
        m => m[1] === enumVarName
      );
      return !alreadyCaptured;
    });

    // All enum declarations
    const allEnumDeclarations = [
      ...objectValuesEnumMatches,
      ...directValuesEnumMatches,
      ...otherEnumMatches,
    ];

    console.log(`Found ${allEnumDeclarations.length} enum declarations in schema`);

    // Build mapping from variable name to DB type name
    for (const match of allEnumDeclarations) {
      const [_, enumVarName, dbEnumName] = match;
      enumVarToDbName[enumVarName] = dbEnumName;
      console.log(`  Enum mapping: ${enumVarName} -> ${dbEnumName}`);
    }

    // Extract TypeScript enums from enums.ts
    const tsEnumDefinitions = {};
    const enumDefRegex = /export enum (\w+) {([^}]+)}/g;
    let enumMatch;

    while ((enumMatch = enumDefRegex.exec(enumsContent)) !== null) {
      const enumName = enumMatch[1];
      const enumValuesStr = enumMatch[2];

      // Parse enum values
      const enumValues = [];
      const valueRegex = /(\w+)\s*=\s*['"]([\w-]+)['"]/g;
      let valueMatch;

      while ((valueMatch = valueRegex.exec(enumValuesStr)) !== null) {
        enumValues.push(valueMatch[2]); // Push the value part
      }

      tsEnumDefinitions[enumName] = enumValues;
    }

    console.log(`\nExtracted ${Object.keys(tsEnumDefinitions).length} TypeScript enums`);

    // Build a mapping from TS enum name to DB enum type name
    // by analyzing Object.values usage in schema
    const tsEnumToDbEnum = {};

    for (const match of objectValuesEnumMatches) {
      const [_, enumVarName, dbEnumName, tsEnumName] = match;
      tsEnumToDbEnum[tsEnumName] = dbEnumName;
    }

    console.log(`Found ${Object.keys(tsEnumToDbEnum).length} TypeScript enum to DB type mappings`);

    // Create all required enum types in the database
    console.log('\nCreating enum types from TypeScript definitions...');

    // Add retry logic for database initialization issues
    const retryOperation = async (operation, maxRetries = 3, delay = 2000) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await operation();
        } catch (error) {
          if (error.message.includes('starting up') && attempt < maxRetries) {
            console.log(
              `  ⚠️ Database is starting up. Retrying in ${delay / 1000}s... (Attempt ${attempt}/${maxRetries})`
            );
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw error;
          }
        }
      }
    };

    for (const [tsEnumName, values] of Object.entries(tsEnumDefinitions)) {
      // Find corresponding DB enum name if it exists
      const dbEnumName = tsEnumToDbEnum[tsEnumName];

      if (dbEnumName) {
        console.log(`Creating enum type: ${dbEnumName} (from TS enum ${tsEnumName})`);

        try {
          // Check if enum type already exists
          const enumExists = await retryOperation(
            () => sql`
            SELECT 1 FROM pg_type JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace 
            WHERE pg_type.typname = ${dbEnumName} AND pg_namespace.nspname = 'public'
          `
          );

          if (enumExists.length === 0) {
            if (values && values.length > 0) {
              console.log(`  Values: ${values.join(', ')}`);

              // Create the enum type with retry logic
              await retryOperation(() =>
                sql.unsafe(
                  `CREATE TYPE ${dbEnumName} AS ENUM (${values.map(v => `'${v}'`).join(', ')})`
                )
              );
              console.log(`  ✅ Enum type ${dbEnumName} created`);
            } else {
              console.warn(`  ⚠️ No values found for enum type ${tsEnumName}`);
            }
          } else {
            console.log(`  ⚠️ Enum type ${dbEnumName} already exists, skipping`);
          }
        } catch (error) {
          console.error(`  ❌ Error creating enum type ${dbEnumName}:`, error.message);
        }
      }
    }

    // Create enum types defined directly in schema with array literals
    console.log('\nCreating direct-value enum types...');
    for (const match of directValuesEnumMatches) {
      const [_, enumVarName, dbEnumName, valuesStr] = match;
      console.log(`Creating enum type: ${dbEnumName} (direct values)`);

      try {
        // Check if enum type already exists
        const enumExists = sql`
          SELECT 1 FROM pg_type JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace 
          WHERE pg_type.typname = ${dbEnumName} AND pg_namespace.nspname = 'public'
        `;

        if (enumExists.length === 0) {
          // Parse values from the array literal
          const values = valuesStr
            .split(',')
            .map(item => item.trim().replace(/^['"]|['"]$/g, ''))
            .filter(Boolean);

          if (values && values.length > 0) {
            console.log(`  Values: ${values.join(', ')}`);

            // Create the enum type
            await sql.unsafe(
              `CREATE TYPE ${dbEnumName} AS ENUM (${values.map(v => `'${v}'`).join(', ')})`
            );
            console.log(`  ✅ Enum type ${dbEnumName} created`);
          } else {
            console.warn(`  ⚠️ No values found for enum type ${dbEnumName}`);
          }
        } else {
          console.log(`  ⚠️ Enum type ${dbEnumName} already exists, skipping`);
        }
      } catch (error) {
        console.error(`  ❌ Error creating enum type ${dbEnumName}:`, error.message);
      }
    }

    // Create missing enum types based on naming conventions
    console.log('\nCreating missing enum types...');

    // List of enum types needed based on errors observed
    const missingEnumTypes = [
      'project_type',
      'employeraccounttype',
      'day',
      'account_type',
      'role',
      'account_status',
      'job_application_status',
      'timesheet_status',
      'service_type',
      'mode',
      'distance',
      'job_type',
      'experience_level',
      'contract_type',
    ];

    // Find corresponding TS enum for each missing DB enum
    for (const dbEnumName of missingEnumTypes) {
      // Check if the enum type already exists
      const enumExists = sql`
        SELECT 1 FROM pg_type JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace 
        WHERE pg_type.typname = ${dbEnumName} AND pg_namespace.nspname = 'public'
      `;

      if (enumExists.length > 0) {
        console.log(`  ⚠️ Enum type ${dbEnumName} already exists, skipping`);
        continue;
      }

      // Convert snake_case to PascalCase for TS enum name lookup
      const possibleTsNames = [
        // Direct camelCase to snake_case conversion
        dbEnumName.replace(/_([a-z])/g, g => g[1].toUpperCase()),

        // PascalCase version
        dbEnumName
          .split('_')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(''),

        // Handle special cases
        dbEnumName === 'role' ? 'UserRole' : null,
        dbEnumName === 'employeraccounttype' ? 'EmployerAccountType' : null,
      ].filter(Boolean);

      // Find matching TS enum
      let created = false;
      for (const tsName of possibleTsNames) {
        const values = tsEnumDefinitions[tsName];
        if (values && values.length > 0) {
          console.log(`Creating missing enum type: ${dbEnumName} (from TS enum ${tsName})`);
          console.log(`  Values: ${values.join(', ')}`);

          try {
            // Create the enum type
            await sql.unsafe(
              `CREATE TYPE ${dbEnumName} AS ENUM (${values.map(v => `'${v}'`).join(', ')})`
            );
            console.log(`  ✅ Enum type ${dbEnumName} created`);
            created = true;
            break; // Found a match, no need to continue with other possible names
          } catch (error) {
            console.error(`  ❌ Error creating enum type ${dbEnumName}:`, error.message);
          }
        }
      }

      // If we couldn't find a matching TypeScript enum, create with some default values as fallback
      if (!created) {
        // For role enum, use default values
        if (dbEnumName === 'role') {
          try {
            console.log(`Creating missing enum type: ${dbEnumName} (with default values)`);
            await sql.unsafe(`CREATE TYPE ${dbEnumName} AS ENUM ('admin', 'user')`);
            console.log(`  ✅ Enum type ${dbEnumName} created`);
          } catch (error) {
            console.error(`  ❌ Error creating enum type ${dbEnumName}:`, error.message);
          }
        } else if (dbEnumName === 'day') {
          // For day enum, use default values
          try {
            console.log(`Creating missing enum type: ${dbEnumName} (with default values)`);
            await sql.unsafe(
              `CREATE TYPE ${dbEnumName} AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')`
            );
            console.log(`  ✅ Enum type ${dbEnumName} created`);
          } catch (error) {
            console.error(`  ❌ Error creating enum type ${dbEnumName}:`, error.message);
          }
        }
      }
    }

    // Create a mapping for enum types used in columns based on direct schema analysis
    console.log('\nAnalyzing column enum usages...');
    const columnEnumMapping = {};

    // Look for patterns like: roleColumn: userRoleEnum("role")
    const columnEnumRegex = /(\w+):\s*(\w+)Enum\(['"]([\w_]+)?['"]/g;
    const columnEnumMatches = [...schemaContent.matchAll(columnEnumRegex)];

    for (const match of columnEnumMatches) {
      const [_, columnName, enumVarPrefix, enumTypeOverride] = match;
      const enumVarName = enumVarPrefix + 'Enum';

      if (enumVarToDbName[enumVarName]) {
        // If we found a direct mapping from variable to DB type
        columnEnumMapping[columnName] = enumTypeOverride || enumVarToDbName[enumVarName];
        console.log(`  Column mapping: ${columnName} -> ${columnEnumMapping[columnName]}`);
      }
    }

    // Additional column-enum mappings based on naming patterns
    const commonColumnEnumMappings = {
      role: 'role',
      type: 'type',
      providerType: 'provider',
      status: 'account_status',
      day: 'day',
      jobType: 'job_type',
      projectType: 'project_type',
      experienceLevel: 'experience_level',
      contractType: 'contract_type',
      accountType: 'account_type',
      applicationStatus: 'job_application_status',
      timesheetStatus: 'timesheet_status',
    };

    // Apply these mappings only when there's a matching enum type in the database
    for (const [columnName, enumType] of Object.entries(commonColumnEnumMappings)) {
      if (!columnEnumMapping[columnName]) {
        columnEnumMapping[columnName] = enumType;
        console.log(`  Added column mapping: ${columnName} -> ${enumType}`);
      }
    }

    console.log(`Found ${Object.keys(columnEnumMapping).length} column-to-enum mappings`);

    console.log('\nExtracting table definitions...');
    // Find table definitions in the schema
    const tableRegex = /export const (\w+Table) = pgTable\(['"](\w+)['"],\s*{([\s\S]*?)}\);/g;
    const tableMatches = [...schemaContent.matchAll(tableRegex)];

    console.log(`Found ${tableMatches.length} tables in schema`);

    // Analyze dependencies to determine creation order
    const tableDefinitions = [];
    const dependencies = {};

    for (const tableMatch of tableMatches) {
      const [_, varName, dbTableName, columnDefs] = tableMatch;

      // Check for references to other tables
      const references = [];
      const refRegex = /references\(\(\)\s*=>\s*(\w+)/g;
      let refMatch;

      while ((refMatch = refRegex.exec(columnDefs)) !== null) {
        references.push(refMatch[1]);
      }

      tableDefinitions.push({
        varName,
        dbTableName,
        columnDefs,
        references,
      });

      dependencies[varName] = references;
    }

    // Function to sort tables by dependencies
    const getCreationOrder = (tableDefinitions, dependencies) => {
      // Use topological sorting
      const visited = {};
      const tempMarked = {};
      const result = [];

      // Mark nodes as either temporary or permanent
      function visit(node) {
        // If we've already visited this node permanently, we're done
        if (visited[node]) return;

        // If we find a temporary mark, we have a cycle
        if (tempMarked[node]) {
          // We have a cycle, but let's handle it gracefully for this use case
          console.warn(`Warning: Cyclic dependency detected involving ${node}`);
          return;
        }

        // Mark node temporarily
        tempMarked[node] = true;

        // Visit all dependencies first
        const deps = dependencies[node] || [];
        for (const dep of deps) {
          visit(dep);
        }

        // Mark node permanently
        visited[node] = true;
        // Remove temporary mark
        tempMarked[node] = false;
        // Add to result
        result.unshift(node);
      }

      // Visit all nodes
      tableDefinitions.forEach(table => {
        if (!visited[table.varName]) {
          visit(table.varName);
        }
      });

      return result;
    };

    // Get creation order based on dependencies
    const creationOrder = getCreationOrder(tableDefinitions, dependencies);
    console.log(
      `Table creation order (${creationOrder.length} tables):\n${creationOrder.join('\n')}`
    );

    // Create tables in a two-phase approach to handle circular dependencies
    console.log('\n=== PHASE 1: Creating tables without foreign key constraints ===');

    // First create all tables without foreign key constraints
    for (const tableName of creationOrder) {
      const tableInfo = tableDefinitions.find(t => t.varName === tableName);
      if (!tableInfo) continue;

      console.log(`\nCreating table: ${tableInfo.dbTableName} (without foreign keys)`);

      // Extract column definitions
      const columnLines = tableInfo.columnDefs
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && line.includes(':') && !line.startsWith('//'));

      // Basic types mapping for Drizzle to SQL
      const columnTypes = [];
      const foreignKeys = []; // Store foreign keys for phase 2

      for (const columnLine of columnLines) {
        try {
          // Extract column name and type information
          const colonIndex = columnLine.indexOf(':');
          if (colonIndex > 0) {
            const columnName = columnLine.substring(0, colonIndex).trim();
            const columnType = columnLine.substring(colonIndex + 1).trim();

            // Skip if line doesn't match pattern
            if (!columnName || !columnType) continue;

            // Convert camelCase to snake_case for DB column names
            const dbColumnName = columnName.replace(/([A-Z])/g, '_$1').toLowerCase();

            // Basic column type translation
            let sqlType = '';

            // Handle array types with SQL default values first
            if (columnType.includes('.array()') && columnType.includes('.default(sql`')) {
              // Handle array types with SQL default
              let baseType = 'TEXT';
              let defaultValue = "'{}'";

              // Try to extract enum type for arrays
              const arrayEnumMatch = columnType.match(/(\w+)Enum\([^)]*\)\s*\.\s*array\(\)/);
              if (arrayEnumMatch) {
                const enumVarPrefix = arrayEnumMatch[1];
                const enumVarName = enumVarPrefix + 'Enum';
                baseType = enumVarToDbName[enumVarName] || baseType;
              }

              // Extract default value
              const defaultMatch = columnType.match(/default\(sql`([^`]+)`\)/);
              if (defaultMatch) {
                defaultValue = defaultMatch[1];
              }

              // Format column definition
              sqlType = `${baseType}[] DEFAULT ${defaultValue}::${baseType}[]`;

              if (columnType.includes('.notNull()')) {
                sqlType += ' NOT NULL';
              }
            }
            // Regular type handling
            else if (columnType.includes('serial(')) {
              sqlType = 'SERIAL PRIMARY KEY';
            } else if (columnType.includes('varchar(')) {
              // Extract length if specified
              const lengthMatch = columnType.match(
                /varchar\(\s*['"]?(\w+)['"]?\s*,\s*{\s*length\s*:\s*(\d+)/
              );
              const length = lengthMatch ? lengthMatch[2] : '255'; // Default to 255
              sqlType = `VARCHAR(${length})`;

              // Check for constraints
              if (columnType.includes('.unique()')) {
                sqlType += ' UNIQUE';
              }
              if (columnType.includes('.notNull()')) {
                sqlType += ' NOT NULL';
              }
            } else if (columnType.includes('boolean(')) {
              sqlType = 'BOOLEAN';
              if (columnType.includes('.default(false)')) {
                sqlType += ' DEFAULT FALSE';
              } else if (columnType.includes('.default(true)')) {
                sqlType += ' DEFAULT TRUE';
              }
              if (columnType.includes('.notNull()')) {
                sqlType += ' NOT NULL';
              }
            } else if (columnType.includes('integer(')) {
              sqlType = 'INTEGER';

              if (columnType.includes('.notNull()')) {
                sqlType += ' NOT NULL';
              }

              // Check for references - store for phase 2
              const refMatch = columnType.match(/references\(\(\)\s*=>\s*(\w+)(\.(\w+))?\)/);
              if (refMatch) {
                const refTableVar = refMatch[1];
                const refTableInfo = tableDefinitions.find(t => t.varName === refTableVar);
                const refTable = refTableInfo
                  ? refTableInfo.dbTableName
                  : refTableVar.replace(/Table$/, '').toLowerCase();
                const refColumn = refMatch[3] || 'id';

                // Create foreign key constraint for phase 2
                let fkConstraint = `ALTER TABLE ${tableInfo.dbTableName} ADD CONSTRAINT fk_${dbColumnName}_${refTable}_${refColumn} `;
                fkConstraint += `FOREIGN KEY (${dbColumnName}) REFERENCES ${refTable} (${refColumn})`;

                // Add cascade if specified
                if (columnType.includes('onDelete: "cascade"')) {
                  fkConstraint += ' ON DELETE CASCADE';
                }

                foreignKeys.push(fkConstraint);
              }
            } else if (columnType.includes('text(')) {
              sqlType = 'TEXT';
              if (columnType.includes('.notNull()')) {
                sqlType += ' NOT NULL';
              }
            } else if (columnType.includes('timestamp(')) {
              sqlType = 'TIMESTAMP';
              if (
                columnType.includes('.defaultNow()') ||
                columnType.includes('.default(sql`now()`')
              ) {
                sqlType += ' DEFAULT NOW()';
              }
              if (columnType.includes('.notNull()')) {
                sqlType += ' NOT NULL';
              }
            } else if (columnType.includes('jsonb(')) {
              sqlType = 'JSONB';
              if (columnType.includes('.default(')) {
                if (columnType.includes("default(sql`'[]'::jsonb`)")) {
                  sqlType += " DEFAULT '[]'::jsonb";
                } else if (columnType.includes("default(sql`'{}'::jsonb`)")) {
                  sqlType += " DEFAULT '{}'::jsonb";
                } else {
                  sqlType += " DEFAULT '{}'::jsonb";
                }
              }
              if (columnType.includes('.notNull()')) {
                sqlType += ' NOT NULL';
              }
            } else if (columnType.match(/(\w+)\([^)]*\)\s*\.\s*array\(\)/)) {
              // Handle array types more carefully
              let baseType = 'TEXT';

              // Try to extract the enum type for arrays
              const arrayEnumMatch = columnType.match(/(\w+)Enum\([^)]*\)\s*\.\s*array\(\)/);
              if (arrayEnumMatch) {
                const enumVarPrefix = arrayEnumMatch[1];
                const enumVarName = enumVarPrefix + 'Enum';
                baseType = enumVarToDbName[enumVarName] || 'TEXT';
              }

              // Format as proper array type
              sqlType = `${baseType}[]`;

              // Handle default for arrays
              if (columnType.includes('.default(')) {
                if (columnType.includes('ARRAY[]::')) {
                  // For proper array default handling
                  const arrayTypeMatch = columnType.match(/ARRAY\[\]::([\w_]+)\[\]/);
                  if (arrayTypeMatch) {
                    sqlType += ` DEFAULT ARRAY[]::${arrayTypeMatch[1]}[]`;
                  } else {
                    sqlType += ` DEFAULT '{}'::${baseType}[]`;
                  }
                } else if (columnType.includes("'{}'::text[]")) {
                  sqlType += " DEFAULT '{}'::text[]";
                } else {
                  sqlType += ` DEFAULT '{}'::${baseType}[]`;
                }
              }

              if (columnType.includes('.notNull()')) {
                sqlType += ' NOT NULL';
              }
            } else if (columnType.includes('real(')) {
              sqlType = 'REAL';
              if (columnType.includes('.notNull()')) {
                sqlType += ' NOT NULL';
              }
            } else if (columnType.includes('date(')) {
              sqlType = 'DATE';
              if (columnType.includes('.notNull()')) {
                sqlType += ' NOT NULL';
              }
            } else if (columnType.includes('numeric(')) {
              sqlType = 'NUMERIC';
              if (columnType.includes('.notNull()')) {
                sqlType += ' NOT NULL';
              }
            } else if (columnType.includes('time(')) {
              sqlType = 'TIME';
              if (columnType.includes('.notNull()')) {
                sqlType += ' NOT NULL';
              }
            } else if (columnType.match(/(\w+)Enum\(/)) {
              // Check if we have a mapping for this column
              if (columnEnumMapping[columnName]) {
                sqlType = columnEnumMapping[columnName];
              } else {
                // Try to extract the enum type directly from the column type
                const enumTypeMatch = columnType.match(/(\w+)Enum\(['"]([\w_]+)['"]/);
                if (enumTypeMatch) {
                  // If the enum has an explicit type name in the definition
                  sqlType = enumTypeMatch[2];
                } else {
                  // Try to determine enum type from variable name
                  const enumVarMatch = columnType.match(/(\w+)Enum\(/);
                  if (enumVarMatch) {
                    const enumVarName = enumVarMatch[1] + 'Enum';
                    // Look up the DB type name from our mapping
                    sqlType = enumVarToDbName[enumVarName] || 'TEXT';
                  } else {
                    // Default to TEXT if we can't determine the enum type
                    sqlType = 'TEXT';
                  }
                }
              }

              if (columnType.includes('.notNull()')) {
                sqlType += ' NOT NULL';
              }
            } else {
              // Default to TEXT for unknown types
              sqlType = 'TEXT';
              if (columnType.includes('.notNull()')) {
                sqlType += ' NOT NULL';
              }
            }

            // Skip id column if it's serial primary key (already added)
            if (!(columnName === 'id' && sqlType === 'SERIAL PRIMARY KEY')) {
              columnTypes.push(`${dbColumnName} ${sqlType}`);
            }
          }
        } catch (error) {
          console.warn(`  ⚠️ Error parsing column definition: ${columnLine}`, error);
        }
      }

      // Store the foreign key constraints for each table
      tableInfo.foreignKeys = foreignKeys;

      // Always add id serial primary key if not present
      if (!columnTypes.some(col => col.startsWith('id '))) {
        columnTypes.unshift('id SERIAL PRIMARY KEY');
      }

      // Create table
      try {
        // Check if table already exists
        const tableExists = await sql`
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = ${tableInfo.dbTableName}
        `;

        if (tableExists.length === 0) {
          // Special handling for freelancers table which has complex array types
          if (tableInfo.dbTableName === 'freelancers') {
            console.log(
              `  Using hand-crafted SQL for freelancers table due to complex array types`
            );

            try {
              // Create a simplified version of the table with proper syntax
              await sql.unsafe(`
                CREATE TABLE IF NOT EXISTS freelancers (
                  id SERIAL PRIMARY KEY,
                  account_id INTEGER,
                  about TEXT,
                  fields_of_expertise TEXT[] DEFAULT '{}'::text[],
                  portfolio JSONB DEFAULT '[]'::jsonb,
                  work_history JSONB DEFAULT '[]'::jsonb,
                  cv_link TEXT,
                  video_link TEXT,
                  certificates JSONB DEFAULT '[]'::jsonb,
                  educations JSONB DEFAULT '[]'::jsonb,
                  years_of_experience INTEGER,
                  preferred_project_types project_type[] DEFAULT '{}'::project_type[],
                  hourly_rate INTEGER,
                  compensation_type TEXT,
                  available_for_work BOOLEAN DEFAULT FALSE,
                  date_available_from DATE,
                  jobs_open_to TEXT[] DEFAULT '{}'::text[],
                  hours_available_from TIME,
                  hours_available_to TIME
                );
              `);
              console.log(`  ✅ Table ${tableInfo.dbTableName} created`);
            } catch (error) {
              console.error(`  ❌ Error creating table ${tableInfo.dbTableName}:`, error.message);
              console.error(`  DEBUG: Full error for freelancers table:`, error);
            }
          } else {
            await sql.unsafe(`
              CREATE TABLE IF NOT EXISTS ${tableInfo.dbTableName} (
                ${columnTypes.join(',\n                ')}
              );
            `);
            console.log(`  ✅ Table ${tableInfo.dbTableName} created`);
          }
        } else {
          console.log(`  ⚠️ Table ${tableInfo.dbTableName} already exists, skipping`);
        }
      } catch (error) {
        console.error(`  ❌ Error creating table ${tableInfo.dbTableName}:`, error.message);
        // For freelancers table, log the full error
        if (tableInfo.dbTableName === 'freelancers') {
          console.error(`  DEBUG: Full error for freelancers table:`, error);
        }
      }
    }

    // Phase 2: Add all foreign key constraints
    console.log('\n=== PHASE 2: Adding foreign key constraints ===');

    for (const tableInfo of tableDefinitions) {
      if (!tableInfo.foreignKeys || tableInfo.foreignKeys.length === 0) continue;

      console.log(`\nAdding foreign keys for table: ${tableInfo.dbTableName}`);

      for (const fkConstraint of tableInfo.foreignKeys) {
        try {
          await sql.unsafe(fkConstraint);
          console.log(`  ✅ Added foreign key constraint: ${fkConstraint}`);
        } catch (error) {
          console.error(`  ❌ Error adding foreign key constraint: ${error.message}`);
        }
      }
    }

    // Verify the schema was applied correctly
    console.log('\nVerifying database tables...');
    const dbTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    if (dbTables.length > 0) {
      console.log(`Found ${dbTables.length} tables in the database:`);
      dbTables.forEach(table => {
        console.log(` - ${table.table_name}`);
      });
    } else {
      console.warn('No tables found in the database. Schema generation may have failed.');
    }

    // Add test data
    console.log('\nAdding test data...');

    try {
      // Check if the users table is created and has the right columns
      const userTableExists = await sql`
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      `;

      if (userTableExists.length > 0) {
        // Get the columns in the users table
        const userColumns = await sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'users'
        `;

        const columnNames = userColumns.map(col => col.column_name);
        console.log(`User table columns: ${columnNames.join(', ')}`);

        // Check if required columns exist
        const hasEmail = columnNames.includes('email');

        if (hasEmail) {
          // Check if test user already exists
          const testUserEmail = 'test@example.com';
          const existingUser = await sql`
            SELECT id FROM users WHERE email = ${testUserEmail}
          `;

          // Add test user if it doesn't exist
          if (existingUser.length === 0) {
            // Build the SQL based on available columns
            const columnList = [];
            const valueList = [];

            // Common fields
            if (columnNames.includes('email')) {
              columnList.push('email');
              valueList.push(`'${testUserEmail}'`);
            }

            if (columnNames.includes('first_name')) {
              columnList.push('first_name');
              valueList.push(`'Test'`);
            }

            if (columnNames.includes('last_name')) {
              columnList.push('last_name');
              valueList.push(`'User'`);
            }

            if (columnNames.includes('password_hash') || columnNames.includes('pass_hash')) {
              const passwordColumn = columnNames.includes('password_hash')
                ? 'password_hash'
                : 'pass_hash';
              columnList.push(passwordColumn);
              valueList.push(`'test_hash'`);
            }

            if (columnNames.includes('is_verified')) {
              columnList.push('is_verified');
              valueList.push(`true`);
            }

            if (columnNames.includes('is_onboarded')) {
              columnList.push('is_onboarded');
              valueList.push(`true`);
            }

            if (columnNames.includes('role')) {
              columnList.push('role');
              valueList.push(`'user'`); // Assuming 'user' is a valid role
            }

            // Insert user with available columns
            if (columnList.length > 0) {
              await sql.unsafe(`
                INSERT INTO users (${columnList.join(', ')}) 
                VALUES (${valueList.join(', ')})
              `);
              console.log('Test user created successfully');
            }

            // Verify user was created
            const users = await sql`SELECT * FROM users`;
            console.log(`Number of users in database: ${users.length}`);
          } else {
            console.log('Test user already exists');
          }
        } else {
          console.log('Users table missing required columns, skipping test data creation');
        }
      } else {
        console.log("Users table doesn't exist yet, skipping test data creation");
      }
    } catch (error) {
      console.error('Error adding test data:', error.message);
    }

    console.log('\nDatabase setup complete!');

    // Close the client
    await sql.end();
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
}

// Run the setup if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  setupTestDb()
    .then(() => {
      console.log('Test database setup completed successfully.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Test database setup failed:', error);
      process.exit(1);
    });
}

export default setupTestDb;
