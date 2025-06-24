import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FaSearch } from 'react-icons/fa';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push({
        pathname: '/faculty',
        query: { 
          search: searchQuery,
          type: 'all'
        }
      });
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#3D52A0] to-[#7091E6] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            Discover Academic Excellence
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-[#EDE8F5] sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Search across faculty, publications, and research trends
          </p>
          <div className="mt-10 max-w-xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-[#ADBBDA]" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-transparent rounded-md leading-5 bg-white placeholder-[#ADBBDA] focus:outline-none focus:ring-2 focus:ring-white focus:border-white sm:text-sm"
                placeholder="Search by name, department, research interest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="mt-3 w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-[#3D52A0] bg-white hover:bg-[#EDE8F5] md:py-2 md:text-lg md:px-6 transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 