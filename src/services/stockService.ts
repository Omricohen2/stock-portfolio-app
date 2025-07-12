import { Stock, SoldStock, StockPrice, PortfolioSummary, StockCategory } from '../types';

const STORAGE_KEY = 'stock-portfolio-data';

// Mock stock prices - in real app, this would come from API
const mockStockPrices: Record<string, StockPrice> = {
  'AAPL': { ticker: 'AAPL', currentPrice: 175.50, change: 2.30, changePercent: 1.33 },
  'GOOGL': { ticker: 'GOOGL', currentPrice: 142.80, change: -1.20, changePercent: -0.83 },
  'MSFT': { ticker: 'MSFT', currentPrice: 380.25, change: 5.75, changePercent: 1.54 },
  'TSLA': { ticker: 'TSLA', currentPrice: 245.90, change: -8.10, changePercent: -3.19 },
  'NVDA': { ticker: 'NVDA', currentPrice: 485.75, change: 12.25, changePercent: 2.59 },
  'AMZN': { ticker: 'AMZN', currentPrice: 155.40, change: 3.60, changePercent: 2.37 },
  'META': { ticker: 'META', currentPrice: 320.15, change: -2.85, changePercent: -0.88 },
  'NFLX': { ticker: 'NFLX', currentPrice: 485.30, change: 8.70, changePercent: 1.82 },
  'JPM': { ticker: 'JPM', currentPrice: 165.80, change: 1.20, changePercent: 0.73 },
  'JNJ': { ticker: 'JNJ', currentPrice: 155.90, change: -0.40, changePercent: -0.26 },
};

