import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageCircle, X, Send, Bot, User, Users, Building, FileText, TrendingUp, BarChart3 } from 'lucide-react';
import { db } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  type?: 'publications' | 'text';
  publications?: any[];
  timestamp: Date;
}

interface ChatbotProps {
  className?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your ScholarSphere assistant. I can help you find information about faculty, institutions, publications, and research data.\n\n💡 Tip: Use "Show all faculty" to see every faculty member, or "Show me faculty members" to see the top 10.',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const addMessage = (text: string, sender: 'user' | 'bot') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const processUserQuery = async (query: string) => {
    setIsLoading(true);
    
    try {
      const lowerQuery = query.toLowerCase();
      
      // Check for "show all faculty" requests
      if (lowerQuery.includes('show all faculty') || lowerQuery.includes('all faculty') || lowerQuery.includes('every faculty')) {
        await handleShowAllFaculty();
      }
      // Check for faculty-related queries
      else if (lowerQuery.includes('faculty') || lowerQuery.includes('professor') || lowerQuery.includes('researcher') || lowerQuery.includes('teacher')) {
        await handleFacultyQuery(query);
      }
      // Check for institution-related queries
      else if (lowerQuery.includes('institution') || lowerQuery.includes('university') || lowerQuery.includes('college') || lowerQuery.includes('school')) {
        await handleInstitutionQuery(query);
      }
      // Check for publication-related queries
      else if (lowerQuery.includes('publication') || lowerQuery.includes('paper') || lowerQuery.includes('research paper') || lowerQuery.includes('article')) {
        await handlePublicationQuery(query);
      }
      // Check for research-related queries
      else if (lowerQuery.includes('research') || lowerQuery.includes('trend') || lowerQuery.includes('analytics') || lowerQuery.includes('study')) {
        await handleResearchQuery(query);
      }
      // Check for general statistics
      else if (lowerQuery.includes('statistics') || lowerQuery.includes('stats') || lowerQuery.includes('total') || lowerQuery.includes('count') || lowerQuery.includes('how many')) {
        await handleStatisticsQuery();
      }
      // Check for specific faculty search
      else if (lowerQuery.includes('find') || lowerQuery.includes('search') || lowerQuery.includes('who')) {
        await handleSearchQuery(query);
      }
      else {
        addMessage(
          "I can help you with information about:\n" +
          "• Faculty members and their research\n" +
          "• Institutions and their faculty count\n" +
          "• Publications and research papers\n" +
          "• Research trends and analytics\n" +
          "• General statistics\n\n" +
          "Please ask me about any of these topics!",
          'bot'
        );
      }
    } catch (error) {
      console.error('Error processing query:', error);
      addMessage('Sorry, I encountered an error while processing your request. Please try again.', 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacultyQuery = async (query: string) => {
    try {
      const { data: faculty, error } = await db.faculty.getAll();

      if (error) throw error;

      if (faculty && faculty.length > 0) {
        // Show first 10 faculty members with option to see more
        const displayFaculty = faculty.slice(0, 10);
        const facultyInfo = displayFaculty.map(f => 
          `• ${f.name} (${f.department || 'N/A'}) - ${f.institution || 'N/A'}\n  Citations: ${f.citations || 0}, H-index: ${f.h_index || 0}`
        ).join('\n\n');

        let message = `Here are the top faculty members by citations:\n\n${facultyInfo}`;
        
        if (faculty.length > 10) {
          message += `\n\n... and ${faculty.length - 10} more faculty members.\nTotal faculty: ${faculty.length}`;
        } else {
          message += `\n\nTotal faculty: ${faculty.length}`;
        }

        addMessage(message, 'bot');
      } else {
        addMessage('No faculty members found in the database.', 'bot');
      }
    } catch (error) {
      addMessage('Sorry, I couldn\'t fetch faculty information at the moment.', 'bot');
    }
  };

  const handleInstitutionQuery = async (query: string) => {
    try {
      const { data: faculty, error } = await db.faculty.getAll();

      if (error) throw error;

      if (faculty && faculty.length > 0) {
        const institutionStats: { [key: string]: { count: number; departments: Set<string> } } = {};
        
        faculty.forEach(f => {
          const institution = f.institution;
          if (institution) {
            if (!institutionStats[institution]) {
              institutionStats[institution] = { count: 0, departments: new Set() };
            }
            institutionStats[institution].count++;
            if (f.department) {
              institutionStats[institution].departments.add(f.department);
            }
          }
        });

        const institutionInfo = Object.entries(institutionStats)
          .sort(([,a], [,b]) => b.count - a.count)
          .slice(0, 5)
          .map(([institution, stats]) => 
            `• ${institution}\n  Faculty: ${stats.count}, Departments: ${stats.departments.size}`
          )
          .join('\n\n');

        addMessage(
          `Here are the top institutions by faculty count:\n\n${institutionInfo}\n\nTotal institutions: ${Object.keys(institutionStats).length}`,
          'bot'
        );
      } else {
        addMessage('No institution data found in the database.', 'bot');
      }
    } catch (error) {
      addMessage('Sorry, I couldn\'t fetch institution information at the moment.', 'bot');
    }
  };

  const handlePublicationQuery = async (query: string) => {
    try {
      const { data: publications, error } = await db.faculty.getPublications(query);

      if (error) throw error;

      if (publications && publications.length > 0) {
        const publicationInfo = publications.map(p => 
          `• ${p.title}\n  Citations: ${p.citation_count || 0}\n  Venue: ${p.venue || 'N/A'}\n  Year: ${p.year || 'N/A'}`
        ).join('\n\n');

        addMessage(
          `Here are the publications for ${query}:\n\n${publicationInfo}\n\nTotal publications: ${publications.length}`,
          'bot'
        );
      } else {
        addMessage('No publications found for the given faculty.', 'bot');
      }
    } catch (error) {
      addMessage('Sorry, I couldn\'t fetch publication information at the moment.', 'bot');
    }
  };

  const handleResearchQuery = async (query: string) => {
    try {
      const { data: trends, error } = await db.researchTrends.getAll();

      if (error) throw error;

      if (trends && trends.length > 0) {
        const topTrends = trends
          .sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0))
          .slice(0, 5);

        const trendInfo = topTrends.map(t => 
          `• ${t.topic}\n  Category: ${t.category}\n  Growth Rate: ${t.growth_rate}%\n  Publications: ${t.publication_count}`
        ).join('\n\n');

        addMessage(
          `Here are the top 5 research trends:\n\n${trendInfo}`,
          'bot'
        );
      } else {
        addMessage('No research trends found in the database.', 'bot');
      }
    } catch (error) {
      addMessage('Sorry, I couldn\'t fetch research trends at the moment.', 'bot');
    }
  };

