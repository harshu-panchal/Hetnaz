import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../types/material-symbol';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';
import type { EarningsBreakdown } from '../types/female.types';

// Mock data - replace with actual API calls
const mockEarningsBreakdown: EarningsBreakdown[] = [
  { date: '2024-01-15', amount: 500, source: 'message', fromUserId: '1', fromUserName: 'Alex' },
  { date: '2024-01-15', amount: 500, source: 'video_call', fromUserId: '2', fromUserName: 'Michael' },
  { date: '2024-01-14', amount: 500, source: 'message', fromUserId: '3', fromUserName: 'David' },
  { date: '2024-01-14', amount: 500, source: 'message', fromUserId: '1', fromUserName: 'Alex' },
  { date: '2024-01-13', amount: 300, source: 'message', fromUserId: '2', fromUserName: 'Michael' },
  { date: '2024-01-12', amount: 800, source: 'video_call', fromUserId: '1', fromUserName: 'Alex' },
  { date: '2024-01-11', amount: 400, source: 'message', fromUserId: '3', fromUserName: 'David' },
];

// Helper function to aggregate earnings by date
const aggregateEarningsByDate = (breakdown: EarningsBreakdown[]) => {
  const aggregated: Record<string, number> = {};
  breakdown.forEach((earning) => {
    const date = earning.date;
    aggregated[date] = (aggregated[date] || 0) + earning.amount;
  });
  return aggregated;
};

// Helper function to get chart data for selected period
const getChartData = (breakdown: EarningsBreakdown[], period: 'daily' | 'weekly' | 'monthly') => {
  const aggregated = aggregateEarningsByDate(breakdown);
  const dates = Object.keys(aggregated).sort();
  
  if (period === 'daily') {
    return dates.slice(-7).map((date) => ({
      date,
      amount: aggregated[date],
      label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  } else if (period === 'weekly') {
    // Group by week
    const weeklyData: Record<string, number> = {};
    dates.forEach((date) => {
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + aggregated[date];
    });
    return Object.keys(weeklyData)
      .sort()
      .slice(-4)
      .map((weekKey) => ({
        date: weekKey,
        amount: weeklyData[weekKey],
        label: `Week ${new Date(weekKey).getWeek()}`,
      }));
  } else {
    // Monthly
    const monthlyData: Record<string, number> = {};
    dates.forEach((date) => {
      const monthKey = date.substring(0, 7); // YYYY-MM
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + aggregated[date];
    });
    return Object.keys(monthlyData)
      .sort()
      .slice(-6)
      .map((monthKey) => ({
        date: monthKey,
        amount: monthlyData[monthKey],
        label: new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'short' }),
      }));
  }
};

const navigationItems = [
  { id: 'dashboard', icon: 'home', label: 'Home' },
  { id: 'chats', icon: 'chat_bubble', label: 'Chats' },
  { id: 'earnings', icon: 'account_balance_wallet', label: 'Earnings', isActive: true },
  { id: 'profile', icon: 'person', label: 'Profile' },
];

export const EarningsPage = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const totalEarnings = 15250;
  const availableBalance = 12450;

  const handleNavigationClick = (itemId: string) => {
    switch (itemId) {
      case 'dashboard':
        navigate('/female/dashboard');
        break;
      case 'chats':
        navigate('/female/chats');
        break;
      case 'earnings':
        navigate('/female/earnings');
        break;
      case 'profile':
        navigate('/female/my-profile');
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 dark:bg-[#342d18] text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-[#4b202e] transition-colors active:scale-95"
          >
            <MaterialSymbol name="arrow_back" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Earnings</h1>
        </div>
      </header>

      {/* Earnings Summary */}
      <div className="px-6 py-4 space-y-4">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/10 dark:to-primary/5 rounded-xl p-6 border border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-600 dark:text-[#cbbc90]">Total Earnings</span>
            <MaterialSymbol name="trending_up" className="text-primary" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {totalEarnings.toLocaleString()} coins
          </p>
          <p className="text-sm text-slate-500 dark:text-[#cbbc90]">
            Available: {availableBalance.toLocaleString()} coins
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-primary text-slate-900'
                  : 'bg-gray-200 dark:bg-[#342d18] text-gray-700 dark:text-white'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="px-6 py-4">
        <div className="bg-white dark:bg-[#342d18] rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Earnings Trend</h3>
          <EarningsChart data={getChartData(mockEarningsBreakdown, selectedPeriod)} />
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className="flex-1 overflow-y-auto px-6 min-h-0">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Earnings History</h2>
        <div className="space-y-3">
          {mockEarningsBreakdown.map((earning, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white dark:bg-[#342d18] rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600">
                  <MaterialSymbol
                    name={earning.source === 'video_call' ? 'videocam' : 'mail'}
                    filled
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {earning.source === 'video_call' ? 'Video Call' : 'Message'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-[#cbbc90]">
                    {earning.fromUserName} • {new Date(earning.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                +{earning.amount}
              </p>
            </div>
          ))}
        </div>
      </div>

      <FemaleBottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};

// Earnings Chart Component
interface ChartDataPoint {
  date: string;
  amount: number;
  label: string;
}

interface EarningsChartProps {
  data: ChartDataPoint[];
}

const EarningsChart = ({ data }: EarningsChartProps) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600">
        <p>No data available</p>
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amount));
  const chartHeight = 200;
  const barWidth = Math.max(40, (100 / data.length) - 2);

  return (
    <div className="relative">
      <svg width="100%" height={chartHeight} className="overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            y1={chartHeight * ratio}
            x2="100%"
            y2={chartHeight * ratio}
            stroke="currentColor"
            strokeWidth="1"
            className="text-gray-200 dark:text-gray-700"
            strokeDasharray="4 4"
          />
        ))}

        {/* Bars */}
        {data.map((point, index) => {
          const barHeight = maxAmount > 0 ? (point.amount / maxAmount) * chartHeight * 0.9 : 0;
          const x = (index / data.length) * 100;
          const y = chartHeight - barHeight;

          return (
            <g key={point.date}>
              <rect
                x={`${x}%`}
                y={y}
                width={`${barWidth}%`}
                height={barHeight}
                fill="currentColor"
                className="text-primary"
                rx="4"
              />
              {/* Amount label on top of bar */}
              {barHeight > 20 && (
                <text
                  x={`${x + barWidth / 2}%`}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-gray-700 dark:fill-gray-300"
                >
                  {point.amount}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 px-2">
        {data.map((point) => (
          <span
            key={point.date}
            className="text-xs text-gray-500 dark:text-[#cbbc90] text-center"
            style={{ width: `${barWidth}%` }}
          >
            {point.label}
          </span>
        ))}
      </div>

      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 dark:text-[#cbbc90] pr-2">
        <span>{maxAmount}</span>
        <span>{Math.round(maxAmount * 0.75)}</span>
        <span>{Math.round(maxAmount * 0.5)}</span>
        <span>{Math.round(maxAmount * 0.25)}</span>
        <span>0</span>
      </div>
    </div>
  );
};

