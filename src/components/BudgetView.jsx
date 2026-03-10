import React, { useMemo } from 'react';
import { NODE_TYPES } from '../store/initialData';

export default function BudgetView({ plan }) {
  const stats = useMemo(() => {
    const allNodes = plan.days.flatMap((d) => d.nodes);
    const byCurrency = {};
    const byType = {};

    allNodes.forEach((n) => {
      const amount = Number(n.cost || 0);
      if (!amount) return;
      byCurrency[n.currency] = (byCurrency[n.currency] || 0) + amount;
      byType[n.type] = (byType[n.type] || 0) + amount;
    });

    return { byCurrency, byType };
  }, [plan]);

  return (
    <div className="panel">
      <h2>預算總覽</h2>
      <div className="stats-grid">
        {Object.entries(stats.byCurrency).map(([cur, val]) => (
          <div key={cur} className="stat-card">
            <div>{cur}</div>
            <strong>{val.toLocaleString()}</strong>
          </div>
        ))}
      </div>

      <h3>類型分布</h3>
      <ul>
        {Object.entries(stats.byType).map(([type, val]) => (
          <li key={type}>
            {NODE_TYPES[type] || type}: {val.toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
