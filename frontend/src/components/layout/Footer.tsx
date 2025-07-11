import { Brain, Mail, MapPin, Phone, Github, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  const footerLinks = {
    platform: [
      { name: 'Faculty Search', href: '/faculty' },
      { name: 'Publications', href: '/publications' },
      { name: 'Research Analytics', href: '/research' },
      { name: 'Collaboration Tools', href: '#' }
    ],
    resources: [
      { name: 'API Documentation', href: '#' },
      { name: 'Help Center', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Case Studies', href: '#' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' }
    ]
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: '#', label: 'GitHub' }
  ];

  return (
    <footer className="bg-scholar-900 text-scholar-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-scholar-100 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-scholar-900" />
              </div>
              <span className="text-xl font-bold">ScholarSphere</span>
            </div>
            <p className="text-scholar-300 mb-6 max-w-md">
              Connecting academic minds worldwide. Discover faculty, explore research, and foster meaningful collaborations across institutions.
            </p>
            
            {/* Newsletter Signup */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Stay Updated</h4>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-scholar-700 border-scholar-500 text-scholar-100 placeholder:text-scholar-300"
                />
                <Button className="bg-scholar-100 text-scholar-900 hover:bg-scholar-300">
                  Subscribe
                </Button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-scholar-300">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>contact@scholarsphere.edu</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>123 Academic Ave, Research City, RC 12345</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold mb-4 text-scholar-100">Platform</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-scholar-300 hover:text-scholar-100 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold mb-4 text-scholar-100">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-scholar-300 hover:text-scholar-100 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4 text-scholar-100">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-scholar-300 hover:text-scholar-100 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-scholar-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-scholar-300 mb-4 md:mb-0">
            © 2024 ScholarSphere. All rights reserved.
          </div>
          
          {/* Social Links */}
          <div className="flex space-x-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-scholar-300 hover:text-scholar-100 transition-colors duration-200"
                  aria-label={social.label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
