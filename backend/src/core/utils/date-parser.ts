import momentJalaali from 'moment-jalaali';
import momentHijri from 'moment-hijri';
import moment from 'moment';

export function toEnglishDigits(str: string): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

/**
 * Transforms string input (Jalali, Hijri, Gregorian, or ISO) into a JavaScript Date object.
 */
export function parseDateString({ value }: { value: any }): any {
  if (!value) return value;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    value = toEnglishDigits(value).trim();
    if (value.includes('T') && value.endsWith('Z')) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    }
    const match = value.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const day = parseInt(match[3], 10);

      if (year >= 1300 && year <= 1499) {
        if (year > 1415 && year <= 1499) {
          const hDate = momentHijri(`${year}/${month}/${day}`, 'iYYYY/iM/iD');
          if (hDate.isValid()) return hDate.toDate();
        } else {
          const jDate = momentJalaali(`${year}/${month}/${day}`, 'jYYYY/jM/jD');
          if (jDate.isValid()) return jDate.toDate();
        }
      } else {
        const d = new Date(value.replace(/\//g, '-'));
        if (!isNaN(d.getTime())) return d;
      }
    }
    const fallBack = new Date(value);
    if (!isNaN(fallBack.getTime())) {
      return fallBack;
    }
  }
  return value;
}

/**
 * Transforms string input (Jalali, Hijri, Gregorian, or ISO) into an ASCII ISO date string YYYY-MM-DD.
 */
export function parseToIsoDateString(arg: any): any {
  let value = arg;
  if (arg && typeof arg === 'object' && 'value' in arg) {
    value = arg.value;
  }
  if (!value) return value;
  if (value instanceof Date) {
    return toEnglishDigits(value.toISOString().split('T')[0]);
  }
  if (typeof value === 'string') {
    let str = toEnglishDigits(value).trim().replace(/\//g, '-');
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const parts = str.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      if (year >= 1300 && year <= 1499) {
        if (year > 1415 && year <= 1499) {
          const hDate = momentHijri(`${year}/${month}/${day}`, 'iYYYY/iM/iD');
          if (hDate.isValid()) return toEnglishDigits(hDate.clone().locale('en').format('YYYY-MM-DD'));
        } else {
          const jDate = momentJalaali(`${year}/${month}/${day}`, 'jYYYY/jM/jD');
          if (jDate.isValid()) return toEnglishDigits(jDate.clone().locale('en').format('YYYY-MM-DD'));
        }
      }
      return str;
    }
    if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
      return str.split('T')[0];
    }
    const match = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const day = parseInt(match[3], 10);

      if (year >= 1300 && year <= 1499) {
        if (year > 1415 && year <= 1499) {
          const hDate = momentHijri(`${year}/${month}/${day}`, 'iYYYY/iM/iD');
          if (hDate.isValid()) {
            return toEnglishDigits(hDate.clone().locale('en').format('YYYY-MM-DD'));
          }
        } else {
          const jDate = momentJalaali(`${year}/${month}/${day}`, 'jYYYY/jM/jD');
          if (jDate.isValid()) {
            return toEnglishDigits(jDate.clone().locale('en').format('YYYY-MM-DD'));
          }
        }
      } else {
        const d = moment.utc(`${year}-${month}-${day}`, 'YYYY-M-D', true);
        if (d.isValid()) {
          return toEnglishDigits(d.clone().locale('en').format('YYYY-MM-DD'));
        }
      }
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return toEnglishDigits(d.toISOString().split('T')[0]);
    }
  }
  return value;
}

