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
  };

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

  const renderFacultyCard = (member: any) => (
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

      {/* Faculty Info */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-[#3D52A0] mb-2">
          {member.name}
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

        {/* Metrics */}
        <div className="flex items-center gap-4 text-sm text-scholar-600 mb-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span>Citations: {member.citations || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>h-index: {member.h_index || 0}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mb-6">
          {member.irins_profile_url && (
            <Button
              asChild
              className="w-full bg-[#3D52A0] hover:bg-[#7091E6] text-white transition duration-300"
            >
              <a
                href={member.irins_profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center"
              >
                View Profile
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          )}
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

        {/* Publications Section */}
        {member.publications && member.publications.length > 0 && (
          <div className="border-t border-scholar-100 pt-4">
            <h4 className="text-lg font-semibold text-[#3D52A0] mb-3">
              Publications
              {searchQuery && (
                <span className="text-sm font-normal text-scholar-600 ml-2">
                  in {searchQuery}
                </span>
              )}
            </h4>
            <div className="space-y-4">
              {member.publications.map((pub: any) => (
                <div key={pub.id} className="p-4 bg-scholar-50 rounded-lg border border-scholar-100">
                  <h5 className="text-sm font-medium text-[#3D52A0] mb-2">
                    {pub.title}
                  </h5>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-scholar-500">
                    {pub.venue && (
                      <Badge variant="outline" className="bg-white">
                        {pub.venue}
                      </Badge>
                    )}
                    {pub.year && (
                      <Badge variant="outline" className="bg-white">
                        <Calendar className="h-3 w-3 mr-1" />
                        {pub.year}
                      </Badge>
                    )}
                    {pub.citation_count > 0 && (
                      <Badge variant="outline" className="bg-white">
                        <Star className="h-3 w-3 mr-1" />
                        {pub.citation_count} citations
                      </Badge>
                    )}
                  </div>
                  {/* Research Domains */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {pub.research_domains?.map((domain: string, idx: number) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs bg-[#EDE8F5] text-[#3D52A0] border-[#7091E6]"
                      >
                        {domain}
                      </Badge>
                    ))}
                  </div>
                  {/* Paper Link */}
                  {pub.paper_url && (
                    <a
                      href={pub.paper_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center text-xs text-[#3D52A0] hover:text-[#7091E6]"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Paper
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {allFaculty.map((member) => renderFacultyCard(member))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Bar */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-scholar-500" />
                </div>
                <Input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-scholar-300 rounded-md leading-5 bg-white placeholder-scholar-400 focus:outline-none focus:ring-2 focus:ring-scholar-500 focus:border-scholar-500"
                  placeholder="Search faculty, publications, research..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="px-4 py-2 flex items-center gap-2 bg-scholar-100/30 hover:bg-scholar-100/50 border-scholar-300"
              >
                <Filter className="h-4 w-4" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-scholar-500 text-white">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </form>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-scholar-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-scholar-900">Filters</h3>
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="text-sm text-scholar-500 hover:text-scholar-700"
                    disabled={getActiveFiltersCount() === 0}
                  >
                    Clear all
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowFilters(false)}
                    size="icon"
                    className="text-scholar-500 hover:text-scholar-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Object.entries(filterOptions).map(([category, options]) => (
                  <div key={category} className="space-y-3">
                    <h4 className="font-medium text-scholar-700 capitalize mb-2">
                      {category}
                    </h4>
                    <ScrollArea className="h-[200px] pr-4">
                      <div className="space-y-2">
                        {options.map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${category}-${option}`}
                              checked={filters[category as keyof FilterState].includes(option)}
                              onCheckedChange={() => handleFilterChange(category as keyof FilterState, option)}
                              className="border-scholar-300 data-[state=checked]:bg-scholar-500 data-[state=checked]:border-scholar-500"
                            />
                            <label
                              htmlFor={`${category}-${option}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-scholar-700"
                            >
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scholar-500"></div>
            </div>
          ) : isSearching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {searchResults.length > 0 ? (
                searchResults.map((result) => {
                  if (result.type === 'faculty') {
                    return renderFacultyCard({
                      ...result,
                      name: result.title, // Map title to name for faculty
                      department: result.department,
                      institution: result.institution,
                      expertise: result.expertise,
                      citations: result.citations,
                      h_index: result.h_index,
                      photo_url: result.photo_url,
                      irins_profile_url: result.irins_profile_url,
                      email: result.email
                    });
                  } else {
                    return (
                      <div
                        key={`${result.type}-${result.id}`}
                        className="bg-white rounded-lg shadow-sm border border-scholar-100 p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {getResultIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-medium text-scholar-900 mb-1">
                              {result.title}
                            </h2>
                            <p className="text-sm text-scholar-600 mb-2">
                              {result.description}
                            </p>
                            {result.type === 'publication' && result.authors && (
                              <div className="mt-2 text-sm text-scholar-600">
                                <p>Authors: {result.authors.map(a => a.name).join(', ')}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                })
              ) : (
                <div className="text-center py-12 col-span-3">
                  <p className="text-scholar-600">
                    {searchQuery 
                      ? `No results found for "${searchQuery}"`
                      : "Enter a search term to find faculty, publications, and research"}
                  </p>
                </div>
              )}
            </div>
          ) : (
            renderGrid()
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Faculty;
