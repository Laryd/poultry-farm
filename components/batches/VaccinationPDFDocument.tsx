import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import {
  BatchData,
  VaccinationData,
  categorizeVaccines,
  formatDateForExport,
  getVaccineStatus,
} from '@/lib/utils/vaccineExport';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  batchInfoSection: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  batchInfoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    width: 100,
  },
  value: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    padding: 8,
    fontWeight: 'bold',
    borderBottom: 1,
    borderBottomColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableRowEven: {
    backgroundColor: '#f9f9f9',
  },
  col1: {
    width: '30%',
  },
  col2: {
    width: '15%',
  },
  col3: {
    width: '20%',
  },
  col4: {
    width: '15%',
  },
  col5: {
    width: '20%',
  },
  emptyState: {
    padding: 20,
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#999',
    fontSize: 8,
    borderTop: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
});

interface VaccinationPDFDocumentProps {
  batch: BatchData;
  vaccinations: VaccinationData[];
}

export const VaccinationPDFDocument: React.FC<VaccinationPDFDocumentProps> = ({
  batch,
  vaccinations,
}) => {
  const { completed, upcoming } = categorizeVaccines(vaccinations);
  const generatedDate = formatDateForExport(new Date().toISOString());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Vaccination Report</Text>
          <Text style={styles.subtitle}>Batch: {batch.name} ({batch.batchCode})</Text>
          <Text style={styles.subtitle}>Generated: {generatedDate}</Text>
        </View>

        {/* Batch Information */}
        <View style={styles.batchInfoSection}>
          <View style={styles.batchInfoRow}>
            <Text style={styles.label}>Breed:</Text>
            <Text style={styles.value}>{batch.breed}</Text>
          </View>
          <View style={styles.batchInfoRow}>
            <Text style={styles.label}>Start Date:</Text>
            <Text style={styles.value}>{formatDateForExport(batch.startDate)}</Text>
          </View>
          <View style={styles.batchInfoRow}>
            <Text style={styles.label}>Current Size:</Text>
            <Text style={styles.value}>{batch.currentSize} birds</Text>
          </View>
          <View style={styles.batchInfoRow}>
            <Text style={styles.label}>Initial Size:</Text>
            <Text style={styles.value}>{batch.initialSize} birds</Text>
          </View>
          {(batch.maleCount !== undefined || batch.femaleCount !== undefined) && (
            <View style={styles.batchInfoRow}>
              <Text style={styles.label}>Gender:</Text>
              <Text style={styles.value}>
                {batch.maleCount !== undefined && `Male: ${batch.maleCount}`}
                {batch.maleCount !== undefined && batch.femaleCount !== undefined && ', '}
                {batch.femaleCount !== undefined && `Female: ${batch.femaleCount}`}
              </Text>
            </View>
          )}
        </View>

        {/* Completed Vaccinations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Completed Vaccinations ({completed.length})
          </Text>
          {completed.length === 0 ? (
            <Text style={styles.emptyState}>No completed vaccinations</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.col1}>Vaccine Name</Text>
                <Text style={styles.col2}>Age (Days)</Text>
                <Text style={styles.col3}>Scheduled Date</Text>
                <Text style={styles.col4}>Completed</Text>
                <Text style={styles.col5}>Cost</Text>
              </View>
              {completed.map((vaccination, index) => (
                <View
                  key={vaccination._id}
                  style={[styles.tableRow, ...(index % 2 === 0 ? [styles.tableRowEven] : [])]}
                >
                  <Text style={styles.col1}>{vaccination.vaccineName}</Text>
                  <Text style={styles.col2}>{vaccination.ageInDays}</Text>
                  <Text style={styles.col3}>
                    {formatDateForExport(vaccination.scheduledDate)}
                  </Text>
                  <Text style={styles.col4}>
                    {formatDateForExport(vaccination.completedDate!)}
                  </Text>
                  <Text style={styles.col5}>
                    {vaccination.actualCost ? `$${vaccination.actualCost.toFixed(2)}` : '-'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Upcoming Vaccinations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Upcoming Vaccinations ({upcoming.length})
          </Text>
          {upcoming.length === 0 ? (
            <Text style={styles.emptyState}>No upcoming vaccinations</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.col1}>Vaccine Name</Text>
                <Text style={styles.col2}>Age (Days)</Text>
                <Text style={styles.col3}>Scheduled Date</Text>
                <Text style={styles.col4}>Status</Text>
                <Text style={styles.col5}>Notes</Text>
              </View>
              {upcoming.map((vaccination, index) => (
                <View
                  key={vaccination._id}
                  style={[styles.tableRow, ...(index % 2 === 0 ? [styles.tableRowEven] : [])]}
                >
                  <Text style={styles.col1}>{vaccination.vaccineName}</Text>
                  <Text style={styles.col2}>{vaccination.ageInDays}</Text>
                  <Text style={styles.col3}>
                    {formatDateForExport(vaccination.scheduledDate)}
                  </Text>
                  <Text style={styles.col4}>{getVaccineStatus(vaccination)}</Text>
                  <Text style={styles.col5}>{vaccination.notes || '-'}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Poultry Farm Management System</Text>
        </View>
      </Page>
    </Document>
  );
};
