import { useState } from 'react';
import GlassInput from './GlassInput';
import Icon from './Icon';

/**
 * Date Range Picker Component
 * Simple date range selector for reports
 */
export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const handleStartDateChange = (e) => {
    const value = e.target.value;
    if (value) {
      onStartDateChange(new Date(value));
    }
  };

  const handleEndDateChange = (e) => {
    const value = e.target.value;
    if (value) {
      onEndDateChange(new Date(value));
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-glass-border hover:border-ice-accent transition-colors"
      >
        <Icon name="calendar" size="sm" variant="ice" />
        <span className="text-sm text-primary-light">
          {startDate && endDate
            ? `${formatDate(startDate)} - ${formatDate(endDate)}`
            : 'Select date range'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 rounded-lg glass border border-glass-border z-10 min-w-[300px]">
          <div className="space-y-4">
            <GlassInput
              label="Start Date"
              type="date"
              value={formatDate(startDate)}
              onChange={handleStartDateChange}
            />
            <GlassInput
              label="End Date"
              type="date"
              value={formatDate(endDate)}
              onChange={handleEndDateChange}
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  // Set to last 7 days
                  const end = new Date();
                  const start = new Date();
                  start.setDate(start.getDate() - 7);
                  onStartDateChange(start);
                  onEndDateChange(end);
                  setIsOpen(false);
                }}
                className="flex-1 px-3 py-2 text-xs rounded-lg glass border border-glass-border hover:border-ice-accent transition-colors text-primary-light"
              >
                Last 7 days
              </button>
              <button
                onClick={() => {
                  // Set to last 30 days
                  const end = new Date();
                  const start = new Date();
                  start.setDate(start.getDate() - 30);
                  onStartDateChange(start);
                  onEndDateChange(end);
                  setIsOpen(false);
                }}
                className="flex-1 px-3 py-2 text-xs rounded-lg glass border border-glass-border hover:border-ice-accent transition-colors text-primary-light"
              >
                Last 30 days
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

