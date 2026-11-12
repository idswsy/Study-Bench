# Study-Bench · 学习工作台

> 关于智能车 / 电赛团队分工学习路线的可视化平台 —— 三人竞赛团队的学习打卡与进度管理网页。
> 本 README 同时是**项目交接文档**，面向接手维护的同学 / 未来的自己，覆盖运行方式、架构、数据模型、同步机制、版本迁移、关键约定与待办。
> 最后更新：2026-11-12 · 数据 schema **v4** · 密码子系统已移除。

**快速开始**：浏览器直接打开 `index.html` 即可本机离线演示；三人共用则运行 `node server.js`，队友访问命令行打印出的局域网地址（详见 §2）。

---

## 1. 项目概览

| 项 | 内容 |
|---|---|
| 定位 | 纯前端单页应用（SPA）+ 可选零依赖 Node 局域网同步服务 |
| 团队 | 3 人：**我**（视觉算法·控制主线·龙芯，队长）/ **队友 A**（硬件 PCB·电源驱动·机械）/ **队友 B**（嵌入式控制·PID·电赛） |
| 技术栈 | 原生 HTML / CSS / JavaScript，**无构建、无框架、无 CDN、无 npm 依赖** |
| 服务端 | Node 内置模块（`http/fs/path/os/crypto`），`node server.js` 即可跑 |
| 数据 | 本地模式存 `localStorage`；服务模式存 `data/team.json`（**已 gitignore，不入库**） |
| 代码量 | `index.html` 364 行 · `styles.css` 1312 行 · `app.js` 1842 行 · `seed.js` 1040 行 · `server.js` 189 行 |
| Git | 分支 `main`，远端 `https://github.com/idswsy/Study-Bench.git`。初始提交 `1608f73`（在 `5123f19 Initial commit` 之上），已推送 |
| 鉴权 | **免密**：点击成员卡片进入。口令 / 哈希 / 盐值相关代码已全部删除（见 §10） |

### 目录结构

```
Study-Bench/
├─ index.html      # 页面骨架：7 个视图容器 + 登录遮罩 + 弹窗/抽屉/toast + 防主题闪烁脚本
├─ styles.css      # 全部样式：CSS 变量主题系统（3 主题）+ 组件 + 响应式
├─ app.js          # 前端全部逻辑：状态/渲染/交互/同步/分享码（IIFE 闭包，函数不挂 window）
├─ seed.js         # UMD 共享种子：成员/阶段/模块库 catalog/硬件/资料/迁移 upgradeToV4（客户端与服务端共用）
├─ server.js       # 零依赖局域网同步服务：静态托管 + 登录鉴权 + 团队状态读写
├─ data/
│  └─ team.json    # 服务端持久化数据（当前为 v3，下次启动服务自动升级 v4，见 §7）；已 gitignore
├─ .gitignore      # 排除 data/：真实进度与遗留字段不进公开仓库
└─ README.md       # 本文档：项目说明 + 交接文档（原 交接文档.md）
```

> `seed.js` 用 UMD 包装：浏览器里挂 `window.SEED`，Node 里 `module.exports`。**改种子内容只改这一个文件**，前后端同时生效。

---

## 2. 快速上手

### 模式 A · 本机离线演示（最简单）

直接用浏览器打开 `index.html`（`file://` 协议）。
- 自动进入**本地模式**，数据存浏览器 `localStorage`，刷新不丢。
- 登录页**点击成员卡片即可免密进入**，无需密码。
- 适合单人演示 / 开发调试；多人不共享数据。

### 模式 B · 局域网实时同步（三人共用）

```bash
cd Study-Bench          # clone 下来的目录名；队内本地文件夹叫「学习进度」
node server.js          # 需要本机装有 Node.js，无需 npm install
```

- 启动后命令行打印本机与局域网地址，例如 `http://192.168.x.x:8787`。
- 三人浏览器访问该地址 → 点击各自成员卡片进入 → **共享一份团队数据**。
- 打卡 / 课时进度每 **4 秒**自动同步；写入防抖 350ms。
- 端口可用环境变量覆盖：`PORT=9000 node server.js`。
- 数据落在 `data/team.json`（原子写入，见 §8）。

> 启动探测逻辑：`app.js` `boot()`（1819）先 `fetch('/api/ping')`，`file://` 协议直接跳过 → 本地模式；探测成功 → 服务模式。

