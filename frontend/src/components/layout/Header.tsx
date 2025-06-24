import { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, User, BookOpen, Users, Brain, BarChart } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthButton from './AuthButton';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  domains?: string[];
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(searchQuery, 300);

  const navigation = [
    { name: 'Faculty', href: '/faculty', icon: Users },
    { name: 'Publications', href: '/publications', icon: BookOpen },
    { name: 'Research', href: '/research', icon: Brain },
    { name: 'Analytics', href: '/analytics', icon: BarChart },
    { name: 'About', href: '/about', icon: User }
  ];

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
      if (!debouncedSearch) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch('http://localhost:8000/api/search/all', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: debouncedSearch,
            limit: 5
          })
        });

        const data = await response.json();
        
        // Combine and format results
        const formattedResults = [
          ...(data.faculty || []).map((item: any) => ({
            id: item.id,
            type: 'faculty',
            title: item.name,
            description: item.department,
            domains: item.research_interests
          })),
          ...(data.publications || []).map((item: any) => ({
            id: item.id,
            type: 'publication',
            title: item.title,
            description: item.abstract?.substring(0, 100) + '...',
            domains: data.domains[item.id]?.domains || []
          })),
          ...(data.research || []).map((item: any) => ({
            id: item.id,
            type: 'research',
            title: item.title,
            description: item.description?.substring(0, 100) + '...',
            domains: data.domains[item.id]?.domains || []
          }))
        ];

        setSearchResults(formattedResults);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearch]);

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setSearchQuery('');
    navigate(`/${result.type}/${result.id}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      navigate({
        pathname: '/faculty',
        search: `?search=${encodeURIComponent(searchQuery)}&type=all`
      });
      setSearchQuery('');
    }
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-scholar-blue-300/20 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 scholar-gradient rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold scholar-gradient-text">ScholarSphere</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 transition-colors duration-200 ${
                    isActive(item.href) 
                      ? 'text-scholar-blue-900 font-medium' 
                      : 'text-scholar-blue-700 hover:text-scholar-blue-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center space-x-4" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                isSearching ? 'text-scholar-blue-900 animate-pulse' : 'text-scholar-blue-500'
              }`} />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowResults(true)}
                placeholder="Search faculty, publications..."
                className="pl-10 w-64 bg-scholar-blue-100/50 border-scholar-blue-300 focus:border-scholar-blue-500"
              />

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-scholar-blue-200 max-h-96 overflow-y-auto">
                  {searchResults.map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="p-3 hover:bg-scholar-blue-50 cursor-pointer border-b border-scholar-blue-100 last:border-0"
                    >
                      <div className="flex items-center space-x-2">
                        {result.type === 'faculty' && <Users className="h-4 w-4 text-scholar-blue-600" />}
                        {result.type === 'publication' && <BookOpen className="h-4 w-4 text-scholar-blue-600" />}
                        {result.type === 'research' && <Brain className="h-4 w-4 text-scholar-blue-600" />}
                        <div>
                          <h4 className="text-sm font-medium text-scholar-blue-900">{result.title}</h4>
                          {result.description && (
                            <p className="text-xs text-scholar-blue-600 mt-1">{result.description}</p>
                          )}
                          {result.domains && result.domains.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {result.domains.map((domain, index) => (
                                <span
                                  key={index}
                                  className="px-1.5 py-0.5 text-xs bg-scholar-blue-100 text-scholar-blue-700 rounded"
                                >
                                  {domain}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </form>
            <AuthButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-scholar-blue-300/20">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 transition-colors duration-200 ${
                      isActive(item.href) 
                        ? 'text-scholar-blue-900 font-medium' 
                        : 'text-scholar-blue-700 hover:text-scholar-blue-900'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-scholar-blue-300/20">
                <form onSubmit={handleSearch} className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                    isSearching ? 'text-scholar-blue-900 animate-pulse' : 'text-scholar-blue-500'
                  }`} />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="pl-10 bg-scholar-blue-100/50 border-scholar-blue-300"
                  />
                </form>
                <AuthButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
