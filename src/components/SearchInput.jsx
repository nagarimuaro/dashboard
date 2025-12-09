import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useDebounceSearch } from '../hooks/useDebounceSearch.js';

const SearchInput = ({ 
  onSearch, 
  onSelect = null,
  placeholder = "Cari...",
  searchFunction = null,
  showResults = true,
  className = "",
  renderResult = null,
  minLength = 2
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const { 
    searchTerm, 
    setSearchTerm, 
    results, 
    loading, 
    error,
    clearSearch
  } = useDebounceSearch(searchFunction || onSearch);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex] && onSelect) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle result selection
  const handleSelect = (result) => {
    if (onSelect) {
      onSelect(result);
    }
    setSearchTerm('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length >= minLength) {
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setIsOpen(false);
    }
  };

  // Handle clear
  const handleClear = () => {
    clearSearch();
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        resultsRef.current && 
        !resultsRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Default result renderer
  const defaultRenderResult = (result, index) => (
    <div
      key={result.id || index}
      className={`p-3 cursor-pointer border-b last:border-b-0 transition-colors
        ${index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'}
      `}
      onClick={() => handleSelect(result)}
    >
      <div className="font-medium">{result.nama || result.name || result.title}</div>
      {(result.nik || result.kode || result.description) && (
        <div className="text-sm text-gray-500">
          {result.nik || result.kode || result.description}
        </div>
      )}
    </div>
  );

  const resultRenderer = renderResult || defaultRenderResult;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchTerm.length >= minLength && results.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        
        {/* Loading or Clear Button */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : searchTerm ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          ) : null}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && showResults && (
        <div
          ref={resultsRef}
          className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-64 overflow-y-auto"
        >
          {loading && results.length === 0 ? (
            <div className="p-3 text-center text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
              Searching...
            </div>
          ) : error ? (
            <div className="p-3 text-center text-red-500">
              Error: {error.message}
            </div>
          ) : results.length > 0 ? (
            results.map((result, index) => resultRenderer(result, index))
          ) : searchTerm.length >= minLength ? (
            <div className="p-3 text-center text-gray-500">
              No results found
            </div>
          ) : (
            <div className="p-3 text-center text-gray-500">
              Type at least {minLength} characters to search
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;