### 默认成员

| id | 默认名 | 方向 | 颜色 |
|---|---|---|---|
| `me` | 我 | 视觉算法 · 控制主线 · 龙芯 | `#35c46f` |
| `a` | 队友 A | 硬件 PCB · 电源驱动 · 机械（平衡车底板已画完） | `#f0a13c` |
| `b` | 队友 B | 嵌入式控制 · PID · 电赛 | `#4da3ff` |

名称可在网页自定义（登录页铅笔 / 成员菜单 / 账户框，三处入口），实时同步。`id` 不可改。

---

## 3. 功能清单（7 个视图）

导航定义见 `app.js` `renderNav()`（550）。

| 视图 | id | 功能 |
|---|---|---|
| 今日打卡 | `checkin` | 选模块 + 时长（15min 步进）打卡；连续/最佳 streak、本周/累计投入；今日记录可删（带撤销） |
| 学习进度 | `progress` | **阶段路线图**（可点击筛选）+ 我的下一步 + 总进度环 + 模块卡片（逐节课时圆点 / 项目里程碑，点击推进）+ 拖拽排序 |
| 模块库 | `catalog` | 35 个参考模板，搜索 / 方向 / 阶段 / 状态筛选 + 排序；「加入计划」mini-form（选负责人/阶段，预览课时项目） |
| 硬件装备 | `hardware` | 16 项装备（已有 / 必买 / 可选），标记已入手、按负责人/状态筛选、关联模块 |
| 团队监督 | `team` | 三人进度对比、各阶段通关、投入排行、成员当前阶段 |
| 资料库 | `library` | 57 条学习资源（视频/文档/代码/工具/搜索直达），搜索/筛选/收藏/按模块归类 |
| 数据 | `data` | 导出/导入 JSON 备份、分享码生成与合并、连接面板、重置 |

### 横切功能

- **免密登录 + 改名**：点击成员卡片直接进入；名称编辑实时预览（头像首字 + 预设 chips），≤20 字，空名拦截。
- **三主题**：PCB 工作台（暗绿硬核）/ Claude 暖纸（象牙纸）/ Claude 暖夜（浓咖护眼），右上角切换，`localStorage` 记忆，无闪烁。
- **权限**：模块只有负责人可编辑/排序/删除（`canEdit` / `guardEdit`），他人只读；任何登录者可从模块库「加入计划」、新建模块。
- **撤销**：删除模块/打卡等破坏性操作后 toast 带「撤销」。
- **详情抽屉**：模块课程表（课时/项目/里程碑 CRUD + 资料）。

### 学习进度 · 阶段筛选（2026-11-12）

- 点击路线图阶段卡片 → 下方模块网格**只显示该阶段模块**；再点一次取消。
- 网格上方新增「按阶段」筛选条（全部阶段 + 各阶段，带计数与颜色圆点）。
- 卡片内「设为当前」小按钮保留原「标记我的当前阶段」语义（`focusStage`），与筛选互不干扰。
- 状态字段 `ui.progStage`（`'all'` 或阶段 id），跨视图切换保持；「我的/全队」切换、拖拽排序不受影响。
- 路线图卡片为 `div[role=button]`，支持 Enter/空格 键盘激活。
- 涉及函数：`renderRoadmap`(667) / `renderProgress`(733) / `setStageFilter`(1196) / `focusStage`(1189)；样式 `.rm-stage.selected` / `.rm-foot` / `.rm-setcur` / `.prog-stage-chips`。

---

## 4. 架构与数据流

### 状态管理

- 全局唯一状态对象 `S`（sanitize 后的团队数据，`app.js:87`）+ 会话 `session`（89）+ UI 态 `ui`（92，纯内存，不持久化）。
- **渲染**：`renderAll()` 依次调用各视图 `render*()`；交互后按需 `renderProgress()` 等局部重渲染。全部用字符串拼 HTML + `esc()` 转义 + `safeUrl()` 校验。
- **事件**：单一 `document` click 委托（`app.js:1668`），`e.target.closest('[data-action]')` 取动作 → `switch` 分发。键盘委托处理 Enter/Escape/空格。
- **持久化**：任何改动 → 改 `S` → `persist()` → `renderAll()`。

### 双模式 store（策略模式）

