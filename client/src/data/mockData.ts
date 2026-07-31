export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  daysLeft: number;
  icon: string;
}

export interface Recipe {
  id: string;
  name: string;
  match: number;
  time: string;
  costLabel: string;
  extraCost: string;
  buyMore: string;
  reason: string;
  ingredients: string[];
  icon: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  amount: number;
  icon: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  icon: string;
}

export interface BudgetData {
  monthLabel: string;
  budgetLimit: number;
  spent: number;
  daysLeft: number;
  suggestions: {
    id: string;
    name: string;
    costLabel: string;
  }[];
  categories: BudgetCategory[];
  expenses: Expense[];
}

export interface IngredientCategoryGroup {
  id: string;
  name: string;
  tags: string[];
}

export const ingredients: Ingredient[] = [
  {
    id: 'egg',
    name: 'Trứng gà',
    amount: '5 quả',
    daysLeft: 6,
    icon: '🥚',
  },
  {
    id: 'water-spinach',
    name: 'Rau muống',
    amount: '1 bó',
    daysLeft: 1,
    icon: '🥬',
  },
  {
    id: 'pork',
    name: 'Thịt heo',
    amount: '300g',
    daysLeft: 2,
    icon: '🥩',
  },
  {
    id: 'tomato',
    name: 'Cà chua',
    amount: '3 quả',
    daysLeft: 4,
    icon: '🍅',
  },
  {
    id: 'carrot',
    name: 'Cà rốt',
    amount: '2 củ',
    daysLeft: 2,
    icon: '🥕',
  },
];

export const ingredientTags: string[] = [
  'Trứng gà',
  'Rau muống',
  'Thịt heo',
  'Cà chua',
  'Cà rốt',
  'Hành lá',
];

export const recipes: Recipe[] = [
  {
    id: 'thit-xao-rau-muong',
    name: 'Thịt xào rau muống',
    match: 92,
    time: '20 phút',
    costLabel: '0đ mua thêm',
    extraCost: '0đ',
    buyMore: 'Không',
    reason: 'Dùng rau sắp hết hạn',
    ingredients: ['Rau muống', 'Thịt heo'],
    icon: '🥬',
  },
  {
    id: 'rau-muong-xao-toi',
    name: 'Rau muống xào tỏi',
    match: 86,
    time: '12 phút',
    costLabel: 'Cần mua tỏi',
    extraCost: '5.000đ',
    buyMore: 'Tỏi',
    reason: 'Nhanh, dễ nấu sau giờ học',
    ingredients: ['Rau muống'],
    icon: '🧄',
  },
  {
    id: 'canh-rau-thit-bam',
    name: 'Canh rau thịt băm',
    match: 78,
    time: '25 phút',
    costLabel: 'Cần mua hành',
    extraCost: '4.000đ',
    buyMore: 'Hành',
    reason: 'Có rau và thịt, hợp bữa tối',
    ingredients: ['Rau muống', 'Thịt heo'],
    icon: '🍲',
  },
  {
    id: 'com-rang-thit-rau',
    name: 'Cơm rang thịt rau',
    match: 70,
    time: '18 phút',
    costLabel: 'Tận dụng đồ còn lại',
    extraCost: '0đ',
    buyMore: 'Không',
    reason: 'Tận dụng đồ còn lại',
    ingredients: ['Thịt heo', 'Rau muống'],
    icon: '🍚',
  },
  {
    id: 'trung-chien-ca-chua',
    name: 'Trứng chiên cà chua',
    match: 88,
    time: '15 phút',
    costLabel: '0đ mua thêm',
    extraCost: '0đ',
    buyMore: 'Không',
    reason: 'Món nhanh, dùng tốt trứng và cà chua đang có',
    ingredients: ['Trứng gà', 'Cà chua'],
    icon: '🍳',
  },
  {
    id: 'thit-heo-xao-ca-rot',
    name: 'Thịt heo xào cà rốt',
    match: 84,
    time: '18 phút',
    costLabel: '0đ mua thêm',
    extraCost: '0đ',
    buyMore: 'Không',
    reason: 'Tận dụng cà rốt gần hạn, món xào dễ ăn',
    ingredients: ['Thịt heo', 'Cà rốt'],
    icon: '🥕',
  },
  {
    id: 'canh-trung-ca-chua',
    name: 'Canh trứng cà chua',
    match: 81,
    time: '14 phút',
    costLabel: '0đ mua thêm',
    extraCost: '0đ',
    buyMore: 'Không',
    reason: 'Nhẹ bụng, hợp bữa tối và tiết kiệm thời gian',
    ingredients: ['Trứng gà', 'Cà chua'],
    icon: '🥣',
  },
  {
    id: 'thit-heo-kho-trung',
    name: 'Thịt heo kho trứng',
    match: 76,
    time: '35 phút',
    costLabel: '0đ mua thêm',
    extraCost: '0đ',
    buyMore: 'Không',
    reason: 'Đậm vị, đủ đạm cho cả nhà',
    ingredients: ['Thịt heo', 'Trứng gà'],
    icon: '🍖',
  },
];

