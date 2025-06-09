
import { useState } from 'react';
import { Brain, Atom, Dna, Calculator, Telescope, Microscope, Search, TrendingUp } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Research = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');

  const researchAreas = [
    {
      id: 1,
      title: "Artificial Intelligence & Machine Learning",
      icon: Brain,
      description: "Advancing AI capabilities in natural language processing, computer vision, and ethical AI development.",
      researchers: 145,
      publications: 1250,
      projects: 68,
      subfields: ["Deep Learning", "Natural Language Processing", "Computer Vision", "AI Ethics", "Reinforcement Learning"],
      trends: [
        { topic: "Large Language Models", growth: "+125%" },
        { topic: "Federated Learning", growth: "+89%" },
        { topic: "Explainable AI", growth: "+76%" }
      ]
    },
    {
      id: 2,
      title: "Quantum Computing & Physics",
      icon: Atom,
      description: "Exploring quantum phenomena and developing next-generation quantum computing systems.",
      researchers: 89,
      publications: 670,
      projects: 34,
      subfields: ["Quantum Algorithms", "Quantum Cryptography", "Quantum Materials", "Theoretical Physics", "Quantum Information"],
      trends: [
        { topic: "Quantum Supremacy", growth: "+156%" },
        { topic: "Quantum Error Correction", growth: "+92%" },
        { topic: "Topological Qubits", growth: "+68%" }
      ]
    },
    {
      id: 3,
      title: "Biotechnology & Genomics",
      icon: Dna,
      description: "Revolutionary research in gene editing, personalized medicine, and synthetic biology.",
      researchers: 178,
      publications: 950,
      projects: 52,
      subfields: ["Gene Therapy", "CRISPR Technology", "Bioinformatics", "Synthetic Biology", "Precision Medicine"],
      trends: [
        { topic: "mRNA Therapeutics", growth: "+134%" },
        { topic: "Gene Drive Technology", growth: "+87%" },
        { topic: "Organoids Research", growth: "+95%" }
      ]
    },
    {
      id: 4,
      title: "Mathematics & Computational Science",
      icon: Calculator,
      description: "Pure and applied mathematics driving innovations in computation and modeling.",
      researchers: 112,
      publications: 780,
      projects: 41,
      subfields: ["Topology", "Algebraic Geometry", "Computational Mathematics", "Number Theory", "Discrete Mathematics"],
      trends: [
        { topic: "Topological Data Analysis", growth: "+78%" },
        { topic: "Computational Complexity", growth: "+65%" },
        { topic: "Mathematical Biology", growth: "+82%" }
      ]
    },
    {
      id: 5,
      title: "Astronomy & Astrophysics",
      icon: Telescope,
      description: "Unraveling the mysteries of the universe through observational and theoretical research.",
      researchers: 67,
      publications: 420,
      projects: 28,
      subfields: ["Exoplanet Detection", "Black Hole Physics", "Cosmology", "Gravitational Waves", "Dark Matter"],
      trends: [
        { topic: "James Webb Discoveries", growth: "+201%" },
        { topic: "Multi-messenger Astronomy", growth: "+143%" },
        { topic: "Exoplanet Atmospheres", growth: "+97%" }
      ]
    },
    {
      id: 6,
      title: "Biomedical Engineering",
      icon: Microscope,
      description: "Integrating engineering principles with biological systems for medical applications.",
      researchers: 134,
      publications: 650,
      projects: 45,
      subfields: ["Neural Engineering", "Tissue Engineering", "Medical Devices", "Biomaterials", "Biomedical Imaging"],
      trends: [
        { topic: "Brain-Computer Interfaces", growth: "+167%" },
        { topic: "3D Bioprinting", growth: "+112%" },
        { topic: "Nanomedicine", growth: "+89%" }
      ]
    }
  ];

  const filteredAreas = researchAreas.filter(area => {
    const matchesSearch = area.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         area.subfields.some(field => field.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesArea = selectedArea === 'all' || area.id.toString() === selectedArea;
    return matchesSearch && matchesArea;
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
                Research Areas
              </h1>
              <p className="text-xl text-scholar-blue-700 max-w-3xl mx-auto">
                Discover groundbreaking research across diverse fields of science and technology
              </p>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-scholar-blue-500" />
              <Input
                type="text"
                placeholder="Search research areas or subfields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-scholar-blue-100/50 border-scholar-blue-300 focus:border-scholar-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Research Areas Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold scholar-gradient-text mb-4">Active Research Areas</h2>
              <p className="text-scholar-blue-700">
                Showing {filteredAreas.length} research area{filteredAreas.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredAreas.map((area) => {
                const Icon = area.icon;
                return (
                  <Card key={area.id} className="glass-card hover-lift">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 scholar-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl text-scholar-blue-900 mb-2">
                            {area.title}
                          </CardTitle>
                          <p className="text-scholar-blue-700 leading-relaxed">
                            {area.description}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xl font-bold text-scholar-blue-900">{area.researchers}</div>
                          <div className="text-xs text-scholar-blue-700">Researchers</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-scholar-blue-900">{area.publications}</div>
                          <div className="text-xs text-scholar-blue-700">Publications</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-scholar-blue-900">{area.projects}</div>
                          <div className="text-xs text-scholar-blue-700">Projects</div>
                        </div>
                      </div>
                      
                      {/* Subfields */}
                      <div>
                        <h4 className="font-semibold text-scholar-blue-900 mb-2">Key Subfields</h4>
                        <div className="flex flex-wrap gap-1">
                          {area.subfields.map((field, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Trending Topics */}
                      <div>
                        <h4 className="font-semibold text-scholar-blue-900 mb-2 flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          Trending Topics
                        </h4>
                        <div className="space-y-2">
                          {area.trends.map((trend, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-scholar-blue-700">{trend.topic}</span>
                              <span className="text-green-600 font-medium">{trend.growth}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Button className="w-full scholar-gradient">
                        Explore Research Area
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Research Impact Section */}
        <section className="py-16 bg-gradient-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold scholar-gradient-text mb-4">
                Global Research Impact
              </h2>
              <p className="text-lg text-scholar-blue-700 max-w-2xl mx-auto">
                Our research community is making significant contributions to advancing human knowledge
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold scholar-gradient-text mb-2">500+</div>
                <div className="text-scholar-blue-700">Research Institutions</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold scholar-gradient-text mb-2">2,500+</div>
                <div className="text-scholar-blue-700">Active Researchers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold scholar-gradient-text mb-2">15,000+</div>
                <div className="text-scholar-blue-700">Publications</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold scholar-gradient-text mb-2">1M+</div>
                <div className="text-scholar-blue-700">Citations</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Research;
