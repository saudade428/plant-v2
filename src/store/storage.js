const STORAGE_KEY = 'travelPlanDataV2';

export function ensureChecklistFinancialEssentials(rawData, createId = () => `gen-${Math.random().toString(36).slice(2, 10)}`) {
  if (!rawData?.plans || !Array.isArray(rawData.plans)) return rawData;

  const paymentMatcher = /(支付方式|支付工具|電子支付|行動支付|apple pay|google pay|line pay)/i;
  const cashMatcher = /(自備現鈔|現鈔|小額零錢|備用現金)/i;

  return {
    ...rawData,
    plans: rawData.plans.map((plan) => {
      const checklists = Array.isArray(plan.checklists) ? [...plan.checklists] : [];
      const financialIndex = checklists.findIndex((cat) => cat?.category === '文件與財務');

      const paymentItem = {
        id: createId(),
        text: '支付方式 / 工具確認（刷卡、電子支付）',
        isChecked: false,
      };

      const cashItem = {
        id: createId(),
        text: '自備現鈔（含小額零錢）',
        isChecked: false,
      };

      if (financialIndex === -1) {
        checklists.unshift({
          id: createId(),
          category: '文件與財務',
          items: [paymentItem, cashItem],
        });
      } else {
        const category = checklists[financialIndex] || {};
        const items = Array.isArray(category.items) ? [...category.items] : [];

        if (!items.some((item) => paymentMatcher.test(String(item?.text || '')))) {
          items.push(paymentItem);
        }
        if (!items.some((item) => cashMatcher.test(String(item?.text || '')))) {
          items.push(cashItem);
        }

        checklists[financialIndex] = { ...category, items };
      }

      return { ...plan, checklists };
    }),
  };
}

export function loadData(fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return ensureChecklistFinancialEssentials(raw ? JSON.parse(raw) : fallback);
  } catch {
    return ensureChecklistFinancialEssentials(fallback);
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore quota or private mode errors.
  }
}
