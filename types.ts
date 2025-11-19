export enum TransferType {
  STANDARD = 'Standardüberweisung',
  SCHEDULED = 'Terminüberweisung',
  INSTANT = 'Sofortüberweisung'
}

export interface TransferData {
  receiver: string;
  iban: string;
  bic: string;
  bankName: string;
  bankCity: string;
  purpose: string;
  amount: string; // Keep as string for input handling, parse later
  type: TransferType;
  executionDate: string; // dd.mm.yyyy
}

export interface ValidationErrors {
  receiver?: string;
  iban?: string;
  bic?: string;
  purpose?: string;
  amount?: string;
  executionDate?: string;
}

export interface BankLookupResult {
  bankName: string;
  city: string;
}