// js/transactions.js
import { supabase } from './supabase.js';

export function initTransactions() {
  const borrowForm = document.getElementById('borrowForm');
  const searchInput = document.getElementById('searchInput');
  const filterAvailability = document.getElementById('filterAvailability');
  const filterStatus = document.getElementById('filterStatus');

  fetchTransactions();

  if (borrowForm) {
    borrowForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const borrower_name = document.getElementById('borrowerName').value.trim();
      const borrower_type = document.getElementById('borrowerType').value;
      const department = document.getElementById('department').value.trim();
      const equipment_id = document.getElementById('borrowEquipmentSelect').value;
      const date_borrowed = document.getElementById('dateBorrowed').value;
      const due_date = document.getElementById('dueDate').value;

      // BR-04 Validation
      if (!borrower_name) {
        alert('Borrower name must be provided.');
        return;
      }

      // BR-05 Validation
      if (due_date < date_borrowed) {
        alert('Due date cannot be earlier than borrowing date.');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      // BR-06 & BR-07: Record Borrowing & Set Status/Availability
      const { error: transError } = await supabase.from('borrow_transactions').insert([{
        equipment_id,
        borrower_name,
        borrower_type,
        department,
        date_borrowed,
        due_date,
        status: 'Borrowed',
        user_id: user.id
      }]);

      if (transError) {
        alert(transError.message);
        return;
      }

      // Update Equipment Availability to 'Borrowed'
      await supabase.from('equipment').update({ availability: 'Borrowed' }).eq('id', equipment_id);

      borrowForm.reset();
      document.getElementById('dateBorrowed').value = new Date().toISOString().split('T')[0];
      
      window.dispatchEvent(new Event('refreshData'));
    });
  }

  // Search and Filter Listeners
  if (searchInput) searchInput.addEventListener('input', fetchTransactions);
  if (filterAvailability) filterAvailability.addEventListener('change', fetchTransactions);
  if (filterStatus) filterStatus.addEventListener('change', fetchTransactions);

  window.addEventListener('refreshData', fetchTransactions);
}

export async function fetchTransactions() {
  const { data: transactions, error } = await supabase
    .from('borrow_transactions')
    .select('*, equipment(equipment_name, asset_code)')
    .order('id', { ascending: false });

  if (error) return;

  const tbody = document.getElementById('transactionsTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  const searchVal = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const filterStatusVal = document.getElementById('filterStatus')?.value || 'ALL';

  const today = new Date().toISOString().split('T')[0];
  let returnedCount = 0;
  let overdueCount = 0;

  transactions.forEach(item => {
    // BR-09: Dynamic Overdue Logic
    let currentStatus = item.status;
    if (currentStatus !== 'Returned' && today > item.due_date) {
      currentStatus = 'Overdue';
    }

    if (currentStatus === 'Returned') returnedCount++;
    if (currentStatus === 'Overdue') overdueCount++;

    // Search and Filter logic
    const eqName = item.equipment ? item.equipment.equipment_name.toLowerCase() : '';
    const assetCode = item.equipment ? item.equipment.asset_code.toLowerCase() : '';
    const borrower = item.borrower_name.toLowerCase();

    const matchesSearch = eqName.includes(searchVal) || assetCode.includes(searchVal) || borrower.includes(searchVal);
    const matchesStatus = filterStatusVal === 'ALL' || currentStatus === filterStatusVal;

    if (matchesSearch && matchesStatus) {
      const tr = document.createElement('tr');
      let statusClass = 'badge-borrowed';
      if (currentStatus === 'Returned') statusClass = 'badge-returned';
      if (currentStatus === 'Overdue') statusClass = 'badge-overdue';

      tr.innerHTML = `
        <td><b>${item.equipment ? item.equipment.asset_code : 'N/A'}</b> - ${item.equipment ? item.equipment.equipment_name : ''}</td>
        <td>${item.borrower_name}</td>
        <td>${item.borrower_type} (${item.department})</td>
        <td>${item.date_borrowed}</td>
        <td>${item.due_date}</td>
        <td>${item.date_returned || '-'}</td>
        <td><span class="badge ${statusClass}">${currentStatus}</span></td>
        <td>
          ${currentStatus !== 'Returned' ? `<button onclick="returnEquipment(${item.id}, ${item.equipment_id})">Return</button>` : '<em>Completed</em>'}
        </td>
      `;
      tbody.appendChild(tr);
    }
  });

  // Update Stats
  document.getElementById('statReturned').textContent = returnedCount;
  document.getElementById('statOverdue').textContent = overdueCount;
}

// BR-08 & BR-12: Return Function Logic
window.returnEquipment = async (transId, equipmentId) => {
  const today = new Date().toISOString().split('T')[0];

  // 1. Update Transaction
  const { error: transErr } = await supabase
    .from('borrow_transactions')
    .update({ status: 'Returned', date_returned: today })
    .eq('id', transId);

  if (transErr) {
    alert(transErr.message);
    return;
  }

  // 2. Set Equipment back to Available
  await supabase
    .from('equipment')
    .update({ availability: 'Available' })
    .eq('id', equipmentId);

  window.dispatchEvent(new Event('refreshData'));
};