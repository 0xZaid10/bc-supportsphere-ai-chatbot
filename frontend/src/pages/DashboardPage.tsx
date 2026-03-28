import React, { useState, useEffect } from 'react';
import useApiClient from '../hooks/useApiClient';
import { DashboardStats } from '../types';
import TicketVolumeChart from '../components/dashboard/TicketVolumeChart';
import ClassificationPieChart from '../components/dashboard/ClassificationPieChart';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Don't set loading to true on subsequent fetches to avoid UI flicker
        if (!stats) {
            setLoading(true);
        }
        setError(null);
        const data = await apiClient.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError('Failed to fetch dashboard statistics. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Set up an interval to refresh the data every 30 seconds
    const intervalId = setInterval(fetchStats, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [apiClient, stats]);

  const StatCard: React.FC<{ title: string; value: string | number; className?: string }> = ({ title, value, className }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
      <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  );

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="p-8 text-center text-red-700 bg-red-100 border border-red-400 rounded-lg">
          <h2 className="text-2xl font-bold">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">No data available.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-100 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">AI Support Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Real-time insights into customer support interactions.</p>
        </header>

        <main>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Total Tickets" value={stats.totalTickets} />
            <StatCard title="English Tickets" value={stats.ticketsByLanguage.en} />
            <StatCard title="Spanish Tickets" value={stats.ticketsByLanguage.es} />
          </div>

          {/* Charts */}
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Tickets by Category</h2>
              <div className="h-80">
                <TicketVolumeChart data={stats.ticketsByCategory} />
              </div>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Tickets by Language</h2>
              <div className="h-80">
                <ClassificationPieChart data={stats.ticketsByLanguage} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;