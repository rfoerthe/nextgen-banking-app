import React from 'react';
import { TransferData, TransferType } from '../types';
import { formatCurrency, formatDateToGerman } from '../utils/formatters';
import { CheckCircle, ArrowRight, Calendar, Zap, Building2 } from 'lucide-react';

interface SummaryProps {
  data: TransferData;
  onBack: () => void;
  onConfirm: () => void;
}

const Summary: React.FC<SummaryProps> = ({ data, onBack, onConfirm }) => {
  const getIcon = () => {
    switch (data.type) {
      case TransferType.INSTANT: return <Zap className="w-5 h-5 text-yellow-500" />;
      case TransferType.SCHEDULED: return <Calendar className="w-5 h-5 text-blue-500" />;
      default: return <ArrowRight className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="bg-blue-50 p-3 rounded-full inline-flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Angaben prüfen</h2>
        <p className="text-gray-500">Bitte überprüfen Sie Ihre Überweisungsdaten.</p>
      </div>

      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-100">
          <span className="text-sm font-medium text-gray-500">Überweisungsart</span>
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            {getIcon()}
            {data.type}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Empfänger</label>
              <p className="text-lg font-medium text-gray-900">{data.receiver}</p>
            </div>
            <div className="text-right md:text-left">
              <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Betrag</label>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.amount)}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
             <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Bankverbindung</label>
             <div className="mt-1 font-mono text-sm text-gray-700 bg-white border border-gray-200 p-3 rounded">
                <div className="flex flex-col gap-1">
                  <span><span className="text-gray-400 select-none mr-2">IBAN:</span>{data.iban}</span>
                  <span><span className="text-gray-400 select-none mr-2">BIC:</span>{data.bic}</span>
                </div>
             </div>
             <div className="mt-2 flex items-center text-sm text-gray-600 gap-2">
                <Building2 className="w-4 h-4" />
                {data.bankName} {data.bankCity && `(${data.bankCity})`}
             </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Verwendungszweck</label>
            <p className="text-gray-800 mt-1">{data.purpose}</p>
          </div>

          {data.type === TransferType.SCHEDULED && (
             <div className="pt-4 border-t border-gray-200">
               <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Ausführung am</label>
               <p className="text-gray-800 mt-1">{formatDateToGerman(data.executionDate)}</p>
             </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Zurück
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
        >
          Ausführen
        </button>
      </div>
    </div>
  );
};

export default Summary;