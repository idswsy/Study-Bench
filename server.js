/* ═══════════════════════════════════════════════════════════
   学习工作台 · 局域网同步服务（零依赖，node server.js）
   ─ 三台电脑共用一份团队数据：一人启动，其余浏览器访问 http://<本机IP>:8787
   ─ 静态托管前端 + 登录鉴权 + 团队状态读写，持久化到 data/team.json
   ═══════════════════════════════════════════════════════════ */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const SEED = require('./seed.js');

const PORT = Number(process.env.PORT) || 8787;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const TEAM_FILE = path.join(DATA_DIR, 'team.json');
const SESSION_TTL = 1000 * 60 * 60 * 24 * 7;   // 会话 7 天
const MAX_BODY = 8 * 1024 * 1024;             // 请求体上限 8 MB
const SESSIONS = new Map();                    // token -> { memberId, exp }

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.map': 'application/json; charset=utf-8'
};

/* ── 团队状态持久化 ── */
function saveTeam(t) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = TEAM_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(t, null, 2));
  fs.renameSync(tmp, TEAM_FILE);              // 原子替换，避免写一半被读到
}
function loadTeam() {
  try {
    const t = JSON.parse(fs.readFileSync(TEAM_FILE, 'utf8'));
    if (t && Array.isArray(t.members) && Array.isArray(t.modules)) {
      if (t.version === 3 || t.version === 4) {
        if (typeof t._rev !== 'number') t._rev = 1;
        if (t.version === 3) { SEED.upgradeToV4(t); t._rev++; saveTeam(t); }
        return t;
      }
      /* v2 → v4：结构升级为新种子（阶段 / 模块库主线 / 课时 / 项目 / 硬件），保留真实打卡 */
      const fresh = SEED.buildState();
      if (Array.isArray(t.checkins)) fresh.checkins = t.checkins;
      fresh._rev = (typeof t._rev === 'number' ? t._rev : 1) + 1;
      saveTeam(fresh);
      return fresh;
    }
  } catch (e) { /* 首次运行或文件损坏 → 重新播种 */ }
  const t = SEED.buildState();
  t._rev = 1;
  saveTeam(t);
  return t;
}
let TEAM = loadTeam();

/* 返回给客户端的状态：剥离内部 _rev */
function publicState() {
  const out = Object.assign({}, TEAM);
  delete out._rev;
  return out;
}
const memberPublic = () => TEAM.members.map(m => ({ id: m.id, name: m.name, role: m.role, color: m.color }));

/* ── HTTP  helpers ── */
function send(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body), 'Cache-Control': 'no-store' });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => { data += c; if (data.length > MAX_BODY) { reject(new Error('body too large')); req.destroy(); } });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
function bearer(req) {
  const h = req.headers['authorization'] || '';
  const m = /^Bearer\s+(.+)$/i.exec(h);
  if (!m) return null;
  const s = SESSIONS.get(m[1]);
  if (!s || s.exp < Date.now()) { SESSIONS.delete(m[1]); return null; }
  return s;
}
function parseJSON(raw) { try { return JSON.parse(raw || '{}'); } catch (e) { return null; } }

