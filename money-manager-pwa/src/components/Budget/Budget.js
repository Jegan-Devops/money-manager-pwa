import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { Target, Plus, AlertTriangle } from 'lucide-react';

const Budget = () => {
  const { budgetStatus, setBudget, categories } = useFinance();
  const [showAddBudget, setShowAddBudget] = useState(false);

  return (
    <div className="budget fade-in">
      <div className="page-header">
        <h1 className="page-title">Budget</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddBudget(true)}
        >
          <Plus size={20} />
          Set Budget
        </button>
      </div>

      <div className="budget-overview">
        {budgetStatus.length > 0 ? (
          budgetStatus.map(budget => (
            <div key={budget.id} className="budget-card card">
              <div className="budget-header">
                <h3>{budget.category?.icon} {budget.category?.name}</h3>
                {budget.isOverBudget && <AlertTriangle className="text-red" size={20} />}
              </div>
              <div className="budget-progress">
                <div 
                  className="progress-bar"
                  style={{ 
                    width: `${Math.min(budget.percentage, 100)}%`,
                    backgroundColor: budget.isOverBudget ? '#ef4444' : '#10b981'
                  }}
                />
              </div>
              <div className="budget-details">
                <span>Spent: ${budget.spent}</span>
                <span>Budget: ${budget.amount}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Target size={48} className="text-gray" />
            <h3>No budgets set</h3>
            <p>Start by setting your first budget</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Budget;