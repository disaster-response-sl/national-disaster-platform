// Import-Export API service following the guide exactly
const API_BASE_URL = '/api/admin/import-export';

// Types from the guide
export interface ImportResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    successful: number;
    failed: number;
    errors: string[];
    warnings: string[];
  };
}

export interface ExportResponse {
  success: boolean;
  exported_at: string;
  total_records: number;
  data: DisasterRecord[];
}

export interface DisasterRecord {
  disaster_code: string;
  title: string;
  type: string;
  severity: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  zones?: Zone[];
  resources_required?: ResourceRequirements;
  priority_level: string;
}

export interface Zone {
  zone_name: string;
  boundary_coordinates: number[][];
  estimated_population: number;
  area_km2: number;
}

export interface ResourceRequirements {
  personnel: number;
  rescue_teams: number;
  medical_units: number;
  vehicles: number;
  boats: number;
  helicopters: number;
  food_supplies: number;
  water_supplies: number;
  medical_supplies: number;
  temporary_shelters: number;
}

export interface ImportRequest {
  data: DisasterRecord[];
  format: 'json' | 'csv';
  overwrite?: boolean;
}

export interface ExportFilters {
  format?: 'json' | 'csv';
  status?: string;
  type?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  includeZones?: boolean;
  includeResources?: boolean;
}

export class ImportExportService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Test connection to import-export API
   */
  static async testConnection(): Promise<boolean> {
    try {
      // Test with template endpoint as it's a simple GET request
      const response = await fetch(`${API_BASE_URL}/template?format=json`, {
        headers: this.getAuthHeaders(),
      });
      
      console.log('Connection test response:', response.status, response.statusText);
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * 1. Import Disasters - POST /api/admin/import-export/import
   */
  static async importDisasters(importData: ImportRequest): Promise<ImportResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/import`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(importData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error importing disasters:', error);
      throw error;
    }
  }

  /**
   * 2. Export Disasters - GET /api/admin/import-export/export
   */
  static async exportDisasters(filters: ExportFilters = {}): Promise<ExportResponse | Blob> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const url = `${API_BASE_URL}/export${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('Export URL:', url);
      console.log('Export headers:', this.getAuthHeaders());
      
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Export failed: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText || response.statusText}`);
      }

      // If CSV format, return blob for download
      if (filters.format === 'csv') {
        return await response.blob();
      }

      // If JSON format, return parsed JSON
      return await response.json();
    } catch (error) {
      console.error('Error exporting disasters:', error);
      throw error;
    }
  }

  /**
   * 3. Download Template - GET /api/admin/import-export/template
   */
  static async downloadTemplate(format: 'csv' | 'json' = 'csv'): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/template?format=${format}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (format === 'csv') {
        return await response.blob();
      }

      return await response.json();
    } catch (error) {
      console.error('Error downloading template:', error);
      throw error;
    }
  }

  /**
   * Helper method to download blob as file
   */
  static downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export default ImportExportService;
