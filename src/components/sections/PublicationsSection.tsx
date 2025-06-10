
import { Calendar, Download, ExternalLink, Eye, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PublicationsSection = () => {
  const publications = [
    {
      id: 1,
      title: "Advanced Machine Learning Techniques for Medical Diagnosis",
      authors: ["Dr. Sarah Chen", "Dr. Michael Rodriguez", "Dr. Emily Johnson"],
      journal: "Nature Machine Intelligence",
      year: 2024,
      citations: 342,
      downloads: 1250,
      doi: "10.1038/s42256-024-00123-4",
      category: "AI & Machine Learning",
      abstract: "This paper presents novel approaches to medical diagnosis using advanced machine learning algorithms, achieving 95% accuracy in early disease detection.",
      openAccess: true
    },
    {
      id: 2,
      title: "Sustainable Energy Solutions for Smart Cities",
      authors: ["Dr. Emily Johnson", "Dr. Robert Kim"],
      journal: "Science",
      year: 2024,
      citations: 178,
      downloads: 892,
      doi: "10.1126/science.abcd1234",
      category: "Environmental Science",
      abstract: "Comprehensive analysis of renewable energy integration in urban environments, proposing a framework for sustainable smart city development.",
      openAccess: false
    },
    {
      id: 3,
      title: "Quantum Computing Applications in Cryptography",
      authors: ["Dr. Alex Thompson", "Dr. Lisa Wang"],
      journal: "Physical Review Letters",
      year: 2023,
      citations: 456,
      downloads: 2100,
      doi: "10.1103/PhysRevLett.130.123456",
      category: "Quantum Physics",
      abstract: "Exploration of quantum algorithms for next-generation cryptographic systems, addressing security challenges in the post-quantum era.",
      openAccess: true
    }
  ];

  return (
    <section id="publications" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold scholar-gradient-text mb-4">
            Latest Publications
          </h2>
          <p className="text-lg text-scholar-blue-700 max-w-2xl mx-auto">
            Explore cutting-edge research publications from leading academic institutions
          </p>
        </div>

        <div className="space-y-8">
          {publications.map((pub, index) => (
            <div
              key={pub.id}
              className="glass-card rounded-2xl p-6 hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                {/* Main Content */}
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge
                          variant="secondary"
                          className="bg-scholar-blue-100 text-scholar-blue-800"
                        >
                          {pub.category}
                        </Badge>
                        {pub.openAccess && (
                          <Badge className="bg-green-100 text-green-800">
                            Open Access
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-scholar-blue-900 mb-2 hover:text-scholar-blue-700 transition-colors cursor-pointer">
                        {pub.title}
                      </h3>
                    </div>
                  </div>

                  {/* Authors */}
                  <div className="flex items-center space-x-2 mb-3">
                    <Users className="h-4 w-4 text-scholar-blue-600" />
                    <span className="text-scholar-blue-700 text-sm">
                      {pub.authors.join(', ')}
                    </span>
                  </div>

                  {/* Journal & Date */}
                  <div className="flex items-center space-x-4 mb-3 text-sm text-scholar-blue-600">
                    <span className="font-medium">{pub.journal}</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{pub.year}</span>
                    </div>
                    <span>DOI: {pub.doi}</span>
                  </div>

                  {/* Abstract */}
                  <p className="text-scholar-blue-700 mb-4 line-clamp-2">
                    {pub.abstract}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center space-x-6 text-sm text-scholar-blue-600">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{pub.citations} citations</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Download className="h-4 w-4" />
                      <span>{pub.downloads} downloads</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col space-x-3 lg:space-x-0 lg:space-y-3 mt-4 lg:mt-0">
                  <Button size="sm" className="scholar-gradient">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Paper
                  </Button>
                  <Button size="sm" variant="outline" className="border-scholar-blue-500 text-scholar-blue-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="border-scholar-blue-500 text-scholar-blue-700">
            Browse All Publications
            <ExternalLink className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PublicationsSection;