export function ensureIsoTimestamp(arg: any): string {
  if (!arg) {
    return new Date().toISOString();
  }

  const strVal = typeof arg === 'string' ? arg : String(arg);
  const raw = toEnglishDigits(strVal).trim();
  if (!raw) {
    return new Date().toISOString();
  }

  const now = new Date();
  const h = now.getUTCHours();
  const min = now.getUTCMinutes();
  const s = now.getUTCSeconds();
  const ms = now.getUTCMilliseconds();

  // If already a valid full ISO string or datetime string containing 'T' or ' '
  if (raw.includes('T') || raw.includes(' ')) {
    const dObj = new Date(raw.replace(' ', 'T'));
    if (!isNaN(dObj.getTime())) {
      // If time component is 00:00:00, replace with current time
      if (dObj.getUTCHours() === 0 && dObj.getUTCMinutes() === 0 && dObj.getUTCSeconds() === 0) {
        dObj.setUTCHours(h, min, s, ms);
      }
      return dObj.toISOString();
    }
  }

  try {
    const cleanStr = raw.split('T')[0].split(' ')[0];
    const parts = cleanStr.includes('-') ? cleanStr.split('-') : cleanStr.split('/');
    let year = 0, month = 0, day = 0;

    if (parts.length >= 3) {
      const p0 = parseInt(parts[0], 10);
      const p2 = parseInt(parts[2], 10);
      if (p0 >= 1000) {
        year = p0;
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      } else if (p2 >= 1000) {
        year = p2;
        month = parseInt(parts[1], 10);
        day = parseInt(parts[0], 10);
      }
    } else {
      const onlyDigits = cleanStr.replace(/\D/g, '');
      if (onlyDigits.length === 8) {
        const first4 = parseInt(onlyDigits.substring(0, 4), 10);
        const last4 = parseInt(onlyDigits.substring(4, 8), 10);
        if (first4 >= 1000) {
          year = first4;
          month = parseInt(onlyDigits.substring(4, 6), 10);
          day = parseInt(onlyDigits.substring(6, 8), 10);
        } else if (last4 >= 1000) {
          year = last4;
          month = parseInt(onlyDigits.substring(2, 4), 10);
          day = parseInt(onlyDigits.substring(0, 2), 10);
        }
      }
    }

    if (year >= 1300 && year <= 1500 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const jDate = momentJalaali(`${year}/${month}/${day}`, 'jYYYY/jM/jD');
      if (jDate.isValid()) {
        const gregStr = jDate.clone().locale('en').format('YYYY-MM-DD');
        const gy = parseInt(gregStr.substring(0, 4), 10);
        const gm = parseInt(gregStr.substring(5, 7), 10) - 1;
        const gd = parseInt(gregStr.substring(8, 10), 10);
        return new Date(Date.UTC(gy, gm, gd, h, min, s, ms)).toISOString();
      }
    } else if (year >= 1900 && year <= 2200 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return new Date(Date.UTC(year, month - 1, day, h, min, s, ms)).toISOString();
    }
  } catch (e) {
    console.error('ensureIsoTimestamp error:', e);
  }

  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    if (d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0) {
      d.setUTCHours(h, min, s, ms);
    }
    return d.toISOString();
  }

  return new Date().toISOString();
}

export function ensureSlashGregorianDate(arg: any): string {
  if (!arg) {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${day}`;
  }

  const raw = toEnglishDigits(typeof arg === 'string' ? arg : String(arg)).trim();
  if (!raw) {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${day}`;
  }

  try {
    const cleanStr = raw.split('T')[0].split(' ')[0];
    const parts = cleanStr.includes('-') ? cleanStr.split('-') : cleanStr.split('/');
    let year = 0, month = 0, day = 0;

    if (parts.length >= 3) {
      const p0 = parseInt(parts[0], 10);
      const p2 = parseInt(parts[2], 10);
      if (p0 >= 1000) {
        year = p0;
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      } else if (p2 >= 1000) {
        year = p2;
        month = parseInt(parts[1], 10);
        day = parseInt(parts[0], 10);
      }
    } else {
      const onlyDigits = cleanStr.replace(/\D/g, '');
      if (onlyDigits.length === 8) {
        const first4 = parseInt(onlyDigits.substring(0, 4), 10);
        const last4 = parseInt(onlyDigits.substring(4, 8), 10);
        if (first4 >= 1000) {
          year = first4;
          month = parseInt(onlyDigits.substring(4, 6), 10);
          day = parseInt(onlyDigits.substring(6, 8), 10);
        } else if (last4 >= 1000) {
          year = last4;
          month = parseInt(onlyDigits.substring(2, 4), 10);
          day = parseInt(onlyDigits.substring(0, 2), 10);
        }
      }
    }

    if (year >= 1300 && year <= 1500 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const jDate = momentJalaali(`${year}/${month}/${day}`, 'jYYYY/jM/jD');
      if (jDate.isValid()) {
        return toEnglishDigits(jDate.clone().locale('en').format('YYYY/MM/DD'));
      }
    } else if (year >= 1900 && year <= 2200 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
    }
  } catch (e) {
    console.error('ensureSlashGregorianDate error:', e);
  }

  const iso = parseToIsoDateString(arg);
  if (iso && typeof iso === 'string') {
    return toEnglishDigits(iso).replace(/-/g, '/').slice(0, 10);
  }

  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

