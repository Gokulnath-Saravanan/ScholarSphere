
import { Brain, Search, Users, TrendingUp, Shield, Zap } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Search,
      title: "Advanced Search",
      description: "AI-powered search across faculty profiles, publications, and research domains with intelligent filtering and recommendations."
    },
    {
      icon: Brain,
      title: "Smart Matching",
      description: "Machine learning algorithms identify potential collaborators based on research interests, publication history, and expertise overlap."
    },
    {
      icon: Users,
      title: "Collaboration Network",
      description: "Visualize research networks and discover collaboration opportunities through interactive network graphs and analytics."
    },
    {
      icon: TrendingUp,
      title: "Research Analytics",
      description: "Comprehensive analytics on publication trends, citation metrics, and research impact across institutions and domains."
    },
    {
      icon: Shield,
      title: "Verified Profiles",
      description: "Authenticated faculty profiles with verified institutional affiliations and automatically updated publication records."
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Automatic synchronization with academic databases and real-time notifications for new publications and collaboration opportunities."
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold scholar-gradient-text mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-scholar-blue-700 max-w-2xl mx-auto">
            Discover the advanced capabilities that make ScholarSphere the ultimate platform for academic discovery and collaboration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="glass-card rounded-2xl p-6 hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-center w-12 h-12 scholar-gradient rounded-xl mb-4">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-scholar-blue-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-scholar-blue-700 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
