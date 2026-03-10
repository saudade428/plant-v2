import React from 'react';
import { ACTIONS } from '../store/actions';

export default function ChecklistView({ plan, dispatch }) {
  return (
    <div className="panel">
      <h2>行前清單</h2>
      {plan.checklists.map((cat, idx) => (
        <div className="checklist-cat" key={cat.id}>
          <h3>{cat.category}</h3>
          {cat.items.map((item) => (
            <div className="check-item" key={item.id}>
              <label>
                <input
                  type="checkbox"
                  checked={item.isChecked}
                  onChange={() =>
                    dispatch({
                      type: ACTIONS.TOGGLE_CHECKLIST_ITEM,
                      payload: { planId: plan.id, categoryIndex: idx, itemId: item.id },
                    })
                  }
                />
                {item.text}
              </label>
              <button
                className="danger"
                onClick={() =>
                  dispatch({
                    type: ACTIONS.DELETE_CHECKLIST_ITEM,
                    payload: { planId: plan.id, categoryIndex: idx, itemId: item.id },
                  })
                }
              >
                刪除
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              dispatch({
                type: ACTIONS.ADD_CHECKLIST_ITEM,
                payload: { planId: plan.id, categoryIndex: idx, text: '新項目' },
              })
            }
          >
            + 新項目
          </button>
        </div>
      ))}
    </div>
  );
}