| | 本地 `makeLocalStore()`(254) | 服务 `makeServerStore()`(296) |
|---|---|---|
| 读写 | `localStorage['studybench.v1']` | `fetch` REST API |
| 登录 | `login(id)` 仅校验成员存在 | `POST /api/login {id}` 换 token |
| 改名 | 写 `localStorage` | `POST /api/member` |
| persist | 立即写 | 防抖 350ms → `PUT /api/state` |

### 同步机制（服务模式）

```
改动 → persist() → dirty=true → 350ms 防抖 flushSave() → PUT /api/state → rev++
轮询 pollOnce() 每 4s：若本地 dirty 先 flush；否则 GET /api/state，rev 更新则 mergeStates 合并 → 重渲染
```

- `mergeStates(local, incoming)`（`app.js:1591`）：按 id **并集合并**，不覆盖本地。
  - 模块 `mergeModule`(1586)：课时/里程碑 `mergeProgressItem`(1580)（done 取 OR，ts 取较新）。
  - 打卡/硬件 `pickNewer`（按 ts）；阶段/资料 keep-local。
  - 成员：已存在的只更新 `stageId` / `focus`，新成员追加。
- 弹窗打开 / 输入框聚焦时暂停轮询，避免打断编辑。

### 分享码（无局域网时离线合并）

- 编码 `encodeShare`（`app.js:1555`）：状态 → 剥离 `_rev` → JSON → gzip（`CompressionStream`，可用时）→ base64。
  - 前缀 **`SBX1.`**（gzip）/ **`SB1.`**（无压缩回退）。
- 解码 `decodeShare`(1562) → `mergeStates` 并集合并 → 双方打卡与课时进度汇总。
- 旧浏览器无 `DecompressionStream` 会提示用较新 Chrome/Edge。
- 分享码与备份只含团队学习数据（状态里已无任何凭据字段）。

---

## 5. 数据模型（schema v4）

顶层状态：

```js
{
  version: 4,
  members: [...], stages: [...], modules: [...],
  hardware: [...], resources: [...], checkins: [...],
  createdAt: 1730000000000,
  _rev: 11            // 仅服务端内部使用，返回客户端时剥离
}
```

各实体字段与 **sanitize 长度上限**（`app.js` `sanitizeState()`，184，超限截断）：

| 实体 | 字段 |
|---|---|
| member | `id`, `name`≤20, `role`≤40, `color`, `stageId`, `focus`≤80（**仅这 6 个字段**） |
| stage | `id`, `name`≤30, `sub`≤40, `desc`≤160, `order`, `phase`∈{foundation,learn,project,compete} |
| module | `id`, `name`≤30, `color`, `ownerId`, `priority`≤12, `stageId`, `stage`≤24, `goal`≤200, `lessons[]`, `projects[]`, `catalogId`, `dir`∈{vision,control,hardware,common} |
| lesson | `id`, `title`≤90, `dur:''`(约定留空), `url`, `author`≤30, `done`, `ts` |
| project | `id`, `name`, `desc`, `url`, `milestones[]` |
| milestone | `id`, `title`, `done`, `ts` |
| resource | `id`, `moduleId`, `type`∈{video,doc,code,tool,search}, `verified`, `fav`, `title`≤60, `author`≤30, `url`, `reason`≤200, `tags[]`≤6 |
| checkin | `id`, `date`(YYYY-MM-DD), `moduleId`, `memberId`, `minutes`(1–1440), `note`≤80, `ts` |
| hardware | `id`, `name`, `spec`, `owned`, `owner`, `tag`, `use`, `price`, `url`, `note`, `moduleIds[]`, `ts` |
| catalog 模板 | module 形状 + `dir`, `phase`, `suggestOwner`, `mastered`, `optional`, `legacyId?`（**不进同步状态**） |

### 存储键（localStorage）

| 键 | 内容 |
|---|---|
| `studybench.v1` | 本地模式完整状态 |
| `studybench.session` | 会话 `{memberId, mode, token?}` |
| `studybench.theme` | 主题 id |

### 种子规模（`SEED.buildState()`，seed.js:971）

- catalog **35** 模板（4 已掌握基础 + 2 可选支线 + 29 主线）
- 活跃主线模块 **31**（`routeOrder` 31 = 9 legacy + 22 新增）
- 资料 **57** · 硬件 **16** · 种子打卡 **99** · 成员 **3** · 阶段 **4**
- `SEED` 导出 **14** 个符号：`members / stages / hardware / modules / resources / notePool / buildState / catalog / routeOrder / SCHEMA / upgradeToV4 / PHASE_STAGE / legacyMap / instantiate`

