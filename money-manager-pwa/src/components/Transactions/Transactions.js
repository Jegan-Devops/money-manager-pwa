import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { format, isToday, isYesterday } from 'date-fns';

const Transactions = () => {
  const { transactions, categories } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || transaction.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || transaction.categoryId === selectedCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date);
    let key;
    
    if (isToday(date)) {
      key = 'Today';
    } else if (isYesterday(date)) {
      key = 'Yesterday';
    } else {
      key = format(date, 'MMMM dd, yyyy');
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(transaction);
    return groups;
  }, {});

  const getCategoryName = (categoryId, type) => {
    const categoryList = categories[type] || [];
    const category = categoryList.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getCategoryIcon = (categoryId, type) => {
    const categoryList = categories[type] || [];
    const category = categoryList.find(c => c.id === categoryId);
    return category ? category.icon : '📋';
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const allCategories = [...(categories.income || []), ...(categories.expense || [])];

  return (
    <div className="transactions fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Transactions</h1>
        <Link to="/add-transaction" className="btn btn-primary">
          <Plus size={20} />
          Add New
        </Link>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-buttons">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {allCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="transactions-content">
        {Object.keys(groupedTransactions).length > 0 ? (
          Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
            <div key={date} className="transaction-group">
              <h3 className="group-date">{date}</h3>
              <div className="transactions-list">
                {dayTransactions.map(transaction => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-icon">
                      <span className="category-icon">
                        {getCategoryIcon(transaction.categoryId, transaction.type)}
                      </span>
                      <div className={`type-indicator ${transaction.type}`}>
                        {transaction.type === 'income' ? 
                          <ArrowUpRight size={12} /> : 
                          <ArrowDownRight size={12} />
                        }
                      </div>
                    </div>
                    
                    <div className="transaction-details">
                      <div className="transaction-description">
                        {transaction.description}
                      </div>
                      <div className="transaction-meta">
                        {getCategoryName(transaction.categoryId, transaction.type)}
                        {transaction.notes && (
                          <span className="transaction-notes"> • {transaction.notes}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatAmount(Math.abs(transaction.amount))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No transactions found</h3>
            <p>
              {searchTerm || selectedType !== 'all' || selectedCategory !== 'all' 
                ? 'Try adjusting your filters or search term'
                : 'Start by adding your first transaction'
              }
            </p>
            <Link to="/add-transaction" className="btn btn-primary">
              Add Transaction
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        .transactions {
          padding: 0;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .page-title {
          font-size: 32px;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .filters-section {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .search-box {
          position: relative;
          margin-bottom: 16px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px 12px 48px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 16px;
          background: white;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .filter-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .filter-select {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          background: white;
          cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .filter-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .transactions-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .transaction-group {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .group-date {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 16px 0;
          padding-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
        }

        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        .transaction-item:hover {
          background: #f3f4f6;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .transaction-icon {
          position: relative;
          width: 48px;
          height: 48px;
          background: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          border: 1px solid #e5e7eb;
        }

        .type-indicator {
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .type-indicator.income {
          background: #10b981;
          color: white;
        }

        .type-indicator.expense {
          background: #ef4444;
          color: white;
        }

        .transaction-details {
          flex: 1;
        }

        .transaction-description {
          font-size: 16px;
          font-weight: 500;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .transaction-meta {
          font-size: 14px;
          color: #6b7280;
        }

        .transaction-notes {
          font-style: italic;
        }

        .transaction-amount {
          font-size: 16px;
          font-weight: 600;
          text-align: right;
        }

        .transaction-amount.income {
          color: #10b981;
        }

        .transaction-amount.expense {
          color: #ef4444;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          color: #6b7280;
          margin: 0 0 24px 0;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .page-title {
            font-size: 28px;
            text-align: center;
          }

          .filter-buttons {
            grid-template-columns: 1fr;
          }

          .transaction-item {
            padding: 12px;
            gap: 12px;
          }

          .transaction-icon {
            width: 40px;
            height: 40px;
            font-size: 18px;
          }

          .transaction-description {
            font-size: 15px;
          }

          .transaction-amount {
            font-size: 15px;
          }
        }

        @media (max-width: 480px) {
          .transaction-item {
            flex-direction: row;
            text-align: left;
          }

          .transaction-details {
            min-width: 0;
          }

          .transaction-description {
            font-size: 14px;
          }

          .transaction-meta {
            font-size: 13px;
          }

          .transaction-amount {
            font-size: 14px;
            min-width: fit-content;
          }
        }
      `}</style>
    </div>
  );
};

export default Transactions;