import { describe, expect, it } from 'vitest';
import { appReducer } from './reducer';
import { ACTIONS } from './actions';
import { initialData } from './initialData';

const cloneState = () => structuredClone(initialData);

describe('appReducer smoke tests', () => {
  it('adds a new day to the active plan', () => {
    const state = cloneState();
    const planId = state.plans[0].id;

    const next = appReducer(state, {
      type: ACTIONS.ADD_DAY,
      payload: { planId },
    });

    expect(next.plans[0].days).toHaveLength(state.plans[0].days.length + 1);
    expect(next.plans[0].days.at(-1).title).toBe(`Day ${state.plans[0].days.length + 1}`);
  });

  it('moves a node from one day to another', () => {
    const state = cloneState();
    const planId = state.plans[0].id;
    state.plans[0].days.push({
      id: 'day-2',
      title: '第二天',
      subtitle: '',
      journal: '',
      weather: { condition: '', tempHigh: '', tempLow: '' },
      nodes: [],
    });

    const nodeId = state.plans[0].days[0].nodes[0].id;

    const next = appReducer(state, {
      type: ACTIONS.MOVE_NODE_TO_DAY,
      payload: {
        planId,
        nodeId,
        sourceDayId: 'day-1',
        targetDayId: 'day-2',
      },
    });

    expect(next.plans[0].days[0].nodes.some((node) => node.id === nodeId)).toBe(false);
    expect(next.plans[0].days[1].nodes.some((node) => node.id === nodeId)).toBe(true);
  });

  it('adds checklist category', () => {
    const state = cloneState();
    const planId = state.plans[0].id;

    const next = appReducer(state, {
      type: ACTIONS.ADD_CHECKLIST_CATEGORY,
      payload: { planId, category: '行李整理' },
    });

    expect(next.plans[0].checklists).toHaveLength(state.plans[0].checklists.length + 1);
    expect(next.plans[0].checklists.at(-1).category).toBe('行李整理');
  });

  it('adds node expense item with normalized amount', () => {
    const state = cloneState();
    const planId = state.plans[0].id;
    const dayId = state.plans[0].days[0].id;
    const nodeId = state.plans[0].days[0].nodes[0].id;

    const next = appReducer(state, {
      type: ACTIONS.ADD_NODE_EXPENSE_ITEM,
      payload: {
        planId,
        dayId,
        nodeId,
        currency: 'JPY',
        amount: '2500',
        category: 'transport',
        note: '機場巴士',
      },
    });

    const expenseItems = next.plans[0].days[0].nodes[0].expenseItems;
    expect(expenseItems).toHaveLength(1);
    expect(expenseItems[0].amount).toBe(2500);
    expect(expenseItems[0].currency).toBe('JPY');
  });
});