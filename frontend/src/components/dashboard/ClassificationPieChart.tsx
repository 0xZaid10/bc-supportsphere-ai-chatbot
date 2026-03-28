import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ClassificationPieChartProps {
  data: {
    [key: string]: number;
  };
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

const formatLabel = (label: string): string => {
  return label
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ClassificationPieChart: React.FC<ClassificationPieChartProps> = ({ data }) => {
  const chartData = React.useMemo(() => {
    if (!data) return [];
    return Object.entries(data).map(([name, value]) => ({
      name: formatLabel(name),
      value,
    }));
  }, [data]);

  const totalTickets = React.useMemo(() => {
    return chartData.reduce((sum, entry) => sum + entry.value, 0);
  }, [chartData]);

  if (totalTickets === 0) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md h-full flex flex-col justify-center items-center text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Tickets by Classification</h3>
        <p className="text-gray-500">No classification data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md h-full">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center md:text-left">Tickets by Classification</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
              if (percent === 0) return null;
              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
              const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
              const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
              return (
                <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                  {`${(percent * 100).toFixed(0)}%`}
                </text>
              );
            }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value} tickets`, 'Count']} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClassificationPieChart;