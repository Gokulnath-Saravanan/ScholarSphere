import React, { useEffect, useState } from 'react';
import { db } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink, Mail, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import placeholderAvatar from '@/assets/images/placeholder-avatar.svg';

type Faculty = Database['public']['Tables']['faculty']['Row'];

const FacultyShowcase = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const { data, error } = await db.faculty.getAll();
        if (error) throw error;
        setFaculty(data?.slice(0, 3) || []); // Get first 3 faculty members for showcase
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch faculty');
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-[#EDE8F5]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#3D52A0] mb-12">
            Loading Featured Faculty...
          </h2>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-[#EDE8F5]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-red-600 mb-12">
            {error}
          </h2>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-[#EDE8F5]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-[#3D52A0] mb-12">
          Featured Faculty Members
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {faculty.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105"
            >
              <div className="flex justify-center pt-6">
                <div className="w-[100px] h-[100px] rounded-full overflow-hidden">
                  <img
                    src={member.photo_url || placeholderAvatar}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = placeholderAvatar;
                      target.onerror = null; // Prevent infinite loop if placeholder also fails
                    }}
                  />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#3D52A0] mb-2">
                  {member.name}
                </h3>
                <p className="text-[#8697C4] mb-2">{member.department}</p>
                <p className="text-[#ADBBDA] mb-4">{member.institution}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {member.expertise?.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#7091E6] text-white rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <Link
                  to={`${member.profile_url}`}
                  className="inline-block bg-[#3D52A0] text-white px-6 py-2 rounded-full hover:bg-[#7091E6] transition duration-300"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            to="/faculty"
            className="inline-block bg-[#7091E6] text-white px-8 py-3 rounded-full hover:bg-[#3D52A0] transition duration-300"
          >
            View All Faculty
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FacultyShowcase;
