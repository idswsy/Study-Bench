/* ═══════════════════════════════════════════════════════════
   学习工作台 · app.js — 团队多用户：登录 / 分工 / 监督 / 同步
   ─ 存储适配器：boot 探测 /api/ping → 局域网服务 / 本机离线
   ─ 状态 v4：members（分工）+ module.ownerId + checkin.memberId
   ─ 登录是团队身份门：点击成员卡片免密进入，名称可自定义
   ═══════════════════════════════════════════════════════════ */
(function () {
'use strict';

/* ── 工具 ── */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = p => p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad2 = n => String(n).padStart(2, '0');
const dstr = d => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
const today = () => dstr(new Date());
const addDays = (s, n) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return dstr(d); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmtH = m => (m / 60).toFixed(m % 60 ? 1 : 0) + ' h';
const WEEKCN = ['日', '一', '二', '三', '四', '五', '六'];
const COLORS = ['#f0a13c', '#4da3ff', '#35c46f', '#e05fd0', '#ff6b57', '#2fd4c4', '#9d7bff', '#f0b429'];
const TYPES = {
  video: { label: '视频', icon: 'play' },
  doc: { label: '文档', icon: 'book' },
  code: { label: '代码', icon: 'code' },
  tool: { label: '工具', icon: 'wrench' },
  search: { label: '搜索直达', icon: 'search' }
};

/* ── 图标 ── */
const P = {
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  trash: '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>',
  edit: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
  external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  grip: '<path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01" stroke-width="2.6"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  play: '<path d="m6 3 14 9-14 9V3z"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  chip: '<rect x="6" y="6" width="12" height="12" rx="1.5"/><rect x="10" y="10" width="4" height="4"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  calendar: '<path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  layers: '<path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
  filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5M3 12a9 3 0 0 0 18 0"/>',
  chart: '<path d="M3 3v18h18M7 16v2M12 11v7M17 6v12"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3ZM12 9v4M12 17h.01"/>',
  arrow: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 8.3-8.3M17 5l2.5 2.5M14 8l2.5 2.5"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  wifi: '<path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>',
  sync: '<path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>',
  palette: '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.83-.44-1.12-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.97 6.01 17.46 2 12 2z"/><circle cx="7.5" cy="10.5" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="16.5" cy="10.5" r="1" fill="currentColor" stroke="none"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.6 12.4a1.5 1.5 0 0 0 1.5 1.1h8.7a1.5 1.5 0 0 0 1.5-1.1L23 7H6"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5V8z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  merge: '<path d="M6 3v12a6 6 0 0 0 6 6h6"/><path d="m15 18 3 3-3 3M6 3 3 6l3 3M18 3a6 6 0 0 1-6 6H6"/>',
  qrcode: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14h1M14 20h1M18 18h3v3h-3z"/>'
};
const icon = (n, cls) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"' + (cls ? ' class="' + cls + '"' : '') + ' aria-hidden="true">' + (P[n] || '') + '</svg>';
const starIcon = on => '<svg viewBox="0 0 24 24" fill="' + (on ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P.star + '</svg>';

/* ── 状态 / 存储 ── */
const KEY = 'studybench.v2';
const SESSION_KEY = 'studybench.session';
let S = null;
let store = null;
let session = null;
let lastRev = 0;
let dirty = false, saving = false, saveTimer = null, pollTimer = null;
const ui = { view: 'checkin', selModule: null, minutes: 60, libQuery: '', libType: 'all', libSort: 'default', libMod: 'all', libFav: false, catQuery: '', catDir: 'all', catPhase: 'all', catSort: 'default', catStatus: 'all', drawerMod: null, confirmFn: null, progFilter: 'mine', progStage: 'all', renameId: null, menuOpen: false, formColor: null, theme: 'workbench', themeMenuOpen: false, hwStatus: 'all', hwOwner: 'all', shareOut: '', shareBusy: false };

const THEME_KEY = 'studybench.theme';
const THEMES = [
  { id: 'workbench', name: 'PCB 工作台', desc: '阻焊绿 · 铜走线 · 暗色硬核', pv: { bg: '#0a0f0c', sf: '#16211a', ac: '#35c46f', ac2: '#d98e32', fg: '#e9efe6' } },
  { id: 'claude-light', name: 'Claude · 暖纸', desc: '象牙纸 · 赤陶珊瑚 · 衬线标题', pv: { bg: '#f6f3eb', sf: '#fffdf7', ac: '#b5542f', ac2: '#97652c', fg: '#2b2723' } },
  { id: 'claude-dark', name: 'Claude · 暖夜', desc: '浓咖底 · 珊瑚橘 · 夜间护眼', pv: { bg: '#262320', sf: '#39342f', ac: '#e89b7d', ac2: '#e0b87e', fg: '#f2ede3' } }
];
const themeById = id => THEMES.find(t => t.id === id) || THEMES[0];
function readTheme() { try { const t = localStorage.getItem(THEME_KEY); if (THEMES.some(x => x.id === t)) return t; } catch (e) { } return 'workbench'; }
let themeFadeTimer = null;
function applyTheme(id, fade) {
  ui.theme = themeById(id).id;
  const root = document.documentElement;
  if (fade) {
    root.classList.add('theme-fade');
    clearTimeout(themeFadeTimer);
    themeFadeTimer = setTimeout(() => root.classList.remove('theme-fade'), 460);
  }
  root.setAttribute('data-theme', ui.theme);
  try { localStorage.setItem(THEME_KEY, ui.theme); } catch (e) { }
}
function setTheme(id) {
  if (id === ui.theme) { renderThemeMenus(); return; }
  applyTheme(id, true);
  renderThemeMenus();
  toast('已切换到「' + themeById(id).name + '」主题', 'ok');
}
function pvStyle(t) { return '--p-bg:' + t.pv.bg + ';--p-sf:' + t.pv.sf + ';--p-ac:' + t.pv.ac + ';--p-ac2:' + t.pv.ac2 + ';--p-fg:' + t.pv.fg; }
function pvInner() { return '<span class="pv-bar"></span><span class="pv-ac"></span><span class="pv-ac2"></span><span class="pv-fg"></span>'; }
function renderThemeMenus() {
  const btn = $('#themeBtn');
  if (btn) { btn.innerHTML = icon('palette'); btn.classList.toggle('active', ui.themeMenuOpen); btn.setAttribute('aria-expanded', ui.themeMenuOpen ? 'true' : 'false'); }
  const menu = $('#themeMenu');
  if (menu) {
    menu.classList.toggle('open', ui.themeMenuOpen);
    menu.innerHTML = '<div class="tm-head">' + icon('palette') + '主题外观</div>' + THEMES.map(t =>
      '<button type="button" class="theme-opt' + (t.id === ui.theme ? ' active' : '') + '" role="menuitemradio" aria-checked="' + (t.id === ui.theme) + '" data-action="set-theme" data-id="' + t.id + '">' +
      '<span class="to-prev" style="' + pvStyle(t) + '">' + pvInner() + '</span>' +
      '<span class="to-info"><b>' + esc(t.name) + '</b><small>' + esc(t.desc) + '</small></span>' +
      '<span class="to-check">' + icon('check') + '</span></button>').join('');
  }
  const grid = $('#themeGrid');
  if (grid) {
    grid.innerHTML = THEMES.map(t =>
      '<button type="button" class="theme-tile' + (t.id === ui.theme ? ' active' : '') + '" aria-pressed="' + (t.id === ui.theme) + '" data-action="set-theme" data-id="' + t.id + '">' +
      '<span class="tt-prev" style="' + pvStyle(t) + '">' + pvInner() + '</span>' +
      '<span class="tt-name">' + esc(t.name) + '<span class="to-check">' + icon('check') + '</span></span>' +
      '<span class="tt-desc">' + esc(t.desc) + '</span></button>').join('');
  }
  const note = $('#themeNote');
  if (note) note.innerHTML = icon('info') + '<span>主题仅改变本机外观，不影响团队数据；选择会自动保存到当前浏览器，下次打开自动恢复。暖纸 / 暖夜参考 Claude 的暖色编辑风格。</span>';
}
function toggleThemeMenu(open) {
  ui.themeMenuOpen = (open === undefined) ? !ui.themeMenuOpen : open;
  if (ui.themeMenuOpen && ui.menuOpen) toggleMenu(false);
  renderThemeMenus();
}

const SAFE_COLOR = /^#[0-9a-fA-F]{6}$/;
const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;
const SAFE_DATE = /^\d{4}-\d{2}-\d{2}$/;
const str = (v, n) => String(v ?? '').slice(0, n);
const safeUrl = u => /^https?:\/\//i.test(u) ? str(u, 500) : '';
function validState(s) { return s && Array.isArray(s.modules) && Array.isArray(s.resources) && Array.isArray(s.checkins); }
const seedOwnerMap = () => { const o = {}; SEED.modules.forEach(m => { o[m.id] = m.ownerId; }); return o; };
const seedStageMap = () => { const o = {}; SEED.modules.forEach(m => { o[m.id] = m.stageId; }); return o; };
const cloneSeed = o => JSON.parse(JSON.stringify(o));

/* 课时 / 里程碑 / 项目 / 硬件 的清洗（v3） */
function cleanLesson(l) {
  return { id: SAFE_ID.test(l.id) ? l.id : uid('l'), title: str(l.title, 90), dur: str(l.dur, 16), url: safeUrl(l.url), author: str(l.author, 30), done: !!l.done, ts: Number(l.ts) || 0 };
}
function cleanMilestone(x) {
  return { id: SAFE_ID.test(x.id) ? x.id : uid('ms'), title: str(x.title, 90), done: !!x.done, ts: Number(x.ts) || 0 };
}
function cleanProject(p) {
  return {
    id: SAFE_ID.test(p.id) ? p.id : uid('p'), name: str(p.name, 60), desc: str(p.desc, 200), url: safeUrl(p.url),
    milestones: Array.isArray(p.milestones) ? p.milestones.filter(x => x && typeof x === 'object').map(cleanMilestone) : []
  };
}
function cleanHardware(h) {
  return {
    id: SAFE_ID.test(h.id) ? h.id : uid('hw'), name: str(h.name, 40), spec: str(h.spec, 80),
    owned: !!h.owned, owner: SAFE_ID.test(h.owner) ? h.owner : '', use: str(h.use, 120),
    price: str(h.price, 24), url: safeUrl(h.url), note: str(h.note, 160),
    tag: str(h.tag, 16), ts: Number(h.ts) || 0,
    moduleIds: Array.isArray(h.moduleIds) ? h.moduleIds.filter(x => SAFE_ID.test(x)).slice(0, 8) : []
  };
}

function sanitizeState(s) {
  if (s.version !== 4) SEED.upgradeToV4(s);
  let members = Array.isArray(s.members) ? s.members.filter(m => m && typeof m === 'object') : [];
  if (!members.length) members = SEED.members.map(m => Object.assign({}, m));
  members = members.map(m => {
    const id = SAFE_ID.test(m.id) ? m.id : uid('u');
    return {
      id, name: str(m.name, 20) || '成员', role: str(m.role, 40),
      color: SAFE_COLOR.test(m.color) ? m.color : '#35c46f',
      stageId: SAFE_ID.test(m.stageId) ? m.stageId : '', focus: str(m.focus, 80)
    };
  });
  const seen = new Set(); members = members.filter(m => seen.has(m.id) ? false : (seen.add(m.id), true));
  const memberIds = new Set(members.map(m => m.id));
  const firstMember = members[0] ? members[0].id : 'me';
  const ownerMap = seedOwnerMap(), stageMap = seedStageMap();
  s.members = members; s.version = 4;

  /* 阶段路线图：缺失则用种子；保留自定义阶段 */
  let stages = Array.isArray(s.stages) ? s.stages.filter(x => x && typeof x === 'object') : [];
  if (!stages.length) stages = cloneSeed(SEED.stages);
  stages = stages.map((x, i) => ({ id: SAFE_ID.test(x.id) ? x.id : uid('s'), name: str(x.name, 30), sub: str(x.sub, 40), desc: str(x.desc, 160), order: Number.isFinite(x.order) ? x.order : i, phase: ['foundation', 'learn', 'project', 'compete'].includes(x.phase) ? x.phase : 'learn' }));
  stages.sort((a, b) => a.order - b.order);
  const stageIds = new Set(stages.map(x => x.id));
  s.stages = stages;
  members.forEach(m => { if (!stageIds.has(m.stageId)) m.stageId = stages[0] ? stages[0].id : ''; });

  s.modules = s.modules.filter(m => m && typeof m === 'object').map(m => {
    const id = SAFE_ID.test(m.id) ? m.id : uid('m');
    const ownerId = memberIds.has(m.ownerId) ? m.ownerId : (memberIds.has(ownerMap[id]) ? ownerMap[id] : firstMember);
    let stageId = stageIds.has(m.stageId) ? m.stageId : (stageIds.has(stageMap[id]) ? stageMap[id] : '');
    if (!stageId) { const mm = /阶段\s*([0-4])/.exec(m.stage || ''); stageId = stageIds.has('s' + (mm ? mm[1] : '1')) ? 's' + (mm ? mm[1] : '1') : (stages[0] ? stages[0].id : ''); }
    /* v2 扁平 tasks → v3 lessons 迁移，保留既有进度 */
    let lessons = Array.isArray(m.lessons) ? m.lessons
      : (Array.isArray(m.tasks) ? m.tasks.map(t => ({ id: t.id, title: t.title, done: t.done, ts: t.ts })) : []);
    lessons = lessons.filter(l => l && typeof l === 'object').map(cleanLesson);
    const projects = Array.isArray(m.projects) ? m.projects.filter(p => p && typeof p === 'object').map(cleanProject) : [];
    return {
      id, name: str(m.name, 30) || '未命名模块', color: SAFE_COLOR.test(m.color) ? m.color : '#35c46f', ownerId,
      priority: str(m.priority, 12), stageId, stage: str(m.stage, 24), goal: str(m.goal, 200), lessons, projects,
      catalogId: SAFE_ID.test(m.catalogId) ? m.catalogId : '', dir: ['vision', 'control', 'hardware', 'common'].includes(m.dir) ? m.dir : 'common'
    };
  });
  const mids = new Set(s.modules.map(m => m.id));
  const modOwner = {}; s.modules.forEach(m => { modOwner[m.id] = m.ownerId; });
  s.resources = s.resources.filter(r => r && typeof r === 'object').map(r => ({
    id: SAFE_ID.test(r.id) ? r.id : uid('r'),
    moduleId: mids.has(r.moduleId) ? r.moduleId : '',
    type: TYPES[r.type] ? r.type : 'doc', verified: !!r.verified, fav: !!r.fav,
    title: str(r.title, 60), author: str(r.author, 30),
    url: safeUrl(r.url), reason: str(r.reason, 200),
    tags: Array.isArray(r.tags) ? r.tags.slice(0, 6).map(t => str(t, 20)) : []
  }));
  s.checkins = s.checkins.filter(c => c && typeof c === 'object' && SAFE_DATE.test(c.date)).map(c => {
    const moduleId = mids.has(c.moduleId) ? c.moduleId : '';
    const memberId = memberIds.has(c.memberId) ? c.memberId : (modOwner[moduleId] || firstMember);
    return {
      id: SAFE_ID.test(c.id) ? c.id : uid('c'), date: c.date, moduleId, memberId,
      minutes: clamp(parseInt(c.minutes, 10) || 0, 1, 1440),
      note: str(c.note, 80), ts: Number(c.ts) || new Date(c.date + 'T20:00:00').getTime()
    };
  });
  /* 硬件装备：缺失则用种子；按 id 清洗，owner 校验 */
  let hardware = Array.isArray(s.hardware) ? s.hardware.filter(h => h && typeof h === 'object') : [];
  if (!hardware.length) hardware = cloneSeed(SEED.hardware);
  s.hardware = hardware.map(cleanHardware).map(h => Object.assign(h, { owner: memberIds.has(h.owner) ? h.owner : '', moduleIds: h.moduleIds.filter(x => mids.has(x)) }));
  s.createdAt = Number(s.createdAt) || Date.now();
  return s;
}

function makeLocalStore() {
  function readRaw() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (validState(s)) {
          if (s.version === 3 || s.version === 4) return sanitizeState(s);
          /* v2 → v4 升级：结构换成新种子（阶段 / 模块库主线 / 课时 / 项目 / 硬件），保留真实打卡 */
          const fresh = SEED.buildState();
          if (Array.isArray(s.checkins)) fresh.checkins = s.checkins;
          return sanitizeState(fresh);
        }
      }
    } catch (e) { }
    return sanitizeState(SEED.buildState());
  }
  let state = readRaw();
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { }
  return {
    mode: 'local',
    members: () => state.members.map(m => ({ id: m.id, name: m.name, role: m.role, color: m.color })),
    async login(id) {
      const m = state.members.find(x => x.id === id);
      if (!m) throw new Error('成员不存在');
      return { memberId: id };
    },
    async logout() { },
    async loadState() { state = readRaw(); return { state: sanitizeState(state), rev: 0 }; },
    async persist(s) { state = s; try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { throw new Error('浏览器存储不可用'); } return { rev: 0 }; },
    async renameMember(id, name) {
      const m = state.members.find(x => x.id === id);
      if (!m) throw new Error('成员不存在');
      const clean = String(name).trim().slice(0, 20);
      if (!clean) throw new Error('名称不能为空');
      m.name = clean;
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { throw new Error('浏览器存储不可用'); }
      return { member: { id: m.id, name: m.name, role: m.role, color: m.color } };
    }
  };
}

function makeServerStore(base, members) {
  let token = null, pub = members || [];
  async function api(path, method, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch(base + path, { method: method || 'GET', headers, body: body ? JSON.stringify(body) : undefined });
    let data = null; try { data = await res.json(); } catch (e) { }
    if (!res.ok) { const err = new Error((data && data.error) || ('请求失败 ' + res.status)); err.status = res.status; throw err; }
    return data;
  }
  return {
    mode: 'server',
    members: () => pub,
    async login(id) { const d = await api('/api/login', 'POST', { id }); token = d.token; return { memberId: d.memberId, token }; },
    async logout() { try { await api('/api/logout', 'POST'); } catch (e) { } token = null; },
    async loadState() { const d = await api('/api/state', 'GET'); return { state: sanitizeState(d.state), rev: d.rev }; },
    async persist(s) { const d = await api('/api/state', 'PUT', { state: s }); return { rev: d.rev }; },
    async renameMember(id, name) {
      const d = await api('/api/member', 'POST', { id, name });
      pub = pub.map(m => m.id === id ? Object.assign({}, m, { name: d.member.name }) : m);
      return d;
    },
    async ping() { const d = await api('/api/ping', 'GET'); pub = d.members || pub; return d; },
    setToken(t) { token = t; }
  };
}

