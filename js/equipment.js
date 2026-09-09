// js/equipment.js
import { supabase } from './supabase.js';

export function initEquipment() {
  const equipmentForm = document.getElementById('equipmentForm');
  
  fetchEquipment();

  if (equipmentForm) {
    equipmentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('eqId').value;
      const equipment_name = document.getElementById('eqName').value.trim();
      const category = document.getElementById('eqCategory').value.trim();
      const asset_code = document.getElementById('eqCode').value.trim();
      const condition = document.getElementById('eqCondition').value;

      // BR-01 Validation
      if (!equipment_name) {
        alert('Equipment name cannot be empty.');
        return;
      }

      if (id) {
        // UPDATE
        const { error } = await supabase
          .from('equipment')
          .update({ equipment_name, category, asset_code, condition })
          .eq('id', id);
        if (error) alert(error.message);
      } else {
        // CREATE
        const { error } = await supabase
          .from('equipment')
          .insert([{ equipment_name, category, asset_code, condition, availability: 'Available' }]);
        if (error) alert(error.message);
      }

      equipmentForm.reset();
      document.getElementById('eqId').value = '';
      document.getElementById('saveEqBtn').textContent = 'Add Equipment';
      
      // Refresh UI
      window.dispatchEvent(new Event('refreshData'));
    });
  }

  window.addEventListener('refreshData', fetchEquipment);
}

export async function fetchEquipment() {
  const { data: equipment, error } = await supabase.from('equipment').select('*').order('id', { ascending: false });
  if (error) return;

  const tbody = document.getElementById('equipmentTableBody');
  const select = document.getElementById('borrowEquipmentSelect');
  
  if (tbody) tbody.innerHTML = '';
  if (select) select.innerHTML = '<option value="">-- Select Available Equipment --</option>';

  let total = equipment.length;
  let availableCount = 0;
  let borrowedCount = 0;

  equipment.forEach(item => {
    if (item.availability === 'Available') availableCount++;
    if (item.availability === 'Borrowed') borrowedCount++;

    // Render Table
    if (tbody) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><b>${item.asset_code}</b></td>
        <td>${item.equipment_name}</td>
        <td>${item.category}</td>
        <td>${item.condition}</td>
        <td><span class="badge ${item.availability === 'Available' ? 'badge-available' : 'badge-borrowed'}">${item.availability}</span></td>
        <td>
          <button onclick="editEquipment(${item.id}, '${item.equipment_name}', '${item.category}', '${item.asset_code}', '${item.condition}')">Edit</button>
          <button style="background:#ef4444;" onclick="deleteEquipment(${item.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    }

    // Populate Select Options (BR-03: Only available equipment)
    if (select && item.availability === 'Available') {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = `${item.asset_code} - ${item.equipment_name}`;
      select.appendChild(opt);
    }
  });

  // Update Stats
  document.getElementById('statTotal').textContent = total;
  document.getElementById('statAvailable').textContent = availableCount;
  document.getElementById('statBorrowed').textContent = borrowedCount;
}

// Global functions for inline actions
window.editEquipment = (id, name, category, code, condition) => {
  document.getElementById('eqId').value = id;
  document.getElementById('eqName').value = name;
  document.getElementById('eqCategory').value = category;
  document.getElementById('eqCode').value = code;
  document.getElementById('eqCondition').value = condition;
  document.getElementById('saveEqBtn').textContent = 'Update Equipment';
};

window.deleteEquipment = async (id) => {
  // BR-10: Deletion requires confirmation
  if (confirm('Are you sure you want to delete this equipment?')) {
    const { error } = await supabase.from('equipment').delete().eq('id', id);
    if (error) {
      alert(error.message);
    } else {
      window.dispatchEvent(new Event('refreshData'));
    }
  }
};