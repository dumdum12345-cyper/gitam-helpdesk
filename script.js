/* ============================================================
   script.js — GITAM Student Helpdesk
   Handles: Login · Chat UI · Admin Dashboard
   All pages share this one file.
   ============================================================ */

/* ── Detect which page we are on ──────────────────────────── */
const PAGE = document.body.classList.contains('login-body')  ? 'login'
           : document.body.classList.contains('chat-body')   ? 'chat'
           : document.body.classList.contains('admin-body')  ? 'admin'
           : 'unknown';

/* ════════════════════════════════════════════════════════════
   LOGIN PAGE
   ════════════════════════════════════════════════════════════ */
if (PAGE === 'login') {

  const form      = document.getElementById('loginForm');
  const emailIn   = document.getElementById('email');
  const rollIn    = document.getElementById('rollno');
  const passIn    = document.getElementById('password');
  const emailErr  = document.getElementById('emailErr');
  const rollErr   = document.getElementById('rollErr');
  const passErr   = document.getElementById('passErr');
  const toggleBtn = document.getElementById('togglePass');
  const eyeShow   = document.getElementById('eyeShow');
  const eyeHide   = document.getElementById('eyeHide');
  const signinBtn = document.getElementById('signinBtn');
  const btnLabel  = document.getElementById('btnLabel');

  /* ── Toggle password visibility ── */
  toggleBtn.addEventListener('click', () => {
    const isPass = passIn.type === 'password';
    passIn.type  = isPass ? 'text' : 'password';
    eyeShow.style.display = isPass ? 'none'  : 'block';
    eyeHide.style.display = isPass ? 'block' : 'none';
  });

  /* ── Clear errors on input ── */
  emailIn.addEventListener('input', () => { emailErr.textContent = ''; emailIn.classList.remove('err'); });
  rollIn.addEventListener('input',  () => { rollErr.textContent  = ''; rollIn.classList.remove('err');  });
  passIn.addEventListener('input',  () => { passErr.textContent  = ''; passIn.classList.remove('err');  });

  /* ── Validate form ── */
  function validateLogin() {
    let ok = true;

    // Email: must end with @gitam.in
    if (!emailIn.value.trim()) {
      emailErr.textContent = 'Email address is required.';
      emailIn.classList.add('err'); ok = false;
    } else if (!emailIn.value.trim().toLowerCase().endsWith('@gitam.in')) {
      emailErr.textContent = 'Please use your official @gitam.in email.';
      emailIn.classList.add('err'); ok = false;
    }

    // Roll number: must not be empty, basic format check
    if (!rollIn.value.trim()) {
      rollErr.textContent = 'Roll number is required.';
      rollIn.classList.add('err'); ok = false;
    } else if (!/^[a-zA-Z0-9]{4,12}$/.test(rollIn.value.trim())) {
      rollErr.textContent = 'Enter a valid roll number (4–12 alphanumeric characters).';
      rollIn.classList.add('err'); ok = false;
    }

    // Password: min 6 chars
    if (!passIn.value) {
      passErr.textContent = 'Password is required.';
      passIn.classList.add('err'); ok = false;
    } else if (passIn.value.length < 6) {
      passErr.textContent = 'Password must be at least 6 characters.';
      passIn.classList.add('err'); ok = false;
    }

    return ok;
  }

  /* ── Submit handler ── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    // Show loading state
    btnLabel.textContent = 'Signing in…';
    signinBtn.disabled   = true;

    // Simulate auth delay (replace with real API call in backend integration)
    setTimeout(() => {
      // Save student info to sessionStorage for use in chat page
      const roll  = rollIn.value.trim().toUpperCase();
      const email = emailIn.value.trim().toLowerCase();
      const name  = roll; // In real system, fetch name from DB

      sessionStorage.setItem('gitam_roll',  roll);
      sessionStorage.setItem('gitam_email', email);
      sessionStorage.setItem('gitam_name',  name);

      // Remember me
      if (document.getElementById('rememberMe').checked) {
        localStorage.setItem('gitam_roll',  roll);
        localStorage.setItem('gitam_email', email);
      }

      // Navigate to chat
      window.location.href = 'index.html';
    }, 1200);
  });

  /* ── Auto-fill from localStorage if "remember me" was checked ── */
  const savedRoll  = localStorage.getItem('gitam_roll');
  const savedEmail = localStorage.getItem('gitam_email');
  if (savedRoll && savedEmail) {
    rollIn.value  = savedRoll;
    emailIn.value = savedEmail;
    document.getElementById('rememberMe').checked = true;
  }
}

