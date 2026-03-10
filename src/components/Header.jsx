import React from 'react';

export default function Header({ onExport, onImport }) {
  return (
    <header className="header">
      <div>
        <h1>Travel Planner V2</h1>
        <p>從舊版邏輯重建的新架構</p>
      </div>
      <div className="header-actions">
        <button onClick={onExport}>匯出 JSON</button>
        <label className="import-btn">
          匯入 JSON
          <input type="file" accept=".json" onChange={onImport} />
        </label>
      </div>
    </header>
  );
}
