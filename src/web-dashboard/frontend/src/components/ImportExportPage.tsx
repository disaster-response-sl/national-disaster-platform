import React, { useState } from 'react';
import {
  Upload,
  Download,
  FileText,
  ArrowLeft,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import ImportExportService, {
  ImportResponse,
  DisasterRecord,
  ExportFilters
} from '../services/importExportService';interface ImportExportPageProps {
  onBack: () => void;
}

const ImportExportPage: React.FC<ImportExportPageProps> = ({ onBack }) => {
  // State management
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'template'>('import');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importFormat, setImportFormat] = useState<'json' | 'csv'>('json');
  const [overwriteData, setOverwriteData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importResults, setImportResults] = useState<ImportResponse | null>(null);
  
  // Export filters
  const [exportFilters, setExportFilters] = useState<ExportFilters>({
    format: 'json',
    includeZones: true,
    includeResources: true
  });

  // Additional state for date inputs
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed' | null>(null);

  // Test backend connection on component mount
  React.useEffect(() => {
    const testConnection = async () => {
      setConnectionStatus('testing');
      try {
        const isConnected = await ImportExportService.testConnection();
        setConnectionStatus(isConnected ? 'connected' : 'failed');
        console.log('Backend connection:', isConnected ? 'SUCCESS' : 'FAILED');
      } catch (error) {
        setConnectionStatus('failed');
        console.error('Connection test error:', error);
      }
    };
    
    testConnection();
  }, []);

  // File input handler
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-detect format from file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'csv') {
        setImportFormat('csv');
      } else if (extension === 'json') {
        setImportFormat('json');
      }
    }
  };

  // Import handler
  const handleImport = async () => {
    if (!selectedFile) {
      alert('Please select a file to import');
      return;
    }

    setIsLoading(true);
    setImportResults(null);

    try {
      let data: DisasterRecord[] = [];
      
      if (importFormat === 'json') {
        const text = await selectedFile.text();
        const parsedData = JSON.parse(text);
        data = Array.isArray(parsedData) ? parsedData : [parsedData];
      } else if (importFormat === 'csv') {
        // Simple CSV parser
        const text = await selectedFile.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('CSV file must have at least a header row and one data row');
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const record: any = {};
          
          headers.forEach((header, index) => {
            const value = values[index] || '';
            
            // Handle nested location object
            if (header === 'location.lat') {
              if (!record.location) record.location = {};
              record.location.lat = parseFloat(value) || 0;
            } else if (header === 'location.lng') {
              if (!record.location) record.location = {};
              record.location.lng = parseFloat(value) || 0;
            } else {
              record[header] = value;
            }
          });
          
          return record as DisasterRecord;
        });
      }

      const response = await ImportExportService.importDisasters({
        data,
        format: importFormat,
        overwrite: overwriteData
      });

      setImportResults(response);
    } catch (error) {
      console.error('Import error:', error);
      alert('Import failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Export handler
  const handleExport = async () => {
    setIsLoading(true);
    
    try {
      // Include date filters if provided
      const filters = {
        ...exportFilters,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      };
      
      const response = await ImportExportService.exportDisasters(filters);
      
      if (exportFilters.format === 'csv' && response instanceof Blob) {
        // Download CSV file
        const timestamp = new Date().toISOString().split('T')[0];
        ImportExportService.downloadFile(response, `disasters-export-${timestamp}.csv`);
      } else if (typeof response === 'object' && 'data' in response) {
        // Download JSON file
        const jsonData = JSON.stringify(response, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const timestamp = new Date().toISOString().split('T')[0];
        ImportExportService.downloadFile(blob, `disasters-export-${timestamp}.json`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Template download handler
  const handleDownloadTemplate = async (format: 'csv' | 'json') => {
    setIsLoading(true);
    
    try {
      const response = await ImportExportService.downloadTemplate(format);
      
      if (format === 'csv' && response instanceof Blob) {
        ImportExportService.downloadFile(response, `disaster-import-template.csv`);
      } else {
        const jsonData = JSON.stringify(response, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        ImportExportService.downloadFile(blob, `disaster-import-template.json`);
      }
    } catch (error) {
      console.error('Template download error:', error);
      alert('Template download failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-800">Data Import & Export</h1>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {connectionStatus === 'testing' && (
                <div className="flex items-center gap-2 text-yellow-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Testing connection...</span>
                </div>
              )}
              {connectionStatus === 'connected' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Backend connected</span>
                </div>
              )}
              {connectionStatus === 'failed' && (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm">Connection failed</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'import', label: 'Import Data', icon: Upload },
                { id: 'export', label: 'Export Data', icon: Download },
                { id: 'template', label: 'Templates', icon: FileText }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Import Tab */}
            {activeTab === 'import' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Import Disaster Data</h2>
                  
                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <input
                      type="file"
                      accept=".json,.csv"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-lg font-medium text-gray-900">
                        {selectedFile ? selectedFile.name : 'Choose file to upload'}
                      </span>
                      <p className="text-gray-500 mt-2">JSON or CSV files supported</p>
                    </label>
                  </div>

                  {/* Import Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        File Format
                      </label>
                      <select
                        value={importFormat}
                        onChange={(e) => setImportFormat(e.target.value as 'json' | 'csv')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="json">JSON</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="overwrite"
                        checked={overwriteData}
                        onChange={(e) => setOverwriteData(e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor="overwrite" className="ml-2 text-sm text-gray-700">
                        Overwrite existing data
                      </label>
                    </div>
                  </div>

                  {/* Import Button */}
                  <button
                    onClick={handleImport}
                    disabled={!selectedFile || isLoading}
                    className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Import Data
                      </>
                    )}
                  </button>

                  {/* Import Results */}
                  {importResults && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3">Import Results</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span>Total: {importResults.data.total}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span>Success: {importResults.data.successful}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="w-5 h-5 text-red-500" />
                          <span>Failed: {importResults.data.failed}</span>
                        </div>
                      </div>
                      
                      {importResults.data.errors.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-red-700 mb-2">Errors:</h4>
                          <ul className="text-sm text-red-600 space-y-1">
                            {importResults.data.errors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Export Tab */}
            {activeTab === 'export' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Export Disaster Data</h2>
                  
                  {/* Export Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Export Format
                      </label>
                      <select
                        value={exportFilters.format}
                        onChange={(e) => setExportFilters({ ...exportFilters, format: e.target.value as 'json' | 'csv' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="json">JSON</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Disaster Type
                      </label>
                      <select
                        value={exportFilters.type || ''}
                        onChange={(e) => setExportFilters({ ...exportFilters, type: e.target.value || undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Types</option>
                        <option value="flood">Flood</option>
                        <option value="landslide">Landslide</option>
                        <option value="cyclone">Cyclone</option>
                        <option value="fire">Fire</option>
                        <option value="earthquake">Earthquake</option>
                        <option value="drought">Drought</option>
                        <option value="tsunami">Tsunami</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Severity
                      </label>
                      <select
                        value={exportFilters.severity || ''}
                        onChange={(e) => setExportFilters({ ...exportFilters, severity: e.target.value || undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Severities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={exportFilters.status || ''}
                        onChange={(e) => setExportFilters({ ...exportFilters, status: e.target.value || undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="resolved">Resolved</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Include Options */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="includeZones"
                        checked={exportFilters.includeZones || false}
                        onChange={(e) => setExportFilters({ ...exportFilters, includeZones: e.target.checked })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor="includeZones" className="ml-2 text-sm text-gray-700">
                        Include Zone Information
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="includeResources"
                        checked={exportFilters.includeResources || false}
                        onChange={(e) => setExportFilters({ ...exportFilters, includeResources: e.target.checked })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor="includeResources" className="ml-2 text-sm text-gray-700">
                        Include Resource Requirements
                      </label>
                    </div>
                  </div>

                  {/* Export Button */}
                  <button
                    onClick={handleExport}
                    disabled={isLoading}
                    className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Export Data
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Template Tab */}
            {activeTab === 'template' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Download Templates</h2>
                  <p className="text-gray-600 mb-6">
                    Download template files to understand the required data format for imports.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <FileText className="w-8 h-8 text-blue-500 mb-3" />
                      <h3 className="font-semibold text-gray-800 mb-2">JSON Template</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Download a JSON template with sample disaster data structure.
                      </p>
                      <button
                        onClick={() => handleDownloadTemplate('json')}
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download JSON
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <FileText className="w-8 h-8 text-green-500 mb-3" />
                      <h3 className="font-semibold text-gray-800 mb-2">CSV Template</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Download a CSV template with proper column headers and sample data.
                      </p>
                      <button
                        onClick={() => handleDownloadTemplate('csv')}
                        disabled={isLoading}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download CSV
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExportPage;
