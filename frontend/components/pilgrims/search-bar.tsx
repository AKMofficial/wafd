'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { useEffect, useState } from 'react';
import { usePilgrimStore } from '@/store/pilgrim-store';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function PilgrimSearchBar({
  placeholder = 'Search pilgrims...',
  className = ''
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const { setFilters, filters } = usePilgrimStore();

  // Update filters when debounced value changes
  useEffect(() => {
    setFilters({
      ...filters,
      search: debouncedSearchValue,
    });
  }, [debouncedSearchValue]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <Input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-4"
      />
    </div>
  );
}