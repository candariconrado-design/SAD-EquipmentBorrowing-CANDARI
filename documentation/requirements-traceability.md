# Requirements Traceability Matrix

| Requirement ID | Requirement / Business Rule | Implemented feature | Verification |
|---|---|---|---|
| FR-01 / BR-11 | Authenticated user login/logout and session guard | Supabase Auth in `auth.js`; protected dashboard initialization | TC-01 |
| FR-02 / BR-01 | Add equipment; name cannot be empty | Equipment form validation and INSERT | TC-02 |
| BR-02 | Asset code is unique | Unique database index on `equipment.asset_code` | TC-02A |
| FR-03 | Edit equipment details | Equipment UPDATE | TC-03 |
| FR-04 / BR-10 | Delete equipment after confirmation | Confirmation prompt and DELETE | TC-04 |
| FR-05 / BR-03–BR-07 | Borrow only available equipment; record transaction and set Borrowed | `borrow_equipment` database function | TC-05 |
| FR-06 / BR-08 / BR-12 | Return once; record date and set equipment Available | `return_equipment` database function | TC-06 |
| FR-07 / BR-09 | Detect overdue when today is after due date and status is not Returned | Date comparison in transaction display | TC-07 |
| FR-08 | Search by equipment name, asset code, borrower | Transaction search | TC-08 |
| FR-09 | Filter by equipment availability and transaction status | Availability/status filter controls | TC-09 |
| FR-10 | Dashboard totals | Equipment and transaction summary counts | TC-10 |
| FR-11 | Online deployment | GitHub Pages | TC-11 |

**Note:** The matrix maps the exercise requirements to code paths. A row is not proven complete until its functional test is executed and recorded as PASS.
