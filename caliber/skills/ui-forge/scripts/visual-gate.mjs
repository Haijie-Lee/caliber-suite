#!/usr/bin/env node
// visual-gate.mjs — ui-forge C3 CLI：impl 实现对拍 baseline（C2），产出 T6 报告并按豁免过滤给退出码。
// 契约出处：docs/plans/2026-09-25-ui-forge-plan.md 契约矩阵 C3；
// 判定规格出处：references/visual-gate-protocol.md（T6 阈值表/报告 schema/豁免两段式/噪音纪律）。
// 提取内核复用 T7 命名导出（C4 复用点）；playwright 探测链与 T7 同纪律（两域四级）。

import { parseArgs } from 'node:util';
import { createRequire } from 'node:module';
import { sep } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { extractElements } from './extract-baseline.mjs';

// T6 步骤 2 阈值表（逐字档）：零容差 8 / ±1px 5 / fontFamily 逐字等值 / 栏比例 ±2%
const ZERO_TOLERANCE = ['fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color', 'background', 'border', 'borderRadius'];
const PM_1PX = ['height', 'minHeight', 'padding', 'gap', 'marginBottom'];
const EXACT_TEXT = ['fontFamily'];
const RATIO_TOLERANCE = 0.02; // 栏比例：|implRatio − designRatio| / designRatio > 0.02 记一条布局族 diff（算式逐字）

// T6 步骤 3 prop → 族映射表（报告分组数据源；文案族/图标媒体族为人工检查项，不进机器 diff）
const PROP_FAMILY = {
  fontFamily: '排版族', fontSize: '排版族', fontWeight: '排版族', lineHeight: '排版族', letterSpacing: '排版族',
  padding: '空间族', marginBottom: '空间族', gap: '空间族',
  color: '色彩族', background: '色彩族',
  height: '控件族', minHeight: '控件族', border: '控件族', borderRadius: '控件族',
};
const RATIO_FAMILY = '布局族';
const FAMILY_ORDER = ['排版族', '空间族', '色彩族', '控件族', '布局族'];

const USAGE = `用法：node visual-gate.mjs --design-url <url> --impl-url <url> --baseline <path> --elements <json-file> --viewport <WxH> [--out <path>] [--prepare <js-file>] [--prepare-design <js-file>]

对 impl 实现页跑提取并与 baseline（C2）逐属性对拍，产出 T6 报告与双截图，按豁免过滤给退出码。

参数：
  --design-url  设计稿 URL（消费点：①报告头部 meta 行 sourceUrl 对拍溯源 ②截 <out词干>.shot-design.png）
  --impl-url    实现页 URL（live 提取对象，截 <out词干>.shot-impl.png）
  --baseline    baseline JSON（C2 schema，extract-baseline.mjs 产出；exemptions 顶层键供豁免过滤）
  --elements    元素定义 JSON 文件（数组；项键 role/selector 必填，implSelector?/nth?/textContains?/implTextContains?/group? 可选）
  --viewport    视口宽高，格式 WxH（例 1200x860）
  --out         报告输出路径，缺省 fidelity-report.md；双截图挂 out 词干落同目录（<out词干>.shot-design.png/.shot-impl.png）
  --prepare     提取前对 impl 页面 page.evaluate 该 JS 文件（SPA 切屏等预备动作），缺省无
  --prepare-design 截 shot-design 前对 design 页面 page.evaluate 该 JS 文件（设计稿切屏预备，2026-09-25 起），缺省无
  --help        打印本用法并退出（退出码 0）

退出码：0 无未豁免 diff；1 有未豁免 diff；2 运行错误（含用法错误、playwright 模块或浏览器二进制缺失）
`;

// --- playwright 两域四级探测（与 extract-baseline.mjs 同纪律，注释从略处见 T7） ---
async function loadChromium() {
  for (const base of [process.cwd() + sep, import.meta.url]) {
    try {
      const req = createRequire(base);
      req.resolve('playwright');
      const chromium = pickChromium(req('playwright'));
      if (chromium) return chromium;
    } catch {
      // 本级不可用，尝试下一级
    }
  }
  try {
    const chromium = pickChromium(await import('playwright'));
    if (chromium) return chromium;
  } catch {
    // 三级尽失败 = 模块缺失
  }
  return null;
}

