
import { ArrowRight, Search, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-light overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 scholar-gradient rounded-full opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 scholar-gradient rounded-full opacity-15 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-20 right-20 w-32 h-32 scholar-gradient rounded-full opacity-25 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold scholar-gradient-text mb-6">
            Discover Academic
            <br />
            <span className="inline-block animate-float" style={{ animationDelay: '1s' }}>Excellence</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-scholar-blue-700 mb-8 max-w-4xl mx-auto leading-relaxed">
            Connect with leading faculty, explore groundbreaking research, and foster meaningful 
            collaborations across institutions worldwide
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-scholar-blue-500" />
            <Input
              type="text"
              placeholder="Search faculty, publications, or research areas..."
              className="pl-12 pr-4 py-4 text-lg bg-white/90 backdrop-blur-sm border-scholar-blue-300 focus:border-scholar-blue-500 shadow-lg"
            />
            <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 scholar-gradient">
              Search
            </Button>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/faculty">
              <Button size="lg" className="scholar-gradient text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all hover-lift">
                Explore Faculty
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/publications">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 bg-white/90 backdrop-blur-sm border-scholar-blue-300 hover:bg-scholar-blue-50 shadow-lg">
                Browse Publications
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="glass-card rounded-2xl p-6 hover-lift">
              <div className="flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-scholar-blue-700" />
              </div>
              <div className="text-3xl font-bold scholar-gradient-text mb-2">10,000+</div>
              <div className="text-scholar-blue-700">Faculty Members</div>
            </div>
            
            <div className="glass-card rounded-2xl p-6 hover-lift" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-scholar-blue-700" />
              </div>
              <div className="text-3xl font-bold scholar-gradient-text mb-2">100,000+</div>
              <div className="text-scholar-blue-700">Publications</div>
            </div>
            
            <div className="glass-card rounded-2xl p-6 hover-lift" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-scholar-blue-700" />
              </div>
              <div className="text-3xl font-bold scholar-gradient-text mb-2">500+</div>
              <div className="text-scholar-blue-700">Institutions</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
