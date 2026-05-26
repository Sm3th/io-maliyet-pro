'use strict';
/* ============================================================
   IO Software — Maliyet Pro  v2.0
   app.js — Zero demo data, clean slate for user input
   ============================================================ */

// ─── DATA ───────────────────────────────────────────────────
let state = {
  projects: [],          // [] — no demo data
  currentId: null,
  lang: 'tr',
  currency: 'TL',
  theme: 'dark',
  companyName: 'IO Software',
  companyAddress: '',
  companyContact: '',
  lastSave: null,
};

const CURRENCY_SYMBOLS = { TL: '₺', USD: '$', EUR: '€', PLN: 'zł' };
const STORAGE_KEY = 'ioMaliyetProV2';

// ─── HELPERS ────────────────────────────────────────────────
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function t(key) { return (typeof translations !== 'undefined' && translations[state.lang]?.[key]) || key; }
function sym() { return CURRENCY_SYMBOLS[state.currency] || '₺'; }
function fmt(n) {
  const num = parseFloat(n) || 0;
  return num.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + sym();
}
function fmtN(n) { return (parseFloat(n) || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function el(id) { return document.getElementById(id); }

// ─── PERSISTENCE ────────────────────────────────────────────
function save() {
  state.lastSave = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  showSaveIndicator();
  updateSettingsInfo();
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) Object.assign(state, JSON.parse(raw));
  } catch { /* fresh start */ }
}

function showSaveIndicator() {
  const ind = el('saveIndicator');
  ind.textContent = '✓ ' + t('saved');
  ind.classList.add('show');
  setTimeout(() => ind.classList.remove('show'), 2000);
}

// ─── INIT ────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  load();
  applyTheme(state.theme);
  applyLanguage(state.lang);
  applyCurrencySelect();
  loadSettings();
  render();
  showView('dashboard');
  registerShortcuts();
});

// ─── RENDER ─────────────────────────────────────────────────
function render() {
  renderSidebar();
  renderDashboard();
  renderProjects();
  renderAnalysis();
  updateProjectsBadge();
}

function renderSidebar() {
  const list = el('recentList');
  const recent = [...state.projects].slice(-8).reverse();
  if (recent.length === 0) { list.innerHTML = ''; return; }
  list.innerHTML = recent.map(p => `
    <div class="recent-item" onclick="app.openProject('${p.id}')">
      <div class="recent-item-dot"></div>
      <span>${p.name || t('newProject')}</span>
    </div>`).join('');
}

function updateProjectsBadge() {
  const badge = el('projectsBadge');
  if (state.projects.length > 0) {
    badge.textContent = state.projects.length;
    badge.classList.add('show');
  } else {
    badge.classList.remove('show');
  }
}

// ─── VIEWS ──────────────────────────────────────────────────
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const view = el('view-' + name);
  if (view) view.classList.add('active');
  const navItem = document.querySelector(`[data-view="${name}"]`);
  if (navItem) navItem.classList.add('active');

  const titles = {
    dashboard: t('dashboard'),
    projects: t('projects'),
    detail: state.currentId ? (currentProject()?.name || t('newProject')) : t('projects'),
    analysis: t('analysis'),
    settings: t('settings'),
  };
  el('pageTitle').textContent = titles[name] || name;

  if (name === 'detail' && state.currentId) loadDetailForm();
  if (name === 'analysis') renderAnalysis();
  if (name === 'dashboard') renderDashboard();
}

