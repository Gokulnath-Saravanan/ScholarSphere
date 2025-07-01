import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Users, BookOpen, Brain, Filter, X, MapPin, ExternalLink, Mail, Star, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { db } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import placeholderAvatar from '@/assets/images/placeholder-avatar.svg';

type Faculty = Database['public']['Tables']['faculty']['Row'];

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  expertise?: string[];
  citations?: number;
  h_index?: number;
  department?: string;
  institution?: string;
  city?: string;
  state?: string;
  domains?: string[];
  publication_type?: string;
  photo_url?: string | null;
  irins_profile_url?: string | null;
  email?: string | null;
  authors?: Array<{
    name: string;
    department: string;
    institution: string;
    position: number;
    is_corresponding: boolean;
  }>;
}

interface FilterState {
  department: string[];
  institution: string[];
  domain: string[];
  city: string[];
  state: string[];
}

interface FilterOptions {
  department: string[];
  institution: string[];
  domain: string[];
  city: string[];
  state: string[];
}

const Faculty = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [allFaculty, setAllFaculty] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    department: [],
    institution: [],
    domain: [],
    city: [],
    state: []
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    department: [],
    institution: [],
    domain: [],
    city: [],
    state: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [isSearching, setIsSearching] = useState(false);

  // Fetch all faculty on component mount
  useEffect(() => {
    const fetchAllFaculty = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await db.faculty.getAll();
        if (error) throw error;
        
        // Process and normalize the faculty data
        const normalizedFaculty = (data || []).map(faculty => ({
          ...faculty,
          irins_profile_url: faculty.irins_profile_url || null,
          email: faculty.email || null,
          department: faculty.department || '',
          institution: faculty.institution || '',
          expertise: faculty.expertise || [],
          citations: faculty.citations || 0,
          h_index: faculty.h_index || 0,
          photo_url: faculty.photo_url || null
        }));
        
        setAllFaculty(normalizedFaculty);
      } catch (err) {
        console.error('Error fetching faculty:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllFaculty();
  }, []);

  // Fetch filter options when component mounts
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      setSearchQuery(query);
      setIsSearching(true);
      fetchResults(query);
    } else {
      setIsSearching(false);
    }
  }, [searchParams, filters]);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/search/filter-options');
      if (!response.ok) {
        throw new Error('Failed to fetch filter options');
      }
      
      const data = await response.json();
      setFilterOptions({
        department: data.departments || [],
        institution: data.institutions || [],
        domain: data.domains || [],
        city: data.cities || [],
        state: data.states || []
      });
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  }

  const fetchResults = async (query: string) => {
    setIsLoading(true);
    try {
      // Only send active filters that have values
      const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value.length > 0) {
          acc[key] = value;
        }
        return acc;
      }, {} as Partial<FilterState>);

      const response = await fetch('http://localhost:8000/api/search/all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          filters: activeFilters,
          page: 1,
          limit: 50 // Increased limit for better results
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await response.json();
      
      // Process and normalize the results
      const allResults = [
        ...(data.faculty || []).map((item: any) => ({
          ...item,
          type: 'faculty',
          // Ensure all required fields are present with proper typing
          irins_profile_url: item.irins_profile_url || null,
          email: item.email || null,
          department: item.department || '',
          institution: item.institution || '',
          expertise: item.expertise || [],
          citations: item.citations || 0,
          h_index: item.h_index || 0,
          photo_url: item.photo_url || null,
          publications: item.publications || []
        })),
        ...(data.publications || []).map((item: any) => ({ ...item, type: 'publication' })),
        ...(data.research || []).map((item: any) => ({ ...item, type: 'research' }))
      ];

      setSearchResults(allResults);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderGrid = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-10">
          <span className="loader"></span>
        </div>
      );
    }

    // If searching, show searchResults; otherwise, show allFaculty
    const dataToShow = isSearching ? searchResults : allFaculty;

    if (dataToShow.length === 0) {
      return (
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold text-[#3D52A0] mb-4">No results found</h2>
          <p className="text-[#8697C4]">
            Try adjusting your search or filter options.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dataToShow.map((member: any) => renderFacultyCard(member))}
      </div>
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery, type: 'all' });
      setIsSearching(true);
    } else {
      setSearchParams({});
      setIsSearching(false);
    }
  };

  const handleFilterChange = (category: keyof FilterState, value: string) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [category]: prev[category].includes(value)
          ? prev[category].filter(item => item !== value)
          : [...prev[category], value]
      };
      
      // If we're in search mode, trigger a new search with updated filters
      if (isSearching && searchQuery) {
        fetchResults(searchQuery);
      }
      
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({
      department: [],
      institution: [],
      domain: [],
      city: [],
      state: []
    });
    
    // If we're in search mode, trigger a new search with cleared filters
    if (isSearching && searchQuery) {
      fetchResults(searchQuery);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'faculty':
        return <Users className="h-5 w-5 text-scholar-500" />;
      case 'publication':
        return <BookOpen className="h-5 w-5 text-scholar-500" />;
      case 'research':
        return <Brain className="h-5 w-5 text-scholar-500" />;
      default:
        return null;
    }
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).reduce((count, filterArray) => count + filterArray.length, 0);
  };

  const renderFacultyCard = (member: any) => {
    if (member.irins_profile_url) {
      // Always show metrics, even if 0, and fix search bar appearance
      return (
        <div
          key={member.id}
          className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-scholar-500"
          tabIndex={0}
          aria-label={`View IRINS profile for ${member.name}`}
          onClick={() => window.open(member.irins_profile_url, '_blank', 'noopener,noreferrer')}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              window.open(member.irins_profile_url, '_blank', 'noopener,noreferrer');
            }
          }}
          role="button"
        >
          {/* Faculty Header with Photo */}
          <div className="flex justify-center pt-6">
            <div className="w-[100px] h-[100px] rounded-full overflow-hidden">
              <img
                src={member.photo_url || placeholderAvatar}
                alt={member.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = placeholderAvatar;
                  target.onerror = null;
                }}
              />
            </div>
          </div>

          {/* Faculty Info */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-[#3D52A0] mb-2">
              {member.name || member.title || 'Faculty'}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-scholar-500" />
              <p className="text-[#8697C4]">{member.department}</p>
            </div>
            <p className="text-[#ADBBDA] mb-4">{member.institution}</p>

            {/* Expertise Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {member.expertise?.slice(0, 3).map((skill: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-[#7091E6] text-white hover:bg-[#3D52A0]"
                >
                  {skill}
                </Badge>
              ))}
            </div>

            {/* Metrics - always show, even if 0 */}
            <div className="flex items-center gap-4 text-sm text-scholar-600 mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>Citations: {member.citations ?? 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>h-index: {member.h_index ?? 0}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 mb-6">
              {/* Keep View Profile button for clarity, but it's redundant since card is clickable */}
              <Button
                asChild
                className="w-full bg-[#3D52A0] hover:bg-[#7091E6] text-white transition duration-300"
                tabIndex={-1}
              >
                <span className="inline-flex items-center justify-center pointer-events-none">
                  View Profile
                  <ExternalLink className="ml-2 h-4 w-4" />
                </span>
              </Button>
              {member.email && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-[#3D52A0] text-[#3D52A0] hover:bg-[#EDE8F5] transition duration-300"
                  tabIndex={-1}
                >
                  <a
                    href={`mailto:${member.email}`}
                    className="inline-flex items-center justify-center"
                    onClick={e => e.stopPropagation()}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </a>
                </Button>
              )}
            </div>

            {/* Publications Section */}
            {member.publications && member.publications.length > 0 && (
              <div className="border-t border-scholar-100 pt-4">
                <h4 className="text-lg font-semibold text-[#3D52A0] mb-3">
                  Publications
                  {/* ...existing code... */}
                </h4>
                {/* ...existing code... */}
              </div>
            )}
          </div>
        </div>
      );
    }
    return (
      <div
        key={member.id}
        className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105"
      >
        {/* Faculty Header with Photo */}
        <div className="flex justify-center pt-6">
          <div className="w-[100px] h-[100px] rounded-full overflow-hidden">
            <img
              src={member.photo_url || placeholderAvatar}
              alt={member.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = placeholderAvatar;
                target.onerror = null;
              }}
            />
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-[#3D52A0] mb-2">
            {member.name || member.title || 'Faculty'}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-scholar-500" />
            <p className="text-[#8697C4]">{member.department}</p>
          </div>
          <p className="text-[#ADBBDA] mb-4">{member.institution}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {member.expertise?.slice(0, 3).map((skill: string, index: number) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-[#7091E6] text-white hover:bg-[#3D52A0]"
              >
                {skill}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm text-scholar-600 mb-4">
            {typeof member.citations === 'number' && member.citations > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>Citations: {member.citations}</span>
              </div>
            )}
            {typeof member.h_index === 'number' && member.h_index > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>h-index: {member.h_index}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 mb-6">
            {member.email && (
              <Button
                asChild
                variant="outline"
                className="w-full border-[#3D52A0] text-[#3D52A0] hover:bg-[#EDE8F5] transition duration-300"
              >
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex items-center justify-center"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </a>
              </Button>
            )}
          </div>
          {member.publications && member.publications.length > 0 && (
            <div className="border-t border-scholar-100 pt-4">
              <h4 className="text-lg font-semibold text-[#3D52A0] mb-3">
                Publications
              </h4>
              {/* ...existing code for publications... */}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search bar and filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 w-full">
            <form onSubmit={handleSearch} className="flex-1 w-full md:max-w-xl">
              <label htmlFor="faculty-search" className="block text-sm font-medium text-scholar-700 mb-1 ml-1">
                Search Faculty
              </label>
              <div className="relative flex items-center w-full bg-white rounded-full shadow border border-scholar-200">
                <span className="absolute left-4 text-scholar-400 pointer-events-none">
                  <Search className="h-5 w-5" />
                </span>
                <Input
                  id="faculty-search"
                  type="text"
                  placeholder="Search by name, expertise, or department"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-full pl-12 pr-4 py-2 border-0 focus:ring-2 focus:ring-[#3D52A0]/20 text-base transition-all bg-transparent"
                  aria-label="Search faculty"
                  autoComplete="off"
                />
                <Button type="submit" className="ml-2 px-5 py-2 rounded-full bg-[#3D52A0] hover:bg-[#7091E6] text-white font-semibold shadow transition-all" >
                  <Search className="h-5 w-5 mr-1" />
                  Search
                </Button>
              </div>
            </form>
            <div className="flex flex-row items-end gap-2 w-full md:w-auto md:mt-6 md:justify-end justify-start">
              <Button
                type="button"
                variant="outline"
                className="border-scholar-300 text-scholar-700 hover:bg-scholar-100"
                onClick={() => setShowFilters(v => !v)}
                aria-label="Show filters"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#3D52A0] text-white">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </Button>
              {getActiveFiltersCount() > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-scholar-500 hover:bg-scholar-100"
                  onClick={clearFilters}
                  aria-label="Clear all filters"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
          {/* Filters panel */}
          {showFilters && (
            <div className="mb-8 p-4 bg-white rounded-lg shadow border border-scholar-100">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(filterOptions).map(([category, options]) => (
                  <div key={category}>
                    <h5 className="font-semibold text-scholar-700 mb-2 capitalize">{category}</h5>
                    <ScrollArea className="h-32 pr-2">
                      {options.map(option => (
                        <label key={option} className="flex items-center gap-2 mb-1 cursor-pointer">
                          <Checkbox
                            checked={filters[category as keyof FilterState].includes(option)}
                            onCheckedChange={() => handleFilterChange(category as keyof FilterState, option)}
                            className={filters[category as keyof FilterState].includes(option) ? 'data-[state=checked]:text-black text-black' : ''}
                          />
                          <span className="text-scholar-600 text-sm">{option}</span>
                        </label>
                      ))}
                    </ScrollArea>
                  </div>
                ))}
              </div>
            </div>
          )}
          {renderGrid()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Faculty;