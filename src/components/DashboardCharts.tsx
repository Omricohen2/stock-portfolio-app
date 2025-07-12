import React, { useState } from 'react';
import { Stock, SoldStock, PortfolioSummary } from '../types';
import { AddStockForm } from './AddStockForm';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardChartsProps {
  stocks: Stock[];
  soldStocks: SoldStock[];
  summary: PortfolioSummary | null;
  onAddStock: (stock: Omit<Stock, 'id' | 'isActive' | 'category'>) => void;
}

interface SectorData {
  sector: string;
  count: number;
  totalValue: number;
  percentage: number;
}

interface TrendData {
  month: string;
  profit: number;
  invested: number;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ 
  stocks, 
  soldStocks, 
  summary, 
  onAddStock 
}) => {
  const [showAddStock, setShowAddStock] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate sector distribution
  const calculateSectorDistribution = (): SectorData[] => {
    const sectorMap = new Map<string, { count: number; totalValue: number }>();
    
    stocks.forEach(stock => {
      const sector = stock.category || 'לא ידוע';
      const currentValue = stock.purchasePrice * stock.quantity; // Simplified for demo
      
      if (sectorMap.has(sector)) {
        const existing = sectorMap.get(sector)!;
        existing.count += 1;
        existing.totalValue += currentValue;
      } else {
        sectorMap.set(sector, { count: 1, totalValue: currentValue });
      }
    });
    
    const totalValue = Array.from(sectorMap.values()).reduce((sum, data) => sum + data.totalValue, 0);
    
    return Array.from(sectorMap.entries()).map(([sector, data]) => ({
      sector,
      count: data.count,
      totalValue: data.totalValue,
      percentage: totalValue > 0 ? (data.totalValue / totalValue) * 100 : 0
    })).sort((a, b) => b.percentage - a.percentage);
  };

  // Generate recommendations based on portfolio analysis
  const generateRecommendations = (): string[] => {
    const recommendations: string[] = [];
    const sectorData = calculateSectorDistribution();
    
    // Check sector concentration
    const topSector = sectorData[0];
    if (topSector && topSector.percentage > 40) {
      recommendations.push(`ריכוז גבוה בסקטור ${topSector.sector} (${topSector.percentage.toFixed(1)}%) - שקול גיוון`);
    }
    
    // Check portfolio size
    if (stocks.length < 5) {
      recommendations.push('תיק קטן מדי - שקול הוספת מניות לגיוון');
    }
    
    // Check profit performance
    if (summary && summary.totalProfitPercentage < 0) {
      recommendations.push('תיק בהפסד - שקול בדיקת אסטרטגיה');
    } else if (summary && summary.totalProfitPercentage > 10) {
      recommendations.push('תיק מצוין! שקול רווחים חלקיים');
    }
    
    // Check recent sales performance
    const recentSales = soldStocks.filter(stock => {
      const sellDate = new Date(stock.sellDate);
      const now = new Date();
      const monthsDiff = (now.getTime() - sellDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsDiff <= 3;
    });
    
    const avgProfit = recentSales.length > 0 
      ? recentSales.reduce((sum, stock) => sum + stock.profitPercentage, 0) / recentSales.length 
      : 0;
    
    if (avgProfit > 15) {
      recommendations.push('ביצועי מכירה מעולים - המשך באסטרטגיה הנוכחית');
    } else if (avgProfit < -5) {
      recommendations.push('ביצועי מכירה נמוכים - שקול שיפור אסטרטגיית יציאה');
    }
    
    return recommendations;
  };

  const sectorData = calculateSectorDistribution();
  // --- Remove old generateTrendData and trendData usage ---

  // --- New: Portfolio Value Trend Chart (placeholder, shows current value N times) ---
  const N = 10;
  const portfolioTrend = Array.from({ length: N }, (_, i) => ({
    label: `T-${N - i}`,
    value: summary?.currentValue || 0,
  }));
  // --- End new code ---

  const recommendations = generateRecommendations();

  const getSectorColor = (index: number): string => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];
    return colors[index % colors.length];
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">סה"כ השקעה</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary ? formatCurrency(summary.totalInvested) : '$0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">רווח כולל</p>
              <p className={`text-2xl font-bold ${summary && summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary ? formatCurrency(summary.totalProfit) : '$0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">אחוז רווח</p>
              <p className={`text-2xl font-bold ${summary && summary.totalProfitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary ? `${summary.totalProfitPercentage.toFixed(1)}%` : '0%'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">מניות פעילות</p>
              <p className="text-2xl font-bold text-gray-900">{stocks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sector Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">חלוקה לפי סקטור</h3>
          <div className="space-y-4">
            {sectorData.map((sector, index) => (
              <div key={sector.sector} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: getSectorColor(index) }}
                  ></div>
                  <div>
                    <p className="font-medium text-gray-900">{sector.sector}</p>
                    <p className="text-sm text-gray-500">{sector.count} מניות</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{sector.percentage.toFixed(1)}%</p>
                  <p className="text-sm text-gray-500">{formatCurrency(sector.totalValue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Money Trend Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center min-h-[180px]">
          <span className="text-gray-500 text-lg text-center">
            אזור זה מיועד לתוספות נוספות בעתיד (גרפים, ניתוחים ועוד)
          </span>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">המלצות</h3>
        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="mr-3 text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">אין המלצות מיוחדות כרגע</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">פעולות מהירות</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowAddStock(true)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            הוסף מניה
          </button>
          <button
            className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => setShowAdvanced(true)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            ניתוח מתקדם
          </button>
          <button
            className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => setShowReport(true)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            דוח מפורט
          </button>
        </div>
      </div>

      {/* מודל הוספת מניה */}
      {showAddStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 relative">
            <button
              onClick={() => setShowAddStock(false)}
              className="absolute top-2 left-2 text-gray-500 hover:text-red-600 text-2xl font-bold"
              title="סגור"
            >×</button>
            <AddStockForm onAddStock={async (stock) => { await onAddStock(stock); setShowAddStock(false); }} />
          </div>
        </div>
      )}
      {/* מודל דוח מפורט */}
      {showReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
            <button
              onClick={() => setShowReport(false)}
              className="absolute top-2 left-2 text-gray-500 hover:text-red-600 text-2xl font-bold"
              title="סגור"
            >×</button>
            <h3 className="text-xl font-bold mb-4 text-center">דוח מפורט</h3>
            <p className="text-gray-700">פיצ'ר דוח מפורט יתווסף בקרוב. תוכל לייצא דוחות, לראות פילוחים ונתונים מתקדמים.</p>
          </div>
        </div>
      )}
      {/* מודל ניתוח מתקדם */}
      {showAdvanced && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
            <button
              onClick={() => setShowAdvanced(false)}
              className="absolute top-2 left-2 text-gray-500 hover:text-red-600 text-2xl font-bold"
              title="סגור"
            >×</button>
            <h3 className="text-xl font-bold mb-4 text-center">ניתוח מתקדם</h3>
            <p className="text-gray-700">פיצ'ר ניתוח מתקדם יתווסף בקרוב. כאן תוכל לראות גרפים, ניתוחים וסטטיסטיקות מתקדמות.</p>
          </div>
        </div>
      )}
    </div>
  );
}; 