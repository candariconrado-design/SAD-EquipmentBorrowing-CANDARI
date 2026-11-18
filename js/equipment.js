// js/equipment.js
import { supabase } from './supabase.js';

export function initEquipment() {
  const equipmentForm = document.getElementById('equipmentForm');
  const searchInput = document.getElementById('searchInput');

  fetchEquipment();
  if (searchInput) searchInput.addEventListener('input', fetchEquipment);

  if (equipmentForm) {
    equipmentForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const id = document.getElementById('eqId')?.value || '';
      const equipment_name = document.getElementById('eqName')?.value.trim() || '';
      const category = document.getElementById('eqCategory')?.value.trim() || '';
      const asset_code = document.getElementById('eqCode')?.value.trim() || '';
      const condition = document.getElementById('eqCondition')?.value || '';

      if (!equipment_name || !category || !asset_code) {
        alert('Please complete all equipment fields.');
        return;
      }

      const submitButton = document.getElementById('saveEqBtn');
      if (submitButton) submitButton.disabled = true;

      try {
        let result;
        if (id) {
          result = await supabase
            .from('equipment')
            .update({ equipment_name, category, asset_code, condition })
            .eq('id', id);
        } else {
          result = await supabase
            .from('equipment')
            .insert([{ equipment_name, category, asset_code, condition, availability: 'Available' }]);
        }

        if (result.error) throw result.error;

        equipmentForm.reset();
        const idInput = document.getElementById('eqId');
        if (idInput) idInput.value = '';
        if (submitButton) submitButton.textContent = 'Add Equipment';

        window.dispatchEvent(new Event('refreshData'));
      } catch (error) {
        console.error('Saving equipment failed:', error);
        alert('Unable to save equipment: ' + (error.message || 'Unknown error'));
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  window.addEventListener('refreshData', fetchEquipment);
}

export async function fetchEquipment() {
  const { data: equipment, error } = await supabase
    .from('equipment')
    .select('*')
    .order('id', { ascending: false });

  const tbody = document.getElementById('equipmentTableBody');
  const select = document.getElementById('borrowEquipmentSelect');

  if (error) {
    console.error('Unable to load equipment:', error);
    if (tbody) tbody.textContent = 'Unable to load equipment. Please refresh the page.';
    return;
  }

  if (tbody) tbody.replaceChildren();
  if (select) {
    select.replaceChildren();
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '-- Select Available Equipment --';
    select.appendChild(placeholder);
  }

  let total = (equipment || []).length;
  let availableCount = 0;
  let borrowedCount = 0;

  const searchValue = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';

  for (const item of (equipment || [])) {
    if (item.availability === 'Available') availableCount++;
    if (item.availability === 'Borrowed') borrowedCount++;

    const matchesEquipmentSearch =
      (item.equipment_name || '').toLowerCase().includes(searchValue) ||
      (item.asset_code || '').toLowerCase().includes(searchValue);

    if (tbody && matchesEquipmentSearch) {
      const tr = document.createElement('tr');
      [item.asset_code, item.equipment_name, item.category, item.condition].forEach(value => {
        const td = document.createElement('td');
        td.textContent = value || '';
        tr.appendChild(td);
      });

      const availabilityCell = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = 'badge ' + (item.availability === 'Available' ? 'badge-available' : 'badge-borrowed');
      badge.textContent = item.availability || 'Unknown';
      availabilityCell.appendChild(badge);
      tr.appendChild(availabilityCell);

      const actions = document.createElement('td');
      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.textContent = 'Edit';
      editButton.addEventListener('click', () => window.editEquipment(
        item.id, item.equipment_name, item.category, item.asset_code, item.condition
      ));

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.textContent = 'Delete';
      deleteButton.style.background = '#ef4444';
      deleteButton.addEventListener('click', () => window.deleteEquipment(item.id));

      actions.append(editButton, deleteButton);
      tr.appendChild(actions);
      tbody.appendChild(tr);
    }

    if (select && item.availability === 'Available') {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = (item.asset_code || '') + ' - ' + (item.equipment_name || '');
      select.appendChild(option);
    }
  }

  const setStat = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value);
  };
  setStat('statTotal', total);
  setStat('statAvailable', availableCount);
  setStat('statBorrowed', borrowedCount);
}

window.editEquipment = (id, name, category, code, condition) => {
  document.getElementById('eqId').value = id;
  document.getElementById('eqName').value = name || '';
  document.getElementById('eqCategory').value = category || '';
  document.getElementById('eqCode').value = code || '';
  document.getElementById('eqCondition').value = condition || 'Good';
  document.getElementById('saveEqBtn').textContent = 'Update Equipment';
  document.getElementById('eqName').focus();
};

window.deleteEquipment = async (id) => {
  if (!confirm('Are you sure you want to delete this equipment?')) return;

  try {
    const { error } = await supabase.from('equipment').delete().eq('id', id);
    if (error) throw error;
    window.dispatchEvent(new Event('refreshData'));
  } catch (error) {
    console.error('Deleting equipment failed:', error);
    alert('Unable to delete equipment: ' + (error.message || 'Unknown error'));
  }
};
