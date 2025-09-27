import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const FinanceContext = createContext();

// Default categories matching Money Manager app
const defaultCategories = {
  expense: [
    { id: 'food', name: 'Food & Dining', icon: '🍽️', color: '#ef4444' },
    { id: 'transport', name: 'Transportation', icon: '🚗', color: '#3b82f6' },
    { id: 'shopping', name: 'Shopping', icon: '🛒', color: '#8b5cf6' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#f59e0b' },
    { id: 'bills', name: 'Bills & Utilities', icon: '📄', color: '#10b981' },
    { id: 'healthcare', name: 'Healthcare', icon: '🏥', color: '#ec4899' },
    { id: 'education', name: 'Education', icon: '📚', color: '#6366f1' },
    { id: 'travel', name: 'Travel', icon: '✈️', color: '#14b8a6' },
    { id: 'personal', name: 'Personal Care', icon: '💄', color: '#f97316' },
    { id: 'other_expense', name: 'Other Expenses', icon: '📋', color: '#6b7280' }
  ],
  income: [
    { id: 'salary', name: 'Salary', icon: '💼', color: '#10b981' },
    { id: 'freelance', name: 'Freelance', icon: '💻', color: '#3b82f6' },
    { id: 'investment', name: 'Investment', icon: '📈', color: '#8b5cf6' },
    { id: 'business', name: 'Business', icon: '🏢', color: '#f59e0b' },
    { id: 'gift', name: 'Gift', icon: '🎁', color: '#ec4899' },
    { id: 'other_income', name: 'Other Income', icon: '💰', color: '#6b7280' }
  ]
};

const defaultBudgets = [
  { id: 'food', categoryId: 'food', amount: 500, period: 'monthly' },
  { id: 'transport', categoryId: 'transport', amount: 200, period: 'monthly' },
  { id: 'entertainment', categoryId: 'entertainment', amount: 150, period: 'monthly' },
  { id: 'shopping', categoryId: 'shopping', amount: 300, period: 'monthly' }
];

// Initial state
const initialState = {
  transactions: [],
  categories: defaultCategories,
  budgets: defaultBudgets,
  currency: '$',
  settings: {
    theme: 'light',
    notifications: true,
    currency: 'USD',
    budgetAlerts: true
  },
  loading: false,
  error: null
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  DELETE_TRANSACTION: 'DELETE_TRANSACTION',
  ADD_CATEGORY: 'ADD_CATEGORY',
  UPDATE_CATEGORY: 'UPDATE_CATEGORY',
  DELETE_CATEGORY: 'DELETE_CATEGORY',
  SET_BUDGET: 'SET_BUDGET',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  IMPORT_DATA: 'IMPORT_DATA',
  RESET_DATA: 'RESET_DATA'
};

// Reducer function
const financeReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    
    case actionTypes.ADD_TRANSACTION:
      return {
        ...state,
        transactions: [action.payload, ...state.transactions]
      };
    
    case actionTypes.UPDATE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction.id === action.payload.id ? action.payload : transaction
        )
      };
    
    case actionTypes.DELETE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.filter(transaction => transaction.id !== action.payload)
      };
    
    case actionTypes.ADD_CATEGORY:
      const { type, category } = action.payload;
      return {
        ...state,
        categories: {
          ...state.categories,
          [type]: [...state.categories[type], category]
        }
      };
    
    case actionTypes.UPDATE_CATEGORY:
      return {
        ...state,
        categories: {
          ...state.categories,
          [action.payload.type]: state.categories[action.payload.type].map(cat =>
            cat.id === action.payload.category.id ? action.payload.category : cat
          )
        }
      };
    
    case actionTypes.DELETE_CATEGORY:
      return {
        ...state,
        categories: {
          ...state.categories,
          [action.payload.type]: state.categories[action.payload.type].filter(cat => cat.id !== action.payload.categoryId)
        }
      };
    
    case actionTypes.SET_BUDGET:
      return {
        ...state,
        budgets: state.budgets.some(b => b.id === action.payload.id)
          ? state.budgets.map(budget => budget.id === action.payload.id ? action.payload : budget)
          : [...state.budgets, action.payload]
      };
    
    case actionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    
    case actionTypes.IMPORT_DATA:
      return {
        ...state,
        ...action.payload
      };
    
    case actionTypes.RESET_DATA:
      return initialState;
    
    default:
      return state;
  }
};

