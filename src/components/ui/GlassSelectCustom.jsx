import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

/**
 * Glass Select Custom Component
 * Fully custom select dropdown with iOS 26 styling
 * Does not use native select element
 */
export default function GlassSelectCustom({
  label,
  name,
  value,
  onChange,
  error,
  options = [],
  placeholder = 'Select an option',
  required,
  className,
  searchable = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectRef = useRef(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedOption = options.find(opt => {
    const optValue = typeof opt === 'object' ? opt.value : opt;
    return optValue === value;
  });

  const displayValue = selectedOption 
    ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption)
    : '';

  // Filter options if searchable
  const filteredOptions = searchable && searchQuery
    ? options.filter(opt => {
        const label = typeof opt === 'object' ? opt.label : opt;
        return label.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : options;

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (!buttonRef.current) return;
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calculate width (viewport-relative for fixed positioning)
        let width = buttonRect.width;
        
        // On mobile, use full button width
        if (viewportWidth < 640) {
          width = buttonRect.width;
        }
        
        // Calculate horizontal position (viewport-relative for fixed positioning)
        let adjustedLeft = buttonRect.left;
        const estimatedDropdownWidth = viewportWidth < 640 ? width : Math.max(width, 200); // min-w-[200px] on desktop
        
        if (adjustedLeft + estimatedDropdownWidth > viewportWidth) {
          adjustedLeft = viewportWidth - estimatedDropdownWidth - 16; // 16px padding from edge
        }
        if (adjustedLeft < 16) {
          adjustedLeft = 16;
        }
        
        // Calculate vertical position - check if we should open above or below
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        const gap = 8; // Gap between button and dropdown
        const estimatedDropdownHeight = 240; // max-h-60 = 240px (can be more with many options)
        
        let adjustedTop;
        if (spaceBelow >= estimatedDropdownHeight + gap) {
          // Enough space below - position below the button (viewport-relative)
          adjustedTop = buttonRect.bottom + gap;
        } else if (spaceAbove >= estimatedDropdownHeight + gap) {
          // Not enough space below, but enough above - position above the button
          adjustedTop = buttonRect.top - estimatedDropdownHeight - gap;
        } else {
          // Not enough space either way - position where there's more space
          if (spaceBelow > spaceAbove) {
            // More space below - position below with max-height constraint
            adjustedTop = buttonRect.bottom + gap;
          } else {
            // More space above - position above with max-height constraint
            adjustedTop = buttonRect.top - estimatedDropdownHeight - gap;
          }
          // Ensure it doesn't go outside viewport
          if (adjustedTop < 16) {
            adjustedTop = 16;
          }
          if (adjustedTop + estimatedDropdownHeight > viewportHeight - 16) {
            adjustedTop = viewportHeight - estimatedDropdownHeight - 16;
          }
        }
        
        setDropdownPosition({ top: adjustedTop, left: adjustedLeft, width });
      };

      updatePosition();
      // Update position on scroll and resize to keep it aligned with the button
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      const isClickOnButton = buttonRef.current?.contains(target);
      const isClickOnDropdown = dropdownRef.current?.contains(target);
      
      if (!isClickOnButton && !isClickOnDropdown) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      // Use a small delay to avoid closing immediately when opening
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      
      // Focus search input if searchable
      if (searchable && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, searchable]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    const syntheticEvent = {
      target: {
        name,
        value: optionValue,
      },
    };
    onChange(syntheticEvent);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
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
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-neutral-surface-primary backdrop-blur-[24px]
            border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-neutral-border/60 focus:border-ice-primary'}
            text-neutral-text-primary
            focus-ring focus:shadow-glow-ice-light
            spring-smooth shadow-sm
            hover:border-neutral-border hover:shadow-md
            text-left flex items-center justify-between
            ${!displayValue && 'text-neutral-text-secondary'}
          `}
          aria-label={label || 'Select option'}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="flex items-center gap-2 flex-1 min-w-0">
            <span className="truncate">{displayValue || placeholder}</span>
          </span>
          <Icon 
            name="arrowRight" 
            size="sm" 
            className={`transition-transform flex-shrink-0 ${isOpen ? 'rotate-90' : '-rotate-90'}`}
          />
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
              setSearchQuery('');
            }
          }}
          role="presentation"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-neutral-text-primary/30 backdrop-blur-md animate-fade-in"
            onClick={() => {
              setIsOpen(false);
              setSearchQuery('');
            }}
            aria-hidden="true"
          />
          
          {/* Modal Content */}
          <div 
            ref={dropdownRef}
            className="relative z-10 w-full max-w-md rounded-xl glass border border-neutral-border/60 shadow-glass-light-lg overflow-hidden animate-scale-in max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-border/60">
              <h3 className="text-lg font-semibold text-neutral-text-primary">{label || 'Select an option'}</h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSearchQuery('');
                }}
                className="p-2 rounded-lg hover:bg-neutral-surface-secondary transition-colors focus-ring min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                <Icon name="close" size="sm" variant="neutral" />
              </button>
            </div>

            {/* Search Input (if searchable) */}
            {searchable && (
              <div className="p-4 border-b border-neutral-border/60">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search options..."
                  className="w-full px-4 py-3 rounded-xl bg-neutral-surface-primary border border-neutral-border/60 text-neutral-text-primary text-base focus-ring focus:border-ice-primary"
                />
              </div>
            )}

            {/* Options List */}
            <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(80vh - 120px)' }}>
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-neutral-text-secondary text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue = typeof option === 'object' ? option.value : option;
                const optionLabel = typeof option === 'object' ? option.label : option;
                const isDisabled = typeof option === 'object' ? option.disabled : false;
                const isSelected = optionValue === value;

                return (
                  <button
                    key={optionValue || index}
                    type="button"
                    onClick={() => !isDisabled && handleSelect(optionValue)}
                    disabled={isDisabled}
                    className={`
                      w-full px-4 py-3 text-left text-sm
                      transition-colors
                      ${isDisabled 
                        ? 'opacity-50 cursor-not-allowed text-neutral-text-secondary' 
                        : isSelected 
                          ? 'bg-ice-primary/10 text-ice-primary font-medium' 
                          : 'text-neutral-text-primary hover:bg-neutral-surface-secondary'
                      }
                      ${index !== filteredOptions.length - 1 ? 'border-b border-neutral-border/30' : ''}
                    `}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={isDisabled}
                  >
                    <div className="flex items-center justify-between">
                      <span>{optionLabel}</span>
                      {isSelected && !isDisabled && (
                        <Icon name="check" size="sm" variant="ice" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