/* ════════════════════════════════════════════════════════════
   CHAT PAGE
   ════════════════════════════════════════════════════════════ */
if (PAGE === 'chat') {

  /* ── Load user session ── */
  const roll  = sessionStorage.getItem('gitam_roll')  || localStorage.getItem('gitam_roll')  || 'Student';
  const name  = sessionStorage.getItem('gitam_name')  || roll;

  // Redirect to login if not authenticated
  if (!sessionStorage.getItem('gitam_roll') && !localStorage.getItem('gitam_roll')) {
    window.location.href = 'login.html';
  }

  /* ── Populate user info in sidebar ── */
  document.getElementById('uName').textContent  = name;
  document.getElementById('uRoll').textContent  = roll;
  document.getElementById('userAva').textContent = name.charAt(0).toUpperCase();
  document.getElementById('wName').textContent   = name;

  /* ── DOM references ── */
  const chatWindow  = document.getElementById('chatWindow');
  const msgInput    = document.getElementById('msgInput');
  const sendBtn     = document.getElementById('sendBtn');
  const typingBar   = document.getElementById('typingBar');
  const ticketModal = document.getElementById('ticketModal');
  const ticketBadge = document.getElementById('ticketBadge');
  const modalText   = document.getElementById('modalText');
  const modalOk     = document.getElementById('modalOk');
  const sidebar     = document.getElementById('sidebar');
  const menuToggle  = document.getElementById('menuToggle');
  const sidebarOv   = document.getElementById('sidebarOverlay');
  const logoutBtn   = document.getElementById('logoutBtn');

  /* ── Sidebar toggle (mobile) ── */
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebarOv.classList.toggle('visible');
  });
  sidebarOv.addEventListener('click', () => {
    sidebar.classList.remove('open');
    sidebarOv.classList.remove('visible');
  });

  /* ── Logout ── */
  logoutBtn.addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = 'login.html';
  });

  /* ── Auto-resize textarea ── */
  msgInput.addEventListener('input', () => {
    msgInput.style.height = 'auto';
    msgInput.style.height = Math.min(msgInput.scrollHeight, 140) + 'px';
    sendBtn.disabled = !msgInput.value.trim();
  });

  /* ── Send on Enter (Shift+Enter = new line) ── */
  msgInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  /* ── Quick topic buttons & chips ── */
  document.querySelectorAll('.quick-btn, .chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.dataset.msg;
      if (msg) {
        msgInput.value = msg;
        msgInput.style.height = 'auto';
        sendBtn.disabled = false;
        // Close sidebar on mobile
        sidebar.classList.remove('open');
        sidebarOv.classList.remove('visible');
        sendMessage();
      }
    });
  });

  /* ── Close modal ── */
  modalOk.addEventListener('click', () => ticketModal.classList.remove('visible'));

  /* ── Helper: get current time string ── */
  function getTime() {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  /* ── Append a message bubble to chat window ── */
  function appendMessage(role, html, time, ticketId, confidence, intent) {
    // Remove welcome card on first message
    const wc = document.getElementById('welcomeCard');
    if (wc) wc.remove();

    const row = document.createElement('div');
    row.className = `message-row ${role}`;

    // Avatar initial
    const ava     = document.createElement('div');
    ava.className = `msg-avatar ${role === 'bot' ? 'bot-avatar' : 'user-avatar'}`;
    ava.textContent = role === 'bot' ? 'G' : name.charAt(0).toUpperCase();

    // Bubble
    const bub     = document.createElement('div');
    bub.className = 'msg-bubble';

    // Confidence badge (bot messages only)
    let confBadge = '';
    if (role === 'bot' && confidence !== undefined) {
      const pct   = Math.round(confidence * 100);
      const cls   = pct >= 80 ? 'conf-high' : pct >= 60 ? 'conf-medium' : 'conf-low';
      confBadge   = `<span class="conf-badge ${cls}">${pct}% confident</span>`;
    }

    bub.innerHTML = html + confBadge;

    // Ticket inline tag
    if (ticketId) {
      const tag = document.createElement('div');
      tag.className   = 'ticket-inline';
      tag.innerHTML   = `🎫 Ticket: <strong>${ticketId}</strong>`;
      bub.appendChild(tag);
    }

    // Timestamp
    const ts     = document.createElement('div');
    ts.className = 'msg-time';
    ts.textContent = time;

    const wrap   = document.createElement('div');
    wrap.style.display        = 'flex';
    wrap.style.flexDirection  = 'column';
    wrap.appendChild(bub);
    wrap.appendChild(ts);

    row.appendChild(ava);
    row.appendChild(wrap);
    chatWindow.appendChild(row);

    // Scroll to bottom
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  /* ── Main send function ── */
  async function sendMessage() {
    const text = msgInput.value.trim();
    if (!text) return;

    // Show user message
    appendMessage('user', text, getTime());

    // Clear input
    msgInput.value       = '';
    msgInput.style.height = 'auto';
    sendBtn.disabled     = true;

    // Show typing indicator
    typingBar.style.display = 'flex';
    chatWindow.scrollTop    = chatWindow.scrollHeight;

    try {
      /* ── Call Flask API ── */
      const res  = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roll_number: roll, message: text })
      });

      const data = await res.json();
      typingBar.style.display = 'none';

      if (data.error) {
        appendMessage('bot', `⚠️ ${data.error}`, getTime());
        return;
      }

      // Show bot response
      appendMessage('bot', data.response, getTime(), null, data.confidence, data.intent);

      // Show ticket modal if a ticket was raised
      if (data.ticket_raised && data.ticket_id) {
        setTimeout(() => showTicketModal(data.ticket_id, text, data.intent), 600);
      }

    } catch (err) {
      typingBar.style.display = 'none';
      appendMessage('bot',
        '⚠️ Could not connect to the server. Please make sure the Flask app is running on <code>http://127.0.0.1:5000</code>.',
        getTime()
      );
      console.error('[CHAT ERROR]', err);
    }
  }

  /* ── Show ticket confirmation modal ── */
  function showTicketModal(ticketId, originalMsg, intent) {
    ticketBadge.textContent = ticketId;
    modalText.textContent   = intent === 'complaint'
      ? 'Your complaint has been officially recorded and escalated to the grievance team.'
      : 'Your query could not be resolved automatically and has been escalated to support staff.';
    ticketModal.classList.add('visible');
  }
}

