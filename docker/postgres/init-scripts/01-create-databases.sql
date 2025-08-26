-- Create the mawaheb-cms database
-- The main 'mawaheb' database is already created by the POSTGRES_DB environment variable

CREATE DATABASE "mawaheb-cms";

-- Grant all privileges to the user for both databases
GRANT ALL PRIVILEGES ON DATABASE "mawaheb" TO mawaheb_user;
GRANT ALL PRIVILEGES ON DATABASE "mawaheb-cms" TO mawaheb_user;

-- Connect to mawaheb-cms and set up the user as owner
\c "mawaheb-cms"
GRANT ALL ON SCHEMA public TO mawaheb_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO mawaheb_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO mawaheb_user;

-- Connect back to mawaheb and set up the user as owner
\c mawaheb
GRANT ALL ON SCHEMA public TO mawaheb_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO mawaheb_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO mawaheb_user; 