// js/transactions.js
import { supabase } from './supabase.js';

function localDateString() {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = String(value);
}

export function initTransactions() {
  const borrowForm = document.getElementById('borrowForm');

  fetchTransactions();

  if (borrowForm) {
    borrowForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const borrower_name = document.getElementById('borrowerName')?.value.trim() || '';
      const borrower_type = document.getElementById('borrowerType')?.value || '';
      const department = document.getElementById('department')?.value.trim() || '';
      const equipment_id = document.getElementById('borrowEquipmentSelect')?.value || '';
      const date_borrowed = document.getElementById('dateBorrowed')?.value || '';
      const due_date = document.getElementById('dueDate')?.value || '';

      if (!borrower_name || !borrower_type || !department || !equipment_id || !date_borrowed || !due_date) {
        alert('Please complete all borrowing fields.');
        return;
      }
      if (due_date < date_borrowed) {
        alert('Due date cannot be earlier than borrowing date.');
        return;
      }

      const submitButton = borrowForm.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;

      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          alert('Your session has expired. Please log in again.');
          window.location.replace('login.html');
          return;
        }

        // This database function locks the equipment row and records the
        // transaction + availability change atomically.
        const { error } = await supabase.rpc('borrow_equipment', {
          p_equipment_id: Number(equipment_id),
          p_borrower_name: borrower_name,
          p_borrower_type: borrower_type,
          p_department: department,
          p_date_borrowed: date_borrowed,
          p_due_date: due_date
        });
        if (error) throw error;

        borrowForm.reset();
        const borrowDateInput = document.getElementById('dateBorrowed');
        if (borrowDateInput) borrowDateInput.value = localDateString();
        window.dispatchEvent(new Event('refreshData'));
        alert('Borrowing transaction saved successfully.');
      } catch (error) {
        console.error('Borrowing transaction failed:', error);
        alert('Unable to save borrowing transaction: ' + (error.message || 'Unknown error'));
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  const searchInput = document.getElementById('searchInput');
  const filterAvailability = document.getElementById('filterAvailability');
  const filterStatus = document.getElementById('filterStatus');

  if (searchInput) searchInput.addEventListener('input', fetchTransactions);
  if (filterAvailability) filterAvailability.addEventListener('change', fetchTransactions);
  if (filterStatus) filterStatus.addEventListener('change', fetchTransactions);

  window.addEventListener('refreshData', fetchTransactions);
}

export async function fetchTransactions() {
  const tbody = document.getElementById('transactionsTableBody');
  if (!tbody) return;

  const { data: transactions, error } = await supabase
    .from('borrow_transactions')
    .select('*, equipment(equipment_name, asset_code, availability)')
    .order('id', { ascending: false });

  if (error) {
    console.error('Unable to load borrowing transactions:', error);
    tbody.textContent = 'Unable to load transactions. Please refresh the page.';
    return;
  }

  tbody.replaceChildren();
  const searchVal = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';
  const filterStatusVal = document.getElementById('filterStatus')?.value || 'ALL';
  const filterAvailabilityVal = document.getElementById('filterAvailability')?.value || 'ALL';
  const today = localDateString();

  let returnedCount = 0;
  let overdueCount = 0;

  for (const item of (transactions || [])) {
    const currentStatus = item.status !== 'Returned' && item.due_date && today > item.due_date
      ? 'Overdue'
      : item.status;

    if (currentStatus === 'Returned') returnedCount++;
    if (currentStatus === 'Overdue') overdueCount++;

    const equipment = item.equipment;
    const equipmentName = equipment?.equipment_name || '';
    const assetCode = equipment?.asset_code || '';
    const borrowerName = item.borrower_name || '';

    const matchesSearch = [equipmentName, assetCode, borrowerName]
      .some(value => value.toLowerCase().includes(searchVal));
    const matchesStatus = filterStatusVal === 'ALL' || currentStatus === filterStatusVal;
    const matchesAvailability = filterAvailabilityVal === 'ALL' ||
      equipment?.availability === filterAvailabilityVal;

    if (!matchesSearch || !matchesStatus || !matchesAvailability) continue;

    const tr = document.createElement('tr');
    const cellValues = [
      assetCode ? assetCode + ' - ' + equipmentName : (equipmentName || 'N/A'),
      borrowerName,
      (item.borrower_type || '') + (item.department ? ' (' + item.department + ')' : ''),
      item.date_borrowed || '',
      item.due_date || '',
      item.date_returned || '-'
    ];

    cellValues.forEach(value => {
      const td = document.createElement('td');
      td.textContent = value;
      tr.appendChild(td);
    });

    const statusCell = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.className = 'badge ' + (
      currentStatus === 'Returned' ? 'badge-returned' :
      currentStatus === 'Overdue' ? 'badge-overdue' : 'badge-borrowed'
    );
    statusBadge.textContent = currentStatus || 'Unknown';
    statusCell.appendChild(statusBadge);
    tr.appendChild(statusCell);

    const actionCell = document.createElement('td');
    if (currentStatus !== 'Returned') {
      const returnButton = document.createElement('button');
      returnButton.type = 'button';
      returnButton.textContent = 'Return';
      returnButton.addEventListener('click', () => window.returnEquipment(item.id));
      actionCell.appendChild(returnButton);
    } else {
      const completed = document.createElement('em');
      completed.textContent = 'Completed';
      actionCell.appendChild(completed);
    }
    tr.appendChild(actionCell);
    tbody.appendChild(tr);
  }

  setText('statReturned', returnedCount);
  setText('statOverdue', overdueCount);
}

window.returnEquipment = async (transactionId) => {
  if (!confirm('Confirm that this equipment has been returned?')) return;

  try {
    // The database function locks both related records and prevents a
    // second return from changing the same transaction again.
    const { error } = await supabase.rpc('return_equipment', {
      p_transaction_id: Number(transactionId)
    });
    if (error) throw error;

    window.dispatchEvent(new Event('refreshData'));
    alert('Equipment returned successfully.');
  } catch (error) {
    console.error('Returning equipment failed:', error);
    alert('Unable to return equipment: ' + (error.message || 'Unknown error'));
  }
};
