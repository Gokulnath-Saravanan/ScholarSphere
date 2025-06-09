
import { useState } from 'react';
import { Search, Filter, Calendar, TrendingUp, Download, ExternalLink } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Publications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const publications = [
    {
      id: 1,
      title: "Fairness-Aware Machine Learning: A Survey and New Perspectives",
      authors: ["Dr. Sarah Chen", "Dr. Michael Rodriguez", "Dr. James Kim"],
      journal: "Nature Machine Intelligence",
      year: "2024",
      category: "Machine Learning",
      citations: 156,
      abstract: "This comprehensive survey examines the current state of fairness-aware machine learning, identifying key challenges and proposing new methodological approaches for developing equitable AI systems.",
      downloadUrl: "#",
      doi: "10.1038/s42256-024-00789-1"
    },
    {
      id: 2,
      title: "Quantum Computing Applications in Cryptography",
      authors: ["Dr. Michael Rodriguez", "Dr. Alice Johnson"],
      journal: "Physical Review Letters",
      year: "2024",
      category: "Quantum Computing",
      citations: 89,
      abstract: "We present novel applications of quantum computing principles to enhance cryptographic protocols, demonstrating significant improvements in security and efficiency.",
      downloadUrl: "#",
      doi: "10.1103/PhysRevLett.132.045001"
    },
    {
      id: 3,
      title: "CRISPR-Cas9 Gene Editing in Cancer Therapeutics",
      authors: ["Dr. Emily Watson", "Dr. Robert Brown"],
      journal: "Cell",
      year: "2023",
      category: "Biology",
      citations: 234,
      abstract: "This study explores the therapeutic potential of CRISPR-Cas9 technology in treating various forms of cancer, presenting promising results from clinical trials.",
      downloadUrl: "#",
      doi: "10.1016/j.cell.2023.11.023"
    },
    {
      id: 4,
      title: "Advances in Topological Data Analysis",
      authors: ["Dr. James Liu", "Dr. Maria Garcia"],
      journal: "Journal of Computational Geometry",
      year: "2023",
      category: "Mathematics",
      citations: 67,
      abstract: "We introduce new computational methods for topological data analysis, providing enhanced tools for understanding complex data structures in high-dimensional spaces.",
      downloadUrl: "#",
      doi: "10.20382/jocg.v14i1a12"
    }
  ];

  const years = ['all', '2024', '2023', '2022', '2021'];
  const categories = ['all', 'Machine Learning', 'Quantum Computing', 'Biology', 'Mathematics', 'Physics'];

  const filteredPublications = publications.filter(pub => {
    const matchesSearch = pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pub.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesYear = selectedYear === 'all' || pub.year === selectedYear;
    const matchesCategory = selectedCategory === 'all' || pub.category === selectedCategory;
    return matchesSearch && matchesYear && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-light py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold scholar-gradient-text mb-6">
                Publications
              </h1>
              <p className="text-xl text-scholar-blue-700 max-w-3xl mx-auto">
                Explore cutting-edge research and publications from leading academics worldwide
              </p>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-scholar-blue-500" />
                <Input
                  type="text"
                  placeholder="Search publications by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-scholar-blue-100/50 border-scholar-blue-300 focus:border-scholar-blue-500"
                />
              </div>
              
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-scholar-blue-500" />
                  <span className="text-sm font-medium text-scholar-blue-700">Filters:</span>
                </div>
                
                <div className="flex gap-2">
                  <Calendar className="h-4 w-4 text-scholar-blue-500 mt-1" />
                  {years.map(year => (
                    <Button
                      key={year}
                      variant={selectedYear === year ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedYear(year)}
                      className={selectedYear === year ? "scholar-gradient" : ""}
                    >
                      {year === 'all' ? 'All Years' : year}
                    </Button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <TrendingUp className="h-4 w-4 text-scholar-blue-500 mt-1" />
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category ? "scholar-gradient" : ""}
                    >
                      {category === 'all' ? 'All Categories' : category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Publications List */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <p className="text-scholar-blue-700">
                Showing {filteredPublications.length} publication{filteredPublications.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="space-y-6">
              {filteredPublications.map((publication) => (
                <Card key={publication.id} className="glass-card hover-lift">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 text-scholar-blue-900">
                          {publication.title}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {publication.authors.map((author, index) => (
                            <span key={index} className="text-scholar-blue-700">
                              {author}{index < publication.authors.length - 1 ? ',' : ''}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-scholar-blue-500">
                          <span>{publication.journal}</span>
                          <span>{publication.year}</span>
                          <Badge variant="secondary">{publication.category}</Badge>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-scholar-blue-900">{publication.citations}</div>
                        <div className="text-sm text-scholar-blue-700">Citations</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-scholar-blue-700 mb-4 leading-relaxed">
                      {publication.abstract}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                      <div className="text-sm text-scholar-blue-500">
                        DOI: {publication.doi}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Online
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Publications;
