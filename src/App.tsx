import React, { useState, useEffect } from 'react';
import { Stock, SoldStock, StockCategory } from './types';
import type { PortfolioSummary as PortfolioSummaryType } from './types';
import { stockService } from './services/stockService';
import { AddStockForm } from './components/AddStockForm';
import { StockTable } from './components/StockTable';
import { SoldStocksTable } from './components/SoldStocksTable';
import { PortfolioSummary } from './components/PortfolioSummary';
import { StockScanner } from './components/StockScanner';
import { DashboardCharts } from './components/DashboardCharts';

type ViewMode = 'dashboard' | 'active' | 'sold' | 'all' | 'scanner';
type CategoryFilter = StockCategory | 'כל הסוגים';

function App() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [soldStocks, setSoldStocks] = useState<SoldStock[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('כל הסוגים');
  const [summary, setSummary] = useState<PortfolioSummaryType | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Update summary when stocks change
  useEffect(() => {
    const updateSummary = async () => {
      const s = await stockService.getPortfolioSummary();
      setSummary(s);
    };
    updateSummary();
  }, [stocks, soldStocks]);

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(async () => {
      stockService.updateMockPrices();
      const s = await stockService.getPortfolioSummary();
      setSummary(s);
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setStocks(stockService.getStocks());
    setSoldStocks(stockService.getSoldStocks());
  };

  const handleAddStock = async (stockData: Omit<Stock, 'id' | 'isActive' | 'category'>) => {
    const newStock = await stockService.addStock(stockData);
    setStocks(prev => [...prev, newStock]);
  };

  const handleSellStock = (stockId: string, sellDate: string, sellPrice: number) => {
    const soldStock = stockService.sellStock(stockId, sellDate, sellPrice);
    if (soldStock) {
      setStocks(prev => prev.filter(stock => stock.id !== stockId));
      setSoldStocks(prev => [...prev, soldStock]);
    }
  };

  const handleDeleteStock = (stockId: string) => {
    setStocks(prev => prev.filter(stock => stock.id !== stockId));
  };

  const handleDeleteSoldStock = (stockId: string) => {
    setSoldStocks(prev => prev.filter(stock => stock.id !== stockId));
  };

  const stockCategories: CategoryFilter[] = ['כל הסוגים', 'טכנולוגיה', 'פיננסים', 'אנרגיה', 'בריאות', 'תעשייה', 'צריכה', 'אחר'];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">ניהול תיק מניות</h1>
          <p className="text-gray-600">מערכת לניהול ועקיבה אחר תיק המניות שלך</p>
        </header>

        {/* Portfolio Summary */}
        <div className="mb-8">
          {summary && <PortfolioSummary summary={summary} />}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('dashboard')}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'dashboard' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                דשבורד
              </button>
              <button
                onClick={() => setViewMode('active')}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'active' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                מניות פעילות
              </button>
              <button
                onClick={() => setViewMode('sold')}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'sold' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                מניות שנמכרו
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                הכל
              </button>
              <button
                onClick={() => setViewMode('scanner')}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'scanner' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                סקאנר
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">סינון לפי סוג:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {stockCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Add Stock Form */}
        {(viewMode === 'active' || viewMode === 'all') && (
          <div className="mb-8">
            <AddStockForm onAddStock={handleAddStock} />
          </div>
        )}

        {/* Content */}
        <div className="space-y-8">
          {viewMode === 'dashboard' && (
            <DashboardCharts 
              stocks={stocks}
              soldStocks={soldStocks}
              summary={summary}
            />
          )}

          {viewMode === 'scanner' && (
            <StockScanner />
          )}

          {(viewMode === 'active' || viewMode === 'all') && (
            <StockTable 
              stocks={stocks} 
              onSellStock={handleSellStock}
              categoryFilter={categoryFilter}
              onDeleteStock={handleDeleteStock}
            />
          )}

          {(viewMode === 'sold' || viewMode === 'all') && (
            <SoldStocksTable 
              soldStocks={soldStocks}
              categoryFilter={categoryFilter}
              onDeleteSoldStock={handleDeleteSoldStock}
            />
          )}
        </div>

        {/* Live Updates Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">עדכונים חיים - מחירי מניות מתעדכנים כל 10 שניות</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 