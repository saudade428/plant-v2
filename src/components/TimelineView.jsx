import React from 'react';
import { ACTIONS } from '../store/actions';
import { CURRENCIES, NODE_TYPES } from '../store/initialData';

export default function TimelineView({ planId, day, dispatch }) {
  if (!day) {
    return <div className="panel">請先選擇天數。</div>;
  }

  const openDayRoute = () => {
    const points = day.nodes
      .filter((node) => node.lat && node.lng)
      .map((node) => `${node.lat},${node.lng}`);

    if (!points.length) {
      alert('此天尚未設定任何座標');
      return;
    }

    window.open(`https://www.google.com/maps/dir/${points.join('/')}`, '_blank', 'noopener,noreferrer');
  };

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
        <button onClick={openDayRoute}>開啟當日導航</button>
      </div>

      <div className="node-row split-3">
        <input
          placeholder="天氣條件 (sunny/rainy...)"
          value={day.weather?.condition || ''}
          onChange={(e) =>
            dispatch({
              type: ACTIONS.UPDATE_DAY_FIELD,
              payload: {
                planId,
                dayId: day.id,
                field: 'weather',
                value: { ...(day.weather || {}), condition: e.target.value },
              },
            })
          }
        />
        <input
          placeholder="最高溫"
          value={day.weather?.tempHigh || ''}
          onChange={(e) =>
            dispatch({
              type: ACTIONS.UPDATE_DAY_FIELD,
              payload: {
                planId,
                dayId: day.id,
                field: 'weather',
                value: { ...(day.weather || {}), tempHigh: e.target.value },
              },
            })
          }
        />
        <input
          placeholder="最低溫"
          value={day.weather?.tempLow || ''}
          onChange={(e) =>
            dispatch({
              type: ACTIONS.UPDATE_DAY_FIELD,
              payload: {
                planId,
                dayId: day.id,
                field: 'weather',
                value: { ...(day.weather || {}), tempLow: e.target.value },
              },
            })
          }
        />
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

            <div className="node-row split-2">
              <input
                value={node.lat || ''}
                onChange={(e) =>
                  dispatch({
                    type: ACTIONS.UPDATE_NODE_FIELD,
                    payload: { planId, dayId: day.id, nodeId: node.id, field: 'lat', value: e.target.value },
                  })
                }
                placeholder="緯度 lat"
              />
              <input
                value={node.lng || ''}
                onChange={(e) =>
                  dispatch({
                    type: ACTIONS.UPDATE_NODE_FIELD,
                    payload: { planId, dayId: day.id, nodeId: node.id, field: 'lng', value: e.target.value },
                  })
                }
                placeholder="經度 lng"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="journal-wrap">
        <h3>旅行日誌</h3>
        <textarea
          value={day.journal || ''}
          onChange={(e) =>
            dispatch({
              type: ACTIONS.UPDATE_DAY_FIELD,
              payload: { planId, dayId: day.id, field: 'journal', value: e.target.value },
            })
          }
          placeholder="記錄今天的重點與心得"
        />
      </div>
    </div>
  );
}
