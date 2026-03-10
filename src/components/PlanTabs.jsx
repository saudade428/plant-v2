import React from 'react';

export default function PlanTabs({ plans, activePlanId, onSwitch, onRename, onAdd }) {
  return (
    <div className="tabs-row">
      {plans.map((plan) => (
        <button
          key={plan.id}
          className={activePlanId === plan.id ? 'tab active' : 'tab'}
          onClick={() => onSwitch(plan.id)}
        >
          <input
            value={plan.name}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onRename(plan.id, e.target.value)}
          />
        </button>
      ))}
      <button className="tab add" onClick={onAdd}>+ 新方案</button>
    </div>
  );
}
