
import { ArrowRight, Search, Users, BookOpen, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Hero = () => {
  const stats = [
    { label: 'Faculty Members', value: '10,000+', icon: Users },
    { label: 'Publications', value: '50,000+', icon: BookOpen },
    { label: 'Collaborations', value: '2,500+', icon: TrendingUp }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 scholar-gradient opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-scholar-blue-100/50 to-transparent"></div>
      
      {/* Floating shapes */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-scholar-blue-300/20 rounded-full animate-float"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-scholar-blue-500/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-40 left-20 w-12 h-12 bg-scholar-blue-700/20 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="scholar-gradient-text">Discover</span>
            <br />
            <span className="text-scholar-blue-900">Academic Excellence</span>
          </h1>
          
          <p className="text-lg md:text-xl text-scholar-blue-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect with leading faculty members, explore groundbreaking research, and foster meaningful academic collaborations across institutions worldwide.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative glass-card p-2 rounded-full">
              <div className="flex items-center">
                <Search className="h-5 w-5 text-scholar-blue-500 ml-4" />
                <Input
                  type="text"
                  placeholder="Search by faculty name, research area, or publication..."
                  className="flex-1 border-0 bg-transparent text-scholar-blue-900 placeholder:text-scholar-blue-500 focus-visible:ring-0"
                />
                <Button className="scholar-gradient rounded-full px-8">
                  Search
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="scholar-gradient hover:opacity-90 transition-opacity">
              Explore Faculty
              <Users className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-scholar-blue-500 text-scholar-blue-700 hover:bg-scholar-blue-100">
              Browse Publications
              <BookOpen className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="glass-card p-6 rounded-2xl hover-lift"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <Icon className="h-8 w-8 text-scholar-blue-700 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-scholar-blue-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-scholar-blue-700">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