function pickChromium(mod) {
  const root = mod?.chromium ? mod : mod?.default?.chromium ? mod.default : null;
  return root ? root.chromium : null;
}

function isBinaryMissing(err) {
  return err instanceof Error && /Executable doesn't exist/i.test(err.message);
}

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
        // 重试仍失败 → 统一补救提示
      }
    }
    console.error('`npx playwright install chromium`，或设 PLAYWRIGHT_CHROMIUM_PATH 指向既有 chrome 可执行文件');
    process.exit(2);
  }
}

// --- 输入加载 ---
function loadJson(path, label) {
  let data;
  try {
    data = JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    throw new Error(`${label} 读取/解析失败：${path}（${err.message}）`);
  }
  return data;
}

function loadInputs(values) {
  const baseline = loadJson(values.baseline, '--baseline');
  if (!baseline || !Array.isArray(baseline.elements)) {
    throw new Error('--baseline 非 C2 schema（缺 elements 数组）');
  }
  const elements = loadJson(values.elements, '--elements');
  if (!Array.isArray(elements)) {
    throw new Error('--elements 文件须为 JSON 数组');
  }
  for (const item of elements) {
    if (!item || typeof item.role !== 'string' || typeof item.selector !== 'string') {
      throw new Error(`--elements 项缺 role/selector：${JSON.stringify(item)}`);
    }
  }
  // C1：role = 配对键域，同一 --elements 文件内须唯一（重复 = 配对歧义，退 2）
  const seenRoles = new Set();
  for (const item of elements) {
    if (seenRoles.has(item.role)) {
      throw new Error(`--elements role 重复：${item.role}（配对键域 = role，同一文件内须唯一——C1）`);
    }
    seenRoles.add(item.role);
  }
  // C1：同 selector 且同 nth（缺省按 0）多条目 = 提取将重复测量同一元素——告警不中断
  // （多实例须以不同 nth 区分；栏比例 recv-card-left/right 同 selector 不同 nth 为合法形态）
  const seenSelNth = new Set();
  for (const item of elements) {
    const key = `${item.selector}#${item.nth ?? 0}`;
    if (seenSelNth.has(key)) {
      console.error(`[visual-gate] 多条目同 selector 同 nth：${item.selector} nth=${item.nth ?? 0}——将重复测量同一元素，确认是否笔误`);
    }
    seenSelNth.add(key);
  }
  const exemptions = Array.isArray(baseline.exemptions) ? baseline.exemptions : [];
  return { baseline, elements, exemptions };
}

// --- impl 侧定位键映射（T8 步骤 2）：implSelector 缺省 = selector；implTextContains
// 缺省 = textContains；nth 双侧同值分别应用（此处应用于 impl selector）；
// extract 侧只消费 selector/nth/textContains，implSelector/implTextContains/group 在此映射消费。
function toImplElements(elements) {
  return elements.map((el) => ({
    role: el.role,
    selector: el.implSelector ?? el.selector,
    ...(el.nth != null ? { nth: el.nth } : {}),
    ...(el.implTextContains ?? el.textContains ? { textContains: el.implTextContains ?? el.textContains } : {}),
  }));
}

