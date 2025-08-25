import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GenerateReportModal: React.FC<GenerateReportModalProps> = ({
  isOpen,
  onClose
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    type: 'summary',
    format: 'pdf',
    dateRange: 'last_30_days',
    customStartDate: '',
    customEndDate: '',
    filters: {
      status: '',
      type: '',
      category: '',
      priority: '',
      location: ''
    },
    includeCharts: true,
    includeDetails: true
  });

  const reportTypes = [
    { value: 'summary', label: 'Resource Summary Report', description: 'Overview of all resources and their status' },
    { value: 'allocation', label: 'Allocation Report', description: 'Resource allocation history and current deployments' },
    { value: 'inventory', label: 'Inventory Report', description: 'Detailed inventory status and availability' },
    { value: 'usage', label: 'Usage Analytics', description: 'Resource usage patterns and trends' },
    { value: 'vendor', label: 'Vendor Report', description: 'Vendor performance and resource sourcing' },
    { value: 'disaster', label: 'Disaster Response Report', description: 'Resources allocated per disaster event' }
  ];

  const dateRanges = [
    { value: 'last_7_days', label: 'Last 7 days' },
    { value: 'last_30_days', label: 'Last 30 days' },
    { value: 'last_90_days', label: 'Last 90 days' },
    { value: 'this_month', label: 'This month' },
    { value: 'last_month', label: 'Last month' },
    { value: 'this_year', label: 'This year' },
    { value: 'custom', label: 'Custom date range' }
  ];

  const handleConfigChange = (field: string, value: any) => {
    setReportConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleFilterChange = (field: string, value: string) => {
    setReportConfig(prev => ({
      ...prev,
      filters: { ...prev.filters, [field]: value }
    }));
  };

  const generateReport = async () => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

      const reportData = {
        title: `Resource ${reportConfig.type.charAt(0).toUpperCase() + reportConfig.type.slice(1)} Report`,
        generatedAt: new Date().toISOString(),
        dateRange: reportConfig.dateRange,
        filters: reportConfig.filters,
        includeCharts: reportConfig.includeCharts,
        includeDetails: reportConfig.includeDetails
      };

      let fileName = `resource_${reportConfig.type}_report_${new Date().toISOString().split('T')[0]}`;

      if (reportConfig.format === 'pdf') {
        // Use jsPDF to generate a real PDF
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(reportData.title, 10, 20);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date(reportData.generatedAt).toLocaleString()}`, 10, 30);
        doc.text(`Date Range: ${reportData.dateRange}`, 10, 36);
        doc.text('Report Configuration:', 10, 46);
        doc.text(`- Type: ${reportConfig.type}`, 12, 52);
        doc.text(`- Format: ${reportConfig.format}`, 12, 58);
        doc.text(`- Include Charts: ${reportConfig.includeCharts ? 'Yes' : 'No'}`, 12, 64);
        doc.text(`- Include Details: ${reportConfig.includeDetails ? 'Yes' : 'No'}`, 12, 70);
        doc.text('Applied Filters:', 10, 80);
        let y = 86;
        Object.entries(reportConfig.filters)
          .filter(([_, value]) => value !== '')
          .forEach(([key, value]) => {
            doc.text(`- ${key}: ${value}`, 12, y);
            y += 6;
          });
        doc.text('Sample Resource Data:', 10, y + 6);
        doc.text('1. Emergency Medical Kit - Medical Equipment (45 available)', 12, y + 12);
        doc.text('2. Water Purification Tablets - Water Consumable (800 available)', 12, y + 18);
        doc.text('3. Emergency Tents - Shelter Equipment (20 available)', 12, y + 24);
        doc.text('4. Emergency Food Packets - Food Consumable (350 available)', 12, y + 30);
        doc.text('5. Rescue Boats - Transportation Equipment (6 available)', 12, y + 36);
        doc.text('Note: This is a demonstration report. In a production environment, this would contain real data from the resource management system.', 10, y + 48, { maxWidth: 180 });
        doc.save(`${fileName}.pdf`);
      } else {
        // CSV or Excel (mock)
        const content = generateMockReportContent(reportData);
        const blob = new Blob([content], {
          type:
            reportConfig.format === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'text/csv',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.${reportConfig.format === 'excel' ? 'xlsx' : reportConfig.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      toast.success('Report generated and downloaded successfully');
      onClose();
    } catch (err) {
      console.error('Failed to generate report:', err);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const generateMockReportContent = (reportData: any) => {
    if (reportConfig.format === 'csv') {
      return `Report Type,${reportData.title}
Generated At,${new Date(reportData.generatedAt).toLocaleString()}
Date Range,${reportData.dateRange}

Resource Name,Type,Category,Status,Priority,Available Quantity,Location
Emergency Medical Kit,medical,equipment,available,high,45,"Dhaka Medical College Hospital"
Water Purification Tablets,water,consumable,available,critical,800,"Chittagong Port Area"
Emergency Tents,shelter,equipment,available,high,20,"Rajshahi Division HQ"
Emergency Food Packets,food,consumable,available,medium,350,"Khulna District Relief Office"
Rescue Boats,transportation,equipment,available,critical,6,"Barisal River Port"`;
    }

    return `${reportData.title}
Generated: ${new Date(reportData.generatedAt).toLocaleString()}
Date Range: ${reportData.dateRange}

This is a mock ${reportConfig.format.toUpperCase()} report for demonstration purposes.

Report Configuration:
- Type: ${reportConfig.type}
- Format: ${reportConfig.format}
- Include Charts: ${reportConfig.includeCharts ? 'Yes' : 'No'}
- Include Details: ${reportConfig.includeDetails ? 'Yes' : 'No'}

Applied Filters:
${Object.entries(reportConfig.filters)
  .filter(([_, value]) => value !== '')
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}

Sample Resource Data:
1. Emergency Medical Kit - Medical Equipment (45 available)
2. Water Purification Tablets - Water Consumable (800 available)
3. Emergency Tents - Shelter Equipment (20 available)
4. Emergency Food Packets - Food Consumable (350 available)
5. Rescue Boats - Transportation Equipment (6 available)

Note: This is a demonstration report. In a production environment, 
this would contain real data from the resource management system.`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Generate Resource Report</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Report Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reportTypes.map((type) => (
                <div
                  key={type.value}
                  onClick={() => handleConfigChange('type', type.value)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    reportConfig.type === type.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{type.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={reportConfig.dateRange}
              onChange={(e) => handleConfigChange('dateRange', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {dateRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>

            {reportConfig.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={reportConfig.customStartDate}
                    onChange={(e) => handleConfigChange('customStartDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={reportConfig.customEndDate}
                    onChange={(e) => handleConfigChange('customEndDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Filters (Optional)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={reportConfig.filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">All</option>
                  <option value="available">Available</option>
                  <option value="allocated">Allocated</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={reportConfig.filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">All</option>
                  <option value="medical">Medical</option>
                  <option value="food">Food</option>
                  <option value="shelter">Shelter</option>
                  <option value="water">Water</option>
                  <option value="transportation">Transportation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={reportConfig.filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Format and Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <div className="space-y-2">
                {['pdf', 'excel', 'csv'].map((format) => (
                  <label key={format} className="flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value={format}
                      checked={reportConfig.format === format}
                      onChange={(e) => handleConfigChange('format', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{format}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Include Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeCharts}
                    onChange={(e) => handleConfigChange('includeCharts', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Include charts and graphs</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeDetails}
                    onChange={(e) => handleConfigChange('includeDetails', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Include detailed data</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={generateReport}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateReportModal;