/* ── 路由 ── */
const server = http.createServer(async (req, res) => {
  let url;
  try { url = new URL(req.url, 'http://localhost'); } catch (e) { res.writeHead(400); return res.end('Bad Request'); }
  const p = url.pathname;

  if (p.startsWith('/api/')) {
    try {
      if (p === '/api/ping') {
        return send(res, 200, { ok: true, mode: 'server', rev: TEAM._rev, members: memberPublic() });
      }
      if (p === '/api/login' && req.method === 'POST') {
        const b = parseJSON(await readBody(req));
        if (!b || typeof b.id !== 'string') return send(res, 400, { ok: false, error: '请求格式不正确' });
        const mem = TEAM.members.find(m => m.id === b.id);
        if (!mem) return send(res, 404, { ok: false, error: '成员不存在' });
        const token = crypto.randomBytes(24).toString('hex');
        SESSIONS.set(token, { memberId: mem.id, exp: Date.now() + SESSION_TTL });
        return send(res, 200, { ok: true, token, memberId: mem.id, member: { id: mem.id, name: mem.name, role: mem.role, color: mem.color } });
      }
      if (p === '/api/logout' && req.method === 'POST') {
        const h = /^Bearer\s+(.+)$/i.exec(req.headers['authorization'] || '');
        if (h) SESSIONS.delete(h[1]);
        return send(res, 200, { ok: true });
      }
      if (p === '/api/state' && req.method === 'GET') {
        if (!bearer(req)) return send(res, 401, { ok: false, error: '未登录或会话已过期' });
        return send(res, 200, { ok: true, state: publicState(), rev: TEAM._rev });
      }
      if (p === '/api/state' && req.method === 'PUT') {
        const s = bearer(req);
        if (!s) return send(res, 401, { ok: false, error: '未登录或会话已过期' });
        const b = parseJSON(await readBody(req));
        const incoming = b && b.state;
        if (!incoming || !Array.isArray(incoming.modules) || !Array.isArray(incoming.resources) || !Array.isArray(incoming.checkins)) {
          return send(res, 400, { ok: false, error: '状态格式不正确' });
        }
        SEED.upgradeToV4(incoming);   // 防御：旧 v3 客户端 PUT 不会把团队数据降级（v4 为 no-op）
        const oldById = new Map(TEAM.members.map(m => [m.id, m]));
        const seen = new Set();
        const members = (Array.isArray(incoming.members) ? incoming.members : []).map(m => {
          seen.add(m.id);
          return Object.assign({}, m);
        });
        oldById.forEach((m, id) => { if (!seen.has(id)) members.push(m); });   // 客户端漏传的成员不丢
        TEAM = Object.assign({}, incoming, { members, _rev: TEAM._rev + 1 });
        saveTeam(TEAM);
        return send(res, 200, { ok: true, rev: TEAM._rev });
      }
      // 名称属公开团队数据（/api/ping 已暴露），免密改名以支持登录页编辑；批量状态写入仍需鉴权
      if (p === '/api/member' && req.method === 'POST') {
        const b = parseJSON(await readBody(req));
        if (!b || typeof b.id !== 'string' || typeof b.name !== 'string') return send(res, 400, { ok: false, error: '请求格式不正确' });
        const name = b.name.trim().slice(0, 20);
        if (!name) return send(res, 400, { ok: false, error: '名称不能为空' });
        const mem = TEAM.members.find(m => m.id === b.id);
        if (!mem) return send(res, 404, { ok: false, error: '成员不存在' });
        mem.name = name;
        TEAM._rev++; saveTeam(TEAM);
        return send(res, 200, { ok: true, rev: TEAM._rev, member: { id: mem.id, name: mem.name, role: mem.role, color: mem.color } });
      }
      return send(res, 404, { ok: false, error: '未知接口' });
    } catch (e) {
      return send(res, 500, { ok: false, error: '服务器内部错误' });
    }
  }

  /* ── 静态文件 ── */
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end('Method Not Allowed'); }
  let rel = p === '/' ? '/index.html' : p;
  try { rel = decodeURIComponent(rel); } catch (e) { }
  const full = path.normalize(path.join(ROOT, rel));
  if (full !== ROOT && !full.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.stat(full, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('404 Not Found'); }
    const ext = path.extname(full).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': st.size, 'Cache-Control': 'no-cache' });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(full).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = [];
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const ni of ifaces[name] || []) {
      if (ni.family === 'IPv4' && !ni.internal) ips.push(ni.address);
    }
  }
  console.log('══════════════════════════════════════════════');
  console.log('  学习工作台 · 团队同步服务已启动');
  console.log('  本机访问： http://localhost:' + PORT);
  ips.forEach(ip => console.log('  局域网访问：http://' + ip + ':' + PORT + '  （队友用这个）'));
  console.log('  数据文件： ' + TEAM_FILE);
  console.log('  团队成员： ' + TEAM.members.map(m => m.name).join(' / ') + '（点击卡片免密进入，名称可在网页自定义）');
  console.log('  停止服务： Ctrl + C');
  console.log('══════════════════════════════════════════════');
});