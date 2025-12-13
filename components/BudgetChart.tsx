import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BudgetBreakdown } from '../types';

interface BudgetChartProps {
  budget: BudgetBreakdown;
  isDarkMode?: boolean; 
}

// Neo Pop Palette
const COLORS = [
  '#FF90E8', // Pink
  '#B0FF90', // Green
  '#FFCE63', // Yellow
  '#90F2FF', // Blue
  '#E0B0FF'  // Purple
];

const BudgetChart: React.FC<BudgetChartProps> = ({ budget, isDarkMode = false }) => {
  const data = [
    { name: 'Stay', value: budget.accommodation },
    { name: 'Food', value: budget.food },
    { name: 'Fun', value: budget.activities },
    { name: 'Move', value: budget.transport },
    { name: 'Misc', value: budget.misc },
  ].filter(item => item.value > 0);

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      // Calculate total based on displayed data for accurate chart percentage
      const totalDisplayed = data.reduce((sum, entry) => sum + entry.value, 0);
      const percent = totalDisplayed > 0 
        ? ((item.value / totalDisplayed) * 100).toFixed(1)
        : '0.0';
      
      return (
        <div className="bg-white dark:bg-neo-darkgray border-3 border-neo-black dark:border-neo-white shadow-neo-sm dark:shadow-neo-sm-white p-3 min-w-[160px] text-neo-black dark:text-neo-white z-50">
          <p className="font-black uppercase text-sm mb-2 border-b-2 border-neo-black dark:border-neo-white pb-1 tracking-wide">{item.name}</p>
          <div className="flex flex-col gap-2">
             <div className="flex justify-between items-center gap-4">
                <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Amount</span>
                <span className="font-mono font-bold text-sm">{budget.currency} {item.value.toLocaleString()}</span>
             </div>
             <div className="flex justify-between items-center gap-4">
                <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Share</span>
                <span className="font-black text-xs bg-neo-yellow text-neo-black px-1.5 py-0.5 border border-neo-black dark:border-neo-white shadow-[1px_1px_0px_0px_#000] dark:shadow-[1px_1px_0px_0px_#FFF]">{percent}%</span>
             </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              stroke={isDarkMode ? '#FFFFFF' : '#000000'}
              strokeWidth={3}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} cursor={false} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center bg-neo-black dark:bg-neo-white text-white dark:text-neo-black p-2 rounded-full w-20 h-20 flex flex-col items-center justify-center border-3 border-neo-white dark:border-neo-black shadow-lg z-10">
                <span className="text-[10px] font-bold uppercase leading-none mb-1">Total</span>
                <span className="text-xs font-mono font-bold">{budget.currency}</span>
            </div>
        </div>
    </div>
  );
};

export default BudgetChart;