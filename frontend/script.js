document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const username = localStorage.getItem('pillpallUser');
  const loginBtn = document.getElementById('loginBtn');

  // Highlight current page
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  // Hamburger menu
  if (toggle) toggle.addEventListener('click', () => navLinks.classList.toggle('show'));

  // Login button
  if (loginBtn) {
    if (username) {
      loginBtn.textContent = username;
      loginBtn.onclick = () => {
        if (confirm('Log out?')) {
          localStorage.removeItem('pillpallUser');
          window.location.reload();
        }
      };
    } else {
      loginBtn.onclick = () => window.location.href = 'login.html';
    }
  }

  // Login Page
  const loginSubmit = document.getElementById('loginSubmit');
  const registerBtn = document.getElementById('registerBtn');
  if (loginSubmit) {
    loginSubmit.addEventListener('click', () => {
      const user = document.getElementById('username').value.trim();
      const pass = document.getElementById('password').value.trim();
      if (user && pass) {
        localStorage.setItem('pillpallUser', user);
        alert('Login successful!');
        window.location.href = 'index.html';
      } else {
        alert('Please enter both fields.');
      }
    });
  }
  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      alert('Registration successful! You can now log in.');
    });
  }

  // Medicine Page
  const addBtn = document.getElementById('addMedicine');
  if (addBtn) {
    const input = document.getElementById('medicineName');
    const list = document.getElementById('medicineList');
    let medicines = JSON.parse(localStorage.getItem('pillpallMedicines') || '[]');

    const renderList = () => {
      list.innerHTML = '';
      medicines.forEach((m, i) => {
        const li = document.createElement('li');
        li.innerHTML = `${m} <button data-index="${i}">X</button>`;
        list.appendChild(li);
      });
    };
    renderList();

    addBtn.addEventListener('click', () => {
      const name = input.value.trim();
      if (name) {
        medicines.push(name);
        localStorage.setItem('pillpallMedicines', JSON.stringify(medicines));
        input.value = '';
        renderList();
      }
    });

    list.addEventListener('click', e => {
      if (e.target.tagName === 'BUTTON') {
        medicines.splice(e.target.dataset.index, 1);
        localStorage.setItem('pillpallMedicines', JSON.stringify(medicines));
        renderList();
      }
    });
  }

  // Timetable Page
  const weekView = document.getElementById('weekView');
  const monthView = document.getElementById('monthView');
  const viewToggle = document.getElementById('viewToggle');

  if (weekView && viewToggle) {
    let medicines = JSON.parse(localStorage.getItem('pillpallMedicines') || '[]');
    const timetableData = JSON.parse(localStorage.getItem('pillpallTimetable') || '{}');

    const saveData = () => localStorage.setItem('pillpallTimetable', JSON.stringify(timetableData));

    const renderCell = (cell, key) => {
      cell.innerHTML = ''; // clear previous
      const select = document.createElement('select');
      select.innerHTML = `<option value="">Select...</option>
        ${medicines.map(m => `<option>${m}</option>`).join('')}
        <option value="+">+ Add New</option>`;
      cell.appendChild(select);

      const tagContainer = document.createElement('div');
      tagContainer.classList.add('medicine-tags');
      cell.appendChild(tagContainer);

      const meds = timetableData[key] || [];
      meds.forEach(m => {
        const tag = document.createElement('div');
        tag.classList.add('medicine-tag');
        tag.innerHTML = `${m} <button>&times;</button>`;
        tagContainer.appendChild(tag);
      });

      select.addEventListener('change', () => {
        if (select.value === '+') {
          const newMed = prompt('Enter new medicine name:');
          if (newMed) {
            medicines.push(newMed);
            localStorage.setItem('pillpallMedicines', JSON.stringify(medicines));
            renderCell(cell, key);
          }
        } else if (select.value) {
          timetableData[key] = timetableData[key] || [];
          if (!timetableData[key].includes(select.value)) {
            timetableData[key].push(select.value);
            saveData();
            renderCell(cell, key);
          }
        }
      });

      tagContainer.addEventListener('click', e => {
        if (e.target.tagName === 'BUTTON') {
          const medName = e.target.parentElement.textContent.trim().slice(0, -1);
          timetableData[key] = timetableData[key].filter(m => m !== medName);
          saveData();
          renderCell(cell, key);
        }
      });
    };

    // Initialize all cells
    document.querySelectorAll('.cell').forEach(cell => {
      const day = cell.dataset.day;
      const time = cell.dataset.time;
      const key = `${day}_${time}`;
      renderCell(cell, key);
    });

    // View toggle + calendar
    const monthLabel = document.getElementById('monthLabel');
    const calendarDays = document.querySelector('.calendar-days');
    const renderCalendar = () => {
      calendarDays.innerHTML = '';
      const date = new Date();
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      monthLabel.textContent = `${month} ${year}`;
      const days = new Date(year, date.getMonth() + 1, 0).getDate();

      for (let i = 1; i <= days; i++) {
        const div = document.createElement('div');
        div.innerHTML = `<strong>${i}</strong><br>`;

        // Show all assigned medicines in the month
        const medsSet = new Set();
        Object.keys(timetableData).forEach(k => {
          timetableData[k].forEach(m => medsSet.add(m));
        });

        medsSet.forEach(m => {
          const medEl = document.createElement('div');
          medEl.classList.add('medicine-tag');
          medEl.textContent = m;
          div.appendChild(medEl);
        });

        calendarDays.appendChild(div);
      }
    };

    viewToggle.addEventListener('click', () => {
      weekView.classList.toggle('hidden');
      monthView.classList.toggle('hidden');
      const monthMode = !monthView.classList.contains('hidden');
      viewToggle.textContent = monthMode ? 'Switch to Week View' : 'Switch to Month View';
      if (monthMode) renderCalendar();
    });
  }
});

// Login handler for navbar
function handleLoginClick() {
  const username = localStorage.getItem('pillpallUser');
  if (username) {
    if (confirm('Log out?')) {
      localStorage.removeItem('pillpallUser');
      window.location.reload();
    }
  } else {
    window.location.href = 'login.html';
  }
}
