🔹 1. Domain and Its Fields


MATCH (field)-[r:PART_OF]->(domain:Domain)
RETURN domain, r, field;


🔹 2. Domain → Fields → Subfields

MATCH (subfield:Subfield)-[r1:PART_OF]->(field)-[r2:PART_OF]->(domain:Domain)
RETURN domain, r2, field, r1, subfield;



🔹 3. Full Graph: Domain → Fields → Subfields → Skills/Tools/Certifications/Verifications

MATCH (subfield:Subfield)-[r1:PART_OF]->(field)-[r2:PART_OF]->(domain:Domain)
OPTIONAL MATCH (subfield)-[r3:REQUIRES]->(skill:Skill)
OPTIONAL MATCH (subfield)-[r4:USES]->(tool:Tool)
OPTIONAL MATCH (subfield)-[r5:REQUIRES_CERT]->(cert:Certification)
OPTIONAL MATCH (subfield)-[r6:CAN_BE_VERIFIED_BY]->(verify:Verification)
RETURN domain, r2, field, r1, subfield, 
       r3, skill, 
       r4, tool, 
       r5, cert, 
       r6, verify;



🔹 4. Example, get only the Programming field and its subfields

MATCH (category {label: "Software Development"})-[:PART_OF]->(field:Field)
MATCH (field)-[:PART_OF]->(domain:Domain)
MATCH (subfield:Subfield)-[:PART_OF]->(category)

OPTIONAL MATCH (subfield)-[r1:REQUIRES]->(skill:Skill)
OPTIONAL MATCH (subfield)-[r2:USES]->(tool:Tool)
OPTIONAL MATCH (subfield)-[r3:REQUIRES_CERT]->(cert:Certification)
OPTIONAL MATCH (subfield)-[r4:CAN_BE_VERIFIED_BY]->(verify:Verification)

RETURN domain, field, category, subfield, 
       r1, skill, 
       r2, tool, 
       r3, cert, 
       r4, verify;



