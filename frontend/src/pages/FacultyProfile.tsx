
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Mail, ExternalLink, FileText, Users, Award } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FacultyProfile = () => {
  const { id } = useParams();

  // Mock data - in a real app this would come from an API
  const faculty = {
    id: 1,
    name: "Dr. Sarah Chen",
    title: "Professor of Computer Science",
    department: "Computer Science",
    institution: "Stanford University",
    image: "/placeholder.svg",
    expertise: ["Machine Learning", "AI Ethics", "Neural Networks", "Deep Learning", "Computer Vision"],
    publications: 127,
    citations: 8420,
    hIndex: 45,
    email: "s.chen@stanford.edu",
    location: "Stanford, CA",
    bio: "Dr. Sarah Chen is a leading researcher in machine learning and artificial intelligence ethics. Her work focuses on developing fair and transparent AI systems with applications in healthcare, education, and social justice. She has published extensively in top-tier conferences and journals, and her research has been funded by NSF, NIH, and industry partners.",
    education: [
      { degree: "Ph.D. in Computer Science", institution: "MIT", year: "2015" },
      { degree: "M.S. in Computer Science", institution: "Stanford University", year: "2011" },
      { degree: "B.S. in Computer Science", institution: "UC Berkeley", year: "2009" }
    ],
    recentPublications: [
      {
        title: "Fairness-Aware Machine Learning: A Survey and New Perspectives",
        journal: "Nature Machine Intelligence",
        year: "2024",
        citations: 156
      },
      {
        title: "Ethical Considerations in Deep Learning for Healthcare",
        journal: "Journal of Medical AI",
        year: "2023",
        citations: 89
      },
      {
        title: "Transparency in Neural Network Decision Making",
        journal: "ICML 2023",
        year: "2023",
        citations: 67
      }
    ],
    collaborators: [
      { name: "Dr. Michael Rodriguez", institution: "MIT" },
      { name: "Dr. Emily Watson", institution: "Harvard University" },
      { name: "Dr. James Liu", institution: "Caltech" }
    ],
    awards: [
      "NSF CAREER Award (2020)",
      "Best Paper Award - ICML 2022",
      "Young Researcher Award - AI Ethics Society (2021)"
    ]
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-16">
        {/* Back Navigation */}
        <section className="py-4 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/faculty" className="flex items-center gap-2 text-scholar-blue-700 hover:text-scholar-blue-900">
              <ArrowLeft className="h-4 w-4" />
              Back to Faculty Directory
            </Link>
          </div>
        </section>

        {/* Profile Header */}
        <section className="py-12 bg-gradient-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-32 h-32 bg-scholar-blue-300 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-4xl font-bold text-scholar-blue-900">
                  {faculty.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold scholar-gradient-text mb-2">
                    {faculty.name}
                  </h1>
                  <p className="text-xl text-scholar-blue-700 mb-1">{faculty.title}</p>
                  <p className="text-lg text-scholar-blue-500">{faculty.institution}</p>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {faculty.expertise.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 text-sm">
                  <div className="flex items-center gap-2 text-scholar-blue-700">
                    <MapPin className="h-4 w-4" />
                    {faculty.location}
                  </div>
                  <div className="flex items-center gap-2 text-scholar-blue-700">
                    <Mail className="h-4 w-4" />
                    {faculty.email}
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button className="scholar-gradient">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Website
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-scholar-blue-900">{faculty.publications}</div>
                  <div className="text-sm text-scholar-blue-700">Publications</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-scholar-blue-900">{faculty.citations.toLocaleString()}</div>
                  <div className="text-sm text-scholar-blue-700">Citations</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-scholar-blue-900">{faculty.hIndex}</div>
                  <div className="text-sm text-scholar-blue-700">h-index</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Profile Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs defaultValue="about" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="publications">Publications</TabsTrigger>
                <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
                <TabsTrigger value="awards">Awards</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Biography
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-scholar-blue-700 leading-relaxed">{faculty.bio}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Education</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {faculty.education.map((edu, index) => (
                        <div key={index} className="border-l-2 border-scholar-blue-300 pl-4">
                          <h4 className="font-semibold text-scholar-blue-900">{edu.degree}</h4>
                          <p className="text-scholar-blue-700">{edu.institution}</p>
                          <p className="text-sm text-scholar-blue-500">{edu.year}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="publications" className="space-y-4">
                {faculty.recentPublications.map((pub, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-scholar-blue-900 mb-2">{pub.title}</h3>
                          <p className="text-scholar-blue-700 mb-1">{pub.journal}</p>
                          <p className="text-sm text-scholar-blue-500">{pub.year}</p>
                        </div>
                        <div className="text-center ml-4">
                          <div className="text-lg font-semibold text-scholar-blue-900">{pub.citations}</div>
                          <div className="text-xs text-scholar-blue-700">Citations</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="collaborators" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {faculty.collaborators.map((collab, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <h3 className="font-semibold text-scholar-blue-900">{collab.name}</h3>
                        <p className="text-scholar-blue-700">{collab.institution}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="awards" className="space-y-4">
                {faculty.awards.map((award, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-scholar-blue-700" />
                        <span className="font-semibold text-scholar-blue-900">{award}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default FacultyProfile;