// --- 逐属性 diff（T6 阈值表）。返回 { prop, baseline, actual, magnitude? } 或 null ---
function diffProp(prop, baseVal, implVal) {
  const b = baseVal ?? '';
  const a = implVal ?? '';
  // C2（实战 F-a）：border 零宽归一——preflight `*{border:0 solid}` computed = `0px solid …`，
  // UA 初始 = `0px none …`；首个 px 分量（宽度）双侧均 0 即视觉零差异判等值，
  // 不进逐字比对（AeroFold 首轮 65 diff 中 30+ 条属此族）；任一侧无 px 分量落回逐字比对
  if (prop === 'border') {
    const [bw] = pxComponents(b);
    const [aw] = pxComponents(a);
    if (bw === 0 && aw === 0) return null;
  }
  if (ZERO_TOLERANCE.includes(prop) || EXACT_TEXT.includes(prop)) {
    return a === b ? null : { prop, baseline: b, actual: a };
  }
  if (PM_1PX.includes(prop)) {
    const bn = pxComponents(b);
    const an = pxComponents(a);
    if (bn.length === 0 || an.length === 0 || bn.length !== an.length) {
      // 无法按 px 分量比对（auto/空/分量数不同）→ 退回串比，不等即 diff（差幅不可量化）
      return a === b ? null : { prop, baseline: b, actual: a };
    }
    let max = 0;
    for (let i = 0; i < bn.length; i++) max = Math.max(max, Math.abs(an[i] - bn[i]));
    return max > 1 ? { prop, baseline: b, actual: a, magnitude: max } : null;
  }
  return null; // 不在阈值表的 prop 不判（14 集全覆盖，防御性兜底）
}

function pxComponents(value) {
  const out = [];
  for (const m of String(value).matchAll(/(-?\d+(?:\.\d+)?)px/g)) out.push(Number(m[1]));
  return out;
}

// --- 栏比例判定（T8 步骤 4）：group 同值且 ≥2 个元素为一组，组内两两全算宽度比 ---
// 键域 = role（同一 elements 文件内唯一）：同 selector 多实例对（recv-card-left/right 同
// `#sub-standby .card`、以 nth 区分）按 selector 键会塌缩成同一元素、比率恒 1 静默漏检
//（T12 金样 C8#12 实证）——role 键对齐「同组同序元素对」语义。
function diffGroupRatios(group, baseByRole, implByRole) {
  const diffs = [];
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const [elA, elB] = [group[i], group[j]];
      const bA = baseByRole.get(elA.role)?._rect?.width;
      const bB = baseByRole.get(elB.role)?._rect?.width;
      const iA = implByRole.get(elA.role)?._rect?.width;
      const iB = implByRole.get(elB.role)?._rect?.width;
      if (!bA || !bB || iA == null || iB == null || bB === 0 || iB === 0) continue;
      const designRatio = bA / bB;
      const implRatio = iA / iB;
      const deviation = Math.abs(implRatio - designRatio) / designRatio;
      if (deviation > RATIO_TOLERANCE) {
        diffs.push({
          selector: `${elA.selector}[${elA.nth ?? 0}] ~ ${elB.selector}[${elB.nth ?? 0}]`,
          prop: '栏比例',
          baseline: designRatio.toFixed(4),
          actual: implRatio.toFixed(4),
          magnitude: deviation,
        });
      }
    }
  }
  return diffs;
}

// --- 豁免两段式过滤（T6 步骤 5 句逐字语义）：selector 精确匹配（design 侧 C2 selector
// 为唯一命名域，报告条目与豁免登记同域，implSelector 仅定位用）AND（豁免项带 props 时）
// diff.prop ∈ 豁免.props；豁免项不带 props = 该 selector 全部 diff 豁免 ---
function isExempted(diff, exemptions) {
  return exemptions.some((ex) => {
    if (ex.selector !== diff.selector) return false;
    if (Array.isArray(ex.props) && ex.props.length > 0) return ex.props.includes(diff.prop);
    return true;
  });
}

