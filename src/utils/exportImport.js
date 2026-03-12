import { getNodeExpenseByCurrency, normalizeExpenseItems } from './expenses';
import { ensureChecklistFinancialEssentials } from '../store/storage';

export function downloadJson(data, filename = 'trip_plan_v2.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadMarkdown(plan, filename) {
  const lines = [];
  lines.push(`# ${plan.name}`);
  lines.push('');
  lines.push(`- 方案天數: ${plan.days.length}`);
  lines.push('');

  plan.days.forEach((day, idx) => {
    lines.push(`## Day ${idx + 1}: ${day.title}`);
    if (day.subtitle) lines.push(`> ${day.subtitle}`);
    lines.push('');

    if (day.weather?.condition || day.weather?.tempHigh || day.weather?.tempLow) {
      lines.push(
        `- 天氣: ${day.weather?.condition || '-'} ${day.weather?.tempHigh || '-'} / ${day.weather?.tempLow || '-'} C`
      );
    }

    if (day.nodes?.length) {
      lines.push('### 行程節點');
      day.nodes.forEach((node) => {
        const costMap = getNodeExpenseByCurrency(node);
        const costText = Object.keys(costMap).length
          ? Object.entries(costMap)
              .map(([cur, amount]) => `${cur} ${Number(amount).toLocaleString()}`)
              .join(' / ')
          : '-';
        lines.push(`- ${node.time ? `[${node.time}] ` : ''}${node.title || '未命名'} (${node.type || 'activity'})`);
        lines.push(`  - 標籤: ${node.tags || '-'}`);
        lines.push(`  - 花費: ${costText}`);
        if (node.lat && node.lng) {
          lines.push(`  - 地圖: https://www.google.com/maps?q=${node.lat},${node.lng}`);
        }
      });
    } else {
      lines.push('- 此日尚無節點');
    }

    if (day.journal) {
      lines.push('');
      lines.push('### 旅行日誌');
      lines.push(day.journal);
    }

    lines.push('');
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${plan.name}_report.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function normalizeImportedData(raw) {
  if (!raw?.plans || !Array.isArray(raw.plans)) return null;

  return ensureChecklistFinancialEssentials({
    ...raw,
    plans: raw.plans.map((plan) => ({
      id: plan.id,
      name: plan.name || '未命名方案',
      companions: plan.companions || [],
      checklists: (plan.checklists || []).map((cat) => ({
        ...cat,
        category: cat.category || '未命名分類',
        items: (cat.items || []).map((item) => ({
          ...item,
          text: item.text || '',
          isNote: Boolean(item.isNote),
          isChecked: item.isNote ? false : Boolean(item.isChecked),
        })),
      })),
      days: (plan.days || []).map((day, dayIndex) => ({
        id: day.id,
        title: day.title || `Day ${dayIndex + 1}`,
        subtitle: day.subtitle || '',
        journal: day.journal || '',
        weather: day.weather || { condition: '', tempHigh: '', tempLow: '' },
        nodes: (day.nodes || []).map((node) => ({
          ...node,
          time: node.time || '',
          tags: node.tags || '',
          cost: Number(node.cost || 0),
          currency: node.currency || 'TWD',
          paymentStatus: node.paymentStatus || 'cash',
          paidBy: node.paidBy || '',
          splitAmong: node.splitAmong || [],
          expenseItems: normalizeExpenseItems(node),
          subtasks: node.subtasks || [],
          lat: node.lat || '',
          lng: node.lng || '',
        })),
      })),
    })),
  });
}

export function exportPlanPdf(plan) {
  const esc = (value) =>
    String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  const toCostText = (costMap) =>
    Object.keys(costMap).length
      ? Object.entries(costMap)
          .map(([cur, amount]) => `${esc(cur)} ${Number(amount).toLocaleString()}`)
          .join(' / ')
      : '-';

  const getDayCostMap = (day) =>
    (day.nodes || []).reduce((acc, node) => {
      const nodeCosts = getNodeExpenseByCurrency(node);
      Object.entries(nodeCosts).forEach(([cur, amount]) => {
        acc[cur] = (acc[cur] || 0) + Number(amount || 0);
      });
      return acc;
    }, {});

  const planCostMap = plan.days.reduce((acc, day) => {
    const dayCosts = getDayCostMap(day);
    Object.entries(dayCosts).forEach(([cur, amount]) => {
      acc[cur] = (acc[cur] || 0) + Number(amount || 0);
    });
    return acc;
  }, {});
  const planCostText = toCostText(planCostMap);

  const tocHtml = plan.days
    .map((day, dayIndex) => {
      const nodes = day.nodes || [];
      const nodesToc = nodes
        .map((node, nodeIndex) => {
          const nodeLabel = node.time ? `[${esc(node.time)}] ${esc(node.title || '未命名')}` : esc(node.title || '未命名');
          return `<li><a href="#export-node-${dayIndex}-${nodeIndex}">${nodeLabel}</a></li>`;
        })
        .join('');

      return `
        <div class="toc-day">
          <a class="toc-day-title" href="#export-day-${dayIndex}">Day ${dayIndex + 1} ${esc(day.title || `Day ${dayIndex + 1}`)} <span class="toc-count">${nodes.length} nodes</span></a>
          ${nodes.length ? `<ul class="toc-nodes">${nodesToc}</ul>` : '<div class="toc-empty">此日尚無節點</div>'}
        </div>
      `;
    })
    .join('');

  const CHUNK_SIZE = 8;
  const daySections = plan.days
    .flatMap((day, idx) => {
      const nodes = day.nodes || [];
      const dayCostText = toCostText(getDayCostMap(day));
      const chunkCount = Math.max(1, Math.ceil(nodes.length / CHUNK_SIZE));

      return Array.from({ length: chunkCount }, (_, chunkIndex) => {
        const start = chunkIndex * CHUNK_SIZE;
        const end = start + CHUNK_SIZE;
        const chunkNodes = nodes.slice(start, end);

        const nodesHtml = chunkNodes
          .map((node, offset) => {
            const nodeIndex = start + offset;
            const costMap = getNodeExpenseByCurrency(node);
            const costText = toCostText(costMap);
            const mapText = node.lat && node.lng
              ? `<a href="https://www.google.com/maps?q=${esc(node.lat)},${esc(node.lng)}" target="_blank" rel="noreferrer">地圖座標</a>`
              : '未設定';

            return `
              <div class="node" id="export-node-${idx}-${nodeIndex}">
                <div class="node-title">${node.time ? `[${esc(node.time)}] ` : ''}${esc(node.title || '未命名')}</div>
                <div class="meta">類型: ${esc(node.type || 'activity')} | 標籤: ${esc(node.tags || '-')}</div>
                <div class="meta">花費: ${costText} | 座標: ${mapText}</div>
              </div>
            `;
          })
          .join('');

        return `
          <section class="day${chunkIndex > 0 ? ' day-break' : ''}" ${chunkIndex === 0 ? `id="export-day-${idx}"` : ''}>
            <div class="day-head-row">
              <h2>Day ${idx + 1}: ${esc(day.title || `Day ${idx + 1}`)}</h2>
              <span class="chunk-tag">區塊 ${chunkIndex + 1}/${chunkCount}</span>
            </div>
            ${day.subtitle ? `<p class="subtitle">${esc(day.subtitle)}</p>` : ''}
            <p class="meta">天氣: ${esc(day.weather?.condition || '-')} ${esc(day.weather?.tempHigh || '-')} / ${esc(day.weather?.tempLow || '-')} C</p>
            <p class="meta">當日節點: ${nodes.length} | 當日花費: ${dayCostText} | 方案花費: ${planCostText}</p>
            <div class="nodes">${nodesHtml || '<p class="empty">此日尚無節點</p>'}</div>
            ${chunkIndex === chunkCount - 1 && day.journal ? `<div class="journal"><strong>旅行日誌</strong><p>${esc(day.journal).replaceAll('\n', '<br/>')}</p></div>` : ''}
          </section>
        `;
      });
    })
    .join('');

  const html = `<!doctype html>
  <html lang="zh-TW">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${esc(plan.name)} - 列印版</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: 'Noto Sans TC', 'Segoe UI', sans-serif; color: #0f172a; margin: 0; padding: 10mm; }
        .doc { width: 100%; }
        h1 { margin: 0 0 8px; }
        .cover { margin-bottom: 20px; border-bottom: 2px solid #cbd5e1; padding-bottom: 12px; page-break-after: always; }
        .toc-wrap { margin-top: 12px; border-top: 1px dashed #cbd5e1; padding-top: 10px; }
        .toc-title { font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 8px; }
        .toc-day { margin: 6px 0; padding: 6px 8px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; }
        .toc-day-title { font-size: 13px; font-weight: 700; color: #0f172a; text-decoration: none; display: flex; justify-content: space-between; gap: 8px; }
        .toc-count { font-size: 11px; color: #64748b; font-weight: 600; }
        .toc-nodes { margin: 6px 0 0 16px; padding: 0; }
        .toc-nodes li { margin: 2px 0; color: #334155; font-size: 12px; }
        .toc-nodes a { color: #334155; text-decoration: none; }
        .toc-empty { margin-top: 4px; font-size: 12px; color: #64748b; font-style: italic; }
        .day { border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px; margin-bottom: 10mm; page-break-inside: avoid; break-inside: avoid; }
        .day-break { page-break-before: always; break-before: page; }
        .day-head-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .day-head-row h2 { margin: 0; }
        .chunk-tag { font-size: 11px; color: #475569; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 999px; padding: 2px 8px; white-space: nowrap; }
        .subtitle { color: #475569; margin-top: -4px; }
        .meta { color: #334155; font-size: 13px; margin: 2px 0; }
        .node { border-left: 4px solid #0f766e; background: #f8fafc; border-radius: 6px; padding: 8px 10px; margin-bottom: 8px; page-break-inside: avoid; break-inside: avoid; }
        .node-title { font-weight: 700; margin-bottom: 2px; }
        .journal { margin-top: 8px; padding: 8px 10px; border: 1px dashed #f59e0b; background: #fffbeb; border-radius: 8px; }
        .journal p { margin: 6px 0 0; }
        .empty { color: #64748b; font-style: italic; }
        @media print {
          @page { size: A4; margin: 8mm; }
          html, body { width: 100%; }
          body { padding: 0; }
          a { color: #0f766e; text-decoration: none; }
        }
      </style>
    </head>
    <body>
      <div class="doc">
        <div class="cover">
          <h1>${esc(plan.name)}</h1>
          <div class="meta">天數: ${plan.days.length} | 方案花費: ${planCostText}</div>
          <div class="toc-wrap">
            <p class="toc-title">行程目錄</p>
            ${tocHtml}
          </div>
        </div>
        ${daySections}
      </div>
      <script>
        window.onload = function () {
          setTimeout(function () { window.print(); }, 250);
        };
      <\/script>
    </body>
  </html>`;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('無法開啟列印視窗，請確認瀏覽器未封鎖彈出視窗');
    return;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

export function parseJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result));
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
