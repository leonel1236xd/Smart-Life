// Configuración y utilidades de zona horaria para Bolivia (America/La_Paz, UTC-4)

export const STORE_TIMEZONE = 'America/La_Paz';

/**
 * Obtiene la fecha actual en la zona horaria de Bolivia en formato YYYY-MM-DD
 */
export function getTodayStringBolivia(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: STORE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/**
 * Obtiene el mes actual en la zona horaria de Bolivia en formato YYYY-MM
 */
export function getCurrentMonthStringBolivia(): string {
  const today = getTodayStringBolivia();
  return today.substring(0, 7);
}

/**
 * Formatea una fecha ISO a fecha legible en Bolivia (ej: "16 nov 2026")
 */
export function formatDateBolivia(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('es-BO', {
    timeZone: STORE_TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Formatea una hora ISO en formato 12h/24h en Bolivia (ej: "15:42")
 */
export function formatTimeBolivia(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('es-BO', {
    timeZone: STORE_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Formatea fecha y hora completas
 */
export function formatDateTimeBolivia(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('es-BO', {
    timeZone: STORE_TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Retorna el rango UTC exacto para un día específico en Bolivia (YYYY-MM-DD)
 * Bolivia es UTC-4 (offset fijo: -04:00)
 */
export function getDateRangeForDay(dateStr: string): { startIso: string; endIso: string } {
  // dateStr ej: "2026-11-16"
  const startIso = `${dateStr}T00:00:00.000-04:00`;
  const endIso = `${dateStr}T23:59:59.999-04:00`;
  return {
    startIso: new Date(startIso).toISOString(),
    endIso: new Date(endIso).toISOString(),
  };
}

/**
 * Retorna el rango UTC exacto para un mes específico en Bolivia (YYYY-MM)
 */
export function getDateRangeForMonth(monthStr: string): { startIso: string; endIso: string } {
  // monthStr ej: "2026-11"
  const [yearStr, monthPart] = monthStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthPart, 10);

  // Último día del mes (mes es 1-based, pasamos month a Date constructor para obtener día 0 del mes siguiente)
  const lastDay = new Date(year, month, 0).getDate();
  const lastDayStr = String(lastDay).padStart(2, '0');

  const startIso = `${monthStr}-01T00:00:00.000-04:00`;
  const endIso = `${monthStr}-${lastDayStr}T23:59:59.999-04:00`;

  return {
    startIso: new Date(startIso).toISOString(),
    endIso: new Date(endIso).toISOString(),
  };
}

/**
 * Retorna el rango UTC exacto para un rango de fechas personalizado en Bolivia (YYYY-MM-DD a YYYY-MM-DD)
 */
export function getDateRangeCustom(
  startDateStr: string,
  endDateStr: string
): { startIso: string; endIso: string } {
  const startIso = `${startDateStr}T00:00:00.000-04:00`;
  const endIso = `${endDateStr}T23:59:59.999-04:00`;
  return {
    startIso: new Date(startIso).toISOString(),
    endIso: new Date(endIso).toISOString(),
  };
}

/**
 * Determina si una fecha corresponde al día de hoy en Bolivia
 */
export function isTodayBolivia(isoString: string): boolean {
  if (!isoString) return false;
  const todayStr = getTodayStringBolivia();
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: STORE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(isoString));
  return todayStr === dateStr;
}
