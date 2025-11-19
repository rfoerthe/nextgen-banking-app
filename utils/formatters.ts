export const replaceUmlauts = (str: string): string => {
  return str
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue')
    .replace(/ß/g, 'ss');
};

export const getTodayISOString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateToGerman = (isoDate: string): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
};

export const parseGermanDateToISO = (dateStr: string): string | null => {
  if (!dateStr) return null;
  // Matches D.M.YYYY or DD.MM.YYYY
  const match = dateStr.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  // Basic date validity check using Date object
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false;

  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time part of today
  inputDate.setHours(0, 0, 0, 0); 

  if (isNaN(inputDate.getTime())) {
    return false;
  }

  // Check if date is in the past
  if (inputDate < today) return false;

  return true;
};

export const isValidIBAN = (iban: string): boolean => {
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();

  // 1. Basis-Strukturprüfung: Ländercode (2) + Prüfziffer (2) + BBAN (max 30)
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(cleanIban)) {
    return false;
  }

  // 2. Spezifische Längenprüfung für Deutschland (DE)
  if (cleanIban.startsWith('DE') && cleanIban.length !== 22) {
    return false;
  }

  // 3. Modulo 97 Prüfsummen-Validierung (ISO 7064)
  const rearranged = cleanIban.slice(4) + cleanIban.slice(0, 4);

  let numericString = '';
  for (let i = 0; i < rearranged.length; i++) {
    const charCode = rearranged.charCodeAt(i);
    if (charCode >= 48 && charCode <= 57) {
      numericString += rearranged[i];
    } else if (charCode >= 65 && charCode <= 90) {
      numericString += (charCode - 55).toString();
    } else {
      return false; 
    }
  }

  try {
    return BigInt(numericString) % 97n === 1n;
  } catch (e) {
    console.error("Fehler bei IBAN Validierung:", e);
    return false;
  }
};

export const isValidBIC = (bic: string): boolean => {
  const regex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
  return regex.test(bic);
};

export const formatCurrency = (amount: string): string => {
  const num = parseFloat(amount.replace(',', '.'));
  if (isNaN(num)) return '0,00 €';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(num);
};