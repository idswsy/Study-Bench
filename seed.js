/* 学习工作台 · 团队种子数据（浏览器 / Node 共用）
 * 模块来自《详细学习方案》；资源链接均结合社区攻略/评价核实（verified），
 * type=search 为 B 站站内搜索直达，需站内确认最新合集。
 * 三名成员分工：模块 ownerId 决定归属，打卡 memberId 决定是谁学的。
 * 登录免密：点击成员卡片即进入，不存在口令与凭据。 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.SEED = api;
})(typeof self !== 'undefined' ? self : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
  'use strict';

  /* ── 团队成员（主流分工：硬件 + 控制/软件 + 视觉/算法，三人皆需会调车） ── */
  const members = [
    { id: 'me', name: '我', role: '视觉算法 · 控制主线 · 龙芯', color: '#35c46f', stageId: 's1',
      focus: 'OpenCV / MaixCam2 视觉 + 整车控制策略 + 龙芯 Linux 上位机，队长统筹框架与联调' },
    { id: 'a', name: '队友 A', role: '硬件 PCB · 电源驱动 · 机械', color: '#f0a13c', stageId: 's1',
      focus: '原理图 / 嘉立创 EDA 打样 + 电机驱动 / 电源管理 + 车模机械装配' },
    { id: 'b', name: '队友 B', role: '嵌入式控制 · PID · 电赛', color: '#4da3ff', stageId: 's1',
      focus: 'STM32 / MSPM0 固件 + PID 调参 + 编码器 / IMU + 电赛控制题真题' }
  ];

  /* ── 阶段路线图（基础 → 单项技能 → 实战练手 → 竞赛冲刺）
   * phase 决定生命周期位置；路线强调「先学什么技能 → 做什么项目 → 再学什么 → 再做什么」。 ── */
  const stages = [
    { id: 's0', name: '阶段 0 · 基础夯实', sub: 'C / Python / PID / PCB 入门', order: 0, phase: 'foundation',
      desc: '三人已掌握的共同基础：C 语言、STM32 标准库、Python、PID 理论、PCB 入门。模块库中标「已掌握」，加入计划即预完成，作为回炉查阅。' },
    { id: 's1', name: '阶段 1 · 单项技能', sub: '先学技能 + 配套小项目', order: 1, phase: 'learn',
      desc: '各方向逐项突破，每学一项技能立刻做一个配套练手项目：控制组 HAL / 速度环 / IMU，视觉组巡线 / MaixPy / 元素 / 龙芯 / 训练，硬件组模电 / 电源 / 四层板 / 驱动选型。' },
    { id: 's2', name: '阶段 2 · 实战练手', sub: '技能拼成整车 / 整机', order: 2, phase: 'project',
      desc: '把单项技能整合成完整作品：平衡车站立行走、视觉巡线跑车、MaixCam2 部署、龙芯走马观碑整车、电赛控制真题、硬件双驱板与整车联调。' },
    { id: 's3', name: '阶段 3 · 竞赛冲刺', sub: '真题 / 联调 / 开源答辩', order: 3, phase: 'compete',
      desc: '面向真实赛题冲刺：智能车走马观碑（龙芯）+ 技术报告、电赛 TI 杯四天三夜模拟、整车联调排查、开源仓库与答辩。ROS2 / 无人机为可选支线。' }
  ];

  /* ── 硬件装备（已有 + 主流分工待购，缺的可再买） ── */
  const hardware = [
    { id: 'hw-f103', name: 'STM32F103 核心板', spec: 'C8T6 最小系统 · 江协同款', owned: true, owner: 'b', tag: '已有',
      use: '标准库入门：点灯到外设', price: '已有', url: 'https://jiangxiekeji.com/index.html', note: '江协 F103 教程配套主控', moduleIds: ['m-stm32'], ts: 0 },
    { id: 'hw-f407', name: 'STM32F407 探索者', spec: '正点原子 / 野火 HAL 平台', owned: true, owner: 'b', tag: '已有',
      use: 'HAL + CubeMX 进阶 / 高性能控制', price: '已有', url: 'http://www.openedv.com/docs/boards/stm32/zdyz_stm32f407_explorerV3.html', note: 'F4 算力用于视觉联调与复杂控制', moduleIds: ['m-stm32', 'm-mspm0'], ts: 0 },
    { id: 'hw-loong', name: '龙芯 LS2K0300 学习扩展板', spec: '正点原子 ATK-DL2K0300 · LA264 1GHz · 1GB+8GB', owned: true, owner: 'me', tag: '已有',
      use: '嵌入式 Linux 主线 / 走马观碑整车', price: '已有', url: 'http://www.openedv.com/docs/boards/arm-linux/LX2K0300.html', note: '智能车走马观碑组主线平台（龙芯 LoongArch），作品须开源', moduleIds: ['m-loong'], ts: 0 },
    { id: 'hw-maixcam2', name: 'MaixCam2', spec: 'Sipeed · 爱芯 AX630C · 3.2T NPU（非 K230）', owned: true, owner: 'me', tag: '已有',
      use: '边缘 AI 视觉 / YOLO 部署', price: '已有', url: 'https://wiki.sipeed.com/hardware/zh/maixcam/maixcam2.html', note: '自带摄像头，巡线 / 检测可复用，无需另购摄像头', moduleIds: ['m-yolo', 'm-cv'], ts: 0 },
    { id: 'hw-mspm0', name: 'TI MSPM0G3507 官方 LaunchPad', spec: 'LP-MSPM0G3507 红色官方板（非立创）', owned: true, owner: 'b', tag: '已有',
      use: '电赛控制主力平台', price: '已有', url: 'https://www.ti.com.cn/tool/cn/LP-MSPM0G3507', note: '官方板配无名创新 / Torri_Yin 教程，与立创天猛星/地猛星例程不通用', moduleIds: ['m-mspm0'], ts: 0 },
    { id: 'hw-pidkit', name: '江协 PID / 倒立摆套件', spec: '课程同款 · 编码电机 + 摆杆', owned: false, owner: 'b', tag: '必买',
      use: 'PID 12 集 + 倒立摆逐节跟练', price: '≈¥399', url: 'https://jiangxiekeji.taobao.com', note: '预算有限先入 PID 套件，避免自配器件踩坑', moduleIds: ['m-pid'], ts: 0 },
    { id: 'hw-car', name: '平衡车套件 / 智能车车模', spec: '江协平衡车 ¥119 或规则指定车模', owned: false, owner: 'a', tag: '必买',
      use: '平衡车整车 / 智能车底盘', price: '≈¥119–300', url: 'https://jiangxiekeji.taobao.com', note: '练习期可用平价舵机车模替代整套数千元装备', moduleIds: ['m-pid', 'm-cv'], ts: 0 },
    { id: 'hw-motor', name: '带编码器直流减速电机 ×2', spec: '霍尔编码器 · 减速比按需', owned: false, owner: 'a', tag: '必买',
      use: '速度环闭环 / 编码器测速', price: '≈¥40–80/个', url: '', note: '立创商城 / 淘宝按型号搜索，与驱动板匹配', moduleIds: ['m-pid', 'm-stm32', 'm-mspm0'], ts: 0 },
    { id: 'hw-driver', name: '电机驱动 DRV8701 / BTN7971', spec: '双路 H 桥 · 智能车常用', owned: false, owner: 'a', tag: '必买',
      use: '电机功率驱动', price: '≈¥30–60', url: '', note: '也可用 HIP4082 分立方案，画板队友集成到底板', moduleIds: ['m-hw', 'm-pid'], ts: 0 },
    { id: 'hw-servo', name: '转向舵机', spec: '金属齿 · 扭矩按需（如 S3010）', owned: false, owner: 'a', tag: '必买',
      use: '视觉巡线转向', price: '≈¥50–120', url: '', note: '舵机 PD 转向，供电需独立稳压', moduleIds: ['m-cv', 'm-hw'], ts: 0 },
    { id: 'hw-imu', name: 'IMU 姿态传感器 MPU6050/9250', spec: 'I2C · 6/9 轴', owned: false, owner: 'b', tag: '必买',
      use: '平衡 / 出环姿态解算', price: '≈¥15–40', url: '', note: '平衡车、信标、圆环出环判定必备', moduleIds: ['m-pid', 'm-mspm0', 'm-loong'], ts: 0 },
    { id: 'hw-power', name: '锂电池 + 稳压电源管理', spec: '2S/3S 锂电 · BUCK 5V/3.3V/12V', owned: false, owner: 'a', tag: '必买',
      use: '整车供电与抗干扰', price: '≈¥60–150', url: '', note: '排查顺序先电源：供电不稳是一切问题的源头', moduleIds: ['m-hw'], ts: 0 },
    { id: 'hw-pcb', name: 'PCB 打样（嘉立创）', spec: '规则要求自制板 · 低价打样', owned: false, owner: 'a', tag: '必买',
      use: '驱动板 / 底板 / 模块板', price: '≈¥0–50', url: '', note: '嘉立创 EDA 画板 → 嘉立创打样，国产免费 EDA', moduleIds: ['m-hw'], ts: 0 },
    { id: 'hw-oled', name: 'OLED / TFT 调试屏', spec: '0.96 寸 I2C OLED', owned: false, owner: 'b', tag: '可选',
      use: '现场调试显示', price: '≈¥10–25', url: '', note: '实时看 PID 输出 / 传感器值，调参利器', moduleIds: ['m-stm32', 'm-mspm0'], ts: 0 },
    { id: 'hw-rpi', name: '树莓派 / x86 主机（ROS2）', spec: 'ROS2 不支持 LoongArch', owned: false, owner: 'me', tag: '可选',
      use: 'ROS2 导航仿真 / 上位机', price: '≈¥300–800', url: '', note: '拓展支线再购，先用虚拟机 / 旧电脑', moduleIds: ['m-ros2'], ts: 0 },
    { id: 'hw-wireless', name: '无线遥控 / 蓝牙透传', spec: '蓝牙 / 2.4G 串口透传', owned: false, owner: 'b', tag: '可选',
      use: '遥控调参 / 上位机波形', price: '≈¥15–40', url: '', note: '配合 SerialPlot 实时看曲线', moduleIds: ['m-pid', 'm-mspm0'], ts: 0 }
  ];

  /* 课时 url 均为已核实 BV；江协 PID / STM32 用 ?p=N 直达分集（B 站标准分 P 参数）。
   * 每集精确时长未逐一核实，dur 留空，避免编造；课程总时长写在资源推荐理由里。 */
  const modules = [
    {
      id: 'm-stm32', name: 'STM32 标准库 → HAL', color: '#f0b429', ownerId: 'b', stageId: 's0',
      priority: 'P0 · 基础',
      goal: '江协 F103 标准库 50 集打底（点灯→外设），再迁野火 HAL + CubeMX 上 F407，三人共同的固件基本功。',
      lessons: [
        { id: 'l-stm-1', title: 'P1–P3 课程简介 + Keil / CubeMX 安装', dur: '', url: 'https://www.bilibili.com/video/BV1th411z7sn?p=1', author: '江协科技', done: false, ts: 0 },
        { id: 'l-stm-2', title: 'P4 新建工程 + 库函数 vs 寄存器', dur: '', url: 'https://www.bilibili.com/video/BV1th411z7sn?p=4', author: '江协科技', done: false, ts: 0 },
        { id: 'l-stm-3', title: 'P5–P8 GPIO：LED / 按键 / 蜂鸣器', dur: '', url: 'https://www.bilibili.com/video/BV1th411z7sn?p=5', author: '江协科技', done: false, ts: 0 },
        { id: 'l-stm-4', title: 'P9–P10 OLED 显示驱动', dur: '', url: 'https://www.bilibili.com/video/BV1th411z7sn?p=9', author: '江协科技', done: false, ts: 0 },
        { id: 'l-stm-5', title: 'P11–P12 EXTI 中断 + 旋转编码器', dur: '', url: 'https://www.bilibili.com/video/BV1th411z7sn?p=11', author: '江协科技', done: false, ts: 0 },
        { id: 'l-stm-6', title: 'P13–P20 定时器：中断 / PWM / 输入捕获 / 编码器', dur: '', url: 'https://www.bilibili.com/video/BV1th411z7sn?p=13', author: '江协科技', done: false, ts: 0 },
        { id: 'l-stm-7', title: 'P21–P22 ADC 模数转换', dur: '', url: 'https://www.bilibili.com/video/BV1th411z7sn?p=21', author: '江协科技', done: false, ts: 0 },
        { id: 'l-stm-8', title: 'P23+ DMA / USART 串口通信', dur: '', url: 'https://www.bilibili.com/video/BV1th411z7sn?p=23', author: '江协科技', done: false, ts: 0 },
        { id: 'l-stm-9', title: 'I2C / SPI 外设（软件模拟 + 硬件）', dur: '', url: 'https://www.bilibili.com/video/BV1th411z7sn', author: '江协科技', done: false, ts: 0 },
        { id: 'l-stm-10', title: '野火 HAL 库 + CubeMX 上手', dur: '', url: 'https://www.bilibili.com/video/BV18X4y1M763', author: '野火', done: false, ts: 0 },
        { id: 'l-stm-11', title: 'F407 探索者 HAL：GPIO / 定时器 / 串口', dur: '', url: 'http://www.openedv.com/docs/boards/stm32/zdyz_stm32f407_explorerV3.html', author: '正点原子', done: false, ts: 0 }
      ],
      projects: [
        { id: 'p-stm-1', name: 'STM32 外设全家桶', desc: 'F103 标准库逐个外设点通', url: 'https://www.bilibili.com/video/BV1th411z7sn', milestones: [
          { id: 'ms-stm-1', title: '点灯 + 按键', done: false, ts: 0 },
          { id: 'ms-stm-2', title: 'OLED 显示', done: false, ts: 0 },
          { id: 'ms-stm-3', title: 'PWM 呼吸灯', done: false, ts: 0 },
          { id: 'ms-stm-4', title: '编码器测速', done: false, ts: 0 },
          { id: 'ms-stm-5', title: '串口收发', done: false, ts: 0 },
          { id: 'ms-stm-6', title: 'ADC 采集', done: false, ts: 0 },
          { id: 'ms-stm-7', title: 'I2C / SPI 外设', done: false, ts: 0 }
        ] },
        { id: 'p-stm-2', name: 'F407 HAL 迁移', desc: 'CubeMX + HAL 重写核心外设', url: 'https://www.bilibili.com/video/BV18X4y1M763', milestones: [
          { id: 'ms-stm-8', title: 'CubeMX 工程', done: false, ts: 0 },
          { id: 'ms-stm-9', title: 'HAL 点灯', done: false, ts: 0 },
          { id: 'ms-stm-10', title: 'HAL 定时器 PWM', done: false, ts: 0 },
          { id: 'ms-stm-11', title: 'HAL 串口 + DMA', done: false, ts: 0 }
        ] }
      ]
    },
    {
      id: 'm-hw', name: '硬件 PCB · 电源驱动', color: '#ff7a45', ownerId: 'a', stageId: 's1',
      priority: 'P0 · 硬件',
      goal: '嘉立创 EDA 画板 → 打样焊接 → 电机驱动 / 电源管理 / 车模机械，为整车提供可靠硬件平台。',
      lessons: [
        { id: 'l-hw-1', title: '杜洋 PCB 速成 + 嘉立创 EDA 上手', dur: '', url: 'https://www.bilibili.com/video/BV1yf4y1Q7Qb', author: '杜洋', done: false, ts: 0 },
        { id: 'l-hw-2', title: '原理图：电源 / 驱动 / 主控最小系统', dur: '', url: 'https://www.bilibili.com/video/BV1Uo61BGEUv', author: '嘉立创EDA', done: false, ts: 0 },
        { id: 'l-hw-3', title: 'PCB 布局布线 + DRC 检查', dur: '', url: 'https://www.bilibili.com/video/BV1Uo61BGEUv', author: '嘉立创EDA', done: false, ts: 0 },
        { id: 'l-hw-4', title: '嘉立创打样 + 焊接调试', dur: '', url: 'https://www.bilibili.com/video/BV1Uo61BGEUv', author: '嘉立创EDA', done: false, ts: 0 },
        { id: 'l-hw-5', title: '电机驱动 DRV8701 / BTN7971 选型', dur: '', url: 'https://m.bilibili.com/video/BV1X7E36NENG/', author: '学不会电磁场', done: false, ts: 0 },
        { id: 'l-hw-6', title: '电源管理：锂电 + BUCK 多路稳压', dur: '', url: 'https://space.bilibili.com/43584648', author: '工科男孙老师', done: false, ts: 0 },
        { id: 'l-hw-7', title: '运放 / 电源 / 抗干扰细节', dur: '', url: 'https://space.bilibili.com/43584648', author: '工科男孙老师', done: false, ts: 0 },
        { id: 'l-hw-8', title: '唐老师讲电赛：硬件方法论 + 报告', dur: '', url: 'https://space.bilibili.com/28143041', author: '唐老师讲电赛', done: false, ts: 0 }
      ],
      projects: [
        { id: 'p-hw-1', name: '平衡车底板', desc: '两层主控底板：原理图 → 布线 → 打样 → 焊接上电', url: 'https://www.bilibili.com/video/BV1Uo61BGEUv', milestones: [
          { id: 'ms-hw-1', title: '原理图', done: false, ts: 0 },
          { id: 'ms-hw-2', title: 'PCB 布线', done: false, ts: 0 },
          { id: 'ms-hw-3', title: '嘉立创打样', done: false, ts: 0 },
          { id: 'ms-hw-4', title: '焊接 + 上电测试', done: false, ts: 0 }
        ] },
        { id: 'p-hw-2', name: '整车硬件平台', desc: '驱动 / 电源 / 机械 / 线束', url: '', milestones: [
          { id: 'ms-hw-5', title: '电机驱动板', done: false, ts: 0 },
          { id: 'ms-hw-6', title: '电源管理板', done: false, ts: 0 },
          { id: 'ms-hw-7', title: '车模机械装配', done: false, ts: 0 },
          { id: 'ms-hw-8', title: '整车线束 + 抗干扰', done: false, ts: 0 }
        ] }
      ]
    },
    {
      id: 'm-pid', name: '平衡车与串级 PID', color: '#f0a13c', ownerId: 'b', stageId: 's1',
      priority: 'P0 · 控制',
      goal: '江协 PID 12 集（约 8.3h）逐节跟练 → 倒立摆 → 平衡车：速度环、角度环、串级 PID 调参闭环。',
      lessons: [
        { id: 'l-pid-1', title: 'P1 课程简介', dur: '', url: 'https://www.bilibili.com/video/BV1G9zdYQEr3?p=1', author: '江协科技', done: false, ts: 0 },
        { id: 'l-pid-2', title: 'P2 PID 基本原理', dur: '', url: 'https://www.bilibili.com/video/BV1G9zdYQEr3?p=2', author: '江协科技', done: false, ts: 0 },
        { id: 'l-pid-3', title: 'P3 离散 PID & 程序实现思路', dur: '', url: 'https://www.bilibili.com/video/BV1G9zdYQEr3?p=3', author: '江协科技', done: false, ts: 0 },
        { id: 'l-pid-4', title: 'P4 基础驱动代码 & 编码电机 & SerialPlot', dur: '', url: 'https://www.bilibili.com/video/BV1G9zdYQEr3?p=4', author: '江协科技', done: false, ts: 0 },
        { id: 'l-pid-5', title: 'P5 PID 闭环控制实验', dur: '', url: 'https://www.bilibili.com/video/BV1G9zdYQEr3?p=5', author: '江协科技', done: false, ts: 0 },
        { id: 'l-pid-6', title: 'P6 积分限幅 · 积分分离 · 变速积分', dur: '', url: 'https://www.bilibili.com/video/BV1G9zdYQEr3?p=6', author: '江协科技', done: false, ts: 0 },
        { id: 'l-pid-7', title: 'P7 微分先行 · 不完全微分', dur: '', url: 'https://www.bilibili.com/video/BV1G9zdYQEr3?p=7', author: '江协科技', done: false, ts: 0 },
        { id: 'l-pid-8', title: 'P8 输出偏移 · 输入死区', dur: '', url: 'https://www.bilibili.com/video/BV1G9zdYQEr3?p=8', author: '江协科技', done: false, ts: 0 },
        { id: 'l-pid-9', title: 'P9 双环 PID 原理 · 定速定位置', dur: '', url: 'https://www.bilibili.com/video/BV1G9zdYQEr3?p=9', author: '江协科技', done: false, ts: 0 },
        { id: 'l-pid-10', title: 'P10 倒立摆系统设计 · 驱动完善', dur: '', url: 'https://www.bilibili.com/video/BV1G9zdYQEr3?p=10', author: '江协科技', done: false, ts: 0 },
        { id: 'l-pid-11', title: 'P11 倒立摆程序实现', dur: '', url: 'https://www.bilibili.com/video/BV1G9zdYQEr3?p=11', author: '江协科技', done: false, ts: 0 },
        { id: 'l-pid-12', title: 'P12 倒立摆自动启摆', dur: '', url: 'https://www.bilibili.com/video/BV1G9zdYQEr3?p=12', author: '江协科技', done: false, ts: 0 }
      ],
      projects: [
        { id: 'p-pid-1', name: '倒立摆串级 PID', desc: '角度环 + 速度环逐环调参', url: 'https://www.bilibili.com/video/BV1SVETzaE2P', milestones: [
          { id: 'ms-pid-1', title: '机械装配 + 驱动完善', done: false, ts: 0 },
          { id: 'ms-pid-2', title: '角度环站立 ≥ 10 秒', done: false, ts: 0 },
          { id: 'ms-pid-3', title: '速度环 + 串级联调', done: false, ts: 0 },
          { id: 'ms-pid-4', title: '自动启摆', done: false, ts: 0 }
        ] },
        { id: 'p-pid-2', name: '平衡车整车', desc: '直立 + 速度 + 转向三环', url: 'https://www.bilibili.com/video/BV1kBanzfExg', milestones: [
          { id: 'ms-pid-5', title: '车模装配 + 接线', done: false, ts: 0 },
          { id: 'ms-pid-6', title: '直立环调通', done: false, ts: 0 },
          { id: 'ms-pid-7', title: '速度环 + 转向环', done: false, ts: 0 },
          { id: 'ms-pid-8', title: '遥控行走 + 抗扰', done: false, ts: 0 }
        ] }
      ]
    },
    {
      id: 'm-cv', name: 'OpenCV 视觉巡线', color: '#4da3ff', ownerId: 'me', stageId: 's1',
      priority: 'P1 · 视觉',
      goal: '采集→灰度→二值化(Otsu)→扫线→补线→中线偏差→舵机 PD + 电机 PID，十字/圆环/坡道元素识别，为智能车打底。',
      lessons: [
        { id: 'l-cv-1', title: 'Python + NumPy 基础补完（切片 / 广播）', dur: '', url: 'https://www.bilibili.com/video/BV1hE411t7RN', author: '我是土堆', done: false, ts: 0 },
        { id: 'l-cv-2', title: 'OpenCV 环境 + MaixCam2 / 摄像头读帧', dur: '', url: 'https://book.openmv.cc/', author: '星瞳科技', done: false, ts: 0 },
        { id: 'l-cv-3', title: '灰度化 + 二值化（Otsu 自适应阈值）', dur: '', url: 'https://singtown.com/learn', author: '星瞳科技', done: false, ts: 0 },
        { id: 'l-cv-4', title: 'ROI + 底部向上扫线提取左右边线', dur: '', url: 'https://www.bilibili.com/video/BV1KF4tz3EZw', author: 'JNU智能车协会', done: false, ts: 0 },
        { id: 'l-cv-5', title: '补线 + 中线偏差计算', dur: '', url: 'https://github.com/ittuann/Awesome-IntelligentCarRace', author: 'ittuann', done: false, ts: 0 },
        { id: 'l-cv-6', title: '动态前瞻 + 速度决策', dur: '', url: 'https://m.blog.csdn.net/yck1716/article/details/135669666', author: '社区口碑整理', done: false, ts: 0 },
        { id: 'l-cv-7', title: '十字 / 圆环 / 坡道元素识别状态机', dur: '', url: 'https://gitee.com/joshua_xu/the-18th-smartcar', author: 'joshua_xu', done: false, ts: 0 },
        { id: 'l-cv-8', title: '舵机 PD + 电机 PID，视觉输出接控制', dur: '', url: 'https://www.bilibili.com/video/BV1KF4tz3EZw', author: 'JNU智能车协会', done: false, ts: 0 },
        { id: 'l-cv-9', title: '星瞳 OpenMV 巡线小车对照（20 / 21 集）', dur: '', url: 'https://space.bilibili.com/22215525', author: '星瞳科技', done: false, ts: 0 }
      ],
      projects: [
        { id: 'p-cv-1', name: '视觉巡线全链路', desc: '从读帧到实车跑完一圈', url: 'https://singtown.com/learn', milestones: [
          { id: 'ms-cv-1', title: '读帧 + 灰度显示', done: false, ts: 0 },
          { id: 'ms-cv-2', title: '二值化 + 边线提取', done: false, ts: 0 },
          { id: 'ms-cv-3', title: '中线偏差 + 舵机转向', done: false, ts: 0 },
          { id: 'ms-cv-4', title: '元素识别状态机', done: false, ts: 0 },
          { id: 'ms-cv-5', title: '实车联调跑完一圈', done: false, ts: 0 }
        ] }
      ]
    },
    {
      id: 'm-loong', name: '龙芯 2K0300 嵌入式 Linux', color: '#35c46f', ownerId: 'me', stageId: 's2',
      priority: 'P0–P2 · 主线',
      goal: '正点原子 ATK-DL2K0300 上手 → 交叉编译 / 驱动 / 外设 / 摄像头采集，龙芯 LoongArch 嵌入式 Linux 基本功，为走马观碑整车打底。',
      lessons: [
        { id: 'l-loong-1', title: '板卡上电 + 串口登录系统', dur: '', url: 'http://www.openedv.com/docs/boards/arm-linux/LX2K0300.html', author: '正点原子', done: false, ts: 0 },
        { id: 'l-loong-2', title: '文档通读 + A / B 盘资料下载', dur: '', url: 'https://www.bilibili.com/video/BV1ohPseYEdf', author: '正点原子', done: false, ts: 0 },
        { id: 'l-loong-3', title: 'Linux 开发环境 + 交叉编译工具链', dur: '', url: 'http://www.openedv.com/docs/boards/arm-linux/LX2K0300.html', author: '正点原子', done: false, ts: 0 },
        { id: 'l-loong-4', title: '交叉编译 Hello World 上板运行', dur: '', url: 'https://gitcode.com/open-loongarch/docs-2k0300', author: 'open-loongarch', done: false, ts: 0 },
        { id: 'l-loong-5', title: 'GPIO / LED 字符设备驱动', dur: '', url: 'http://www.openedv.com/docs/boards/arm-linux/LX2K0300.html', author: '正点原子', done: false, ts: 0 },
        { id: 'l-loong-6', title: 'I2C / SPI 外设（OLED / IMU）', dur: '', url: 'http://www.openedv.com/docs/boards/arm-linux/LX2K0300.html', author: '正点原子', done: false, ts: 0 },
        { id: 'l-loong-7', title: '摄像头采集 + OpenCV 交叉编译', dur: '', url: 'https://space.bilibili.com/394620890', author: '正点原子', done: false, ts: 0 },
        { id: 'l-loong-8', title: '多线程 / 网络通信上位机', dur: '', url: 'https://space.bilibili.com/394620890', author: '正点原子', done: false, ts: 0 }
      ],
      projects: [
        { id: 'p-loong-1', name: '龙芯外设驱动练手', desc: '交叉编译 / GPIO / I2C / SPI / 摄像头', url: 'http://www.openedv.com/docs/boards/arm-linux/LX2K0300.html', milestones: [
          { id: 'ms-loong-1', title: '交叉编译环境跑通', done: false, ts: 0 },
          { id: 'ms-loong-2', title: 'GPIO / LED 字符设备驱动', done: false, ts: 0 },
          { id: 'ms-loong-3', title: 'I2C / SPI 外设（OLED / IMU）', done: false, ts: 0 },
          { id: 'ms-loong-4', title: '摄像头采集 + OpenCV 交叉编译', done: false, ts: 0 },
          { id: 'ms-loong-5', title: '多线程 / 网络上位机', done: false, ts: 0 }
        ] }
      ]
    },
    {
      id: 'm-yolo', name: 'MaixCam2 边缘 AI 部署', color: '#e05fd0', ownerId: 'me', stageId: 's2',
      priority: 'P2 · 边缘AI',
      goal: 'PyTorch → YOLOv8 训练 → MaixHub 转换上板：MaixCam2（爱芯 AX630C · 3.2T NPU）目标检测落地。',
      lessons: [
        { id: 'l-yolo-1', title: '土堆 PyTorch 入门跟练（tensor / 训练）', dur: '', url: 'https://www.bilibili.com/video/BV1hE411t7RN', author: '我是土堆', done: false, ts: 0 },
        { id: 'l-yolo-2', title: 'YOLOv8 官方推理跑通', dur: '', url: 'https://www.bilibili.com/video/BV1dW4y1U7GJ', author: '霹雳吧啦Wz', done: false, ts: 0 },
        { id: 'l-yolo-3', title: 'MaixCam2 开箱 + MaixPy 环境（AX630C）', dur: '', url: 'https://wiki.sipeed.com/hardware/zh/maixcam/maixcam2.html', author: 'Sipeed', done: false, ts: 0 },
        { id: 'l-yolo-4', title: 'MaixPy 摄像头 / 显示 / NN API', dur: '', url: 'https://wiki.sipeed.com/maixpy/doc/index.html', author: 'Sipeed', done: false, ts: 0 },
        { id: 'l-yolo-5', title: '自采数据集标注 + 训练', dur: '', url: 'https://wiki.sipeed.com/maixpy/doc/zh/vision/customize_model_yolov8.html', author: 'Sipeed', done: false, ts: 0 },
        { id: 'l-yolo-6', title: 'MaixHub 在线训练 / 网页转换模型', dur: '', url: 'https://maixhub.com/', author: 'Sipeed', done: false, ts: 0 },
        { id: 'l-yolo-7', title: 'YOLOv5 / v8 → .mud / .cvimodel 部署', dur: '', url: 'https://en.wiki.sipeed.com/maixpy/doc/zh/vision/yolov5.html', author: 'Sipeed', done: false, ts: 0 },
        { id: 'l-yolo-8', title: '上板实时检测调优（帧率 / 光照）', dur: '', url: 'https://www.bilibili.com/video/BV1ZX5C6dE8W', author: '方向标studyhard', done: false, ts: 0 }
      ],
      projects: [
        { id: 'p-yolo-1', name: 'MaixCam2 目标检测落地', desc: '采集 → 训练 → 转换 → 上板', url: 'https://maixhub.com/', milestones: [
          { id: 'ms-yolo-1', title: 'MaixPy 环境 + 摄像头', done: false, ts: 0 },
          { id: 'ms-yolo-2', title: '数据集采集标注', done: false, ts: 0 },
          { id: 'ms-yolo-3', title: '模型训练 / 转换', done: false, ts: 0 },
          { id: 'ms-yolo-4', title: '上板实时检测 ≥ 15 FPS', done: false, ts: 0 }
        ] }
      ]
    },
    {
      id: 'm-mspm0', name: 'MSPM0 电赛控制（TI 官方板）', color: '#ff6b57', ownerId: 'b', stageId: 's2',
      priority: 'P2–P3 · 电赛',
      goal: 'TI 官方 LP-MSPM0G3507（非立创）：无名创新 / Torri_Yin 例程 + TI Academy，外设全家桶 → 控制题真题演练。',
      lessons: [
        { id: 'l-m0-1', title: 'MSPM0-SDK + CCS + SysConfig 环境', dur: '', url: 'https://www.ti.com.cn/tool/cn/LP-MSPM0G3507', author: 'Texas Instruments', done: false, ts: 0 },
        { id: 'l-m0-2', title: '无名创新例程：GPIO / 点灯 / 按键', dur: '', url: 'https://www.bilibili.com/video/BV1Ei421Q7n9', author: '无名创新', done: false, ts: 0 },
        { id: 'l-m0-3', title: 'I2C OLED 显示 + 串口通信', dur: '', url: 'https://gitee.com/namelesstech/lp_mspm0g3507_mini_examples', author: '无名创新', done: false, ts: 0 },
        { id: 'l-m0-4', title: '定时器 + PWM 电机驱动', dur: '', url: 'https://gitee.com/namelesstech/lp_mspm0g3507_mini_examples', author: '无名创新', done: false, ts: 0 },
        { id: 'l-m0-5', title: 'ADC / DAC + 编码器测速', dur: '', url: 'https://gitee.com/namelesstech/lp_mspm0g3507_mini_examples', author: '无名创新', done: false, ts: 0 },
        { id: 'l-m0-6', title: 'SPI + MPU6050 姿态读取（I2C）', dur: '', url: 'https://www.bilibili.com/video/BV1Ei421Q7n9', author: '无名创新', done: false, ts: 0 },
        { id: 'l-m0-7', title: 'Torri_Yin 进阶例程对照', dur: '', url: 'https://www.bilibili.com/video/BV117421o7zz', author: 'Torri_Yin', done: false, ts: 0 },
        { id: 'l-m0-8', title: 'TI Academy 官方培训补强', dur: '', url: 'https://dev.ti.com/', author: 'Texas Instruments', done: false, ts: 0 }
      ],
      projects: [
        { id: 'p-m0-1', name: 'MSPM0 电赛控制题', desc: '官方板外设 → 闭环 → 真题', url: 'https://www.ti.com.cn/tool/cn/LP-MSPM0G3507', milestones: [
          { id: 'ms-m0-1', title: '外设全家桶跑通', done: false, ts: 0 },
          { id: 'ms-m0-2', title: '电机闭环 + 编码器', done: false, ts: 0 },
          { id: 'ms-m0-3', title: 'IMU 姿态 + 云台', done: false, ts: 0 },
          { id: 'ms-m0-4', title: '往年控制题真题演练 1 题', done: false, ts: 0 },
          { id: 'ms-m0-5', title: '满分报告 + 作品文档', done: false, ts: 0 }
        ] }
      ]
    },
    {
      id: 'm-ros2', name: 'ROS2 与导航（拓展支线）', color: '#2fd4c4', ownerId: 'b', stageId: 's3',
      priority: 'P4 · 拓展',
      goal: '鱼香一键 / 古月 21 讲 → 建图导航仿真。ROS2 不支持 LoongArch，跑在 x86 / 树莓派上。',
      lessons: [
        { id: 'l-ros-1', title: 'Ubuntu 22.04 虚拟机 / 双系统', dur: '', url: 'https://fishros.com/', author: '鱼香ROS', done: false, ts: 0 },
        { id: 'l-ros-2', title: '鱼香一键安装 ROS2 Humble', dur: '', url: 'https://www.bilibili.com/video/BV1PT4y1o7JA', author: '鱼香ROS', done: false, ts: 0 },
        { id: 'l-ros-3', title: '古月 21 讲：架构 + 话题 / 服务', dur: '', url: 'https://www.bilibili.com/video/BV16B4y1Q7jQ', author: '古月居', done: false, ts: 0 },
        { id: 'l-ros-4', title: '古月 21 讲：参数 / 动作 / 坐标变换', dur: '', url: 'https://www.bilibili.com/video/BV16B4y1Q7jQ', author: '古月居', done: false, ts: 0 },
        { id: 'l-ros-5', title: 'Gazebo 仿真小车建图', dur: '', url: 'https://gitee.com/guyuehome/', author: '古月居', done: false, ts: 0 },
        { id: 'l-ros-6', title: 'Nav2 导航指定点巡航', dur: '', url: 'http://fishros.org/doc/ros2/humble/', author: '鱼香ROS', done: false, ts: 0 }
      ],
      projects: [
        { id: 'p-ros-1', name: 'ROS2 导航仿真', desc: '仿真建图 → Nav2 巡航', url: 'https://www.bilibili.com/video/BV16B4y1Q7jQ', milestones: [
          { id: 'ms-ros-1', title: '环境 + 21 讲前 10 讲', done: false, ts: 0 },
          { id: 'ms-ros-2', title: '话题 / 服务实操', done: false, ts: 0 },
          { id: 'ms-ros-3', title: 'Gazebo 建图', done: false, ts: 0 },
          { id: 'ms-ros-4', title: 'Nav2 巡航', done: false, ts: 0 }
        ] }
      ]
    },
    {
      id: 'm-drone', name: '无人机（可选支线）', color: '#9d7bff', ownerId: 'a', stageId: 's3',
      priority: '可选 · 决策',
      goal: '江协四轴教程：姿态解算 + 串级 PID。先看完简介评估时间成本，再决定是否投入。',
      lessons: [
        { id: 'l-dr-1', title: '四轴教程简介 + 投入决策', dur: '', url: 'https://www.bilibili.com/video/BV1WXNx68EKW', author: '江协科技', done: false, ts: 0 },
        { id: 'l-dr-2', title: '姿态解算（互补滤波 / Mahony）', dur: '', url: 'https://www.bilibili.com/video/BV12o5vzwEPp', author: '江协科技', done: false, ts: 0 },
        { id: 'l-dr-3', title: '四轴串级 PID 调参', dur: '', url: 'https://www.bilibili.com/video/BV1WXNx68EKW', author: '江协科技', done: false, ts: 0 },
        { id: 'l-dr-4', title: '定高 / 定点飞行测试', dur: '', url: 'https://search.bilibili.com/all?keyword=%E5%8C%BF%E5%90%8D%E7%A7%91%E5%88%9B%20%E9%A3%9E%E6%8E%A7', author: '匿名科创', done: false, ts: 0 }
      ],
      projects: [
        { id: 'p-dr-1', name: '四轴飞行器（支线）', desc: '机架 → 姿态 → PID → 试飞', url: 'https://www.bilibili.com/video/BV1WXNx68EKW', milestones: [
          { id: 'ms-dr-1', title: '机架 + 电调装配', done: false, ts: 0 },
          { id: 'ms-dr-2', title: '姿态解算稳定', done: false, ts: 0 },
          { id: 'ms-dr-3', title: '串级 PID 调参', done: false, ts: 0 },
          { id: 'ms-dr-4', title: '定高定点试飞', done: false, ts: 0 }
        ] }
      ]
    }
  ];

  const resources = [
    /* ── 平衡车与串级 PID ── */
    { id: 'r01', moduleId: 'm-pid', type: 'video', verified: true, fav: true,
      title: '江协科技 · PID 入门教程（竞赛级）', author: '江协科技',
      url: 'https://www.bilibili.com/video/BV1G9zdYQEr3',
      reason: '官方电赛 / 智能车通知引用的 PID 课程，配套套件 + 开源资料，江协式跟练首选。',
      tags: ['PID', '套件跟练', '口碑首选'] },
    { id: 'r02', moduleId: 'm-pid', type: 'video', verified: true,
      title: '江协科技 · PID 课程简介 [0]', author: '江协科技',
      url: 'https://www.bilibili.com/video/BV12AyEBuEcy',
      reason: '先看简介确认套件清单与学习路径，再决定下单，避免买错版本。',
      tags: ['课程导览'] },
    { id: 'r03', moduleId: 'm-pid', type: 'video', verified: true, fav: true,
      title: '江协科技 · 倒立摆串级 PID', author: '江协科技',
      url: 'https://www.bilibili.com/video/BV1SVETzaE2P',
      reason: '串级 PID 实战：角度环 + 速度环逐环调参，是平衡车的前置项目。',
      tags: ['串级PID', '倒立摆', '实战'] },
    { id: 'r04', moduleId: 'm-pid', type: 'doc', verified: true,
      title: '江协官网 · 资料下载站', author: '江协科技',
      url: 'https://jiangxiekeji.com/download.html',
      reason: '课件 / 源码 / 工具官方下载入口，视频配套资料必备。',
      tags: ['课件', '源码'] },
    { id: 'r05', moduleId: 'm-pid', type: 'tool', verified: true,
      title: '江协淘宝店（PID 套件 ¥399 / 平衡车 ¥119）', author: '江协科技',
      url: 'https://jiangxiekeji.taobao.com',
      reason: '课程同款硬件，避免自配器件踩坑；预算有限先入 PID 套件。',
      tags: ['采购', '套件'] },
    { id: 'r06', moduleId: 'm-pid', type: 'video', verified: true,
      title: '江协科技 · 平衡车入门教程（11 集 / 约 6 小时）', author: '江协科技',
      url: 'https://www.bilibili.com/video/BV1kBanzfExg',
      reason: '倒立摆之后接续：直立环 + 速度环 + 转向环三环联调，平衡车整车跟练。',
      tags: ['平衡车', '整车', '实战'] },
    { id: 'r07', moduleId: 'm-pid', type: 'search', verified: false,
      title: 'DR_CAN · 控制理论（PID / 卡尔曼 / MPC）', author: 'DR_CAN',
      url: 'https://search.bilibili.com/all?keyword=DR_CAN',
      reason: 'Clemson 博士、《控制之美》作者，千万播放控制科普；调参遇到理论瓶颈时补。',
      tags: ['控制理论', '进阶', '搜索直达'] },

    /* ── OpenCV 视觉巡线 ── */
    { id: 'r08', moduleId: 'm-cv', type: 'doc', verified: true, fav: true,
      title: '星瞳 OpenMV 官方视频教程（全套）', author: '星瞳科技',
      url: 'https://singtown.com/learn',
      reason: 'OpenMV 官方中文教程：巡线小车 / 颜色识别 / 串口通信全套，社区评价上手最快。',
      tags: ['OpenMV', '官方', '巡线'] },
    { id: 'r09', moduleId: 'm-cv', type: 'video', verified: true,
      title: '星瞳 OpenMV · B 站空间（网红小智智）', author: '星瞳科技',
      url: 'https://space.bilibili.com/22215525',
      reason: '官方视频合集入口：20 巡线小车、21 追物小车、27/28 串口收发直接对口智能车。',
      tags: ['OpenMV', 'B站合集'] },
    { id: 'r10', moduleId: 'm-cv', type: 'doc', verified: true,
      title: 'OpenMV 中文入门教程（图文书）', author: '星瞳科技',
      url: 'https://book.openmv.cc/',
      reason: '官方图文教程，函数级查阅手册，配合视频边做边查。',
      tags: ['手册', '图文'] },
    { id: 'r11', moduleId: 'm-cv', type: 'video', verified: true,
      title: '2025 智能车协会软件视觉培训（部分）', author: 'JNU智能车协会',
      url: 'https://www.bilibili.com/video/BV1KF4tz3EZw',
      reason: '高校智能车协会视觉培训实录，贴近赛题的巡线 / 元素处理思路，社区口碑好。',
      tags: ['智能车', '视觉培训'] },
    { id: 'r12', moduleId: 'm-cv', type: 'code', verified: true, fav: true,
      title: 'Awesome-IntelligentCarRace 开源汇总', author: 'ittuann',
      url: 'https://github.com/ittuann/Awesome-IntelligentCarRace',
      reason: '智能车历年开源方案索引（网页版 ittuann.github.io），找同组别参考代码第一站。',
      tags: ['智能车', '开源索引'] },
    { id: 'r13', moduleId: 'm-cv', type: 'doc', verified: true,
      title: '智能车入门资料归纳（社区口碑版）', author: 'CSDN · yck1716',
      url: 'https://m.blog.csdn.net/yck1716/article/details/135669666',
      reason: '社区整理：__苏格拉没有底___ 思路必看（动态前瞻 / 速度决策）、哈鲁啊丁入门必看、北邮智能车小白友好。',
      tags: ['口碑整理', 'UP主索引'] },
    { id: 'r14', moduleId: 'm-cv', type: 'code', verified: true,
      title: '18 届四轮组开源方案', author: 'joshua_xu',
      url: 'https://gitee.com/joshua_xu/the-18th-smartcar',
      reason: '完整开源工程，对照学习「图像 → 决策 → 控制」闭环写法。',
      tags: ['开源工程', '四轮组'] },
    { id: 'r15', moduleId: 'm-cv', type: 'video', verified: true,
      title: '卓晴老师 · B 站空间', author: '卓晴（竞赛秘书处）',
      url: 'https://space.bilibili.com/213206285',
      reason: '智能车竞赛秘书处卓晴老师：赛题解读、规则答疑的权威来源，备赛必看。',
      tags: ['赛题解读', '官方'] },
    { id: 'r16', moduleId: 'm-cv', type: 'doc', verified: true,
      title: '英飞凌 AI 越野组入门教程（逐飞编写）', author: '逐飞科技',
      url: 'https://community.infineon.com/t5/博客/英飞凌AI越野组入门教程-逐飞科技/bc-p/546223',
      reason: '逐飞官方编写的 AI 组别入门路径，视觉 + 控制结合的参考框架。',
      tags: ['AI组', '逐飞'] },

    /* ── 龙芯 2K0300 ── */
    { id: 'r17', moduleId: 'm-loong', type: 'doc', verified: true, fav: true,
      title: '正点原子 · 2K0300 官方文档', author: '正点原子',
      url: 'http://www.openedv.com/docs/boards/arm-linux/LX2K0300.html',
      reason: '学习扩展板配套教程主入口：系统烧录 / 交叉编译 / 驱动例程，主线学习地图。',
      tags: ['官方文档', '主线'] },
    { id: 'r18', moduleId: 'm-loong', type: 'video', verified: true,
      title: '正点原子 · 2K0300 开发板详解', author: '正点原子',
      url: 'https://www.bilibili.com/video/BV1ohPseYEdf',
      reason: '板卡资源与上手路线视频版，动手前先看一遍建立全貌。',
      tags: ['板卡详解'] },
    { id: 'r19', moduleId: 'm-loong', type: 'video', verified: true,
      title: '正点原子 · B 站空间', author: '正点原子',
      url: 'https://space.bilibili.com/394620890',
      reason: '后续 Linux 驱动 / 应用系列教程更新入口，嵌入式口碑大厂。',
      tags: ['教程更新'] },
    { id: 'r20', moduleId: 'm-loong', type: 'doc', verified: true,
      title: '2K0300 文档（GitCode 镜像）', author: 'open-loongarch',
      url: 'https://gitcode.com/open-loongarch/docs-2k0300',
      reason: '国内访问快的文档镜像，网络不好时的备用查阅入口。',
      tags: ['镜像', '文档'] },
    { id: 'r21', moduleId: 'm-loong', type: 'tool', verified: true,
      title: 'A 盘 · 资料与工具（提取码 p3fj）', author: '正点原子',
      url: 'https://pan.baidu.com/s/14iTGZqW3RNRbqvXcDfaR0w',
      reason: '官方资料盘：系统镜像 / 工具链 / 例程源码，提取码 p3fj。',
      tags: ['资料盘', '镜像'] },
    { id: 'r22', moduleId: 'm-loong', type: 'tool', verified: true,
      title: 'B 盘 · 预装开发环境虚拟机（提取码 u8he）', author: '正点原子',
      url: 'https://pan.baidu.com/s/1nJwEfe3hHDLIUBKQ03yenw',
      reason: '预装交叉编译环境的虚拟机，省去环境搭建弯路，提取码 u8he。',
      tags: ['虚拟机', '环境'] },

    /* ── YOLO 与 MaixCAM ── */
    { id: 'r23', moduleId: 'm-yolo', type: 'video', verified: true, fav: true,
      title: '我是土堆 · PyTorch 深度学习快速入门', author: '我是土堆',
      url: 'https://www.bilibili.com/video/BV1hE411t7RN',
      reason: '多篇社区评测一致推荐：有 Python 基础者实操首选，环境配置 → 训练 → 可视化全程跟练。',
      tags: ['PyTorch', '口碑首选'] },
    { id: 'r24', moduleId: 'm-yolo', type: 'code', verified: true,
      title: '土堆配套代码 · PyTorch-Tutorial', author: '我是土堆',
      url: 'https://github.com/xiaotudui/PyTorch-Tutorial',
      reason: '课程逐节源码，边看边跑，报错先对照仓库 issue。',
      tags: ['配套源码'] },
    { id: 'r25', moduleId: 'm-yolo', type: 'video', verified: true,
      title: '霹雳吧啦Wz · YOLOv8 一小时入门', author: '霹雳吧啦Wz',
      url: 'https://www.bilibili.com/video/BV1dW4y1U7GJ',
      reason: 'YOLO 教程汇总文推荐的零基础入口：安装 + 推理 + 自定义数据集训练一次跑通。',
      tags: ['YOLOv8', '入门'] },
    { id: 'r26', moduleId: 'm-yolo', type: 'doc', verified: true,
      title: 'MaixPy 文档（Sipeed 官方 · 含 MaixCam2）', author: 'Sipeed',
      url: 'https://wiki.sipeed.com/maixpy/doc/index.html',
      reason: 'MaixCam2（爱芯 AX630C）官方中文文档：摄像头 / 显示 / NN API 一手资料，部署前必读。',
      tags: ['MaixCam2', '官方', 'AX630C'] },
    { id: 'r27', moduleId: 'm-yolo', type: 'tool', verified: true,
      title: 'MaixHub 在线训练 / 模型转换', author: 'Sipeed',
      url: 'https://maixhub.com/',
      reason: '免本地训练环境：采集 → 标注 → 训练 → 部署全流程，无显卡也能玩。',
      tags: ['在线训练', '零门槛'] },
    { id: 'r28', moduleId: 'm-yolo', type: 'doc', verified: true,
      title: 'MaixPy 离线训练 YOLOv8 自定义模型', author: 'Sipeed',
      url: 'https://wiki.sipeed.com/maixpy/doc/zh/vision/customize_model_yolov8.html',
      reason: '自采数据集训练 YOLOv8 并导出上板；注意文档要求的 ultralytics 版本与 opset。',
      tags: ['YOLOv8', '自定义训练'] },
    { id: 'r29', moduleId: 'm-yolo', type: 'video', verified: true,
      title: 'MaixCAM 部署 YOLO 实测演示', author: '方向标studyhard',
      url: 'https://www.bilibili.com/video/BV1ZX5C6dE8W',
      reason: '上板部署效果直观参考：帧率、识别距离、光照影响一目了然。',
      tags: ['实测', '部署效果'] },

    /* ── 硬件 PCB · 电源驱动（队友 A） ── */
    { id: 'r37', moduleId: 'm-hw', type: 'video', verified: true, fav: true,
      title: '嘉立创 EDA 专业版 · 电赛 / 智能车 PCB 实战', author: '嘉立创EDA',
      url: 'https://www.bilibili.com/video/BV1Uo61BGEUv',
      reason: '电赛模块 / 智能车 / 江协 PID 板 / 平衡车底板实战画板，国产 EDA 免费 + 打样便宜。',
      tags: ['嘉立创', 'PCB实战', '口碑首选'] },
    { id: 'r38', moduleId: 'm-hw', type: 'video', verified: true,
      title: '杜洋 · PCB 速成', author: '杜洋',
      url: 'https://www.bilibili.com/video/BV1yf4y1Q7Qb',
      reason: '零基础快速入门画板经典课，画板队友进阶参考。',
      tags: ['PCB入门'] },
    { id: 'r39', moduleId: 'm-hw', type: 'video', verified: true,
      title: '工科男孙老师 · B 站空间', author: '工科男孙老师',
      url: 'https://space.bilibili.com/43584648',
      reason: '硬件设计口碑 UP：电源 / 运放 / PCB 细节讲解，模电基础补强。',
      tags: ['硬件设计', '模电', '电源'] },
    { id: 'r36', moduleId: 'm-hw', type: 'video', verified: true,
      title: '唐老师讲电赛 · B 站空间', author: '唐老师讲电赛',
      url: 'https://space.bilibili.com/28143041',
      reason: '20 年电赛指导经验：PCB 极速入门、满分报告写法，备赛方法论权威。',
      tags: ['电赛方法论', '报告'] },
    { id: 'r33', moduleId: 'm-hw', type: 'video', verified: true,
      title: '小车底板 PCB 手把手教画', author: '学不会电磁场',
      url: 'https://m.bilibili.com/video/BV1X7E36NENG/',
      reason: '开源迷你小车底板：差速 / 舵机转向通用，画板队友可直接参考布线。',
      tags: ['PCB', '小车底板', '开源'] },
    { id: 'r54', moduleId: 'm-hw', type: 'tool', verified: true,
      title: '嘉立创 EDA 官网（在线画板）', author: '嘉立创',
      url: 'https://lceda.cn/',
      reason: '国产免费 EDA，原理图 → PCB → 一键打样，队友 A 主力画板工具。',
      tags: ['EDA', '画板工具'] },
    { id: 'r55', moduleId: 'm-hw', type: 'tool', verified: true,
      title: '立创商城（器件采购）', author: '立创商城',
      url: 'https://www.szlcsc.com/',
      reason: '电机 / 驱动 / 电源 / 传感器一站式采购，配单方便，缺件再买首选。',
      tags: ['采购', '器件'] },

    /* ── MSPM0 电赛控制（TI 官方 LP-MSPM0G3507，非立创） ── */
    { id: 'r30', moduleId: 'm-mspm0', type: 'video', verified: true, fav: true,
      title: '无名创新 · MSPM0G3507 官方板入门', author: '无名创新',
      url: 'https://www.bilibili.com/video/BV1Ei421Q7n9',
      reason: '针对 TI 官方 LP-MSPM0G3507（非立创天猛星 / 地猛星），22 例程逐外设讲解，官方板首选。',
      tags: ['MSPM0', '官方板', '口碑首选'] },
    { id: 'r31', moduleId: 'm-mspm0', type: 'code', verified: true,
      title: '无名创新 · 官方板 mini 例程（Gitee）', author: '无名创新',
      url: 'https://gitee.com/namelesstech/lp_mspm0g3507_mini_examples',
      reason: 'GPIO / I2C OLED / 串口 / 定时器 / PWM / ADC / DAC / SPI / 编码器 / MPU6050 共 22 例程，可直接跑。',
      tags: ['配套源码', '官方板', '例程'] },
    { id: 'r32', moduleId: 'm-mspm0', type: 'video', verified: true,
      title: 'Torri_Yin · MSPM0G3507 教程', author: 'Torri_Yin',
      url: 'https://www.bilibili.com/video/BV117421o7zz',
      reason: '官方板另一套系统讲解，与无名创新互为补充，外设配置 / 调试思路对照学。',
      tags: ['MSPM0', '官方板', '补充'] },
    { id: 'r34', moduleId: 'm-mspm0', type: 'doc', verified: true,
      title: 'TI Academy · MSPM0 官方培训', author: 'Texas Instruments',
      url: 'https://dev.ti.com/',
      reason: 'TI 官方培训与例程库，SysConfig / 驱动库一手资料，权威查阅入口。',
      tags: ['官方', 'TI Academy'] },
    { id: 'r35', moduleId: 'm-mspm0', type: 'tool', verified: true,
      title: 'TI LP-MSPM0G3507 官方 LaunchPad 产品页', author: 'Texas Instruments',
      url: 'https://www.ti.com.cn/tool/cn/LP-MSPM0G3507',
      reason: '红色官方板（非立创）：原理图 / 用户指南 / MSPM0-SDK + CCS + SysConfig 环境入口。',
      tags: ['官方板', '产品页', '环境'] },

    /* ── ROS2 与导航 ── */
    { id: 'r40', moduleId: 'm-ros2', type: 'video', verified: true, fav: true,
      title: '鱼香 ROS · 一键安装 ROS2', author: '鱼香ROS',
      url: 'https://www.bilibili.com/video/BV1PT4y1o7JA',
      reason: '国内网络环境一键装 ROS2，社区口碑最高的环境方案，装完再学理论。',
      tags: ['环境安装', '口碑首选'] },
    { id: 'r41', moduleId: 'm-ros2', type: 'doc', verified: true,
      title: '鱼香 ROS 官网（171 集系统课）', author: '鱼香ROS',
      url: 'https://fishros.com/',
      reason: '含 Linux 基础的 ROS2 系统课，社区评价适合零基础长线跟学。',
      tags: ['系统课', 'Linux基础'] },
    { id: 'r42', moduleId: 'm-ros2', type: 'doc', verified: true,
      title: 'ROS2 中文文档（鱼香镜像 · Humble）', author: '鱼香ROS',
      url: 'http://fishros.org/doc/ros2/humble/',
      reason: 'Humble 官方文档中文镜像，API 查阅主力入口。',
      tags: ['文档镜像', 'Humble'] },
    { id: 'r43', moduleId: 'm-ros2', type: 'video', verified: true,
      title: '古月 · ROS2 入门 21 讲', author: '古月居',
      url: 'https://www.bilibili.com/video/BV16B4y1Q7jQ',
      reason: '华语 ROS 社区标杆课程：架构 → 通信 → 实操 21 讲体系化，高校课程广泛引用。',
      tags: ['体系课', '标杆'] },
    { id: 'r44', moduleId: 'm-ros2', type: 'code', verified: true,
      title: '古月居 · 课程代码（Gitee）', author: '古月居',
      url: 'https://gitee.com/guyuehome/',
      reason: 'ros2_21_tutorials 等课程配套源码组织页，国内访问快。',
      tags: ['配套源码'] },
    { id: 'r45', moduleId: 'm-ros2', type: 'code', verified: true,
      title: 'd2l-ros2 · 动手学 ROS2', author: '鱼香ROS',
      url: 'https://github.com/fishros/d2l-ros2',
      reason: '《动手学 ROS2》配套代码，边做边学，例程可直接跑。',
      tags: ['动手学', '例程'] },

    /* ── 无人机（可选） ── */
    { id: 'r46', moduleId: 'm-drone', type: 'video', verified: true,
      title: '江协科技 · 四轴飞行器入门教程', author: '江协科技',
      url: 'https://www.bilibili.com/video/BV1WXNx68EKW',
      reason: '2026 新开：姿态解算 + PID + STM32，江协式跟练；先看完简介评估时间再决策。',
      tags: ['四轴', '新课'] },
    { id: 'r47', moduleId: 'm-drone', type: 'search', verified: false,
      title: '匿名科创 · 开源飞控', author: '匿名科创',
      url: 'https://search.bilibili.com/all?keyword=%E5%8C%BF%E5%90%8D%E7%A7%91%E5%88%9B%20%E9%A3%9E%E6%8E%A7',
      reason: '老牌开源飞控社区，四轴进阶参考（B 站搜索直达，站内确认最新合集）。',
      tags: ['飞控', '开源', '搜索直达'] },
    { id: 'r58', moduleId: 'm-drone', type: 'video', verified: true,
      title: '江协科技 · 姿态解算（互补滤波 / Mahony）', author: '江协科技',
      url: 'https://www.bilibili.com/video/BV12o5vzwEPp',
      reason: '四轴 / 平衡车姿态解算基础：加速度计 + 陀螺仪融合，控制前置理论。',
      tags: ['姿态解算', 'IMU'] },

    /* ── STM32 标准库 → HAL（基础） ── */
    { id: 'r48', moduleId: 'm-stm32', type: 'video', verified: true, fav: true,
      title: '江协科技 · STM32F103 标准库教程（50 集）', author: '江协科技',
      url: 'https://www.bilibili.com/video/BV1th411z7sn',
      reason: '约 33.5h 系统课：点灯 → GPIO → 定时器 → ADC → 通信外设，标准库入门标杆，三人共同基础。',
      tags: ['STM32', '标准库', '口碑首选'] },
    { id: 'r49', moduleId: 'm-stm32', type: 'video', verified: true,
      title: '野火 · STM32 HAL 库全系列', author: '野火',
      url: 'https://www.bilibili.com/video/BV18X4y1M763',
      reason: '覆盖 F103 / F407 / F429 / F767 / H743 / H750，HAL + CubeMX 进阶主力，F407 直接用。',
      tags: ['HAL', 'CubeMX', 'F407'] },
    { id: 'r50', moduleId: 'm-stm32', type: 'doc', verified: true,
      title: '正点原子 · F407 探索者官方文档', author: '正点原子',
      url: 'http://www.openedv.com/docs/boards/stm32/zdyz_stm32f407_explorerV3.html',
      reason: 'F407 探索者配套教程：HAL 例程 / 外设驱动 / 资料下载，已有板卡主线文档。',
      tags: ['F407', '官方文档'] },
    { id: 'r51', moduleId: 'm-stm32', type: 'doc', verified: true,
      title: '正点原子 · 资料中心（全系列）', author: '正点原子',
      url: 'http://www.openedv.com/docs/build/html/index.html',
      reason: 'STM32 / Linux 各板卡文档与资料盘总入口，查手册 / 下例程一站式。',
      tags: ['资料中心', '文档'] },
    { id: 'r52', moduleId: 'm-stm32', type: 'video', verified: true,
      title: '好家伙VCC · STM32 智能小车', author: '好家伙VCC',
      url: 'https://www.bilibili.com/video/BV16x4y1M7EN',
      reason: 'STM32 整车项目实战：电机 / 编码器 / 巡线综合，基础外设学完后的练手参考。',
      tags: ['智能小车', '项目实战'] },

    /* ── MaixCam2 边缘 AI 补充 ── */
    { id: 'r56', moduleId: 'm-yolo', type: 'doc', verified: true,
      title: 'MaixCam2 硬件文档（爱芯 AX630C）', author: 'Sipeed',
      url: 'https://wiki.sipeed.com/hardware/zh/maixcam/maixcam2.html',
      reason: 'MaixCam2 = 爱芯 AX630C · 3.2T NPU（非 K230）：接口 / 摄像头 / 算力规格，部署前确认。',
      tags: ['MaixCam2', 'AX630C', '硬件'] },
    { id: 'r57', moduleId: 'm-yolo', type: 'doc', verified: true,
      title: 'MaixPy YOLOv5 目标检测', author: 'Sipeed',
      url: 'https://en.wiki.sipeed.com/maixpy/doc/zh/vision/yolov5.html',
      reason: 'MaixPy 上 YOLOv5 推理 API 与模型格式，边缘检测落地参考。',
      tags: ['YOLOv5', '推理'] }
  ];

  const clone = o => JSON.parse(JSON.stringify(o));

  /* ═══════════ v4 · 模块库（catalog）+ 学习路线 ═══════════
   * catalog = 参考模板超集（主线 + 已掌握基础 + 可选支线），不进同步状态。
   * S.modules = 主线活跃计划（catalog 的子集）。路线强调「先学技能 → 做项目 → 再学 → 再做」。
   * 新模块用确定性 id（= catalog id），clone 保留课时 / 项目 / 里程碑 id → 跨设备 mergeById 去重。 */
  const SCHEMA = 4;
  const PHASE_STAGE = { foundation: 's0', learn: 's1', project: 's2', compete: 's3' };
  const DIR_LABEL = { vision: '视觉', control: '控制', hardware: '硬件', common: '通用' };
  const PHASE_PRI = { foundation: '基础', learn: 'P1', project: 'P2', compete: 'P3' };
  /* legacy 9 模块 → catalog id 映射（保留 m-* id 以衔接打卡 / 进度） */
  const legacyMap = {
    'm-stm32': 'cat-b-hal', 'm-hw': 'cat-h-power', 'm-pid': 'cat-b-cascade',
    'm-cv': 'cat-v-opencv', 'm-loong': 'cat-v-loong', 'm-yolo': 'cat-v-edgeai',
    'm-mspm0': 'cat-b-mspm0', 'm-ros2': 'cat-i-ros2', 'm-drone': 'cat-i-drone'
  };
  const legacyMeta = {
    'm-stm32': { dir: 'control', phase: 'learn' },
    'm-hw': { dir: 'hardware', phase: 'learn' },
    'm-pid': { dir: 'control', phase: 'project' },
    'm-cv': { dir: 'vision', phase: 'learn' },
    'm-loong': { dir: 'vision', phase: 'learn' },
    'm-yolo': { dir: 'vision', phase: 'project' },
    'm-mspm0': { dir: 'control', phase: 'learn' },
    'm-ros2': { dir: 'control', phase: 'compete', optional: true },
    'm-drone': { dir: 'hardware', phase: 'compete', optional: true }
  };
  /* 紧凑构造器：课时 / 里程碑 / 项目（dur 留空，避免编造时长） */
  const L = (id, title, url, author, done) => ({ id, title, dur: '', url, author, done: !!done, ts: 0 });
  const MS = (id, title, done) => ({ id, title, done: !!done, ts: 0 });
  const P = (id, name, desc, url, milestones) => ({ id, name, desc, url, milestones });

  /* ── 新增模板（26）：4 已掌握基础 + 8 视觉 + 6 控制 + 8 硬件。URL 均已核实。 ── */
  const newTemplates = [
    /* 已掌握基础（foundation · mastered · 仅库，加入即预完成） */
    { id: 'cat-c-lang', name: 'C 语言与工具链', color: '#9d7bff', dir: 'common', phase: 'foundation', suggestOwner: 'b', mastered: true,
      goal: '已掌握：指针 / 结构体 / 内存管理 + Keil / GCC 工具链。三人共同的固件语言基础，加入计划即预完成，作为回炉查阅。',
      lessons: [
        L('l-c-lang-1', 'C 语法 / 指针 / 结构体系统回顾', 'https://www.bilibili.com/video/BV1dr4y1n7vA', '翁恺（浙江大学）', true),
        L('l-c-lang-2', '内存管理 / 位操作 / 模块化编程', 'https://www.bilibili.com/video/BV1dr4y1n7vA', '翁恺（浙江大学）', true),
        L('l-c-lang-3', 'Keil / GCC 工具链 + 调试基本功', 'https://www.bilibili.com/video/BV1th411z7sn?p=4', '江协科技', true)
      ],
      projects: [P('p-c-lang-1', '命令行小工具', '用 C 写一个串口协议解析小工具', '', [MS('ms-c-lang-1', '指针 / 结构体练习', true), MS('ms-c-lang-2', '模块化 + 编译调试', true)])] },
    { id: 'cat-c-python', name: 'Python + NumPy 基础', color: '#38bdf8', dir: 'vision', phase: 'foundation', suggestOwner: 'me', mastered: true,
      goal: '已掌握：Python 语法 / NumPy 切片 / 广播，视觉与深度学习的前置。加入计划即预完成，作为回炉查阅。',
      lessons: [
        L('l-c-py-1', 'Python 语法速通（数据类型 / 函数 / 类）', 'https://www.bilibili.com/video/BV1hE411t7RN', '我是土堆', true),
        L('l-c-py-2', 'NumPy 数组 / 切片 / 广播机制', 'https://www.bilibili.com/video/BV1hE411t7RN', '我是土堆', true),
        L('l-c-py-3', 'OpenCV-Python 环境搭建', 'https://book.openmv.cc/', '星瞳科技', true)
      ],
      projects: [P('p-c-py-1', '图像批处理脚本', 'NumPy + OpenCV 批量读图 / 灰度 / 保存', '', [MS('ms-c-py-1', 'NumPy 数组操作', true), MS('ms-c-py-2', '批量图像处理脚本', true)])] },
    { id: 'cat-c-pid', name: 'PID 控制理论入门', color: '#f0b429', dir: 'control', phase: 'foundation', suggestOwner: 'b', mastered: true,
      goal: '已掌握：江协 PID P1–P9 理论（离散 PID / 积分限幅 / 微分先行 / 双环）。加入即预完成，串级实战见阶段 2。',
      lessons: [
        L('l-c-pid-1', 'P1–P3 PID 原理 + 离散实现', 'https://www.bilibili.com/video/BV1G9zdYQEr3?p=1', '江协科技', true),
        L('l-c-pid-2', 'P4–P5 驱动代码 + 闭环实验', 'https://www.bilibili.com/video/BV1G9zdYQEr3?p=4', '江协科技', true),
        L('l-c-pid-3', 'P6–P8 积分限幅 / 微分先行 / 死区', 'https://www.bilibili.com/video/BV1G9zdYQEr3?p=6', '江协科技', true),
        L('l-c-pid-4', 'P9 双环 PID · 定速定位置', 'https://www.bilibili.com/video/BV1G9zdYQEr3?p=9', '江协科技', true)
      ],
      projects: [P('p-c-pid-1', '单环 PID 仿真', '位置 / 速度单环闭环调参', 'https://www.bilibili.com/video/BV1G9zdYQEr3', [MS('ms-c-pid-1', '离散 PID 代码', true), MS('ms-c-pid-2', '单环闭环调参', true)])] },
    { id: 'cat-c-pcb', name: 'PCB 入门 · 嘉立创 EDA', color: '#ff7a45', dir: 'hardware', phase: 'foundation', suggestOwner: 'a', mastered: true,
      goal: '已掌握：杜洋 PCB 速成 + 嘉立创 EDA 原理图 / 布线 / 打样 / 焊接。加入即预完成，四层进阶见阶段 1。',
      lessons: [
        L('l-c-pcb-1', '杜洋 PCB 速成 + 嘉立创 EDA 上手', 'https://www.bilibili.com/video/BV1yf4y1Q7Qb', '杜洋', true),
        L('l-c-pcb-2', '原理图：电源 / 驱动 / 最小系统', 'https://www.bilibili.com/video/BV1Uo61BGEUv', '嘉立创EDA', true),
        L('l-c-pcb-3', 'PCB 布局布线 + DRC + 打样焊接', 'https://www.bilibili.com/video/BV1Uo61BGEUv', '嘉立创EDA', true)
      ],
      projects: [P('p-c-pcb-1', '平衡车底板', '两层主控底板原理图 → 打样 → 焊接', 'https://www.bilibili.com/video/BV1Uo61BGEUv', [MS('ms-c-pcb-1', '原理图 + 布线', true), MS('ms-c-pcb-2', '打样 + 焊接上电', true)])] },

    /* 视觉方向（me）：巡线 → MaixPy → 元素 → 龙芯 → 训练 → 整合跑车 → 边缘AI → 走马观碑 → 控制策略 → 参赛 → 真题 */
    { id: 'cat-v-maixpy', name: 'MaixPy · MaixCam2 上手', color: '#38bdf8', dir: 'vision', phase: 'learn', suggestOwner: 'me',
      goal: '先学：Sipeed MaixPy 环境 + 摄像头读帧 / 显示 / NN API（MaixCam2 = 爱芯 AX630C）。练手：板端实时读帧显示，为巡线与部署打底。',
      lessons: [
        L('l-v-mx-1', 'MaixCam2 开箱 + MaixPy 环境（AX630C）', 'https://wiki.sipeed.com/hardware/zh/maixcam/maixcam2.html', 'Sipeed'),
        L('l-v-mx-2', 'MaixPy 摄像头 / 显示 API', 'https://wiki.sipeed.com/maixpy/doc/index.html', 'Sipeed'),
        L('l-v-mx-3', '图像基本操作 + NN 推理接口', 'https://wiki.sipeed.com/maixpy/doc/index.html', 'Sipeed'),
        L('l-v-mx-4', 'MaixHub 在线训练 / 模型转换入门', 'https://maixhub.com/', 'Sipeed')
      ],
      projects: [P('p-v-mx-1', 'MaixCam2 读帧显示', '板端摄像头采集 → LCD 实时显示', 'https://wiki.sipeed.com/maixpy/doc/index.html', [MS('ms-v-mx-1', '环境 + 点屏'), MS('ms-v-mx-2', '摄像头读帧'), MS('ms-v-mx-3', '实时显示 + 帧率统计')])] },
    { id: 'cat-v-element', name: '赛道元素识别状态机', color: '#6aa9ff', dir: 'vision', phase: 'learn', suggestOwner: 'me',
      goal: '先学：十字 / 圆环 / 坡道 / 车库元素的图像特征与判定。练手：写一个元素识别状态机，接巡线偏差输出，为智能车整车打底。',
      lessons: [
        L('l-v-el-1', '十字 / 圆环 / 坡道图像特征', 'https://github.com/ittuann/Awesome-IntelligentCarRace', 'ittuann'),
        L('l-v-el-2', '元素判定状态机设计', 'https://gitee.com/joshua_xu/the-18th-smartcar', 'joshua_xu'),
        L('l-v-el-3', '动态前瞻 + 速度决策', 'https://m.blog.csdn.net/yck1716/article/details/135669666', '社区口碑整理'),
        L('l-v-el-4', '车库 / 斑马线识别与入库', 'https://www.bilibili.com/video/BV1KF4tz3EZw', 'JNU智能车协会')
      ],
      projects: [P('p-v-el-1', '元素识别状态机', '离线赛道图 → 元素判定 → 决策输出', 'https://gitee.com/joshua_xu/the-18th-smartcar', [MS('ms-v-el-1', '十字 / 圆环判定'), MS('ms-v-el-2', '坡道 / 车库判定'), MS('ms-v-el-3', '状态机联调')])] },
    { id: 'cat-v-train', name: 'PyTorch + YOLO 训练', color: '#e05fd0', dir: 'vision', phase: 'learn', suggestOwner: 'me',
      goal: '先学：土堆 PyTorch → 霹雳吧啦 Wz YOLOv8。练手：自采赛道 / 碑位数据集标注训练，产出可部署权重，接阶段 2 边缘 AI。',
      lessons: [
        L('l-v-tr-1', '土堆 PyTorch 入门（tensor / 训练）', 'https://www.bilibili.com/video/BV1hE411t7RN', '我是土堆'),
        L('l-v-tr-2', 'YOLOv8 原理 + 官方推理', 'https://www.bilibili.com/video/BV1dW4y1U7GJ', '霹雳吧啦Wz'),
        L('l-v-tr-3', '数据集标注（labelImg / 格式）', 'https://wiki.sipeed.com/maixpy/doc/zh/vision/customize_model_yolov8.html', 'Sipeed'),
        L('l-v-tr-4', '自采数据训练 + 评估调参', 'https://www.bilibili.com/video/BV1dW4y1U7GJ', '霹雳吧啦Wz')
      ],
      projects: [P('p-v-tr-1', '赛道目标检测训练', '采集 → 标注 → 训练 → 评估', 'https://www.bilibili.com/video/BV1dW4y1U7GJ', [MS('ms-v-tr-1', 'PyTorch 跑通'), MS('ms-v-tr-2', '数据集标注'), MS('ms-v-tr-3', '训练出可用权重')])] },
    { id: 'cat-v-integrate', name: '智能车视觉整合跑车', color: '#4da3ff', dir: 'vision', phase: 'project', suggestOwner: 'me',
      goal: '整合：巡线 + 元素 + 速度决策拼成闭环，参考逐飞开源库 / ittuann 方案。练手：实车跑完一圈，与 b 的控制环联调。',
      lessons: [
        L('l-v-in-1', '逐飞开源库架构 + 摄像头驱动', 'https://gitee.com/seekfree', '逐飞科技'),
        L('l-v-in-2', '巡线闭环：图像 → 偏差 → 舵机', 'https://github.com/ittuann/Awesome-IntelligentCarRace', 'ittuann'),
        L('l-v-in-3', '元素状态机接入 + 速度规划', 'https://gitee.com/joshua_xu/the-18th-smartcar', 'joshua_xu'),
        L('l-v-in-4', '英飞凌 AI 越野组入门框架对照', 'https://community.infineon.com/t5/博客/英飞凌AI越野组入门教程-逐飞科技/bc-p/546223', '逐飞科技')
      ],
      projects: [P('p-v-in-1', '视觉巡线实车跑车', '从读帧到实车跑完一圈', 'https://gitee.com/seekfree', [MS('ms-v-in-1', '巡线闭环上车'), MS('ms-v-in-2', '元素识别接入'), MS('ms-v-in-3', '实车跑完一圈')])] },
    { id: 'cat-v-loonghost', name: '龙芯上位机 · 走马观碑', color: '#35c46f', dir: 'vision', phase: 'project', suggestOwner: 'me',
      goal: '整合：龙芯 2K0300 交叉编译 + 摄像头 + 碑位识别，参考逐飞 LS2K0300 开源库与 oshwhub 走马观碑方案。练手：双主板视觉决策整车。',
      lessons: [
        L('l-v-lh-1', '逐飞 LS2K0300 开源库上手', 'https://gitee.com/seekfree', '逐飞科技'),
        L('l-v-lh-2', '龙芯摄像头采集 + OpenCV 交叉编译', 'http://www.openedv.com/docs/boards/arm-linux/LX2K0300.html', '正点原子'),
        L('l-v-lh-3', '走马观碑赛题解析 + 碑位识别', 'https://oshwhub.com/lukestery/project_udnldgrw', '立创开源·一起飙车队'),
        L('l-v-lh-4', '双主板架构：采集板 + 决策板', 'https://oshwhub.com/lukestery/project_udnldgrw', '立创开源·一起飙车队')
      ],
      projects: [P('p-v-lh-1', '走马观碑整车集成', '高速巡线 + 碑位识别 + 动态决策', 'https://oshwhub.com/lukestery/project_udnldgrw', [MS('ms-v-lh-1', '龙芯视觉环境跑通'), MS('ms-v-lh-2', '碑位识别接入'), MS('ms-v-lh-3', '巡线 + 识别整车联调'), MS('ms-v-lh-4', '开源仓库整理')])] },
    { id: 'cat-v-control', name: '整车控制策略联调', color: '#2fd4c4', dir: 'vision', phase: 'project', suggestOwner: 'me',
      goal: '整合：视觉输出 → 转向 PD + 速度环决策，与 b 的固件控制环联调。练手：整车过弯 / 坡道 / 圆环速度策略，抗扰与稳定性。',
      lessons: [
        L('l-v-ct-1', '转向 PD：偏差 → 舵机角度', 'https://www.bilibili.com/video/BV1KF4tz3EZw', 'JNU智能车协会'),
        L('l-v-ct-2', '速度环 + 动态前瞻决策', 'https://m.blog.csdn.net/yck1716/article/details/135669666', '社区口碑整理'),
        L('l-v-ct-3', '视觉 → 控制接口协议（串口 / 共享）', 'https://gitee.com/seekfree', '逐飞科技'),
        L('l-v-ct-4', '整车抗扰 + 稳定性联调', 'https://github.com/ittuann/Awesome-IntelligentCarRace', 'ittuann')
      ],
      projects: [P('p-v-ct-1', '整车控制策略', '视觉决策接控制环，过弯 / 坡道 / 圆环', 'https://gitee.com/seekfree', [MS('ms-v-ct-1', '转向 PD 调通'), MS('ms-v-ct-2', '速度策略接入'), MS('ms-v-ct-3', '整车联调抗扰')])] },
    { id: 'cat-v-loongcomp', name: '龙芯赛道参赛 · 开源答辩', color: '#35c46f', dir: 'vision', phase: 'compete', suggestOwner: 'me',
      goal: '冲刺：走马观碑组报名 + 规则细则研读 + 整车提速 + 开源仓库与技术报告 + 答辩。作品须开源，卓晴 / 龙芯官方为权威信息源。',
      lessons: [
        L('l-v-lc-1', '走马观碑规则细则 + 报名流程', 'https://zhuoqing.blog.csdn.net/', '卓晴（竞赛秘书处）'),
        L('l-v-lc-2', '赛题识别任务与评分点解析', 'https://space.bilibili.com/213206285', '卓晴（竞赛秘书处）'),
        L('l-v-lc-3', '整车提速 + 稳定性极限调优', 'https://oshwhub.com/lukestery/project_udnldgrw', '立创开源·一起飙车队'),
        L('l-v-lc-4', '开源仓库规范 + 技术报告撰写', 'http://www.openedv.com/docs/boards/arm-linux/LX2K0300.html', '正点原子')
      ],
      projects: [P('p-v-lc-1', '走马观碑参赛交付', '报名 → 整车 → 开源 → 答辩', 'https://zhuoqing.blog.csdn.net/', [MS('ms-v-lc-1', '规则研读 + 报名'), MS('ms-v-lc-2', '整车达标提速'), MS('ms-v-lc-3', '开源仓库 + 报告'), MS('ms-v-lc-4', '答辩演练')])] },
    { id: 'cat-v-smartcar', name: '智能车真题 + 技术报告', color: '#4da3ff', dir: 'vision', phase: 'compete', suggestOwner: 'me',
      goal: '冲刺：历年智能车真题模拟 + 技术报告撰写，卓晴赛题解读 + ittuann 开源索引为参考。练手：完整跑一次真题并出报告。',
      lessons: [
        L('l-v-sc-1', '卓晴赛题解读 + 规则答疑', 'https://space.bilibili.com/213206285', '卓晴（竞赛秘书处）'),
        L('l-v-sc-2', '历年开源方案索引研读', 'https://github.com/ittuann/Awesome-IntelligentCarRace', 'ittuann'),
        L('l-v-sc-3', '真题赛道模拟 + 计时', 'https://gitee.com/joshua_xu/the-18th-smartcar', 'joshua_xu'),
        L('l-v-sc-4', '技术报告结构 + 撰写规范', 'https://zhuoqing.blog.csdn.net/', '卓晴（竞赛秘书处）')
      ],
      projects: [P('p-v-sc-1', '智能车真题模拟', '完整真题赛道 + 技术报告', 'https://github.com/ittuann/Awesome-IntelligentCarRace', [MS('ms-v-sc-1', '真题赛道模拟'), MS('ms-v-sc-2', '计时达标'), MS('ms-v-sc-3', '技术报告成稿')])] },

    /* 控制方向（b）：HAL → MSPM0 → 速度环 → IMU → 串级平衡车 → 控制板 → 电赛真题 → TI杯 → 联调支援 */
    { id: 'cat-b-encoder', name: '编码器速度环闭环', color: '#f0a13c', dir: 'control', phase: 'learn', suggestOwner: 'b',
      goal: '先学：编码器 M/T 法测速 + 速度环 PID + 抗积分饱和。练手：双电机速度闭环，SerialPlot 看曲线，为平衡车 / 智能车打底。',
      lessons: [
        L('l-b-en-1', '编码器测速：M 法 / T 法', 'https://www.bilibili.com/video/BV1G9zdYQEr3?p=4', '江协科技'),
        L('l-b-en-2', '速度环 PID + 抗积分饱和', 'https://www.bilibili.com/video/BV1G9zdYQEr3?p=6', '江协科技'),
        L('l-b-en-3', 'TB6612 / DRV8833 驱动接线', 'https://gitee.com/namelesstech/lp_mspm0g3507_mini_examples', '无名创新'),
        L('l-b-en-4', 'SerialPlot 实时波形调参', 'https://www.bilibili.com/video/BV1G9zdYQEr3?p=5', '江协科技')
      ],
      projects: [P('p-b-en-1', '双电机速度环', '编码器测速 → 速度闭环 → 抗扰', 'https://www.bilibili.com/video/BV1G9zdYQEr3', [MS('ms-b-en-1', '编码器测速跑通'), MS('ms-b-en-2', '单电机速度闭环'), MS('ms-b-en-3', '双电机 + 抗扰')])] },
    { id: 'cat-b-imu', name: 'IMU 姿态解算', color: '#f0b429', dir: 'control', phase: 'learn', suggestOwner: 'b',
      goal: '先学：MPU6050 / 9250 读取 + 互补滤波 / Mahony 姿态融合。练手：稳定输出俯仰 / 横滚角，为平衡车直立环与出环判定打底。',
      lessons: [
        L('l-b-im-1', 'MPU6050 I2C 读取 + 零漂处理', 'https://www.bilibili.com/video/BV1Ei421Q7n9', '无名创新'),
        L('l-b-im-2', '互补滤波姿态融合', 'https://www.bilibili.com/video/BV12o5vzwEPp', '江协科技'),
        L('l-b-im-3', 'Mahony / 卡尔曼进阶对照', 'https://www.bilibili.com/video/BV12o5vzwEPp', '江协科技'),
        L('l-b-im-4', '姿态角标定 + 动态验证', 'https://gitee.com/namelesstech/lp_mspm0g3507_mini_examples', '无名创新')
      ],
      projects: [P('p-b-im-1', '姿态角稳定输出', 'IMU 融合 → 俯仰 / 横滚稳定', 'https://www.bilibili.com/video/BV12o5vzwEPp', [MS('ms-b-im-1', '原始数据读取'), MS('ms-b-im-2', '互补滤波融合'), MS('ms-b-im-3', '动态姿态验证')])] },
    { id: 'cat-b-pcb', name: '控制板画板协作', color: '#ff7a45', dir: 'control', phase: 'project', suggestOwner: 'b',
      goal: '整合：与 a 协作画控制核心板（主控 + 驱动 + 接口），嘉立创 EDA 原理图 / 布线 / 打样。练手：一块可上车调试的控制板。',
      lessons: [
        L('l-b-pc-1', '控制板需求 + 接口定义', 'https://www.bilibili.com/video/BV1Uo61BGEUv', '嘉立创EDA'),
        L('l-b-pc-2', '原理图：主控 + 驱动 + 电源接口', 'https://www.bilibili.com/video/BV1Uo61BGEUv', '嘉立创EDA'),
        L('l-b-pc-3', '布线 + DRC + 与 a 评审', 'https://www.bilibili.com/video/BV1Uo61BGEUv', '嘉立创EDA'),
        L('l-b-pc-4', '打样焊接 + 上板调试', 'https://www.bilibili.com/video/BV1yf4y1Q7Qb', '杜洋')
      ],
      projects: [P('p-b-pc-1', '控制核心板', '与 a 协作：原理图 → 打样 → 调试', 'https://www.bilibili.com/video/BV1Uo61BGEUv', [MS('ms-b-pc-1', '原理图 + 评审'), MS('ms-b-pc-2', '打样焊接'), MS('ms-b-pc-3', '上板调试')])] },
    { id: 'cat-b-nuedc', name: '电赛控制真题演练', color: '#ff6b57', dir: 'control', phase: 'project', suggestOwner: 'b',
      goal: '整合：MSPM0 / STM32 + 视觉 + 控制做电赛控制真题（送药 / 自动行驶 / 储能小车）。练手：完整复现一道往年真题，NUEDC_TOPIC 题库。',
      lessons: [
        L('l-b-nu-1', '电赛控制类真题综述 + 选题', 'https://github.com/zuoliangyu/NUEDC_TOPIC', '左岚（NUEDC）'),
        L('l-b-nu-2', '智能送药小车：视觉 + 路径', 'https://github.com/zuoliangyu/NUEDC_TOPIC', '左岚（NUEDC）'),
        L('l-b-nu-3', '自动行驶 / 双车跟随控制', 'https://github.com/zuoliangyu/NUEDC_TOPIC', '左岚（NUEDC）'),
        L('l-b-nu-4', 'MSPM0 平台真题移植', 'https://gitee.com/namelesstech/lp_mspm0g3507_mini_examples', '无名创新')
      ],
      projects: [P('p-b-nu-1', '电赛控制真题复现', '选一道往年真题完整复现', 'https://github.com/zuoliangyu/NUEDC_TOPIC', [MS('ms-b-nu-1', '选题 + 方案'), MS('ms-b-nu-2', '视觉 + 控制联调'), MS('ms-b-nu-3', '真题指标达标'), MS('ms-b-nu-4', '作品文档')])] },
    { id: 'cat-b-ti', name: 'TI 杯专项 + 四天三夜模拟', color: '#ff6b57', dir: 'control', phase: 'compete', suggestOwner: 'b',
      goal: '冲刺：TI 杯电赛专项 + 四天三夜全真模拟，MSPM0 官方平台 + NUEDC 题库。练手：限时完成一道控制题并出满分报告。',
      lessons: [
        L('l-b-ti-1', 'TI 杯赛制 + 评分标准', 'https://dev.ti.com/', 'Texas Instruments'),
        L('l-b-ti-2', '控制题限时方案设计', 'https://github.com/zuoliangyu/NUEDC_TOPIC', '左岚（NUEDC）'),
        L('l-b-ti-3', 'MSPM0 快速开发 + 调试', 'https://www.ti.com.cn/tool/cn/LP-MSPM0G3507', 'Texas Instruments'),
        L('l-b-ti-4', '满分报告 + 作品文档规范', 'https://github.com/zuoliangyu/NUEDC_TOPIC', '左岚（NUEDC）')
      ],
      projects: [P('p-b-ti-1', '四天三夜全真模拟', '限时完成控制题 + 报告', 'https://github.com/zuoliangyu/NUEDC_TOPIC', [MS('ms-b-ti-1', '限时方案'), MS('ms-b-ti-2', '四天三夜模拟'), MS('ms-b-ti-3', '指标达标 + 报告')])] },
    { id: 'cat-b-support', name: '智能车联调支援', color: '#f0b429', dir: 'control', phase: 'compete', suggestOwner: 'b',
      goal: '冲刺：与 me / a 联调整车控制环（速度 / 转向 / 直立），排查电源 / 地弹 / 死区。练手：整车稳定跑完赛道，控制组兜底支援。',
      lessons: [
        L('l-b-sp-1', '整车控制环联调流程', 'https://gitee.com/seekfree', '逐飞科技'),
        L('l-b-sp-2', '速度 / 转向环参数整定', 'https://www.bilibili.com/video/BV1G9zdYQEr3?p=9', '江协科技'),
        L('l-b-sp-3', '常见故障排查：电源 / 地弹 / 死区', 'https://space.bilibili.com/43584648', '工科男孙老师'),
        L('l-b-sp-4', '赛道实测 + 抗扰优化', 'https://github.com/ittuann/Awesome-IntelligentCarRace', 'ittuann')
      ],
      projects: [P('p-b-sp-1', '整车控制联调', '三人联调，整车稳定跑完赛道', 'https://gitee.com/seekfree', [MS('ms-b-sp-1', '控制环联调'), MS('ms-b-sp-2', '故障排查'), MS('ms-b-sp-3', '赛道实测达标')])] },

    /* 硬件方向（a）：模电 → 电源 → 四层板 → 驱动选型 → 底板改四层 → 双驱电源板 → 整车联调 → 电赛硬件 → 四天三夜 */
    { id: 'cat-h-analog', name: '模电回炉 · 运放滤波', color: '#ff7a45', dir: 'hardware', phase: 'learn', suggestOwner: 'a',
      goal: '先学：郑益慧模电（运放 / 滤波 / 反馈）+ 工科男孙老师实战。练手：搭一个传感器信号调理电路，为驱动板采样打底。',
      lessons: [
        L('l-h-an-1', '运放：反相 / 同相 / 加减法', 'https://www.bilibili.com/video/BV1Gt411b7Zq?p=37', '郑益慧（上海交大）'),
        L('l-h-an-2', '有源滤波 + 频率响应', 'https://www.bilibili.com/video/BV1Gt411b7Zq', '郑益慧（上海交大）'),
        L('l-h-an-3', '反馈 + 稳压电路', 'https://www.bilibili.com/video/BV1Gt411b7Zq', '郑益慧（上海交大）'),
        L('l-h-an-4', '运放 / 电源抗干扰实战', 'https://space.bilibili.com/43584648', '工科男孙老师')
      ],
      projects: [P('p-h-an-1', '信号调理电路', '运放放大 + 滤波，传感器采样调理', 'https://www.bilibili.com/video/BV1Gt411b7Zq', [MS('ms-h-an-1', '运放放大电路'), MS('ms-h-an-2', '滤波 + 实测')])] },
    { id: 'cat-h-pcb4', name: 'PCB 进阶 · 四层板', color: '#f0a13c', dir: 'hardware', phase: 'learn', suggestOwner: 'a',
      goal: '先学：四层叠层 / 阻抗 / 电源完整地平面 / EMC 布局。练手：把平衡车底板升级为四层板布局，嘉立创 EDA + 工科男孙老师。',
      lessons: [
        L('l-h-p4-1', '四层叠层 + 参考平面', 'https://www.bilibili.com/video/BV1Uo61BGEUv', '嘉立创EDA'),
        L('l-h-p4-2', '阻抗控制 + 电源完整性', 'https://space.bilibili.com/43584648', '工科男孙老师'),
        L('l-h-p4-3', 'EMC 布局 + 地弹抑制', 'https://space.bilibili.com/43584648', '工科男孙老师'),
        L('l-h-p4-4', '四层板 DRC + 打样工艺', 'https://www.bilibili.com/video/BV1Uo61BGEUv', '嘉立创EDA')
      ],
      projects: [P('p-h-p4-1', '底板四层升级', '两层底板 → 四层叠层布局', 'https://www.bilibili.com/video/BV1Uo61BGEUv', [MS('ms-h-p4-1', '四层叠层设计'), MS('ms-h-p4-2', 'EMC 布局'), MS('ms-h-p4-3', 'DRC 通过')])] },
    { id: 'cat-h-driver', name: '电机驱动选型', color: '#ff6b57', dir: 'hardware', phase: 'learn', suggestOwner: 'a',
      goal: '先学：DRV8701 / BTN7971 / TB6612 对比 + 数据手册阅读 + 死区 / 散热。练手：出一份驱动选型报告，匹配电机与电源。',
      lessons: [
        L('l-h-dr-1', 'DRV8701 / BTN7971 方案对比', 'https://m.bilibili.com/video/BV1X7E36NENG/', '学不会电磁场'),
        L('l-h-dr-2', 'TB6612 / DRV8833 小功率驱动', 'https://gitee.com/namelesstech/lp_mspm0g3507_mini_examples', '无名创新'),
        L('l-h-dr-3', '数据手册：死区 / 散热 / 保护', 'https://m.bilibili.com/video/BV1X7E36NENG/', '学不会电磁场'),
        L('l-h-dr-4', '驱动 + 电机 + 电源匹配', 'https://space.bilibili.com/43584648', '工科男孙老师')
      ],
      projects: [P('p-h-dr-1', '驱动选型报告', '对比方案 → 选型 → 匹配验证', 'https://m.bilibili.com/video/BV1X7E36NENG/', [MS('ms-h-dr-1', '方案对比'), MS('ms-h-dr-2', '选型报告'), MS('ms-h-dr-3', '匹配验证')])] },
    { id: 'cat-h-base4', name: '平衡车底板改四层打样', color: '#ff7a45', dir: 'hardware', phase: 'project', suggestOwner: 'a',
      goal: '整合：把两层底板改四层，嘉立创打样 + 焊接 + 上电测试。练手：一块抗干扰更强的平衡车底板，接控制组联调。',
      lessons: [
        L('l-h-b4-1', '底板四层改版布局', 'https://www.bilibili.com/video/BV1Uo61BGEUv', '嘉立创EDA'),
        L('l-h-b4-2', '电源 / 地平面优化', 'https://space.bilibili.com/43584648', '工科男孙老师'),
        L('l-h-b4-3', '嘉立创打样 + 工艺确认', 'https://www.bilibili.com/video/BV1Uo61BGEUv', '嘉立创EDA'),
        L('l-h-b4-4', '焊接 + 上电 + 纹波测试', 'https://www.bilibili.com/video/BV1yf4y1Q7Qb', '杜洋')
      ],
      projects: [P('p-h-b4-1', '四层底板打样', '改版 → 打样 → 焊接 → 测试', 'https://www.bilibili.com/video/BV1Uo61BGEUv', [MS('ms-h-b4-1', '四层改版'), MS('ms-h-b4-2', '打样焊接'), MS('ms-h-b4-3', '上电 + 纹波达标')])] },
    { id: 'cat-h-driveboard', name: 'DRV8701 双驱 + 电源树板', color: '#ff7a45', dir: 'hardware', phase: 'project', suggestOwner: 'a',
      goal: '整合：双路 DRV8701 驱动 + 电源树（差分采样 / 运放滤波 / 隔离）。练手：一块驱动 + 电源一体板，供整车使用。',
      lessons: [
        L('l-h-db-1', 'DRV8701 双驱原理图', 'https://m.bilibili.com/video/BV1X7E36NENG/', '学不会电磁场'),
        L('l-h-db-2', '电流差分采样 + 运放滤波', 'https://space.bilibili.com/43584648', '工科男孙老师'),
        L('l-h-db-3', '电源树：锂电 + 多路 BUCK + 隔离', 'https://space.bilibili.com/28143041', '唐老师讲电赛'),
        L('l-h-db-4', '功率布线 + 散热 + 打样', 'https://www.bilibili.com/video/BV1Uo61BGEUv', '嘉立创EDA')
      ],
      projects: [P('p-h-db-1', '双驱 + 电源一体板', '驱动 + 电源树 → 打样 → 带载测试', 'https://m.bilibili.com/video/BV1X7E36NENG/', [MS('ms-h-db-1', '双驱原理图'), MS('ms-h-db-2', '电源树 + 采样'), MS('ms-h-db-3', '打样 + 带载测试')])] },
    { id: 'cat-h-integrate', name: '整车硬件联调', color: '#f0a13c', dir: 'hardware', phase: 'project', suggestOwner: 'a',
      goal: '整合：整车供电 / 线束 / 抗干扰排查（死区 / 温升 / 地弹）。练手：与 me / b 联调，硬件平台稳定支撑整车跑赛道。',
      lessons: [
        L('l-h-in-1', '整车供电 + 线束规划', 'https://space.bilibili.com/28143041', '唐老师讲电赛'),
        L('l-h-in-2', '死区 / 温升实测 + 优化', 'https://m.bilibili.com/video/BV1X7E36NENG/', '学不会电磁场'),
        L('l-h-in-3', '地弹 / 共模干扰排查', 'https://space.bilibili.com/43584648', '工科男孙老师'),
        L('l-h-in-4', '硬件 + 控制 + 视觉联合调试', 'https://gitee.com/seekfree', '逐飞科技')
      ],
      projects: [P('p-h-in-1', '整车硬件平台', '供电 / 线束 / 抗干扰 → 整车联调', 'https://space.bilibili.com/43584648', [MS('ms-h-in-1', '供电 + 线束'), MS('ms-h-in-2', '抗干扰排查'), MS('ms-h-in-3', '整车联调达标')])] },
    { id: 'cat-h-nuedc', name: '电赛真题硬件', color: '#ff6b57', dir: 'hardware', phase: 'compete', suggestOwner: 'a',
      goal: '冲刺：电赛电源 / 控制类真题硬件（能量回馈 / 逆变 / 储能小车），唐老师讲电赛 + NUEDC 题库。练手：真题硬件指标达标。',
      lessons: [
        L('l-h-nu-1', '电赛硬件真题综述 + 选题', 'https://github.com/zuoliangyu/NUEDC_TOPIC', '左岚（NUEDC）'),
        L('l-h-nu-2', '电源类：逆变 / 能量回馈', 'https://space.bilibili.com/28143041', '唐老师讲电赛'),
        L('l-h-nu-3', '控制类：驱动 + 采样硬件', 'https://m.bilibili.com/video/BV1X7E36NENG/', '学不会电磁场'),
        L('l-h-nu-4', '硬件报告 + 测试规范', 'https://space.bilibili.com/28143041', '唐老师讲电赛')
      ],
      projects: [P('p-h-nu-1', '电赛真题硬件', '选一道真题做硬件 + 测试', 'https://github.com/zuoliangyu/NUEDC_TOPIC', [MS('ms-h-nu-1', '选题 + 方案'), MS('ms-h-nu-2', '硬件制作'), MS('ms-h-nu-3', '指标达标 + 报告')])] },
    { id: 'cat-h-sim', name: '四天三夜硬件模拟', color: '#ff7a45', dir: 'hardware', phase: 'compete', suggestOwner: 'a',
      goal: '冲刺：电赛四天三夜硬件全真模拟，限时原理图 / 布线 / 打样 / 焊接 / 调试。练手：与 b 配合限时完成一道真题硬件。',
      lessons: [
        L('l-h-si-1', '四天三夜流程 + 分工', 'https://space.bilibili.com/28143041', '唐老师讲电赛'),
        L('l-h-si-2', '限时原理图 + 布线', 'https://www.bilibili.com/video/BV1Uo61BGEUv', '嘉立创EDA'),
        L('l-h-si-3', '快速打样 + 手焊调试', 'https://www.bilibili.com/video/BV1yf4y1Q7Qb', '杜洋'),
        L('l-h-si-4', '硬件 + 固件联调 + 报告', 'https://github.com/zuoliangyu/NUEDC_TOPIC', '左岚（NUEDC）')
      ],
      projects: [P('p-h-si-1', '四天三夜硬件模拟', '限时完成真题硬件 + 报告', 'https://space.bilibili.com/28143041', [MS('ms-h-si-1', '限时设计'), MS('ms-h-si-2', '打样焊接'), MS('ms-h-si-3', '联调 + 报告')])] }
  ];
  /* 规范化新模板：补 priority / mastered / optional 默认值 */
  newTemplates.forEach(t => {
    t.mastered = !!t.mastered; t.optional = !!t.optional;
    if (!t.priority) t.priority = t.mastered ? '基础 · 已掌握' : (PHASE_PRI[t.phase] || 'P1') + ' · ' + (DIR_LABEL[t.dir] || '通用');
  });
  /* legacy 9 → catalog 双胞胎（保留课时 / 项目 id，附加 dir / phase / suggestOwner） */
  const legacyTwins = modules.map(m => {
    const meta = legacyMeta[m.id] || { dir: 'common', phase: 'learn' };
    return Object.assign(clone(m), {
      id: legacyMap[m.id], legacyId: m.id, dir: meta.dir, phase: meta.phase,
      optional: !!meta.optional, mastered: false, suggestOwner: m.ownerId
    });
  });
  const catalog = legacyTwins.concat(clone(newTemplates));
  const catalogById = {}; catalog.forEach(t => { catalogById[t.id] = t; });

  /* 主线活跃计划顺序（按阶段 → 方向 → 路线序）：先技能后项目，逐方向推进 */
  const routeOrder = [
    /* s1 单项技能 · 控制 */ 'cat-b-hal', 'cat-b-mspm0', 'cat-b-encoder', 'cat-b-imu',
    /* s1 单项技能 · 视觉 */ 'cat-v-opencv', 'cat-v-maixpy', 'cat-v-element', 'cat-v-loong', 'cat-v-train',
    /* s1 单项技能 · 硬件 */ 'cat-h-analog', 'cat-h-power', 'cat-h-pcb4', 'cat-h-driver',
    /* s2 实战练手 · 控制 */ 'cat-b-cascade', 'cat-b-pcb', 'cat-b-nuedc',
    /* s2 实战练手 · 视觉 */ 'cat-v-integrate', 'cat-v-edgeai', 'cat-v-loonghost', 'cat-v-control',
    /* s2 实战练手 · 硬件 */ 'cat-h-base4', 'cat-h-driveboard', 'cat-h-integrate',
    /* s3 竞赛冲刺 · 控制 */ 'cat-b-ti', 'cat-b-support',
    /* s3 竞赛冲刺 · 视觉 */ 'cat-v-loongcomp', 'cat-v-smartcar',
    /* s3 竞赛冲刺 · 硬件 */ 'cat-h-nuedc', 'cat-h-sim',
    /* s3 可选支线 */ 'cat-i-ros2', 'cat-i-drone'
  ];

  /* 模板 → 活跃模块：确定性 id = catalog id，重置进度（mastered 保留预完成） */
  function instantiate(tpl, ownerId, stageId) {
    const m = clone(tpl);
    delete m.phase; delete m.mastered; delete m.optional; delete m.suggestOwner; delete m.legacyId;
    m.id = tpl.id; m.catalogId = tpl.id; m.ownerId = ownerId; m.stageId = stageId; m.dir = tpl.dir;
    const keep = !!tpl.mastered;
    (m.lessons || []).forEach(l => { if (!keep) l.done = false; l.ts = 0; });
    (m.projects || []).forEach(p => (p.milestones || []).forEach(x => { if (!keep) x.done = false; x.ts = 0; }));
    return m;
  }

  function buildState() {
    const legacyById = {}; modules.forEach(m => { legacyById[m.id] = m; });
    const mods = routeOrder.map(cid => {
      const tpl = catalogById[cid];
      if (tpl.legacyId) {
        const m = clone(legacyById[tpl.legacyId]);
        m.catalogId = cid; m.dir = tpl.dir; m.stageId = PHASE_STAGE[tpl.phase];
        return m;
      }
      return instantiate(tpl, tpl.suggestOwner, PHASE_STAGE[tpl.phase]);
    });
    return {
      version: SCHEMA,
      members: members.map(m => Object.assign({}, m)),
      stages: clone(stages),
      modules: mods,
      hardware: clone(hardware),
      resources: clone(resources),
      checkins: [],
      createdAt: Date.now()
    };
  }

  /* ── 一次性增量升级 v3 → v4（幂等，客户端 / 服务端共用）──
   * 保留打卡 / 自定义模块 / 课时进度；只回填 catalogId / dir / phase 并 remap 已知模块阶段；
   * 仅当原 version===3 时补齐缺失主线（绝不每次 sanitize 执行，避免被删模块复活）。 */
  function upgradeToV4(s) {
    if (!s || typeof s !== 'object') return s;
    if (s.version === SCHEMA) return s;
    const origVersion = s.version;
    /* 1. 阶段：按 id 从种子回填 phase / 名称 / 描述；追加缺失种子阶段；保留自定义；按 order 排序 */
    const seedStageById = {}; stages.forEach(st => { seedStageById[st.id] = st; });
    if (!Array.isArray(s.stages) || !s.stages.length) s.stages = clone(stages);
    else {
      s.stages.forEach(st => {
        const seed = seedStageById[st.id];
        if (seed) { st.phase = seed.phase; st.name = seed.name; st.sub = seed.sub; st.desc = seed.desc; st.order = seed.order; }
        else if (!st.phase) st.phase = 'learn';
      });
      stages.forEach(seed => { if (!s.stages.some(st => st.id === seed.id)) s.stages.push(clone(seed)); });
      s.stages.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    }
    /* 2. 模块：回填 catalogId / dir，仅当 catalogId 已知才 remap 阶段（绝不碰自定义模块） */
    if (Array.isArray(s.modules)) {
      s.modules.forEach(m => {
        if (!m.catalogId && legacyMap[m.id]) m.catalogId = legacyMap[m.id];
        const tpl = m.catalogId ? catalogById[m.catalogId] : null;
        if (tpl) { m.dir = tpl.dir; m.stageId = PHASE_STAGE[tpl.phase] || m.stageId; }
        else if (!m.dir) m.dir = 'common';
      });
      /* 3. 仅 v3 → v4：补齐缺失主线（跳过 legacy 双胞胎以尊重删除、跳过 mastered） */
      if (origVersion === 3) {
        const have = new Set(s.modules.map(m => m.catalogId || m.id));
        routeOrder.forEach(cid => {
          const tpl = catalogById[cid];
          if (!tpl || tpl.mastered || tpl.legacyId || have.has(cid)) return;
          const mod = instantiate(tpl, tpl.suggestOwner, PHASE_STAGE[tpl.phase]);
          let idx = -1;
          for (let i = 0; i < s.modules.length; i++) { if (s.modules[i].stageId === mod.stageId) idx = i; }
          if (idx >= 0) s.modules.splice(idx + 1, 0, mod); else s.modules.push(mod);
          have.add(cid);
        });
      }
    }
    s.version = SCHEMA;
    return s;
  }

  return { members, stages, hardware, modules, resources, buildState, catalog, routeOrder, SCHEMA, upgradeToV4, PHASE_STAGE, legacyMap, instantiate };
});