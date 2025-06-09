
import { useState } from 'react';
import { Search, Filter, MapPin, Mail, ExternalLink } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const Faculty = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const facultyMembers = [
    {
      id: 1,
      name: "Dr. Sarah Chen",
      title: "Professor of Computer Science",
      department: "Computer Science",
      institution: "Stanford University",
      image: "/placeholder.svg",
      expertise: ["Machine Learning", "AI Ethics", "Neural Networks"],
      publications: 127,
      citations: 8420,
      email: "s.chen@stanford.edu",
      location: "Stanford, CA"
    },
    {
      id: 2,
      name: "Dr. Michael Rodriguez",
      title: "Associate Professor of Physics",
      department: "Physics",
      institution: "MIT",
      image: "/placeholder.svg",
      expertise: ["Quantum Computing", "Theoretical Physics", "Condensed Matter"],
      publications: 89,
      citations: 5630,
      email: "m.rodriguez@mit.edu",
      location: "Cambridge, MA"
    },
    {
      id: 3,
      name: "Dr. Emily Watson",
      title: "Professor of Biology",
      department: "Biology",
      institution: "Harvard University",
      image: "/placeholder.svg",
      expertise: ["Genomics", "Bioinformatics", "Cancer Research"],
      publications: 156,
      citations: 12340,
      email: "e.watson@harvard.edu",
      location: "Cambridge, MA"
    },
    {
      id: 4,
      name: "Dr. James Liu",
      title: "Assistant Professor of Mathematics",
      department: "Mathematics",
      institution: "Caltech",
      image: "/placeholder.svg",
      expertise: ["Topology", "Algebraic Geometry", "Number Theory"],
      publications: 43,
      citations: 2190,
      email: "j.liu@caltech.edu",
      location: "Pasadena, CA"
    }
  ];

  const departments = ['all', 'Computer Science', 'Physics', 'Biology', 'Mathematics'];

  const filteredFaculty = facultyMembers.filter(faculty => {
    const matchesSearch = faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faculty.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartment = selectedDepartment === 'all' || faculty.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
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
                Faculty Directory
              </h1>
              <p className="text-xl text-scholar-blue-700 max-w-3xl mx-auto">
                Discover leading researchers and academics from top institutions worldwide
              </p>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-scholar-blue-500" />
                <Input
                  type="text"
                  placeholder="Search by name or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-scholar-blue-100/50 border-scholar-blue-300 focus:border-scholar-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <Filter className="h-4 w-4 text-scholar-blue-500 mt-2" />
                {departments.map(dept => (
                  <Button
                    key={dept}
                    variant={selectedDepartment === dept ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDepartment(dept)}
                    className={selectedDepartment === dept ? "scholar-gradient" : ""}
                  >
                    {dept === 'all' ? 'All Departments' : dept}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Faculty Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <p className="text-scholar-blue-700">
                Showing {filteredFaculty.length} faculty member{filteredFaculty.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFaculty.map((faculty) => (
                <Card key={faculty.id} className="glass-card hover-lift">
                  <CardHeader className="text-center">
                    <div className="w-24 h-24 bg-scholar-blue-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-scholar-blue-900">
                        {faculty.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-scholar-blue-900">{faculty.name}</h3>
                    <p className="text-scholar-blue-700">{faculty.title}</p>
                    <p className="text-sm text-scholar-blue-500">{faculty.institution}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {faculty.expertise.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-scholar-blue-900">{faculty.publications}</div>
                        <div className="text-scholar-blue-700">Publications</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-scholar-blue-900">{faculty.citations.toLocaleString()}</div>
                        <div className="text-scholar-blue-700">Citations</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-scholar-blue-700">
                        <MapPin className="h-3 w-3" />
                        {faculty.location}
                      </div>
                      <div className="flex items-center gap-2 text-scholar-blue-700">
                        <Mail className="h-3 w-3" />
                        {faculty.email}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link to={`/faculty/${faculty.id}`} className="flex-1">
                        <Button className="w-full scholar-gradient" size="sm">
                          View Profile
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
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

export default Faculty;
