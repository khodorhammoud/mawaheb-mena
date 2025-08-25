## Let's define a Skillfolio

A **Skillfolio** is a unified format for a freelancer to showcase their skills, experience, and projects. It is a generalized schema designed to fit freelancers across domains like IT, Marketing, Design, etc.

---

### 📄 Skillfolio Fields

- `userId`
- `domain` (string, e.g. `"Technology"`)
- `field` (string, e.g. `"Information Technology"`)
- `category` (string, Optional: e.g. `"Software Engineering"`)
- `subfield` (string, e.g. `"Backend Development"`)
- `readinessScore` (number, computed dynamically)
- `strengths` (`string[]`, tags/skills/tools/certs)
- `weaknesses` (`string[]`, tags/skills/tools/certs)
- `gaps` (`string[]`, missing items from graph expectations)
- `profile`:
  - `skills` (`UserSkill[]`):
    - `name`: `string`
    - `proficiency`: `'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'`
    - `yearsOfExperience?`: `number`
    - `lastUsed?`: `string`
    - `verifiedBy?`: `string[]` — e.g. `["Project", "Certificate"]`
  - `tools`: `string[]`
  - `certifications`: `string[]`
  - `education` (`Education[]`):
    - `degree`: `string`
    - `field`: `string`
    - `institution`: `string`
    - `completedOn`: `string`
  - `experience` (`Experience[]`):
    - `role`: `string`
    - `company?`: `string`
    - `durationYears?`: `number`
    - `technologies?`: `string[]`
    - `projectDescriptions?`: `string[]`
  - `verifications?` (`Verification[]`):
    - `type`: `string` (e.g. `"Project Use"`, `"Reference"`)
    - `evidence?`: `string`
  - `custom?`: `Record<string, any>`
- `createdAt`: `string`
- `updatedAt`: `string`

---

### 🔍 Extraction Logic

After a freelancer creates an account, the skillfolio is extracted by comparing user data against a **Graph Database** with the following structure:

---

### 🔷 Node Categories (Hierarchy)

1. **Domain**  
   - Broad discipline  
   - Examples: Technology, Healthcare, Education, Finance

2. **Field**  
   - Specific area within a domain  
   - Examples: Software Engineering, Data Science, Network Administration

3. **Subfield / Role**  
   - Specialized role or work segment  
   - Examples: Backend Developer, DevOps Engineer, ML Engineer

4. **Competency Group**  
   - Cluster of related skills  
   - Examples: API Design, Testing, Security

5. **Skill / Knowledge Unit**  
   - Individual skill  
   - Examples: Node.js, REST API, PostgreSQL

6. **Tool / Technology**  
   - Tool used to implement a skill  
   - Examples: Git, Docker, Kubernetes

7. **Certification / Credential**  
   - Validation mechanism  
   - Examples: AWS Certified Developer, Docker Certified Associate

8. **Verification Method**  
   - How skill is demonstrated  
   - Examples: Project Use, Certification, Code Sample

9. **Project / Experience Sample**  
   - Real-life applied experience  
   - Examples: "Inventory System", "CI/CD pipeline"

---

### 🔶 Edge Types (Relationships)

| Edge Type           | From → To                          | Description                         |
|---------------------|------------------------------------|-------------------------------------|
| `PART_OF`           | Subfield → Field<br>Field → Domain | Hierarchical containment            |
| `SPECIALIZATION_OF` | Role → Subfield                    | Narrower specialization             |
| `REQUIRES`          | Role/Subfield → Skill              | Skill required                      |
| `USES`              | Skill → Tool                       | Tools that support the skill        |
| `COVERS`            | Certification → Skill              | Cert validates skills               |
| `VERIFIES`          | Verification Method → Skill        | How skill mastery is shown          |
| `VALIDATED_BY`      | Skill → Verification Method        | Inverse of VERIFIES                 |
| `BELONGS_TO_GROUP`  | Skill → Competency Group           | Skill classification                |
| `HAS_PROJECT`       | User → Project                     | Real-world application              |
| `PROJECT_USES`      | Project → Skill                    | Skills used in a project            |
| `PROJECT_VERIFIES`  | Project → Skill                    | Evidence of skill mastery           |
| `REQUIRES_CERT`     | Subfield → Certification           | Certs needed to prove capability    |

---

### 💾 JSON Example

```
{
  "nodes": [
    { "id": "Technology", "type": "Domain" },
    { "id": "Programming", "type": "Field" },
    { "id": "Backend Development", "type": "Subfield" },

    { "id": "Node.js", "type": "Skill" },
    { "id": "PostgreSQL", "type": "Skill" },
    { "id": "System Design", "type": "Skill" },

    { "id": "Docker", "type": "Tool" },
    { "id": "Docker Certified Associate", "type": "Certification" },
    { "id": "Project Use", "type": "Verification" }
  ],
  "edges": [
    { "from": "Programming", "to": "Technology", "type": "PART_OF" },
    { "from": "Backend Development", "to": "Programming", "type": "PART_OF" },

    { "from": "Backend Development", "to": "Node.js", "type": "REQUIRES", "level": 3 },
    { "from": "Backend Development", "to": "PostgreSQL", "type": "REQUIRES", "level": 3 },
    { "from": "Backend Development", "to": "System Design", "type": "REQUIRES", "level": 4 },

    { "from": "Backend Development", "to": "Docker", "type": "USES" },
    { "from": "Docker", "to": "Docker Certified Associate", "type": "VERIFIED_BY" },

    { "from": "Node.js", "to": "Project Use", "type": "CAN_BE_VERIFIED_BY" }
  ]
}
```

---

This graph DB (Neo4J) acts as our knowledge base to:

- Map freelancer profiles to known domains/subfields/skills.
- Compute **completeness** and **readiness score**.
- Validate the user profile via connected edges like `PROJECT_VERIFIES` or `REQUIRES_CERT`.

---

### ✅ REQUIREMENTS

- Extract a **Skillfolio** from a freelancer's account.
- Match their data with the graph DB structure.
- Compute their field, readiness, verification status, and completeness.
- Create a backend endpoint (`GET` for now) to trigger this extraction logic.
