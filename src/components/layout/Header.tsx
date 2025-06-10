
import { useState } from 'react';
import { Search, Menu, X, User, BookOpen, Users, Brain } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Faculty', href: '/faculty', icon: Users },
    { name: 'Publications', href: '/publications', icon: BookOpen },
    { name: 'Research', href: '/research', icon: Brain },
    { name: 'About', href: '/about', icon: User }
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-scholar-blue-300/20 z-50">
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
          <div className="hidden lg:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-scholar-blue-500" />
              <Input
                type="text"
                placeholder="Search faculty, publications..."
                className="pl-10 w-64 bg-scholar-blue-100/50 border-scholar-blue-300 focus:border-scholar-blue-500"
              />
            </div>
            <Button className="scholar-gradient hover:opacity-90 transition-opacity">
              Sign In
            </Button>
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
                <Input
                  type="text"
                  placeholder="Search..."
                  className="mb-3 bg-scholar-blue-100/50 border-scholar-blue-300"
                />
                <Button className="w-full scholar-gradient">Sign In</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
