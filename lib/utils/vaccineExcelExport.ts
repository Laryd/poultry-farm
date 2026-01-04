import ExcelJS from 'exceljs';
import {
  BatchData,
  VaccinationData,
  categorizeVaccines,
  formatDateForExport,
  getVaccineStatus,
} from './vaccineExport';

/**
 * Generate and download Excel file with vaccination data
 */
export async function generateVaccinationExcel(
  batch: BatchData,
  vaccinations: VaccinationData[]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const { completed, upcoming } = categorizeVaccines(vaccinations);

  // Set workbook properties
  workbook.creator = 'Poultry Farm Management System';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Create Overview sheet
  const overviewSheet = workbook.addWorksheet('Overview', {
    properties: { tabColor: { argb: 'FF4472C4' } },
  });

  // Overview header
  overviewSheet.mergeCells('A1:D1');
  const titleCell = overviewSheet.getCell('A1');
  titleCell.value = 'Vaccination Report';
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  overviewSheet.getRow(1).height = 30;

  // Batch information
  overviewSheet.addRow([]);
  overviewSheet.addRow(['Batch Information']);
  overviewSheet.getCell('A3').font = { bold: true, size: 12 };

  overviewSheet.addRow(['Batch Name:', batch.name]);
  overviewSheet.addRow(['Batch Code:', batch.batchCode]);
  overviewSheet.addRow(['Breed:', batch.breed]);
  overviewSheet.addRow(['Start Date:', formatDateForExport(batch.startDate)]);
  overviewSheet.addRow(['Current Size:', `${batch.currentSize} birds`]);
  overviewSheet.addRow(['Initial Size:', `${batch.initialSize} birds`]);

  if (batch.maleCount !== undefined || batch.femaleCount !== undefined) {
    const genderInfo = [];
    if (batch.maleCount !== undefined) genderInfo.push(`Male: ${batch.maleCount}`);
    if (batch.femaleCount !== undefined) genderInfo.push(`Female: ${batch.femaleCount}`);
    overviewSheet.addRow(['Gender Breakdown:', genderInfo.join(', ')]);
  }

  // Summary statistics
  overviewSheet.addRow([]);
  overviewSheet.addRow(['Vaccination Summary']);
  overviewSheet.getCell(`A${overviewSheet.lastRow!.number}`).font = { bold: true, size: 12 };

  overviewSheet.addRow(['Total Vaccinations:', vaccinations.length]);
  overviewSheet.addRow(['Completed:', completed.length]);
  overviewSheet.addRow(['Upcoming:', upcoming.length]);

  const overdueCount = upcoming.filter(
    (v) => new Date(v.scheduledDate) < new Date()
  ).length;
  overviewSheet.addRow(['Overdue:', overdueCount]);

  overviewSheet.addRow([]);
  overviewSheet.addRow(['Generated:', formatDateForExport(new Date().toISOString())]);

  // Style the overview sheet
  overviewSheet.getColumn(1).width = 20;
  overviewSheet.getColumn(2).width = 30;

  // Apply bold to labels
  for (let i = 4; i <= overviewSheet.lastRow!.number; i++) {
    const cell = overviewSheet.getCell(`A${i}`);
    if (cell.value) {
      cell.font = { bold: true };
    }
  }

  // Create Completed Vaccinations sheet
  const completedSheet = workbook.addWorksheet('Completed Vaccinations', {
    properties: { tabColor: { argb: 'FF70AD47' } },
  });

  // Header row
  completedSheet.columns = [
    { header: 'Vaccine Name', key: 'vaccineName', width: 25 },
    { header: 'Age (Days)', key: 'ageInDays', width: 12 },
    { header: 'Scheduled Date', key: 'scheduledDate', width: 15 },
    { header: 'Completed Date', key: 'completedDate', width: 15 },
    { header: 'Actual Cost', key: 'actualCost', width: 12 },
    { header: 'Notes', key: 'notes', width: 40 },
  ];

  // Style header row
  const completedHeaderRow = completedSheet.getRow(1);
  completedHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  completedHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF70AD47' },
  };
  completedHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
  completedHeaderRow.height = 20;

  // Add data
  completed.forEach((vaccination) => {
    completedSheet.addRow({
      vaccineName: vaccination.vaccineName,
      ageInDays: vaccination.ageInDays,
      scheduledDate: formatDateForExport(vaccination.scheduledDate),
      completedDate: formatDateForExport(vaccination.completedDate!),
      actualCost: vaccination.actualCost
        ? `$${vaccination.actualCost.toFixed(2)}`
        : '-',
      notes: vaccination.notes || '-',
    });
  });

  // Apply borders and alternating row colors
  const completedLastRow = completedSheet.lastRow!.number;
  for (let i = 2; i <= completedLastRow; i++) {
    const row = completedSheet.getRow(i);
    if (i % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' },
      };
    }
  }

  // Create Upcoming Vaccinations sheet
  const upcomingSheet = workbook.addWorksheet('Upcoming Vaccinations', {
    properties: { tabColor: { argb: 'FFFFC000' } },
  });

  // Header row
  upcomingSheet.columns = [
    { header: 'Vaccine Name', key: 'vaccineName', width: 25 },
    { header: 'Age (Days)', key: 'ageInDays', width: 12 },
    { header: 'Scheduled Date', key: 'scheduledDate', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Notes', key: 'notes', width: 40 },
  ];

  // Style header row
  const upcomingHeaderRow = upcomingSheet.getRow(1);
  upcomingHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  upcomingHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFC000' },
  };
  upcomingHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
  upcomingHeaderRow.height = 20;

  // Add data
  upcoming.forEach((vaccination) => {
    const status = getVaccineStatus(vaccination);
    upcomingSheet.addRow({
      vaccineName: vaccination.vaccineName,
      ageInDays: vaccination.ageInDays,
      scheduledDate: formatDateForExport(vaccination.scheduledDate),
      status,
      notes: vaccination.notes || '-',
    });
  });

  // Apply borders and alternating row colors, highlight overdue
  const upcomingLastRow = upcomingSheet.lastRow!.number;
  for (let i = 2; i <= upcomingLastRow; i++) {
    const row = upcomingSheet.getRow(i);
    const statusCell = row.getCell(4);

    if (statusCell.value === 'Overdue') {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFC7CE' },
      };
      statusCell.font = { bold: true, color: { argb: 'FF9C0006' } };
    } else if (i % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' },
      };
    }
  }

  // Generate and download the file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${batch.batchCode}_Vaccinations_${
    new Date().toISOString().split('T')[0]
  }.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