export const stockService = {
  // Get all stocks from localStorage
  getStocks(): Stock[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Get sold stocks from localStorage
  getSoldStocks(): SoldStock[] {
    const data = localStorage.getItem(STORAGE_KEY + '-sold');
    return data ? JSON.parse(data) : [];
  },

  // Save stocks to localStorage
  saveStocks(stocks: Stock[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stocks));
  },

  // Save sold stocks to localStorage
  saveSoldStocks(soldStocks: SoldStock[]): void {
    localStorage.setItem(STORAGE_KEY + '-sold', JSON.stringify(soldStocks));
  },

  // Fetch sector/category from Yahoo Finance
  async fetchCategory(ticker: string): Promise<StockCategory> {
    try {
      const response = await fetch(`https://corsproxy.io/?https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=assetProfile`);
      const data = await response.json();
      const profile = data.quoteSummary?.result?.[0]?.assetProfile;
      if (profile?.sector) return profile.sector as StockCategory;
      if (profile?.industry) {
        const industry = profile.industry.toLowerCase();
        if (industry.includes('software') || industry.includes('semiconductor') || industry.includes('technology')) return 'טכנולוגיה';
        if (industry.includes('bank') || industry.includes('finance') || industry.includes('insurance')) return 'פיננסים';
        if (industry.includes('energy') || industry.includes('oil') || industry.includes('gas')) return 'אנרגיה';
        if (industry.includes('health') || industry.includes('biotech') || industry.includes('pharma')) return 'בריאות';
        if (industry.includes('industrial') || industry.includes('manufacturing')) return 'תעשייה';
        if (industry.includes('consumer')) return 'צריכה';
      }
      return 'לא ידוע';
    } catch {
      return 'לא ידוע';
    }
  },

  // Add new stock (with auto category)
  async addStock(stock: Omit<Stock, 'id' | 'isActive' | 'category'>): Promise<Stock> {
    const stocks = this.getStocks();
    const category = await this.fetchCategory(stock.ticker);
    const newStock: Stock = {
      ...stock,
      id: Date.now().toString(),
      isActive: true,
      category,
    };
    stocks.push(newStock);
    this.saveStocks(stocks);
    return newStock;
  },

  // Sell stock
  sellStock(stockId: string, sellDate: string, sellPrice: number): SoldStock | null {
    const stocks = this.getStocks();
    const soldStocks = this.getSoldStocks();
    
    const stockIndex = stocks.findIndex(s => s.id === stockId);
    if (stockIndex === -1) return null;

    const stock = stocks[stockIndex];
    const purchaseDate = new Date(stock.purchaseDate);
    const sellDateObj = new Date(sellDate);
    const holdingDays = Math.floor((sellDateObj.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const totalProfit = (sellPrice - stock.purchasePrice) * stock.quantity;
    const profitPercentage = ((sellPrice - stock.purchasePrice) / stock.purchasePrice) * 100;

    const soldStock: SoldStock = {
      ...stock,
      isActive: false,
      sellDate,
      sellPrice,
      totalProfit,
      profitPercentage,
      holdingDays,
    };

    // Remove from active stocks and add to sold stocks
    stocks.splice(stockIndex, 1);
    soldStocks.push(soldStock);
    
    this.saveStocks(stocks);
    this.saveSoldStocks(soldStocks);
    
    return soldStock;
  },

  // Get current stock price (from Yahoo Finance, with cache)
  async getCurrentPrice(ticker: string): Promise<StockPrice | null> {
    const cacheKey = `stock-price-cache-${ticker}`;
    const cache = localStorage.getItem(cacheKey);
    if (cache) {
      const { price, timestamp } = JSON.parse(cache);
      if (Date.now() - timestamp < 10 * 60 * 1000) {
        return price;
      }
    }
    try {
      // Fetch daily close price for last 3 months, take the last available close
      const url = `https://corsproxy.io/?https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=3mo`;
      const response = await fetch(url);
      const data = await response.json();
      const result = data.chart?.result?.[0];
      if (!result) return null;
      const closes = result.indicators.quote[0].close;
      const lastClose = closes[closes.length - 1];
      const prevClose = closes[closes.length - 2] || lastClose;
      const change = lastClose - prevClose;
      const changePercent = (change / prevClose) * 100;
      const stockPrice: StockPrice = {
        ticker,
        currentPrice: lastClose,
        change,
        changePercent,
      };
      localStorage.setItem(cacheKey, JSON.stringify({ price: stockPrice, timestamp: Date.now() }));
      return stockPrice;
    } catch (error) {
      return null;
    }
  },

  // Get portfolio summary (async)
  async getPortfolioSummary(): Promise<PortfolioSummary> {
    const activeStocks = this.getStocks();
    const soldStocks = this.getSoldStocks();
    
    let totalInvested = 0;
    let currentValue = 0;
    let totalProfit = 0;

    // Calculate active stocks
    for (const stock of activeStocks) {
      const invested = stock.purchasePrice * stock.quantity;
      totalInvested += invested;
      
      const currentPrice = await this.getCurrentPrice(stock.ticker);
      if (currentPrice) {
        const currentStockValue = currentPrice.currentPrice * stock.quantity;
        currentValue += currentStockValue;
        totalProfit += currentStockValue - invested;
      }
    }

    // Add sold stocks profit
    soldStocks.forEach(stock => {
      totalProfit += stock.totalProfit;
    });

    const totalProfitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    return {
      totalInvested,
      currentValue,
      totalProfit,
      totalProfitPercentage,
      activeStocks: activeStocks.length,
      soldStocks: soldStocks.length,
    };
  },

  // Update mock prices (simulate market changes)
  updateMockPrices(): void {
    Object.keys(mockStockPrices).forEach(ticker => {
      const price = mockStockPrices[ticker];
      const change = (Math.random() - 0.5) * 10; // Random change between -5 and +5
      price.currentPrice = Math.max(0, price.currentPrice + change);
      price.change = change;
      price.changePercent = (change / (price.currentPrice - change)) * 100;
    });
  },

  // Delete stock by id
  deleteStock(stockId: string): void {
    const stocks = this.getStocks();
    const filtered = stocks.filter(s => s.id !== stockId);
    this.saveStocks(filtered);
  },

  // Delete sold stock by id
  deleteSoldStock(stockId: string): void {
    const soldStocks = this.getSoldStocks();
    const filtered = soldStocks.filter(s => s.id !== stockId);
    this.saveSoldStocks(filtered);
  },

  // Update learning for sold stock
  updateSoldLearning(stockId: string, learning: string): void {
    const soldStocks = this.getSoldStocks();
    const idx = soldStocks.findIndex(s => s.id === stockId);
    if (idx !== -1) {
      soldStocks[idx].learning = learning;
      this.saveSoldStocks(soldStocks);
    }
  },
}; 