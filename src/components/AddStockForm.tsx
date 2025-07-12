import React, { useState } from 'react';
import { Stock, StockCategory } from '../types';

interface AddStockFormProps {
  onAddStock: (stock: Omit<Stock, 'id' | 'isActive'>) => void;
}

const stockCategories: StockCategory[] = ['טכנולוגיה', 'פיננסים', 'אנרגיה', 'בריאות', 'תעשייה', 'צריכה', 'אחר'];

export const AddStockForm: React.FC<AddStockFormProps> = ({ onAddStock }) => {
  const [formData, setFormData] = useState({
    ticker: '',
    name: '',
    purchaseDate: '',
    purchasePrice: '',
    quantity: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ticker || !formData.name || !formData.purchaseDate || !formData.purchasePrice || !formData.quantity) {
      alert('אנא מלא את כל השדות');
      return;
    }

    const newStock = {
      ticker: formData.ticker.toUpperCase(),
      name: formData.name,
      purchaseDate: formData.purchaseDate,
      purchasePrice: parseFloat(formData.purchasePrice),
      quantity: parseInt(formData.quantity),
    };

    onAddStock(newStock);
    
    // Reset form
    setFormData({
      ticker: '',
      name: '',
      purchaseDate: '',
      purchasePrice: '',
      quantity: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">הוסף מניה חדשה</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              טיקר מניה
            </label>
            <input
              type="text"
              name="ticker"
              value={formData.ticker}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="AAPL"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              שם המניה
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Apple Inc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              תאריך קנייה
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              מחיר קנייה ($)
            </label>
            <input
              type="number"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="150.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              כמות מניות
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          הוסף מניה
        </button>
      </form>
    </div>
  );
}; 