import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TicketVolumeChartProps {
  data: {
    technical_issue: number;
    billing_inquiry: number;
    general_question: number;
  };
}

const TicketVolumeChart: React.FC<TicketVolumeChartProps> = ({ data }) => {
  const chartData = [
    { name: 'Technical', count: data.technical_issue || 0 },
    { name: 'Billing', count: data.billing_inquiry || 0 },
    { name: 'General', count: data.general_question || 0 },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Ticket Volume by Category</h3>
      <div className="flex-grow min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 20,
              left: -10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
            <Bar dataKey="count" name="Tickets" fill="#4f46e5" barSize={40} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TicketVolumeChart;