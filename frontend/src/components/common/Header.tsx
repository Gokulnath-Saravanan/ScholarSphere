import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { FaSearch, FaUser, FaBook, FaUserTie, FaChartLine } from 'react-icons/fa';
import axios from 'axios';
import { useRouter } from 'next/router';

interface SearchResult {
  id: string;
  type: 'faculty' | 'profile' | 'publication' | 'trend';
  title: string;
  description: string;
  [key: string]: any;
}

interface SearchResponse {
  faculty: SearchResult[];
  profiles: SearchResult[];
  publications: SearchResult[];
  trends?: SearchResult[];
}

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearch.trim()) {
        setIsLoading(true);
        try {
          const response = await axios.post('http://localhost:8000/api/search/all', {
            query: debouncedSearch,
            limit: 5
          });
          setSearchResults(response.data);
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults(null);
        setShowResults(false);
      }
    };

    performSearch();
  }, [debouncedSearch]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'faculty':
        return <FaUserTie className="text-[#3D52A0]" />;
      case 'profile':
        return <FaUser className="text-[#7091E6]" />;
      case 'publication':
        return <FaBook className="text-[#8697C4]" />;
      case 'trend':
        return <FaChartLine className="text-[#ADBBDA]" />;
      default:
        return <FaSearch className="text-[#ADBBDA]" />;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'faculty':
        window.location.href = `/faculty/${result.id}`;
        break;
      case 'profile':
        window.location.href = `/profiles/${result.id}`;
        break;
      case 'publication':
        window.location.href = `/publications/${result.id}`;
        break;
      case 'trend':
        window.location.href = `/trends/${result.id}`;
        break;
    }
    setShowResults(false);
  };

  const getResultDescription = (result: SearchResult) => {
    switch (result.type) {
      case 'faculty':
        return `${result.description} | Citations: ${result.citations || 'N/A'} | h-index: ${result.h_index || 'N/A'}`;
      case 'profile':
        return result.description;
      case 'publication':
        const authors = result.authors?.map(a => a.name).join(', ');
        return `${result.publication_type || 'Publication'} (${result.year || 'N/A'})${authors ? ` | Authors: ${authors}` : ''}`;
      case 'trend':
        return result.description;
      default:
        return '';
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'faculty':
        return 'Faculty Members';
      case 'profiles':
        return 'User Profiles';
      case 'publications':
        return 'Publications';
      case 'trends':
        return 'Research Trends';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to faculty page with search query
      router.push({
        pathname: '/faculty',
        query: { 
          search: searchQuery,
          type: 'all' // This will indicate to show all types of results
        }
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(e);
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-start">
            <div className="max-w-lg w-full lg:max-w-xs relative" ref={searchRef}>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-5 w-5 text-[#ADBBDA]" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-[#EDE8F5] rounded-md leading-5 bg-white placeholder-[#ADBBDA] focus:outline-none focus:ring-2 focus:ring-[#7091E6] focus:border-[#7091E6] sm:text-sm"
                    placeholder="Search faculty, publications, research..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  {isLoading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#7091E6]"></div>
                    </div>
                  )}
                </div>
              </form>

              {showResults && searchResults && (
                <div className="absolute mt-1 w-full bg-white rounded-md shadow-lg max-h-96 overflow-y-auto z-50 border border-[#EDE8F5]">
                  {Object.entries(searchResults).map(([category, results]) => (
                    results && results.length > 0 && (
                      <div key={category}>
                        <div className="px-4 py-2 text-sm font-medium text-[#3D52A0] bg-[#EDE8F5]">
                          {getCategoryTitle(category)}
                        </div>
                        {results.map((result) => (
                          <div
                            key={`${result.type}-${result.id}`}
                            className="px-4 py-2 hover:bg-[#EDE8F5] cursor-pointer"
                            onClick={() => handleResultClick(result)}
                          >
                            <div className="flex items-center">
                              <span className="mr-2">{getIcon(result.type)}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-[#3D52A0] truncate">
                                  {result.title}
                                </div>
                                <div className="text-xs text-[#8697C4] truncate">
                                  {getResultDescription(result)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ))}
                  {(!searchResults || Object.values(searchResults).every(results => !results?.length)) && (
                    <div className="px-4 py-2 text-sm text-[#8697C4]">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 