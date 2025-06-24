import React, { useEffect, useState } from 'react';
import { db } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

type Publication = Database['public']['Tables']['publications']['Row'];

const Publications = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const { data, error } = await db.publications.getAll();
        if (error) throw error;
        setPublications(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch publications');
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  // Get unique publication types and years for filters
  const publicationTypes = Array.from(new Set(publications.map(p => p.publication_type))).filter(Boolean);
  const years = Array.from(new Set(publications.map(p => p.year))).sort((a, b) => b - a);

  // Filter publications based on search term and filters
  const filteredPublications = publications.filter(pub => {
    const matchesSearch = searchTerm === '' || 
      pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.abstract?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.venue?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === '' || pub.publication_type === selectedType;
    const matchesYear = selectedYear === '' || pub.year.toString() === selectedYear;

    return matchesSearch && matchesType && matchesYear;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-scholar-100">
        <Header />
        <main className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-scholar-500 mb-12">
              Loading Publications...
            </h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-scholar-100">
        <Header />
        <main className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-red-600 mb-12">
              {error}
            </h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-scholar-100">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-scholar-900 mb-12">
            Research Publications
          </h1>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
            <input
              type="text"
              placeholder="Search publications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-scholar-300 focus:outline-none focus:border-scholar-500 bg-white"
            />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full md:w-auto px-4 py-2 rounded-lg border border-scholar-300 focus:outline-none focus:border-scholar-500 bg-white"
            >
              <option value="">All Types</option>
              {publicationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full md:w-auto px-4 py-2 rounded-lg border border-scholar-300 focus:outline-none focus:border-scholar-500 bg-white"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <p className="text-scholar-500 mb-6">
            Showing {filteredPublications.length} publications
          </p>

          {/* Publications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPublications.map((publication) => (
              <div
                key={publication.id}
                className="bg-white rounded-lg p-6 shadow-md transform transition duration-300 hover:scale-105"
              >
                <h3 className="text-lg font-semibold text-scholar-900 mb-3 line-clamp-2">
                  {publication.title}
                </h3>
                <p className="text-scholar-700 text-sm mb-4 line-clamp-3">
                  {publication.abstract}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {publication.publication_type && (
                    <span className="px-3 py-1 bg-scholar-500 text-white rounded-full text-xs">
                      {publication.publication_type}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm text-scholar-500">
                  <span>{publication.year}</span>
                  <span>{publication.venue}</span>
                </div>
                {publication.doi && (
                  <a
                    href={`https://doi.org/${publication.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-scholar-900 hover:text-scholar-700 text-sm"
                  >
                    View Publication →
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* No Results Message */}
          {filteredPublications.length === 0 && (
            <div className="text-center py-12">
              <p className="text-scholar-500 text-lg">
                No publications found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Publications;
