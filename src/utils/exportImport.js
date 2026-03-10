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
        const costText = node.cost ? `${node.currency || ''} ${Number(node.cost).toLocaleString()}` : '-';
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

  return {
    ...raw,
    plans: raw.plans.map((plan) => ({
      id: plan.id,
      name: plan.name || '未命名方案',
      companions: plan.companions || [],
      checklists: plan.checklists || [],
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
          subtasks: node.subtasks || [],
          lat: node.lat || '',
          lng: node.lng || '',
        })),
      })),
    })),
  };
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
