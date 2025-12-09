import { useState, useEffect, useMemo } from 'react';

// Debounce utility function
function debounce(func, delay) {
  let timeoutId;
  const debounced = (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
  
  debounced.cancel = () => {
    clearTimeout(timeoutId);
  };
  
  return debounced;
}

export const useDebounceSearch = (searchFunction, delay = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedSearch = useMemo(
    () => debounce(async (term) => {
      if (!term.trim()) {
        setResults([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const data = await searchFunction(term);
        setResults(data?.data || data || []);
      } catch (err) {
        console.error('Search error:', err);
        setError(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, delay),
    [searchFunction, delay]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setError(null);
    setLoading(false);
  };

  return { 
    searchTerm, 
    setSearchTerm, 
    results, 
    loading, 
    error,
    clearSearch
  };
};