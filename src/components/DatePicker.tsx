'use client';

import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/style.css';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: Date;
  label?: string;
}

export default function DatePicker({
  value,
  onChange,
  minDate = new Date(),
  label = 'Select Date',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = value ? new Date(value) : undefined;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'));
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full">
      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
        {label} <span className="text-emerald-500">*</span>
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-950 border-2 border-slate-700 hover:border-slate-600 rounded-xl px-4 py-3 text-white font-mono focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer text-left flex justify-between items-center"
      >
        <span>
          {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Click to select date'}
        </span>
        <svg
          className="w-5 h-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 bg-slate-950 border-2 border-slate-700 rounded-xl p-3 z-50 shadow-2xl">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => date < minDate}
            className="bg-slate-950 text-white text-xs [&_button]:text-white [&_button]:hover:bg-emerald-600 [&_button]:text-xs [&_button]:h-7 [&_button]:w-7 [&_.rdp-cell]:p-0 [&_.rdp-head]:text-slate-400 [&_.rdp-head]:text-xs [&_.rdp-caption]:text-slate-300 [&_.rdp-caption]:text-sm [&_.rdp-caption_button]:text-slate-300 [&_.rdp-month]:mb-2"
            footer={
              selectedDate && (
                <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-emerald-400 font-mono">
                  {format(selectedDate, 'MMM dd, yyyy')}
                </div>
              )
            }
          />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-white py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