// ─── DASHBOARD ──────────────────────────────────────────────
function renderDashboard() {
  const projects = state.projects;
  el('statTotalProjects').textContent = projects.length;

  const totalCost = projects.reduce((s, p) => s + totalProjectCost(p), 0);
  el('statTotalRevenue').textContent = fmt(totalCost);

  const margins = projects.filter(p => totalProjectCost(p) > 0).map(p => {
    const cost = totalProjectCost(p);
    const exp = totalProjectExpense(p);
    return cost > 0 ? ((cost - exp) / cost * 100) : 0;
  });
  el('statAvgProfit').textContent = margins.length
    ? (margins.reduce((a,b) => a+b, 0) / margins.length).toFixed(1) + '%'
    : '—';

  const today = new Date();
  const active = projects.filter(p => {
    if (!p.endDate) return true;
    return new Date(p.endDate) >= today;
  });
  el('statActiveProjects').textContent = active.length;

  // Recent projects list
  const dashRecent = el('dashRecentProjects');
  const recent = [...projects].slice(-5).reverse();
  if (recent.length === 0) {
    dashRecent.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg><p>${t('noProjects')}</p><button class="btn-primary btn-sm" onclick="app.yeniProje()">${t('newProject')}</button></div>`;
  } else {
    dashRecent.innerHTML = recent.map(p => {
      const cost = totalProjectCost(p);
      const exp = totalProjectExpense(p);
      const diff = cost - exp;
      return `<div class="project-card" onclick="app.openProject('${p.id}')" style="margin-bottom:10px;cursor:pointer;">
        <div class="project-card-header">
          <div class="project-card-name">${p.name || t('newProject')}</div>
        </div>
        <div class="project-card-dates">${p.startDate || '—'} → ${p.endDate || '—'}</div>
        <div class="project-card-stats">
          <div class="card-stat"><span class="card-stat-label">${t('cost')}</span><span class="card-stat-value">${fmtN(cost)}</span></div>
          <div class="card-stat"><span class="card-stat-label">${t('expense')}</span><span class="card-stat-value">${fmtN(exp)}</span></div>
          <div class="card-stat"><span class="card-stat-label">${t('difference')}</span><span class="card-stat-value ${diff>=0?'positive':'negative'}">${fmtN(diff)}</span></div>
        </div>
      </div>`;
    }).join('');
  }

  // Category chart
  renderCategoryChart();
}

function renderCategoryChart() {
  const canvas = el('categoryChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const allItems = state.projects.flatMap(p => p.items || []);

  const catMap = {};
  allItems.forEach(item => {
    const cat = item.cat || 'Diğer';
    catMap[cat] = (catMap[cat] || 0) + (parseFloat(item.cost) || 0);
  });

  const entries = Object.entries(catMap).sort((a,b) => b[1]-a[1]);
  const colors = ['#0ea5e9','#6366f1','#22c55e','#f97316','#eab308','#a855f7','#ef4444','#94a3b8'];

  ctx.clearRect(0,0,canvas.width,canvas.height);

  if (entries.length === 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.font = '12px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t('noData'), canvas.width/2, canvas.height/2);
    el('chartLegend').innerHTML = '';
    return;
  }

  const total = entries.reduce((s,[,v])=>s+v, 0);
  let startAngle = -Math.PI/2;
  const cx = canvas.width/2, cy = canvas.height/2 - 10;
  const r = Math.min(cx, cy) - 16;

  entries.forEach(([cat, val], i) => {
    const slice = (val/total) * Math.PI*2;
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,r,startAngle,startAngle+slice);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    startAngle += slice;
  });

  // Donut hole
  ctx.beginPath();
  ctx.arc(cx,cy,r*0.55,0,Math.PI*2);
  const isDark = document.body.classList.contains('theme-dark');
  ctx.fillStyle = isDark ? '#0f1e33' : '#ffffff';
  ctx.fill();

  el('chartLegend').innerHTML = entries.slice(0,6).map(([cat,val],i) => `
    <div class="legend-item">
      <div class="legend-dot" style="background:${colors[i%colors.length]}"></div>
      <span>${cat}: ${((val/total)*100).toFixed(0)}%</span>
    </div>`).join('');
}

// ─── PROJECTS VIEW ──────────────────────────────────────────
function renderProjects(filtered) {
  const grid = el('projectsGrid');
  const list = filtered || state.projects;

  if (list.length === 0) {
    grid.innerHTML = `<div class="empty-state full-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
      <p>${t('noProjects')}</p><span>${t('createFirst')}</span>
      <button class="btn-primary" onclick="app.yeniProje()">${t('newProject')}</button>
    </div>`;
    return;
  }

  grid.innerHTML = list.map(p => {
    const cost = totalProjectCost(p);
    const exp = totalProjectExpense(p);
    const diff = cost - exp;
    const margin = cost > 0 ? ((diff/cost)*100).toFixed(1) : '0';
    const barPct = cost > 0 ? Math.min((exp/cost)*100, 100) : 0;
    return `
    <div class="project-card" onclick="app.openProject('${p.id}')">
      <div class="project-card-header">
        <div class="project-card-name">${p.name || t('newProject')}</div>
        <div class="project-card-menu" onclick="event.stopPropagation()">
          <button class="menu-btn" onclick="app.openProject('${p.id}')" title="${t('edit')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="menu-btn danger" onclick="app.silOnay('${p.id}')" title="${t('delete')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>
      <div class="project-card-dates">${p.startDate || '—'} → ${p.endDate || '—'}</div>
      <div class="project-card-stats">
        <div class="card-stat"><span class="card-stat-label">${t('cost')}</span><span class="card-stat-value">${fmtN(cost)}</span></div>
        <div class="card-stat"><span class="card-stat-label">${t('expense')}</span><span class="card-stat-value">${fmtN(exp)}</span></div>
        <div class="card-stat"><span class="card-stat-label">${t('profitMargin')}</span><span class="card-stat-value ${diff>=0?'positive':'negative'}">${margin}%</span></div>
      </div>
      <div class="project-card-bar"><div class="project-bar-fill" style="width:${barPct}%"></div></div>
    </div>`;
  }).join('');
}

// ─── PROJECT CRUD ────────────────────────────────────────────
function yeniProje() {
  const p = {
    id: uid(),
    name: '',
    startDate: '',
    endDate: '',
    commission: 18,
    kdv: 0,
    items: [],
    payments: [],
    agreed: 0,
    createdAt: new Date().toISOString(),
  };
  state.projects.push(p);
  state.currentId = p.id;
  save();
  render();
  showView('detail');
}

function openProject(id) {
  state.currentId = id;
  showView('detail');
}

function currentProject() {
  return state.projects.find(p => p.id === state.currentId);
}

function silOnay(id) {
  el('confirmMessage').textContent = t('deleteConfirm');
  el('confirmBtn').onclick = () => { projeySil(id); closeModal(); };
  showModal('confirmModal');
}

function projeySil(id) {
  state.projects = state.projects.filter(p => p.id !== id);
  if (state.currentId === id) state.currentId = null;
  save();
  render();
  if (document.querySelector('#view-detail.active')) showView('projects');
}

// ─── DETAIL FORM ─────────────────────────────────────────────
function loadDetailForm() {
  const p = currentProject();
  if (!p) return;

  el('projectNameInput').value = p.name || '';
  el('startDateInput').value = p.startDate || '';
  el('endDateInput').value = p.endDate || '';
  el('commissionSelect').value = p.commission ?? 18;
  el('kdvSelect').value = p.kdv ?? 0;

  calcDays();
  renderTable();
  renderSummary();
  renderPayments();
  updateCategoryFilter();
}

function projeGuncelle() {
  const p = currentProject();
  if (!p) return;
  p.name = el('projectNameInput').value;
  p.startDate = el('startDateInput').value;
  p.endDate = el('endDateInput').value;
  p.commission = parseFloat(el('commissionSelect').value) || 0;
  p.kdv = parseFloat(el('kdvSelect').value) || 0;
  calcDays();
  renderSummary();
  el('pageTitle').textContent = p.name || t('newProject');
  save();
  renderSidebar();
}

function calcDays() {
  const s = el('startDateInput').value;
  const e = el('endDateInput').value;
  if (s && e) {
    const diff = Math.ceil((new Date(e) - new Date(s)) / 86400000);
    el('totalDaysInput').value = diff >= 0 ? diff + ' gün' : '—';
  } else {
    el('totalDaysInput').value = '—';
  }
}

// ─── TABLE ───────────────────────────────────────────────────
let _filterCat = '';
let _sortCol = 'default';

function renderTable() {
  const p = currentProject();
  if (!p) return;

  let items = [...(p.items || [])];
  if (_filterCat) items = items.filter(i => i.cat === _filterCat);
  if (_sortCol === 'name') items.sort((a,b) => (a.name||'').localeCompare(b.name||''));
  else if (_sortCol === 'cost-desc') items.sort((a,b) => (b.cost||0)-(a.cost||0));
  else if (_sortCol === 'cost-asc') items.sort((a,b) => (a.cost||0)-(b.cost||0));
  else if (_sortCol === 'diff-desc') items.sort((a,b) => ((b.cost||0)-(b.expense||0))-((a.cost||0)-(a.expense||0)));

  const tbody = el('costTableBody');
  const empty = el('tableEmpty');

  if (items.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'flex';
    el('footCost').textContent = fmtN(0);
    el('footExpense').textContent = fmtN(0);
    el('footDiff').textContent = fmtN(0);
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = items.map((item, idx) => {
    const diff = (parseFloat(item.cost)||0) - (parseFloat(item.expense)||0);
    const diffClass = diff >= 0 ? 'diff-positive' : 'diff-negative';
    const realIdx = p.items.indexOf(item);
    return `
    <tr>
      <td class="col-check"><input type="checkbox" data-idx="${realIdx}"/></td>
      <td class="col-num">${idx+1}</td>
      <td class="col-cat"><span class="cat-badge cat-${item.cat||'Diğer'}">${item.cat||'Diğer'}</span></td>
      <td class="col-name">${item.name||'—'}</td>
      <td class="col-cost">${fmtN(item.cost||0)}</td>
      <td class="col-expense">${fmtN(item.expense||0)}</td>
      <td class="col-diff ${diffClass}">${fmtN(diff)}</td>
      <td class="col-note">${item.note||''}</td>
      <td class="col-actions">
        <div class="row-actions">
          <button class="row-btn" onclick="app.kalemDuzenle(${realIdx})" title="${t('edit')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="row-btn" onclick="app.kalemYukar(${realIdx})" title="${t('movUp')}">▲</button>
          <button class="row-btn" onclick="app.kalemAsag(${realIdx})" title="${t('movDown')}">▼</button>
          <button class="row-btn danger" onclick="app.kalemSil(${realIdx})" title="${t('delete')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');

  // Footer totals
  const allItems = p.items || [];
  el('footCost').textContent = fmtN(allItems.reduce((s,i) => s+(parseFloat(i.cost)||0), 0));
  el('footExpense').textContent = fmtN(allItems.reduce((s,i) => s+(parseFloat(i.expense)||0), 0));
  const totalDiff = allItems.reduce((s,i) => s+((parseFloat(i.cost)||0)-(parseFloat(i.expense)||0)), 0);
  const footDiffEl = el('footDiff');
  footDiffEl.textContent = fmtN(totalDiff);
  footDiffEl.className = 'foot-val ' + (totalDiff >= 0 ? 'diff-positive' : 'diff-negative');
}

function updateCategoryFilter() {
  const p = currentProject();
  if (!p) return;
  const cats = [...new Set((p.items||[]).map(i => i.cat).filter(Boolean))];
  const sel = el('catFilterSelect');
  sel.innerHTML = `<option value="">${t('allCategories')}</option>` +
    cats.map(c => `<option value="${c}">${c}</option>`).join('');
  sel.value = _filterCat;
}

function filterByCategory(val) { _filterCat = val; renderTable(); }
function sortItems(val) { _sortCol = val; renderTable(); }
function selectAll(checked) {
  document.querySelectorAll('#costTableBody input[type=checkbox]').forEach(cb => cb.checked = checked);
}

// ─── KALEM MODAL ─────────────────────────────────────────────
let _editIdx = null;

function kalemEkle() {
  _editIdx = null;
  el('itemModalTitle').textContent = t('addItem');
  el('itemCat').value = 'Malzeme';
  el('itemName').value = '';
  el('itemCost').value = '';
  el('itemExpense').value = '';
  el('itemDiff').value = '';
  el('itemNote').value = '';
  showModal('itemModal');
  setTimeout(() => el('itemName').focus(), 100);
}

function kalemDuzenle(idx) {
  const p = currentProject();
  if (!p) return;
  const item = p.items[idx];
  if (!item) return;
  _editIdx = idx;
  el('itemModalTitle').textContent = t('edit');
  el('itemCat').value = item.cat || 'Malzeme';
  el('itemName').value = item.name || '';
  el('itemCost').value = item.cost || '';
  el('itemExpense').value = item.expense || '';
  updateModalDiff();
  el('itemNote').value = item.note || '';
  showModal('itemModal');
}

function kalemKaydet() {
  const p = currentProject();
  if (!p) return;
  const name = el('itemName').value.trim();
  if (!name) { el('itemName').focus(); return; }

  const item = {
    id: uid(),
    cat: el('itemCat').value,
    name,
    cost: parseFloat(el('itemCost').value) || 0,
    expense: parseFloat(el('itemExpense').value) || 0,
    note: el('itemNote').value.trim(),
  };

  if (_editIdx !== null) {
    item.id = p.items[_editIdx].id;
    p.items[_editIdx] = item;
  } else {
    p.items = p.items || [];
    p.items.push(item);
  }

  closeModal();
  save();
  renderTable();
  renderSummary();
  updateCategoryFilter();
  renderDashboard();
}

function updateModalDiff() {
  const c = parseFloat(el('itemCost').value) || 0;
  const e = parseFloat(el('itemExpense').value) || 0;
  el('itemDiff').value = fmtN(c - e);
}

function kalemSil(idx) {
  const p = currentProject();
  if (!p) return;
  p.items.splice(idx, 1);
  save();
  renderTable();
  renderSummary();
  updateCategoryFilter();
}

function kalemYukar(idx) {
  const p = currentProject();
  if (!p || idx <= 0) return;
  [p.items[idx-1], p.items[idx]] = [p.items[idx], p.items[idx-1]];
  save(); renderTable();
}

function kalemAsag(idx) {
  const p = currentProject();
  if (!p || idx >= p.items.length-1) return;
  [p.items[idx], p.items[idx+1]] = [p.items[idx+1], p.items[idx]];
  save(); renderTable();
}

// ─── SUMMARY ─────────────────────────────────────────────────
function totalProjectCost(p) { return (p.items||[]).reduce((s,i) => s+(parseFloat(i.cost)||0), 0); }
function totalProjectExpense(p) { return (p.items||[]).reduce((s,i) => s+(parseFloat(i.expense)||0), 0); }

function renderSummary() {
  const p = currentProject();
  if (!p) return;

  const cost = totalProjectCost(p);
  const exp = totalProjectExpense(p);
  const diff = cost - exp;
  const commission = diff * (p.commission||0) / 100;
  const fee = diff - commission;
  const kdvAmount = fee * (p.kdv||0) / 100;

  el('sumCost').textContent = fmt(cost);
  el('sumExpense').textContent = fmt(exp);
  el('sumDiff').textContent = fmt(diff);
  el('sumCommission').textContent = fmt(commission);
  el('sumTotal').textContent = fmt(fee + kdvAmount);
  el('kdvAmount').textContent = fmt(kdvAmount);

  // Payments
  const paid = (p.payments||[]).reduce((s,pay) => s+(parseFloat(pay.amount)||0), 0);
  const agreed = parseFloat(p.agreed)||0;
  el('payAgreed').textContent = fmt(agreed);
  el('payPaid').textContent = fmt(paid);
  el('payRemaining').textContent = fmt(Math.max(agreed - paid, 0));
  el('payExtra').textContent = fmt(Math.max(paid - agreed, 0));
}

// ─── PAYMENTS ────────────────────────────────────────────────
function odemeEkle() {
  el('payDate').value = new Date().toISOString().slice(0,10);
  el('payAmount').value = '';
  el('payNote').value = '';
  showModal('paymentModal');
}

function odemeKaydet() {
  const p = currentProject();
  if (!p) return;
  const amount = parseFloat(el('payAmount').value);
  if (!amount) { el('payAmount').focus(); return; }
  p.payments = p.payments || [];
  p.payments.push({ id: uid(), date: el('payDate').value, amount, note: el('payNote').value });
  closeModal();
  save();
  renderPayments();
  renderSummary();
}

function odemeSil(idx) {
  const p = currentProject();
  if (!p) return;
  p.payments.splice(idx, 1);
  save();
  renderPayments();
  renderSummary();
}

function renderPayments() {
  const p = currentProject();
  if (!p) return;
  const list = el('paymentsList');
  const payments = p.payments || [];
  if (payments.length === 0) {
    list.innerHTML = `<div class="empty-state" style="padding:12px 0"><p style="font-size:12px">${t('noPayments')}</p></div>`;
    return;
  }
  list.innerHTML = payments.map((pay, idx) => `
    <div class="payment-item">
      <div class="payment-info">
        <span class="payment-date">${pay.date || '—'}</span>
        ${pay.note ? `<span class="payment-note">${pay.note}</span>` : ''}
      </div>
      <span class="payment-amount">+${fmt(pay.amount)}</span>
      <button class="payment-del" onclick="app.odemeSil(${idx})">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>`).join('');
}

// ─── ANALYSIS ────────────────────────────────────────────────
function renderAnalysis() {
  const projects = state.projects;

  // Bar chart
  const canvas = el('barChart');
  if (canvas && projects.length > 0) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const maxCost = Math.max(...projects.map(p => totalProjectCost(p)), 1);
    const barW = Math.min(40, (canvas.width - 40) / (projects.length * 2));
    const gap = barW * 0.5;
    const padL = 20, padB = 30;
    const chartH = canvas.height - padB;

    projects.slice(-8).forEach((p, i) => {
      const cost = totalProjectCost(p);
      const exp = totalProjectExpense(p);
      const x = padL + i * (barW * 2 + gap);
      const hC = (cost / maxCost) * (chartH - 10);
      const hE = (exp / maxCost) * (chartH - 10);

      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(x, chartH - hC, barW * 0.9, hC);
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(x + barW, chartH - hE, barW * 0.9, hE);

      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '9px DM Sans, sans-serif';
      ctx.textAlign = 'center';
      const name = (p.name || 'P').slice(0, 8);
      ctx.fillText(name, x + barW, chartH + 16);
    });
  }

  // Top 5 items
  const allItems = projects.flatMap(p => (p.items||[]).map(item => ({ ...item, project: p.name })));
  allItems.sort((a,b) => (b.cost||0) - (a.cost||0));
  const topList = el('topItemsList');
  if (allItems.length === 0) {
    topList.innerHTML = `<div class="empty-state"><p>${t('noData')}</p></div>`;
  } else {
    topList.innerHTML = allItems.slice(0,5).map((item, i) => `
      <div class="top-item">
        <div class="top-rank ${i===0?'top-rank-1':''}">${i+1}</div>
        <div class="top-name"><div>${item.name}</div><div style="font-size:10px;color:var(--text-3)">${item.project||''}</div></div>
        <span class="top-val">${fmt(item.cost)}</span>
      </div>`).join('');
  }

  // Analysis table
  const tbody = el('analysisTableBody');
  if (projects.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-3);padding:20px">${t('noData')}</td></tr>`;
    return;
  }
  tbody.innerHTML = projects.map(p => {
    const cost = totalProjectCost(p);
    const exp = totalProjectExpense(p);
    const profit = cost - exp;
    const margin = cost > 0 ? ((profit/cost)*100).toFixed(1) : '0';
    return `
    <tr onclick="app.openProject('${p.id}')" style="cursor:pointer">
      <td>${p.name||'—'}</td>
      <td>${fmt(cost)}</td>
      <td>${fmt(exp)}</td>
      <td class="${profit>=0?'diff-positive':'diff-negative'}">${fmt(profit)}</td>
      <td class="${profit>=0?'diff-positive':'diff-negative'}">${margin}%</td>
    </tr>`;
  }).join('');
}

