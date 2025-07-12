import React, { useState, useEffect } from 'react';
import { Stock, StockCategory, StockPrice } from '../types';
import { stockService } from '../services/stockService';
import { StockChart } from './StockChart';

interface StockTableProps {
  stocks: Stock[];
  onSellStock: (stockId: string, sellDate: string, sellPrice: number) => void;
  categoryFilter: StockCategory | 'כל הסוגים';
  onDeleteStock?: (stockId: string) => void;
  onDividendUpdate?: (stockId: string, amount: number) => void;
}

export const StockTable: React.FC<StockTableProps> = ({ stocks, onSellStock, categoryFilter, onDeleteStock, onDividendUpdate }) => {
  const [sellModal, setSellModal] = useState<{ stock: Stock | null; isOpen: boolean }>({
    stock: null,
    isOpen: false,
  });
  const [sellForm, setSellForm] = useState({ sellDate: '', sellPrice: '' });
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  // --- NEW: State for live prices ---
  const [livePrices, setLivePrices] = useState<Record<string, StockPrice | null>>({});
  const [loadingPrices, setLoadingPrices] = useState(false);

  // Fetch live prices for all stocks on mount or when stocks change
  useEffect(() => {
    let isMounted = true;
    const fetchPrices = async () => {
      setLoadingPrices(true);
      const prices: Record<string, StockPrice | null> = {};
      for (const stock of stocks) {
        prices[stock.ticker] = await stockService.getCurrentPrice(stock.ticker);
      }
      if (isMounted) {
        setLivePrices(prices);
        setLoadingPrices(false);
      }
    };
    fetchPrices();
    return () => { isMounted = false; };
  }, [stocks]);

  const filteredStocks = categoryFilter === 'כל הסוגים' 
    ? stocks 
    : stocks.filter(stock => stock.category === categoryFilter);

  const handleSellClick = (stock: Stock) => {
    setSellModal({ stock, isOpen: true });
    setSellForm({ sellDate: '', sellPrice: '' });
  };

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellModal.stock || !sellForm.sellDate || !sellForm.sellPrice) {
      alert('אנא מלא את כל השדות');
      return;
    }

    onSellStock(sellModal.stock.id, sellForm.sellDate, parseFloat(sellForm.sellPrice));
    setSellModal({ stock: null, isOpen: false });
  };

  const handleDelete = (stockId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את המניה?')) {
      stockService.deleteStock(stockId);
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new Event('storage'));
      }
      // עדכן את הסטייט המקומי אם צריך (דרך App)
      if (typeof onDeleteStock === 'function') {
        onDeleteStock(stockId);
      }
    }
  };

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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">מניות פעילות</h2>
      </div>

      {filteredStocks.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          {categoryFilter === 'כל הסוגים' ? 'אין מניות פעילות' : `אין מניות פעילות בסוג ${categoryFilter}`}
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
                  מחיר קנייה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  כמות
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  מחיר נוכחי
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  שווי נוכחי
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  רווח/הפסד
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  אחוז
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStocks.map((stock) => {
                const livePrice = livePrices[stock.ticker]?.currentPrice ?? stock.purchasePrice;
                const currentValue = livePrice * stock.quantity;
                const investedValue = stock.purchasePrice * stock.quantity;
                const profit = currentValue - investedValue;
                const profitPercentage = investedValue > 0 ? (profit / investedValue) * 100 : 0;

                return (
                  <tr key={stock.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedStock(stock)}>
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
                      {formatCurrency(stock.purchasePrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stock.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {loadingPrices ? (
                        <span className="text-gray-400">טוען...</span>
                      ) : (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(livePrice)}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(currentValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getProfitColor(profit)}`}>
                        {formatCurrency(profit)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getProfitColor(profitPercentage)}`}>
                        {formatPercentage(profitPercentage)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSellClick(stock); }}
                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors duration-200"
                      >
                        מכירה
                      </button>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(stock.id); }}
                        className="text-gray-400 hover:text-red-600 px-2 focus:outline-none"
                        title="מחק מניה"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Sell Modal */}
      {sellModal.isOpen && sellModal.stock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">מכירת מניה - {sellModal.stock.ticker}</h3>
            
            <form onSubmit={handleSellSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תאריך מכירה
                </label>
                <input
                  type="date"
                  value={sellForm.sellDate}
                  onChange={(e) => setSellForm(prev => ({ ...prev, sellDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  מחיר מכירה ($)
                </label>
                <input
                  type="number"
                  value={sellForm.sellPrice}
                  onChange={(e) => setSellForm(prev => ({ ...prev, sellPrice: e.target.value }))}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 space-x-reverse">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-200"
                >
                  מכירה
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSellModal({ stock: null, isOpen: false }); }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors duration-200"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-3xl mx-4 relative">
            <button
              onClick={() => setSelectedStock(null)}
              className="absolute top-2 left-2 text-gray-500 hover:text-red-600 text-2xl font-bold"
              title="סגור"
            >×</button>
            <h3 className="text-xl font-bold mb-4 text-center">גרף יומי - {selectedStock.ticker}</h3>
            <StockChart ticker={selectedStock.ticker} />
          </div>
        </div>
      )}
    </div>
  );
}; 