#!/usr/bin/env node
// extract-baseline.mjs — ui-forge C4 CLI：对设计稿 URL 提取 C2 baseline.json。
// 契约出处：docs/plans/2026-09-25-ui-forge-plan.md 契约矩阵 C2/C4；
// 内置映射表数据源：references/visual-baseline-protocol.md §3（逐字照搬，禁在此重定义）。
// 零 npm 依赖（仅 node: 内置模块）；playwright 为可选运行时，缺失时退出码 2 并给补救提示。
// 本模块顶层零副作用：T8 经 `import { extractElements } from './extract-baseline.mjs'`
// 复用提取内核时不得触发 playwright 解析或进程退出，探测只在 CLI main 内进行。

import { parseArgs } from 'node:util';
import { createRequire } from 'node:module';
import { sep } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const EXTRACTOR_VERSION = '0.1.0';

// C2 props 14 属性集（plan 契约矩阵 C2 逐字）。键名 camelCase 与 CSSStyleDeclaration
// IDL 属性同名，取值处直接 cs[p]，免 camelCase→kebab-case 换算引入的抄写错误面。
const PROPS = [
  'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing',
  'color', 'background', 'padding', 'marginBottom', 'border',
  'borderRadius', 'height', 'minHeight', 'gap',
];

// 内置锚点元素最小集：role → 默认 selector 映射表 16 行，逐字照搬自
// references/visual-baseline-protocol.md §3（role↔selector 双键）；
// --elements 传入时按 role 合并覆盖（屏特有锚点 keycode 等不在此表）。
const BUILTIN_ELEMENTS = [
  { role: 'wordmark', selector: '.wordmark, .brand' },
  { role: 'end-tab', selector: '.end-tab.on, .end-tab' },
  { role: 'side-item', selector: '.side-item.on, .side-item' },
  { role: 'side-cap', selector: '.side-item .cap' },
  { role: 'page-title', selector: '.page-title, h1' },
  { role: 'page-desc', selector: '.page-desc' },
  { role: 'card-title', selector: '.card .ct, .card-title' },
  { role: 'card-desc', selector: '.card .cd, .card-desc' },
  { role: 'btn-primary', selector: '.btn.primary' },
  { role: 'btn-sm', selector: '.btn.sm' },
  { role: 'input', selector: 'input' },
  { role: 'table-th', selector: '.tbl th, table th' },
  { role: 'table-td', selector: '.tbl td, table td' },
  { role: 'alert-title', selector: '.alert .at, .alert-title' },
  { role: 'tag', selector: '.tag' },
  { role: 'badge', selector: '.badge' },
];

const USAGE = `用法：node extract-baseline.mjs --url <url> --out <path> --viewport <WxH> [--elements <json-file>] [--prepare <js-file>]

对设计稿页面提取 C2 baseline.json（顶层键 meta/elements/exemptions，props 14 属性集）。

参数：
  --url        设计稿 URL（金样形：http://localhost:8931/hifi.html）
  --out        baseline JSON 输出路径
  --viewport   视口宽高，格式 WxH（例 1200x860）
  --elements   元素定义 JSON 文件（数组；项键 role/selector 必填，nth?/textContains?/implSelector?/implTextContains?/group? 可选）。缺省用内置锚点元素最小集，传入时与内置集按 role 合并覆盖。implSelector/implTextContains/group 为 gate 侧键，本脚本（extract 侧）忽略
  --prepare    提取前对页面 page.evaluate 该 JS 文件（设计稿切屏预备；逐屏基线工作流 = 每屏一次 --prepare 提取），缺省无
  --help       打印本用法并退出（退出码 0）

退出码：0 成功/--help；1 用法或输入错误；2 playwright 模块或浏览器二进制缺失
`;

// 模块域 playwright 三级探测，返回 chromium 启动器或 null（三级尽失败 = 模块缺失）。
// .mjs 无 require——createRequire/sep 均须顶部具名 import，内联 require('node:path')
// 运行即 ReferenceError（plan R3-F4）。
async function loadChromium() {
  // ① CWD 锚定：使金样等消费目录的本地安装可解析；② 脚本位置锚定：skill 目录侧安装
  for (const base of [process.cwd() + sep, import.meta.url]) {
    try {
      const req = createRequire(base);
      req.resolve('playwright'); // 探测：模块缺失即抛 → 落下一级
      const chromium = pickChromium(req('playwright'));
      if (chromium) return chromium;
    } catch {
      // 探测失败 = 本级不可用，尝试下一级
    }
  }
  // ③ 默认解析链兜底（动态 import，失败静默——兜底语义）
  try {
    const chromium = pickChromium(await import('playwright'));
    if (chromium) return chromium;
  } catch {
    // 三级尽失败 = 模块缺失，交由 main 给退出码 2 提示
  }
  return null;
}

