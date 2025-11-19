import React from 'react';
import { TransferData, TransferType } from '../types';
import { Check, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatDateToGerman } from '../utils/formatters';

interface SuccessProps {
  data: TransferData;
  onReset: () => void;
}

const Success: React.FC<SuccessProps> = ({ data, onReset }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-10 max-w-lg w-full mx-auto text-center animate-scale-in">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-10 h-10 text-green-600" />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Überweisung erfolgreich!</h2>
      <p className="text-gray-500 mb-8">
        Ihre <span className="font-semibold text-gray-700">{data.type}</span> wurde entgegengenommen.
      </p>

      <div className="bg-gray-50 p-6 rounded-xl mb-8 border border-gray-100">
        <div className="flex flex-col gap-2">
           <div className="flex justify-between text-sm">
             <span className="text-gray-500">Empfänger</span>
             <span className="font-medium text-gray-900">{data.receiver}</span>
           </div>
           <div className="flex justify-between text-sm">
             <span className="text-gray-500">Betrag</span>
             <span className="font-bold text-gray-900">{formatCurrency(data.amount)}</span>
           </div>
           {data.type === TransferType.SCHEDULED && (
             <div className="flex justify-between text-sm">
               <span className="text-gray-500">Ausführung</span>
               <span className="font-medium text-blue-600">{formatDateToGerman(data.executionDate)}</span>
             </div>
           )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-8">
        <ShieldCheck className="w-4 h-4" />
        <span>Sichere SSL-Verschlüsselung</span>
      </div>

      <button
        onClick={onReset}
        className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
      >
        Neue Überweisung
      </button>
    </div>
  );
};

export default Success;