import React from 'react';

const STATIC_VIEWS = [
  { id: 'checklist', label: '清單' },
  { id: 'budget', label: '預算' },
  { id: 'split', label: '分帳' },
];

export default function DayTabs({ days, activeDayId, onSwitch, onAddDay }) {
  return (
    <div className="tabs-row day-tabs">
      {STATIC_VIEWS.map((view) => (
        <button
          key={view.id}
          className={activeDayId === view.id ? 'tab active' : 'tab'}
          onClick={() => onSwitch(view.id)}
        >
          {view.label}
        </button>
      ))}
      {days.map((day) => (
        <button
          key={day.id}
          className={activeDayId === day.id ? 'tab active' : 'tab'}
          onClick={() => onSwitch(day.id)}
        >
          {day.title}
        </button>
      ))}
      <button className="tab add" onClick={onAddDay}>+ 新增一天</button>
    </div>
  );
}