// --- 报告组装（T6 步骤 4 schema + 步骤 6 噪音纪律）---
function buildReport({ meta, diffs, noiseMode, fullReportPath }) {
  const lines = [];
  const skipped = diffs.skipped ?? [];
  lines.push('# fidelity-report');
  lines.push('');
  lines.push(`meta：sourceUrl=${meta.designUrl} implUrl=${meta.implUrl} baseline=${meta.baselinePath} viewport=${meta.viewport} generatedAt=${meta.generatedAt}`);
  if (noiseMode) {
    lines.push('');
    lines.push(`噪音纪律：未豁免 diff ${diffs.summary.unexempted} 条 > 50——本报告只出汇总 + 按族 top-5，全文落附件 ${fullReportPath}`);
  }
  lines.push('');
  const byFamily = new Map(FAMILY_ORDER.map((f) => [f, []]));
  for (const d of diffs.entries) byFamily.get(d.family)?.push(d);
  for (const family of FAMILY_ORDER) {
    const rows = byFamily.get(family);
    if (rows.length === 0) continue;
    lines.push(`## ${family}`);
    lines.push('');
    lines.push('| selector | prop | baseline | actual | exempted |');
    lines.push('|---|---|---|---|---|');
    const shown = noiseMode ? top5(rows) : rows;
    for (const d of shown) {
      lines.push(`| ${d.selector} | ${d.prop} | ${d.baseline} | ${d.actual} | ${d.exempted} |`);
    }
    if (noiseMode && rows.length > shown.length) lines.push(`| …（其余 ${rows.length - shown.length} 条见附件） | | | | |`);
    lines.push('');
  }
  if (skipped.length > 0 && !noiseMode) {
    lines.push('## 跳过清单');
    lines.push('');
    lines.push('| role | selector | 原因 |');
    lines.push('|---|---|---|');
    for (const s of skipped) lines.push(`| ${s.role} | ${s.selector} | ${s.reason} |`);
    lines.push('');
  }
  lines.push('## 汇总');
  lines.push('');
  lines.push(`总 diff ${diffs.summary.total} / 豁免 ${diffs.summary.exempted} / 未豁免 ${diffs.summary.unexempted} / 跳过 ${skipped.length}`);
  lines.push('');
  // C6（实战 F-g）：未豁免 diff 逐条给可粘贴 exemptions 的 JSON 行；selector+prop 去重
  // （栏比例行 selector 即组合串 selA[nthA] ~ selB[nthB]，nth 缺省 [0]，逐字可登记）
  if (!noiseMode) {
    const suggestions = [];
    const seenSug = new Set();
    for (const d of diffs.entries) {
      if (d.exempted) continue;
      const key = `${d.selector}|${d.prop}`;
      if (seenSug.has(key)) continue;
      seenSug.add(key);
      suggestions.push(`{"selector": ${JSON.stringify(d.selector)}, "props": [${JSON.stringify(d.prop)}], "reason": "", "source": ""}`);
    }
    if (suggestions.length > 0) {
      lines.push('## 豁免登记建议');
      lines.push('');
      lines.push('未豁免 diff 逐条可粘贴进 baseline.exemptions（reason/source 按 visual-gate-protocol §5 证据规约填写；registeredAt 登记时补）：');
      lines.push('');
      for (const s of suggestions) lines.push(`- \`${s}\``);
      lines.push('');
    }
  }
  return lines.join('\n');
}

// top-5 排序写死（T6 步骤 4）：数值属性按差幅降序，其余按生成序
function top5(rows) {
  const numeric = rows.filter((d) => d.magnitude != null).sort((x, y) => y.magnitude - x.magnitude);
  const rest = rows.filter((d) => d.magnitude == null);
  return [...numeric, ...rest].slice(0, 5);
}

