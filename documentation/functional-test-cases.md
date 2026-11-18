# Functional Test Cases

Run these tests against the deployed GitHub Pages URL after applying `supabase/schema.sql`. Record the actual result and attach screenshots. Leave the result as NOT TESTED until executed.

| Test ID | Test scenario / steps | Expected result | Actual result |
|---|---|---|---|
| TC-01 | Open login page; sign in with a valid Supabase user | Dashboard opens | NOT TESTED |
| TC-01A | Open `index.html` in a signed-out browser | Redirects to login; protected data is not loaded | NOT TESTED |
| TC-02 | Add equipment with all required fields | Equipment appears in list; dashboard counts update | NOT TESTED |
| TC-02A | Add another item using an existing asset code | Database rejects duplicate asset code and displays an error | NOT TESTED |
| TC-03 | Edit an equipment record | Updated values appear in the list | NOT TESTED |
| TC-04 | Delete equipment and cancel confirmation | Record remains | NOT TESTED |
| TC-04A | Delete equipment and confirm, when it has no transaction history | Record is deleted | NOT TESTED |
| TC-05 | Borrow equipment whose availability is Available | Transaction is saved and equipment becomes Borrowed | NOT TESTED |
| TC-05A | Try borrowing an item already Borrowed (including from a second browser/session) | Database rejects the second borrow | NOT TESTED |
| TC-05B | Enter a due date earlier than borrow date | Form rejects the input | NOT TESTED |
| TC-06 | Return a borrowed item | Transaction becomes Returned with today's date; equipment becomes Available | NOT TESTED |
| TC-06A | Try returning the same transaction again | Database rejects the second return | NOT TESTED |
| TC-07 | Set a borrowed transaction's due date to a past date | Display status is Overdue | NOT TESTED |
| TC-08 | Search using equipment name, asset code, and borrower name | Matching transactions are displayed | NOT TESTED |
| TC-09 | Filter by Borrowed, Returned, Overdue and equipment availability | Only matching transactions are displayed | NOT TESTED |
| TC-10 | Compare dashboard counts with records in Supabase | Counts match the data and overdue/returned logic | NOT TESTED |
| TC-11 | Open the GitHub Pages URL in a browser | Login page loads online and database-backed operations work | NOT TESTED |

## Test evidence

For each test, record:
- Date tested
- Browser/device
- PASS or FAIL
- Screenshot filename
- Notes/error message

Do not mark PASS based only on code review. Test the live site and Supabase connection.