export const budgetData: BudgetData = {
  monthLabel: 'Tháng 7/2026',
  budgetLimit: 1500000,
  spent: 820000,
  daysLeft: 12,
  suggestions: [
    {
      id: 'suggest-thit-xao-rau-muong',
      name: 'Thịt xào rau muống',
      costLabel: '0đ mua thêm',
    },
    {
      id: 'suggest-trung-ca-chua',
      name: 'Trứng cà chua',
      costLabel: '10.000đ mua thêm',
    },
  ],
  categories: [
    {
      id: 'ingredients',
      name: 'Nguyên liệu',
      amount: 520000,
      icon: '▣',
    },
    {
      id: 'delivery',
      name: 'Đặt đồ ăn',
      amount: 220000,
      icon: '▤',
    },
    {
      id: 'eating-out',
      name: 'Ăn ngoài',
      amount: 80000,
      icon: '○',
    },
    {
      id: 'spices',
      name: 'Gia vị',
      amount: 40000,
      icon: '✦',
    },
  ],
  expenses: [
    {
      id: 'expense-pork',
      name: 'Mua thịt heo',
      amount: 36000,
      category: 'Nguyên liệu',
      icon: '▣',
    },
    {
      id: 'expense-eggs',
      name: 'Trứng gà',
      amount: 35000,
      category: 'Nguyên liệu',
      icon: '▣',
    },
    {
      id: 'expense-lunch',
      name: 'Đặt cơm trưa',
      amount: 55000,
      category: 'Đặt đồ ăn',
      icon: '▤',
    },
    {
      id: 'expense-scallion',
      name: 'Hành lá, tỏi',
      amount: 12000,
      category: 'Gia vị',
      icon: '✦',
    },
  ],
};

export const ingredientCategoryGroups: IngredientCategoryGroup[] = [
  {
    id: 'meat',
    name: 'Thịt',
    tags: ['Thịt gà', 'Thịt lợn', 'Thịt bò', 'Sườn', 'Thịt xay', 'Xúc xích'],
  },
  {
    id: 'vegetables',
    name: 'Rau củ',
    tags: ['Rau muống', 'Rau cải', 'Cà chua', 'Cà rốt', 'Khoai tây', 'Hành lá'],
  },
  {
    id: 'eggs',
    name: 'Trứng',
    tags: ['Trứng gà', 'Trứng vịt'],
  },
  {
    id: 'seafood',
    name: 'Cá / Hải sản',
    tags: ['Cá', 'Tôm', 'Mực', 'Nghêu'],
  },
  {
    id: 'spices',
    name: 'Gia vị',
    tags: ['Muối', 'Đường', 'Nước mắm', 'Dầu ăn', 'Hạt nêm'],
  },
  {
    id: 'dry',
    name: 'Đồ khô',
    tags: ['Gạo', 'Mì gói', 'Miến', 'Đậu xanh', 'Nấm khô'],
  },
  {
    id: 'fruits',
    name: 'Trái cây',
    tags: ['Chuối', 'Táo', 'Cam', 'Xoài', 'Dưa hấu'],
  },
  {
    id: 'other',
    name: 'Khác',
    tags: ['Sữa', 'Phô mai', 'Bơ', 'Sữa chua'],
  },
];

export const ingredientUnits: string[] = [
  'gram',
  'kg',
  'quả',
  'bó',
  'hộp',
  'gói',
  'chai',
  'ml',
  'lít',
];

export const storageOptions: string[] = ['Ngăn mát', 'Ngăn đá', 'Bên ngoài'];
