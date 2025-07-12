export interface Stock {
  id: string;
  ticker: string;
  name: string;
  purchaseDate: string;
  purchasePrice: number;
  quantity: number;
  category?: StockCategory;
  isActive: boolean;
}

export interface SoldStock extends Stock {
  sellDate: string;
  sellPrice: number;
  totalProfit: number;
  profitPercentage: number;
  holdingDays: number;
  learning?: string;
}

export type StockCategory = 'טכנולוגיה' | 'פיננסים' | 'אנרגיה' | 'בריאות' | 'תעשייה' | 'צריכה' | 'אחר' | 'לא ידוע';

export interface StockPrice {
  ticker: string;
  currentPrice: number;
  change: number;
  changePercent: number;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalProfit: number;
  totalProfitPercentage: number;
  activeStocks: number;
  soldStocks: number;
} 