function readSession() { try { const s = JSON.parse(localStorage.getItem(SESSION_KEY)); if (s && s.memberId && s.mode) return s; } catch (e) { } return null; }
function writeSession(s) { try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) { } }
function clearSession() { try { localStorage.removeItem(SESSION_KEY); } catch (e) { } }

function persist() {
  if (!store) return;
  if (store.mode === 'local') { store.persist(S).catch(e => toast(e.message || '保存失败', 'danger')); return; }
  dirty = true; setSync('pending');
  clearTimeout(saveTimer); saveTimer = setTimeout(flushSave, 350);
}
async function flushSave() {
  if (saving || !dirty || store.mode !== 'server') return;
  saving = true; setSync('saving');
  try { const { rev } = await store.persist(S); lastRev = rev; dirty = false; setSync('ok'); }
  catch (e) { setSync('error'); toast('同步失败：' + (e.message || '网络错误') + '，稍后自动重试', 'danger'); }
  finally { saving = false; }
}
function startPolling() { stopPolling(); pollTimer = setInterval(pollOnce, 4000); }
function stopPolling() { if (pollTimer) clearInterval(pollTimer); pollTimer = null; }
async function pollOnce() {
  if (!store || store.mode !== 'server' || !session) return;
  if (dirty) { if (!saving) flushSave(); return; }
  if (saving) return;
  if ($('#modalScrim').classList.contains('open')) return;
  const ae = document.activeElement;
  if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) return;
  try {
    const ping = await store.ping();
    if (ping.rev > lastRev) { const { state, rev } = await store.loadState(); S = state; lastRev = rev; renderAll(); setSync('ok'); }
  } catch (e) { setSync('error'); }
}
function setSync(st) {
  const el = $('#syncIndicator'); if (!el) return;
  if (!store || store.mode !== 'server') { el.style.display = 'none'; return; }
  el.style.display = '';
  const map = { ok: ['已同步', 'ok'], saving: ['同步中', 'saving'], pending: ['待同步', 'pending'], error: ['离线', 'error'] };
  const m = map[st] || map.ok;
  el.className = 'sync-indicator ' + m[1];
  el.innerHTML = '<span class="sync-dot"></span>' + m[0] + (st === 'ok' ? ' · r' + lastRev : '');
}

const me = () => (S && session && S.members.find(m => m.id === session.memberId)) || (S && S.members[0]) || { id: 'me', name: '我', role: '', color: '#35c46f' };
const memberById = id => (S && S.members.find(m => m.id === id)) || { id: '', name: '未知', role: '', color: '#6f8272' };
const myModules = () => S.modules.filter(m => m.ownerId === me().id);
const modulesOf = id => S.modules.filter(m => m.ownerId === id);
const myCheckins = () => S.checkins.filter(c => c.memberId === me().id);
const checkinsOf = id => S.checkins.filter(c => c.memberId === id);
const canEdit = m => m.ownerId === me().id;
const modById = id => S.modules.find(m => m.id === id) || { id: '', name: '未分类', color: '#6f8272', ownerId: '', priority: '—', stageId: '', stage: '', goal: '', lessons: [], projects: [] };
const stageById = id => (S.stages || []).find(s => s.id === id) || null;
const stageName = id => { const s = stageById(id); return s ? s.name : ''; };
const milesOf = m => (m.projects || []).reduce((a, p) => a.concat(p.milestones || []), []);
const modProgress = m => {
  const ls = m.lessons || [], ms = milesOf(m);
  const ld = ls.filter(x => x.done).length, md = ms.filter(x => x.done).length;
  const total = ls.length + ms.length, done = ld + md;
  return { total, done, pct: total ? Math.round(done / total * 100) : 0, lTotal: ls.length, lDone: ld, mTotal: ms.length, mDone: md };
};
function progressOf(list) {
  let t = 0, d = 0, lt = 0, ld = 0, mt = 0, md = 0;
  list.forEach(m => { const p = modProgress(m); t += p.total; d += p.done; lt += p.lTotal; ld += p.lDone; mt += p.mTotal; md += p.mDone; });
  return { total: t, done: d, pct: t ? Math.round(d / t * 100) : 0, lTotal: lt, lDone: ld, mTotal: mt, mDone: md };
}
const overall = () => progressOf(S.modules);
/* 下一节未完成的课：按阶段路线序（基础→技能→项目→比赛）推进，同阶段内保留拖动排序 */
function nextLesson(list) {
  const src = list || S.modules;
  const ordered = src.map((m, i) => ({ m, i, o: (stageById(m.stageId) || {}).order }))
    .sort((a, b) => ((Number.isFinite(a.o) ? a.o : 99) - (Number.isFinite(b.o) ? b.o : 99)) || (a.i - b.i));
  for (const { m } of ordered) {
    const l = (m.lessons || []).find(x => !x.done);
    if (l) return { module: m, lesson: l };
    for (const p of (m.projects || [])) { const ms = (p.milestones || []).find(x => !x.done); if (ms) return { module: m, project: p, milestone: ms }; }
  }
  return null;
}
function stageStats(sid, list) {
  const mods = (list || S.modules).filter(m => m.stageId === sid);
  const p = progressOf(mods);
  return { mods, total: mods.length, pct: p.pct, done: mods.filter(m => { const x = modProgress(m); return x.total && x.done === x.total; }).length };
}
function minutesByDay(list) { const map = {}; (list || S.checkins).forEach(c => { map[c.date] = (map[c.date] || 0) + c.minutes; }); return map; }
function streak(list) { const map = minutesByDay(list); let n = 0, d = today(); if (!map[d]) d = addDays(d, -1); while (map[d]) { n++; d = addDays(d, -1); } return n; }
function bestStreak(list) { const dates = [...new Set((list || S.checkins).map(c => c.date))].sort(); let best = 0, cur = 0, prev = null; for (const d of dates) { cur = (prev && addDays(prev, 1) === d) ? cur + 1 : 1; best = Math.max(best, cur); prev = d; } return best; }
const activeDays = list => Object.keys(minutesByDay(list)).length;
const totalMinutes = list => (list || S.checkins).reduce((a, c) => a + c.minutes, 0);
function weekMinutes(list) { const map = minutesByDay(list), t = today(); let s = 0; for (let i = 0; i < 7; i++) s += map[addDays(t, -i)] || 0; return s; }
const todayEntries = list => (list || S.checkins).filter(c => c.date === today());
const modMinutes = id => S.checkins.filter(c => c.moduleId === id).reduce((a, c) => a + c.minutes, 0);
const modResCount = id => S.resources.filter(r => r.moduleId === id).length;
function lastCheckin(list) { const l = list || S.checkins; if (!l.length) return null; return l.reduce((a, c) => c.ts > a.ts ? c : a, l[0]); }

function toast(msg, type, undoFn) {
  type = type || 'ok';
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  const ic = { ok: 'check', warn: 'alert', danger: 'alert', info: 'info' }[type] || 'info';
  el.innerHTML = icon(ic) + '<span class="msg">' + esc(msg) + '</span>' + (undoFn ? '<button class="undo-btn" type="button">撤销</button>' : '');
  $('#toastWrap').appendChild(el);
  const life = undoFn ? 6000 : 3800;
  const timer = setTimeout(() => dismiss(), life);
  function dismiss() { clearTimeout(timer); el.classList.add('out'); setTimeout(() => el.remove(), 260); }
  if (undoFn) el.querySelector('.undo-btn').addEventListener('click', () => { undoFn(); dismiss(); });
  while ($('#toastWrap').children.length > 3) $('#toastWrap').firstChild.remove();
}

function openModal(html) { $('#modal').innerHTML = html; $('#modalScrim').classList.add('open'); const f = $('#modal').querySelector('input,select,textarea'); if (f) setTimeout(() => f.focus(), 60); }
function closeModal() { $('#modalScrim').classList.remove('open'); ui.confirmFn = null; }
function openConfirm(opt) {
  ui.confirmFn = opt.onOk;
  openModal('<h3>' + icon('alert') + esc(opt.title) + '</h3><p class="msub">' + esc(opt.sub || '此操作不可自动恢复') + '</p>' +
    '<p class="confirm-text">' + opt.text + '</p>' +
    '<div class="modal-actions"><button class="btn" type="button" data-action="modal-close">取消</button>' +
    '<button class="btn ' + (opt.danger ? 'danger' : 'primary') + '" type="button" data-action="confirm-ok">' + esc(opt.okLabel || '确认') + '</button></div>');
}
function openDrawer(id) { ui.drawerMod = id; renderDrawer(); $('#drawer').classList.add('open'); $('#drawerScrim').classList.add('open'); }
function closeDrawer() { ui.drawerMod = null; $('#drawer').classList.remove('open'); $('#drawerScrim').classList.remove('open'); }