// ─── SORT/SEARCH ─────────────────────────────────────────────
function aramaYap(q) {
  if (!q) { renderProjects(); return; }
  const lower = q.toLowerCase();
  const filtered = state.projects.filter(p =>
    (p.name||'').toLowerCase().includes(lower) ||
    (p.items||[]).some(i => (i.name||'').toLowerCase().includes(lower))
  );
  renderProjects(filtered);
  showView('projects');
}

function sortProjects(mode) {
  const projects = [...state.projects];
  if (mode === 'date-desc') projects.sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
  else if (mode === 'date-asc') projects.sort((a,b) => new Date(a.createdAt||0) - new Date(b.createdAt||0));
  else if (mode === 'name-asc') projects.sort((a,b) => (a.name||'').localeCompare(b.name||''));
  else if (mode === 'name-desc') projects.sort((a,b) => (b.name||'').localeCompare(a.name||''));
  else if (mode === 'cost-desc') projects.sort((a,b) => totalProjectCost(b) - totalProjectCost(a));
  renderProjects(projects);
}

// ─── EXPORT/IMPORT ──────────────────────────────────────────
function yedekal() {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'io-maliyet-yedek-' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

function yedekYukle() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.projects) {
          Object.assign(state, data);
          save();
          render();
          showView('dashboard');
          alert('Yedek başarıyla yüklendi.');
        }
      } catch { alert('Geçersiz yedek dosyası.'); }
    };
    reader.readAsText(file);
  };
  input.click();
}