---

## 6. 模块库与学习路线

### catalog（库） vs modules（计划）

- **`SEED.catalog`**（seed.js:943）：参考模板超集，**只在库里、不进同步状态**（避免 sanitize/merge 膨胀）。含已掌握基础与可选支线。
- **`S.modules`**：当前活跃主线计划。新加入/种子模块用**确定性 id = catalog id**，clone 保留模板 lesson/project/milestone id → 跨设备 `mergeById` 自动去重。
- 「加入计划」`addFromCatalog()`（app.js:1412）→ mini-form → `confirmAddCatalog()`(1436)：去重 → `SEED.instantiate`(seed.js:961) deep-clone 保留 item id → reset done/ts（mastered 模板预完成）→ 设 `{id, catalogId, ownerId, stageId, dir}` → 插到同阶段末尾。
- `catalogId` 用途：legacy 映射 + UI 去重（`catalogInPlan` / `planModuleOf`）。

### 四阶段路线（`seed.js:25`）

| id | 名称 | phase | 含义 |
|---|---|---|---|
| s0 | 阶段 0 · 基础夯实 | foundation | C/Python/PID/PCB 入门，已掌握，库中标「已掌握」，加入即预完成（**活跃计划中为 0 个**） |
| s1 | 阶段 1 · 单项技能 | learn | 各方向逐项突破 + 配套小项目 |
| s2 | 阶段 2 · 实战练手 | project | 技能拼成整车/整机 |
| s3 | 阶段 3 · 竞赛冲刺 | compete | 真题/联调/开源答辩；ROS2/无人机为可选支线 |

- `PHASE_STAGE = {foundation:'s0', learn:'s1', project:'s2', compete:'s3'}`（seed.js:664）。
- 路线强调**先学什么技能 → 做什么项目 → 再学什么 → 再做什么**，不排具体日期/实习（按用户要求精简）。
- `nextLesson()`（`app.js:388`）按**阶段序**推进「我的下一步」，同阶段内保留拖动排序。

### 内容来源约定（重要）

- 教程 URL **均已搜索核实**；构造的 `search.bilibili.com` 链接标注「搜索直达」。
- 智能车视觉用逐飞/龙邱/卓晴/协会培训；星瞳=OpenMV 官方；MaixCam2=Sipeed MaixPy（爱芯 AX630C，**非 K230**）；MSPM0G3507=**TI 官方 LaunchPad**（非立创）。
- 课时 `dur` 一律留空 `''`，**不编造时长**。
- 新增内容请沿用以上约定，勿发明 URL。

---

## 7. 版本与迁移（v3 → v4）

### 一次性增量升级 `upgradeToV4(s)`（`seed.js:998`，幂等，前后端共用）

1. **阶段**：按 id 从种子回填 phase/名称/描述；追加缺失种子阶段；保留自定义；按 order 排序。
2. **模块**：经 `legacyMap`(seed.js:668) 回填 `catalogId`，从 catalog 回填 `dir`；**仅当 catalogId 已知**才 remap 阶段（绝不碰自定义模块）。
3. **仅当原 `version===3`**：补齐缺失主线（跳过 mastered 与 legacy 双胞胎以尊重删除），插到同阶段末尾。
4. `version=4`。

`legacyMap`：`m-stm32→cat-b-hal`、`m-hw→cat-h-power`、`m-pid→cat-b-cascade`、`m-cv→cat-v-opencv`、`m-loong→cat-v-loong`、`m-yolo→cat-v-edgeai`、`m-mspm0→cat-b-mspm0`、`m-ros2→cat-i-ros2`、`m-drone→cat-i-drone`。

### 三处版本门（**改 schema 必须同批改这三处**）

| 位置 | 行为 |
|---|---|
| `app.js:185` `sanitizeState` | `if (s.version!==4) SEED.upgradeToV4(s)`，末尾写 `s.version=4` |
| `app.js:261` 本地读 | `if (s.version===3 || s.version===4) return sanitizeState(...)` |
| `server.js:40` `loadTeam` | 接受 3/4；v3 → `upgradeToV4` + `_rev++` + 落盘（42） |

