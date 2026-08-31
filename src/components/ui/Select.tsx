"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  wrapperClassName?: string;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  className,
  wrapperClassName,
  children,
  value,
  defaultValue,
  onChange,
  disabled,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Track internal state for uncontrolled usage
  const [internalValue, setInternalValue] = useState(value || defaultValue || '');
  const currentValue = value !== undefined ? value : internalValue;

  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  // Extract options from children (<option> tags)
  const options = React.Children.toArray(children).map((child: any) => {
    if (child && child.type === 'option') {
      return { 
        value: child.props.value !== undefined ? child.props.value : child.props.children, 
        label: child.props.children,
        disabled: child.props.disabled
      };
    }
    return null;
  }).filter(Boolean) as { value: string | number, label: React.ReactNode, disabled?: boolean }[];

  const selectedOption = options.find(opt => String(opt.value) === String(currentValue)) || options[0];

  const updatePosition = () => {
    if (containerRef.current && isOpen) {
      const rect = containerRef.current.getBoundingClientRect();
      // Ensure we have room below, else open upwards
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = Math.min(options.length * 40 + 10, 240); // estimate max height

      const openUpwards = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

      setDropdownStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        ...(openUpwards 
          ? { bottom: window.innerHeight - rect.top + 4, top: 'auto', transformOrigin: 'bottom' } 
          : { top: rect.bottom + 4, bottom: 'auto', transformOrigin: 'top' })
      });
    }
  };

  useLayoutEffect(() => {
    updatePosition();
  }, [isOpen, options.length]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('scroll', updatePosition, true); // true to catch all scrolls
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string | number, isDisabled?: boolean) => {
    if (isDisabled) return;
    
    setInternalValue(val);
    setIsOpen(false);
    
    if (onChange) {
      const event = {
        target: { value: String(val) },
        currentTarget: { value: String(val) },
        preventDefault: () => {},
        stopPropagation: () => {}
      } as unknown as React.ChangeEvent<HTMLSelectElement>;
      onChange(event);
    }
  };

  // Ensure hydration matches server
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className={clsx("relative w-full", wrapperClassName)}>
      <select 
        ref={ref}
        value={currentValue}
        onChange={onChange}
        disabled={disabled}
        className="hidden"
        {...props}
      >
        {children}
      </select>

      <button
        ref={containerRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          "w-full bg-input text-text-primary border rounded-lg px-4 py-2.5 flex items-center justify-between transition-colors shadow-sm text-left min-h-[42px]",
          isOpen ? "border-primary-purple ring-1 ring-primary-purple" : "border-border-subtle hover:border-border-accent",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <span className="truncate">{selectedOption?.label || "Select..."}</span>
        <svg className={clsx("w-4 h-4 text-text-muted transition-transform duration-200 shrink-0 ml-2", isOpen && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, scaleY: 0.95 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={dropdownStyle}
              className="z-[999999] bg-card border border-border-card rounded-lg shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
            >
              {options.map((opt, i) => {
                const isSelected = String(opt.value) === String(currentValue);
                return (
                  <div
                    key={i}
                    onClick={() => handleSelect(opt.value, opt.disabled)}
                    className={clsx(
                      "px-4 py-2.5 transition-colors truncate",
                      opt.disabled 
                        ? "opacity-50 cursor-not-allowed" 
                        : "cursor-pointer",
                      !opt.disabled && isSelected 
                        ? "bg-primary-purple/15 text-primary-purple font-medium border-l-2 border-primary-purple" 
                        : !opt.disabled && "text-text-secondary hover:bg-row hover:text-white border-l-2 border-transparent"
                    )}
                  >
                    {opt.label}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
});
Select.displayName = 'Select';