function exportCsv() {
  const p = currentProject();
  if (!p) return;
  const rows = [['#', 'Kategori', 'Kalem', 'Maliyet', 'Gider', 'Fark', 'Not']];
  (p.items||[]).forEach((item, i) => {
    const diff = (item.cost||0) - (item.expense||0);
    rows.push([i+1, item.cat||'', item.name||'', item.cost||0, item.expense||0, diff, item.note||'']);
  });
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (p.name || 'maliyet') + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ─── SETTINGS ────────────────────────────────────────────────
function setLanguage(lang) {
  state.lang = lang;
  applyLanguage(lang);
  save();
  render();
}

function applyLanguage(lang) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = translations?.[lang]?.[key];
    if (val) el.textContent = val;
  });
  const sel = el('langSelect');
  if (sel) sel.value = lang;
}

function setCurrency(cur) {
  state.currency = cur;
  save();
  if (state.currentId) renderSummary();
  render();
}

function applyCurrencySelect() {
  const sel = el('currencySelect');
  if (sel) sel.value = state.currency;
}

function setTheme(theme) {
  state.theme = theme;
  applyTheme(theme);
  save();
}

function applyTheme(theme) {
  document.body.className = document.body.className.replace(/theme-\w+/, '').trim();
  document.body.classList.add('theme-' + theme);
  const sel = el('themeSelect');
  if (sel) sel.value = theme;
}

