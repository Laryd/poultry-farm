'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { VaccinationPDFDocument } from './VaccinationPDFDocument';
import { generateVaccinationExcel } from '@/lib/utils/vaccineExcelExport';
import { BatchData, VaccinationData } from '@/lib/utils/vaccineExport';

interface DownloadVaccinationsButtonProps {
  batch: BatchData;
  vaccinations: VaccinationData[];
}

export default function DownloadVaccinationsButton({
  batch,
  vaccinations,
}: DownloadVaccinationsButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState<'pdf' | 'excel' | null>(null);

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      setGeneratingType('pdf');

      // Generate PDF
      const blob = await pdf(
        <VaccinationPDFDocument batch={batch} vaccinations={vaccinations} />
      ).toBlob();

      // Download file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${batch.batchCode}_Vaccinations_${
        new Date().toISOString().split('T')[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setIsGenerating(true);
      setGeneratingType('excel');

      await generateVaccinationExcel(batch, vaccinations);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Failed to generate Excel file. Please try again.');
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
  };

  if (vaccinations.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating {generatingType === 'pdf' ? 'PDF' : 'Excel'}...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDownloadPDF} disabled={isGenerating}>
          <FileText className="h-4 w-4 mr-2" />
          Download PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadExcel} disabled={isGenerating}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Download Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
