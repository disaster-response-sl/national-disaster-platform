import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { StatisticsPanelProps } from '../../types/map';
import { getTypeColor, getStatusColor, getPriorityColor } from '../../utils/mapHelpers';

const StatisticsPanel = ({
  statistics,
  loading = false,
  className = '',
}: StatisticsPanelProps) => {
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Prepare chart data
  const typeData = statistics.byType.map(item => ({
    name: item._id,
    value: item.count,
    fill: getTypeColor(item._id),
  }));

  const statusData = statistics.byStatus.map(item => ({
    name: item._id,
    value: item.count,
    fill: getStatusColor(item._id),
  }));

  const priorityData = statistics.byPriority.map(item => ({
    name: `Priority ${item._id}`,
    value: item.count,
    fill: getPriorityColor(parseInt(item._id)),
  }));

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Dashboard Statistics</h3>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {statistics.totalReports?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-blue-700">Total Reports</div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {statistics.totalAffected?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-red-700">People Affected</div>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {/* By Type Chart */}
        {typeData.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Reports by Type</h4>
            <ResponsiveContainer width="100%" height={200} {...({} as any)}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* By Status Pie Chart */}
        {statusData.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Reports by Status</h4>
            <ResponsiveContainer width="100%" height={200} {...({} as any)}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* By Priority */}
        {priorityData.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Reports by Priority</h4>
            <div className="space-y-2">
              {priorityData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: item.fill }}
                    ></div>
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsPanel;