function switchView(v) {
  ui.view = v;
  $$('.view').forEach(s => s.classList.toggle('active', s.id === 'view-' + v));
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === v));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── 登录 / 会话 ── */
function showLogin() {
  stopPolling(); session = null;
  renderLogin();
  $('#loginOverlay').classList.add('open');
  document.body.classList.add('locked');
}
function enterApp() {
  writeSession(session);
  $('#loginOverlay').classList.remove('open');
  document.body.classList.remove('locked');
  ui.progFilter = 'mine'; ui.progStage = 'all'; ui.selModule = null;
  renderAll(); switchView('checkin');
  if (store.mode === 'server') { setSync('ok'); startPolling(); }
}
function renderLogin() {
  const members = store.members();
  $('#loginMode').innerHTML = store.mode === 'server'
    ? icon('wifi') + '局域网同步模式 · 三人共享一份团队数据'
    : icon('database') + '本机离线模式 · 数据存于当前浏览器';
  $('#loginMembers').innerHTML = members.map(m =>
    '<div class="login-member" style="--mc:' + m.color + '" data-id="' + m.id + '">' +
    '<button type="button" class="lm-enter" data-action="login-enter" data-id="' + m.id + '" title="以「' + esc(m.name) + '」身份进入工作台">' +
    '<span class="lm-avatar">' + esc(m.name.slice(0, 1)) + '</span>' +
    '<span class="lm-info"><b>' + esc(m.name) + '</b><small>' + esc(m.role) + '</small></span>' +
    '<span class="lm-go">' + icon('arrow') + '</span></button>' +
    '<button type="button" class="lm-edit" data-action="rename-member" data-id="' + m.id + '" title="编辑名称" aria-label="编辑「' + esc(m.name) + '」的名称">' + icon('edit') + '</button>' +
    '</div>').join('');
  $('#loginHint').innerHTML = '点击成员卡片即可<b>直接进入</b>，无需密码；卡片右侧铅笔可自定义名称。' +
    (store.mode === 'local' ? '<br>本机模式三人共用此浏览器切换身份；要真正多机同步，请在文件夹运行 <b>node server.js</b>，再用局域网地址访问。' : '');
  $('#loginError').textContent = '';
}
function loginError(msg) { const el = $('#loginError'); el.textContent = msg; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
async function enterAs(id, btn) {
  if (!id) { loginError('请选择一个成员身份'); return; }
  if (!store.members().some(m => m.id === id)) { loginError('成员不存在'); return; }
  const card = btn ? btn.closest('.login-member') : null;
  if (card) card.classList.add('entering');
  try {
    const r = await store.login(id);
    session = { mode: store.mode, memberId: r.memberId, token: r.token || null };
    const { state, rev } = await store.loadState(); S = state; lastRev = rev || 0;
    enterApp();
    toast('欢迎回来，' + me().name + '！', 'ok');
  } catch (e) { loginError(e.message || '进入失败'); }
  finally { if (card) card.classList.remove('entering'); }
}
async function doLogout() {
  stopPolling(); toggleMenu(false);
  if (store.mode === 'server') { try { await store.logout(); } catch (e) { } }
  clearSession(); closeDrawer(); closeModal();
  S = null; showLogin();
}
function toggleMenu(force) { ui.menuOpen = force !== undefined ? force : !ui.menuOpen; const el = $('#memberMenu'); if (el) el.classList.toggle('open', ui.menuOpen); }
function renderMemberMenu() {
  const m = me();
  $('#memberMenu').innerHTML =
    '<div class="mm-head"><span class="mem-avatar" style="--mc:' + m.color + '">' + esc(m.name.slice(0, 1)) + '</span><div><b>' + esc(m.name) + '</b><small>' + esc(m.role) + '</small></div></div>' +
    '<button class="mm-item" type="button" data-action="switch-member">' + icon('users') + '切换身份</button>' +
    '<button class="mm-item" type="button" data-action="rename-member" data-id="' + m.id + '">' + icon('edit') + '编辑名称</button>' +
    '<div class="mm-sep"></div>' +
    '<button class="mm-item danger" type="button" data-action="logout">' + icon('logout') + '退出登录</button>';
}
const NAME_PRESETS = ['我', '队员一', '队员二', '队长'];
function renameForm(id) {
  const m = store.members().find(x => x.id === id) || (S && S.members.find(x => x.id === id));
  if (!m) { toast('成员不存在', 'warn'); return; }
  ui.renameId = id;
  openModal('<h3>' + icon('edit') + '编辑名称</h3>' +
    '<p class="msub">' + esc(m.role || '团队成员') + ' · 名称会显示在打卡、进度与团队视图</p>' +
    '<div class="rename-preview" style="--mc:' + m.color + '"><span class="mem-avatar lg" id="renameAvatar">' + esc(m.name.slice(0, 1)) + '</span>' +
    '<div class="rename-pv-text"><b id="renamePvName">' + esc(m.name) + '</b><small>头像取名称首字</small></div></div>' +
    '<label class="fld"><span>显示名称 *（最多 20 字）</span>' +
    '<input type="text" id="fName" maxlength="20" value="' + esc(m.name) + '" autocomplete="off" placeholder="例如：我 / 队员一"></label>' +
    '<div class="name-chips">' + NAME_PRESETS.map(n => '<button type="button" class="name-chip" data-action="name-preset" data-name="' + esc(n) + '">' + esc(n) + '</button>').join('') + '</div>' +
    '<div class="modal-actions"><button class="btn" type="button" data-action="modal-close">取消</button>' +
    '<button class="btn primary" type="button" data-action="save-rename" data-id="' + id + '">' + icon('check') + '保存名称</button></div>');
  const inp = $('#fName');
  inp.addEventListener('input', () => {
    const v = inp.value.trim() || m.name;
    $('#renameAvatar').textContent = v.slice(0, 1);
    $('#renamePvName').textContent = v;
  });
  setTimeout(() => { inp.focus(); inp.select(); }, 70);
}
async function saveRename(id) {
  const inp = $('#fName'); if (!inp) return;
  const name = inp.value.trim();
  if (!name) { toast('名称不能为空', 'warn'); inp.focus(); return; }
  if (name.length > 20) { toast('名称最多 20 字', 'warn'); return; }
  const btn = $('#modal [data-action="save-rename"]'); if (btn) btn.disabled = true;
  try {
    const r = await store.renameMember(id, name);
    if (store.mode === 'server' && r && typeof r.rev === 'number') lastRev = r.rev;
    if (S) { const mm = S.members.find(x => x.id === id); if (mm) mm.name = name; }
    closeModal();
    if ($('#loginOverlay').classList.contains('open')) renderLogin(); else renderAll();
    toast('名称已更新为「' + name + '」', 'ok');
  } catch (e) { toast(e.message || '保存失败', 'danger'); if (btn) btn.disabled = false; }
}

/* ═══════════ 渲染 ═══════════ */
function renderNav() {
  const tabs = [
    { v: 'checkin', ic: 'calendar', lb: '今日打卡', cnt: todayEntries(myCheckins()).length },
    { v: 'progress', ic: 'layers', lb: '学习进度', cnt: S.modules.length },
    { v: 'catalog', ic: 'box', lb: '模块库', cnt: SEED.catalog.length },
    { v: 'hardware', ic: 'chip', lb: '硬件装备', cnt: (S.hardware || []).filter(h => !h.owned).length },
    { v: 'team', ic: 'users', lb: '团队监督', cnt: S.members.length },
    { v: 'library', ic: 'book', lb: '资料库', cnt: S.resources.length },
    { v: 'data', ic: 'database', lb: '数据', cnt: '' }
  ];
  $('#nav').innerHTML = tabs.map(t =>
    '<button class="tab' + (ui.view === t.v ? ' active' : '') + '" type="button" data-action="nav" data-view="' + t.v + '">' +
    icon(t.ic) + t.lb + (t.cnt !== '' ? '<span class="cnt">' + t.cnt + '</span>' : '') + '</button>').join('');
}
function renderHeader() {
  const d = new Date();
  $('#todayChip').textContent = d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 · 周' + WEEKCN[d.getDay()];
  const st = streak(myCheckins());
  const chip = $('#streakChip');
  chip.innerHTML = icon('flame') + '<span>' + st + ' 天</span>';
  chip.classList.toggle('hot', st >= 3);
  chip.title = '我的连续打卡 ' + st + ' 天 · 历史最佳 ' + bestStreak(myCheckins()) + ' 天';
  const m = me(), mc = $('#memberChip');
  mc.style.setProperty('--mc', m.color);
  mc.innerHTML = '<span class="mem-avatar">' + esc(m.name.slice(0, 1)) + '</span><span class="mem-name">' + esc(m.name) + '</span>' + icon('chevron');
  setSync(dirty ? 'pending' : 'ok');
}

/* ── 视图 1 ── */
function renderCheckin() {
  const ck = myCheckins(), entries = todayEntries(ck), mins = entries.reduce((a, c) => a + c.minutes, 0);
  const pad = $('#padBtn');
  pad.classList.toggle('done', entries.length > 0);
  pad.innerHTML = entries.length ? icon('check') + '已打卡<small>+ 再记一笔</small>' : icon('zap') + '打卡<small>CHECK IN</small>';
  $('#padStatus').innerHTML = entries.length
    ? '今日已记录 <b>' + entries.length + '</b> 笔 · 共 <b>' + mins + '</b> 分钟'
    : esc(me().name) + '，今天还没有记录<br>选个模块，按下焊盘开始签到';
  const st = streak(ck), total = totalMinutes(ck), wk = weekMinutes(ck);
  const tiles = [
    { lb: '连续打卡', ic: 'flame', v: st, u: '天', sub: '历史最佳 ' + bestStreak(ck) + ' 天', c: 'rgba(240,180,41,.16)', s: '#f0b429' },
    { lb: '累计打卡', ic: 'calendar', v: activeDays(ck), u: '天', sub: '共 ' + ck.length + ' 条记录', c: 'rgba(53,196,111,.15)', s: '#35c46f' },
    { lb: '总学习时长', ic: 'clock', v: (total / 60).toFixed(1), u: 'h', sub: total + ' 分钟投入', c: 'rgba(77,163,255,.15)', s: '#4da3ff' },
    { lb: '近 7 天', ic: 'chart', v: (wk / 60).toFixed(1), u: 'h', sub: '日均 ' + Math.round(wk / 7) + ' 分钟', c: 'rgba(224,95,208,.14)', s: '#e05fd0' }
  ];
  $('#statGrid').innerHTML = tiles.map(x =>
    '<div class="stat-tile" style="--tile-c:' + x.c + ';--tile-solid:' + x.s + '">' +
    '<div class="lb">' + icon(x.ic) + x.lb + '</div><div class="vl">' + x.v + '<small>' + x.u + '</small></div><div class="sub">' + x.sub + '</div></div>').join('');
  $('#formTitle').innerHTML = icon('edit') + '记录一笔学习<span class="hint">以 ' + esc(me().name) + ' 身份打卡 · 一天可多次</span>';
  renderModChips();
  $('#submitBtn').innerHTML = icon('check') + '打卡签到';
  $('#hmTitle').innerHTML = icon('chart') + '我的学习热力图<span class="hint">最近 26 周 · 颜色越亮投入越多</span>';
  $('#weekTitle').innerHTML = icon('calendar') + '本周节奏<span class="hint">近 7 天分钟数</span>';
  $('#logTitle').innerHTML = icon('clock') + '我的最近记录<span class="hint">共 ' + ck.length + ' 条</span>';
  renderHeatmap(); renderWeekBars(); renderLog();
}
function renderModChips() {
  const mine = myModules();
  if (!ui.selModule || !S.modules.some(m => m.id === ui.selModule)) ui.selModule = (mine[0] || S.modules[0] || {}).id || null;
  const ordered = [...S.modules].sort((a, b) => (b.ownerId === me().id ? 1 : 0) - (a.ownerId === me().id ? 1 : 0));
  $('#modChips').innerHTML = ordered.length
    ? ordered.map(m => {
      const owner = memberById(m.ownerId);
      return '<button type="button" role="radio" aria-checked="' + (m.id === ui.selModule) + '" class="mod-chip' + (m.id === ui.selModule ? ' active' : '') + '" style="--mc:' + m.color + '" data-action="pick-module" data-id="' + m.id + '" title="负责人：' + esc(owner.name) + '"><span class="dot"></span>' + esc(m.name) + (m.ownerId !== me().id ? '<span class="chip-owner" style="--oc:' + owner.color + '">' + esc(owner.name.slice(0, 1)) + '</span>' : '') + '</button>';
    }).join('')
    : '<span class="empty" style="padding:8px">还没有模块，先去「学习进度」创建一个。</span>';
}
function renderHeatmap() {
  const map = minutesByDay(myCheckins()), t = today(), weeks = 26;
  const startRaw = addDays(t, -(weeks * 7 - 1));
  const dow = (new Date(startRaw + 'T12:00:00').getDay() + 6) % 7;
  const start = addDays(startRaw, -dow);
  const totalDays = Math.round((new Date(t + 'T12:00:00') - new Date(start + 'T12:00:00')) / 86400000) + 1;
  const cols = Math.ceil(totalDays / 7);
  let monthHtml = '', lastMonth = -1; const cells = [];
  for (let c = 0; c < cols; c++) {
    const mo = new Date(addDays(start, c * 7) + 'T12:00:00').getMonth();
    if (mo !== lastMonth) { monthHtml += '<span style="left:' + (c * 16) + 'px">' + (mo + 1) + '月</span>'; lastMonth = mo; }
    for (let r = 0; r < 7; r++) {
      const date = addDays(start, c * 7 + r);
      if (date > t) { cells.push('<span class="hm-cell future"></span>'); continue; }
      const m = map[date] || 0;
      const lvl = m === 0 ? 0 : m < 45 ? 1 : m < 75 ? 2 : m < 120 ? 3 : 4;
      cells.push('<span class="hm-cell' + (lvl ? ' l' + lvl : '') + (date === t ? ' today' : '') + '" title="' + date + ' · ' + (m ? m + ' 分钟' : '未打卡') + '"></span>');
    }
  }
  $('#heatmap').innerHTML =
    '<div class="hm-weeklabels"><span>一</span><span></span><span>三</span><span></span><span>五</span><span></span><span>日</span></div>' +
    '<div class="hm-main"><div class="hm-months">' + monthHtml + '</div><div class="hm-grid">' + cells.join('') + '</div></div>';
}
function renderWeekBars() {
  const map = minutesByDay(myCheckins()), t = today(); let max = 60; const arr = [];
  for (let i = 6; i >= 0; i--) { const d = addDays(t, -i); const m = map[d] || 0; arr.push({ d, m }); max = Math.max(max, m); }
  $('#weekBars').innerHTML = arr.map(x => {
    const h = Math.max(Math.round(x.m / max * 100), 2);
    const dow = WEEKCN[new Date(x.d + 'T12:00:00').getDay()];
    return '<div class="wb-col' + (x.d === t ? ' today' : '') + '"><span class="wb-v">' + (x.m || '') + '</span><div class="wb-bar" style="height:' + h + '%"></div><span class="wb-d">' + (x.d === t ? '今天' : dow) + '</span></div>';
  }).join('');
}
function renderLog() {
  const list = [...myCheckins()].sort((a, b) => b.ts - a.ts).slice(0, 20);
  if (!list.length) { $('#logList').innerHTML = '<div class="empty">' + icon('calendar') + '<b>还没有打卡记录</b>点击上方焊盘按钮，开始第一天。</div>'; return; }
  $('#logList').innerHTML = list.map(c => {
    const m = modById(c.moduleId), d = new Date(c.date + 'T12:00:00');
    return '<div class="log-item">' +
      '<span class="li-date"><b>' + c.date.slice(5) + '</b>周' + WEEKCN[d.getDay()] + '</span>' +
      '<span class="li-mod"><span class="dot" style="background:' + m.color + ';color:' + m.color + '"></span>' + esc(m.name) + '</span>' +
      '<span class="li-note">' + esc(c.note || '—') + '</span>' +
      '<span class="li-min">+' + c.minutes + ' min</span>' +
      '<button class="btn icon ghost li-del" type="button" data-action="del-checkin" data-id="' + c.id + '" title="删除记录">' + icon('trash') + '</button></div>';
  }).join('');
}

/* ── 视图 2 · 学习进度（阶段路线图 + 课时 + 项目里程碑） ── */
const STAGE_COLORS = ['var(--info)', 'var(--warn)', 'var(--ok)', 'var(--magenta)', 'var(--violet)'];
const stageColor = i => STAGE_COLORS[i % STAGE_COLORS.length];
const PHASE_SHORT = { foundation: '打基础', learn: '学技能', project: '做项目', compete: '打比赛' };

function renderRoadmap() {
  const el = $('#roadmap'); if (!el) return;
  const list = ui.progFilter === 'mine' ? myModules() : S.modules;
  const stages = S.stages || [], myStage = me().stageId;
  el.innerHTML =
    '<div class="rm-head">' + icon('layers') + '学习路线图<span class="hint">点击阶段卡片筛选下方模块 · 再点一次看全部 · 描边为我的当前阶段</span></div>' +
    '<div class="rm-track">' + stages.map((s, i) => {
      const st = stageStats(s.id, list);
      const complete = st.total > 0 && st.done === st.total;
      const isCur = s.id === myStage;
      const selected = ui.progStage === s.id;
      return '<div class="rm-stage' + (isCur ? ' current' : '') + (complete ? ' complete' : '') + (selected ? ' selected' : '') + '" style="--sc:' + stageColor(i) + '" role="button" tabindex="0" aria-pressed="' + selected + '" data-action="stage-filter" data-id="' + s.id + '" title="' + esc(s.desc) + '（点击筛选该阶段模块）">' +
        '<span class="rm-node"><span class="rm-idx">' + (complete ? icon('check') : i) + '</span></span>' +
        '<span class="rm-body"><span class="rm-phase">' + esc(PHASE_SHORT[s.phase] || '') + '</span><span class="rm-name">' + esc(s.name) + '</span><span class="rm-sub">' + esc(s.sub) + '</span>' +
        '<span class="rm-bar"><i style="width:' + st.pct + '%"></i></span>' +
        '<span class="rm-meta">' + st.done + '/' + st.total + ' 模块通关 · ' + st.pct + '%</span>' +
        '<span class="rm-foot">' + (isCur
          ? '<span class="rm-cur-tag">' + icon('check') + '我的当前阶段' + '</span>'
          : '<button class="rm-setcur" type="button" data-action="focus-stage" data-id="' + s.id + '" title="把「' + esc(s.name) + '」标记为我的当前阶段">' + icon('target') + '设为当前</button>') + '</span>' +
        '</span></div>';
    }).join('') + '</div>';
}
function renderFocus() {
  const el = $('#focusCard'); if (!el) return;
  const mine = ui.progFilter === 'mine', list = mine ? myModules() : S.modules;
  const nx = nextLesson(list);
  if (!nx) {
    el.innerHTML = '<div class="focus-done">' + icon('check') + '<div><b>' + (mine ? '我的' : '全队') + '课程与里程碑已全部完成！</b><span>进入竞赛冲刺：真题演练 + 联调 + 开源答辩 + 报告整理。</span></div></div>';
    return;
  }
  const m = nx.module, owner = memberById(m.ownerId), isLesson = !!nx.lesson;
  const title = isLesson ? nx.lesson.title : (nx.project.name + ' · ' + nx.milestone.title);
  const url = isLesson ? nx.lesson.url : nx.project.url;
  el.innerHTML =
    '<div class="focus-icon" style="--mc:' + m.color + '">' + icon(isLesson ? 'play' : 'target') + '</div>' +
    '<div class="focus-main"><div class="focus-lb">' + icon('zap') + (mine ? '我的下一步' : '全队下一步') + ' · ' + esc(stageName(m.stageId) || '未分阶段') + '</div>' +
    '<div class="focus-title">' + esc(title) + '</div>' +
    '<div class="focus-mod"><span class="dot" style="background:' + m.color + ';color:' + m.color + '"></span>' + esc(m.name) + ' · 负责人 ' + esc(owner.name) + (isLesson && nx.lesson.dur ? ' · ' + esc(nx.lesson.dur) : '') + (isLesson && nx.lesson.author ? ' · ' + esc(nx.lesson.author) : '') + '</div></div>' +
    '<div class="focus-act">' + (url ? '<a class="btn primary sm" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + icon('play') + '看这节课</a>' : '') +
    '<button class="btn sm" type="button" data-action="open-drawer" data-id="' + m.id + '">模块详情' + icon('arrow') + '</button></div>';
}
function lessonDots(m, editable) {
  const ls = m.lessons || []; if (!ls.length) return '';
  return '<div class="lesson-dots" role="group" aria-label="课时进度">' + ls.map((l, i) =>
    '<button type="button" class="ldot' + (l.done ? ' done' : '') + (editable ? '' : ' static') + '" ' +
    (editable ? 'data-action="toggle-lesson" data-mid="' + m.id + '" data-lid="' + l.id + '" aria-pressed="' + l.done + '"' : 'disabled') +
    ' title="' + esc('第' + (i + 1) + '课 · ' + l.title + (l.done ? '（已完成）' : '')) + '"></button>').join('') + '</div>';
}
function nextLine(m) {
  const l = (m.lessons || []).find(x => !x.done);
  if (l) return '<div class="mc-next">' + icon('play') + '<span class="nx-lb">下一课</span><span class="nx-t">' + esc(l.title) + '</span>' +
    (l.url ? '<a class="nx-link" href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer" title="打开课程视频" aria-label="打开课程视频">' + icon('external') + '</a>' : '') + '</div>';
  const p = (m.projects || []).find(pp => (pp.milestones || []).some(x => !x.done));
  if (p) { const ms = p.milestones.find(x => !x.done); return '<div class="mc-next proj">' + icon('target') + '<span class="nx-lb">下一步</span><span class="nx-t">' + esc(p.name) + ' · ' + esc(ms.title) + '</span></div>'; }
  if ((m.lessons || []).length || (m.projects || []).length) return '<div class="mc-next done">' + icon('check') + '<span class="nx-t">本模块已全部完成</span></div>';
  return '';
}
function projMini(m, p, editable) {
  const ms = p.milestones || [], done = ms.filter(x => x.done).length;
  return '<div class="proj-mini">' +
    '<div class="pm-head"><span class="pm-name">' + icon('wrench') + esc(p.name) + '</span><span class="pm-pct">' + done + '/' + ms.length + '</span></div>' +
    '<div class="pm-seg">' + ms.map((x, i) =>
      '<button type="button" class="pm-node' + (x.done ? ' done' : '') + (editable ? '' : ' static') + '" ' +
      (editable ? 'data-action="toggle-milestone" data-mid="' + m.id + '" data-pid="' + p.id + '" data-msid="' + x.id + '" aria-pressed="' + x.done + '"' : 'disabled') +
      ' title="' + esc('里程碑' + (i + 1) + ' · ' + x.title + (x.done ? '（已完成）' : '')) + '"></button>').join('') + '</div></div>';
}
function renderProgress() {
  const mine = ui.progFilter === 'mine';
  const list = mine ? myModules() : S.modules;
  const stage = (ui.progStage !== 'all' && stageById(ui.progStage)) ? ui.progStage : 'all';
  const gridList = stage === 'all' ? list : list.filter(m => m.stageId === stage);
  const o = progressOf(list);
  const C = 2 * Math.PI * 46;
  const doneMods = list.filter(m => { const p = modProgress(m); return p.total && p.done === p.total; }).length;
  const hours = totalMinutes(mine ? myCheckins() : S.checkins);
  renderRoadmap(); renderFocus();
  $('#progressSummary').innerHTML =
    '<div class="ring-wrap"><svg width="108" height="108" viewBox="0 0 108 108">' +
    '<defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--copper-bright)"/><stop offset="1" style="stop-color:var(--mask-bright)"/></linearGradient></defs>' +
    '<circle class="ring-bg" cx="54" cy="54" r="46"/><circle class="ring-fg" cx="54" cy="54" r="46" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - o.pct / 100)).toFixed(1) + '"/></svg>' +
    '<div class="ring-txt"><b>' + o.pct + '%</b><span>' + (mine ? '我的进度' : '全队进度') + '</span></div></div>' +
    '<div class="ps-stats">' +
    '<div class="ps-stat"><div class="n">' + list.length + '</div><div class="l">' + (mine ? '我负责模块' : '学习模块') + '</div></div>' +
    '<div class="ps-stat"><div class="n">' + o.lDone + ' / ' + o.lTotal + '</div><div class="l">课时完成</div></div>' +
    '<div class="ps-stat"><div class="n">' + o.mDone + ' / ' + o.mTotal + '</div><div class="l">项目里程碑</div></div>' +
    '<div class="ps-stat"><div class="n">' + doneMods + '</div><div class="l">通关模块</div></div>' +
    '<div class="ps-stat"><div class="n">' + fmtH(hours) + '</div><div class="l">' + (mine ? '我的投入' : '全队投入') + '</div></div></div>' +
    '<div class="milestone"><b>' + icon('target') + '路线主线 · 先学技能 → 配套项目 → 整车整合 → 竞赛冲刺</b>视觉走马观碑（龙芯）+ 控制串级 PID + 硬件四层板三线并进；电赛与智能车真题在冲刺阶段合流，作品须开源。</div>';
  $('#progFilterChips').innerHTML =
    '<button class="chip' + (mine ? ' active' : '') + '" type="button" data-action="prog-filter" data-filter="mine">' + icon('user') + '我的（' + myModules().length + '）</button>' +
    '<button class="chip' + (!mine ? ' active' : '') + '" type="button" data-action="prog-filter" data-filter="all">' + icon('users') + '全队（' + S.modules.length + '）</button>';
  const stages = S.stages || [];
  $('#progStageChips').innerHTML =
    '<span class="psc-lb">' + icon('filter') + '按阶段</span>' +
    '<button class="chip' + (stage === 'all' ? ' active' : '') + '" type="button" data-action="prog-stage" data-id="all">' + icon('layers') + '全部阶段（' + list.length + '）</button>' +
    stages.map((s, i) => {
      const n = list.filter(m => m.stageId === s.id).length;
      return '<button class="chip' + (stage === s.id ? ' active' : '') + '" type="button" data-action="prog-stage" data-id="' + s.id + '"><span class="dot" style="background:' + stageColor(i) + '"></span>' + esc(s.name) + '（' + n + '）</button>';
    }).join('');
  $('#modCountBadge').innerHTML = icon('layers') + ' ' + gridList.length + ' 个模块' + (stage !== 'all' ? ' · ' + esc(stageName(stage)) : '') + (mine ? ' · 我负责，可编辑' : ' · 拖动 ⋮⋮ 调整顺序');
  $('#addModuleBtn').innerHTML = icon('plus') + '新建模块';
  const gcb = $('#gotoCatalogBtn'); if (gcb) gcb.innerHTML = icon('box') + '从模块库添加';
  $('#moduleGrid').innerHTML = gridList.length ? gridList.map(m => {
    const p = modProgress(m), owner = memberById(m.ownerId), editable = canEdit(m);
    const projs = m.projects || [];
    return '<article class="mod-card' + (editable ? '' : ' readonly') + '" style="--mc:' + m.color + '" data-id="' + m.id + '">' +
      '<div class="mc-head">' +
      (editable ? '<span class="mc-drag" draggable="true" data-drag="' + m.id + '" title="拖动排序">' + icon('grip') + '</span>' : '<span class="mc-drag disabled" title="仅负责人可排序">' + icon('grip') + '</span>') +
      '<div class="mc-title"><h3>' + esc(m.name) + ' <span class="badge copper">' + esc(m.priority) + '</span></h3>' +
      '<span class="mc-stage-chip" style="--sc:' + stageColor((S.stages || []).findIndex(s => s.id === m.stageId)) + '">' + esc(stageName(m.stageId) || m.stage || '未分阶段') + '</span>' +
      '<span class="mc-owner" style="--oc:' + owner.color + '"><span class="dot"></span>' + esc(owner.name) + (editable ? ' · 我负责' : ' · 只读') + '</span></div>' +
      '<div class="mc-actions">' +
      '<button class="btn icon ghost" type="button" data-action="open-drawer" data-id="' + m.id + '" title="模块详情">' + icon('chevron') + '</button>' +
      (editable ? '<button class="btn icon ghost" type="button" data-action="edit-module" data-id="' + m.id + '" title="编辑模块">' + icon('edit') + '</button>' +
        '<button class="btn icon ghost" type="button" data-action="del-module" data-id="' + m.id + '" title="删除模块">' + icon('trash') + '</button>' : '') +
      '</div></div>' +
      '<div class="mc-progress"><div class="mc-bar-row"><div class="mc-bar"><div class="mc-bar-fill" style="width:' + p.pct + '%"></div></div><span class="mc-pct">' + p.pct + '%</span></div>' +
      '<div class="mc-count">' + icon('play') + '课时 ' + p.lDone + '/' + p.lTotal + ' <span class="mc-sep">·</span> ' + icon('wrench') + '里程碑 ' + p.mDone + '/' + p.mTotal + '</div></div>' +
      (m.goal ? '<p class="mc-goal">' + esc(m.goal) + '</p>' : '') +
      '<div class="mc-curric">' +
      (p.lTotal ? '<div class="mc-lessons"><div class="mcc-lb">' + icon('play') + '课程进度<span class="mcc-n">' + p.lDone + '/' + p.lTotal + '</span></div>' + lessonDots(m, editable) + '</div>' : '') +
      nextLine(m) +
      (projs.length ? '<div class="mc-projects"><div class="mcc-lb">' + icon('wrench') + '练手项目<span class="mcc-n">' + projs.length + ' 个</span></div>' + projs.map(pp => projMini(m, pp, editable)).join('') + '</div>' : '') +
      (editable ? '' : '<div class="task-readonly-note">' + icon('lock') + '由 ' + esc(owner.name) + ' 负责 · 进度只读，可在「团队监督」查看</div>') +
      '</div>' +
      '<div class="mc-foot"><button class="btn sm" type="button" data-action="goto-lib" data-id="' + m.id + '">' + icon('book') + '资料 ' + modResCount(m.id) + '</button><span style="flex:1"></span>' +
      '<button class="btn sm ghost" type="button" data-action="open-drawer" data-id="' + m.id + '">课程表 ' + icon('arrow') + '</button></div></article>';
  }).join('') : '<div class="card empty" style="grid-column:1/-1">' + icon('layers') + '<b>' + (stage !== 'all' ? '「' + esc(stageName(stage)) + '」阶段暂无' + (mine ? '我负责的' : '') + '模块' : (mine ? '你还没有负责的模块' : '还没有学习模块')) + '</b>' + (stage !== 'all' ? '点上方「全部阶段」查看其它阶段，或从模块库为该阶段添加内容。' : (mine ? '切换到「全队」查看，或点击「新建模块」创建并指派负责人。' : '点击「新建模块」，规划第一个学习部分。')) + '</div>';
}

/* ── 视图 · 硬件装备板（已有 + 主流分工待购） ── */
function hwFiltered() {
  let list = S.hardware || [];
  if (ui.hwStatus === 'owned') list = list.filter(h => h.owned);
  else if (ui.hwStatus === 'buy') list = list.filter(h => !h.owned && h.tag !== '可选');
  else if (ui.hwStatus === 'optional') list = list.filter(h => !h.owned && h.tag === '可选');
  else if (ui.hwStatus === 'todo') list = list.filter(h => !h.owned);
  if (ui.hwOwner !== 'all') list = list.filter(h => h.owner === ui.hwOwner);
  return list;
}
function hwCard(h) {
  const owner = h.owner ? memberById(h.owner) : null;
  const mods = (h.moduleIds || []).map(id => modById(id)).filter(m => m.id);
  const status = h.owned ? { lb: '已有', cls: 'ok' } : (h.tag === '可选' ? { lb: '可选', cls: 'opt' } : { lb: '必买', cls: 'buy' });
  return '<article class="hw-card' + (h.owned ? ' owned' : '') + '" style="--mc:' + (owner ? owner.color : 'var(--info)') + '">' +
    '<div class="hw-top"><span class="hw-tag ' + status.cls + '">' + (h.owned ? icon('check') : icon(status.cls === 'opt' ? 'box' : 'cart')) + status.lb + '</span>' +
    '<button class="hw-own' + (h.owned ? ' on' : '') + '" type="button" data-action="toggle-owned" data-id="' + h.id + '" aria-pressed="' + h.owned + '" title="' + (h.owned ? '点击取消已入手' : '点击标记为已入手') + '">' + (h.owned ? icon('check') + '已入手' : icon('plus') + '标记已入手') + '</button>' +
    '<span class="hw-tools"><button class="btn icon ghost" type="button" data-action="edit-hardware" data-id="' + h.id + '" title="编辑装备">' + icon('edit') + '</button>' +
    '<button class="btn icon ghost" type="button" data-action="del-hardware" data-id="' + h.id + '" title="删除装备">' + icon('trash') + '</button></span></div>' +
    '<h3 class="hw-name">' + esc(h.name) + '</h3>' +
    (h.spec ? '<div class="hw-spec">' + icon('chip') + esc(h.spec) + '</div>' : '') +
    (h.use ? '<div class="hw-use">' + icon('target') + '<span>' + esc(h.use) + '</span></div>' : '') +
    '<div class="hw-meta"><span class="hw-price">' + icon('cart') + esc(h.price || '价格待定') + '</span>' +
    (owner ? '<span class="hw-owner" style="--oc:' + owner.color + '"><span class="dot"></span>' + esc(owner.name) + ' 负责采购</span>' : '<span class="hw-owner shared">' + icon('users') + '团队共享</span>') + '</div>' +
    (h.note ? '<div class="hw-note">' + icon('info') + '<span>' + esc(h.note) + '</span></div>' : '') +
    (mods.length ? '<div class="hw-mods"><span class="hm-lb">用于</span>' + mods.map(m => '<button class="hw-mod" type="button" data-action="open-drawer" data-id="' + m.id + '" style="--mc:' + m.color + '" title="查看模块课程表"><span class="dot"></span>' + esc(m.name) + '</button>').join('') + '</div>' : '') +
    (h.url ? '<a class="hw-link" href="' + esc(h.url) + '" target="_blank" rel="noopener noreferrer">' + icon('external') + (h.owned ? '参考 / 官方文档' : '购买 / 搜索入口') + '</a>' : '') +
    '</article>';
}
function renderHardware() {
  const el = $('#hardwareGrid'); if (!el) return;
  const all = S.hardware || [];
  const owned = all.filter(h => h.owned).length;
  const buy = all.filter(h => !h.owned && h.tag !== '可选').length;
  const opt = all.filter(h => !h.owned && h.tag === '可选').length;
  $('#hwTitle').innerHTML = icon('chip') + '硬件装备板<span class="hint">已有装备 + 主流分工待购清单 · 缺的可再买</span>';
  $('#hwStats').innerHTML = [
    { n: all.length, l: '装备总数', c: 'var(--info)', ic: 'box' },
    { n: owned, l: '已入手', c: 'var(--ok)', ic: 'check' },
    { n: buy, l: '必买待购', c: 'var(--warn)', ic: 'cart' },
    { n: opt, l: '可选拓展', c: 'var(--violet)', ic: 'layers' }
  ].map(x => '<div class="hw-stat" style="--sc:' + x.c + '"><span class="hs-ic">' + icon(x.ic) + '</span><div><b>' + x.n + '</b><span>' + x.l + '</span></div></div>').join('');
  const statuses = [['all', '全部', all.length], ['todo', '待购', buy + opt], ['owned', '已有', owned], ['buy', '必买', buy], ['optional', '可选', opt]];
  $('#hwStatusChips').innerHTML = statuses.map(s => '<button class="chip' + (ui.hwStatus === s[0] ? ' active' : '') + '" type="button" data-action="hw-status" data-status="' + s[0] + '">' + s[1] + '（' + s[2] + '）</button>').join('');
  $('#hwOwnerChips').innerHTML = '<button class="chip' + (ui.hwOwner === 'all' ? ' active' : '') + '" type="button" data-action="hw-owner" data-owner="all">' + icon('users') + '全部成员</button>' +
    S.members.map(m => '<button class="chip' + (ui.hwOwner === m.id ? ' active' : '') + '" type="button" data-action="hw-owner" data-owner="' + m.id + '" style="--mc:' + m.color + '"><span class="dot"></span>' + esc(m.name) + '</button>').join('');
  $('#addHwBtn').innerHTML = icon('plus') + '添加装备';
  const list = hwFiltered();
  $('#hwCount').innerHTML = icon('box') + ' 显示 ' + list.length + ' / ' + all.length + ' 项 · 按主流分工标注采购负责人，入手后点「标记已入手」';
  el.innerHTML = list.length ? list.map(h => hwCard(h)).join('') : '<div class="card empty" style="grid-column:1/-1">' + icon('chip') + '<b>没有匹配的装备</b>试试切换筛选，或点击「添加装备」补充采购清单。</div>';
}

/* ── 视图 · 团队监督 ── */
function renderTeam() {
  $('#teamMembersTitle').innerHTML = icon('users') + '成员分工与进度<span class="hint">主流分工 · 各自负责的模块、课时与打卡，一目了然</span>';
  $('#teamMembers').innerHTML = S.members.map(m => {
    const mods = modulesOf(m.id), pr = progressOf(mods), ck = checkinsOf(m.id);
    const st = streak(ck), tot = totalMinutes(ck), ad = activeDays(ck), last = lastCheckin(ck);
    const isMe = m.id === me().id, todayDone = todayEntries(ck).length > 0;
    const nx = nextLesson(mods), nxTitle = nx ? (nx.lesson ? nx.lesson.title : nx.project.name + ' · ' + nx.milestone.title) : '';
    const stageIdx = (S.stages || []).findIndex(s => s.id === m.stageId);
    return '<article class="team-card' + (isMe ? ' me' : '') + '" style="--mc:' + m.color + '">' +
      '<div class="tc-head"><span class="tc-avatar">' + esc(m.name.slice(0, 1)) + '</span>' +
      '<div class="tc-id"><h3>' + esc(m.name) + (isMe ? ' <span class="badge copper">我</span>' : '') + '</h3><span class="tc-role">' + esc(m.role) + '</span>' +
      '<span class="tc-stage" style="--sc:' + stageColor(stageIdx) + '">' + icon('layers') + esc(stageName(m.stageId) || '未分阶段') + '</span></div>' +
      '<span class="tc-today ' + (todayDone ? 'on' : 'off') + '">' + (todayDone ? icon('check') + '今日已打卡' : icon('clock') + '今日未打卡') + '</span></div>' +
      (m.focus ? '<div class="tc-focus">' + icon('target') + '<span>' + esc(m.focus) + '</span></div>' : '') +
      '<div class="tc-stats">' +
      '<div><b>' + st + '</b><span>连续天数</span></div>' +
      '<div><b>' + (tot / 60).toFixed(1) + 'h</b><span>累计投入</span></div>' +
      '<div><b>' + ad + '</b><span>活跃天数</span></div>' +
      '<div><b>' + pr.pct + '%</b><span>进度完成</span></div></div>' +
      '<div class="tc-progress"><div class="mc-bar"><div class="mc-bar-fill" style="width:' + pr.pct + '%"></div></div><span>' + pr.lDone + '/' + pr.lTotal + ' 课时 · ' + pr.mDone + '/' + pr.mTotal + ' 里程碑 · ' + mods.length + ' 模块</span></div>' +
      '<div class="tc-modules">' + (mods.length ? mods.map(mm => { const p = modProgress(mm); return '<div class="tc-mod"><span class="dot" style="background:' + mm.color + ';color:' + mm.color + '"></span><span class="t">' + esc(mm.name) + '</span><span class="p">' + p.pct + '%</span></div>'; }).join('') : '<div class="empty" style="padding:10px">暂无负责模块</div>') + '</div>' +
      (nx ? '<div class="tc-next">' + icon('zap') + '<span class="tn-lb">下一步</span><span class="tn-t">' + esc(nxTitle) + '</span></div>' : '<div class="tc-next done">' + icon('check') + '<span class="tn-t">负责模块已全部完成</span></div>') +
      '<div class="tc-last">' + icon('clock') + (last ? '最近打卡 ' + last.date.slice(5) + ' · ' + esc(modById(last.moduleId).name) : '还没有打卡记录') + '</div>' +
      '</article>';
  }).join('');
  $('#teamCompareTitle').innerHTML = icon('chart') + '横向对比<span class="hint">投入与完成度，相互督促</span>';
  const maxMin = Math.max(1, ...S.members.map(m => totalMinutes(checkinsOf(m.id))));
  $('#teamCompareTime').innerHTML = S.members.map(m => { const v = totalMinutes(checkinsOf(m.id)); return '<div class="cmp-row" style="--mc:' + m.color + '"><span class="cmp-name"><span class="dot"></span>' + esc(m.name) + '</span><span class="cmp-track"><span class="cmp-fill" style="width:' + Math.round(v / maxMin * 100) + '%"></span></span><span class="cmp-val">' + (v / 60).toFixed(1) + 'h</span></div>'; }).join('');
  $('#teamCompareTask').innerHTML = S.members.map(m => { const p = progressOf(modulesOf(m.id)); return '<div class="cmp-row" style="--mc:' + m.color + '"><span class="cmp-name"><span class="dot"></span>' + esc(m.name) + '</span><span class="cmp-track"><span class="cmp-fill" style="width:' + p.pct + '%"></span></span><span class="cmp-val">' + p.pct + '%</span></div>'; }).join('');
  $('#teamFeedTitle').innerHTML = icon('clock') + '全队打卡动态<span class="hint">最近 18 条 · 实时同步</span>';
  const feed = [...S.checkins].sort((a, b) => b.ts - a.ts).slice(0, 18);
  $('#teamFeed').innerHTML = feed.length ? feed.map(c => {
    const mem = memberById(c.memberId), mod = modById(c.moduleId), d = new Date(c.date + 'T12:00:00');
    return '<div class="feed-item"><span class="fi-avatar" style="--mc:' + mem.color + '">' + esc(mem.name.slice(0, 1)) + '</span>' +
      '<div class="fi-body"><div class="fi-top"><b style="color:' + mem.color + '">' + esc(mem.name) + '</b>' +
      '<span class="fi-mod"><span class="dot" style="background:' + mod.color + ';color:' + mod.color + '"></span>' + esc(mod.name) + '</span>' +
      '<span class="fi-min">+' + c.minutes + 'min</span></div>' +
      (c.note ? '<div class="fi-note">' + esc(c.note) + '</div>' : '') + '</div>' +
      '<span class="fi-date">' + c.date.slice(5) + '<br>周' + WEEKCN[d.getDay()] + '</span></div>';
  }).join('') : '<div class="empty">' + icon('users') + '<b>还没有团队打卡记录</b>各自登录后开始打卡，这里会实时汇总。</div>';
}

/* ── 视图 3 · 资料库 ── */
function filteredResources() {
  const q = ui.libQuery.trim().toLowerCase();
  let list = S.resources.filter(r => {
    if (ui.libType !== 'all' && r.type !== ui.libType) return false;
    if (ui.libMod !== 'all' && r.moduleId !== ui.libMod) return false;
    if (ui.libFav && !r.fav) return false;
    if (q) {
      const m = modById(r.moduleId);
      const hay = [r.title, r.author, r.reason, m.name, (r.tags || []).join(' ')].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const modOrder = id => { const i = S.modules.findIndex(m => m.id === id); return i < 0 ? 999 : i; };
  if (ui.libSort === 'title') list.sort((a, b) => a.title.localeCompare(b.title, 'zh'));
  else if (ui.libSort === 'module') list.sort((a, b) => modOrder(a.moduleId) - modOrder(b.moduleId));
  else if (ui.libSort === 'fav') list.sort((a, b) => (b.fav ? 1 : 0) - (a.fav ? 1 : 0));
  return list;
}
function resBadge(r) {
  if (r.verified) return '<span class="badge ok">' + icon('check') + '已核实</span>';
  if (r.type === 'search') return '<span class="badge" style="color:var(--violet);border-color:color-mix(in srgb,var(--violet) 40%,transparent)">' + icon('search') + '搜索直达</span>';
  return '<span class="badge info">自定义</span>';
}
function renderLibrary() {
  $('#searchWrap').querySelector('svg')?.remove();
  $('#searchWrap').insertAdjacentHTML('afterbegin', icon('search'));
  $('#libType').innerHTML = '<option value="all">全部类型</option>' + Object.keys(TYPES).map(k => '<option value="' + k + '"' + (ui.libType === k ? ' selected' : '') + '>' + TYPES[k].label + '</option>').join('');
  $('#addResBtn').innerHTML = icon('plus') + '添加资料';
  $('#modFilterChips').innerHTML =
    '<button class="chip' + (ui.libMod === 'all' && !ui.libFav ? ' active' : '') + '" type="button" data-action="filter-mod" data-id="all">全部模块</button>' +
    S.modules.map(m => '<button class="chip' + (ui.libMod === m.id ? ' active' : '') + '" type="button" data-action="filter-mod" data-id="' + m.id + '"><span class="dot" style="background:' + m.color + ';color:' + m.color + '"></span>' + esc(m.name) + '</button>').join('') +
    '<button class="chip' + (ui.libFav ? ' active' : '') + '" type="button" data-action="filter-fav">' + starIcon(ui.libFav) + ' 收藏</button>';
  const list = filteredResources();
  const verified = S.resources.filter(r => r.verified).length;
  $('#resCount').textContent = '显示 ' + list.length + ' / ' + S.resources.length + ' 条 · 其中 ' + verified + ' 条链接已结合社区评价核实';
  $('#resGrid').innerHTML = list.length ? list.map(r => {
    const m = modById(r.moduleId), ty = TYPES[r.type] || TYPES.doc;
    const safeUrl = /^https?:\/\//i.test(r.url) ? r.url : '#';
    return '<article class="res-card" style="--mc:' + m.color + '">' +
      '<div class="rc-top"><span class="rc-type ' + r.type + '">' + icon(ty.icon) + ty.label + '</span>' + resBadge(r) +
      '<button class="rc-fav' + (r.fav ? ' on' : '') + '" type="button" data-action="fav" data-id="' + r.id + '" title="' + (r.fav ? '取消收藏' : '收藏') + '" aria-pressed="' + !!r.fav + '">' + starIcon(r.fav) + '</button></div>' +
      '<h3 class="rc-title"><a href="' + esc(safeUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(r.title) + '</a></h3>' +
      '<div class="rc-author">' + icon('user') + esc(r.author || '未知来源') + '</div>' +
      '<p class="rc-reason"><b>推荐理由</b> · ' + esc(r.reason || '—') + '</p>' +
      '<div class="rc-tags">' + (r.tags || []).map(t => '<span class="tag">' + esc(t) + '</span>').join('') + '</div>' +
      '<div class="rc-foot"><span class="rc-mod"><span class="dot" style="background:' + m.color + ';color:' + m.color + '"></span>' + esc(m.name) + '</span><span class="sp"></span>' +
      '<span class="rc-actions"><button class="btn icon ghost" type="button" data-action="edit-resource" data-id="' + r.id + '" title="编辑">' + icon('edit') + '</button>' +
      '<button class="btn icon ghost" type="button" data-action="del-resource" data-id="' + r.id + '" title="删除">' + icon('trash') + '</button></span>' +
      '<a class="btn sm rc-open" href="' + esc(safeUrl) + '" target="_blank" rel="noopener noreferrer">打开 ' + icon('external') + '</a></div></article>';
  }).join('') : '<div class="card empty" style="grid-column:1/-1">' + icon('search') + '<b>没有匹配的资料</b>试试清空搜索或筛选，或点击「添加资料」收录一条。</div>';
}

/* ── 视图 · 模块库（catalog）── */
const DIR_META = {
  vision: { label: '视觉', ic: 'target', v: '--info' },
  control: { label: '控制', ic: 'zap', v: '--warn' },
  hardware: { label: '硬件', ic: 'chip', v: '--danger' },
  common: { label: '通用', ic: 'box', v: '--ok' }
};
const PHASE_LABEL = { foundation: '基础夯实', learn: '单项技能', project: '实战练手', compete: '竞赛冲刺' };
const PHASE_ORDER = { foundation: 0, learn: 1, project: 2, compete: 3 };
const catalogTpl = id => SEED.catalog.find(t => t.id === id) || null;
const planModuleOf = tpl => S.modules.find(m => m.catalogId === tpl.id) || null;
const catalogInPlan = tpl => !!planModuleOf(tpl);
const routePos = (() => { const m = {}; SEED.routeOrder.forEach((cid, i) => { m[cid] = i; }); return cid => (cid in m ? m[cid] : 999); })();
function filteredCatalog() {
  const q = ui.catQuery.trim().toLowerCase();
  const list = SEED.catalog.filter(t => {
    if (ui.catDir !== 'all' && t.dir !== ui.catDir) return false;
    if (ui.catPhase !== 'all' && t.phase !== ui.catPhase) return false;
    if (ui.catStatus === 'added' && !catalogInPlan(t)) return false;
    if (ui.catStatus === 'notadded' && catalogInPlan(t)) return false;
    if (ui.catStatus === 'mastered' && !t.mastered) return false;
    if (q) {
      const hay = [t.name, t.goal, (t.lessons || []).map(l => l.title + ' ' + l.author).join(' '), (t.projects || []).map(p => p.name + ' ' + p.desc).join(' ')].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const idx = t => SEED.catalog.indexOf(t);
  if (ui.catSort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'zh'));
  else if (ui.catSort === 'lessons') list.sort((a, b) => (b.lessons || []).length - (a.lessons || []).length || (idx(a) - idx(b)));
  else list.sort((a, b) => (PHASE_ORDER[a.phase] - PHASE_ORDER[b.phase]) || (routePos(a.id) - routePos(b.id)) || (idx(a) - idx(b)));
  return list;
}
function renderCatalog() {
  const sw = $('#catSearchWrap'); if (!sw) return;
  sw.querySelector('svg')?.remove();
  sw.insertAdjacentHTML('afterbegin', icon('search'));
  $('#catDir').innerHTML = '<option value="all">全部方向</option>' + Object.keys(DIR_META).map(k => '<option value="' + k + '"' + (ui.catDir === k ? ' selected' : '') + '>' + DIR_META[k].label + '</option>').join('');
  $('#catPhase').innerHTML = '<option value="all">全部阶段</option>' + Object.keys(PHASE_LABEL).map(k => '<option value="' + k + '"' + (ui.catPhase === k ? ' selected' : '') + '>' + PHASE_LABEL[k] + '</option>').join('');
  $('#catSort').value = ui.catSort;
  const chips = [['all', '全部'], ['notadded', '未加入'], ['added', '已在计划'], ['mastered', '已掌握基础']];
  $('#catStatusChips').innerHTML = chips.map(c => '<button class="chip' + (ui.catStatus === c[0] ? ' active' : '') + '" type="button" data-action="cat-status" data-id="' + c[0] + '">' + c[1] + '</button>').join('');
  const list = filteredCatalog();
  const added = SEED.catalog.filter(catalogInPlan).length;
  $('#catCount').textContent = '显示 ' + list.length + ' / ' + SEED.catalog.length + ' 个模块 · 已在计划 ' + added + ' 个 · 主线按「先学技能 → 配套项目」排序';
  $('#catGrid').innerHTML = list.length ? list.map(t => {
    const d = DIR_META[t.dir] || DIR_META.common;
    const ls = t.lessons || [], ps = t.projects || [], ms = milesOf(t);
    const inPlan = planModuleOf(t);
    const firstL = ls[0], firstP = ps[0];
    const owner = memberById(t.suggestOwner);
    const tags = (t.mastered ? '<span class="badge ok">' + icon('check') + '已掌握</span>' : '') + (t.optional ? '<span class="badge" style="color:var(--violet);border-color:color-mix(in srgb,var(--violet) 40%,transparent)">' + icon('star') + '可选支线</span>' : '');
    const foot = inPlan
      ? '<button class="btn sm ghost" type="button" data-action="open-drawer" data-id="' + inPlan.id + '">' + icon('check') + '已在计划 · 查看</button>'
      : '<button class="btn sm primary" type="button" data-action="add-from-catalog" data-id="' + t.id + '">' + icon('plus') + '加入计划</button>';
    return '<article class="res-card cat-card' + (inPlan ? ' in-plan' : '') + '" style="--mc:' + t.color + '">' +
      '<div class="rc-top"><span class="dir-badge" style="--dc:var(' + d.v + ')">' + icon(d.ic) + d.label + '</span>' +
      '<span class="cat-phase">' + esc(PHASE_LABEL[t.phase] || '') + '</span>' + tags + '</div>' +
      '<h3 class="rc-title">' + esc(t.name) + '</h3>' +
      '<p class="rc-reason"><b>目标</b> · ' + esc(t.goal || '—') + '</p>' +
      ((firstL || firstP) ? '<div class="cat-preview">' +
        (firstL ? '<span class="cp-skill" title="' + esc(firstL.title) + '">' + icon('play') + esc(firstL.title) + '</span>' : '') +
        (firstL && firstP ? '<span class="cp-arrow">' + icon('arrow') + '</span>' : '') +
        (firstP ? '<span class="cp-proj" title="' + esc(firstP.name) + '">' + icon('target') + esc(firstP.name) + '</span>' : '') + '</div>' : '') +
      '<div class="cat-meta"><span>' + icon('play') + ls.length + ' 课时</span><span>' + icon('folder') + ps.length + ' 项目</span><span>' + icon('check') + ms.length + ' 里程碑</span></div>' +
      '<div class="rc-foot"><span class="rc-mod"><span class="dot" style="background:' + owner.color + ';color:' + owner.color + '"></span>建议 ' + esc(owner.name) + '</span><span class="sp"></span>' + foot + '</div></article>';
  }).join('') : '<div class="card empty" style="grid-column:1/-1">' + icon('search') + '<b>没有匹配的模块</b>试试清空搜索或切换方向 / 阶段 / 状态筛选。</div>';
}

/* ── 视图 4 · 数据 ── */
function renderData() {
  const total = totalMinutes(S.checkins);
  $('#dataStats').innerHTML = [
    { n: S.checkins.length, l: '全队打卡（条）' },
    { n: (total / 60).toFixed(1), l: '累计时长（小时）' },
    { n: activeDays(S.checkins), l: '活跃天数' },
    { n: S.resources.length, l: '资料库（条）' }
  ].map(x => '<div class="dstat"><div class="n">' + x.n + '</div><div class="l">' + x.l + '</div></div>').join('');
  $('#mbTitle').innerHTML = icon('chart') + '各模块投入时长<span class="hint">全队合计</span>';
  $('#backupTitle').innerHTML = icon('database') + '备份与恢复';
  $('#accountTitle').innerHTML = icon('user') + '账号与同步';
  $('#themeTitle').innerHTML = icon('palette') + '主题外观<span class="hint">仅本机 · 自动保存</span>';
  $('#aboutTitle').innerHTML = icon('info') + '说明';
  $('#exportBtn').innerHTML = icon('download') + '导出团队备份 JSON<small>study-bench-team-' + today() + '.json</small>';
  $('#importBtn').innerHTML = icon('upload') + '导入团队备份 JSON<small>覆盖当前数据</small>';
  $('#resetBtn').innerHTML = icon('reset') + '重置全部数据<small>清空所有修改</small>';
  const rows = S.modules.map(m => ({ m, v: modMinutes(m.id) })).sort((a, b) => b.v - a.v);
  const max = Math.max(1, ...rows.map(r => r.v));
  $('#modBars').innerHTML = rows.length ? rows.map(r => {
    const owner = memberById(r.m.ownerId);
    return '<div class="mbar-row" style="--mc:' + r.m.color + '"><span class="mbar-name" title="负责人：' + esc(owner.name) + '"><span class="dot" style="background:' + r.m.color + ';color:' + r.m.color + '"></span>' + esc(r.m.name) + '</span>' +
      '<span class="mbar-track"><span class="mbar-fill" style="width:' + Math.round(r.v / max * 100) + '%"></span></span>' +
      '<span class="mbar-val">' + fmtH(r.v) + '</span></div>';
  }).join('') : '<div class="empty">暂无模块</div>';
  const m = me();
  $('#accountBox').innerHTML =
    '<div class="acc-id"><span class="mem-avatar" style="--mc:' + m.color + '">' + esc(m.name.slice(0, 1)) + '</span><div><b>' + esc(m.name) + '</b><small>' + esc(m.role) + '</small></div></div>' +
    '<div class="acc-mode">' + (store.mode === 'server' ? icon('wifi') + '局域网同步 · 服务端 data/team.json · rev ' + lastRev : icon('database') + '本机离线 · 数据存于当前浏览器 localStorage') + '</div>' +
    '<div class="acc-actions"><button class="btn sm" type="button" data-action="rename-member" data-id="' + m.id + '">' + icon('edit') + '编辑名称</button>' +
    '<button class="btn sm" type="button" data-action="switch-member">' + icon('users') + '切换身份</button>' +
    '<button class="btn sm danger" type="button" data-action="logout">' + icon('logout') + '退出登录</button></div>';
  if (store.mode === 'server') {
    $('#storageInfo').textContent = '服务端持久化 · data/team.json · 当前版本 rev ' + lastRev + ' · 每 4 秒自动同步';
    $('#storageBar').style.width = '100%';
  } else {
    let bytes = 0; try { bytes = (localStorage.getItem(KEY) || '').length * 2; } catch (e) { }
    $('#storageInfo').textContent = '本地存储占用 ' + (bytes / 1024).toFixed(1) + ' KB（浏览器上限约 5 MB）';
    $('#storageBar').style.width = clamp(bytes / (5 * 1024 * 1024) * 100, 1.5, 100) + '%';
  }
  $('#aboutNote').innerHTML =
    '<b>关于本工作台</b><ul>' +
    '<li>学习模块按<b>基础 → 单项技能 → 实战练手 → 竞赛冲刺</b>路线组织：先学技能、配套练手项目，再整合整车 / 整机。每个模块含<b>逐节课时</b>与<b>练手项目里程碑</b>，进度 =（已完成课时 + 里程碑）/ 总数；想加新内容到「模块库」挑选加入计划。</li>' +
    '<li>三人按主流分工（硬件 PCB / 嵌入式控制 / 视觉算法）指派模块负责人，各自推进、相互监督；「硬件装备板」登记已有装备与待购清单，缺的可再买。</li>' +
    '<li>标有 <span class="badge ok">已核实</span> 的资源链接结合 B 站 / 社区攻略评价筛选；<span class="badge" style="color:var(--violet)">搜索直达</span> 类为站内搜索入口，请站内确认最新合集。</li>' +
    '<li>点击成员卡片即可<b>免密进入</b>，名称可在登录页铅笔按钮或「数据 → 编辑名称」自定义（如「我 / 队员一」）；初始进度为零，打卡与课时完成态由团队自行记录。</li>' +
    (store.mode === 'server'
      ? '<li><b>局域网同步模式</b>：一人运行 <code>node server.js</code>，队友浏览器访问 <code>http://&lt;本机IP&gt;:8787</code>，三人共享同一份团队数据，打卡 / 课时 / 名称实时互相可见。导出备份与分享码只含团队学习数据。</li>'
      : '<li><b>本机离线模式</b>：双击 index.html 即可运行，数据仅存于当前浏览器。三人可在此切换身份体验；要真正多机同步，运行 <code>node server.js</code> 用局域网访问，<b>无局域网时用上方「分享码合并」</b>把进度发给队友汇总。</li>') +
    '</ul>';
  renderConnection();
}

/* ── 抽屉 · 课程表 / 课时 / 项目里程碑 ── */
function lessonRow(m, l, editable) {
  const meta = [l.author, l.dur].filter(Boolean).join(' · ');
  return '<div class="lesson-row' + (l.done ? ' done' : '') + '" style="--mc:' + m.color + '">' +
    '<button type="button" class="lr-check' + (editable ? '' : ' static') + '" ' +
    (editable ? 'data-action="toggle-lesson" data-mid="' + m.id + '" data-lid="' + l.id + '" aria-pressed="' + l.done + '"' : 'disabled') +
    ' title="' + esc(l.done ? '点击标记为未完成' : '点击标记为已完成') + '">' + (l.done ? icon('check') : '') + '</button>' +
    '<div class="lr-main"><div class="lr-title">' + esc(l.title) + '</div>' +
    (meta ? '<div class="lr-meta">' + icon('user') + esc(meta) + '</div>' : '') + '</div>' +
    (l.url ? '<a class="lr-link" href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer" title="打开课程视频">' + icon('external') + '</a>' : '') +
    (editable ? '<div class="lr-tools"><button class="btn icon ghost" type="button" data-action="edit-lesson" data-mid="' + m.id + '" data-lid="' + l.id + '" title="编辑课时">' + icon('edit') + '</button>' +
      '<button class="btn icon ghost" type="button" data-action="del-lesson" data-mid="' + m.id + '" data-lid="' + l.id + '" title="删除课时">' + icon('trash') + '</button></div>' : '') +
    '</div>';
}
function milestoneRow(m, p, x, editable) {
  return '<div class="mile-row' + (x.done ? ' done' : '') + '">' +
    '<button type="button" class="mr-check' + (editable ? '' : ' static') + '" ' +
    (editable ? 'data-action="toggle-milestone" data-mid="' + m.id + '" data-pid="' + p.id + '" data-msid="' + x.id + '" aria-pressed="' + x.done + '"' : 'disabled') +
    ' title="' + esc(x.done ? '点击标记为未完成' : '点击标记为已完成') + '">' + (x.done ? icon('check') : '') + '</button>' +
    '<span class="mr-title">' + esc(x.title) + '</span>' +
    (editable ? '<button class="btn icon ghost mr-del" type="button" data-action="del-milestone" data-mid="' + m.id + '" data-pid="' + p.id + '" data-msid="' + x.id + '" title="删除里程碑">' + icon('trash') + '</button>' : '') +
    '</div>';
}
function projectBlock(m, p, editable) {
  const ms = p.milestones || [], done = ms.filter(x => x.done).length, pct = ms.length ? Math.round(done / ms.length * 100) : 0;
  return '<div class="proj-block" style="--mc:' + m.color + '">' +
    '<div class="pb-head"><span class="pb-name">' + icon('wrench') + esc(p.name) + '</span>' +
    '<span class="pb-pct">' + done + '/' + ms.length + ' · ' + pct + '%</span>' +
    (editable ? '<span class="pb-tools"><button class="btn icon ghost" type="button" data-action="edit-project" data-mid="' + m.id + '" data-pid="' + p.id + '" title="编辑项目">' + icon('edit') + '</button>' +
      '<button class="btn icon ghost" type="button" data-action="del-project" data-mid="' + m.id + '" data-pid="' + p.id + '" title="删除项目">' + icon('trash') + '</button></span>' : '') + '</div>' +
    (p.url ? '<a class="pb-link" href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer">' + icon('play') + '参考教程' + icon('external') + '</a>' : '') +
    (p.desc ? '<div class="pb-desc">' + esc(p.desc) + '</div>' : '') +
    '<div class="pb-bar"><i style="width:' + pct + '%"></i></div>' +
    '<div class="pb-miles">' + (ms.length ? ms.map(x => milestoneRow(m, p, x, editable)).join('') : '<div class="pb-empty">' + icon('target') + '还没有里程碑' + (editable ? '，在下方添加第一步' : '') + '</div>') + '</div>' +
    (editable ? '<div class="curric-add sm"><input type="text" maxlength="60" placeholder="添加里程碑，回车确认…" data-ms-input="' + m.id + ':' + p.id + '"><button class="btn sm" type="button" data-action="add-milestone" data-mid="' + m.id + '" data-pid="' + p.id + '" title="添加里程碑">' + icon('plus') + '</button></div>' : '') +
    '</div>';
}
function renderDrawer() {
  if (!ui.drawerMod) return;
  const m = S.modules.find(x => x.id === ui.drawerMod);
  if (!m) { closeDrawer(); return; }
  const p = modProgress(m), res = S.resources.filter(r => r.moduleId === m.id);
  const entries = S.checkins.filter(c => c.moduleId === m.id);
  const owner = memberById(m.ownerId), editable = canEdit(m);
  const lessons = m.lessons || [], projects = m.projects || [];
  const body = $('#drawer');
  const scroll = body.querySelector('.drawer-body')?.scrollTop || 0;
  body.style.setProperty('--mc', m.color);
  body.innerHTML =
    '<div class="drawer-head"><span class="dot" style="background:' + m.color + ';color:' + m.color + ';margin-top:7px"></span>' +
    '<h3>' + esc(m.name) + '<span class="stage">' + esc(m.priority) + ' · ' + esc(stageName(m.stageId) || m.stage || '未分阶段') + '</span>' +
    '<span class="mc-owner" style="--oc:' + owner.color + '"><span class="dot"></span>负责人 ' + esc(owner.name) + (editable ? '（我）' : '') + '</span></h3>' +
    '<button class="btn icon ghost" type="button" data-action="close-drawer" title="关闭">' + icon('close') + '</button></div>' +
    '<div class="drawer-body">' +
    '<h4>' + icon('target') + '学习目标</h4><div class="drawer-goal">' + esc(m.goal || '尚未设置目标') + '</div>' +
    '<h4>' + icon('chart') + '总进度 · ' + p.pct + '%（' + p.done + '/' + p.total + '）</h4>' +
    '<div class="mc-bar" style="--mc:' + m.color + '"><div class="mc-bar-fill" style="width:' + p.pct + '%"></div></div>' +
    '<div class="drawer-plegend"><span>' + icon('play') + '课时 ' + p.lDone + '/' + p.lTotal + '</span><span>' + icon('wrench') + '里程碑 ' + p.mDone + '/' + p.mTotal + '</span></div>' +
    '<h4>' + icon('play') + '课程表 · 课时' + (editable ? '' : ' · 只读') + '<span class="h4-n">' + p.lDone + '/' + p.lTotal + '</span></h4>' +
    '<div class="curric-lessons">' + (lessons.length ? lessons.map(l => lessonRow(m, l, editable)).join('') : '<div class="curric-empty">' + icon('play') + '还没有课时' + (editable ? '，在下方添加第一节' : '') + '</div>') + '</div>' +
    (editable ? '<div class="curric-add"><input type="text" maxlength="90" placeholder="添加课时标题，回车确认…" data-lesson-input="' + m.id + '"><button class="btn sm" type="button" data-action="add-lesson" data-mid="' + m.id + '">' + icon('plus') + '课时</button><button class="btn sm ghost" type="button" data-action="edit-lesson" data-mid="' + m.id + '" data-lid="" title="添加带视频链接的课时">' + icon('external') + '带链接</button></div>' : '') +
    '<h4>' + icon('wrench') + '练手项目 · 里程碑' + (editable ? '' : ' · 只读') + '<span class="h4-n">' + projects.length + ' 个</span></h4>' +
    '<div class="curric-projects">' + (projects.length ? projects.map(pp => projectBlock(m, pp, editable)).join('') : '<div class="curric-empty">' + icon('wrench') + '还没有练手项目' + (editable ? '，在下方创建第一个' : '') + '</div>') + '</div>' +
    (editable ? '<div class="curric-add"><input type="text" maxlength="60" placeholder="新建练手项目，回车确认…" data-proj-input="' + m.id + '"><button class="btn sm" type="button" data-action="add-project" data-mid="' + m.id + '">' + icon('plus') + '项目</button><button class="btn sm ghost" type="button" data-action="edit-project" data-mid="' + m.id + '" data-pid="" title="新建带说明与教程的项目">' + icon('external') + '详细</button></div>' : '') +
    (!editable ? '<div class="task-readonly-note">' + icon('lock') + '由 ' + esc(owner.name) + ' 负责，仅负责人可修改课时与里程碑</div>' : '') +
    '<h4>' + icon('clock') + '学习投入</h4><div class="drawer-goal">累计 <b style="color:var(--copper-bright)">' + fmtH(modMinutes(m.id)) + '</b> · ' + entries.length + ' 次打卡（全队）</div>' +
    '<h4>' + icon('book') + '配套资料（' + res.length + '）</h4><div class="drawer-res">' +
    (res.length ? res.map(r => '<a class="dr-item" style="--mc:' + m.color + '" href="' + esc(/^https?:\/\//i.test(r.url) ? r.url : '#') + '" target="_blank" rel="noopener noreferrer">' + icon((TYPES[r.type] || TYPES.doc).icon) + '<span class="t">' + esc(r.title) + '</span>' + icon('external') + '</a>').join('') : '<div class="empty" style="padding:14px">该模块还没有资料</div>') +
    '</div></div>' +
    '<div class="drawer-foot">' +
    (editable ? '<button class="btn" type="button" data-action="edit-module" data-id="' + m.id + '">' + icon('edit') + '编辑模块</button>' : '') +
    '<button class="btn" type="button" data-action="goto-lib" data-id="' + m.id + '">' + icon('book') + '去资料库</button>' +
    '<span style="flex:1"></span>' +
    (editable ? '<button class="btn danger" type="button" data-action="del-module" data-id="' + m.id + '">' + icon('trash') + '</button>' : '') + '</div>';
  body.querySelector('.drawer-body').scrollTop = scroll;
}

function renderAll() {
  if (!S || !session) return;
  renderNav(); renderHeader(); renderMemberMenu(); renderCheckin(); renderProgress(); renderCatalog(); renderHardware(); renderTeam(); renderLibrary(); renderData(); renderThemeMenus();
  if (ui.drawerMod) renderDrawer();
}

/* ═══════════ 交互 ═══════════ */
function submitCheckin() {
  if (!S.modules.length) { toast('请先创建一个学习模块', 'warn'); switchView('progress'); return; }
  const mid = ui.selModule || S.modules[0].id;
  const entry = { id: uid('c'), date: today(), moduleId: mid, memberId: me().id, minutes: ui.minutes, note: $('#noteInput').value.trim(), ts: Date.now() };
  S.checkins.push(entry); persist();
  $('#noteInput').value = '';
  renderAll(); padCelebrate();
  toast('打卡成功 +' + entry.minutes + ' min · 连续 ' + streak(myCheckins()) + ' 天', 'ok');
}
function padCelebrate() {
  const wrap = $('#padWrap');
  const pulse = document.createElement('div'); pulse.className = 'pad-pulse'; wrap.appendChild(pulse);
  setTimeout(() => pulse.remove(), 750);
  const colors = ['#f0b429', '#35c46f', '#4da3ff', '#e05fd0', '#ff6b57'];
  for (let i = 0; i < 16; i++) {
    const s = document.createElement('span'); s.className = 'spark';
    const ang = (i / 16) * Math.PI * 2 + Math.random() * .4;
    const dist = 70 + Math.random() * 55;
    s.style.setProperty('--sx', Math.cos(ang) * dist + 'px');
    s.style.setProperty('--sy', Math.sin(ang) * dist + 'px');
    s.style.left = '50%'; s.style.top = '50%';
    s.style.background = colors[i % colors.length];
    s.style.boxShadow = '0 0 8px ' + colors[i % colors.length];
    wrap.appendChild(s);
    setTimeout(() => s.remove(), 900);
  }
}
function setMinutes(v) {
  ui.minutes = clamp(Math.round(v / 15) * 15, 15, 240);
  $('#minRange').value = ui.minutes;
  $('#minVal').innerHTML = ui.minutes + '<small> min</small>';
}
function guardEdit(m) {
  if (canEdit(m)) return true;
  toast('「' + m.name + '」由 ' + memberById(m.ownerId).name + ' 负责，仅负责人可修改', 'warn');
  return false;
}
function focusStage(sid) {
  const s = stageById(sid); if (!s) return;
  const m = me();
  if (m.stageId === sid) { toast('当前已处于「' + s.name + '」', 'info'); return; }
  m.stageId = sid; persist(); renderAll();
  toast('已将我的当前阶段标记为「' + s.name + '」· 路线图与下一步已更新', 'ok');
}
function setStageFilter(sid) {
  ui.progStage = ui.progStage === sid ? 'all' : sid;
  renderProgress();
}
/* ── 课时 / 里程碑 / 项目 CRUD（v3） ── */
function moduleCompletionToast(m) {
  const p = modProgress(m);
  if (p.total && p.done === p.total) toast('模块「' + m.name + '」课时与里程碑全部完成！', 'ok');
}
function toggleLesson(mid, lid) {
  const m = S.modules.find(x => x.id === mid); if (!m || !guardEdit(m)) return;
  const l = (m.lessons || []).find(x => x.id === lid); if (!l) return;
  l.done = !l.done; l.ts = Date.now(); persist(); renderAll();
  if (l.done) moduleCompletionToast(m);
}
function addLesson(mid) {
  const m = S.modules.find(x => x.id === mid); if (!m || !guardEdit(m)) return;
  const input = document.querySelector('[data-lesson-input="' + mid + '"]'); if (!input) return;
  const title = input.value.trim(); if (!title) { input.focus(); return; }
  m.lessons.push({ id: uid('l'), title, dur: '', url: '', author: '', done: false, ts: 0 });
  persist(); renderAll();
  const again = document.querySelector('[data-lesson-input="' + mid + '"]'); if (again) again.focus();
  toast('课时已添加：' + title, 'ok');
}
function delLesson(mid, lid) {
  const m = S.modules.find(x => x.id === mid); if (!m || !guardEdit(m)) return;
  const idx = m.lessons.findIndex(x => x.id === lid); if (idx < 0) return;
  const [l] = m.lessons.splice(idx, 1); persist(); renderAll();
  toast('已删除课时「' + l.title + '」', 'danger', () => { m.lessons.splice(idx, 0, l); persist(); renderAll(); });
}
function toggleMilestone(mid, pid, msid) {
  const m = S.modules.find(x => x.id === mid); if (!m || !guardEdit(m)) return;
  const p = (m.projects || []).find(x => x.id === pid); if (!p) return;
  const x = (p.milestones || []).find(y => y.id === msid); if (!x) return;
  x.done = !x.done; x.ts = Date.now(); persist(); renderAll();
  if (x.done) moduleCompletionToast(m);
}
function addMilestone(mid, pid) {
  const m = S.modules.find(x => x.id === mid); if (!m || !guardEdit(m)) return;
  const p = (m.projects || []).find(x => x.id === pid); if (!p) return;
  const input = document.querySelector('[data-ms-input="' + mid + ':' + pid + '"]'); if (!input) return;
  const title = input.value.trim(); if (!title) { input.focus(); return; }
  p.milestones.push({ id: uid('ms'), title, done: false, ts: 0 });
  persist(); renderAll();
  const again = document.querySelector('[data-ms-input="' + mid + ':' + pid + '"]'); if (again) again.focus();
  toast('里程碑已添加：' + title, 'ok');
}
function delMilestone(mid, pid, msid) {
  const m = S.modules.find(x => x.id === mid); if (!m || !guardEdit(m)) return;
  const p = (m.projects || []).find(x => x.id === pid); if (!p) return;
  const idx = p.milestones.findIndex(x => x.id === msid); if (idx < 0) return;
  const [x] = p.milestones.splice(idx, 1); persist(); renderAll();
  toast('已删除里程碑「' + x.title + '」', 'danger', () => { p.milestones.splice(idx, 0, x); persist(); renderAll(); });
}
function addProject(mid) {
  const m = S.modules.find(x => x.id === mid); if (!m || !guardEdit(m)) return;
  const input = document.querySelector('[data-proj-input="' + mid + '"]'); if (!input) return;
  const name = input.value.trim(); if (!name) { input.focus(); return; }
  m.projects.push({ id: uid('p'), name, desc: '', url: '', milestones: [] });
  persist(); renderAll();
  const again = document.querySelector('[data-proj-input="' + mid + '"]'); if (again) again.focus();
  toast('练手项目已创建：' + name, 'ok');
}
function delProject(mid, pid) {
  const m = S.modules.find(x => x.id === mid); if (!m || !guardEdit(m)) return;
  const idx = m.projects.findIndex(x => x.id === pid); if (idx < 0) return;
  const [p] = m.projects.splice(idx, 1); persist(); renderAll();
  toast('已删除项目「' + p.name + '」', 'danger', () => { m.projects.splice(idx, 0, p); persist(); renderAll(); });
}
function lessonForm(mid, lid) {
  const m = S.modules.find(x => x.id === mid); if (!m || !guardEdit(m)) return;
  const l = lid ? m.lessons.find(x => x.id === lid) : null;
  openModal('<h3>' + icon('play') + (l ? '编辑课时' : '添加课时') + '</h3><p class="msub">' + esc(m.name) + ' · 填课程标题与视频链接，方便直接点开看课</p>' +
    '<label class="fld"><span>课时标题 *</span><input type="text" id="fLesTitle" maxlength="90" value="' + esc(l ? l.title : '') + '" placeholder="例如：P5 PID 闭环控制实验"></label>' +
    '<label class="fld"><span>视频 / 文档链接（http / https）</span><input type="url" id="fLesUrl" value="' + esc(l ? l.url : '') + '" placeholder="https://www.bilibili.com/video/BV…?p=5"></label>' +
    '<div class="fld-row"><label class="fld"><span>UP 主 / 来源</span><input type="text" id="fLesAuthor" maxlength="30" value="' + esc(l ? l.author : '') + '" placeholder="江协科技"></label>' +
    '<label class="fld"><span>时长标注</span><input type="text" id="fLesDur" maxlength="16" value="' + esc(l ? l.dur : '') + '" placeholder="如 25:30（可留空）"></label></div>' +
    '<div class="modal-actions"><button class="btn" type="button" data-action="modal-close">取消</button>' +
    '<button class="btn primary" type="button" data-action="save-lesson" data-mid="' + mid + '" data-lid="' + (lid || '') + '">' + icon('check') + (l ? '保存' : '添加') + '</button></div>');
}
function saveLesson(mid, lid) {
  const m = S.modules.find(x => x.id === mid); if (!m || !guardEdit(m)) return;
  const title = $('#fLesTitle').value.trim(); if (!title) { toast('请填写课时标题', 'warn'); $('#fLesTitle').focus(); return; }
  const url = $('#fLesUrl').value.trim();
  if (url && !/^https?:\/\//i.test(url)) { toast('链接需以 http:// 或 https:// 开头', 'warn'); $('#fLesUrl').focus(); return; }
  const data = { title, url: safeUrl(url), author: $('#fLesAuthor').value.trim(), dur: $('#fLesDur').value.trim() };
  if (lid) { const l = m.lessons.find(x => x.id === lid); if (l) Object.assign(l, data); }
  else m.lessons.push(Object.assign({ id: uid('l'), done: false, ts: 0 }, data));
  persist(); closeModal(); renderAll(); toast(lid ? '课时已更新' : '课时已添加：' + title, 'ok');
}
function projectForm(mid, pid) {
  const m = S.modules.find(x => x.id === mid); if (!m || !guardEdit(m)) return;
  const p = pid ? m.projects.find(x => x.id === pid) : null;
  openModal('<h3>' + icon('wrench') + (p ? '编辑练手项目' : '新建练手项目') + '</h3><p class="msub">' + esc(m.name) + ' · 项目由若干里程碑组成，逐个勾选推进</p>' +
    '<label class="fld"><span>项目名称 *</span><input type="text" id="fProjName" maxlength="60" value="' + esc(p ? p.name : '') + '" placeholder="例如：倒立摆串级 PID"></label>' +
    '<label class="fld"><span>项目说明</span><textarea id="fProjDesc" maxlength="200" placeholder="这个项目要做出什么？">' + esc(p ? p.desc : '') + '</textarea></label>' +
    '<label class="fld"><span>参考链接（http / https）</span><input type="url" id="fProjUrl" value="' + esc(p ? p.url : '') + '" placeholder="https://www.bilibili.com/video/BV…"></label>' +
    '<div class="modal-actions"><button class="btn" type="button" data-action="modal-close">取消</button>' +
    '<button class="btn primary" type="button" data-action="save-project" data-mid="' + mid + '" data-pid="' + (pid || '') + '">' + icon('check') + (p ? '保存' : '创建') + '</button></div>');
}
function saveProject(mid, pid) {
  const m = S.modules.find(x => x.id === mid); if (!m || !guardEdit(m)) return;
  const name = $('#fProjName').value.trim(); if (!name) { toast('请填写项目名称', 'warn'); $('#fProjName').focus(); return; }
  const url = $('#fProjUrl').value.trim();
  if (url && !/^https?:\/\//i.test(url)) { toast('链接需以 http:// 或 https:// 开头', 'warn'); $('#fProjUrl').focus(); return; }
  const data = { name, desc: $('#fProjDesc').value.trim(), url: safeUrl(url) };
  if (pid) { const p = m.projects.find(x => x.id === pid); if (p) Object.assign(p, data); }
  else m.projects.push(Object.assign({ id: uid('p'), milestones: [] }, data));
  persist(); closeModal(); renderAll(); toast(pid ? '项目已更新' : '项目已创建：' + name, 'ok');
}
/* ── 硬件装备 CRUD（团队共享采购清单） ── */
function toggleOwned(id) {
  const h = (S.hardware || []).find(x => x.id === id); if (!h) return;
  h.owned = !h.owned; h.ts = Date.now(); persist(); renderAll();
  toast(h.owned ? '已标记入手：' + h.name : '已取消入手：' + h.name, h.owned ? 'ok' : 'info');
}
function hardwareForm(h) {
  const isEdit = !!h;
  h = h || { name: '', spec: '', tag: '必买', owned: false, owner: me().id, use: '', price: '', url: '', note: '', moduleIds: [] };
  const tagVal = h.tag === '可选' ? '可选' : '必买';
  openModal('<h3>' + icon('chip') + (isEdit ? '编辑装备' : '添加硬件装备') + '</h3><p class="msub">已有装备登记 / 待购清单 · 标注采购负责人与用途，缺的可再买</p>' +
    '<label class="fld"><span>装备名称 *</span><input type="text" id="fHwName" maxlength="40" value="' + esc(h.name) + '" placeholder="例如：带编码器直流减速电机 ×2"></label>' +
    '<label class="fld"><span>规格 / 型号</span><input type="text" id="fHwSpec" maxlength="80" value="' + esc(h.spec) + '" placeholder="例如：霍尔编码器 · 减速比按需"></label>' +
    '<div class="fld-row"><label class="fld"><span>采购优先级</span><select id="fHwTag"><option value="必买"' + (tagVal === '必买' ? ' selected' : '') + '>必买</option><option value="可选"' + (tagVal === '可选' ? ' selected' : '') + '>可选</option></select></label>' +
    '<label class="fld"><span>采购负责人</span><select id="fHwOwner"><option value=""' + (!h.owner ? ' selected' : '') + '>团队共享</option>' + S.members.map(m => '<option value="' + m.id + '"' + (m.id === h.owner ? ' selected' : '') + '>' + esc(m.name) + ' · ' + esc(m.role) + '</option>').join('') + '</select></label></div>' +
    '<label class="fld checkbox-fld"><input type="checkbox" id="fHwOwned"' + (h.owned ? ' checked' : '') + '><span>已入手（勾选后显示为「已有」）</span></label>' +
    '<label class="fld"><span>用途</span><input type="text" id="fHwUse" maxlength="120" value="' + esc(h.use) + '" placeholder="例如：速度环闭环 / 编码器测速"></label>' +
    '<div class="fld-row"><label class="fld"><span>价格 / 预算</span><input type="text" id="fHwPrice" maxlength="24" value="' + esc(h.price) + '" placeholder="例如：≈¥40–80/个"></label>' +
    '<label class="fld"><span>购买 / 文档链接</span><input type="url" id="fHwUrl" value="' + esc(h.url) + '" placeholder="https://…（可留空）"></label></div>' +
    '<label class="fld"><span>备注</span><textarea id="fHwNote" maxlength="160" placeholder="采购提示 / 替代方案 / 注意事项">' + esc(h.note) + '</textarea></label>' +
    '<label class="fld"><span>用于哪些模块（可多选）</span><div class="hw-mod-pick" id="fHwMods">' + S.modules.map(m => '<label class="hmp' + ((h.moduleIds || []).includes(m.id) ? ' on' : '') + '" style="--mc:' + m.color + '"><input type="checkbox" value="' + m.id + '"' + ((h.moduleIds || []).includes(m.id) ? ' checked' : '') + '><span class="dot"></span>' + esc(m.name) + '</label>').join('') + '</div></label>' +
    '<div class="modal-actions"><button class="btn" type="button" data-action="modal-close">取消</button>' +
    '<button class="btn primary" type="button" data-action="save-hardware" data-id="' + (isEdit ? h.id : '') + '">' + icon('check') + (isEdit ? '保存修改' : '添加装备') + '</button></div>');
}
function saveHardware(id) {
  const name = $('#fHwName').value.trim(); if (!name) { toast('请填写装备名称', 'warn'); $('#fHwName').focus(); return; }
  const url = $('#fHwUrl').value.trim();
  if (url && !/^https?:\/\//i.test(url)) { toast('链接需以 http:// 或 https:// 开头', 'warn'); $('#fHwUrl').focus(); return; }
  const owner = $('#fHwOwner').value;
  const moduleIds = $$('#fHwMods input:checked').map(c => c.value).filter(v => S.modules.some(m => m.id === v)).slice(0, 8);
  const data = { name, spec: $('#fHwSpec').value.trim(), tag: $('#fHwTag').value, owned: $('#fHwOwned').checked, owner: S.members.some(m => m.id === owner) ? owner : '', use: $('#fHwUse').value.trim(), price: $('#fHwPrice').value.trim(), url: safeUrl(url), note: $('#fHwNote').value.trim(), moduleIds, ts: Date.now() };
  if (id) { const h = S.hardware.find(x => x.id === id); if (!h) return; Object.assign(h, data); toast('装备已更新：' + name, 'ok'); }
  else { S.hardware.push(Object.assign({ id: uid('hw') }, data)); toast('装备已添加：' + name, 'ok'); }
  persist(); closeModal(); renderAll();
}
function delHardware(id) {
  const idx = (S.hardware || []).findIndex(x => x.id === id); if (idx < 0) return;
  const [h] = S.hardware.splice(idx, 1); persist(); renderAll();
  toast('已删除装备「' + h.name + '」', 'danger', () => { S.hardware.splice(idx, 0, h); persist(); renderAll(); });
}
function delCheckin(id) {
  const idx = S.checkins.findIndex(c => c.id === id); if (idx < 0) return;
  const c = S.checkins[idx];
  if (c.memberId !== me().id) { toast('只能删除自己的打卡记录', 'warn'); return; }
  S.checkins.splice(idx, 1); persist(); renderAll();
  toast('已删除 ' + c.date + ' 的打卡记录', 'danger', () => { S.checkins.splice(idx, 0, c); persist(); renderAll(); });
}
function delResource(id) {
  const idx = S.resources.findIndex(r => r.id === id); if (idx < 0) return;
  const [r] = S.resources.splice(idx, 1); persist(); renderAll();
  toast('已删除资料「' + r.title + '」', 'danger', () => { S.resources.splice(idx, 0, r); persist(); renderAll(); });
}
function delModule(id) {
  const m = S.modules.find(x => x.id === id); if (!m || !guardEdit(m)) return;
  const p = modProgress(m);
  openConfirm({
    title: '删除模块', sub: '模块及其课时、练手项目将被删除', danger: true, okLabel: '删除模块',
    text: '确定删除 <b>' + esc(m.name) + '</b>（含 ' + p.lTotal + ' 节课时、' + p.mTotal + ' 个里程碑）？关联的 ' + modResCount(id) + ' 条资料会保留为「未分类」。删除后可在提示中撤销。',
    onOk: () => {
      const idx = S.modules.findIndex(x => x.id === id);
      const [mm] = S.modules.splice(idx, 1); persist();
      if (ui.drawerMod === id) closeDrawer();
      renderAll();
      toast('已删除模块「' + mm.name + '」', 'danger', () => { S.modules.splice(idx, 0, mm); persist(); renderAll(); });
    }
  });
}

/* ── 模块表单 ── */
function moduleForm(m) {
  const isEdit = !!m;
  const defStage = me().stageId || ((S.stages && S.stages[0]) ? S.stages[0].id : '');
  m = m || { name: '', color: COLORS[0], priority: 'P1', stageId: defStage, goal: '', ownerId: me().id };
  openModal('<h3>' + icon('layers') + (isEdit ? '编辑模块' : '新建学习模块') + '</h3><p class="msub">定义一个学习部分，归入阶段路线并指派负责人分工</p>' +
    '<label class="fld"><span>模块名称 *</span><input type="text" id="fModName" maxlength="30" value="' + esc(m.name) + '" placeholder="例如：平衡车与串级 PID"></label>' +
    '<div class="fld-row"><label class="fld"><span>优先级标注</span><input type="text" id="fModPri" maxlength="12" value="' + esc(m.priority) + '" placeholder="如 P0 · 控制"></label>' +
    '<label class="fld"><span>所属阶段</span><select id="fModStageId">' +
    (S.stages || []).map(s => '<option value="' + s.id + '"' + (s.id === m.stageId ? ' selected' : '') + '>' + esc(s.name) + '</option>').join('') +
    '</select></label></div>' +
    '<label class="fld"><span>负责人（分工）</span><select id="fModOwner">' +
    S.members.map(mm => '<option value="' + mm.id + '"' + (mm.id === m.ownerId ? ' selected' : '') + '>' + esc(mm.name) + ' · ' + esc(mm.role) + '</option>').join('') +
    '</select></label>' +
    '<label class="fld"><span>学习目标</span><textarea id="fModGoal" maxlength="160" placeholder="这个模块要达成什么？">' + esc(m.goal) + '</textarea></label>' +
    '<label class="fld"><span>标识颜色</span><div class="color-pick" id="fModColors">' +
    COLORS.map(c => '<button type="button" class="color-opt' + (c === m.color ? ' active' : '') + '" style="background:' + c + ';--c:' + c + '" data-action="pick-color" data-color="' + c + '" aria-label="颜色 ' + c + '"></button>').join('') +
    '</div></label>' +
    '<div class="modal-actions"><button class="btn" type="button" data-action="modal-close">取消</button>' +
    '<button class="btn primary" type="button" data-action="save-module" data-id="' + (isEdit ? m.id : '') + '">' + icon('check') + (isEdit ? '保存修改' : '创建模块') + '</button></div>');
  ui.formColor = m.color;
}
function saveModule(id) {
  const name = $('#fModName').value.trim();
  if (!name) { toast('请填写模块名称', 'warn'); $('#fModName').focus(); return; }
  const ownerId = $('#fModOwner').value, stageId = $('#fModStageId').value;
  const data = { name, priority: $('#fModPri').value.trim(), stageId: (S.stages || []).some(s => s.id === stageId) ? stageId : '', goal: $('#fModGoal').value.trim(), color: ui.formColor || COLORS[0], ownerId: S.members.some(m => m.id === ownerId) ? ownerId : me().id };
  if (id) {
    const m = S.modules.find(x => x.id === id); if (!m || !guardEdit(m)) return;
    Object.assign(m, data); toast('模块已更新：' + name, 'ok');
  } else {
    S.modules.push(Object.assign({ id: uid('m'), stage: '', lessons: [], projects: [], catalogId: '', dir: 'common' }, data));
    toast('模块已创建：' + name + ' · 负责人 ' + memberById(data.ownerId).name + ' · 可在课程表里添加课时', 'ok');
  }
  persist(); closeModal(); renderAll();
}

/* ── 从模块库加入计划 ── */
function addFromCatalog(id) {
  const tpl = catalogTpl(id); if (!tpl) return;
  const exist = planModuleOf(tpl);
  if (exist) { toast('「' + tpl.name + '」已在计划中', 'info'); openDrawer(exist.id); return; }
  const d = DIR_META[tpl.dir] || DIR_META.common;
  const defOwner = S.members.some(m => m.id === tpl.suggestOwner) ? tpl.suggestOwner : me().id;
  const defStage = SEED.PHASE_STAGE[tpl.phase] || ((S.stages && S.stages[0]) ? S.stages[0].id : '');
  const ls = tpl.lessons || [], ps = tpl.projects || [];
  openModal('<h3>' + icon('box') + '加入计划 · ' + esc(tpl.name) + '</h3>' +
    '<p class="msub"><span class="dir-badge" style="--dc:var(' + d.v + ')">' + icon(d.ic) + d.label + '</span> ' + esc(PHASE_LABEL[tpl.phase] || '') + (tpl.mastered ? ' · 已掌握基础（加入即预完成）' : '') + '</p>' +
    '<p class="confirm-text">' + esc(tpl.goal || '') + '</p>' +
    '<div class="fld-row"><label class="fld"><span>负责人（分工）</span><select id="fCatOwner">' +
    S.members.map(mm => '<option value="' + mm.id + '"' + (mm.id === defOwner ? ' selected' : '') + '>' + esc(mm.name) + ' · ' + esc(mm.role) + '</option>').join('') +
    '</select></label>' +
    '<label class="fld"><span>归入阶段</span><select id="fCatStage">' +
    (S.stages || []).map(s => '<option value="' + s.id + '"' + (s.id === defStage ? ' selected' : '') + '>' + esc(s.name) + '</option>').join('') +
    '</select></label></div>' +
    '<div class="cat-form-preview"><div class="cfp-lb">' + icon('play') + '将加入 ' + ls.length + ' 课时 · ' + ps.length + ' 练手项目' + (tpl.mastered ? '（基础已预完成）' : '（进度从 0 开始）') + '</div>' +
    '<ul class="cfp-list">' + ls.slice(0, 4).map(l => '<li>' + icon('play') + '<span>' + esc(l.title) + (l.author ? ' <small>· ' + esc(l.author) + '</small>' : '') + '</span></li>').join('') +
    (ls.length > 4 ? '<li class="cfp-more">… 其余 ' + (ls.length - 4) + ' 节课时</li>' : '') +
    ps.map(p => '<li class="cfp-proj">' + icon('target') + '<span>' + esc(p.name) + ' <small>· ' + (p.milestones || []).length + ' 里程碑</small></span></li>').join('') + '</ul></div>' +
    '<div class="modal-actions"><button class="btn" type="button" data-action="modal-close">取消</button>' +
    '<button class="btn primary" type="button" data-action="confirm-add-catalog" data-id="' + tpl.id + '">' + icon('plus') + '加入计划</button></div>');
}
function confirmAddCatalog(id) {
  const tpl = catalogTpl(id); if (!tpl) return;
  const exist = planModuleOf(tpl);
  if (exist) { closeModal(); toast('「' + tpl.name + '」已在计划中', 'info'); openDrawer(exist.id); return; }
  const ownerId = $('#fCatOwner').value, stageId = $('#fCatStage').value;
  const owner = S.members.some(m => m.id === ownerId) ? ownerId : me().id;
  const stage = (S.stages || []).some(s => s.id === stageId) ? stageId : (SEED.PHASE_STAGE[tpl.phase] || '');
  const mod = SEED.instantiate(tpl, owner, stage);
  let idx = -1;
  for (let i = 0; i < S.modules.length; i++) { if (S.modules[i].stageId === mod.stageId) idx = i; }
  if (idx >= 0) S.modules.splice(idx + 1, 0, mod); else S.modules.push(mod);
  persist(); closeModal(); renderAll();
  toast('已加入计划：' + tpl.name + ' · 负责人 ' + memberById(owner).name + (tpl.mastered ? ' · 基础已预完成' : ''), 'ok', () => {
    const i = S.modules.findIndex(m => m.id === mod.id);
    if (i >= 0) { S.modules.splice(i, 1); if (ui.drawerMod === mod.id) closeDrawer(); persist(); renderAll(); toast('已撤销加入：' + tpl.name, 'info'); }
  });
}

/* ── 资料表单 ── */
function resourceForm(r) {
  const isEdit = !!r;
  r = r || { title: '', url: '', moduleId: S.modules[0]?.id || '', type: 'video', author: '', reason: '', tags: [] };
  openModal('<h3>' + icon('book') + (isEdit ? '编辑资料' : '添加学习资料') + '</h3><p class="msub">收录教程 / 文档 / 代码，写清推荐理由方便日后回看</p>' +
    '<label class="fld"><span>标题 *</span><input type="text" id="fResTitle" maxlength="60" value="' + esc(r.title) + '" placeholder="例如：江协科技 · PID 入门教程"></label>' +
    '<label class="fld"><span>链接 *（http / https）</span><input type="url" id="fResUrl" value="' + esc(r.url) + '" placeholder="https://www.bilibili.com/video/BV…"></label>' +
    '<div class="fld-row"><label class="fld"><span>所属模块</span><select id="fResMod">' +
    S.modules.map(m => '<option value="' + m.id + '"' + (m.id === r.moduleId ? ' selected' : '') + '>' + esc(m.name) + '</option>').join('') +
    '</select></label><label class="fld"><span>类型</span><select id="fResType">' +
    Object.keys(TYPES).map(k => '<option value="' + k + '"' + (k === r.type ? ' selected' : '') + '>' + TYPES[k].label + '</option>').join('') +
    '</select></label></div>' +
    '<label class="fld"><span>作者 / 来源</span><input type="text" id="fResAuthor" maxlength="30" value="' + esc(r.author) + '" placeholder="UP 主或站点名"></label>' +
    '<label class="fld"><span>推荐理由（结合攻略评价）</span><textarea id="fResReason" maxlength="200" placeholder="为什么选这个教程？社区口碑如何？">' + esc(r.reason) + '</textarea></label>' +
    '<label class="fld"><span>标签（逗号分隔）</span><input type="text" id="fResTags" maxlength="60" value="' + esc((r.tags || []).join(', ')) + '" placeholder="PID, 套件跟练"></label>' +
    '<div class="modal-actions"><button class="btn" type="button" data-action="modal-close">取消</button>' +
    '<button class="btn primary" type="button" data-action="save-resource" data-id="' + (isEdit ? r.id : '') + '">' + icon('check') + (isEdit ? '保存修改' : '添加资料') + '</button></div>');
}
function saveResource(id) {
  const title = $('#fResTitle').value.trim();
  const url = $('#fResUrl').value.trim();
  if (!title) { toast('请填写标题', 'warn'); $('#fResTitle').focus(); return; }
  if (!/^https?:\/\/.+/i.test(url)) { toast('链接需以 http:// 或 https:// 开头', 'warn'); $('#fResUrl').focus(); return; }
  const data = {
    title, url, moduleId: $('#fResMod').value, type: $('#fResType').value,
    author: $('#fResAuthor').value.trim(), reason: $('#fResReason').value.trim(),
    tags: $('#fResTags').value.split(/[,，]/).map(s => s.trim()).filter(Boolean).slice(0, 6)
  };
  if (id) {
    const r = S.resources.find(x => x.id === id); if (!r) return;
    Object.assign(r, data); toast('资料已更新：' + title, 'ok');
  } else {
    S.resources.push(Object.assign({ id: uid('r'), fav: false, verified: false }, data));
    toast('资料已添加：' + title, 'ok');
  }
  persist(); closeModal(); renderAll();
}

/* ── 导出 / 导入 / 重置 ── */
function downloadText(filename, text, mime) {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function exportJSON() {
  const out = JSON.parse(JSON.stringify(S));
  delete out._rev;
  const name = 'study-bench-team-' + today() + '.json';
  downloadText(name, JSON.stringify(out, null, 2), 'application/json');
  toast('团队备份已导出：' + name, 'ok');
}
function handleImportFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let data;
    try { data = JSON.parse(reader.result); } catch (e) { toast('导入失败：不是有效的 JSON 文件', 'danger'); return; }
    if (!validState(data)) { toast('导入失败：文件结构不正确（需包含 modules / resources / checkins）', 'danger'); return; }
    openConfirm({
      title: '导入团队备份', sub: '将覆盖当前全部团队数据', okLabel: '覆盖导入',
      text: '备份包含 <b style="color:var(--copper-bright)">' + data.modules.length + '</b> 个模块、<b style="color:var(--copper-bright)">' + data.resources.length + '</b> 条资料、<b style="color:var(--copper-bright)">' + data.checkins.length + '</b> 条打卡记录。导入后当前数据将被替换，建议先导出备份。',
      onOk: () => {
        S = sanitizeState(data); persist(); closeDrawer(); ui.selModule = null; renderAll(); toast('导入成功，团队数据已恢复', 'ok');
      }
    });
  };
  reader.readAsText(file);
}
function resetAll() {
  openConfirm({
    title: '重置全部数据', sub: '清空所有修改与打卡记录', danger: true, okLabel: '确认重置',
    text: '将恢复 ' + SEED.routeOrder.length + ' 个主线模块（含课时与练手项目里程碑，按学习路线排序）、' + SEED.resources.length + ' 条核实资料与 ' + SEED.hardware.length + ' 项硬件装备，进度归零并按默认分工指派负责人；模块库另有 ' + SEED.catalog.length + ' 个基础 / 可选模板可随时加入。<b>你添加的模块、课时、资料与真实打卡都会丢失</b>，建议先导出备份。',
    onOk: () => {
      S = sanitizeState(SEED.buildState());
      persist(); closeDrawer(); ui.selModule = null; renderAll(); toast('已重置全部数据', 'ok');
    }
  });
}

/* ═══════════ 分享码合并同步（局域网不可用时的离线路径） ═══════════
   生成：团队状态 → 剥离 _rev → JSON → gzip（可用时）→ base64，前缀 SBX1./SB1.
   合并：按 id 取并集；打卡 / 硬件按 ts 取新；课时 / 里程碑完成态按 ts 取新（同刻取已完成）；
        模块 / 资料标量保留本地，新增项追加；已有成员只更新 stageId / focus。 */
function bytesToB64(bytes) {
  let bin = ''; const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  return btoa(bin);
}
function b64ToBytes(b64) {
  const bin = atob(b64); const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function gzipBytes(bytes) {
  if (typeof CompressionStream === 'undefined') return null;
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
async function gunzipBytes(bytes) {
  if (typeof DecompressionStream === 'undefined') throw new Error('当前浏览器不支持解压分享码，请用较新版 Chrome / Edge 打开');
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
async function encodeShare(state) {
  const payload = JSON.parse(JSON.stringify(state));
  delete payload._rev;
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const gz = await gzipBytes(bytes);
  return gz ? 'SBX1.' + bytesToB64(gz) : 'SB1.' + bytesToB64(bytes);
}
async function decodeShare(code) {
  const s = String(code || '').trim().replace(/\s+/g, '');
  if (!s) throw new Error('分享码为空');
  let bytes;
  if (s.startsWith('SBX1.')) bytes = await gunzipBytes(b64ToBytes(s.slice(5)));
  else if (s.startsWith('SB1.')) bytes = b64ToBytes(s.slice(4));
  else throw new Error('分享码格式不正确（应以 SBX1. 或 SB1. 开头）');
  const data = JSON.parse(new TextDecoder().decode(bytes));
  if (!validState(data)) throw new Error('分享码内容不完整（缺少 modules / resources / checkins）');
  return data;
}
function mergeById(localArr, incomingArr, mergeFn) {
  const map = new Map();
  (localArr || []).forEach(x => { if (x && x.id != null) map.set(x.id, x); });
  (incomingArr || []).forEach(x => { if (!x || x.id == null) return; map.set(x.id, map.has(x.id) ? mergeFn(map.get(x.id), x) : x); });
  return Array.from(map.values());
}
const pickNewer = (a, b) => ((Number(b.ts) || 0) > (Number(a.ts) || 0) ? b : a);
function mergeProgressItem(a, b) {
  const ta = Number(a.ts) || 0, tb = Number(b.ts) || 0;
  if (tb > ta) return b;
  if (ta > tb) return a;
  return (a.done || b.done) ? Object.assign({}, a, { done: true }) : a;
}
function mergeModule(a, b) {
  const lessons = mergeById(a.lessons, b.lessons, mergeProgressItem);
  const projects = mergeById(a.projects, b.projects, (pa, pb) => Object.assign({}, pa, { milestones: mergeById(pa.milestones, pb.milestones, mergeProgressItem) }));
  return Object.assign({}, a, { lessons, projects });
}
function mergeStates(local, incoming) {
  const out = JSON.parse(JSON.stringify(local));
  const localMembers = new Map((out.members || []).map(m => [m.id, m]));
  (incoming.members || []).forEach(im => {
    if (!im || !im.id) return;
    if (localMembers.has(im.id)) { const lm = localMembers.get(im.id); if (im.stageId) lm.stageId = im.stageId; if (im.focus) lm.focus = im.focus; }
    else { const c = Object.assign({}, im); out.members.push(c); localMembers.set(im.id, c); }
  });
  out.stages = mergeById(out.stages, incoming.stages, a => a);
  out.modules = mergeById(out.modules, incoming.modules, mergeModule);
  out.resources = mergeById(out.resources, incoming.resources, a => a);
  out.hardware = mergeById(out.hardware, incoming.hardware, pickNewer);
  out.checkins = mergeById(out.checkins, incoming.checkins, pickNewer);
  return out;
}
function renderConnection() {
  const badge = $('#connModeBadge'); if (!badge) return;
  const title = $('#connTitle'); if (title) title.innerHTML = icon('wifi') + '连接与同步<span class="hint">局域网实时 / 分享码离线合并</span>';
  const isServer = store.mode === 'server';
  badge.className = 'conn-badge ' + (isServer ? 'server' : 'local');
  badge.innerHTML = isServer ? icon('wifi') + '局域网实时同步' : icon('database') + '本机离线模式';
  const lan = $('#connLanStatus');
  if (lan) lan.innerHTML = isServer
    ? icon('check') + '<span>已连接服务端 · rev ' + lastRev + ' · 每 4 秒自动同步，三人实时共享一份数据</span>'
    : icon('info') + '<span>未启用局域网服务 · 在文件夹运行 <code>node server.js</code>，队友用 <code>http://&lt;本机IP&gt;:8787</code> 访问即可实时同步</span>';
  const desc = $('#connShareDesc');
  if (desc) desc.textContent = isServer
    ? '局域网可用时优先实时同步；分享码用于把进度离线带给不在同一网络的队友，合并后双方打卡与课时进度自动汇总。'
    : '当前无局域网：生成分享码后点「存为文件」下载 .txt，用微信 / QQ 以文件发给队友（码长 2 万余字符，直接发文本会被截断）；对方粘贴后点「合并」即可汇总双方打卡与课时进度（按 id 合并，不覆盖你的数据）。';
}
async function genShare() {
  if (ui.shareBusy) return;
  ui.shareBusy = true;
  const btn = $('[data-action="gen-share"]'); if (btn) { btn.disabled = true; btn.innerHTML = icon('sync') + '生成中…'; }
  try {
    const code = await encodeShare(S);
    const out = $('#shareOut'); if (out) out.value = code;
    const meta = $('#shareOutMeta');
    if (meta) meta.innerHTML = icon('check') + '<span>已生成 · ' + code.length + ' 字符 · 含 ' + S.checkins.length + ' 条打卡 / ' + S.modules.length + ' 模块 / ' + (S.hardware || []).length + ' 装备</span>';
    toast('分享码已生成，可存为文件或复制后发给队友', 'ok');
  } catch (e) { toast('生成失败：' + (e.message || '浏览器不支持压缩'), 'danger'); }
  finally { ui.shareBusy = false; if (btn) { btn.disabled = false; btn.innerHTML = icon('share') + '生成我的分享码'; } }
}
async function copyShare() {
  const out = $('#shareOut'); const code = out ? out.value : '';
  if (!code) { toast('请先生成分享码', 'warn'); return; }
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(code);
    else { out.removeAttribute('readonly'); out.select(); out.setSelectionRange(0, code.length); const ok = document.execCommand('copy'); out.setAttribute('readonly', ''); if (!ok) throw new Error('copy rejected'); }
    toast('分享码已复制到剪贴板', 'ok');
  } catch (e) { out.removeAttribute('readonly'); out.select(); out.setSelectionRange(0, code.length); toast('自动复制失败，已选中分享码，请手动 Ctrl+C', 'warn'); }
}
function saveShare() {
  const out = $('#shareOut'); const code = out ? out.value : '';
  if (!code) { toast('请先生成分享码', 'warn'); return; }
  const name = 'study-bench-share-' + today() + '.txt';
  downloadText(name, code, 'text/plain');
  toast('分享码已存为文件：' + name, 'ok');
}
async function importShare() {
  const inp = $('#shareIn'); const code = inp ? inp.value.trim() : '';
  const meta = $('#shareInMeta');
  if (!code) { toast('请先粘贴队友发来的分享码', 'warn'); if (inp) inp.focus(); return; }
  let incoming;
  try { incoming = await decodeShare(code); }
  catch (e) { if (meta) meta.innerHTML = icon('alert') + '<span>' + esc(e.message || '分享码无效') + '</span>'; toast(e.message || '分享码无效', 'danger'); return; }
  const inc = sanitizeState(JSON.parse(JSON.stringify(incoming)));
  const merged = mergeStates(S, inc);
  const newCheckins = Math.max(0, merged.checkins.length - S.checkins.length);
  const newMods = Math.max(0, merged.modules.length - S.modules.length);
  const newHw = Math.max(0, (merged.hardware || []).length - (S.hardware || []).length);
  if (meta) meta.innerHTML = icon('check') + '<span>解析成功 · 队友 ' + inc.members.length + ' 人 / ' + inc.checkins.length + ' 打卡 / ' + inc.modules.length + ' 模块 / ' + (inc.hardware || []).length + ' 装备</span>';
  openConfirm({
    title: '合并队友进度', sub: '按 id 汇总 · 不覆盖你的数据', okLabel: '确认合并',
    text: '将合并分享码中的团队数据：新增 <b style="color:var(--copper-bright)">' + newCheckins + '</b> 条打卡、<b style="color:var(--copper-bright)">' + newMods + '</b> 个模块、<b style="color:var(--copper-bright)">' + newHw + '</b> 项装备；课时与里程碑完成状态按最新时间汇总。你的现有数据不会被覆盖。',
    onOk: () => {
      S = sanitizeState(merged); persist(); if (inp) inp.value = ''; if (meta) meta.innerHTML = '';
      closeDrawer(); ui.selModule = null; renderAll();
      toast('合并成功 · 团队进度已汇总（+' + newCheckins + ' 条打卡）', 'ok');
    }
  });
}

/* ── 事件委托 ── */
document.addEventListener('click', e => {
  if (ui.menuOpen && !e.target.closest('#memberChip') && !e.target.closest('#memberMenu')) toggleMenu(false);
  if (ui.themeMenuOpen && !e.target.closest('#themeBtn') && !e.target.closest('#themeMenu')) toggleThemeMenu(false);
  const a = e.target.closest('[data-action]');
  if (!a) return;
  const act = a.dataset.action, id = a.dataset.id;
  switch (act) {
    case 'nav': switchView(a.dataset.view); break;
    case 'login-enter': enterAs(id, a); break;
    case 'member-menu': if (ui.themeMenuOpen) toggleThemeMenu(false); toggleMenu(); break;
    case 'theme-menu': toggleThemeMenu(); break;
    case 'set-theme': setTheme(id); if (ui.themeMenuOpen) toggleThemeMenu(false); break;
    case 'switch-member': doLogout(); break;
    case 'rename-member': toggleMenu(false); renameForm(id || (me() && me().id)); break;
    case 'logout': doLogout(); break;
    case 'save-rename': saveRename(id || ui.renameId); break;
    case 'name-preset': { const inp = $('#fName'); if (inp) { inp.value = a.dataset.name || ''; inp.dispatchEvent(new Event('input')); inp.focus(); } break; }
    case 'prog-filter': ui.progFilter = a.dataset.filter; renderProgress(); break;
    case 'prog-stage': ui.progStage = id; renderProgress(); break;
    case 'stage-filter': setStageFilter(id); break;
    case 'pick-module': ui.selModule = id; renderModChips(); break;
    case 'min-dec': setMinutes(ui.minutes - 15); break;
    case 'min-inc': setMinutes(ui.minutes + 15); break;
    case 'submit-checkin': submitCheckin(); break;
    case 'del-checkin': delCheckin(id); break;
    case 'focus-stage': focusStage(id); break;
    case 'toggle-lesson': toggleLesson(a.dataset.mid, a.dataset.lid); break;
    case 'add-lesson': addLesson(a.dataset.mid); break;
    case 'edit-lesson': lessonForm(a.dataset.mid, a.dataset.lid); break;
    case 'del-lesson': delLesson(a.dataset.mid, a.dataset.lid); break;
    case 'save-lesson': saveLesson(a.dataset.mid, a.dataset.lid || null); break;
    case 'toggle-milestone': toggleMilestone(a.dataset.mid, a.dataset.pid, a.dataset.msid); break;
    case 'add-milestone': addMilestone(a.dataset.mid, a.dataset.pid); break;
    case 'del-milestone': delMilestone(a.dataset.mid, a.dataset.pid, a.dataset.msid); break;
    case 'add-project': addProject(a.dataset.mid); break;
    case 'edit-project': projectForm(a.dataset.mid, a.dataset.pid); break;
    case 'del-project': delProject(a.dataset.mid, a.dataset.pid); break;
    case 'save-project': saveProject(a.dataset.mid, a.dataset.pid || null); break;
    case 'hw-status': ui.hwStatus = a.dataset.status; renderHardware(); break;
    case 'hw-owner': ui.hwOwner = a.dataset.owner; renderHardware(); break;
    case 'toggle-owned': toggleOwned(id); break;
    case 'add-hardware': hardwareForm(null); break;
    case 'edit-hardware': hardwareForm((S.hardware || []).find(h => h.id === id)); break;
    case 'del-hardware': delHardware(id); break;
    case 'save-hardware': saveHardware(id || null); break;
    case 'add-module': moduleForm(null); break;
    case 'edit-module': { const m = S.modules.find(x => x.id === id); if (m && guardEdit(m)) moduleForm(m); break; }
    case 'del-module': delModule(id); break;
    case 'save-module': saveModule(id || null); break;
    case 'pick-color':
      ui.formColor = a.dataset.color;
      $$('#fModColors .color-opt').forEach(c => c.classList.toggle('active', c.dataset.color === ui.formColor));
      break;
    case 'open-drawer': openDrawer(id); break;
    case 'close-drawer': closeDrawer(); break;
    case 'goto-lib': closeDrawer(); ui.libMod = id; ui.libFav = false; ui.libQuery = ''; $('#libSearch').value = ''; switchView('library'); renderLibrary(); break;
    case 'add-resource': resourceForm(null); break;
    case 'edit-resource': resourceForm(S.resources.find(r => r.id === id)); break;
    case 'del-resource': delResource(id); break;
    case 'save-resource': saveResource(id || null); break;
    case 'fav': { const r = S.resources.find(x => x.id === id); if (r) { r.fav = !r.fav; persist(); renderLibrary(); } break; }
    case 'filter-mod': ui.libMod = id; ui.libFav = false; renderLibrary(); break;
    case 'filter-fav': ui.libFav = !ui.libFav; renderLibrary(); break;
    case 'goto-catalog': switchView('catalog'); renderCatalog(); break;
    case 'add-from-catalog': addFromCatalog(id); break;
    case 'confirm-add-catalog': confirmAddCatalog(id); break;
    case 'cat-status': ui.catStatus = id; renderCatalog(); break;
    case 'export': exportJSON(); break;
    case 'import': $('#importFile').click(); break;
    case 'reset': resetAll(); break;
    case 'gen-share': genShare(); break;
    case 'copy-share': copyShare(); break;
    case 'save-share': saveShare(); break;
    case 'import-share': importShare(); break;
    case 'modal-close': closeModal(); break;
    case 'confirm-ok': { const fn = ui.confirmFn; closeModal(); if (fn) fn(); break; }
  }
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.rm-stage[role="button"]')) { e.preventDefault(); e.target.click(); return; }
  if (e.key === 'Enter' && e.target.id === 'fName') { e.preventDefault(); saveRename(ui.renameId); return; }
  if (e.key === 'Escape') { if ($('#modalScrim').classList.contains('open')) closeModal(); else if ($('#drawer').classList.contains('open')) closeDrawer(); else if (ui.menuOpen) toggleMenu(false); else if (ui.themeMenuOpen) toggleThemeMenu(false); }
  if (e.key === 'Enter') {
    const t = e.target;
    if (t.matches('[data-lesson-input]')) { e.preventDefault(); addLesson(t.dataset.lessonInput); }
    else if (t.matches('[data-proj-input]')) { e.preventDefault(); addProject(t.dataset.projInput); }
    else if (t.matches('[data-ms-input]')) { e.preventDefault(); const parts = t.dataset.msInput.split(':'); addMilestone(parts[0], parts[1]); }
  }
});
$('#modalScrim').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
$('#drawerScrim').addEventListener('click', closeDrawer);
$('#padBtn').addEventListener('click', submitCheckin);
$('#minRange').addEventListener('input', e => setMinutes(+e.target.value));
$('#libSearch').addEventListener('input', e => { ui.libQuery = e.target.value; renderLibrary(); });
$('#libType').addEventListener('change', e => { ui.libType = e.target.value; renderLibrary(); });
$('#libSort').addEventListener('change', e => { ui.libSort = e.target.value; renderLibrary(); });
$('#catSearch').addEventListener('input', e => { ui.catQuery = e.target.value; renderCatalog(); });
$('#catDir').addEventListener('change', e => { ui.catDir = e.target.value; renderCatalog(); });
$('#catPhase').addEventListener('change', e => { ui.catPhase = e.target.value; renderCatalog(); });
$('#catSort').addEventListener('change', e => { ui.catSort = e.target.value; renderCatalog(); });
$('#importFile').addEventListener('change', e => { const f = e.target.files[0]; if (f) handleImportFile(f); e.target.value = ''; });
$('#modal').addEventListener('change', e => { const lab = e.target.closest('.hmp'); if (lab && e.target.type === 'checkbox') lab.classList.toggle('on', e.target.checked); });

/* ── 模块拖拽排序 ── */
let dragId = null;
const grid = $('#moduleGrid');
grid.addEventListener('dragstart', e => {
  const h = e.target.closest('.mc-drag'); if (!h || h.classList.contains('disabled')) return;
  dragId = h.dataset.drag;
  e.dataTransfer.effectAllowed = 'move';
  try { e.dataTransfer.setData('text/plain', dragId); } catch (err) { }
  requestAnimationFrame(() => h.closest('.mod-card')?.classList.add('dragging'));
});
grid.addEventListener('dragover', e => {
  const c = e.target.closest('.mod-card'); if (!c || !dragId) return;
  e.preventDefault(); e.dataTransfer.dropEffect = 'move';
  $$('.mod-card.drag-over').forEach(x => x.classList.remove('drag-over'));
  if (c.dataset.id !== dragId) c.classList.add('drag-over');
});
grid.addEventListener('drop', e => {
  const c = e.target.closest('.mod-card'); if (!c || !dragId) return;
  e.preventDefault();
  const from = S.modules.findIndex(m => m.id === dragId), to = S.modules.findIndex(m => m.id === c.dataset.id);
  if (from < 0 || to < 0 || from === to) return;
  const [m] = S.modules.splice(from, 1); S.modules.splice(to, 0, m);
  persist(); renderProgress(); toast('模块顺序已更新', 'info');
});
grid.addEventListener('dragend', () => { dragId = null; $$('.mod-card').forEach(c => c.classList.remove('dragging', 'drag-over')); });

/* ── 静态部件初始化 ── */
function initStatic() {
  $('[data-action="min-dec"]').innerHTML = icon('minus');
  $('[data-action="min-inc"]').innerHTML = icon('plus');
  setMinutes(60);
  applyTheme(readTheme(), false);
  renderThemeMenus();
}

/* ── 启动：探测服务模式，恢复会话或显示登录 ── */
async function probeServer() {
  if (location.protocol === 'file:') return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1500);
    const res = await fetch('/api/ping', { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.mode === 'server') return data;
  } catch (e) { }
  return null;
}
async function boot() {
  initStatic();
  const ping = await probeServer();
  if (ping) { store = makeServerStore('', ping.members); lastRev = ping.rev || 0; }
  else { store = makeLocalStore(); }
  const saved = readSession();
  if (saved && saved.mode === store.mode) {
    try {
      if (store.mode === 'server') {
        if (!saved.token) throw new Error('无令牌');
        store.setToken(saved.token);
        const { state, rev } = await store.loadState();
        if (!state.members.some(m => m.id === saved.memberId)) throw new Error('成员不存在');
        S = state; lastRev = rev; session = saved; enterApp(); return;
      } else {
        const { state } = await store.loadState();
        if (!state.members.some(m => m.id === saved.memberId)) throw new Error('成员不存在');
        S = state; session = saved; enterApp(); return;
      }
    } catch (e) { clearSession(); if (store.mode === 'server') store.setToken(null); }
  }
  showLogin();
}
boot();
})();