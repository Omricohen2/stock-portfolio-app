import React, { useState } from 'react';
import { SoldStock, StockCategory } from '../types';
import { stockService } from '../services/stockService';

interface SoldStocksTableProps {
  soldStocks: SoldStock[];
  categoryFilter: StockCategory | 'כל הסוגים';
  onDeleteSoldStock?: (stockId: string) => void;
}

export const SoldStocksTable: React.FC<SoldStocksTableProps> = ({ soldStocks, categoryFilter, onDeleteSoldStock }) => {
  const [learningModal, setLearningModal] = useState<{ stock: SoldStock | null; isOpen: boolean }>({ stock: null, isOpen: false });
  const [learningText, setLearningText] = useState('');

  const filteredStocks = categoryFilter === 'כל הסוגים' 
    ? soldStocks 
    : soldStocks.filter(stock => stock.category === categoryFilter);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const getProfitColor = (profit: number) => {
    return profit >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const handleDelete = (stockId: string) => {
    if (window.confirm('האם למחוק את המניה מהיסטוריית המכירות?')) {
      stockService.deleteSoldStock(stockId);
      if (typeof onDeleteSoldStock === 'function') {
        onDeleteSoldStock(stockId);
      }
    }
  };

  const handleLearningClick = (stock: SoldStock) => {
    setLearningModal({ stock, isOpen: true });
    setLearningText(stock.learning || '');
  };

  const handleLearningSave = () => {
    if (!learningModal.stock) return;
    stockService.updateSoldLearning(learningModal.stock.id, learningText);
    setLearningModal({ stock: null, isOpen: false });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">מניות שנמכרו</h2>
      </div>

      {filteredStocks.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          {categoryFilter === 'כל הסוגים' ? 'אין מניות שנמכרו' : `אין מניות שנמכרו בסוג ${categoryFilter}`}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  מניה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  תאריך קנייה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  תאריך מכירה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  מחיר קנייה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  מחיר מכירה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  כמות
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  רווח/הפסד
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  אחוז
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  משך החזקה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStocks.map((stock) => (
                <tr key={stock.id} className="hover:bg-gray-50">
                  <td className="px-2 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(stock.id); }}
                      className="text-gray-400 hover:text-red-600 px-2 focus:outline-none"
                      title="מחק מניה"
                    >
                      ×
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{stock.ticker}</div>
                      <div className="text-sm text-gray-500">{stock.name}</div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {stock.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(stock.purchaseDate).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(stock.sellDate).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(stock.purchasePrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(stock.sellPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stock.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getProfitColor(stock.totalProfit)}`}>
                      {formatCurrency(stock.totalProfit)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getProfitColor(stock.profitPercentage)}`}>
                      {formatPercentage(stock.profitPercentage)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stock.holdingDays} ימים
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleLearningClick(stock)}
                      className="text-blue-600 hover:text-blue-800 px-2 focus:outline-none"
                      title="למידה מהעסקה"
                    >
                      למידה מהעסקה
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {learningModal.isOpen && learningModal.stock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl mx-4 relative">
            <button
              onClick={() => setLearningModal({ stock: null, isOpen: false })}
              className="absolute top-2 left-2 text-gray-500 hover:text-red-600 text-2xl font-bold"
              title="סגור"
            >×</button>
            <h3 className="text-lg font-bold mb-4 text-center">למידה מהעסקה - {learningModal.stock.ticker}</h3>
            <div className="mb-2 text-sm text-gray-600">סכם לעצמך מה למדת מהעסקה הזו – מה עבד טוב, מה לא עבד, האם פעלת לפי התוכנית, מה תוכל לעשות אחרת בפעם הבאה? נסה להתייחס גם להיבטים טכניים וגם רגשיים.</div>
            <ul className="mb-2 text-xs text-gray-500 list-disc pr-4">
              <li>האם ניתחת נכון את הכניסה?</li>
              <li>האם היציאה הייתה מתוזמנת היטב?</li>
              <li>האם הייתה כאן פעולה מתוך פחד או תאווה?</li>
              <li>האם הייתה לך סבלנות?</li>
              <li>האם עקבת אחרי התוכנית שלך?</li>
            </ul>
            <textarea
              value={learningText}
              onChange={e => setLearningText(e.target.value)}
              rows={7}
              className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="כתוב כאן את התובנות שלך..."
            />
            <button
              onClick={handleLearningSave}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-bold"
            >
              שמור למידה
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 