- v2 旧数据 → 用新种子重建结构，**保留真实打卡**（`app.js:262` / `server.js:45`）。
- `PUT /api/state` 防御性 `upgradeToV4`（`server.js:129`）：旧 v3 客户端写入不会把团队数据降级。

### 五条承重修正（务必遵守）

- **R1** 版本门三处同批改，否则 reload/restart 走 rebuild 抹掉自定义模块。
- **R2** 升级助手放 `seed.js`（UMD 共用）；PUT 侧防御升级。
- **R3** 新模块确定性 id = catalog id，clone 保留 item id → 跨设备去重。
- **R4** 「补齐缺失主线」**只在 v3→v4 转换内**执行，绝不在每次 sanitize 执行（否则被删模块每次 reload 复活）。
- **R5** 活跃模块只加 `{catalogId, dir}`，缩小 sanitize/merge 面。

> 当前 `data/team.json` 仍是 **v3**（_rev 11 / 9 模块 / 99 打卡）。**下次全新启动 `node server.js` 会自动升级 v4 并 rev+1**，进度/打卡/名称保留。升级后勿手改该文件（服务运行时）。

---

## 8. 服务端 API（`server.js`）

端口 `8787`（`PORT` 可覆盖）· 会话 TTL **7 天** · 请求体上限 **8 MB** · 原子落盘（写 `.tmp` 再 `rename`，`saveTeam` 30）。

路由入口 `server.js:93` · `loadTeam` 36 · `publicState` 61 · `memberPublic` 66。

| 方法 路径 | 鉴权 | 说明 |
|---|---|---|
| `GET /api/ping` | 公开 | `{ok, mode:'server', rev, members:[{id,name,role,color}]}` |
| `POST /api/login` | 公开 | `{id}` → 24 字节 hex token；404 成员不存在 / 400 格式错（**免密**） |
| `POST /api/logout` | Bearer | 删除会话 |
| `GET /api/state` | Bearer | `{ok, state, rev}`；`state` 剥离内部 `_rev` |
| `PUT /api/state` | Bearer | `{state}` → 防御升级 + 成员按 id 并集（客户端漏传的不丢）+ rev++ + 落盘 |
| `POST /api/member` | 公开 | `{id,name}` 改名（trim/slice20）；400 空名 / 404 未知；rev++ |
| `GET /*` | — | 静态托管，含路径穿越防护（`full.startsWith(ROOT+sep)`）；**`/data/team.json` 也会被无鉴权返回**（见 §11） |

- 鉴权：`Authorization: Bearer <token>`，`SESSIONS` Map 内存态（**重启服务会话失效**，需重新登录）。
- **无凭据概念**：`crypto` 在本项目只剩一处用途——`crypto.randomBytes(24)` 生成会话 token。密码/哈希子系统已全部移除（见 §10）。
- `/api/member` 公开是因为名称属公开团队数据（ping 已暴露），且要支持登录页改名；批量状态写入仍需鉴权。

---

## 9. 主题系统

- 三主题：`workbench` / `claude-light` / `claude-dark`，定义见 `app.js:95` `THEMES`。
- 全部颜色走 CSS 变量（`--bg/--surface/--fg/--mask/--copper/--info/--warn/--ok/--danger/--violet` 等），组件用 `color-mix()` 派生 → **新增组件只用现有变量即可三主题继承**。
- `[data-theme="claude-light"]` 有对比度 override（彩色文字 `color-mix(...,#000)` 压暗）。
- `index.html` 头部内联脚本防 FOUC；切换加 `html.theme-fade`（.42s，~460ms 自动移除）→ **读计算样式需等动画结束**。
- 响应式断点：`>760px` 路线图 4 列；`≤760px` 2 列；`≤460px` 1 列；筛选条 `flex-wrap` 自动换行。

---

## 10. 关键约定与坑

