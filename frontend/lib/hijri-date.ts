/**
 * Hijri Date Utilities
 * Converts Gregorian dates to Hijri (Islamic) dates and provides formatting
 */

// Hijri months in Arabic and English
const HIJRI_MONTHS_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة',
  'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

const HIJRI_MONTHS_EN = [
  'Muharram', 'Safar', 'Rabi\' al-Awwal', 'Rabi\' al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani',
  'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
];

export interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
}

/**
 * Converts a Gregorian date to Hijri date
 * This is a simplified conversion - in production, you might want to use a more accurate library
 */
export function gregorianToHijri(gregorianDate: Date, locale: string = 'ar'): HijriDate {
  // Simple approximation: Hijri year is roughly 11 days shorter than Gregorian
  // This is a basic conversion - for precise calculations, consider using libraries like moment-hijri
  
  const gregorianYear = gregorianDate.getFullYear();
  const gregorianMonth = gregorianDate.getMonth() + 1;
  const gregorianDay = gregorianDate.getDate();
  
  // Approximate conversion formula
  // Note: This is simplified and may not be 100% accurate for all dates
  const hijriYear = Math.floor(((gregorianYear - 622) * 33) / 32) + 1;
  
  // Simple month conversion (this is very approximate)
  const dayOfYear = getDayOfYear(gregorianDate);
  const hijriMonth = Math.floor((dayOfYear * 12) / 355) + 1;
  const hijriDay = Math.floor(((dayOfYear * 12) % 355) / 12) + 1;
  
  const monthNames = locale === 'ar' ? HIJRI_MONTHS_AR : HIJRI_MONTHS_EN;
  const monthIndex = Math.min(Math.max(hijriMonth - 1, 0), 11);
  
  return {
    year: hijriYear,
    month: hijriMonth,
    day: Math.min(Math.max(hijriDay, 1), 30), // Ensure day is between 1-30
    monthName: monthNames[monthIndex]
  };
}

/**
 * Gets the day of year for a given date
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Formats a Hijri date as a string
 */
export function formatHijriDate(hijriDate: HijriDate, locale: string = 'ar', includeTime?: boolean): string {
  if (locale === 'ar') {
    return `${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year}هـ`;
  } else {
    return `${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year} AH`;
  }
}

/**
 * Formats a Gregorian date as Hijri
 */
export function formatDateAsHijri(date?: Date, locale: string = 'ar', includeTime?: boolean): string {
  if (!date) return '-';
  
  const hijriDate = gregorianToHijri(date, locale);
  let result = formatHijriDate(hijriDate, locale);
  
  if (includeTime) {
    // Format time in 24-hour format without any calendar reference
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    result += ` ${hours}:${minutes}`;
  }
  
  return result;
}

/**
 * Formats a Hijri date in short format
 */
export function formatHijriDateShort(hijriDate: HijriDate, locale: string = 'ar'): string {
  if (locale === 'ar') {
    return `${hijriDate.day}/${hijriDate.month}/${hijriDate.year}هـ`;
  } else {
    return `${hijriDate.day}/${hijriDate.month}/${hijriDate.year} AH`;
  }
}

/**
 * Formats a Gregorian date as short Hijri
 */
export function formatDateAsHijriShort(date?: Date, locale: string = 'ar'): string {
  if (!date) return '-';
  
  const hijriDate = gregorianToHijri(date, locale);
  return formatHijriDateShort(hijriDate, locale);
}