export const initialData = {
  plans: [
    {
      id: 'plan-a',
      name: '我的旅程 V2',
      companions: [],
      days: [
        {
          id: 'day-1',
          title: '第一天',
          subtitle: '全新版本開始',
          journal: '',
          weather: { condition: '', tempHigh: '', tempLow: '' },
          nodes: [
            {
              id: 'n1',
              title: '抵達機場',
              type: 'location',
              time: '10:00',
              tags: '第一站',
              cost: 0,
              currency: 'TWD',
              paymentStatus: 'cash',
              paidBy: '',
              splitAmong: [],
              subtasks: [],
            },
            {
              id: 'n2',
              title: '飯店 Check-in',
              type: 'hotel',
              time: '15:00',
              tags: '住宿',
              cost: 0,
              currency: 'TWD',
              paymentStatus: 'cash',
              paidBy: '',
              splitAmong: [],
              subtasks: [],
            },
          ],
        },
      ],
      checklists: [
        {
          id: 'cl-1',
          category: '文件與財務',
          items: [
            { id: 'cli-1', text: '護照 (確認效期)', isChecked: false },
            { id: 'cli-2', text: '現金與信用卡', isChecked: true },
          ],
        },
      ],
    },
  ],
};

export const NODE_TYPES = {
  activity: '活動',
  location: '地點',
  restaurant: '餐廳',
  hotel: '住宿',
  transit: '交通',
};

export const CURRENCIES = ['TWD', 'JPY', 'USD', 'EUR', 'KRW'];
