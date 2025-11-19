import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate?: string; // ISO YYYY-MM-DD
  onChange: (isoDate: string) => void;
  minDate?: string; // ISO YYYY-MM-DD
  onClose?: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onChange, minDate, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(() => 
    selectedDate ? new Date(selectedDate) : new Date()
  );

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return days;
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Convert Sun=0 to Mon=0 for German week
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    onChange(isoDate);
    if (onClose) onClose();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const sel = new Date(selectedDate);
    return (
      day === sel.getDate() &&
      currentMonth.getMonth() === sel.getMonth() &&
      currentMonth.getFullYear() === sel.getFullYear()
    );
  };

  const isDisabled = (day: number) => {
    if (!minDate) return false;
    const current = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Reset time for accurate comparison
    current.setHours(0, 0, 0, 0);
    
    const min = new Date(minDate);
    min.setHours(0, 0, 0, 0);
    
    return current < min;
  };

  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-72 select-none animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={handlePrevMonth}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          type="button"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="font-semibold text-gray-800">
          {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button 
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          type="button"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
          <div key={day} className="text-center text-xs text-gray-400 font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const disabled = isDisabled(day);
          const selected = isSelected(day);
          const today = isToday(day);

          return (
            <button
              key={day}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!disabled) handleDateClick(day);
              }}
              disabled={disabled}
              type="button"
              className={`
                h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all
                ${selected 
                  ? 'bg-blue-600 text-white font-bold shadow-md' 
                  : disabled 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'hover:bg-blue-50 text-gray-700 font-medium'
                }
                ${today && !selected ? 'border border-blue-600 text-blue-600' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;