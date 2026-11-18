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
  const searchInput = document.getElementById('searchInput');
  const filterAvailability = document.getElementById('filterAvailability');
  const filterStatus = document.getElementById('filterStatus');

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

      if (!borrower_name || !department || !equipment_id || !date_borrowed || !due_date) {
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
        const user = userData?.user;

        if (userError || !user) {
          alert('Your session has expired. Please log in again.');
          window.location.replace('login.html');
          return;
        }

        // Re-check availability before creating a borrowing record.
        const { data: equipment, error: equipmentError } = await supabase
          .from('equipment')
          .select('id, availability')
          .eq('id', equipment_id)
          .maybeSingle();

        if (equipmentError) throw equipmentError;
        if (!equipment || equipment.availability !== 'Available') {
          alert('This equipment is no longer available. Please refresh and choose another item.');
          await fetchEquipmentOptionsRefresh();
          return;
        }

        const { data: inserted, error: transError } = await supabase
          .from('borrow_transactions')
          .insert([{
            equipment_id,
            borrower_name,
            borrower_type,
            department,
            date_borrowed,
            due_date,
            status: 'Borrowed',
            user_id: user.id
          }])
          .select('id')
          .single();

        if (transError) throw transError;

        // If this update fails, remove the just-created transaction to avoid
        // leaving a successful-looking borrowing record with available equipment.
        const { error: updateError } = await supabase
          .from('equipment')
          .update({ availability: 'Borrowed' })
          .eq('id', equipment_id)
          .eq('availability', 'Available');

        if (updateError) {
          await supabase.from('borrow_transactions').delete().eq('id', inserted.id);
          throw updateError;
        }

        borrowForm.reset();
        const borrowDateInput = document.getElementById('dateBorrowed');
        if (borrowDateInput) borrowDateInput.value = localDateString();
        window.dispatchEvent(new Event('refreshData'));
      } catch (error) {
        console.error('Borrowing transaction failed:', error);
        alert('Unable to save borrowing transaction: ' + (error.message || 'Unknown error'));
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  if (searchInput) searchInput.addEventListener('input', fetchTransactions);
  if (filterAvailability) filterAvailability.addEventListener('change', fetchTransactions);
  if (filterStatus) filterStatus.addEventListener('change', fetchTransactions);

  window.addEventListener('refreshData', fetchTransactions);
}

async function fetchEquipmentOptionsRefresh() {
  const { fetchEquipment } = await import('./equipment.js');
  await fetchEquipment();
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
    let currentStatus = item.status;
    if (currentStatus !== 'Returned' && item.due_date && today > item.due_date) {
      currentStatus = 'Overdue';
    }

    if (currentStatus === 'Returned') returnedCount++;
    if (currentStatus === 'Overdue') overdueCount++;

    const equipment = item.equipment;
    const eqName = equipment?.equipment_name || '';
    const assetCode = equipment?.asset_code || '';
    const borrower = item.borrower_name || '';

    const matchesSearch = [eqName, assetCode, borrower]
      .some(value => value.toLowerCase().includes(searchVal));
    const matchesStatus = filterStatusVal === 'ALL' || currentStatus === filterStatusVal;
    const matchesAvailability = filterAvailabilityVal === 'ALL' ||
      equipment?.availability === filterAvailabilityVal;

    if (!matchesSearch || !matchesStatus || !matchesAvailability) continue;

    const tr = document.createElement('tr');
    const values = [
      assetCode ? assetCode + ' - ' + eqName : (eqName || 'N/A'),
      borrower,
      (item.borrower_type || '') + (item.department ? ' (' + item.department + ')' : ''),
      item.date_borrowed || '',
      item.due_date || '',
      item.date_returned || '-'
    ];

    values.forEach(value => {
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
    statusBadge.textContent = currentStatus;
    statusCell.appendChild(statusBadge);
    tr.appendChild(statusCell);

    const actionCell = document.createElement('td');
    if (currentStatus !== 'Returned') {
      const returnButton = document.createElement('button');
      returnButton.type = 'button';
      returnButton.textContent = 'Return';
      returnButton.addEventListener('click', () => window.returnEquipment(item.id, item.equipment_id));
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

// BR-08 & BR-12: Return Function Logic
window.returnEquipment = async (transId, equipmentId) => {
  if (!confirm('Confirm that this equipment has been returned?')) return;

  try {
    const { data: transaction, error: lookupError } = await supabase
      .from('borrow_transactions')
      .select('id, status, equipment_id')
      .eq('id', transId)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!transaction || transaction.status === 'Returned') {
      alert('This transaction is already returned or no longer exists.');
      await fetchTransactions();
      return;
    }

    const today = localDateString();
    const { error: transErr } = await supabase
      .from('borrow_transactions')
      .update({ status: 'Returned', date_returned: today })
      .eq('id', transId)
      .neq('status', 'Returned');

    if (transErr) throw transErr;

    const { error: equipmentError } = await supabase
      .from('equipment')
      .update({ availability: 'Available' })
      .eq('id', equipmentId);

    if (equipmentError) {
      alert('The transaction was marked returned, but equipment availability could not be updated. Please contact the system administrator. ' + equipmentError.message);
      await fetchTransactions();
      return;
    }

    window.dispatchEvent(new Event('refreshData'));
  } catch (error) {
    console.error('Returning equipment failed:', error);
    alert('Unable to return equipment: ' + (error.message || 'Unknown error'));
  }
};
