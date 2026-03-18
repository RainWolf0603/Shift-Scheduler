import React, { useState, useMemo } from 'react';
import { 
  format, 
  isSameDay, 
  startOfDay, 
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  addMonths,
  subMonths
} from 'date-fns';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Shift {
  id: string;
  date: Date;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [startTime, setStartTime] = useState("15:00");
  const [endTime, setEndTime] = useState("21:00");
  const [copied, setCopied] = useState(false);

  // Generate full month grid starting on Monday
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const addShift = () => {
    const newShift: Shift = {
      id: Math.random().toString(36).substr(2, 9),
      date: selectedDate,
      startTime,
      endTime,
    };
    setShifts([...shifts, newShift]);
  };

  const removeShift = (id: string) => {
    setShifts(shifts.filter(s => s.id !== id));
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const copyToClipboard = () => {
    if (shifts.length === 0) return;
    const text = [...shifts]
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(s => formatShiftDisplay(s))
      .join('\n');
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Format shift for display: "3/16 16-21"
  const formatShiftDisplay = (shift: Shift) => {
    const datePart = format(shift.date, 'M/d');
    const startHour = shift.startTime.split(':')[0];
    const endHour = shift.endTime.split(':')[0];
    return `${datePart} ${startHour}-${endHour}`;
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#4A4A4A] font-sans font-bold p-4 md:p-12 selection:bg-[#DCD7CC]">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DCD7CC] pb-8">
          <div className="space-y-1">
            <h1 className="text-4xl tracking-tight text-[#333]">排班管理</h1>
            <p className="text-[#8C8279] text-sm tracking-wide"></p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#8C8279] uppercase tracking-widest">
              {format(new Date(), 'yyyy . MM . dd')}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Calendar */}
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-white/50 backdrop-blur-sm rounded-sm border border-[#DCD7CC] p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl tracking-tight">
                  {format(currentMonth, 'yyyy / MM')}
                </h2>
                <div className="flex gap-4">
                  <button onClick={prevMonth} className="p-2 hover:bg-[#F0EDE5] rounded-full transition-colors">
                    <ChevronLeft className="w-5 h-5 text-[#8C8279]" />
                  </button>
                  <button onClick={nextMonth} className="p-2 hover:bg-[#F0EDE5] rounded-full transition-colors">
                    <ChevronRight className="w-5 h-5 text-[#8C8279]" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 border-t border-l border-[#E5E5E5]">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                  <div key={day} className="text-center text-[10px] text-[#8C8279] py-3 border-r border-b border-[#E5E5E5] bg-[#FAF9F6]">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day) => {
                  const isSelected = isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "relative aspect-square flex flex-col items-center justify-center transition-all duration-300 border-r border-b border-[#E5E5E5]",
                        !isCurrentMonth && "bg-[#FDFDFB] text-[#BFBFBF]",
                        isSelected 
                          ? "bg-[#8C8279] text-white" 
                          : "bg-white hover:bg-[#F0EDE5]",
                        isToday && !isSelected && "text-[#8C8279]"
                      )}
                    >
                      <span className="text-sm">{format(day, 'd')}</span>
                      {isToday && !isSelected && (
                        <div className="absolute bottom-2 w-1 h-1 rounded-full bg-[#8C8279]" />
                      )}
                      {shifts.some(s => isSameDay(s.date, day)) && !isSelected && (
                        <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-[#DCD7CC]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Shift Form */}
            <section className="bg-white/50 backdrop-blur-sm rounded-sm border border-[#DCD7CC] p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg">新增時段</h3>
                <span className="text-sm text-[#8C8279]">{format(selectedDate, 'MM月dd日 (EEEE)')}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] text-[#8C8279] uppercase tracking-widest">START TIME</label>
                  <input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-4 bg-white border border-[#DCD7CC] rounded-none focus:border-[#8C8279] outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] text-[#8C8279] uppercase tracking-widest">END TIME</label>
                  <input 
                    type="time" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-4 bg-white border border-[#DCD7CC] rounded-none focus:border-[#8C8279] outline-none transition-all font-bold"
                  />
                </div>
              </div>
              
              <button 
                onClick={addShift}
                className="w-full bg-[#8C8279] hover:bg-[#7A7168] text-white py-4 transition-all tracking-widest uppercase text-sm"
              >
                ADD TO SCHEDULE
              </button>
            </section>
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-5">
            <section className="bg-white/50 backdrop-blur-sm rounded-sm border border-[#DCD7CC] p-8 h-full flex flex-col">
              <div className="flex items-center justify-between mb-10 pb-4 border-b border-[#DCD7CC]">
                <h2 className="text-xl tracking-tight">排班清單</h2>
                <div className="flex items-center gap-4">
                  {shifts.length > 0 && (
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 text-[10px] text-[#8C8279] hover:text-[#333] uppercase tracking-widest transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'COPIED' : 'COPY ALL'}
                    </button>
                  )}
                  <span className="text-xs text-[#8C8279] uppercase tracking-widest">{shifts.length} ITEMS</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                {shifts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[#BFBFBF] py-20">
                    <p className="text-sm tracking-widest uppercase">No shifts scheduled</p>
                  </div>
                ) : (
                  [...shifts].sort((a, b) => a.date.getTime() - b.date.getTime()).map((shift) => (
                    <div 
                      key={shift.id} 
                      className="flex items-center justify-between group border-b border-[#F0EDE5] pb-4 last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <p className="text-xl tracking-tight text-[#333] select-all">
                          {formatShiftDisplay(shift)}
                        </p>
                      </div>
                      <button 
                        onClick={() => removeShift(shift.id)}
                        className="p-2 text-[#BFBFBF] hover:text-[#8C8279] transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center pt-12 pb-8">
          <p className="text-[#8C8279] text-[10px] tracking-[0.3em] uppercase">
            MUJI STYLE SHIFT SCHEDULER • 2026
          </p>
        </footer>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #DCD7CC;
        }
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: grayscale(1) opacity(0.5);
        }
      `}</style>
    </div>
  );
}