// Custom hooks for calculations
const useFinanceCalculations = (state) => {
  const getCurrentMonthTransactions = () => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    return state.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
    });
  };

  const getTotalIncome = (transactions = null) => {
    const txns = transactions || getCurrentMonthTransactions();
    return txns
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  };

  const getTotalExpenses = (transactions = null) => {
    const txns = transactions || getCurrentMonthTransactions();
    return txns
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  };

  const getBalance = (transactions = null) => {
    const txns = transactions || getCurrentMonthTransactions();
    return getTotalIncome(txns) - getTotalExpenses(txns);
  };

  const getCategorySpending = (categoryId, period = 'monthly') => {
    const now = new Date();
    let startDate, endDate;
    
    if (period === 'monthly') {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    } else {
      // Weekly or other periods can be added here
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    }
    
    return state.transactions
      .filter(t => 
        t.type === 'expense' && 
        t.categoryId === categoryId &&
        isWithinInterval(new Date(t.date), { start: startDate, end: endDate })
      )
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  };

  const getBudgetStatus = () => {
    return state.budgets.map(budget => {
      const spent = getCategorySpending(budget.categoryId, budget.period);
      const category = state.categories.expense.find(c => c.id === budget.categoryId);
      
      return {
        ...budget,
        spent,
        remaining: budget.amount - spent,
        percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
        isOverBudget: spent > budget.amount,
        category
      };
    });
  };

  const getExpensesByCategory = () => {
    const monthTransactions = getCurrentMonthTransactions().filter(t => t.type === 'expense');
    const categoryTotals = {};
    
    state.categories.expense.forEach(category => {
      const total = monthTransactions
        .filter(t => t.categoryId === category.id)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      if (total > 0) {
        categoryTotals[category.id] = {
          ...category,
          amount: total,
          percentage: 0 // Will be calculated after we have the total
        };
      }
    });
    
    const totalExpenses = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0);
    
    // Calculate percentages
    Object.keys(categoryTotals).forEach(key => {
      categoryTotals[key].percentage = totalExpenses > 0 
        ? (categoryTotals[key].amount / totalExpenses) * 100 
        : 0;
    });
    
    return Object.values(categoryTotals).sort((a, b) => b.amount - a.amount);
  };

  return {
    getCurrentMonthTransactions,
    getTotalIncome,
    getTotalExpenses,
    getBalance,
    getCategorySpending,
    getBudgetStatus,
    getExpensesByCategory
  };
};

// Provider component
export const FinanceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(financeReducer, initialState);
  const calculations = useFinanceCalculations(state);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('moneyManagerData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: actionTypes.IMPORT_DATA, payload: parsedData });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      transactions: state.transactions,
      categories: state.categories,
      budgets: state.budgets,
      settings: state.settings
    };
    localStorage.setItem('moneyManagerData', JSON.stringify(dataToSave));
  }, [state.transactions, state.categories, state.budgets, state.settings]);

  // Action creators
  const actions = {
    setLoading: (loading) => dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
    
    setError: (error) => dispatch({ type: actionTypes.SET_ERROR, payload: error }),
    
    addTransaction: (transaction) => {
      const newTransaction = {
        ...transaction,
        id: Date.now().toString(),
        date: transaction.date || new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      dispatch({ type: actionTypes.ADD_TRANSACTION, payload: newTransaction });
      return newTransaction;
    },
    
    updateTransaction: (transaction) => {
      dispatch({ type: actionTypes.UPDATE_TRANSACTION, payload: transaction });
    },
    
    deleteTransaction: (id) => {
      dispatch({ type: actionTypes.DELETE_TRANSACTION, payload: id });
    },
    
    addCategory: (type, category) => {
      const newCategory = {
        ...category,
        id: category.id || Date.now().toString()
      };
      dispatch({ 
        type: actionTypes.ADD_CATEGORY, 
        payload: { type, category: newCategory }
      });
      return newCategory;
    },
    
    updateCategory: (type, category) => {
      dispatch({ 
        type: actionTypes.UPDATE_CATEGORY, 
        payload: { type, category }
      });
    },
    
    deleteCategory: (type, categoryId) => {
      dispatch({ 
        type: actionTypes.DELETE_CATEGORY, 
        payload: { type, categoryId }
      });
    },
    
    setBudget: (budget) => {
      const newBudget = {
        ...budget,
        id: budget.id || `${budget.categoryId}_${budget.period}`
      };
      dispatch({ type: actionTypes.SET_BUDGET, payload: newBudget });
      return newBudget;
    },
    
    updateSettings: (settings) => {
      dispatch({ type: actionTypes.UPDATE_SETTINGS, payload: settings });
    },
    
    exportData: () => {
      const dataToExport = {
        transactions: state.transactions,
        categories: state.categories,
        budgets: state.budgets,
        settings: state.settings,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      return dataToExport;
    },
    
    importData: (data) => {
      dispatch({ type: actionTypes.IMPORT_DATA, payload: data });
    },
    
    resetData: () => {
      if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
        dispatch({ type: actionTypes.RESET_DATA });
        localStorage.removeItem('moneyManagerData');
      }
    }
  };

  const value = {
    ...state,
    ...calculations,
    ...actions
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

// Custom hook to use the finance context
export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

export default FinanceContext;