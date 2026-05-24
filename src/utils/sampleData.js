import { v4 as uuidv4 } from 'uuid';

const CATEGORIES = [
  'Food', 'Travel', 'Shopping', 'Health', 'Education',
  'Bills', 'Entertainment', 'Salary', 'Freelance', 'Business', 'Others'
];

const PAYMENT_METHODS = ['cash', 'card', 'upi'];

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business'];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const now = new Date();
const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

export const sampleTransactions = [
  {
    id: uuidv4(), type: 'income', amount: 75000, category: 'Salary',
    paymentMethod: 'card', note: 'Monthly salary - May', date: new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  },
  {
    id: uuidv4(), type: 'income', amount: 75000, category: 'Salary',
    paymentMethod: 'card', note: 'Monthly salary - April', date: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  },
  {
    id: uuidv4(), type: 'income', amount: 75000, category: 'Salary',
    paymentMethod: 'card', note: 'Monthly salary - March', date: new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString()
  },
  {
    id: uuidv4(), type: 'income', amount: 15000, category: 'Freelance',
    paymentMethod: 'upi', note: 'Website design project', date: new Date(now.getFullYear(), now.getMonth(), 5).toISOString()
  },
  {
    id: uuidv4(), type: 'income', amount: 8000, category: 'Freelance',
    paymentMethod: 'upi', note: 'Logo design - client', date: new Date(now.getFullYear(), now.getMonth() - 1, 12).toISOString()
  },
  {
    id: uuidv4(), type: 'income', amount: 20000, category: 'Business',
    paymentMethod: 'card', note: 'Product sales revenue', date: new Date(now.getFullYear(), now.getMonth() - 2, 15).toISOString()
  },
  {
    id: uuidv4(), type: 'expense', amount: 4500, category: 'Food',
    paymentMethod: 'upi', note: 'Grocery shopping - Big Bazaar', date: new Date(now.getFullYear(), now.getMonth(), 3).toISOString()
  },
  {
    id: uuidv4(), type: 'expense', amount: 1200, category: 'Food',
    paymentMethod: 'cash', note: 'Dinner at restaurant', date: new Date(now.getFullYear(), now.getMonth(), 7).toISOString()
  },
  {
    id: uuidv4(), type: 'expense', amount: 3200, category: 'Food',
    paymentMethod: 'card', note: 'Weekly groceries', date: new Date(now.getFullYear(), now.getMonth() - 1, 8).toISOString()
  },
  {
    id: uuidv4(), type: 'expense', amount: 8500, category: 'Travel',
    paymentMethod: 'card', note: 'Flight tickets - Mumbai to Delhi', date: new Date(now.getFullYear(), now.getMonth(), 10).toISOString()
  },
  {
    id: uuidv4(), type: 'expense', amount: 2200, category: 'Travel',
    paymentMethod: 'upi', note: 'Cab rides this week', date: new Date(now.getFullYear(), now.getMonth() - 1, 20).toISOString()
  },
  {
    id: uuidv4(), type: 'expense', amount: 12000, category: 'Shopping',
    paymentMethod: 'card', note: 'New shoes and clothes', date: new Date(now.getFullYear(), now.getMonth(), 6).toISOString()
  },
  {
    id: uuidv4(), type: 'expense', amount: 3500, category: 'Shopping',
    paymentMethod: 'upi', note: 'Amazon - Electronics accessories', date: new Date(now.getFullYear(), now.getMonth() - 1, 14).toISOString()
  },
  {
    id: uuidv4(), type: 'expense', amount: 6000, category: 'Health',
    paymentMethod: 'card', note: 'Annual health checkup', date: new Date(now.getFullYear(), now.getMonth() - 2, 5).toISOString()
  },
  {
    id: uuidv4(), type: 'expense', amount: 1500, category: 'Health',
    paymentMethod: 'cash', note: 'Medicine and pharmacy', date: new Date(now.getFullYear(), now.getMonth(), 9).toISOString()
  },
  {
    id: uuidv4(), type: 'expense', amount: 5000, category: 'Education',
    paymentMethod: 'upi', note: 'Online course - React Advanced', date: new Date(now.getFullYear(), now.getMonth() - 1, 3).toISOString()
  },
  {
    id: uuidv4(), type: 'expense', amount: 2800, category: 'Education',
    paymentMethod: 'card', note: 'Books and study materials', date: new Date(now.getFullYear(), now.getMonth() - 2, 18).toISOString()
  },
  {
    id: uuidv4(), type: 'expense', amount: 15000, category: 'Bills',
    paymentMethod: 'upi', note: 'Monthly rent', date: new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  },
  {
    id: uuidv4(), type: 'expense', amount: 1800, category: 'Bills',
    paymentMethod: 'upi', note: 'Electricity bill', date: new Date(now.getFullYear(), now.getMonth() - 1, 5).toISOString()
  },
  {
    id: uuidv4(), type: 'expense', amount: 999, category: 'Entertainment',
    paymentMethod: 'card', note: 'Netflix + Spotify subscriptions', date: new Date(now.getFullYear(), now.getMonth(), 2).toISOString()
  },
  {
    id: uuidv4(), type: 'expense', amount: 1800, category: 'Entertainment',
    paymentMethod: 'cash', note: 'Movie tickets with friends', date: new Date(now.getFullYear(), now.getMonth() - 1, 22).toISOString()
  },
  {
    id: uuidv4(), type: 'expense', amount: 500, category: 'Others',
    paymentMethod: 'cash', note: 'Miscellaneous expenses', date: new Date(now.getFullYear(), now.getMonth() - 2, 25).toISOString()
  },
  {
    id: uuidv4(), type: 'expense', amount: 15000, category: 'Bills',
    paymentMethod: 'upi', note: 'Monthly rent - April', date: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  },
  {
    id: uuidv4(), type: 'expense', amount: 15000, category: 'Bills',
    paymentMethod: 'upi', note: 'Monthly rent - March', date: new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString()
  },
  {
    id: uuidv4(), type: 'expense', amount: 3800, category: 'Food',
    paymentMethod: 'upi', note: 'Food delivery orders', date: new Date(now.getFullYear(), now.getMonth() - 2, 12).toISOString()
  },
];

export const sampleBudgets = [
  { id: uuidv4(), category: 'Food', limit: 8000, spent: 0, month: new Date().toISOString().slice(0, 7) },
  { id: uuidv4(), category: 'Travel', limit: 5000, spent: 0, month: new Date().toISOString().slice(0, 7) },
  { id: uuidv4(), category: 'Shopping', limit: 10000, spent: 0, month: new Date().toISOString().slice(0, 7) },
  { id: uuidv4(), category: 'Entertainment', limit: 3000, spent: 0, month: new Date().toISOString().slice(0, 7) },
  { id: uuidv4(), category: 'Bills', limit: 18000, spent: 0, month: new Date().toISOString().slice(0, 7) },
  { id: uuidv4(), category: 'Health', limit: 4000, spent: 0, month: new Date().toISOString().slice(0, 7) },
];

export const CATEGORIES_LIST = CATEGORIES;

export const CATEGORY_COLORS = {
  Food: '#f59e0b',
  Travel: '#3b82f6',
  Shopping: '#ec4899',
  Health: '#ef4444',
  Education: '#8b5cf6',
  Bills: '#f97316',
  Entertainment: '#06b6d4',
  Salary: '#10b981',
  Freelance: '#84cc16',
  Business: '#14b8a6',
  Others: '#6b7280',
};