// 归一 CJS require 结果与 ESM namespace 两种形态：chromium 可在顶层或 .default 下
function pickChromium(mod) {
  const root = mod?.chromium ? mod : mod?.default?.chromium ? mod.default : null;
  return root ? root.chromium : null;
}

function isBinaryMissing(err) {
  // playwright 二进制缺失错误的标志性消息（近版本一致："Executable doesn't exist at ..."）；
  // 只认二进制类错误，非二进制 launch 失败不归二进制域管辖
  return err instanceof Error && /Executable doesn't exist/i.test(err.message);
}

// 二进制域④：模块已载但 chromium.launch() 抛二进制缺失 → 若 PLAYWRIGHT_CHROMIUM_PATH
// 存在则以 executablePath 重试一次（脚本自定义 env 语义，不依赖 playwright 内建 env 约定）
async function launchChromium(chromium) {
  try {
    return await chromium.launch();
  } catch (err) {
    if (!isBinaryMissing(err)) throw err;
    const execPath = process.env.PLAYWRIGHT_CHROMIUM_PATH;
    if (execPath) {
      try {
        return await chromium.launch({ executablePath: execPath });
      } catch {
        // 重试仍失败 → 落到统一补救提示
      }
    }
    console.error('`npx playwright install chromium`，或设 PLAYWRIGHT_CHROMIUM_PATH 指向既有 chrome 可执行文件');
    process.exit(2);
  }
}

// C4 命名导出（签名逐字，T8 复用点）：入参 = 已打开的 playwright Page 与 elements 数组
// （C2 --elements 项键形态），返回 = C2 elements 形态数组；CLI main 与本导出共用本内核。
export async function extractElements(page, elements) {
  const results = [];
  for (const el of elements) {
    const handles = await page.$$(el.selector);
    const handle = await pickHandle(handles, el);
    if (!handle) {
      // 定位失败逐条告警不中断：基线缺项比假值安全（C9 零出处纪律——不发明值）
      console.error(`[extract-baseline] 未定位 role=${el.role} selector=${el.selector}`
        + (el.nth != null ? ` nth=${el.nth}` : '')
        + (el.textContains != null ? ` textContains=${el.textContains}` : ''));
      continue;
    }
    try {
      const measured = await measureElement(handle);
      results.push({ selector: el.selector, role: el.role, props: measured.props, _rect: measured._rect, _visible: measured._visible });
    } finally {
      await handle.dispose();
    }
  }
  return results;
}

// nth = querySelectorAll 序号（显式序号优先于文本过滤）；textContains 过滤取
// children.length===0 的叶子元素首个匹配；两者皆缺省取首个匹配
async function pickHandle(handles, el) {
  if (el.nth != null) return handles[el.nth] ?? null;
  if (el.textContains != null) {
    for (const h of handles) {
      if (await h.evaluate(
        (node, t) => node.children.length === 0 && (node.textContent || '').includes(t),
        el.textContains,
      )) {
        return h;
      }
    }
    return null;
  }
  return handles[0] ?? null;
}

// 单次 evaluate 内完成「揭示-测量-还原」三步（try/finally 保证还原原子性，中途异常
// 不残留揭示态）。隐藏祖先自动揭示（plan R3-F2）：SPA 式 hifi 非默认屏常挂
// display:none，hidden 子树 computed height 退化为 auto、_rect 归零——定位后自元素
// 向上遍历，凡 computed display=none 者记录 inline display 原值并置 'block'（brief
// 逐字裁定，含目标元素自身）；向上走只改已访元素的子树，不影响未读节点的 computed
// display，故边遍历边置值安全。
async function measureElement(handle) {
  return handle.evaluate((node, propNames) => {
    // C3：原生可见性（揭示前判定）——谓词与 visual-gate-protocol §7 逐字一致；
    // 祖先 display:none 时 getClientRects() 为空，无需逐祖先检查
    const csBefore = getComputedStyle(node);
    const natVisible = node.getClientRects().length > 0
      && csBefore.display !== 'none' && csBefore.visibility !== 'hidden';
    const hidden = [];
    for (let cur = node; cur && cur.nodeType === Node.ELEMENT_NODE; cur = cur.parentElement) {
      if (getComputedStyle(cur).display === 'none') {
        hidden.push([cur, cur.style.display]); // inline 原值；'' = 无 inline 覆盖，还原即清除
        cur.style.display = 'block';
      }
    }
    try {
      const cs = getComputedStyle(node);
      const props = {};
      for (const p of propNames) props[p] = cs[p];
      const rect = node.getBoundingClientRect();
      return { props, _rect: { width: rect.width, height: rect.height }, _visible: natVisible };
    } finally {
      for (const [elm, prev] of hidden) elm.style.display = prev;
    }
  }, PROPS);
}

