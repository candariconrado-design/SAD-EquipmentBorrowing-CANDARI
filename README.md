# Online Equipment Borrowing and Return Monitoring System

A browser-based system for managing college equipment inventory and borrowing/return transactions. Built with HTML, CSS, JavaScript modules, Supabase Authentication, and Supabase PostgreSQL. Hosted with GitHub Pages.

## Project structure

```text
.
├── index.html
├── login.html
├── css/
│   └── style.css
├── js/
│   ├── supabase.js
│   ├── auth.js
│   ├── equipment.js
│   └── transactions.js
└── documentation/
    ├── requirements-traceability.md
    ├── functional-test-cases.md
    ├── use-case.svg
    └── erd.svg
```

## Supabase setup

1. Open the Supabase project used by this application.
2. Before changing the database, make a backup/export of existing data.
3. Open **SQL Editor** and run the corrected database setup SQL supplied separately for this project. Do not run an old or unverified copy.
4. If the unique asset-code index reports duplicate values, review and correct duplicate `asset_code` values first. Do not delete records just to make the script pass.
5. In **Authentication > Users**, create an account for the system user. Registration is intentionally not exposed in the public interface.
6. In `js/supabase.js`, confirm the project URL and anon/publishable key belong to the same Supabase project.

The browser anon/publishable key is designed to be public. Never place a Supabase service-role/secret key in this repository or frontend. RLS must remain enabled.

The database setup SQL creates two RPC functions:
- `borrow_equipment`: locks an equipment row and inserts the borrowing record + marks the equipment Borrowed in one database transaction.
- `return_equipment`: marks the transaction Returned and equipment Available in one database transaction, rejecting repeat returns.

The RLS policies in this lab setup allow authenticated users to manage both tables. This matches the exercise's single authenticated System User model. Do not use these broad policies for a multi-role production application without redesigning authorization.

## Run locally

Because the project uses JavaScript modules, serve it through a local web server (not by opening `index.html` as a file). For example, use VS Code Live Server or run:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500/login.html`.

## Deploy with GitHub Pages

1. Push the project to GitHub.
2. Open repository **Settings > Pages**.
3. Select **Deploy from a branch**, choose `main` and `/(root)`, then save.
4. Wait for deployment and open the Pages URL.
5. Test login and all CRUD/transaction operations from the deployed URL.

Live URL listed for this repository: https://candariconrado-design.github.io/SAD-EquipmentBorrowing-CANDARI/

## Main features

- Supabase email/password login and logout
- Authenticated dashboard
- Equipment create, read, update, and delete with confirmation
- Borrow only equipment marked Available
- Atomic borrow and return database operations
- Automatic overdue display logic (current date after due date, unless Returned)
- Search by equipment name, asset code, or borrower name
- Filter transactions by equipment availability and transaction status
- Dashboard totals for equipment, availability, returned transactions, and overdue transactions

## Important verification note

A successful GitHub commit does not prove the deployed app or Supabase project works. Complete the manual test cases in `documentation/functional-test-cases.md`, record PASS/FAIL, and capture screenshots from your own deployed application. Do not report a test as PASS until you have run it.

## Documentation

- [Requirements Traceability Matrix](documentation/requirements-traceability.md)
- [Functional Test Cases](documentation/functional-test-cases.md)
- [Use Case Diagram](documentation/use-case.svg)
- [Entity Relationship Diagram](documentation/erd.svg)

demo account

email: admin@gmail.com
password:admin12345