- **密码子系统已彻底移除（2026-11-12）**：`seed.js` 删掉 `SALT` / `DEFAULT_PASS='123456'` / `utf8()` / 纯 JS `sha256()` / `hashPass()`（−78 行）；`app.js` 删掉 `SAFE_HASH`、`member.passHash` 清洗、导出/分享码的剥离逻辑，`sanitizeState(s, opts)` 的 `opts` 形参（只为生成哈希而存在）连同 9 处调用的 `{local:...}` 实参一起去掉；`server.js` 删掉 v2 回填与 PUT 的凭据保留逻辑，`publicState()` 现在只剥 `_rev`。**登录只有「点成员卡片」一条路，代码里不存在任何口令概念。**
  - `data/team.json` 里遗留的 3 个 64 位 `passHash` 现在是**无人读取的惰性 JSON**（`.js/.html/.css` 全仓 grep 零命中），当前前端第一次 PUT 后即消失（已实测）。不必手改该文件。
  - `SEED` 导出从 **18** 项减为 **14** 项（去掉 `SALT` / `DEFAULT_PASS` / `sha256` / `hashPass`），见 §5。
- **`dur:''`**：课时时长留空是刻意约定，不编造。
- **URL 只核实**：见 §6；`safeUrl()` 会过滤危险协议。
- **sanitize 截断**：超长度上限会被静默截断（模块名 30 / 成员名 20 / goal 200 / 课时标题 90 / author 30）。写种子时注意。
- **分享码并集语义**：`mergeStates` 是按 id 并集，**可能复活已被删除的 catalog 模块**——这是既有 union 语义，已接受。
- **确定性 id**：新模块 id = catalog id；自定义模块用 `uid()`。改 id 策略会破坏跨设备去重。
- **IIFE 闭包**：`app.js` 函数不挂 `window`，外部（如自动化测试）只能经 DOM 交互（`element.click()`）驱动，不能直接调函数。`window.SEED` 是全局可访问的。
- **自动化选择器易踩坑**（本次实测逐个踩过，动作名以 `app.js` switch 为准，别猜）：
  - 导航 `data-action="nav"` + **`data-view`**（不是 `data-id`）；登录要点 **`.lm-enter` 按钮**（`login-enter`），点外层 `.login-member` div 无效。
  - 阶段筛选条是 **`prog-stage`**（不是 `stage-filter`）；模块库加入是 **`add-from-catalog`** → 弹窗确认 **`confirm-add-catalog`**（不是通用 `confirm-ok`）；导出是 **`export`**（不是 `export-json`）；关抽屉是 **`close-drawer`**（不是 `drawer-close`）；切主题是 **`set-theme`**（不是 `theme-set`）。
  - 进度网格容器 `#moduleGrid`，卡片 `.mod-card`；toast 撤销按钮 `.undo-btn`。
  - **每次点击后必须重新查询 DOM**：任何触发 `renderProgress()` / `renderAll()` 的操作都会重建节点，之前拿到的引用已 detached，再 `.click()` 静默无效（看起来像功能坏了，其实是测试写错了）。
  - 验证「撤销」是否真生效，别只看 toast 文案（同一 tick 内可能还没更新），要回查状态：例如撤销加入后，模块库里该模板应重新出现 `add-from-catalog` 按钮。
  - **抽屉/弹窗的可见性不是 `display`**：`.drawer-scrim` 恒为 `display:block`，靠 `.open` 类切 `opacity` + `pointer-events`（`styles.css:481`）。用 `getComputedStyle(el).display !== 'none'` 判断会**恒为 true**（假开假关）。正确判据：`el.classList.contains('open')` 或 `pointerEvents === 'auto'`；opacity 有 .25s 过渡，刚点开时读到 0 属正常。
- **真实数据**：`data/team.json` 是三人真实进度，**调试请用本地模式或隔离副本**，勿在服务运行时手改。

---

## 11. 已知限制与待办