  const handleSearchQuery = async (query: string) => {
    try {
      const { data: faculty, error } = await db.faculty.search(query);

      if (error) throw error;

      if (faculty && faculty.length > 0) {
        const facultyInfo = faculty.slice(0, 5).map(f => 
          `• ${f.name}\n  Department: ${f.department || 'N/A'}\n  Institution: ${f.institution || 'N/A'}\n  Citations: ${f.citations || 0}`
        ).join('\n\n');

        let message = `Here are the most relevant faculty members:\n\n${facultyInfo}`;
        
        if (faculty.length > 5) {
          message += `\n\n... and ${faculty.length - 5} more results.`;
        }

        addMessage(message, 'bot');
      } else {
        addMessage('No faculty members found matching your search.', 'bot');
      }
    } catch (error) {
      addMessage('Sorry, I couldn\'t perform the search at the moment.', 'bot');
    }
  };

  const handleStatisticsQuery = async () => {
    try {
      const [facultyData, publicationsData, trendsData] = await Promise.all([
        db.faculty.getAll(),
        db.publications.getAll(),
        db.researchTrends.getAll()
      ]);

      const stats = {
        faculty: facultyData.data?.length || 0,
        publications: publicationsData.data?.length || 0,
        trends: trendsData.data?.length || 0,
        institutions: new Set(facultyData.data?.map(f => f.institution).filter(Boolean)).size,
        departments: new Set(facultyData.data?.map(f => f.department).filter(Boolean)).size
      };

      addMessage(
        `Here are the current statistics:\n\n` +
        `• Total Faculty Members: ${stats.faculty}\n` +
        `• Total Publications: ${stats.publications}\n` +
        `• Active Research Trends: ${stats.trends}\n` +
        `• Institutions: ${stats.institutions}\n` +
        `• Departments: ${stats.departments}`,
        'bot'
      );
    } catch (error) {
      addMessage('Sorry, I couldn\'t fetch the statistics at the moment.', 'bot');
    }
  };

