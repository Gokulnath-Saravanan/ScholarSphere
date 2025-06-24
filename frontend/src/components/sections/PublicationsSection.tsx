import React, { useEffect, useState } from 'react';
import { db } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Link } from 'react-router-dom';
import { Calendar, Download, ExternalLink, Eye, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Publication = Database['public']['Tables']['publications']['Row'];

const PublicationsSection = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const { data, error } = await db.publications.getAll();
        if (error) throw error;
        setPublications(data?.slice(0, 6) || []); // Get latest 6 publications
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch publications');
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#3D52A0] mb-12">
            Loading Latest Publications...
          </h2>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-red-600 mb-12">
            {error}
          </h2>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-scholar-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-scholar-900 mb-12">
          Latest Research Publications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publications.map((publication) => (
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
        <div className="text-center mt-8">
          <Link
            to="/publications"
            className="inline-block bg-[#7091E6] text-white px-8 py-3 rounded-full hover:bg-[#3D52A0] transition duration-300"
          >
            View All Publications
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PublicationsSection;