- [x] **Git 基线已建立（2026-11-12）**：初始提交 `1608f73`（在远端 `5123f19 Initial commit` 之上 rebase，非 force push），已推送 `origin/main`。`.gitignore` 排除 `data/`，**三人真实进度与遗留 passHash 不入公开仓库**（已逐 blob 核验远端树无 `data/team.json`）。
- [ ] **清理改动尚未提交**：密码子系统移除涉及 `seed.js / app.js / server.js / index.html`，加上本文档由 `交接文档.md` 改名为 `README.md`，目前都只在工作区。
- [ ] **静态托管会暴露 `data/team.json`**：`GET /data/team.json` **无需 token 即返回完整团队 JSON**（隔离副本实测 200，含全部打卡/课时/成员，v3 副本还带遗留 passHash）。这是既有行为、非本次改动引入；符合「信任局域网」模型，但**接入不可信网络前必须堵上**（静态路由加 `data/` 黑名单，或把数据目录移出 `ROOT`）。
- [ ] **无自动化测试套件**：历史验证为临时 Node 断言 + browser-use 浏览器实测，未沉淀为可重跑测试（脚本放在系统临时目录，未入库）。建议把 §12 的断言落成 `test/` 下的可重跑脚本：catalog id 唯一 / 主线⊆catalog / `upgradeToV4` 幂等 / v3 fixture 保留打卡与自定义模块。
- [ ] **龙芯赛道确切比赛日期未核实**：相关内容窗口标「待核实」。
- [ ] **s0 基础阶段活跃模块为 0**：已掌握基础只在模块库，加入计划才出现（设计如此，非 bug）。
- [ ] **安全模型为信任局域网**：免密 + 公开改名，适合可信三人队；若暴露公网需加鉴权/限流。
- [ ] **会话内存态**：服务重启后所有 token 失效，需重新点击登录。
- [ ] **单服务实例**：无并发写锁，靠 rev + 轮询合并；极端同时写以最后一次 PUT 为准（打卡/课时按 id 并集不丢）。

---

## 12. 测试与验证

### 语法 / 种子断言（Node）

```bash
node --check app.js && node --check server.js && node --check seed.js
node -e "const S=require('./seed.js');const st=S.buildState();console.log(st.version, st.modules.length, S.catalog.length)"
```

建议断言：catalog id 唯一且符合 `SAFE_ID`、主线 ⊆ catalog、`upgradeToV4` 幂等（deep-equal）、v3 fixture 升级保留 checkins / 成员名 / 自定义模块 / 课时 ts、缺失主线只 append 一次、成员字段不含任何凭据。

### 本次清理的验证记录（2026-11-12，全部实跑）

| 项 | 结果 |
|---|---|
| `node --check app.js / server.js / seed.js` | 三个文件语法均通过 |
| 种子 + 迁移断言脚本 | **13 / 13 通过**（结构规模、id 唯一、主线⊆catalog、`dur:''`、幂等、v3 fixture 保留、只 append 一次、无凭据字段） |
| 隔离副本服务端 API 断言 | **18 / 18 通过**（ping / 登录 404 / 401 鉴权 / 免密换 token / GET 无 `_rev` / PUT rev++ / 落盘无 passHash / 公开改名 / 空名 400 / v3 防御升级 / 路径穿越 403 / logout） |
| 清理前（`git show HEAD:seed.js`）vs 清理后种子输出 | 忽略 `createdAt` / `ts` 后**仅 3 处差异，全是 3 名成员的 `passHash` 被移除**，0 处意外差异 |
| 真实 v3 数据分别经旧 / 新 `upgradeToV4` | 剥掉 `passHash` 后 **0 处差异**（迁移行为等价） |
| 仓库 `data/team.json` | **逐字节未变**（仍 v3 / `_rev` 11 / 9 模块 / 99 打卡 / 3 个遗留 passHash） |
| 浏览器全流程（browser-use + Edge，本地模式） | 7 视图全部渲染；阶段路线图点击筛选 11↔5、chips `prog-stage` s2→4 / 全部→11；课时圆点推进；抽屉开合（`.open` 类 + `pointer-events` auto↔none）；模块库加入 `cat-c-lang` → **撤销后确认已移出计划**；三主题切换（`--bg` 实测 `#f6f3eb` / `#262320` / `#0a0f0c`，localStorage 记忆）；**console 零消息（无错误无警告）** |
| 分享码独立解码回验 | `SBX1.` gzip / 28505 字符 → 解出 v4 / 31 模块 / 99 打卡，成员**仅 6 字段**、无 `passHash`、无 `_rev` |
| 导出备份拦截校验 | 125579 字节合法 JSON，v4 / 31 模块 / 99 打卡，无 `passHash`、无 `_rev`（拦截 `createObjectURL` + `a.click`，未落盘） |

> 断言脚本是临时的，放在系统临时目录（`%TEMP%/sb-cleanup/`），**未入库**；沉淀为 `test/` 见 §11 待办。
>
> **对比基线的坑（本次踩过）**：抓「清理前基线」必须在**改动之前**抓。本次第一版基线是改完 `seed.js` 之后才存的，拿它对比等于自己比自己，恒为 0 差异、毫无证明力。正确做法是从 git 取清理前版本（`git show HEAD:seed.js > "%TEMP%/sb-cleanup/seed-before.js"`）再 require 对比。

