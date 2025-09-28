import React from 'react';
import { useFinance } from '../../contexts/FinanceContext';

const Categories = () => {
  const { categories } = useFinance();

  return (
    <div className="categories fade-in">
      <h1 className="page-title">Categories</h1>
      
      <div className="categories-section">
        <h2>Expense Categories</h2>
        <div className="categories-grid">
          {categories.expense?.map(category => (
            <div key={category.id} className="category-card card">
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="categories-section">
        <h2>Income Categories</h2>
        <div className="categories-grid">
          {categories.income?.map(category => (
            <div key={category.id} className="category-card card">
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;