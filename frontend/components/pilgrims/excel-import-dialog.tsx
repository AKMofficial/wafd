'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useTranslations, useLocale } from '@/lib/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreatePilgrimDto, EXCEL_IMPORT_COLUMNS, ImportResult } from '@/types/pilgrim';
import { usePilgrimStore } from '@/store/pilgrim-store';

interface ExcelImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: (result: ImportResult) => void;
}

interface PreviewData {
  headers: string[];
  rows: any[][];
  totalRows: number;
  validRows: number;
  errors: { row: number; message: string }[];
}

export function ExcelImportDialog({
  open,
  onOpenChange,
  onImportComplete
}: ExcelImportDialogProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  
  const { importFromExcel } = usePilgrimStore();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        throw new Error(t('pilgrims.excelImport.fileEmpty'));
      }

      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1).filter(row => (row as any[]).some(cell => cell !== null && cell !== undefined && cell !== '')) as any[][];
      
      const errors: { row: number; message: string }[] = [];
      let validRows = 0;

      rows.forEach((row, index) => {
        const rowNumber = index + 2;
        let hasError = false;

        EXCEL_IMPORT_COLUMNS.forEach((column) => {
          const translatedHeader = t(column.headerKey);
          const headerIndex = headers.findIndex(h => h === translatedHeader);
          if (column.required && (headerIndex === -1 || !(row as any[])[headerIndex])) {
            errors.push({
              row: rowNumber,
              message: `${translatedHeader} ${t('pilgrims.excelImport.required')}`
            });
            hasError = true;
          }
        });

        if (!hasError) {
          validRows++;
        }
      });

      setPreviewData({
        headers,
        rows: rows.slice(0, 10),
        totalRows: rows.length,
        validRows,
        errors: errors.slice(0, 10)
      });
      
      setStep('preview');
    } catch (error) {
      console.error('Error processing file:', error);
      alert(t('pilgrims.excelImport.errorReadingFile'));
    }
    setIsProcessing(false);
  };

  const handleImport = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    try {
      const result = await importFromExcel(file);
      setImportResult(result);
      setStep('result');
      onImportComplete?.(result);
    } catch (error) {
      console.error('Import error:', error);
      alert(t('pilgrims.excelImport.importFailedError'));
    }
    setIsProcessing(false);
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData(null);
    setImportResult(null);
    setStep('upload');
    onOpenChange(false);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      EXCEL_IMPORT_COLUMNS.map(col => t(col.headerKey)),
      [
        'HAJ2024001',
        '1234567890',
        'A12345678',
        'أحمد',
        'الحمد',
        '1980-05-15',
        'ذكر',
        'السعودية',
        '+966501234567',
        'محمد الحمد',
        '+966502345678',
        'لا',
        'ملاحظات'
      ]
    ]);
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pilgrims');
    XLSX.writeFile(wb, 'pilgrims_template.xlsx');
  };

  return (
    <Dialog open={open} onOpenChange={() => handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClose={handleClose}>
        <DialogHeader>
          <DialogTitle>
            {t('pilgrims.excelImport.title')}
          </DialogTitle>
          <DialogDescription>
            {t('pilgrims.excelImport.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {step === 'upload' && (
            <div className="space-y-6 p-6">
              <Card className="border-dashed">
                <div className="p-8">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <div
                    className="text-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileSpreadsheet className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {t('pilgrims.excelImport.chooseFile')}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {t('pilgrims.excelImport.clickToBrowse')}
                    </p>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 me-2" />
                      {t('pilgrims.excelImport.selectFile')}
                    </Button>
                  </div>

                  {isProcessing && (
                    <div className="mt-4 text-center">
                      <Skeleton className="h-4 w-48 mx-auto" />
                      <p className="text-sm text-gray-600 mt-2">
                        {t('pilgrims.excelImport.processingFile')}
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium mb-1">
                    {t('pilgrims.excelImport.needTemplate')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t('pilgrims.excelImport.templateDescription')}
                  </p>
                </div>
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 me-2" />
                  {t('pilgrims.excelImport.downloadTemplate')}
                </Button>
              </div>
            </div>
          )}

          {step === 'preview' && previewData && (
            <div className="space-y-6 p-6">
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {t('pilgrims.excelImport.totalRows')}
                    </span>
                    <Badge variant="outline">{previewData.totalRows}</Badge>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {t('pilgrims.excelImport.validRows')}
                    </span>
                    <Badge className="bg-green-100 text-green-800">
                      {previewData.validRows}
                    </Badge>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {t('pilgrims.excelImport.errors')}
                    </span>
                    <Badge className="bg-red-100 text-red-800">
                      {previewData.errors.length}
                    </Badge>
                  </div>
                </Card>
              </div>

              <div>
                <h4 className="font-medium mb-2">
                  {t('pilgrims.excelImport.dataPreview')}
                </h4>
                <div className="border rounded-lg overflow-auto max-h-64">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {previewData.headers.map((header, index) => (
                          <TableHead key={index} className="whitespace-nowrap">
                            {header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={cellIndex} className="whitespace-nowrap">
                              {cell || '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {previewData.errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-red-600">
                    {t('pilgrims.excelImport.errors')}
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-auto">
                    {previewData.errors.map((error, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span>
                          {t('pilgrims.excelImport.row')} {error.row}:
                        </span>
                        <span className="text-gray-600">{error.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'result' && importResult && (
            <div className="space-y-6 p-6">
              <div className="text-center">
                {importResult.success ? (
                  <>
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {t('pilgrims.excelImport.importSuccessful')}
                    </h3>
                  </>
                ) : (
                  <>
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {t('pilgrims.excelImport.importFailed')}
                    </h3>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {importResult.importedCount}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('pilgrims.excelImport.imported')}
                    </p>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {importResult.failedCount}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('pilgrims.excelImport.failed')}
                    </p>
                  </div>
                </Card>
              </div>

              {importResult.duplicates.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-yellow-600">
                    {t('pilgrims.excelImport.duplicates')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {importResult.duplicates.map((dup, index) => (
                      <Badge key={index} variant="outline" className="text-yellow-600">
                        {dup}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t p-4 flex justify-between items-center">
          <Button variant="outline" onClick={handleClose}>
            {t('pilgrims.excelImport.close')}
          </Button>

          {step === 'preview' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep('upload')}
              >
                {t('pilgrims.excelImport.back')}
              </Button>
              <Button
                onClick={handleImport}
                disabled={isProcessing || !previewData || previewData.validRows === 0}
              >
                {isProcessing ? (
                  <>
                    <Skeleton className="h-4 w-4 me-2" />
                    {t('pilgrims.excelImport.importing')}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 me-2" />
                    {t('pilgrims.excelImport.importRows').replace('{count}', String(previewData?.validRows || 0))}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}