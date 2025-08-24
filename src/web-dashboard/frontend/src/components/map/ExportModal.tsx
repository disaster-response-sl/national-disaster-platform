import React, { useState } from 'react';
import { X, Download, FileText, Table, File, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ExportService } from '../../utils/exportHelpers';
import type { Report, Disaster, ResourceAnalysis, MapStatistics } from '../../types/map';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    reports: Report[];
    disasters: Disaster[];
    resourceAnalysis: ResourceAnalysis[];
    statistics: MapStatistics | null;
    filters?: any;
  };
}

type ExportFormat = 'pdf' | 'excel' | 'csv';

const ExportModal = ({
  isOpen,
  onClose,
  data,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [exportOptions, setExportOptions] = useState({
    includeReports: true,
    includeDisasters: true,
    includeResources: true,
    includeStatistics: true,
    includeFilters: true,
    filename: 'disaster-report',
  });
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const formatOptions = [
    {
      id: 'pdf' as ExportFormat,
      name: 'PDF Report',
      description: 'Formatted report with tables and charts',
      icon: <FileText className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      id: 'excel' as ExportFormat,
      name: 'Excel Workbook',
      description: 'Spreadsheet with multiple sheets',
      icon: <Table className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'csv' as ExportFormat,
      name: 'CSV File',
      description: 'Comma-separated values for reports',
      icon: <File className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  const getDataCounts = () => {
    return {
      reports: data.reports.length,
      disasters: data.disasters.length,
      resources: data.resourceAnalysis.length,
    };
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const exportData = {
        ...(exportOptions.includeReports && { reports: data.reports }),
        ...(exportOptions.includeDisasters && { disasters: data.disasters }),
        ...(exportOptions.includeResources && { resourceAnalysis: data.resourceAnalysis }),
        ...(exportOptions.includeStatistics && data.statistics && { statistics: data.statistics }),
        ...(exportOptions.includeFilters && { filters: data.filters }),
      };

      await ExportService.exportFilteredData(selectedFormat, exportData, {
        filename: exportOptions.filename,
        includeFilters: exportOptions.includeFilters,
      });

      toast.success(`${selectedFormat.toUpperCase()} export completed successfully!`, {
        icon: '📄',
        duration: 4000,
      });
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.', {
        icon: '❌',
        duration: 4000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const counts = getDataCounts();
  const hasData = counts.reports > 0 || counts.disasters > 0 || counts.resources > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Download className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Export Data</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!hasData ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Data Available
              </h3>
              <p className="text-gray-600">
                There is no data to export. Please ensure there are reports, disasters, or resources loaded.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Data Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Available Data</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{counts.reports}</div>
                    <div className="text-sm text-gray-600">Reports</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{counts.disasters}</div>
                    <div className="text-sm text-gray-600">Disasters</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{counts.resources}</div>
                    <div className="text-sm text-gray-600">Resource Areas</div>
                  </div>
                </div>
              </div>

              {/* Format Selection */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Export Format</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {formatOptions.map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedFormat === format.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`${format.bgColor} p-2 rounded w-fit mb-2`}>
                        <div className={format.color}>{format.icon}</div>
                      </div>
                      <div className="font-medium text-gray-900">{format.name}</div>
                      <div className="text-sm text-gray-600">{format.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Export Options */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Export Options</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeReports}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeReports: e.target.checked }))}
                      className="rounded mr-3"
                      disabled={counts.reports === 0}
                    />
                    <span className={counts.reports === 0 ? 'text-gray-400' : 'text-gray-700'}>
                      Include Reports ({counts.reports})
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeDisasters}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeDisasters: e.target.checked }))}
                      className="rounded mr-3"
                      disabled={counts.disasters === 0}
                    />
                    <span className={counts.disasters === 0 ? 'text-gray-400' : 'text-gray-700'}>
                      Include Disasters ({counts.disasters})
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeResources}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeResources: e.target.checked }))}
                      className="rounded mr-3"
                      disabled={counts.resources === 0}
                    />
                    <span className={counts.resources === 0 ? 'text-gray-400' : 'text-gray-700'}>
                      Include Resource Analysis ({counts.resources})
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeStatistics}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeStatistics: e.target.checked }))}
                      className="rounded mr-3"
                      disabled={!data.statistics}
                    />
                    <span className={!data.statistics ? 'text-gray-400' : 'text-gray-700'}>
                      Include Statistics
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeFilters}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeFilters: e.target.checked }))}
                      className="rounded mr-3"
                    />
                    <span className="text-gray-700">Include Applied Filters</span>
                  </label>
                </div>
              </div>

              {/* Filename */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">File Name</h3>
                <input
                  type="text"
                  value={exportOptions.filename}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, filename: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter filename (without extension)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Date will be automatically appended to the filename
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {hasData && (
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || !exportOptions.filename.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isExporting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export {selectedFormat.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportModal;
