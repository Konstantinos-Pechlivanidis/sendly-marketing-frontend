import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { format, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import GlassCalendar from './GlassCalendar';
import GlassButton from './GlassButton';
import GlassTimePicker from './GlassTimePicker';
import Icon from './Icon';

/**
 * Glass Date Time Picker Component
 * Custom calendar-based date and time picker with iOS 26 styling
 * Uses React Portal for proper z-index handling on mobile
 */
export default function GlassDateTimePicker({
  label,
  name,
  value,
  onChange,
  error,
  placeholder = 'Select date and time',
  required,
  className,
  minDate,
  maxDate,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [tempTime, setTempTime] = useState('09:00');
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Parse value prop to Date object
  useEffect(() => {
    if (value && value.trim()) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          setSelectedDateTime(date);
          // Extract time in HH:mm format
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          setTempTime(`${hours}:${minutes}`);
        } else {
          setSelectedDateTime(null);
          setTempTime('09:00');
        }
      } catch {
        setSelectedDateTime(null);
        setTempTime('09:00');
      }
    } else {
      setSelectedDateTime(null);
      setTempTime('09:00');
    }
  }, [value]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Close picker when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    // Use a small delay to prevent immediate closing when opening
    let cleanup = null;
    const timeoutId = setTimeout(() => {
      const handleClickOutside = (event) => {
        if (
          buttonRef.current &&
          dropdownRef.current &&
          !buttonRef.current.contains(event.target) &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);

      cleanup = () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (cleanup) {
        cleanup();
      }
    };
  }, [isOpen]);

  const handleDateSelect = (date) => {
    try {
      // Update date but keep existing time, or use tempTime if no existing time
      const [hours, minutes] = tempTime.split(':').map(Number);
      const newDateTime = setMilliseconds(
        setSeconds(
          setMinutes(
            setHours(new Date(date), hours || 9),
            minutes || 0
          ),
          0
        ),
        0
      );
      // Update state immediately for UI feedback
      setSelectedDateTime(newDateTime);
      // Update parent component
      updateDateTime(newDateTime);
    } catch (error) {
      console.error('Error in handleDateSelect:', error);
    }
  };

  const handleTimeChange = (e) => {
    try {
      const timeValue = e?.target?.value || ''; // Format: "HH:mm"
      if (!timeValue) return;
      
      setTempTime(timeValue);
      
      const [hours, minutes] = timeValue.split(':').map(Number);
      // Use current date if no date is selected, otherwise use selected date
      const baseDate = selectedDateTime || new Date();
      
      const newDateTime = setMilliseconds(
        setSeconds(
          setMinutes(
            setHours(new Date(baseDate), hours || 9),
            minutes || 0
          ),
          0
        ),
        0
      );
      
      // Update state immediately for UI feedback
      setSelectedDateTime(newDateTime);
      // Update parent component
      updateDateTime(newDateTime);
    } catch (error) {
      console.error('Error in handleTimeChange:', error);
    }
  };

  const updateDateTime = (dateTime) => {
    const syntheticEvent = {
      target: {
        name,
        value: dateTime.toISOString(),
      },
    };
    onChange(syntheticEvent);
  };

  const applyPreset = (preset) => {
    const now = new Date();
    let date = new Date();
    
    switch (preset) {
      case 'now':
        date = now;
        break;
      case 'tomorrow':
        date.setDate(now.getDate() + 1);
        date.setHours(9, 0, 0, 0);
        break;
      case 'nextWeek':
        date.setDate(now.getDate() + 7);
        date.setHours(9, 0, 0, 0);
        break;
      case 'nextMonth':
        date.setMonth(now.getMonth() + 1);
        date.setHours(9, 0, 0, 0);
        break;
      default:
        return;
    }
    
    setSelectedDateTime(date);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    setTempTime(`${hours}:${minutes}`);
    updateDateTime(date);
    setIsOpen(false);
  };

  const presets = [
    { id: 'now', label: 'Now' },
    { id: 'tomorrow', label: 'Tomorrow 9:00 AM' },
    { id: 'nextWeek', label: 'Next Week' },
    { id: 'nextMonth', label: 'Next Month' },
  ];

  const handleClear = () => {
    setSelectedDateTime(null);
    setTempTime('09:00');
    const syntheticEvent = {
      target: {
        name,
        value: '',
      },
    };
    onChange(syntheticEvent);
  };

  // Calculate display value - ensure it updates when time changes
  // Use useMemo to ensure it recalculates when selectedDateTime or tempTime changes
  const displayValue = useMemo(() => {
    if (selectedDateTime) {
      return format(selectedDateTime, 'MMM d, yyyy h:mm a');
    }
    return '';
  }, [selectedDateTime]);

  // Parse minDate and maxDate to Date objects if they're strings
  const minDateObj = minDate ? new Date(minDate) : null;
  const maxDateObj = maxDate ? new Date(maxDate) : null;

  return (
    <div className={`relative ${className}`}>
      <div className="space-y-2">
        {label && (
          <label htmlFor={name} className="block text-sm font-medium text-neutral-text-primary">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <button
          ref={buttonRef}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          onMouseDown={(e) => {
            // Prevent blur when clicking the button
            if (isOpen) {
              e.preventDefault();
            }
          }}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-neutral-surface-primary backdrop-blur-[24px]
            border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-neutral-border/60 focus:border-ice-primary'}
            text-neutral-text-primary
            focus-ring focus:shadow-glow-ice-light
            spring-smooth shadow-sm
            hover:border-neutral-border hover:shadow-md
            text-left flex items-center justify-between
            min-h-[44px]
            ${!displayValue && 'text-neutral-text-secondary'}
          `}
          aria-label={label || 'Select date and time'}
          aria-expanded={isOpen}
        >
          <span className="flex items-center gap-2">
            <Icon name="calendar" size="sm" variant="ice" />
            <span>{displayValue || placeholder}</span>
          </span>
          <div className="flex items-center gap-2">
            {selectedDateTime && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-1 rounded hover:bg-neutral-surface-secondary transition-colors"
                aria-label="Clear date and time"
              >
                <Icon name="close" size="xs" variant="neutral" />
              </button>
            )}
            <Icon 
              name="arrowRight" 
              size="sm" 
              className={`transition-transform ${isOpen ? 'rotate-90' : '-rotate-90'}`}
            />
          </div>
        </button>
        {error && (
          <p id={`${name}-error`} className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>

      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
          role="presentation"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-neutral-text-primary/30 backdrop-blur-md animate-fade-in"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Modal Content */}
          <div
            ref={dropdownRef}
            className="relative z-10 w-full max-w-lg rounded-xl glass border border-neutral-border/60 shadow-glass-light-lg overflow-hidden animate-scale-in max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-border/60">
              <h3 className="text-lg font-semibold text-neutral-text-primary">{label || 'Select date and time'}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-surface-secondary transition-colors focus-ring min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                <Icon name="close" size="sm" variant="neutral" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              {/* Preset Buttons */}
              <div>
                <p className="text-xs font-semibold text-neutral-text-secondary uppercase tracking-wider mb-3">Quick Select</p>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                  {presets.map((preset) => (
                    <GlassButton
                      key={preset.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => applyPreset(preset.id)}
                      className="justify-start text-left text-xs min-h-[44px]"
                    >
                      {preset.label}
                    </GlassButton>
                  ))}
                </div>
              </div>

              {/* Calendar */}
              <div className="pt-4 border-t border-neutral-border/60">
                <p className="text-xs font-semibold text-neutral-text-secondary uppercase tracking-wider mb-3">Select Date</p>
                <GlassCalendar
                  selectedDate={selectedDateTime}
                  onDateSelect={handleDateSelect}
                  minDate={minDateObj}
                  maxDate={maxDateObj}
                />
              </div>

              {/* Time Picker */}
              <div className="pt-4 border-t border-neutral-border/60">
                <p className="text-xs font-semibold text-neutral-text-secondary uppercase tracking-wider mb-3">Select Time</p>
                <GlassTimePicker
                  value={tempTime}
                  onChange={handleTimeChange}
                />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
