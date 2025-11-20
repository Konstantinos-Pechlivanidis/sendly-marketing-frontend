import { useState, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, isAfter, setYear, setMonth, getYear, getMonth } from 'date-fns';
import GlassButton from './GlassButton';
import Icon from './Icon';

/**
 * Glass Calendar Component
 * Custom calendar grid UI with iOS 26 styling
 * Used internally by date picker components
 * Optimized for birthday selection with year and month dropdowns
 */
export default function GlassCalendar({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  className = '',
}) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const yearPickerRef = useRef(null);
  const monthPickerRef = useRef(null);
  const yearListRef = useRef(null);

  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(selectedDate);
    }
  }, [selectedDate]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (yearPickerRef.current && !yearPickerRef.current.contains(event.target)) {
        setShowYearPicker(false);
      }
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target)) {
        setShowMonthPicker(false);
      }
    };

    if (showYearPicker || showMonthPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showYearPicker, showMonthPicker]);

  // Auto-scroll to selected year when year picker opens
  useEffect(() => {
    if (showYearPicker && yearListRef.current) {
      const selectedYearButton = yearListRef.current.querySelector(`[data-year="${currentYearValue}"]`);
      if (selectedYearButton) {
        setTimeout(() => {
          selectedYearButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [showYearPicker, currentYearValue]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday = 0
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isDateDisabled = (date) => {
    if (minDate && isBefore(date, minDate)) return true;
    if (maxDate && isAfter(date, maxDate)) return true;
    return false;
  };

  const handleDateClick = (date) => {
    if (!isDateDisabled(date)) {
      onDateSelect(date);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    if (!isDateDisabled(today)) {
      onDateSelect(today);
    }
  };

  // Generate year range (from 100 years ago to current year)
  const currentYear = getYear(new Date());
  const startYear = minDate ? getYear(minDate) : currentYear - 100;
  const endYear = maxDate ? getYear(maxDate) : currentYear;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i).reverse();

  // Month names
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleYearSelect = (year) => {
    const newDate = setYear(currentMonth, year);
    setCurrentMonth(newDate);
    setShowYearPicker(false);
  };

  const handleMonthSelect = (monthIndex) => {
    const newDate = setMonth(currentMonth, monthIndex);
    setCurrentMonth(newDate);
    setShowMonthPicker(false);
  };

  const currentYearValue = getYear(currentMonth);
  const currentMonthValue = getMonth(currentMonth);

  return (
    <div className={`glass rounded-xl border border-neutral-border/60 p-3 sm:p-4 ${className}`}>
      {/* Calendar Header with Year/Month Selectors */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg hover:bg-neutral-surface-secondary transition-colors flex-shrink-0"
          aria-label="Previous month"
        >
          <Icon name="arrowLeft" size="sm" variant="ice" />
        </button>
        
        {/* Month and Year Selectors */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          {/* Month Selector */}
          <div className="relative" ref={monthPickerRef}>
            <button
              type="button"
              onClick={() => {
                setShowMonthPicker(!showMonthPicker);
                setShowYearPicker(false);
              }}
              className="px-3 py-1.5 rounded-lg hover:bg-neutral-surface-secondary transition-colors text-sm sm:text-base font-semibold text-neutral-text-primary min-w-[100px]"
            >
              {months[currentMonthValue]}
              <Icon name="arrowRight" size="xs" className="inline-block ml-1 -rotate-90" />
            </button>
            
            {showMonthPicker && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-neutral-surface-primary backdrop-blur-[24px] border border-neutral-border/60 rounded-lg shadow-glass-light-lg max-h-60 overflow-y-auto">
                {months.map((month, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleMonthSelect(index)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-surface-secondary transition-colors ${
                      currentMonthValue === index ? 'bg-ice-primary/20 text-ice-primary font-semibold' : 'text-neutral-text-primary'
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year Selector */}
          <div className="relative" ref={yearPickerRef}>
            <button
              type="button"
              onClick={() => {
                setShowYearPicker(!showYearPicker);
                setShowMonthPicker(false);
              }}
              className="px-3 py-1.5 rounded-lg hover:bg-neutral-surface-secondary transition-colors text-sm sm:text-base font-semibold text-neutral-text-primary min-w-[80px]"
            >
              {currentYearValue}
              <Icon name="arrowRight" size="xs" className="inline-block ml-1 -rotate-90" />
            </button>
            
            {showYearPicker && (
              <div 
                ref={yearListRef}
                className="absolute top-full left-0 right-0 mt-1 z-50 bg-neutral-surface-primary backdrop-blur-[24px] border border-neutral-border/60 rounded-lg shadow-glass-light-lg max-h-60 overflow-y-auto"
              >
                {years.map((year) => (
                  <button
                    key={year}
                    data-year={year}
                    type="button"
                    onClick={() => handleYearSelect(year)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-surface-secondary transition-colors ${
                      currentYearValue === year ? 'bg-ice-primary/20 text-ice-primary font-semibold' : 'text-neutral-text-primary'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-neutral-surface-secondary transition-colors flex-shrink-0"
          aria-label="Next month"
        >
          <Icon name="arrowRight" size="sm" variant="ice" />
        </button>
      </div>

      {/* Week Day Headers */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1.5 sm:mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-[10px] sm:text-xs font-semibold text-neutral-text-secondary text-center py-1 sm:py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const isDisabled = isDateDisabled(day);

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDateClick(day)}
              disabled={isDisabled}
              className={`
                aspect-square min-h-[32px] sm:min-h-[36px] md:min-h-[40px] rounded-lg
                text-xs sm:text-sm font-medium
                transition-all spring-smooth
                ${!isCurrentMonth ? 'text-neutral-text-tertiary opacity-40' : 'text-neutral-text-primary'}
                ${isSelected
                  ? 'bg-ice-primary text-white shadow-glow-ice-light'
                  : isToday
                    ? 'bg-ice-primary/10 text-ice-primary border border-ice-primary/30'
                    : isDisabled
                      ? 'opacity-30 cursor-not-allowed'
                      : 'hover:bg-neutral-surface-secondary'
                }
                ${!isDisabled && !isSelected && 'hover:scale-105'}
              `}
              aria-label={format(day, 'MMMM d, yyyy')}
              aria-selected={isSelected}
              aria-disabled={isDisabled}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      {/* Today Button */}
      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-neutral-border/60">
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={goToToday}
          className="w-full justify-center text-xs sm:text-sm"
        >
          Go to Today
        </GlassButton>
      </div>
    </div>
  );
}

