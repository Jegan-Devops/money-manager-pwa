import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Calculator, Calendar, Tag, FileText } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { format } from 'date-fns';

const AddTransaction = () => {
  const navigate = useNavigate();
  const { addTransaction, categories } = useFinance();
  
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    categoryId: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const transaction = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString()
      };
      
      addTransaction(transaction);
      
      // Show success message
      showToast('Transaction added successfully!', 'success');
      
      // Redirect back to transactions or dashboard
      navigate('/transactions');
    } catch (error) {
      console.error('Error adding transaction:', error);
      showToast('Error adding transaction. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      type,
      categoryId: '' // Reset category when type changes
    }));
  };

  const showToast = (message, type = 'success') => {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>${type === 'success' ? '✅' : '❌'}</span>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  const getCurrentCategories = () => {
    return categories[formData.type] || [];
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="add-transaction fade-in">
      <div className="page-header">
        <button 
          onClick={() => navigate(-1)} 
          className="back-btn"
          type="button"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="page-title">Add Transaction</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="add-transaction-container">
        <form onSubmit={handleSubmit} className="transaction-form">
          {/* Transaction Type */}
          <div className="form-section">
            <label className="section-label">Transaction Type</label>
            <div className="type-selector">
              <button
                type="button"
                className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
                onClick={() => handleTypeChange('expense')}
              >
                <span className="type-icon">💸</span>
                <span>Expense</span>
              </button>
              <button
                type="button"
                className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`}
                onClick={() => handleTypeChange('income')}
              >
                <span className="type-icon">💰</span>
                <span>Income</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="form-section">
            <label className="section-label">
              <Calculator size={16} />
              Amount
            </label>
            <div className="amount-input-container">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`amount-input ${errors.amount ? 'error' : ''}`}
              />
            </div>
            {errors.amount && <span className="error-message">{errors.amount}</span>}
            {formData.amount && (
              <div className="amount-preview">
                {formatAmount(parseFloat(formData.amount) || 0)}
              </div>
            )}
          </div>

          {/* Category */}
          <div className="form-section">
            <label className="section-label">
              <Tag size={16} />
              Category
            </label>
            <div className="category-grid">
              {getCurrentCategories().map(category => (
                <button
                  key={category.id}
                  type="button"
                  className={`category-btn ${formData.categoryId === category.id ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, categoryId: category.id }))}
                  style={{ borderColor: category.color }}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                </button>
              ))}
            </div>
            {errors.categoryId && <span className="error-message">{errors.categoryId}</span>}
          </div>

          {/* Description */}
          <div className="form-section">
            <label className="section-label">
              <FileText size={16} />
              Description
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter description..."
              className={`form-input ${errors.description ? 'error' : ''}`}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          {/* Date */}
          <div className="form-section">
            <label className="section-label">
              <Calendar size={16} />
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          {/* Notes (Optional) */}
          <div className="form-section">
            <label className="section-label">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Add any additional notes..."
              rows="3"
              className="form-textarea"
            />
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={isLoading}
              className="submit-btn"
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Add Transaction
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Amount Buttons */}
        <div className="quick-amounts">
          <p className="quick-amounts-title">Quick Amounts</p>
          <div className="quick-amounts-grid">
            {[10, 25, 50, 100, 200, 500].map(amount => (
              <button
                key={amount}
                type="button"
                className="quick-amount-btn"
                onClick={() => setFormData(prev => ({ ...prev, amount: amount.toString() }))}
              >
                ${amount}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .add-transaction {
          max-width: 600px;
          margin: 0 auto;
          padding: 0;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          padding: 0 4px;
        }

        .back-btn {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: white;
          margin: 0;
          text-align: center;
        }

        .header-spacer {
          width: 44px;
        }

        .add-transaction-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .transaction-form {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 32px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .form-section {
          margin-bottom: 28px;
        }

        .section-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
        }

        .type-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .type-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .type-btn:hover {
          border-color: #d1d5db;
          transform: translateY(-2px);
        }

        .type-btn.active.expense {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .type-btn.active.income {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .type-icon {
          font-size: 24px;
        }

        .amount-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .currency-symbol {
          position: absolute;
          left: 16px;
          font-size: 24px;
          font-weight: 600;
          color: #6b7280;
          z-index: 1;
        }

        .amount-input {
          width: 100%;
          padding: 16px 16px 16px 40px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 24px;
          font-weight: 600;
          background: white;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .amount-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .amount-input.error {
          border-color: #ef4444;
        }

        .amount-preview {
          margin-top: 8px;
          font-size: 18px;
          font-weight: 600;
          color: #10b981;
          text-align: center;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
        }

        .category-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
        }

        .category-btn:hover {
          border-color: #d1d5db;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .category-btn.active {
          border-color: currentColor;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .category-icon {
          font-size: 20px;
        }

        .category-name {
          text-align: center;
          line-height: 1.2;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 16px;
          background: white;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input.error {
          border-color: #ef4444;
        }

        .form-textarea {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 16px;
          background: white;
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .error-message {
          display: block;
          margin-top: 6px;
          font-size: 14px;
          color: #ef4444;
          font-weight: 500;
        }

        .form-actions {
          margin-top: 32px;
        }

        .submit-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 16px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 56px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .quick-amounts {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .quick-amounts-title {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 16px 0;
          text-align: center;
        }

        .quick-amounts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .quick-amount-btn {
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          background: white;
          color: #374151;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quick-amount-btn:hover {
          border-color: #667eea;
          color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Toast Styles */
        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          background: white;
          border-radius: 12px;
          padding: 16px 20px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #10b981;
          animation: toastSlide 0.3s ease-out;
          z-index: 1000;
          min-width: 250px;
        }

        .toast.error {
          border-left-color: #ef4444;
        }

        @keyframes toastSlide {
          from { 
            transform: translateX(100%); 
            opacity: 0; 
          }
          to { 
            transform: translateX(0); 
            opacity: 1; 
          }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .add-transaction {
            padding: 0 16px;
          }

          .page-title {
            font-size: 24px;
          }

          .transaction-form {
            padding: 24px;
            border-radius: 16px;
          }

          .type-selector {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .type-btn {
            flex-direction: row;
            padding: 16px;
            gap: 12px;
          }

          .category-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .category-btn {
            padding: 12px 8px;
            font-size: 12px;
          }

          .category-icon {
            font-size: 18px;
          }

          .amount-input {
            font-size: 20px;
            padding: 14px 14px 14px 36px;
          }

          .currency-symbol {
            font-size: 20px;
            left: 14px;
          }

          .quick-amounts-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .quick-amount-btn {
            padding: 10px;
            font-size: 13px;
          }

          .toast {
            top: 10px;
            right: 10px;
            left: 10px;
            min-width: auto;
          }
        }

        @media (max-width: 480px) {
          .page-header {
            margin-bottom: 24px;
          }

          .transaction-form,
          .quick-amounts {
            padding: 20px;
          }

          .form-section {
            margin-bottom: 24px;
          }

          .category-grid {
            grid-template-columns: 1fr;
          }

          .category-btn {
            flex-direction: row;
            justify-content: flex-start;
            text-align: left;
            padding: 14px;
          }

          .quick-amounts-grid {
            grid-template-columns: 1fr;
          }

          .submit-btn {
            padding: 14px 20px;
            min-height: 52px;
          }
        }

        /* Focus styles for accessibility */
        .type-btn:focus,
        .category-btn:focus,
        .quick-amount-btn:focus,
        .back-btn:focus {
          outline: 2px solid #667eea;
          outline-offset: 2px;
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .transaction-form,
          .quick-amounts {
            background: white;
            border-color: #000;
          }
          
          .type-btn,
          .category-btn,
          .form-input,
          .form-textarea,
          .quick-amount-btn {
            border-color: #000;
          }
          
          .type-btn.active,
          .category-btn.active {
            background: #000;
            color: white;
          }
        }
      `}</style>
    </div>
  );
};

export default AddTransaction;