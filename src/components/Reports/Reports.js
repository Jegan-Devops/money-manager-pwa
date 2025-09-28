import React from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { BarChart3 } from 'lucide-react';

const Reports = () => {
  const { getTotalIncome, getTotalExpenses, getBalance } = useFinance();

  return (
    <div className="reports fade-in">
      <h1 className="page-title">Reports</h1>
      
      <div className="reports-summary">
        <div className="summary-card card">
          <h3>Monthly Summary</h3>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-label">Income</span>
              <span className="stat-value text-green">${getTotalIncome()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Expenses</span>
              <span className="stat-value text-red">${getTotalExpenses()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Balance</span>
              <span className={`stat-value ${getBalance() >= 0 ? 'text-green' : 'text-red'}`}>
                ${getBalance()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="empty-state">
        <BarChart3 size={48} className="text-gray" />
        <h3>Detailed Reports Coming Soon</h3>
        <p>Advanced reporting features will be available in future updates</p>
      </div>
    </div>
  );
};

export default Reports;