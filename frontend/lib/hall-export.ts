import { Hall, Bed } from '@/types/hall';
import { Pilgrim } from '@/types/pilgrim';
import * as XLSX from 'xlsx';

export interface HallExportData {
  hallInfo: {
    name: string;
    code: string;
    type: string;
    capacity: number;
    occupied: number;
    available: number;
    occupancyRate: number;
  };
  beds: {
    bedNumber: string;
    status: string;
    pilgrimName?: string;
    pilgrimRegistration?: string;
    pilgrimNationality?: string;
    arrivalDate?: string;
    specialNeeds?: string;
  }[];
}

export async function exportHallToExcel(
  hall: Hall,
  pilgrims: Map<string, Pilgrim>,
  locale: string = 'ar'
): Promise<void> {
  const isArabic = locale === 'ar';
  
  // Prepare hall info
  const hallInfo = {
    [isArabic ? 'اسم القاعة' : 'Hall Name']: hall.name,
    [isArabic ? 'رمز القاعة' : 'Hall Code']: hall.code,
    [isArabic ? 'النوع' : 'Type']: hall.type === 'male' 
      ? (isArabic ? 'قاعة رجال' : 'Male Hall')
      : (isArabic ? 'قاعة نساء' : 'Female Hall'),
    [isArabic ? 'السعة الإجمالية' : 'Total Capacity']: hall.capacity,
    [isArabic ? 'الأسرّة المشغولة' : 'Occupied Beds']: hall.currentOccupancy,
    [isArabic ? 'الأسرّة المتاحة' : 'Available Beds']: hall.availableBeds,
    [isArabic ? 'نسبة الإشغال' : 'Occupancy Rate']: `${((hall.currentOccupancy / hall.capacity) * 100).toFixed(1)}%`,
  };
  
  // Prepare beds data
  const bedsData = hall.beds.map(bed => {
    const pilgrim = bed.pilgrimId ? pilgrims.get(bed.pilgrimId) : null;
    
    return {
      [isArabic ? 'رقم السرير' : 'Bed Number']: bed.number,
      [isArabic ? 'الحالة' : 'Status']: getStatusLabel(bed.status, isArabic),
      [isArabic ? 'اسم الحاج' : 'Pilgrim Name']: pilgrim?.fullName || '-',
      [isArabic ? 'رقم التسجيل' : 'Registration No.']: pilgrim?.registrationNumber || '-',
      [isArabic ? 'الجنسية' : 'Nationality']: pilgrim?.nationality || '-',
      [isArabic ? 'تاريخ الوصول' : 'Arrival Date']: pilgrim?.arrivalDate 
        ? new Date(pilgrim.arrivalDate).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')
        : '-',
      [isArabic ? 'احتياجات خاصة' : 'Special Needs']: bed.isSpecialNeeds 
        ? (isArabic ? 'نعم' : 'Yes')
        : (isArabic ? 'لا' : 'No'),
    };
  });
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Add hall info sheet
  const hallInfoSheet = XLSX.utils.json_to_sheet([hallInfo]);
  XLSX.utils.book_append_sheet(wb, hallInfoSheet, isArabic ? 'معلومات القاعة' : 'Hall Information');
  
  // Add beds sheet
  const bedsSheet = XLSX.utils.json_to_sheet(bedsData);
  XLSX.utils.book_append_sheet(wb, bedsSheet, isArabic ? 'الأسرّة' : 'Beds');
  
  // Generate filename
  const fileName = `${hall.name}_${hall.code}_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  // Write file
  XLSX.writeFile(wb, fileName);
}

export async function exportHallToPDF(
  hall: Hall,
  pilgrims: Map<string, Pilgrim>,
  locale: string = 'ar'
): Promise<void> {
  // For now, we'll create a printable HTML version
  // In production, you'd use a proper PDF library like jsPDF or puppeteer
  
  const isArabic = locale === 'ar';
  const occupancyRate = ((hall.currentOccupancy / hall.capacity) * 100).toFixed(1);
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  const html = `
    <!DOCTYPE html>
    <html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${locale}">
    <head>
      <meta charset="UTF-8">
      <title>${hall.name} - ${hall.code}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          direction: ${isArabic ? 'rtl' : 'ltr'};
        }
        h1, h2 {
          color: #333;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        .info-item {
          padding: 10px;
          background: #f5f5f5;
          border-radius: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: ${isArabic ? 'right' : 'left'};
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        .status-vacant { background-color: #d4edda; }
        .status-occupied { background-color: #f8d7da; }
        .status-reserved { background-color: #fff3cd; }
        .status-maintenance { background-color: #e2e3e5; }
        @media print {
          body { margin: 10px; }
        }
      </style>
    </head>
    <body>
      <h1>${hall.name} (${hall.code})</h1>
      <div class="info-grid">
        <div class="info-item">
          <strong>${isArabic ? 'النوع:' : 'Type:'}</strong> 
          ${hall.type === 'male' ? (isArabic ? 'قاعة رجال' : 'Male Hall') : (isArabic ? 'قاعة نساء' : 'Female Hall')}
        </div>
        <div class="info-item">
          <strong>${isArabic ? 'السعة الإجمالية:' : 'Total Capacity:'}</strong> ${hall.capacity}
        </div>
        <div class="info-item">
          <strong>${isArabic ? 'الأسرّة المشغولة:' : 'Occupied Beds:'}</strong> ${hall.currentOccupancy}
        </div>
        <div class="info-item">
          <strong>${isArabic ? 'نسبة الإشغال:' : 'Occupancy Rate:'}</strong> ${occupancyRate}%
        </div>
      </div>
      
      <h2>${isArabic ? 'قائمة الأسرّة' : 'Beds List'}</h2>
      <table>
        <thead>
          <tr>
            <th>${isArabic ? 'رقم السرير' : 'Bed Number'}</th>
            <th>${isArabic ? 'الحالة' : 'Status'}</th>
            <th>${isArabic ? 'اسم الحاج' : 'Pilgrim Name'}</th>
            <th>${isArabic ? 'رقم التسجيل' : 'Registration No.'}</th>
            <th>${isArabic ? 'الجنسية' : 'Nationality'}</th>
          </tr>
        </thead>
        <tbody>
          ${hall.beds.map(bed => {
            const pilgrim = bed.pilgrimId ? pilgrims.get(bed.pilgrimId) : null;
            return `
              <tr class="status-${bed.status}">
                <td>${bed.number}</td>
                <td>${getStatusLabel(bed.status, isArabic)}</td>
                <td>${pilgrim?.fullName || '-'}</td>
                <td>${pilgrim?.registrationNumber || '-'}</td>
                <td>${pilgrim?.nationality || '-'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
}

function getStatusLabel(status: Bed['status'], isArabic: boolean): string {
  const labels = {
    vacant: isArabic ? 'شاغر' : 'Vacant',
    occupied: isArabic ? 'مشغول' : 'Occupied',
    reserved: isArabic ? 'محجوز' : 'Reserved',
    maintenance: isArabic ? 'صيانة' : 'Maintenance',
  };
  return labels[status];
}