'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search files...",
  className,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  // Use local state to track input value independently
  const [localValue, setLocalValue] = useState(value);
  
  // Update local value when external value changes (but not during typing)
  useEffect(() => {
    if (value !== localValue && !isFocused) {
      setLocalValue(value);
    }
  }, [value, isFocused]);

  // Focus the input when pressing Ctrl+F or Cmd+F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      if (e.key === 'Escape' && document.activeElement === inputRef.current && localValue) {
        e.preventDefault();
        setLocalValue('');
        onChange('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onChange, localValue]);

  // Use a debounce effect to update parent state only after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [localValue, onChange, value]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  // Handle clear button click
  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    setLocalValue('');
    onChange('');
    // Refocus the input after clearing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // Ensure input is always focused when clicking anywhere in the container
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div 
      className={cn(
        "relative flex items-center px-3 py-2 border-b",
        isFocused ? 'bg-accent/50' : '',
        className
      )}
      onClick={handleContainerClick}
    >
      <Search className="w-4 h-4 mr-2 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          // Only set isFocused to false if we're not clicking within the container
          if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) {
            setIsFocused(false);
            // Sync values on blur
            if (localValue !== value) {
              onChange(localValue);
            }
          }
        }}
        // Prevent default behavior for certain keys to avoid interruptions
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
          }
          // Ensure backspace works properly
          if (e.key === 'Backspace') {
            e.stopPropagation(); // Prevent any parent handlers from capturing this
          }
        }}
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-muted"
          aria-label="Clear search"
          type="button"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
} 