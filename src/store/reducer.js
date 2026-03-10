import { ACTIONS } from './actions';
import { generateId } from '../utils/id';

const updatePlan = (state, planId, updater) => ({
  ...state,
  plans: state.plans.map((p) => (p.id === planId ? updater(p) : p)),
});

const updateDay = (state, planId, dayId, updater) =>
  updatePlan(state, planId, (plan) => ({
    ...plan,
    days: plan.days.map((d) => (d.id === dayId ? updater(d) : d)),
  }));

const updateNode = (state, planId, dayId, nodeId, updater) =>
  updateDay(state, planId, dayId, (day) => ({
    ...day,
    nodes: day.nodes.map((n) => (n.id === nodeId ? updater(n) : n)),
  }));

export function appReducer(state, action) {
  const { type, payload } = action;

  switch (type) {
    case ACTIONS.SET_DATA:
      return payload;

    case ACTIONS.ADD_PLAN:
      return {
        ...state,
        plans: [
          ...state.plans,
          {
            id: generateId(),
            name: payload.name || `方案 ${state.plans.length + 1}`,
            companions: [],
            days: [],
            checklists: [],
          },
        ],
      };

    case ACTIONS.DELETE_PLAN:
      return {
        ...state,
        plans: state.plans.filter((p) => p.id !== payload.planId),
      };

    case ACTIONS.RENAME_PLAN:
      return updatePlan(state, payload.planId, (p) => ({ ...p, name: payload.name }));

    case ACTIONS.ADD_DAY:
      return updatePlan(state, payload.planId, (plan) => ({
        ...plan,
        days: [
          ...plan.days,
          {
            id: generateId(),
            title: payload.title || `Day ${plan.days.length + 1}`,
            subtitle: '',
            journal: '',
            weather: { condition: '', tempHigh: '', tempLow: '' },
            nodes: [],
          },
        ],
      }));

    case ACTIONS.DELETE_DAY:
      return updatePlan(state, payload.planId, (plan) => ({
        ...plan,
        days: plan.days.filter((d) => d.id !== payload.dayId),
      }));

    case ACTIONS.UPDATE_DAY_FIELD:
      return updateDay(state, payload.planId, payload.dayId, (day) => ({
        ...day,
        [payload.field]: payload.value,
      }));

    case ACTIONS.ADD_NODE:
      return updateDay(state, payload.planId, payload.dayId, (day) => ({
        ...day,
        nodes: [
          ...day.nodes,
          {
            id: generateId(),
            title: payload.title || '新行程節點',
            type: 'activity',
            time: '',
            tags: '',
            cost: 0,
            currency: 'TWD',
            paymentStatus: 'cash',
            paidBy: '',
            splitAmong: [],
            subtasks: [],
            lat: '',
            lng: '',
          },
        ],
      }));

    case ACTIONS.DELETE_NODE:
      return updateDay(state, payload.planId, payload.dayId, (day) => ({
        ...day,
        nodes: day.nodes.filter((n) => n.id !== payload.nodeId),
      }));

    case ACTIONS.UPDATE_NODE_FIELD:
      return updateNode(state, payload.planId, payload.dayId, payload.nodeId, (node) => ({
        ...node,
        [payload.field]: payload.value,
      }));

    case ACTIONS.ADD_CHECKLIST_ITEM:
      return updatePlan(state, payload.planId, (plan) => {
        const checklists = [...plan.checklists];
        if (!checklists[payload.categoryIndex]) return plan;
        checklists[payload.categoryIndex] = {
          ...checklists[payload.categoryIndex],
          items: [
            ...checklists[payload.categoryIndex].items,
            { id: generateId(), text: payload.text || '新項目', isChecked: false },
          ],
        };
        return { ...plan, checklists };
      });

    case ACTIONS.TOGGLE_CHECKLIST_ITEM:
      return updatePlan(state, payload.planId, (plan) => {
        const checklists = [...plan.checklists];
        if (!checklists[payload.categoryIndex]) return plan;
        checklists[payload.categoryIndex] = {
          ...checklists[payload.categoryIndex],
          items: checklists[payload.categoryIndex].items.map((item) =>
            item.id === payload.itemId ? { ...item, isChecked: !item.isChecked } : item
          ),
        };
        return { ...plan, checklists };
      });

    case ACTIONS.DELETE_CHECKLIST_ITEM:
      return updatePlan(state, payload.planId, (plan) => {
        const checklists = [...plan.checklists];
        if (!checklists[payload.categoryIndex]) return plan;
        checklists[payload.categoryIndex] = {
          ...checklists[payload.categoryIndex],
          items: checklists[payload.categoryIndex].items.filter((item) => item.id !== payload.itemId),
        };
        return { ...plan, checklists };
      });

    case ACTIONS.ADD_COMPANION:
      return updatePlan(state, payload.planId, (plan) => ({
        ...plan,
        companions: [
          ...plan.companions,
          { id: generateId(), name: payload.name || '旅伴', color: payload.color || '#3b82f6' },
        ],
      }));

    case ACTIONS.DELETE_COMPANION:
      return updatePlan(state, payload.planId, (plan) => ({
        ...plan,
        companions: plan.companions.filter((c) => c.id !== payload.companionId),
      }));

    case ACTIONS.RENAME_COMPANION:
      return updatePlan(state, payload.planId, (plan) => ({
        ...plan,
        companions: plan.companions.map((c) =>
          c.id === payload.companionId ? { ...c, name: payload.name } : c
        ),
      }));

    case ACTIONS.UPDATE_NODE_SPLIT:
      return updateNode(state, payload.planId, payload.dayId, payload.nodeId, (node) => ({
        ...node,
        paidBy: payload.paidBy ?? node.paidBy,
        splitAmong: payload.splitAmong ?? node.splitAmong,
      }));

    default:
      return state;
  }
}
