import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  AlertTriangle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useFinance } from '../../contexts/FinanceContext';
import { format, subDays } from 'date-fns';

const Dashboard = () => {
  const { 
    transactions, 
    getTotalIncome, 
    getTotalExpenses, 
    getBalance,
    getExpensesByCategory,
    getBudgetStatus,
    currency,
    getCurrentMonthTransactions
  } = useFinance();

  const monthTransactions = getCurrentMonthTransactions();
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const balance = getBalance();
  const expensesByCategory = getExpensesByCategory();
  const budgetStatus = getBudgetStatus();
  const recentTransactions = transactions.slice(0, 5);

  // Get last 7 days data for spending trend
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    const dayTransactions = transactions.filter(t => 
      format(new Date(t.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && 
      t.type === 'expense'
    );
    const total = dayTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    return {
      date: format(date, 'MMM dd'),
      amount: total,
      day: format(date, 'EEE')
    };
  }).reverse();

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTransactionIcon = (type) => {
    return type === 'income' ? (
      <ArrowUpRight className="w-4 h-4 text-green-600" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-600" />
    );
  };

  const getCategoryColor = (categoryId) => {
    const colors = [
      '#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981',
      '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#6b7280'
    ];
    const index = categoryId ? categoryId.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <h1 className="page-title">Dashboard</h1>
        <Link to="/add-transaction" className="btn btn-primary">
          <Plus size={20} />
          Add Transaction
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card income-card">
          <div className="summary-icon">
            <TrendingUp size={24} />
          </div>
          <div className="summary-content">
            <h3>Total Income</h3>
            <p className="summary-amount text-green">{formatAmount(totalIncome)}</p>
            <span className="summary-label">This month</span>
          </div>
        </div>

        <div className="summary-card expense-card">
          <div className="summary-icon">
            <TrendingDown size={24} />
          </div>
          <div className="summary-content">
            <h3>Total Expenses</h3>
            <p className="summary-amount text-red">{formatAmount(totalExpenses)}</p>
            <span className="summary-label">This month</span>
          </div>
        </div>

        <div className="summary-card balance-card">
          <div className="summary-icon">
            <Wallet size={24} />
          </div>
          <div className="summary-content">
            <h3>Balance</h3>
            <p className={`summary-amount ${balance >= 0 ? 'text-green' : 'text-red'}`}>
              {formatAmount(balance)}
            </p>
            <span className="summary-label">Current balance</span>
          </div>
        </div>

        <div className="summary-card transactions-card">
          <div className="summary-icon">
            <Target size={24} />
          </div>
          <div className="summary-content">
            <h3>Transactions</h3>
            <p className="summary-amount text-blue">{monthTransactions.length}</p>
            <span className="summary-label">This month</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Spending Trend Chart */}
        <div className="dashboard-section">
          <div className="card">
            <div className="section-header">
              <h2>7-Day Spending Trend</h2>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={last7Days}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis hide />
                  <Tooltip 
                    formatter={(value) => [formatAmount(value), 'Spent']}
                    labelFormatter={(label) => `Day: ${label}`}
                    contentStyle={{
                      background: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="url(#colorGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#764ba2" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="dashboard-section">
          <div className="card">
            <div className="section-header">
              <h2>Expenses by Category</h2>
              <Link to="/categories" className="view-all-link">View All</Link>
            </div>
            {expensesByCategory.length > 0 ? (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={expensesByCategory.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="amount"
                    >
                      {expensesByCategory.slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || getCategoryColor(entry.id)} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatAmount(value)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="category-legend">
                  {expensesByCategory.slice(0, 4).map((category, index) => (
                    <div key={category.id} className="legend-item">
                      <div 
                        className="legend-color" 
                        style={{ backgroundColor: category.color || getCategoryColor(category.id) }}
                      ></div>
                      <span className="legend-label">{category.name}</span>
                      <span className="legend-amount">{formatAmount(category.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>No expenses to show</p>
                <Link to="/add-transaction" className="btn btn-primary btn-small">
                  Add Expense
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Budget Status */}
        <div className="dashboard-section">
          <div className="card">
            <div className="section-header">
              <h2>Budget Status</h2>
              <Link to="/budget" className="view-all-link">Manage</Link>
            </div>
            {budgetStatus.length > 0 ? (
              <div className="budget-list">
                {budgetStatus.slice(0, 4).map((budget) => (
                  <div key={budget.id} className="budget-item">
                    <div className="budget-header">
                      <div className="budget-info">
                        <span className="budget-category">
                          {budget.category?.icon} {budget.category?.name}
                        </span>
                        {budget.isOverBudget && (
                          <AlertTriangle size={16} className="text-red budget-warning" />
                        )}
                      </div>
                      <div className="budget-amounts">
                        <span className={`budget-spent ${budget.isOverBudget ? 'text-red' : 'text-gray'}`}>
                          {formatAmount(budget.spent)}
                        </span>
                        <span className="budget-total">/ {formatAmount(budget.amount)}</span>
                      </div>
                    </div>
                    <div className="budget-progress">
                      <div 
                        className={`budget-progress-bar ${budget.isOverBudget ? 'over-budget' : ''}`}
                        style={{ 
                          width: `${Math.min(budget.percentage, 100)}%`,
                          backgroundColor: budget.isOverBudget ? '#ef4444' : '#10b981'
                        }}
                      ></div>
                    </div>
                    <div className="budget-remaining">
                      {budget.remaining >= 0 ? (
                        <span className="text-green">
                          {formatAmount(budget.remaining)} remaining
                        </span>
                      ) : (
                        <span className="text-red">
                          {formatAmount(Math.abs(budget.remaining))} over budget
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No budgets set up</p>
                <Link to="/budget" className="btn btn-primary btn-small">
                  Set Budget
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="dashboard-section full-width">
          <div className="card">
            <div className="section-header">
              <h2>Recent Transactions</h2>
              <Link to="/transactions" className="view-all-link">View All</Link>
            </div>
            {recentTransactions.length > 0 ? (
              <div className="transactions-list">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-icon">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="transaction-details">
                      <div className="transaction-description">
                        {transaction.description || transaction.category}
                      </div>
                      <div className="transaction-meta">
                        {format(new Date(transaction.date), 'MMM dd, yyyy')} • {transaction.category}
                      </div>
                    </div>
                    <div className={`transaction-amount ${transaction.type === 'income' ? 'text-green' : 'text-red'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatAmount(Math.abs(transaction.amount))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No transactions yet</p>
                <Link to="/add-transaction" className="btn btn-primary btn-small">
                  Add First Transaction
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          padding: 0;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .page-title {
          font-size: 32px;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .summary-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .summary-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .summary-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .summary-content h3 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .summary-amount {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 700;
        }

        .summary-label {
          font-size: 12px;
          color: #9ca3af;
          font-weight: 500;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }

        .dashboard-section.full-width {
          grid-column: 1 / -1;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .view-all-link {
          color: #667eea;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }

        .view-all-link:hover {
          color: #5a67d8;
        }

        .chart-container {
          position: relative;
        }

        .category-legend {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .legend-label {
          flex: 1;
          color: #6b7280;
        }

        .legend-amount {
          font-weight: 600;
          color: #1f2937;
        }

        .budget-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .budget-item {
          padding: 16px;
          background: #f9fafb;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .budget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .budget-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .budget-category {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .budget-warning {
          color: #ef4444;
        }

        .budget-amounts {
          font-size: 14px;
          font-weight: 600;
        }

        .budget-spent {
          margin-right: 4px;
        }

        .budget-total {
          color: #9ca3af;
        }

        .budget-progress {
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          margin-bottom: 8px;
          overflow: hidden;
        }

        .budget-progress-bar {
          height: 100%;
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .budget-progress-bar.over-budget {
          background: #ef4444 !important;
        }

        .budget-remaining {
          font-size: 12px;
          font-weight: 500;
        }

        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          transition: background-color 0.2s ease;
        }

        .transaction-item:hover {
          background: #f3f4f6;
        }

        .transaction-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid #e5e7eb;
        }

        .transaction-details {
          flex: 1;
        }

        .transaction-description {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
          margin-bottom: 2px;
        }

        .transaction-meta {
          font-size: 12px;
          color: #6b7280;
        }

        .transaction-amount {
          font-size: 14px;
          font-weight: 600;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
        }

        .empty-state p {
          margin: 0 0 16px 0;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .page-title {
            font-size: 28px;
            text-align: center;
          }

          .summary-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .summary-card {
            padding: 20px;
          }

          .summary-amount {
            font-size: 20px;
          }
        }

        @media (max-width: 480px) {
          .section-header {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .section-header h2 {
            text-align: center;
          }

          .view-all-link {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;