function toggleTheme() {
  setTheme(state.theme === 'dark' ? 'light' : 'dark');
  renderCategoryChart();
}

function loadSettings() {
  const inp = el('companyNameInput');
  if (inp) inp.value = state.companyName || '';
  const addr = el('companyAddressInput');
  if (addr) addr.value = state.companyAddress || '';
  const cont = el('companyContactInput');
  if (cont) cont.value = state.companyContact || '';
  const langSel = el('langSelect');
  if (langSel) langSel.value = state.lang;
  const curSel = el('currencySelect');
  if (curSel) curSel.value = state.currency;
  const themeSel = el('themeSelect');
  if (themeSel) themeSel.value = state.theme;
}

function saveSettings() {
  state.companyName = el('companyNameInput')?.value || 'IO Software';
  state.companyAddress = el('companyAddressInput')?.value || '';
  state.companyContact = el('companyContactInput')?.value || '';
  save();
}

function updateSettingsInfo() {
  const ip = el('infoProjects');
  const ii = el('infoItems');
  const ils = el('infoLastSave');
  if (ip) ip.textContent = state.projects.length;
  if (ii) ii.textContent = state.projects.reduce((s,p) => s+(p.items||[]).length, 0);
  if (ils && state.lastSave) ils.textContent = new Date(state.lastSave).toLocaleString('tr-TR');
}

