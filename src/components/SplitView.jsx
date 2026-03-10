import React, { useMemo } from 'react';
import { ACTIONS } from '../store/actions';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export default function SplitView({ plan, dispatch }) {
  const allNodes = plan.days.flatMap((d) =>
    d.nodes
      .filter((n) => Number(n.cost || 0) > 0)
      .map((n) => ({ ...n, dayId: d.id }))
  );

  const summary = useMemo(() => {
    if (!plan.companions.length) return [];

    return plan.companions.map((c) => {
      const paid = allNodes
        .filter((n) => n.paidBy === c.id)
        .reduce((sum, n) => sum + Number(n.cost || 0), 0);

      const shouldPay = allNodes.reduce((sum, n) => {
        const splitAmong = n.splitAmong?.length ? n.splitAmong : plan.companions.map((x) => x.id);
        return splitAmong.includes(c.id) ? sum + Number(n.cost || 0) / splitAmong.length : sum;
      }, 0);

      return { ...c, paid, shouldPay, diff: paid - shouldPay };
    });
  }, [allNodes, plan.companions]);

  return (
    <div className="panel">
      <h2>分帳</h2>
      <div className="row">
        <button
          onClick={() =>
            dispatch({
              type: ACTIONS.ADD_COMPANION,
              payload: {
                planId: plan.id,
                name: `旅伴${plan.companions.length + 1}`,
                color: COLORS[plan.companions.length % COLORS.length],
              },
            })
          }
        >
          + 新增旅伴
        </button>
      </div>

      <div className="stats-grid">
        {summary.map((s) => (
          <div key={s.id} className="stat-card">
            <div className="row compact">
              <span className="dot" style={{ backgroundColor: s.color }} />
              <input
                value={s.name}
                onChange={(e) =>
                  dispatch({
                    type: ACTIONS.RENAME_COMPANION,
                    payload: { planId: plan.id, companionId: s.id, name: e.target.value },
                  })
                }
              />
              <button
                className="danger"
                onClick={() =>
                  dispatch({
                    type: ACTIONS.DELETE_COMPANION,
                    payload: { planId: plan.id, companionId: s.id },
                  })
                }
              >
                刪除
              </button>
            </div>
            <p>已付: {s.paid.toLocaleString()}</p>
            <p>應付: {s.shouldPay.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <strong>{s.diff >= 0 ? '應收' : '應付'}: {Math.abs(s.diff).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
          </div>
        ))}
      </div>

      <h3>花費明細</h3>
      {allNodes.map((n) => (
        <div key={n.id} className="node-card">
          <div className="node-row">
            <strong>{n.title}</strong>
            <span>
              {n.currency} {Number(n.cost || 0).toLocaleString()}
            </span>
          </div>
          <div className="node-row split-2">
            <select
              value={n.paidBy || ''}
              onChange={(e) =>
                dispatch({
                  type: ACTIONS.UPDATE_NODE_SPLIT,
                  payload: { planId: plan.id, dayId: n.dayId, nodeId: n.id, paidBy: e.target.value },
                })
              }
            >
              <option value="">未指定付款人</option>
              {plan.companions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={n.splitAmong?.length ? n.splitAmong.join(',') : 'ALL'}
              onChange={(e) => {
                const splitAmong = e.target.value === 'ALL' ? [] : e.target.value.split(',');
                dispatch({
                  type: ACTIONS.UPDATE_NODE_SPLIT,
                  payload: { planId: plan.id, dayId: n.dayId, nodeId: n.id, splitAmong },
                });
              }}
            >
              <option value="ALL">全部平均分攤</option>
              {plan.companions.map((c) => (
                <option key={c.id} value={c.id}>
                  只有 {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