async function main() {
  const { values } = parseArgs({
    options: {
      'design-url': { type: 'string' },
      'impl-url': { type: 'string' },
      baseline: { type: 'string' },
      elements: { type: 'string' },
      viewport: { type: 'string' },
      out: { type: 'string' },
      prepare: { type: 'string' },
      'prepare-design': { type: 'string' },
      help: { type: 'boolean', default: false },
    },
  });

  if (values.help) {
    console.log(USAGE);
    process.exit(0);
  }

  const missing = ['design-url', 'impl-url', 'baseline', 'elements', 'viewport'].filter((k) => !values[k]);
  if (missing.length > 0) {
    console.error(`缺少必填参数：--${missing.join(', --')}\n\n${USAGE}`);
    process.exit(2); // C3：1 专属「有未豁免 diff」，用法/运行错误归 2
  }

  const viewportMatch = /^(\d+)x(\d+)$/.exec(values.viewport);
  if (!viewportMatch) {
    console.error(`--viewport 格式须为 WxH（例 1200x860），实收：${values.viewport}`);
    process.exit(2);
  }
  const viewport = { width: Number(viewportMatch[1]), height: Number(viewportMatch[2]) };
  const outPath = values.out ?? 'fidelity-report.md';

  let inputs;
  try {
    inputs = loadInputs(values);
  } catch (err) {
    console.error(err.message);
    process.exit(2);
  }
  const { baseline, elements, exemptions } = inputs;

  const chromium = await loadChromium();
  if (!chromium) {
    console.error('在运行目录执行 `npm i -D playwright` 后重试');
    process.exit(2);
  }

  const prepareJs = values.prepare ? readFileSync(values.prepare, 'utf8') : null;
  const prepareDesignJs = values['prepare-design'] ? readFileSync(values['prepare-design'], 'utf8') : null;
  const browser = await launchChromium(chromium);
  // 截图名挂 --out 词干（report-A.shot-design.png）：多轮对拍同目录不落同名覆盖
  //（T12 金样三轮实证：固定名 shot-design.png 致前轮对被后轮覆盖，计划要求三轮各留一对）
  const shotStem = outPath.replace(/\.md$/, '');
  try {
    // 双页对拍：design 页出截图（shot-design.png），impl 页出提取 + 截图（shot-impl.png）。
    // --prepare 只施 impl 提取侧（C3 字面「提取前对页面」；T12 golden prepare 逐字稿为 impl
    // 侧选择器，design 页无对应 DOM，同施必抛 → 退 2 零产出，exec-review F1）；
    // design 侧预备用 --prepare-design（2026-09-25 起，金样 deferred ①——此前 design
    // 截图恒为默认屏，非默认屏形态二判定缺设计侧视觉锚）
    const designPage = await browser.newPage({ viewport });
    await designPage.goto(values['design-url'], { waitUntil: 'load' });
    if (prepareDesignJs) await designPage.evaluate(prepareDesignJs);
    await designPage.screenshot({ path: `${shotStem}.shot-design.png`, fullPage: true });
    await designPage.close();

    const implPage = await browser.newPage({ viewport });
    await implPage.goto(values['impl-url'], { waitUntil: 'load' });
    if (prepareJs) await implPage.evaluate(prepareJs);
    const implExtracted = await extractElements(implPage, toImplElements(elements));
    await implPage.screenshot({ path: `${shotStem}.shot-impl.png`, fullPage: true });
    await implPage.close();

    // 配对（C1）：键域 = role（--elements 与 baseline.elements 同一命名域，文件内唯一）；
    // selector 仅报告/豁免命名域（design 侧 C2 selector）——同 selector 多实例（nth 区分）
    // 不再塌缩（实战 F-e：cloud 双 page-title 后者覆盖前者静默丢 diff）
    const baseByRole = new Map(baseline.elements.map((e) => [e.role, e]));
    const implByRole = new Map(implExtracted.map((e) => [e.role, e]));
    const entries = [];
    const skipped = [];
    for (const el of elements) {
      const base = baseByRole.get(el.role);
      const impl = implByRole.get(el.role);
      if (!base) {
        console.error(`[visual-gate] baseline 缺项 role=${el.role} selector=${el.selector}——跳过（不进 diff 计数）`);
        continue;
      }
      if (!impl) {
        // impl 整元素缺失 = 一条「元素缺失」diff（控件族，默认未豁免 → 退出码 1）——
        // warn+skip 不计 diff 会成假绿通道（campaign gate 按退出码判红即漏检，exec-review F2）；
        // baseline 侧缺项仍 skip（无 ground truth 不造值，C9）
        console.error(`[visual-gate] impl 未定位 role=${el.role}（implSelector=${el.implSelector ?? el.selector}）——计「元素缺失」diff 一条`);
        entries.push({ family: '控件族', selector: el.selector, prop: '元素缺失', baseline: 'present', actual: 'missing' });
        continue;
      }
      // C4 可见性三态（实战 L13/L15）：legacy 基线无 _visible 键 = true（C3 兼容语义）
      const baseVisible = base._visible !== false;
      const implVisible = impl._visible !== false;
      if (!baseVisible && !implVisible) {
        skipped.push({ role: el.role, selector: el.selector, reason: '双侧不可见——元素属未 prepare 屏（按屏拆分 elements 为推荐工作流，协议 §7）' });
        console.error(`[visual-gate] 双侧不可见 role=${el.role}（${el.selector}）——跳过（skipped 非 diff）：属当前屏则检查 prepare 序列，属其他屏则按屏拆分 elements 清单`);
        continue;
      }
      if (!baseVisible) {
        skipped.push({ role: el.role, selector: el.selector, reason: 'baseline 侧不可见——基线屏态未覆盖（用 extract-baseline --prepare 按屏提取基线）' });
        console.error(`[visual-gate] baseline 侧不可见 role=${el.role}（${el.selector}）——跳过（无 ground truth 不造值，C9）；用 extract-baseline --prepare 按屏提取基线`);
        continue;
      }
      if (!implVisible) {
        entries.push({ family: '控件族', selector: el.selector, prop: '元素不可见', baseline: 'visible', actual: 'not-visible' });
        console.error(`[visual-gate] impl 侧不可见 role=${el.role}（implSelector=${el.implSelector ?? el.selector}）——计「元素不可见」diff：属当前屏 = 实现缺陷；属其他屏 = elements 清单/prepare 未对齐`);
        continue;
      }
      for (const prop of [...ZERO_TOLERANCE, ...PM_1PX, ...EXACT_TEXT]) {
        const d = diffProp(prop, base.props?.[prop], impl.props?.[prop]);
        if (d) entries.push({ family: PROP_FAMILY[prop], selector: el.selector, ...d });
      }
    }
    // 栏比例（布局族）：同 group ≥2 元素为一组
    const groups = new Map();
    for (const el of elements) {
      if (typeof el.group !== 'string') continue;
      if (!groups.has(el.group)) groups.set(el.group, []);
      groups.get(el.group).push(el);
    }
    // C4 栏比例组可见性过滤：任一侧不可见的组成员剔除（揭示态宽度垃圾值同 C4 三态语义）；
    // impl 未定位（undefined）不剔除——元素缺失 diff 已在元素循环计、比率侧 iA==null 跳过
    for (const [gname, group] of groups) {
      const alive = group.filter((el) => {
        const b = baseByRole.get(el.role);
        const i = implByRole.get(el.role);
        return b?._visible !== false && i?._visible !== false;
      });
      if (alive.length !== group.length) {
        console.error(`[visual-gate] 栏比例组 ${gname} 剔除不可见成员 ${group.length - alive.length} 个（揭示态宽度不判）`);
        groups.set(gname, alive);
      }
    }
    for (const group of groups.values()) {
      if (group.length < 2) continue;
      for (const d of diffGroupRatios(group, baseByRole, implByRole)) {
        entries.push({ family: RATIO_FAMILY, ...d });
      }
    }

    for (const d of entries) d.exempted = isExempted(d, exemptions);
    const exemptedCount = entries.filter((d) => d.exempted).length;
    const summary = { total: entries.length, exempted: exemptedCount, unexempted: entries.length - exemptedCount };

    // 噪音纪律（T6 步骤 6）：未豁免 > 50 → 报告只出汇总 + 按族 top-5，全文落附件
    const noiseMode = summary.unexempted > 50;
    const fullReportPath = `${outPath}.full.md`;
    const meta = {
      designUrl: values['design-url'],
      implUrl: values['impl-url'],
      baselinePath: values.baseline,
      viewport: values.viewport,
      generatedAt: new Date().toISOString(),
    };
    const diffs = { entries, summary, skipped };
    if (noiseMode) {
      writeFileSync(fullReportPath, buildReport({ meta, diffs, noiseMode: false, fullReportPath }));
    }
    writeFileSync(outPath, buildReport({ meta, diffs, noiseMode, fullReportPath }));
    console.log(`已写出 ${outPath}（总 diff ${summary.total} / 豁免 ${summary.exempted} / 未豁免 ${summary.unexempted}）`);

    process.exit(summary.unexempted > 0 ? 1 : 0);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  // 受控 process.exit 不到此处；此处兜底非受控异常（网络、文件写入失败等）= 运行错误
  console.error(err instanceof Error ? err.stack : String(err));
  process.exit(2);
});