  const handleShowAllFaculty = async () => {
    try {
      const { data: faculty, error } = await db.faculty.getAll();

      if (error) throw error;

      if (faculty && faculty.length > 0) {
        const facultyInfo = faculty.map(f => 
          `• ${f.name} (${f.department || 'N/A'}) - ${f.institution || 'N/A'}`
        ).join('\n');

        addMessage(
          `Here are all faculty members (${faculty.length}):\n\n${facultyInfo}`,
          'bot'
        );
      } else {
        addMessage('No faculty members found in the database.', 'bot');
      }
    } catch (error) {
      addMessage('Sorry, I couldn\'t fetch the faculty list at the moment.', 'bot');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    addMessage(inputValue, 'user');
    processUserQuery(inputValue);
    setInputValue('');
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Chat Toggle Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className="h-12 w-12 rounded-full bg-gradient-scholar text-white shadow-lg hover:opacity-90 transition-opacity"
            >
              {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isOpen ? 'Close chat' : 'Open chat'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Chat Window */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-96 shadow-xl bg-white">
          <CardHeader className="bg-gradient-scholar text-white rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5" />
              ScholarSphere Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 bg-white">
            {/* Messages */}
            <ScrollArea className="h-[400px] p-4 bg-white">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 mb-4 ${
                    message.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user'
                        ? 'bg-gradient-scholar text-white'
                        : 'bg-gradient-light text-scholar-900'
                    }`}
                  >
                    {message.sender === 'user' ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Bot className="h-5 w-5" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-3 max-w-[80%] ${
                      message.sender === 'user'
                        ? 'bg-gradient-scholar text-white shadow-md'
                        : 'bg-gradient-light text-scholar-900 shadow-md'
                    }`}
                  >
                    <p className={`whitespace-pre-wrap leading-relaxed ${
                      message.sender === 'user'
                        ? 'font-medium'
                        : 'font-medium'
                    }`}>
                      {message.type === 'publications' && message.publications ? (
                        <div className="space-y-2">
                          <p className="font-medium">{message.text}</p>
                          {message.publications.map((pub: any, index: number) => (
                            <div key={index} className="border-t border-gray-200 pt-2 mt-2 first:border-t-0 first:pt-0 first:mt-0">
                              <p className="font-medium">{pub.title}</p>
                              <p className="text-sm text-gray-600">Year: {pub.year}</p>
                              {pub.citation_count && (
                                <p className="text-sm text-gray-600">Citations: {pub.citation_count}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        message.text.split('\n').map((line, i) => {
                          if (line.startsWith('•')) {
                            return (
                              <span key={i} className="block mb-2">
                                <span className="text-scholar-900 font-bold">{line.substring(0, 2)}</span>
                                <span className={message.sender === 'user' ? 'text-white' : 'text-scholar-700'}>{line.substring(2)}</span>
                              </span>
                            );
                          }
                          if (line.trim().startsWith('Citations:') || line.trim().startsWith('H-index:') || 
                              line.trim().startsWith('Department:') || line.trim().startsWith('Institution:') ||
                              line.trim().startsWith('Growth Rate:') || line.trim().startsWith('Publications:')) {
                            return (
                              <span key={i} className="block ml-4 text-sm opacity-90">
                                <span className={message.sender === 'user' ? 'text-white/80 font-semibold' : 'text-scholar-700 font-semibold'}>
                                  {line.split(':')[0]}:
                                </span>
                                <span className={message.sender === 'user' ? 'text-white' : 'text-scholar-900'}>
                                  {line.split(':')[1]}
                                </span>
                              </span>
                            );
                          }
                          return (
                            <span key={i} className={`block mb-1 ${
                              line.trim() === '' ? 'mb-3' : ''
                            }`}>
                              {line}
                            </span>
                          );
                        })
                      )}
                    </p>
                    <span className="block mt-1 text-xs opacity-60 text-right">
                      {new Intl.DateTimeFormat('en-US', {
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                      }).format(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 font-medium placeholder:text-scholar-300"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-gradient-scholar text-white hover:opacity-90 transition-opacity font-medium"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Chatbot; 