function kaydet() {
  const p = currentProject();
  if (p) projeGuncelle();
  save();
  render();
}

// ─── MODALS ─────────────────────────────────────────────────
function showModal(id) {
  el('modalOverlay').classList.add('show');
  el(id).classList.add('show');
}

function closeModal() {
  el('modalOverlay').classList.remove('show');
  document.querySelectorAll('.modal.show').forEach(m => m.classList.remove('show'));
}

// ─── SHORTCUTS ───────────────────────────────────────────────
function registerShortcuts() {
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'n') { e.preventDefault(); yeniProje(); }
      else if (e.key === 's') { e.preventDefault(); kaydet(); }
      else if (e.key === 'f') { e.preventDefault(); el('searchInput').focus(); }
      else if (e.key === 'd') { e.preventDefault(); showView('dashboard'); }
      else if (e.key === 'p') { e.preventDefault(); showView('projects'); }
      else if (e.key === 't') { e.preventDefault(); toggleTheme(); }
    }
    if (e.key === 'Escape') closeModal();
  });
}

// ─── PUBLIC API ──────────────────────────────────────────────
window.app = {
  showView, yeniProje, openProject, silOnay, projeySil,
  projeGuncelle, kalemEkle, kalemDuzenle, kalemKaydet, kalemSil,
  kalemYukar, kalemAsag, selectAll, filterByCategory, sortItems,
  odemeEkle, odemeKaydet, odemeSil, updateModalDiff,
  aramaYap, sortProjects, yedekal, yedekYukle, exportCsv,
  setLanguage, setCurrency, setTheme, toggleTheme, saveSettings,
  kaydet, closeModal,
};
