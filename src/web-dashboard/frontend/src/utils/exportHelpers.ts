import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { Report, Disaster, ResourceAnalysis, MapStatistics } from '../types/map';
import { formatDateTimeForDisplay } from './dateUtils';
import { formatPriority, formatStatus } from './mapHelpers';

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ExportData {
  reports?: Report[];
  disasters?: Disaster[];
  resourceAnalysis?: ResourceAnalysis[];
  statistics?: MapStatistics;
  filters?: any;
}

interface ExportOptions {
  filename?: string;
  includeCharts?: boolean;
  includeFilters?: boolean;
  dateRange?: string;
}

export class ExportService {
  
  /**
   * Export data to PDF format
   */
  static async exportToPDF(data: ExportData, options: ExportOptions = {}): Promise<void> {
    const { filename = 'disaster-report', includeFilters = true } = options;
    
    const pdf = new jsPDF();
    let yPosition = 20;

    // Header
    pdf.setFontSize(20);
    pdf.text('Disaster Management Report', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPosition);
    yPosition += 15;

    // Filters (if included)
    if (includeFilters && data.filters) {
      pdf.setFontSize(14);
      pdf.text('Applied Filters:', 20, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      if (data.filters.status) pdf.text(`Status: ${data.filters.status}`, 25, yPosition += 5);
      if (data.filters.type) pdf.text(`Type: ${data.filters.type}`, 25, yPosition += 5);
      if (data.filters.priority) pdf.text(`Priority: ${data.filters.priority}`, 25, yPosition += 5);
      yPosition += 10;
    }

    // Statistics Summary
    if (data.statistics) {
      pdf.setFontSize(14);
      pdf.text('Summary Statistics', 20, yPosition);
      yPosition += 10;

      const statsData = [
        ['Metric', 'Value'],
        ['Total Reports', data.statistics.totalReports?.toString() || '0'],
        ['Total Affected', data.statistics.totalAffected?.toLocaleString() || '0'],
      ];

      pdf.autoTable({
        startY: yPosition,
        head: [statsData[0]],
        body: statsData.slice(1),
        theme: 'grid',
        margin: { left: 20 },
        columnStyles: { 0: { fontStyle: 'bold' } },
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 15;
    }

    // Reports Table
    if (data.reports && data.reports.length > 0) {
      pdf.setFontSize(14);
      pdf.text('Reports', 20, yPosition);
      yPosition += 10;

      const reportData = data.reports.map(report => [
        report.type,
        formatStatus(report.status),
        formatPriority(report.priority),
        report.affected_people.toLocaleString(),
        `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`,
        formatDateTimeForDisplay(report.createdAt),
      ]);

      pdf.autoTable({
        startY: yPosition,
        head: [['Type', 'Status', 'Priority', 'Affected', 'Location', 'Created']],
        body: reportData,
        theme: 'striped',
        margin: { left: 20 },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 35 },
          5: { cellWidth: 35 },
        },
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 15;
    }

    // Disasters Table
    if (data.disasters && data.disasters.length > 0) {
      // Add new page if needed
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.text('Active Disasters', 20, yPosition);
      yPosition += 10;

      const disasterData = data.disasters.map(disaster => [
        disaster.name,
        disaster.type,
        formatStatus(disaster.status),
        formatPriority(disaster.priority),
        disaster.estimatedAffected.toLocaleString(),
        disaster.affectedAreas?.slice(0, 2).join(', ') || '',
      ]);

      pdf.autoTable({
        startY: yPosition,
        head: [['Name', 'Type', 'Status', 'Priority', 'Affected', 'Areas']],
        body: disasterData,
        theme: 'striped',
        margin: { left: 20 },
        styles: { fontSize: 8 },
      });
    }

    // Save the PDF
    pdf.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  /**
   * Export data to Excel format
   */
  static async exportToExcel(data: ExportData, options: ExportOptions = {}): Promise<void> {
    const { filename = 'disaster-data' } = options;
    
    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    if (data.statistics) {
      const summaryData = [
        ['Metric', 'Value'],
        ['Total Reports', data.statistics.totalReports || 0],
        ['Total Affected', data.statistics.totalAffected || 0],
        ['Generated On', new Date().toLocaleString()],
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    }

    // Reports Sheet
    if (data.reports && data.reports.length > 0) {
      const reportsData = [
        ['ID', 'Type', 'Status', 'Priority', 'Affected People', 'Latitude', 'Longitude', 'Country', 'Description', 'Created At', 'Updated At'],
        ...data.reports.map(report => [
          report._id,
          report.type,
          report.status,
          report.priority,
          report.affected_people,
          report.location.lat,
          report.location.lng,
          report.location.country || '',
          report.description || '',
          formatDateTimeForDisplay(report.createdAt),
          formatDateTimeForDisplay(report.updatedAt),
        ]),
      ];

      const reportsSheet = XLSX.utils.aoa_to_sheet(reportsData);
      XLSX.utils.book_append_sheet(workbook, reportsSheet, 'Reports');
    }

    // Disasters Sheet
    if (data.disasters && data.disasters.length > 0) {
      const disastersData = [
        ['ID', 'Name', 'Type', 'Status', 'Priority', 'Estimated Affected', 'Latitude', 'Longitude', 'Affected Areas', 'Description', 'Created At'],
        ...data.disasters.map(disaster => [
          disaster._id,
          disaster.name,
          disaster.type,
          disaster.status,
          disaster.priority,
          disaster.estimatedAffected,
          disaster.location.lat,
          disaster.location.lng,
          disaster.affectedAreas?.join(', ') || '',
          disaster.description || '',
          formatDateTimeForDisplay(disaster.createdAt),
        ]),
      ];

      const disastersSheet = XLSX.utils.aoa_to_sheet(disastersData);
      XLSX.utils.book_append_sheet(workbook, disastersSheet, 'Disasters');
    }

    // Resource Analysis Sheet
    if (data.resourceAnalysis && data.resourceAnalysis.length > 0) {
      const resourceData = [
        ['Latitude', 'Longitude', 'Total Reports', 'Total Affected', 'Critical Reports', 'Food', 'Water', 'Shelter', 'Medical', 'Rescue'],
        ...data.resourceAnalysis.map(area => [
          area.lat,
          area.lng,
          area.totalReports,
          area.totalAffected,
          area.criticalReports,
          area.resources.food || 0,
          area.resources.water || 0,
          area.resources.shelter || 0,
          area.resources.medical || 0,
          area.resources.rescue || 0,
        ]),
      ];

      const resourceSheet = XLSX.utils.aoa_to_sheet(resourceData);
      XLSX.utils.book_append_sheet(workbook, resourceSheet, 'Resources');
    }

    // Statistics Breakdown Sheets
    if (data.statistics) {
      // By Type
      if (data.statistics.byType && data.statistics.byType.length > 0) {
        const typeData = [
          ['Type', 'Count'],
          ...data.statistics.byType.map(item => [item._id, item.count]),
        ];
        const typeSheet = XLSX.utils.aoa_to_sheet(typeData);
        XLSX.utils.book_append_sheet(workbook, typeSheet, 'By Type');
      }

      // By Status
      if (data.statistics.byStatus && data.statistics.byStatus.length > 0) {
        const statusData = [
          ['Status', 'Count'],
          ...data.statistics.byStatus.map(item => [item._id, item.count]),
        ];
        const statusSheet = XLSX.utils.aoa_to_sheet(statusData);
        XLSX.utils.book_append_sheet(workbook, statusSheet, 'By Status');
      }

      // By Priority
      if (data.statistics.byPriority && data.statistics.byPriority.length > 0) {
        const priorityData = [
          ['Priority', 'Count'],
          ...data.statistics.byPriority.map(item => [formatPriority(parseInt(item._id)), item.count]),
        ];
        const prioritySheet = XLSX.utils.aoa_to_sheet(priorityData);
        XLSX.utils.book_append_sheet(workbook, prioritySheet, 'By Priority');
      }
    }

    // Save the workbook
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  /**
   * Export data to CSV format
   */
  static async exportToCSV(data: ExportData, options: ExportOptions = {}): Promise<void> {
    const { filename = 'disaster-data' } = options;

    if (data.reports && data.reports.length > 0) {
      const csvData = [
        ['ID', 'Type', 'Status', 'Priority', 'Affected People', 'Latitude', 'Longitude', 'Country', 'Description', 'Created At'],
        ...data.reports.map(report => [
          report._id,
          report.type,
          report.status,
          report.priority,
          report.affected_people,
          report.location.lat,
          report.location.lng,
          report.location.country || '',
          (report.description || '').replace(/,/g, ';'), // Replace commas to avoid CSV issues
          formatDateTimeForDisplay(report.createdAt),
        ]),
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${filename}-reports-${new Date().toISOString().split('T')[0]}.csv`);
    }
  }

  /**
   * Export filtered data based on current application state
   */
  static async exportFilteredData(
    format: 'pdf' | 'excel' | 'csv',
    data: ExportData,
    options: ExportOptions = {}
  ): Promise<void> {
    switch (format) {
      case 'pdf':
        await this.exportToPDF(data, options);
        break;
      case 'excel':
        await this.exportToExcel(data, options);
        break;
      case 'csv':
        await this.exportToCSV(data, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
}
