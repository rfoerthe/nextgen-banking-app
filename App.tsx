import React, { useState, useEffect } from 'react';
import { TransferData, TransferType, ValidationErrors } from './types';
import { 
  replaceUmlauts, 
  isValidDate, 
  isValidIBAN, 
  isValidBIC, 
  getTodayISOString, 
  formatDateToGerman,
  parseGermanDateToISO
} from './utils/formatters';
import { lookupBankByBIC } from './services/geminiService';
import InputField from './components/InputField';
import Summary from './components/Summary';
import Success from './components/Success';
import Calendar from './components/Calendar';
import { Building2, CreditCard, User, FileText, Euro, Loader2, Landmark, Calendar as CalendarIcon } from 'lucide-react';

// Initial State
const initialData: TransferData = {
  receiver: '',
  iban: '',
  bic: '',
  bankName: '',
  bankCity: '',
  purpose: '',
  amount: '',
  type: TransferType.STANDARD,
  executionDate: ''
};

enum AppStep {
  INPUT,
  SUMMARY,
  SUCCESS
}

function App() {
  const [step, setStep] = useState<AppStep>(AppStep.INPUT);
  const [data, setData] = useState<TransferData>(initialData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isCheckingBank, setIsCheckingBank] = useState(false);
  
  // Calendar & Date Input State
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateInputValue, setDateInputValue] = useState('');

  // Handle Umlaut replacement on Blur
  const handleBlur = (field: keyof TransferData) => (e: React.FocusEvent<HTMLInputElement>) => {
    if (field === 'receiver' || field === 'purpose') {
      const newValue = replaceUmlauts(e.target.value);
      if (newValue !== data[field]) {
        setData(prev => ({ ...prev, [field]: newValue }));
      }
    }
  };

  // Handle Input Change
  const handleChange = (field: keyof TransferData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user types
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Special handler for Date Text Input (Manual Typing)
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDateInputValue(val);
    
    // Clear formatting error while typing
    if (errors.executionDate) {
      setErrors(prev => ({ ...prev, executionDate: undefined }));
    }

    // Try to parse and update main state if valid
    const isoDate = parseGermanDateToISO(val);
    if (isoDate) {
      setData(prev => ({ ...prev, executionDate: isoDate }));
    } else {
      // If invalid format, keep executionDate empty or old? 
      // Better to empty it to ensure validation fails if user leaves it invalid
      setData(prev => ({ ...prev, executionDate: '' }));
    }
  };

  const handleDateSelect = (isoDate: string) => {
    setData(prev => ({ ...prev, executionDate: isoDate }));
    setDateInputValue(formatDateToGerman(isoDate));
    setShowCalendar(false);
    if (errors.executionDate) {
      setErrors(prev => ({ ...prev, executionDate: undefined }));
    }
  };

  const handleCalendarBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // Only close if focus moves OUTSIDE the container (input + calendar)
    // e.relatedTarget is the element receiving focus
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setShowCalendar(false);
    }
  };

  // Auto-lookup Bank Name via Gemini when BIC looks complete
  useEffect(() => {
    const fetchBankDetails = async () => {
      if (isValidBIC(data.bic)) {
        setIsCheckingBank(true);
        const result = await lookupBankByBIC(data.bic);
        setIsCheckingBank(false);
        
        if (result) {
          setData(prev => ({ ...prev, bankName: result.bankName, bankCity: result.city }));
        } else {
          setData(prev => ({ ...prev, bankName: '', bankCity: '' }));
        }
      }
    };

    const timeoutId = setTimeout(() => {
        if (data.bic.length >= 8) {
            fetchBankDetails();
        }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [data.bic]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    if (!data.receiver.trim()) {
      newErrors.receiver = 'Empfänger ist erforderlich.';
      isValid = false;
    }

    if (!isValidIBAN(data.iban)) {
      newErrors.iban = 'Bitte geben Sie eine gültige IBAN ein.';
      isValid = false;
    }

    if (data.bic && !isValidBIC(data.bic)) {
      newErrors.bic = 'Das Format der BIC ist ungültig.';
      isValid = false;
    }

    const amountStr = data.amount.replace(',', '.');
    const amountNum = parseFloat(amountStr);
    if (!amountStr || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Bitte geben Sie einen positiven Betrag ein.';
      isValid = false;
    }

    if (data.type === TransferType.SCHEDULED) {
      if (!data.executionDate) {
        newErrors.executionDate = 'Bitte wählen Sie ein gültiges Datum (TT.MM.JJJJ).';
        isValid = false;
      } else if (!isValidDate(data.executionDate)) {
        newErrors.executionDate = 'Das Datum darf nicht in der Vergangenheit liegen.';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCheck = () => {
    if (validateForm()) {
      setStep(AppStep.SUMMARY);
    }
  };

  const handleExecute = () => {
    setStep(AppStep.SUCCESS);
  };

  const handleReset = () => {
    setData(initialData);
    setDateInputValue('');
    setErrors({});
    setStep(AppStep.INPUT);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Landmark className="w-10 h-10 text-blue-700" />
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">NextGen Banking</h1>
        </div>
        <p className="text-gray-500">Sicher. Schnell. Intelligent.</p>
      </header>

      <main className="w-full max-w-3xl">
        {step === AppStep.INPUT && (
          <div className="bg-white rounded-xl shadow-xl animate-fade-in">
            <div className="bg-blue-600 p-6 text-white rounded-t-xl">
               <h2 className="text-xl font-semibold flex items-center gap-2">
                 <FileText className="w-5 h-5" /> Neue Überweisung
               </h2>
            </div>
            
            <div className="p-6 md:p-8 space-y-6">
              {/* Row 1: Receiver */}
              <InputField
                label="Empfänger"
                placeholder="Max Mustermann"
                value={data.receiver}
                onChange={handleChange('receiver')}
                onBlur={handleBlur('receiver')}
                error={errors.receiver}
                rightElement={<User className="w-5 h-5 text-gray-400" />}
              />

              {/* Row 2: IBAN & BIC */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="IBAN"
                  placeholder="DE00 0000 0000 0000 0000 00"
                  value={data.iban}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                    handleChange('iban')(e);
                  }}
                  error={errors.iban}
                  maxLength={34}
                  rightElement={<CreditCard className="w-5 h-5 text-gray-400" />}
                />
                
                <div className="relative">
                    <InputField
                    label="BIC"
                    placeholder="GENO DE DEF 1XX"
                    value={data.bic}
                    onChange={(e) => {
                        e.target.value = e.target.value.toUpperCase();
                        handleChange('bic')(e);
                    }}
                    error={errors.bic}
                    maxLength={11}
                    rightElement={isCheckingBank ? <Loader2 className="w-4 h-4 text-blue-500 animate-spin" /> : <Building2 className="w-5 h-5 text-gray-400" />}
                    />
                    {(data.bankName || isCheckingBank) && (
                        <div className={`absolute top-full left-0 mt-1 w-full text-xs rounded bg-blue-50 text-blue-800 p-2 border border-blue-100 transition-all duration-300 ${data.bankName ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                            {isCheckingBank ? 'Bankdaten werden abgerufen...' : `${data.bankName} ${data.bankCity ? `, ${data.bankCity}` : ''}`}
                        </div>
                    )}
                </div>
              </div>

              {/* Row 3: Purpose */}
              <InputField
                label="Verwendungszweck (Optional)"
                placeholder="Rechnungsnummer 12345"
                value={data.purpose}
                onChange={handleChange('purpose')}
                onBlur={handleBlur('purpose')}
                error={errors.purpose}
                maxLength={140}
              />

              {/* Row 4: Amount & Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <InputField
                    label="Betrag (EUR)"
                    placeholder="0,00"
                    value={data.amount}
                    onChange={handleChange('amount')}
                    error={errors.amount}
                    rightElement={<Euro className="w-4 h-4 text-gray-400" />}
                  />
                </div>
                
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Überweisungsart</label>
                   <div className="relative">
                     <select
                        value={data.type}
                        onChange={handleChange('type')}
                        className="w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                     >
                       {Object.values(TransferType).map((t) => (
                         <option key={t} value={t}>{t}</option>
                       ))}
                     </select>
                     <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                       <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                     </div>
                   </div>
                </div>
              </div>

              {/* Conditional: Execution Date with Custom Calendar */}
              {data.type === TransferType.SCHEDULED && (
                 <div className="animate-slide-down relative z-20" onBlur={handleCalendarBlur}>
                    <InputField
                      type="text"
                      label="Ausführung am"
                      placeholder="TT.MM.JJJJ"
                      value={dateInputValue}
                      onChange={handleDateInputChange}
                      onClick={() => setShowCalendar(true)}
                      error={errors.executionDate}
                      className="z-10"
                      rightElement={
                        <button 
                          type="button" 
                          onClick={() => setShowCalendar(!showCalendar)}
                          className="p-1 hover:bg-gray-100 rounded-full focus:outline-none transition-colors pointer-events-auto"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <CalendarIcon className="w-5 h-5 text-blue-500" />
                        </button>
                      }
                    />
                    
                    {/* Calendar Popup */}
                    {showCalendar && (
                      <div 
                        className="absolute top-full left-0 mt-2 z-50 animate-scale-in origin-top-left"
                        onMouseDown={(e) => e.preventDefault()} // Prevents blur when interacting with calendar
                      >
                         <Calendar 
                           selectedDate={data.executionDate}
                           onChange={handleDateSelect}
                           minDate={getTodayISOString()}
                           onClose={() => setShowCalendar(false)}
                         />
                      </div>
                    )}
                 </div>
              )}

              <div className="pt-4 flex justify-end relative z-10">
                <button
                  onClick={handleCheck}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg w-full md:w-auto flex items-center justify-center gap-2"
                >
                   Prüfen <ArrowRightIcon />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === AppStep.SUMMARY && (
          <Summary data={data} onBack={() => setStep(AppStep.INPUT)} onConfirm={handleExecute} />
        )}

        {step === AppStep.SUCCESS && (
          <Success data={data} onReset={handleReset} />
        )}
      </main>
      
      <footer className="mt-12 text-center text-xs text-gray-400">
        &copy; 2024 NextGen SEPA Banking. Powered by React & Gemini AI.
      </footer>
    </div>
  );
}

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default App;