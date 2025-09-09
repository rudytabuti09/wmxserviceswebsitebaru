"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Filter, ArrowDown } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

interface RetroSearchProps {
  placeholder?: string;
  value?: string;
  onSearch: (query: string, filters?: SearchFilters) => void;
  onClear?: () => void;
  filters?: SearchFilter[];
  className?: string;
  size?: "sm" | "md" | "lg";
  showFilters?: boolean;
}

interface SearchFilter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface SearchFilters {
  [key: string]: string;
}

export function RetroSearch({
  placeholder = "Search...",
  value = "",
  onSearch,
  onClear,
  filters = [],
  className = "",
  size = "md",
  showFilters = false
}: RetroSearchProps) {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState(value);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const sizes = {
    sm: { height: '36px', fontSize: '14px', padding: '8px 12px' },
    md: { height: '44px', fontSize: '16px', padding: '12px 16px' },
    lg: { height: '52px', fontSize: '18px', padding: '16px 20px' }
  };

  const currentSize = sizes[size];

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery !== value) {
        onSearch(searchQuery, activeFilters);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, activeFilters, onSearch, value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setSearchQuery("");
    setActiveFilters({});
    onClear?.();
    inputRef.current?.focus();
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    const newFilters = { ...activeFilters };
    if (value) {
      newFilters[filterKey] = value;
    } else {
      delete newFilters[filterKey];
    }
    setActiveFilters(newFilters);
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className={className} style={{ position: 'relative' }}>
      {/* Main Search Input */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: isDarkMode ? '#2A2F5E' : '#FFFFFF',
          border: `3px solid ${isFocused ? '#FF3EA5' : (isDarkMode ? '#FFC700' : '#111111')}`,
          borderRadius: '0px',
          height: currentSize.height,
          boxShadow: `4px 4px 0px ${isDarkMode ? '#FFC700' : '#111111'}`,
          transition: 'all 0.2s ease',
          transform: isFocused ? 'translate(-1px, -1px)' : 'translate(0, 0)'
        }}
      >
        {/* Search Icon */}
        <div style={{ 
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search 
            size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} 
            color={isDarkMode ? '#FFC700' : '#111111'}
            strokeWidth={2}
          />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            fontFamily: 'Inter, sans-serif',
            fontSize: currentSize.fontSize,
            fontWeight: 500,
            color: isDarkMode ? '#FFFFFF' : '#111111',
            padding: `0 ${showFilters ? '8px' : '12px'} 0 0`,
            height: '100%'
          }}
          className="placeholder-opacity-60"
        />

        {/* Filter Button */}
        {showFilters && filters.length > 0 && (
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            style={{
              padding: '8px',
              backgroundColor: activeFilterCount > 0 ? '#FF3EA5' : 'transparent',
              border: activeFilterCount > 0 ? '2px solid #111111' : 'none',
              borderRadius: '0px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              margin: '4px',
              position: 'relative'
            }}
            title="Filter options"
          >
            <Filter 
              size={16} 
              color={activeFilterCount > 0 ? '#FFFFFF' : (isDarkMode ? '#FFC700' : '#111111')}
              strokeWidth={2}
            />
            {activeFilterCount > 0 && (
              <span style={{
                backgroundColor: '#FFC700',
                color: '#111111',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 700,
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                border: '2px solid #111111'
              }}>
                {activeFilterCount}
              </span>
            )}
          </button>
        )}

        {/* Clear Button */}
        {(searchQuery || activeFilterCount > 0) && (
          <button
            onClick={handleClear}
            style={{
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.1s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Clear search"
          >
            <X 
              size={16} 
              color={isDarkMode ? '#FF3EA5' : '#FF3EA5'}
              strokeWidth={2}
            />
          </button>
        )}
      </div>

      {/* Filter Menu */}
      {showFilterMenu && filters.length > 0 && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            backgroundColor: isDarkMode ? '#2A2F5E' : '#FFFFFF',
            border: `3px solid ${isDarkMode ? '#FFC700' : '#111111'}`,
            borderRadius: '0px',
            boxShadow: `6px 6px 0px ${isDarkMode ? '#FFC700' : '#111111'}`,
            padding: '16px',
            zIndex: 50,
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          <div style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            fontWeight: 700,
            color: isDarkMode ? '#FFC700' : '#111111',
            textTransform: 'uppercase',
            marginBottom: '12px',
            letterSpacing: '1px'
          }}>
            Filters
          </div>
          
          {filters.map((filter) => (
            <div key={filter.key} style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                color: isDarkMode ? '#FFFFFF' : '#111111',
                marginBottom: '6px',
                textTransform: 'capitalize'
              }}>
                {filter.label}
              </label>
              <select
                value={activeFilters[filter.key] || ""}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: isDarkMode ? '#1A1F4E' : '#FFFFFF',
                  border: `2px solid ${isDarkMode ? '#FFC700' : '#111111'}`,
                  borderRadius: '0px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  color: isDarkMode ? '#FFFFFF' : '#111111',
                  cursor: 'pointer'
                }}
              >
                <option value="">All {filter.label}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
