import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface StockChartProps {
  ticker: string;
}

interface ChartPoint {
  date: string;
  close: number;
}

export const StockChart: React.FC<StockChartProps> = ({ ticker }) => {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Yahoo Finance API (daily, last 3 months)
        const now = Math.floor(Date.now() / 1000);
        const threeMonthsAgo = now - 60 * 60 * 24 * 90;
        const url = `https://corsproxy.io/?https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=3mo`;
        const response = await fetch(url);
        const json = await response.json();
        const result = json.chart?.result?.[0];
        if (!result) throw new Error('No data');
        const timestamps = result.timestamp;
        const closes = result.indicators.quote[0].close;
        const points: ChartPoint[] = timestamps.map((ts: number, i: number) => ({
          date: new Date(ts * 1000).toLocaleDateString('he-IL'),
          close: closes[i],
        })).filter((p: ChartPoint) => !!p.close);
        setData(points);
      } catch (e) {
        setError('שגיאה בטעינת נתוני הגרף');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ticker]);

  // חישוב המלצת STOPLOSS: 5% מתחת למינימום ב-30 ימים אחרונים
  const stopLoss = React.useMemo(() => {
    if (!data.length) return null;
    const last30 = data.slice(-30);
    const minClose = Math.min(...last30.map(p => p.close));
    return (minClose * 0.95).toFixed(2);
  }, [data]);

  if (loading) return <div className="text-center p-8">טוען גרף...</div>;
  if (error) return <div className="text-center text-red-600 p-8">{error}</div>;
  if (!data.length) return <div className="text-center text-gray-500 p-8">אין נתונים להצגה</div>;

  return (
    <>
      {stopLoss && (
        <div className="mb-4 text-center">
          <span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-bold">
            המלצת STOPLOSS: ${stopLoss}
          </span>
          <div className="text-xs text-gray-500 mt-1">(5% מתחת לשפל 30 הימים האחרונים)</div>
        </div>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" minTickGap={20} />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip formatter={(value) => `$${value}`} />
          <Line type="monotone" dataKey="close" stroke="#2563eb" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}; 