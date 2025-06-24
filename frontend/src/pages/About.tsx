import { Users, Target, Lightbulb, Award, Globe, BookOpen } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const About = () => {
  const stats = [
    { label: "Universities", value: "500+", icon: Globe },
    { label: "Faculty Members", value: "10,000+", icon: Users },
    { label: "Publications", value: "100,000+", icon: BookOpen },
    { label: "Citations", value: "2M+", icon: Award }
  ];

  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To democratize access to academic knowledge and foster meaningful collaborations between researchers worldwide."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We leverage cutting-edge AI technology to connect researchers and accelerate scientific discovery."
    },
    {
      icon: Users,
      title: "Community",
      description: "Building a global network of scholars dedicated to advancing human knowledge and understanding."
    }
  ];

  const team = [
    {
      name: "Darshan N",
      role: "Data Analyst",
      bio: "MSRIT",
      image: "/placeholder.svg"
    },
    {
      name: "Gokulnath S",
      role: "Developer",
      bio: "MSRIT",
      image: "/placeholder.svg"
    },
    {
      name: "G Varun Teja Reddy",
      role: "Lead",
      bio: "MSRIT",
      image: "/placeholder.svg"
    },
    {
      name: "Gurunath Deshpande",
      role: "Testing",
      bio: "MSRIT",
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-[#EDE8F5]">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#ADBBDA] to-[#EDE8F5] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-[#3D52A0] mb-6">
                About ScholarSphere
              </h1>
              <p className="text-xl text-[#3D52A0] max-w-4xl mx-auto leading-relaxed">
                Connecting the world's brightest minds through advanced technology and shared passion for discovery. 
                We're building the future of academic collaboration and knowledge sharing.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#3D52A0] to-[#7091E6] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-[#3D52A0] mb-2">{stat.value}</div>
                    <div className="text-[#8697C4]">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-20 bg-[#EDE8F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#3D52A0] mb-6">
                Our Vision & Values
              </h2>
              <p className="text-lg text-[#3D52A0] max-w-3xl mx-auto">
                We believe in the power of collaboration to solve humanity's greatest challenges
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className="bg-white/80 backdrop-blur-sm text-center transform transition-transform hover:scale-105">
                    <CardHeader>
                      <div className="w-16 h-16 bg-gradient-to-br from-[#3D52A0] to-[#7091E6] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl text-[#3D52A0]">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[#8697C4] leading-relaxed">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#3D52A0] mb-6">
                  Our Story
                </h2>
                <div className="space-y-6 text-[#8697C4] leading-relaxed">
                  <p>
                    ScholarSphere was born from the frustration of academic researchers struggling to find 
                    collaborators and stay current with rapidly evolving fields. Our founders, having experienced 
                    these challenges firsthand in their academic careers, envisioned a platform that could break 
                    down silos and accelerate scientific discovery.
                  </p>
                  <p>
                    Founded in 2021, we started with a simple idea: what if we could use AI to intelligently 
                    connect researchers based on their work, interests, and complementary expertise? Today, 
                    ScholarSphere serves thousands of researchers across hundreds of institutions worldwide.
                  </p>
                  <p>
                    Our platform has facilitated groundbreaking collaborations, from interdisciplinary cancer 
                    research to climate science initiatives, proving that when brilliant minds connect, 
                    extraordinary things happen.
                  </p>
                </div>
              </div>
              <div className="lg:pl-12">
                <div className="bg-[#EDE8F5] rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-[#3D52A0] mb-4">Impact Highlights</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#7091E6] rounded-full"></div>
                      <span className="text-[#8697C4]">500+ cross-institutional collaborations formed</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#7091E6] rounded-full"></div>
                      <span className="text-[#8697C4]">1,200+ joint research publications</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#7091E6] rounded-full"></div>
                      <span className="text-[#8697C4]">$50M+ in collaborative research funding</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#7091E6] rounded-full"></div>
                      <span className="text-[#8697C4]">150+ countries represented</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-[#EDE8F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#3D52A0] mb-6">
                Meet Our Team
              </h2>
              <p className="text-lg text-[#3D52A0] max-w-3xl mx-auto">
                A diverse group of academics, technologists, and visionaries united by our mission
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm text-center transform transition-transform hover:scale-105">
                  <CardHeader>
                    <div className="w-24 h-24 mx-auto mb-4">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-full h-full object-cover rounded-full border-2 border-[#7091E6]"
                      />
                    </div>
                    <CardTitle className="text-xl text-[#3D52A0]">{member.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#7091E6] font-medium mb-2">{member.role}</p>
                    <p className="text-[#8697C4]">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold scholar-gradient-text mb-6">
              Join Our Mission
            </h2>
            <p className="text-lg text-scholar-blue-700 mb-8 leading-relaxed">
              Whether you're a researcher, institution, or technology partner, we'd love to hear from you. 
              Together, we can accelerate the pace of scientific discovery and create a more connected academic world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 scholar-gradient text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
                Get in Touch
              </button>
              <button className="px-8 py-3 border-2 border-scholar-blue-500 text-scholar-blue-700 rounded-lg font-semibold hover:bg-scholar-blue-50 transition-colors">
                Partner with Us
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
