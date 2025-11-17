import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

/**
 * Glass Time Picker Component
 * Custom time picker with hour and minute selection
 * Matches iOS 26 styling and app UI
 * 
 * Value format: "HH:mm" (e.g., "14:30" for 2:30 PM)
 */
export default function GlassTimePicker({
  value, // Format: "HH:mm"
  onChange,
  className = '',
}) {
  // Internal state - always keep in sync with value prop
  const [hours, setHours] = useState(() => {
    if (value && typeof value === 'string' && value.includes(':')) {
      const [h] = value.split(':').map(Number);
      return !isNaN(h) && h >= 0 && h <= 23 ? h : 9;
    }
    return 9;
  });
  
  const [minutes, setMinutes] = useState(() => {
    if (value && typeof value === 'string' && value.includes(':')) {
      const [, m] = value.split(':').map(Number);
      return !isNaN(m) && m >= 0 && m <= 59 ? m : 0;
    }
    return 0;
  });
  
  const [isHourPickerOpen, setIsHourPickerOpen] = useState(false);
  const [isMinutePickerOpen, setIsMinutePickerOpen] = useState(false);
  const hourPickerRef = useRef(null);
  const minutePickerRef = useRef(null);

  // Sync internal state with value prop - this is the source of truth
  useEffect(() => {
    if (value && typeof value === 'string' && value.includes(':')) {
      const [h, m] = value.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        // Only update if different to avoid unnecessary re-renders
        setHours(prev => prev !== h ? h : prev);
        setMinutes(prev => prev !== m ? m : prev);
      }
    } else if (!value || value === '') {
      // Reset to default if value is empty
      setHours(9);
      setMinutes(0);
    }
  }, [value]);

  // Generate hour options (0-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  
  // Generate minute options (0-59)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i);

  // Handle hour change - update state and notify parent immediately
  const handleHourChange = (newHour) => {
    // Update hours state immediately
    setHours(newHour);
    
    // Get current minutes (use functional update to ensure we have latest)
    setMinutes(currentMinutes => {
      // Build time string in HH:mm format
      const newTime = `${String(newHour).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
      
      // Notify parent immediately with the new time
      if (onChange && typeof onChange === 'function') {
        onChange({ 
          target: { 
            value: newTime 
          } 
        });
      }
      
      return currentMinutes; // Return unchanged
    });
    
    // Close modal after a brief delay
    setTimeout(() => {
      setIsHourPickerOpen(false);
    }, 100);
  };

  // Handle minute change - update state and notify parent immediately
  const handleMinuteChange = (newMinute) => {
    // Update minutes state immediately
    setMinutes(newMinute);
    
    // Get current hours (use functional update to ensure we have latest)
    setHours(currentHours => {
      // Build time string in HH:mm format
      const newTime = `${String(currentHours).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`;
      
      // Notify parent immediately with the new time
      if (onChange && typeof onChange === 'function') {
        onChange({ 
          target: { 
            value: newTime 
          } 
        });
      }
      
      return currentHours; // Return unchanged
    });
    
    // Close modal after a brief delay
    setTimeout(() => {
      setIsMinutePickerOpen(false);
    }, 100);
  };

  const formatHour = (h) => {
    if (h === 0) return 12;
    if (h > 12) return h - 12;
    return h;
  };

  const getAmPm = (h) => {
    return h >= 12 ? 'PM' : 'AM';
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isHourPickerOpen || isMinutePickerOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isHourPickerOpen, isMinutePickerOpen]);

  // Determine if we have a valid time selection
  const hasValidTime = (hours >= 0 && hours <= 23) && (minutes >= 0 && minutes <= 59);
  const displayTime = hasValidTime 
    ? `${String(formatHour(hours)).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${getAmPm(hours)}`
    : '';

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Display Selected Time */}
      {hasValidTime && displayTime && (
        <div className="px-4 py-2.5 rounded-lg bg-ice-primary/10 border border-ice-primary/30 text-center animate-in fade-in duration-200">
          <p className="text-xs text-neutral-text-secondary mb-1 font-medium uppercase tracking-wider">Selected Time</p>
          <p className="text-xl font-bold text-ice-primary">{displayTime}</p>
        </div>
      )}
      
      <div className="flex items-center gap-3">
        {/* Hour Picker */}
        <div className="flex-1 relative" ref={hourPickerRef}>
          <button
            type="button"
            onClick={() => {
              setIsHourPickerOpen(!isHourPickerOpen);
              setIsMinutePickerOpen(false);
            }}
            className={`w-full px-4 py-3 rounded-xl border text-neutral-text-primary focus-ring focus:shadow-glow-ice-light text-center text-lg font-semibold min-h-[44px] hover:border-neutral-border transition-colors ${
              hasValidTime 
                ? 'bg-ice-primary/10 border-ice-primary/30' 
                : 'bg-neutral-surface-primary border-neutral-border/60'
            }`}
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl">{String(formatHour(hours)).padStart(2, '0')}</span>
              <span className="text-xs text-neutral-text-secondary mt-0.5">Hour</span>
            </div>
          </button>

          {isHourPickerOpen && createPortal(
            <div
              className="fixed inset-0 z-[999999] flex items-center justify-center p-4 animate-fade-in"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsHourPickerOpen(false);
                }
              }}
              role="presentation"
            >
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-neutral-text-primary/30 backdrop-blur-md animate-fade-in"
                onClick={() => setIsHourPickerOpen(false)}
                aria-hidden="true"
              />
              
              {/* Modal Content */}
              <div
                className="relative z-10 w-full max-w-xs rounded-xl glass border border-neutral-border/60 shadow-glass-light-lg overflow-hidden animate-scale-in max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-border/60">
                  <h3 className="text-lg font-semibold text-neutral-text-primary">Select Hour</h3>
                  <button
                    onClick={() => setIsHourPickerOpen(false)}
                    className="p-2 rounded-lg hover:bg-neutral-surface-secondary transition-colors focus-ring min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Close"
                  >
                    <Icon name="close" size="sm" variant="neutral" />
                  </button>
                </div>

                {/* Options List */}
                <div className="overflow-y-auto flex-1 p-2" style={{ maxHeight: 'calc(80vh - 80px)' }}>
                  {hourOptions.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleHourChange(hour);
                      }}
                      className={`w-full px-4 py-3 rounded-lg text-base font-medium transition-colors mb-1 ${
                        hours === hour
                          ? 'bg-ice-primary text-white shadow-glow-ice-light'
                          : 'text-neutral-text-primary hover:bg-neutral-surface-secondary'
                      }`}
                    >
                      {String(formatHour(hour)).padStart(2, '0')} {getAmPm(hour)}
                    </button>
                  ))}
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>

        {/* Separator */}
        <div className="text-2xl font-bold text-neutral-text-primary py-3">:</div>

        {/* Minute Picker */}
        <div className="flex-1 relative" ref={minutePickerRef}>
          <button
            type="button"
            onClick={() => {
              setIsMinutePickerOpen(!isMinutePickerOpen);
              setIsHourPickerOpen(false);
            }}
            className={`w-full px-4 py-3 rounded-xl border text-neutral-text-primary focus-ring focus:shadow-glow-ice-light text-center text-lg font-semibold min-h-[44px] hover:border-neutral-border transition-colors ${
              hasValidTime 
                ? 'bg-ice-primary/10 border-ice-primary/30' 
                : 'bg-neutral-surface-primary border-neutral-border/60'
            }`}
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl">{String(minutes).padStart(2, '0')}</span>
              <span className="text-xs text-neutral-text-secondary mt-0.5">Minute</span>
            </div>
          </button>

          {isMinutePickerOpen && createPortal(
            <div
              className="fixed inset-0 z-[999999] flex items-center justify-center p-4 animate-fade-in"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsMinutePickerOpen(false);
                }
              }}
              role="presentation"
            >
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-neutral-text-primary/30 backdrop-blur-md animate-fade-in"
                onClick={() => setIsMinutePickerOpen(false)}
                aria-hidden="true"
              />
              
              {/* Modal Content */}
              <div
                className="relative z-10 w-full max-w-xs rounded-xl glass border border-neutral-border/60 shadow-glass-light-lg overflow-hidden animate-scale-in max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-border/60">
                  <h3 className="text-lg font-semibold text-neutral-text-primary">Select Minute</h3>
                  <button
                    onClick={() => setIsMinutePickerOpen(false)}
                    className="p-2 rounded-lg hover:bg-neutral-surface-secondary transition-colors focus-ring min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Close"
                  >
                    <Icon name="close" size="sm" variant="neutral" />
                  </button>
                </div>

                {/* Options List */}
                <div className="overflow-y-auto flex-1 p-2" style={{ maxHeight: 'calc(80vh - 80px)' }}>
                  {minuteOptions.map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMinuteChange(minute);
                      }}
                      className={`w-full px-4 py-3 rounded-lg text-base font-medium transition-colors mb-1 ${
                        minutes === minute
                          ? 'bg-ice-primary text-white shadow-glow-ice-light'
                          : 'text-neutral-text-primary hover:bg-neutral-surface-secondary'
                      }`}
                    >
                      {String(minute).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>

        {/* AM/PM Display */}
        <div className={`px-3 py-3 text-center rounded-xl border min-h-[44px] flex flex-col items-center justify-center ${
          hasValidTime 
            ? 'bg-ice-primary/10 border-ice-primary/30' 
            : 'border-transparent'
        }`}>
          <div className="text-lg font-semibold text-neutral-text-primary">
            {getAmPm(hours)}
          </div>
          <div className="text-xs text-neutral-text-secondary mt-0.5">Period</div>
        </div>
      </div>
    </div>
  );
}
