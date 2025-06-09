
import Header from '@/components/layout/Header';
import Hero from '@/components/sections/Hero';
import FacultyShowcase from '@/components/sections/FacultyShowcase';
import PublicationsSection from '@/components/sections/PublicationsSection';
import Features from '@/components/sections/Features';
import Footer from '@/components/layout/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <FacultyShowcase />
        <PublicationsSection />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
