import React, { useState, useEffect } from 'react';
import { Stock } from '../types';
import { stockService } from '../services/stockService';

interface ScannedStock {
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  movingAverage150: number;
  sector: string;
  priceToMA150: number; // percentage difference from 150-day MA
}

// S&P 500 companies list (top 100 for demonstration)
const SP500_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', sector: 'Financial Services' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', sector: 'Healthcare' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', sector: 'Healthcare' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financial Services' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Defensive' },
  { symbol: 'HD', name: 'Home Depot Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'MA', name: 'Mastercard Inc.', sector: 'Financial Services' },
  { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare' },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare' },
  { symbol: 'BAC', name: 'Bank of America Corp.', sector: 'Financial Services' },
  { symbol: 'KO', name: 'Coca-Cola Co.', sector: 'Consumer Defensive' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer Defensive' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific Inc.', sector: 'Healthcare' },
  { symbol: 'COST', name: 'Costco Wholesale Corp.', sector: 'Consumer Defensive' },
  { symbol: 'MRK', name: 'Merck & Co. Inc.', sector: 'Healthcare' },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Defensive' },
  { symbol: 'ABT', name: 'Abbott Laboratories', sector: 'Healthcare' },
  { symbol: 'ACN', name: 'Accenture plc', sector: 'Technology' },
  { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology' },
  { symbol: 'DHR', name: 'Danaher Corporation', sector: 'Healthcare' },
  { symbol: 'VZ', name: 'Verizon Communications Inc.', sector: 'Communication Services' },
  { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology' },
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Communication Services' },
  { symbol: 'NKE', name: 'Nike Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'PM', name: 'Philip Morris International', sector: 'Consumer Defensive' },
  { symbol: 'TXN', name: 'Texas Instruments Inc.', sector: 'Technology' },
  { symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology' },
  { symbol: 'QCOM', name: 'QUALCOMM Inc.', sector: 'Technology' },
  { symbol: 'HON', name: 'Honeywell International Inc.', sector: 'Industrials' },
  { symbol: 'IBM', name: 'International Business Machines Corp.', sector: 'Technology' },
  { symbol: 'UNP', name: 'Union Pacific Corporation', sector: 'Industrials' },
  { symbol: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrials' },
  { symbol: 'GS', name: 'Goldman Sachs Group Inc.', sector: 'Financial Services' },
  { symbol: 'AMAT', name: 'Applied Materials Inc.', sector: 'Technology' },
  { symbol: 'MS', name: 'Morgan Stanley', sector: 'Financial Services' },
  { symbol: 'SPGI', name: 'S&P Global Inc.', sector: 'Financial Services' },
  { symbol: 'RTX', name: 'Raytheon Technologies Corp.', sector: 'Industrials' },
  { symbol: 'ISRG', name: 'Intuitive Surgical Inc.', sector: 'Healthcare' },
  { symbol: 'PLD', name: 'Prologis Inc.', sector: 'Real Estate' },
  { symbol: 'LMT', name: 'Lockheed Martin Corporation', sector: 'Industrials' },
  { symbol: 'BMY', name: 'Bristol-Myers Squibb Co.', sector: 'Healthcare' },
  { symbol: 'T', name: 'AT&T Inc.', sector: 'Communication Services' },
  { symbol: 'DE', name: 'Deere & Company', sector: 'Industrials' },
  { symbol: 'AXP', name: 'American Express Co.', sector: 'Financial Services' },
  { symbol: 'GILD', name: 'Gilead Sciences Inc.', sector: 'Healthcare' },
  { symbol: 'AMGN', name: 'Amgen Inc.', sector: 'Healthcare' },
  { symbol: 'ADI', name: 'Analog Devices Inc.', sector: 'Technology' },
  { symbol: 'C', name: 'Citigroup Inc.', sector: 'Financial Services' },
  { symbol: 'MDLZ', name: 'Mondelez International Inc.', sector: 'Consumer Defensive' },
  { symbol: 'GE', name: 'General Electric Company', sector: 'Industrials' },
  { symbol: 'TJX', name: 'TJX Companies Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', sector: 'Consumer Cyclical' },
  { symbol: 'CMCSA', name: 'Comcast Corporation', sector: 'Communication Services' },
  { symbol: 'TMUS', name: 'T-Mobile US Inc.', sector: 'Communication Services' },
  { symbol: 'ADP', name: 'Automatic Data Processing Inc.', sector: 'Technology' },
  { symbol: 'DUK', name: 'Duke Energy Corporation', sector: 'Utilities' },
  { symbol: 'SO', name: 'Southern Company', sector: 'Utilities' },
  { symbol: 'BDX', name: 'Becton Dickinson and Company', sector: 'Healthcare' },
  { symbol: 'ITW', name: 'Illinois Tool Works Inc.', sector: 'Industrials' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', sector: 'Technology' },
  { symbol: 'BLK', name: 'BlackRock Inc.', sector: 'Financial Services' },
  { symbol: 'SCHW', name: 'Charles Schwab Corporation', sector: 'Financial Services' },
  { symbol: 'CI', name: 'Cigna Corporation', sector: 'Healthcare' },
  { symbol: 'USB', name: 'U.S. Bancorp', sector: 'Financial Services' },
  { symbol: 'PNC', name: 'PNC Financial Services Group Inc.', sector: 'Financial Services' },
  { symbol: 'TGT', name: 'Target Corporation', sector: 'Consumer Cyclical' },
  { symbol: 'MO', name: 'Altria Group Inc.', sector: 'Consumer Defensive' },
  { symbol: 'UPS', name: 'United Parcel Service Inc.', sector: 'Industrials' },
  { symbol: 'LOW', name: 'Lowe\'s Companies Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'INTU', name: 'Intuit Inc.', sector: 'Technology' },
  { symbol: 'CB', name: 'Chubb Limited', sector: 'Financial Services' },
  { symbol: 'ICE', name: 'Intercontinental Exchange Inc.', sector: 'Financial Services' },
  { symbol: 'CME', name: 'CME Group Inc.', sector: 'Financial Services' },
  { symbol: 'ETN', name: 'Eaton Corporation plc', sector: 'Industrials' },
  { symbol: 'AON', name: 'Aon plc', sector: 'Financial Services' },
  { symbol: 'MMC', name: 'Marsh & McLennan Companies Inc.', sector: 'Financial Services' },
  { symbol: 'REGN', name: 'Regeneron Pharmaceuticals Inc.', sector: 'Healthcare' },
  { symbol: 'KLAC', name: 'KLA Corporation', sector: 'Technology' },
  { symbol: 'CDNS', name: 'Cadence Design Systems Inc.', sector: 'Technology' },
  { symbol: 'SNPS', name: 'Synopsys Inc.', sector: 'Technology' },
  { symbol: 'MELI', name: 'MercadoLibre Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'PANW', name: 'Palo Alto Networks Inc.', sector: 'Technology' },
  { symbol: 'FTNT', name: 'Fortinet Inc.', sector: 'Technology' },
  { symbol: 'CRWD', name: 'CrowdStrike Holdings Inc.', sector: 'Technology' },
  { symbol: 'ZS', name: 'Zscaler Inc.', sector: 'Technology' },
  { symbol: 'OKTA', name: 'Okta Inc.', sector: 'Technology' },
  { symbol: 'TEAM', name: 'Atlassian Corporation plc', sector: 'Technology' },
  { symbol: 'SNOW', name: 'Snowflake Inc.', sector: 'Technology' },
  { symbol: 'DDOG', name: 'Datadog Inc.', sector: 'Technology' },
  { symbol: 'PLTR', name: 'Palantir Technologies Inc.', sector: 'Technology' },
  { symbol: 'RBLX', name: 'Roblox Corporation', sector: 'Communication Services' },
  { symbol: 'UBER', name: 'Uber Technologies Inc.', sector: 'Technology' },
  { symbol: 'LYFT', name: 'Lyft Inc.', sector: 'Technology' },
  { symbol: 'DASH', name: 'DoorDash Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'ABNB', name: 'Airbnb Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'COIN', name: 'Coinbase Global Inc.', sector: 'Financial Services' },
  { symbol: 'HOOD', name: 'Robinhood Markets Inc.', sector: 'Financial Services' },
  { symbol: 'RIVN', name: 'Rivian Automotive Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'LCID', name: 'Lucid Group Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'NIO', name: 'NIO Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'XPEV', name: 'XPeng Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'LI', name: 'Li Auto Inc.', sector: 'Consumer Cyclical' }
];

export const StockScanner: React.FC = () => {
  const [scannedStocks, setScannedStocks] = useState<ScannedStock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [totalScanned, setTotalScanned] = useState(0);

  // Generate realistic mock data for S&P 500 stocks
  const generateMockStockData = (stock: typeof SP500_STOCKS[0]): ScannedStock => {
    const basePrice = Math.random() * 500 + 10; // Random price between $10-$510
    const marketCap = basePrice * (Math.random() * 10000000 + 1000000); // Random market cap
    const movingAverage150 = basePrice * (0.95 + Math.random() * 0.1); // MA within ±5% of price
    const priceToMA150 = ((basePrice - movingAverage150) / movingAverage150) * 100;
    
    return {
      symbol: stock.symbol,
      name: stock.name,
      price: Math.round(basePrice * 100) / 100,
      marketCap: Math.round(marketCap),
      movingAverage150: Math.round(movingAverage150 * 100) / 100,
      sector: stock.sector,
      priceToMA150: Math.round(priceToMA150 * 100) / 100
    };
  };

  const scanStocks = async () => {
    setIsScanning(true);
    setIsLoading(true);
    setScanProgress(0);
    setTotalScanned(0);
    
    const results: ScannedStock[] = [];
    const totalStocks = SP500_STOCKS.length;
    
    for (let i = 0; i < totalStocks; i++) {
      const stock = SP500_STOCKS[i];
      // שליפת נתונים אמיתיים מה-API
      const realData = await stockService.fetchScannerStockData(stock.symbol);
      if (realData) {
        const priceToMA150 = ((realData.price - realData.movingAverage150) / realData.movingAverage150) * 100;
        const scanned: ScannedStock = {
          symbol: stock.symbol,
          name: realData.name,
          price: realData.price,
          marketCap: realData.marketCap,
          movingAverage150: realData.movingAverage150,
          sector: realData.sector,
          priceToMA150: Math.round(priceToMA150 * 100) / 100,
        };
        // קריטריונים: מחיר בטווח 5% מהממוצע נע 150, שווי שוק מעל מיליארד דולר
        if (Math.abs(scanned.priceToMA150) <= 5 && scanned.marketCap >= 1000000000) {
          results.push(scanned);
        }
      }
      setTotalScanned(i + 1);
      setScanProgress(((i + 1) / totalStocks) * 100);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    setScannedStocks(results);
    setLastUpdated(new Date());
    setIsLoading(false);
    setIsScanning(false);
  };

  const handleAddToPortfolio = async (stock: ScannedStock) => {
    try {
      const newStock = await stockService.addStock({
        ticker: stock.symbol,
        name: stock.name,
        quantity: 1,
        purchasePrice: stock.price,
        purchaseDate: new Date().toISOString().split('T')[0]
      });
      
      // Show success message (in real app you'd use a toast notification)
      alert(`המניה ${stock.symbol} נוספה לתיק בהצלחה!`);
    } catch (error) {
      alert(`שגיאה בהוספת המניה: ${error}`);
    }
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000000) {
      return `$${(marketCap / 1000000000000).toFixed(1)}T`;
    } else if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(1)}B`;
    } else {
      return `$${(marketCap / 1000000).toFixed(1)}M`;
    }
  };

  const getPriceToMAColor = (priceToMA: number) => {
    if (Math.abs(priceToMA) <= 2) return 'text-green-600';
    if (Math.abs(priceToMA) <= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  useEffect(() => {
    // Auto-scan on component mount
    scanStocks();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">סורק מניות S&P 500</h2>
          <p className="text-gray-600">
            סורק את כל מניות ה-S&P 500 לפי קריטריונים: מחיר קרוב לממוצע נע 150 יום, שווי שוק מעל מיליארד דולר
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              עודכן לאחרונה: {lastUpdated.toLocaleString('he-IL')}
            </span>
          )}
          
          <button
            onClick={scanStocks}
            disabled={isScanning}
            className={`px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
              isScanning
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isScanning ? 'סורק...' : 'סרוק S&P 500'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {isScanning && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">מתקדם בסריקה...</span>
            <span className="text-sm text-gray-500">{totalScanned} / {SP500_STOCKS.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="mb-4">
            <span className="text-sm text-gray-600">
              נמצאו {scannedStocks.length} מניות שעומדות בקריטריונים מתוך {SP500_STOCKS.length} מניות ב-S&P 500
            </span>
          </div>
          
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  סמל
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  שם החברה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  מחיר
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  שווי שוק
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ממוצע נע 150
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % מהממוצע
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  סקטור
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scannedStocks.map((stock) => (
                <tr key={stock.symbol} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{stock.symbol}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{stock.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">${stock.price.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{formatMarketCap(stock.marketCap)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">${stock.movingAverage150.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getPriceToMAColor(stock.priceToMA150)}`}>
                      {stock.priceToMA150 > 0 ? '+' : ''}{stock.priceToMA150.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{stock.sector}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleAddToPortfolio(stock)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      הוסף לתיק
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {scannedStocks.length === 0 && !isScanning && (
            <div className="text-center py-8">
              <p className="text-gray-500">לא נמצאו מניות שעומדות בקריטריונים</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-medium text-blue-800 mb-2">קריטריונים לסריקה:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• סורק את כל {SP500_STOCKS.length} מניות ה-S&P 500</li>
          <li>• מחיר בטווח של 5% מהממוצע נע 150 יום</li>
          <li>• שווי שוק מעל מיליארד דולר</li>
          <li>• עדכון אוטומטי עם תאריך ושעה</li>
          <li>• הוספה מהירה לתיק המניות</li>
        </ul>
      </div>
    </div>
  );
}; 