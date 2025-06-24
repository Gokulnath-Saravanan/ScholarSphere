import React, { useEffect, useState } from 'react';
import { db } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

type ResearchTrend = Database['public']['Tables']['research_trends']['Row'];
type Publication = Database['public']['Tables']['publications']['Row'];

const Research = () => {
  const [trends, setTrends] = useState<ResearchTrend[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both trends and publications
        const [trendsResponse, publicationsResponse] = await Promise.all([
          db.researchTrends.getAll(),
          db.publications.getAll()
        ]);

        if (trendsResponse.error) throw trendsResponse.error;
        if (publicationsResponse.error) throw publicationsResponse.error;

        setTrends(trendsResponse.data || []);
        setPublications(publicationsResponse.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch research data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate research domains and their publication counts
  const researchDomains = publications.reduce((acc, pub) => {
    if (pub.publication_type) {
      acc[pub.publication_type] = (acc[pub.publication_type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Get top research domains by publication count
  const topDomains = Object.entries(researchDomains)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  // Filter publications by selected domain
  const filteredPublications = selectedDomain
    ? publications.filter(pub => pub.publication_type === selectedDomain)
    : publications;

  if (loading) {
    return (
      <div className="min-h-screen bg-scholar-100">
        <Header />
        <main className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-scholar-500 mb-12">
              Loading Research Data...
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
            Research Overview
          </h1>

          {/* Research Domains Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-scholar-900 mb-6">
              Research Domains
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topDomains.map(([domain, count]) => (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(selectedDomain === domain ? '' : domain)}
                  className={`p-6 rounded-lg transition-all ${
                    selectedDomain === domain
                      ? 'bg-scholar-900 text-white'
                      : 'bg-white text-scholar-900 hover:bg-scholar-500 hover:text-white'
                  }`}
                >
                  <h3 className="text-lg font-semibold mb-2">{domain}</h3>
                  <p className="text-sm opacity-90">
                    {count} publication{count !== 1 ? 's' : ''}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* Research Trends Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-scholar-900 mb-6">
              Recent Research Trends
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trends.map((trend) => (
                <div
                  key={trend.id}
                  className="bg-white rounded-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-scholar-900 mb-2">
                    {trend.topic}
                  </h3>
                  <p className="text-scholar-700 text-sm mb-4">
                    Category: {trend.category}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-scholar-500 mb-3">
                    <span>Q{trend.quarter} {trend.year}</span>
                    <span>{trend.publication_count} publications</span>
                    <span>{trend.citation_count} citations</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-scholar-500">
                    <span>Growth Rate: {(trend.growth_rate * 100).toFixed(1)}%</span>
                    <span>Trend Score: {trend.trending_score.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Publications Section */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-scholar-900">
                  {selectedDomain ? `Publications in ${selectedDomain}` : 'All Publications'}
                </h2>
                <p className="text-scholar-500 mt-2">
                  Showing {filteredPublications.length} publication{filteredPublications.length !== 1 ? 's' : ''}
                </p>
              </div>
              {selectedDomain && (
                <button
                  onClick={() => setSelectedDomain('')}
                  className="text-scholar-500 hover:text-scholar-900"
                >
                  Clear Filter
                </button>
              )}
            </div>
            
            {/* Scrollable Publications Container */}
            <div className="relative">
              <div className="max-h-[600px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-scholar-500 scrollbar-track-scholar-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPublications.map((publication) => (
                    <div
                      key={publication.id}
                      className="bg-white rounded-lg p-6 shadow-md"
                    >
                      <h3 className="text-lg font-semibold text-scholar-900 mb-3 line-clamp-2">
                        {publication.title}
                      </h3>
                      <p className="text-scholar-700 text-sm mb-4 line-clamp-3">
                        {publication.abstract}
                      </p>
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
              </div>
              
              {/* Scroll Indicators */}
              <div className="absolute top-0 right-0 bottom-0 w-4 pointer-events-none bg-gradient-to-l from-scholar-100 to-transparent" />
              <div className="absolute top-0 right-0 bottom-0 w-4 pointer-events-none bg-gradient-to-r from-scholar-100 to-transparent" />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Research;
