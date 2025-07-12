import React from 'react';
import { PortfolioSummary as PortfolioSummaryType } from '../types';

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ summary }) => {
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">סיכום תיק המניות</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-blue-600">סה"כ השקעה</div>
          <div className="text-2xl font-bold text-blue-900">{formatCurrency(summary.totalInvested)}</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-green-600">שווי נוכחי</div>
          <div className="text-2xl font-bold text-green-900">{formatCurrency(summary.currentValue)}</div>
        </div>

        <div className={`p-4 rounded-lg ${summary.totalProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={`text-sm font-medium ${summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            רווח/הפסד כולל
          </div>
          <div className={`text-2xl font-bold ${getProfitColor(summary.totalProfit)}`}>
            {formatCurrency(summary.totalProfit)}
          </div>
          <div className={`text-sm ${getProfitColor(summary.totalProfitPercentage)}`}>
            {formatPercentage(summary.totalProfitPercentage)}
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-purple-600">מניות פעילות</div>
          <div className="text-2xl font-bold text-purple-900">{summary.activeStocks}</div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-orange-600">מניות שנמכרו</div>
          <div className="text-2xl font-bold text-orange-900">{summary.soldStocks}</div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-600">סה"כ עסקאות</div>
          <div className="text-2xl font-bold text-gray-900">{summary.activeStocks + summary.soldStocks}</div>
        </div>
      </div>

      {summary.totalInvested > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">ביצועים כללים:</span>
            <span className={`text-lg font-bold ${getProfitColor(summary.totalProfitPercentage)}`}>
              {formatPercentage(summary.totalProfitPercentage)}
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${summary.totalProfitPercentage >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(Math.abs(summary.totalProfitPercentage), 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}; 