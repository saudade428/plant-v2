import React, { useEffect, useMemo, useReducer, useState } from 'react';
import Header from './components/Header';
import PlanTabs from './components/PlanTabs';
import DayTabs from './components/DayTabs';
import TimelineView from './components/TimelineView';
import ChecklistView from './components/ChecklistView';
import BudgetView from './components/BudgetView';
import SplitView from './components/SplitView';
import { ACTIONS } from './store/actions';
import { initialData } from './store/initialData';
import { appReducer } from './store/reducer';
import { loadData, saveData } from './store/storage';
import { downloadJson, parseJsonFile } from './utils/exportImport';

export default function App() {
  const [data, dispatch] = useReducer(appReducer, initialData, (seed) => loadData(seed));
  const [activePlanId, setActivePlanId] = useState(data.plans[0]?.id || null);
  const [activeDayId, setActiveDayId] = useState('checklist');

  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    if (!activePlanId && data.plans.length) setActivePlanId(data.plans[0].id);
    if (activePlanId && !data.plans.find((p) => p.id === activePlanId)) {
      setActivePlanId(data.plans[0]?.id || null);
      setActiveDayId('checklist');
    }
  }, [activePlanId, data.plans]);

  const activePlan = useMemo(
    () => data.plans.find((p) => p.id === activePlanId) || null,
    [data.plans, activePlanId]
  );

  const activeDay = useMemo(() => {
    if (!activePlan) return null;
    return activePlan.days.find((d) => d.id === activeDayId) || null;
  }, [activePlan, activeDayId]);

  const handleExport = () => {
    downloadJson(data);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseJsonFile(file);
      if (!parsed?.plans?.length) {
        alert('JSON 結構不正確');
        return;
      }
      dispatch({ type: ACTIONS.SET_DATA, payload: parsed });
      setActivePlanId(parsed.plans[0].id);
      setActiveDayId('checklist');
    } catch {
      alert('匯入失敗，請確認 JSON 格式');
    } finally {
      e.target.value = '';
    }
  };

  if (!activePlan) {
    return <div className="app-shell">沒有可用方案，請新增方案。</div>;
  }

  return (
    <div className="app-shell">
      <Header onExport={handleExport} onImport={handleImport} />

      <PlanTabs
        plans={data.plans}
        activePlanId={activePlanId}
        onSwitch={(id) => {
          setActivePlanId(id);
          setActiveDayId('checklist');
        }}
        onRename={(planId, name) => dispatch({ type: ACTIONS.RENAME_PLAN, payload: { planId, name } })}
        onAdd={() => dispatch({ type: ACTIONS.ADD_PLAN, payload: {} })}
      />

      <DayTabs
        days={activePlan.days}
        activeDayId={activeDayId}
        onSwitch={setActiveDayId}
        onAddDay={() => dispatch({ type: ACTIONS.ADD_DAY, payload: { planId: activePlan.id } })}
      />

      {activeDayId === 'checklist' && <ChecklistView plan={activePlan} dispatch={dispatch} />}
      {activeDayId === 'budget' && <BudgetView plan={activePlan} />}
      {activeDayId === 'split' && <SplitView plan={activePlan} dispatch={dispatch} />}
      {!['checklist', 'budget', 'split'].includes(activeDayId) && (
        <TimelineView planId={activePlan.id} day={activeDay} dispatch={dispatch} />
      )}
    </div>
  );
}
