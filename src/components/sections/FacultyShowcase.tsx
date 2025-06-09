
import { MapPin, ExternalLink, Mail, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const FacultyShowcase = () => {
  const featuredFaculty = [
    {
      id: 1,
      name: "Dr. Sarah Chen",
      title: "Professor of Computer Science",
      institution: "MIT",
      location: "Cambridge, MA",
      image: "/placeholder.svg",
      specializations: ["Machine Learning", "AI Ethics", "Neural Networks"],
      publications: 87,
      citations: 3420,
      rating: 4.9,
      bio: "Leading researcher in artificial intelligence with focus on ethical AI development and neural network optimization."
    },
    {
      id: 2,
      name: "Dr. Michael Rodriguez",
      title: "Associate Professor of Bioengineering",
      institution: "Stanford University",
      location: "Stanford, CA",
      image: "/placeholder.svg",
      specializations: ["Biomedical Devices", "Tissue Engineering", "Regenerative Medicine"],
      publications: 64,
      citations: 2890,
      rating: 4.8,
      bio: "Pioneering work in biomedical engineering with applications in regenerative medicine and medical device development."
    },
    {
      id: 3,
      name: "Dr. Emily Johnson",
      title: "Professor of Environmental Science",
      institution: "UC Berkeley",
      location: "Berkeley, CA",
      image: "/placeholder.svg",
      specializations: ["Climate Change", "Sustainability", "Environmental Policy"],
      publications: 92,
      citations: 4150,
      rating: 4.9,
      bio: "Environmental scientist focusing on climate change mitigation strategies and sustainable development policies."
    }
  ];

  return (
    <section id="faculty" className="py-20 bg-gradient-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold scholar-gradient-text mb-4">
            Featured Faculty
          </h2>
          <p className="text-lg text-scholar-blue-700 max-w-2xl mx-auto">
            Discover leading researchers and educators making groundbreaking contributions to their fields
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredFaculty.map((faculty, index) => (
            <div
              key={faculty.id}
              className="glass-card rounded-2xl p-6 hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Profile Header */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 bg-scholar-blue-300 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-scholar-blue-900">
                    {faculty.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-scholar-blue-900">
                    {faculty.name}
                  </h3>
                  <p className="text-scholar-blue-700 text-sm">{faculty.title}</p>
                  <div className="flex items-center text-scholar-blue-600 text-sm mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {faculty.institution}, {faculty.location}
                  </div>
                </div>
                <div className="flex items-center text-scholar-blue-700">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm">{faculty.rating}</span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-scholar-blue-700 text-sm mb-4 line-clamp-3">
                {faculty.bio}
              </p>

              {/* Specializations */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {faculty.specializations.map((spec, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-scholar-blue-100 text-scholar-blue-800 hover:bg-scholar-blue-200"
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-3 bg-scholar-blue-50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-scholar-blue-900">
                    {faculty.publications}
                  </div>
                  <div className="text-xs text-scholar-blue-700">Publications</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-scholar-blue-900">
                    {faculty.citations.toLocaleString()}
                  </div>
                  <div className="text-xs text-scholar-blue-700">Citations</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button size="sm" className="flex-1 scholar-gradient text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Profile
                </Button>
                <Button size="sm" variant="outline" className="border-scholar-blue-500 text-scholar-blue-700">
                  <Mail className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="border-scholar-blue-500 text-scholar-blue-700">
            View All Faculty
            <ExternalLink className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FacultyShowcase;