/* ════════════════════════════════════════════════════════════
   ADMIN PAGE
   ════════════════════════════════════════════════════════════ */
if (PAGE === 'admin') {

  /* ── In-memory ticket store (simulates DB for frontend demo) ──
     In real project this data comes from Flask /admin route via
     Jinja2 template rendering or a fetch() call to /api/tickets  */
  let allTickets = JSON.parse(localStorage.getItem('gitam_tickets') || '[]');

  /* ── Save a demo ticket if store is empty (for demo purposes) ── */
  if (allTickets.length === 0) {
    allTickets = [
      {
        ticket_id: 'TKT-0001', roll_number: '21CS001',
        message:   'What is the last date to pay the semester fees?',
        intent: 'fees', confidence: 0.91, status: 'Open',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        ticket_id: 'TKT-0002', roll_number: '22EC045',
        message:   'I want to file a complaint against a staff member.',
        intent: 'complaint', confidence: 0.97, status: 'In Progress',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      },
      {
        ticket_id: 'TKT-0003', roll_number: '20ME012',
        message:   'My exam hall ticket is not available on the portal.',
        intent: 'exams', confidence: 0.55, status: 'Open',
        timestamp: new Date(Date.now() - 10800000).toISOString()
      },
      {
        ticket_id: 'TKT-0004', roll_number: '23CS088',
        message:   'Wi-Fi is not working in my hostel room.',
        intent: 'hostel', confidence: 0.78, status: 'Resolved',
        timestamp: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    localStorage.setItem('gitam_tickets', JSON.stringify(allTickets));
  }

  /* ── DOM refs ── */
  const tableBody    = document.getElementById('tableBody');
  const noData       = document.getElementById('noData');
  const searchInput  = document.getElementById('searchInput');
  const filterStatus = document.getElementById('filterStatus');
  const filterIntent = document.getElementById('filterIntent');

  /* ── Update stats cards ── */
  function updateStats(tickets) {
    document.getElementById('sTotal').textContent    = tickets.length;
    document.getElementById('sOpen').textContent     = tickets.filter(t => t.status === 'Open').length;
    document.getElementById('sProgress').textContent = tickets.filter(t => t.status === 'In Progress').length;
    document.getElementById('sResolved').textContent = tickets.filter(t => t.status === 'Resolved').length;
  }

  /* ── Render table ── */
  function renderTable(tickets) {
    updateStats(allTickets); // stats always based on ALL tickets

    tableBody.innerHTML = '';

    if (tickets.length === 0) {
      noData.style.display = 'block';
      return;
    }
    noData.style.display = 'none';

    tickets.forEach(t => {
      const confPct = Math.round(t.confidence * 100);
      const confColor = confPct >= 80 ? '#2ecc7e' : confPct >= 60 ? '#f0a830' : '#e05252';

      // Status CSS class
      const sCls = t.status === 'Open'        ? 's-open'
                 : t.status === 'In Progress' ? 's-progress'
                 : 's-resolved';

      // Format timestamp
      const ts = new Date(t.timestamp).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="ticket-id-cell">${t.ticket_id}</td>
        <td><strong>${t.roll_number}</strong></td>
        <td class="msg-cell" title="${t.message}">${t.message}</td>
        <td><span class="intent-badge intent-${t.intent}">${t.intent}</span></td>
        <td>
          <div class="conf-bar-wrap">
            <div class="conf-bar">
              <div class="conf-fill" style="width:${confPct}%;background:${confColor}"></div>
            </div>
            <span class="conf-pct">${confPct}%</span>
          </div>
        </td>
        <td>
          <select class="status-select ${sCls}" data-id="${t.ticket_id}">
            <option value="Open"        ${t.status==='Open'        ?'selected':''}>Open</option>
            <option value="In Progress" ${t.status==='In Progress' ?'selected':''}>In Progress</option>
            <option value="Resolved"    ${t.status==='Resolved'    ?'selected':''}>Resolved</option>
          </select>
        </td>
        <td class="ts-cell">${ts}</td>
        <td>
          <button class="save-status-btn" data-id="${t.ticket_id}"
            style="padding:5px 12px;background:var(--teal);color:#fff;border-radius:6px;font-size:.78rem;font-weight:600;transition:var(--tr)">
            Save
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    // Status select: live style update
    tableBody.querySelectorAll('.status-select').forEach(sel => {
      sel.addEventListener('change', () => {
        sel.className = 'status-select ' + (
          sel.value === 'Open'        ? 's-open'     :
          sel.value === 'In Progress' ? 's-progress' : 's-resolved'
        );
      });
    });

    // Save button
    tableBody.querySelectorAll('.save-status-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id     = btn.dataset.id;
        const select = tableBody.querySelector(`.status-select[data-id="${id}"]`);
        const newStatus = select.value;

        /* ── In real project: call Flask API ──
           fetch('/admin/update_status', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ ticket_id: id, status: newStatus })
           })
        */

        // Update local store
        const ticket = allTickets.find(t => t.ticket_id === id);
        if (ticket) {
          ticket.status = newStatus;
          localStorage.setItem('gitam_tickets', JSON.stringify(allTickets));
        }

        // Visual feedback
        btn.textContent = '✓ Saved!';
        btn.style.background = '#2ecc7e';
        setTimeout(() => {
          btn.textContent      = 'Save';
          btn.style.background = 'var(--teal)';
          applyFilters(); // re-render
        }, 1500);
      });
    });
  }

  /* ── Filter + search logic ── */
  function applyFilters() {
    const q      = searchInput.value.trim().toLowerCase();
    const status = filterStatus.value;
    const intent = filterIntent.value;

    const filtered = allTickets.filter(t => {
      const matchSearch = !q || t.ticket_id.toLowerCase().includes(q) || t.roll_number.toLowerCase().includes(q);
      const matchStatus = status === 'all' || t.status === status;
      const matchIntent = intent === 'all' || t.intent === intent;
      return matchSearch && matchStatus && matchIntent;
    });

    renderTable(filtered);
  }

  searchInput.addEventListener('input',  applyFilters);
  filterStatus.addEventListener('change', applyFilters);
  filterIntent.addEventListener('change', applyFilters);

  /* ── Initial render ── */
  renderTable(allTickets);
}

/* ════════════════════════════════════════════════════════════
   CROSS-PAGE: Expose addTicket() for chat page to call when
   a new ticket is created (stores in localStorage for admin)
   ════════════════════════════════════════════════════════════ */
window.addTicketToAdminStore = function(ticketData) {
  const tickets = JSON.parse(localStorage.getItem('gitam_tickets') || '[]');
  tickets.unshift(ticketData); // newest first
  localStorage.setItem('gitam_tickets', JSON.stringify(tickets));
};