// --elements 与内置集按 role 合并覆盖（protocol §2.2「合并覆盖」）；role 是覆盖键
function mergeElements(elementsFile) {
  const byRole = new Map(BUILTIN_ELEMENTS.map((e) => [e.role, e]));
  if (elementsFile) {
    let custom;
    try {
      custom = JSON.parse(readFileSync(elementsFile, 'utf8'));
    } catch (err) {
      throw new Error(`读取/解析失败：${elementsFile}（${err.message}）`);
    }
    if (!Array.isArray(custom)) {
      throw new Error(`--elements 文件须为 JSON 数组：${elementsFile}`);
    }
    for (const item of custom) {
      if (!item || typeof item.role !== 'string' || typeof item.selector !== 'string') {
        throw new Error(`--elements 项缺 role/selector：${JSON.stringify(item)}`);
      }
      byRole.set(item.role, item);
    }
  }
  // C1：同 selector 同 nth（缺省按 0）多条目 = 重复测量同一元素——告警不中断
  const seenSelNth = new Set();
  for (const item of byRole.values()) {
    const key = `${item.selector}#${item.nth ?? 0}`;
    if (seenSelNth.has(key)) {
      console.error(`[extract-baseline] 多条目同 selector 同 nth：${item.selector} nth=${item.nth ?? 0}——将重复测量同一元素，确认是否笔误`);
    }
    seenSelNth.add(key);
  }
  return [...byRole.values()];
}

async function main() {
  const { values } = parseArgs({
    options: {
      url: { type: 'string' },
      out: { type: 'string' },
      viewport: { type: 'string' },
      elements: { type: 'string' },
      prepare: { type: 'string' },
      help: { type: 'boolean', default: false },
    },
  });

  if (values.help) {
    console.log(USAGE);
    process.exit(0);
  }

  const missing = ['url', 'out', 'viewport'].filter((k) => !values[k]);
  if (missing.length > 0) {
    console.error(`缺少必填参数：--${missing.join(', --')}\n\n${USAGE}`);
    process.exit(1);
  }

  const viewportMatch = /^(\d+)x(\d+)$/.exec(values.viewport);
  if (!viewportMatch) {
    console.error(`--viewport 格式须为 WxH（例 1200x860），实收：${values.viewport}\n\n${USAGE}`);
    process.exit(1);
  }
  const viewport = { width: Number(viewportMatch[1]), height: Number(viewportMatch[2]) };

  let elements;
  try {
    elements = mergeElements(values.elements);
  } catch (err) {
    console.error(`--elements 加载失败：${err.message}`);
    process.exit(1);
  }

  const chromium = await loadChromium();
  if (!chromium) {
    // 模块域三级尽失败 = playwright 模块缺失（brief 逐字提示语）
    console.error('在运行目录执行 `npm i -D playwright` 后重试');
    process.exit(2);
  }

  const browser = await launchChromium(chromium);
  const page = await browser.newPage({ viewport });
  await page.goto(values.url, { waitUntil: 'load' });
  if (values.prepare) await page.evaluate(readFileSync(values.prepare, 'utf8'));
  const extracted = await extractElements(page, elements);
  await browser.close();

  const baseline = {
    meta: {
      sourceUrl: values.url,
      viewport: values.viewport,
      extractedAt: new Date().toISOString(),
      extractorVersion: EXTRACTOR_VERSION,
    },
    elements: extracted,
    // C2 顶层键占位：豁免登记属 visual-gate 流程产出，extract 侧恒空数组
    exemptions: [],
  };
  writeFileSync(values.out, JSON.stringify(baseline, null, 2) + '\n');
  console.log(`已写出 ${values.out}（elements ${extracted.length} 项）`);
}

// 入口守卫：仅作为 CLI 直接执行时跑 main；被 import（T8 复用 extractElements）时
// 顶层零副作用——不 parseArgs、不探测、不退出（本模块头注的契约，实跑抓回）
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    // process.exit(2) 类受控退出不会到达此处；此处兜底非受控异常（网络、写入失败等）
    console.error(err instanceof Error ? err.stack : String(err));
    process.exit(1);
  });
}
