import React from 'react';
import { ACTIONS } from '../store/actions';
import { CURRENCIES, NODE_TYPES } from '../store/initialData';

export default function TimelineView({ planId, day, dispatch }) {
  if (!day) {
    return <div className="panel">請先選擇天數。</div>;
  }

  return (
    <div className="panel">
      <div className="day-head">
        <input
          className="day-title-input"
          value={day.title}
          onChange={(e) =>
            dispatch({
              type: ACTIONS.UPDATE_DAY_FIELD,
              payload: { planId, dayId: day.id, field: 'title', value: e.target.value },
            })
          }
        />
        <input
          className="day-subtitle-input"
          placeholder="副標題"
          value={day.subtitle || ''}
          onChange={(e) =>
            dispatch({
              type: ACTIONS.UPDATE_DAY_FIELD,
              payload: { planId, dayId: day.id, field: 'subtitle', value: e.target.value },
            })
          }
        />
        <button
          onClick={() => dispatch({ type: ACTIONS.ADD_NODE, payload: { planId, dayId: day.id } })}
        >
          + 新節點
        </button>
      </div>

      <div className="node-list">
        {day.nodes.map((node) => (
          <div className="node-card" key={node.id}>
            <div className="node-row">
              <input
                value={node.time || ''}
                onChange={(e) =>
                  dispatch({
                    type: ACTIONS.UPDATE_NODE_FIELD,
                    payload: { planId, dayId: day.id, nodeId: node.id, field: 'time', value: e.target.value },
                  })
                }
                placeholder="時間"
              />
              <select
                value={node.type}
                onChange={(e) =>
                  dispatch({
                    type: ACTIONS.UPDATE_NODE_FIELD,
                    payload: { planId, dayId: day.id, nodeId: node.id, field: 'type', value: e.target.value },
                  })
                }
              >
                {Object.entries(NODE_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <button
                className="danger"
                onClick={() =>
                  dispatch({
                    type: ACTIONS.DELETE_NODE,
                    payload: { planId, dayId: day.id, nodeId: node.id },
                  })
                }
              >
                刪除
              </button>
            </div>

            <input
              value={node.title}
              onChange={(e) =>
                dispatch({
                  type: ACTIONS.UPDATE_NODE_FIELD,
                  payload: { planId, dayId: day.id, nodeId: node.id, field: 'title', value: e.target.value },
                })
              }
              placeholder="節點名稱"
            />

            <div className="node-row split-3">
              <input
                value={node.tags || ''}
                onChange={(e) =>
                  dispatch({
                    type: ACTIONS.UPDATE_NODE_FIELD,
                    payload: { planId, dayId: day.id, nodeId: node.id, field: 'tags', value: e.target.value },
                  })
                }
                placeholder="標籤"
              />
              <select
                value={node.currency || 'TWD'}
                onChange={(e) =>
                  dispatch({
                    type: ACTIONS.UPDATE_NODE_FIELD,
                    payload: { planId, dayId: day.id, nodeId: node.id, field: 'currency', value: e.target.value },
                  })
                }
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={node.cost || 0}
                onChange={(e) =>
                  dispatch({
                    type: ACTIONS.UPDATE_NODE_FIELD,
                    payload: {
                      planId,
                      dayId: day.id,
                      nodeId: node.id,
                      field: 'cost',
                      value: Number(e.target.value || 0),
                    },
                  })
                }
                placeholder="花費"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