### 浏览器实测

- 环境：**chrome-devtools MCP 起不来（本机无 Chrome stable），改用 browser-use MCP（Edge 连接器）**。
- 无视口缩放工具；截图需可见表面（隐藏时用 `evaluate_script` 做 DOM/计算样式验证）。
- 本地模式测全流程：登录 → 打卡 → 进度（阶段筛选/课时/拖拽）→ 模块库加入 → 抽屉 → 硬件 → 团队 → 资料 → 数据导出导入 → 三主题 → 窄屏。
- 验收标准：**零 console 错误**；状态跨视图保持；破坏性操作可撤销。
- 服务端 API **必须用隔离副本**跑断言：复制 `server.js / seed.js / app.js / index.html / styles.css / data/team.json` 到临时目录，用 `PORT=8799` 之类的空闲端口启动 → 真实 `team.json` 全程零改动（脚本末尾再逐字节比对一次）。
- **路径穿越测试的坑**：`fetch` / `new URL()` 会先把 `/../server.js` 规范化成 `/server.js`，于是拿到 200，看起来像防护失效其实是测试写错了。要测真穿越必须用**原始 `http.request`** 发未规范化路径：`/..%2fserver.js` → **403**、`/%2e%2e%2f%2e%2e%2fWindows/win.ini` → **403**（已实测）。
- 断言里别写空函数占位（`ok('...', async () => {})` 恒过），那是假绿。

---

## 13. 改动入口速查

| 想改什么 | 去哪 |
|---|---|
| 学习路线 / 模块 / 课时 / 资料 / 硬件内容 | `seed.js`（members:14 / stages:25 / hardware:37 / modules:74 / resources:310 / newTemplates:690 / catalog:943 / routeOrder:947 / buildState:971） |
| 数据字段 / 长度上限 / 清洗 | `app.js` `sanitizeState()`（184） |
| 版本迁移逻辑 | `seed.js` `upgradeToV4()`（998）+ 三处版本门（§7） |
| 某视图渲染 | `app.js` `renderCheckin`(579) / `renderProgress`(733) / `renderCatalog`(979) / `renderHardware`(826) / `renderTeam`(850) / `renderLibrary`(917) / `renderData`(1016) |
| 路线图 / 阶段筛选 | `app.js` `renderRoadmap`(667) / `renderProgress`(733) / `setStageFilter`(1196) / `focusStage`(1189) |
| 模块库「加入计划」 | `app.js` `addFromCatalog`(1412) / `confirmAddCatalog`(1436) + `seed.js` `instantiate`(961) |
| 交互动作 | `app.js` click 委托 `switch`（1668 起）+ 各 `data-action` |
| 同步 / 合并 / 分享码 | `app.js` `persist`(327) / `pollOnce`(342) / `mergeStates`(1591) / `encodeShare`(1555) / `decodeShare`(1562) / `importShare`(1643) |
| 备份导出 / 导入 / 重置 | `app.js` `exportJSON`(1493) / `handleImportFile`(1504) / `resetAll`(1520) |
| 连接面板文案 | `app.js` `renderConnection`(1606) + `index.html` `.conn-col` |
| 服务端接口 / 鉴权 / 持久化 | `server.js` 路由（93 起）/ `loadTeam`(36) / `saveTeam`(30) / `publicState`(61) |
| 主题 / 配色 / 组件样式 / 响应式 | `styles.css`（CSS 变量 + `[data-theme]` override + `@media`）；主题定义 `app.js` `THEMES`(95) |
| 页面结构 / 视图容器 / 登录遮罩 | `index.html` |
| 启动 / 模式探测 | `app.js` `boot`(1819) |

---

## 附：术语

- **catalog / 模块库**：参考模板超集，只读浏览 + 加入计划。
- **modules / 计划**：当前活跃主线，可编辑进度。
- **phase**：生命周期位置（foundation/learn/project/compete），映射到 stage。
- **rev**：服务端状态版本号，每次写入 +1，客户端据此判断是否需合并。
- **mastered**：已掌握基础模板，加入计划即预完成。
- **legacy 双胞胎**：9 个旧模块（m-*）在 catalog 中的对应模板（cat-*），保留旧 id 衔接打卡/进度。