import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

interface DbPublication {
  id: string;
  title: string;
  year: number;
  citation_count: number;
  venue: string;
  publication_type: string;
}

interface DbFacultyPublication {
  id: string;
  publication: DbPublication;
}

interface DbFaculty {
  id: string;
  name: string;
  department: string | null;
  institution: string | null;
  citations: number | null;
  h_index: number | null;
  i10_index: number | null;
  expertise: string[] | null;
  faculty_publications: DbFacultyPublication[];
}

interface DbResearchTrend {
  id: string;
  topic: string;
  category: string | null;
  year: number;
  quarter: number;
  publication_count: number;
  citation_count: number;
  faculty_count: number;
  growth_rate: number | null;
  trending_score: number | null;
}

interface ResearchAnalysis {
  publicationTrends: Array<{
    year: number;
    quarter: number;
    publications: number;
    citations: number;
    domains: { [key: string]: number };
  }>;
  topResearchAreas: Array<{
    topic: string;
    category: string;
    score: number;
    growth_rate: number;
    publications: number;
    citations: number;
  }>;
  metrics: {
    totalCitations: number;
    averageHIndex: number;
    totalPublications: number;
    totalFaculty: number;
    domainDistribution: Array<{
      name: string;
      value: number;
      citations: number;
    }>;
  };
}

interface FilterState {
  institution: string | null;
  department: string | null;
}

interface RawSupabaseFacultyResponse {
  id: string;
  name: string;
  department: string | null;
  institution: string | null;
  citations: number | null;
  h_index: number | null;
  i10_index: number | null;
  expertise: string[] | null;
  faculty_publications: Array<{
    id: string;
    publication: {
      id: string;
      title: string;
      year: number;
      citation_count: number;
      venue: string;
      publication_type: string;
    };
  }> | null;
}

const COLORS = ['#124E66', '#2E3944', '#748D92', '#D3D9D4', '#212A31'];

// Function to normalize institution names
const normalizeInstitutionName = (name: string): string => {
  if (!name) return '';
  
  // Convert to lowercase and remove extra spaces
  let normalized = name.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // Remove common variations and standardize
  normalized = normalized
    .replace(/,\s*[a-z]+$/i, '') // Remove city/location after comma
    .replace(/^(m\.?\s*s\.?\s*)?ramaiah\s+(institute\s+of\s+technology|university)/i, 'ramaiah institute of technology')
    .replace(/^\s*m\.?s\.?\s+/i, 'ms ') // Standardize M.S. or MS prefix
    .replace(/\s+university\s*/i, ' university')
    .replace(/\s+institute\s+of\s+technology\s*/i, ' institute of technology');
    
  return normalized;
};

// Calculate research momentum score instead of simple growth rate
const calculateResearchMomentum = (publications: { year: number; count: number; citations?: number }[]): number => {
  if (publications.length < 2) return 0;
  
  // Sort by year
  const sortedPubs = publications.sort((a, b) => a.year - b.year);
  
  // Get the last 3 years of data
  const recentPubs = sortedPubs.slice(-3);
  const currentYear = recentPubs[recentPubs.length - 1];
  const previousYears = recentPubs.slice(0, -1);
  
  // Calculate weighted scores for different factors
  const calculateWeightedScore = () => {
    // 1. Publication Trend
    const currentCount = currentYear.count;
    const avgPreviousCount = previousYears.reduce((sum, year) => sum + year.count, 0) / previousYears.length;
    const pubTrendScore = avgPreviousCount === 0 ? 
      (currentCount > 0 ? 100 : 0) : 
      ((currentCount - avgPreviousCount) / avgPreviousCount) * 100;

    // 2. Consistency Score (reward steady or increasing publication counts)
    const isConsistent = previousYears.every((year, i, arr) => {
      if (i === 0) return true;
      return year.count >= arr[i - 1].count * 0.8; // Allow for small variations
    });
    const consistencyScore = isConsistent ? 20 : 0;

    // 3. Recent Activity Bonus
    const hasRecentActivity = currentCount > 0;
    const recentActivityScore = hasRecentActivity ? 30 : 0;

    // 4. Growth Acceleration (is the growth rate increasing?)
    const acceleration = previousYears.length > 1 ? 
      (currentCount - previousYears[1].count) - (previousYears[1].count - previousYears[0].count) : 
      0;
    const accelerationScore = acceleration > 0 ? 25 : (acceleration === 0 ? 10 : 0);

    // Combine scores with weights
    const totalScore = (
      (pubTrendScore * 0.4) +      // 40% weight on publication trend
      consistencyScore +           // 20% weight on consistency
      recentActivityScore +        // 30% weight on recent activity
      accelerationScore           // Up to 25% bonus for acceleration
    );

    // Normalize to a reasonable range and round to nearest 5
    return Math.min(100, Math.max(0, Math.round(totalScore / 5) * 5));
  };

  return calculateWeightedScore();
};

const Analytics = () => {
  const [data, setData] = useState<ResearchAnalysis>({
    publicationTrends: [],
    topResearchAreas: [],
    metrics: {
      totalCitations: 0,
      averageHIndex: 0,
      totalPublications: 0,
      totalFaculty: 0,
      domainDistribution: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    institution: null,
    department: null
  });
  const [organizations, setOrganizations] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  // Fetch list of organizations and departments
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const { data: facultyData, error } = await supabase
          .from('faculty')
          .select('institution, department')
          .not('institution', 'is', null);

        if (error) throw error;

        // Normalize and deduplicate institution names
        const normalizedInstitutions = new Map<string, string>();
        facultyData.forEach(f => {
          if (f.institution) {
            const normalized = normalizeInstitutionName(f.institution);
            normalizedInstitutions.set(normalized, f.institution);
          }
        });

        const uniqueOrganizations = Array.from(normalizedInstitutions.values()).sort();
        const uniqueDepartments = [...new Set(facultyData.map(f => f.department).filter(Boolean))].sort();
        
        setOrganizations(uniqueOrganizations);
        setDepartments(uniqueDepartments);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch research analysis data
  useEffect(() => {
    const fetchResearchAnalysis = async () => {
      try {
        setLoading(true);

        // Build the base query for faculty
        let facultyQuery = supabase
          .from('faculty')
          .select(`
            id,
            name,
            department,
            institution,
            citations,
            h_index,
            i10_index,
            expertise,
            faculty_publications (
              id,
              publication:publications (
                id,
                title,
                year,
                citation_count,
                venue,
                publication_type
              )
            )
          `);

        // Apply filters
        if (filters.institution) {
          const normalizedInstitution = normalizeInstitutionName(filters.institution);
          facultyQuery = facultyQuery.or(`institution.ilike.%${normalizedInstitution}%,institution.ilike.%ramaiah%`);
        }
        if (filters.department) {
          facultyQuery = facultyQuery.eq('department', filters.department);
        }

        const { data: facultyData, error: facultyError } = await facultyQuery;
        if (facultyError) throw facultyError;

        if (!facultyData || facultyData.length === 0) {
          setData({
            publicationTrends: [],
            topResearchAreas: [],
            metrics: {
              totalCitations: 0,
              averageHIndex: 0,
              totalPublications: 0,
              totalFaculty: 0,
              domainDistribution: []
            }
          });
          setLoading(false);
          return;
        }

        // Process the data with proper typing
        const processedFacultyData: DbFaculty[] = ((facultyData as any[]).map(faculty => ({
          id: faculty.id as string,
          name: faculty.name as string,
          department: faculty.department as string | null,
          institution: faculty.institution as string | null,
          citations: faculty.citations as number | null,
          h_index: faculty.h_index as number | null,
          i10_index: faculty.i10_index as number | null,
          expertise: faculty.expertise as string[] | null,
          faculty_publications: (faculty.faculty_publications || []).map((fp: any) => ({
            id: fp.id as string,
            publication: {
              id: fp.publication.id as string,
              title: fp.publication.title as string,
              year: fp.publication.year as number,
              citation_count: fp.publication.citation_count as number,
              venue: fp.publication.venue as string,
              publication_type: fp.publication.publication_type as string
            }
          }))
        }))) as DbFaculty[];

        // Calculate faculty metrics first
        const totalCitations = processedFacultyData.reduce((sum, faculty) => sum + (faculty.citations || 0), 0);
        const totalHIndex = processedFacultyData.reduce((sum, faculty) => sum + (faculty.h_index || 0), 0);
        const averageHIndex = Math.round((totalHIndex / processedFacultyData.length) * 10) / 10;
        const totalFaculty = processedFacultyData.length;
        const totalPublications = processedFacultyData.reduce((sum, faculty) => 
          sum + (faculty.faculty_publications?.length || 0), 0);

        // Process research areas and publications
        const researchAreaStats = new Map<string, {
          publications: number;
          citations: number;
          score: number;
          years: Set<number>;
          recentPublications: number;
          facultyCount: number;
          venues: Set<string>;
          publicationsByYear: Map<number, { count: number; citations: number }>;
        }>();

        // Track overall publications by year
        const overallPublicationsByYear = new Map<number, {
          publications: number;
          citations: number;
          domains: { [key: string]: number };
        }>();

        // First pass: Process all publications to get year data
        processedFacultyData.forEach(faculty => {
          faculty.faculty_publications?.forEach(fp => {
            const pub = fp.publication;
            if (!pub?.year) return;

            if (!overallPublicationsByYear.has(pub.year)) {
              overallPublicationsByYear.set(pub.year, {
                publications: 0,
                citations: 0,
                domains: {}
              });
            }
            const yearData = overallPublicationsByYear.get(pub.year)!;
            yearData.publications++;
            yearData.citations += pub.citation_count || 0;
          });
        });

        // Get the most recent year
        const years = Array.from(overallPublicationsByYear.keys()).sort((a, b) => b - a);
        const mostRecentYear = years[0] || new Date().getFullYear();

        // Second pass: Process research areas with more context
        processedFacultyData.forEach(faculty => {
          const processedAreas = new Set<string>(); // Track processed areas for this faculty

          // Process expertise
          faculty.expertise?.forEach(area => {
            // Split by multiple delimiters and process each part
            const areas = area.split(/[\/,;&]/)
              .map(a => a.trim())
              .filter(Boolean)
              .map(a => a.replace(/^[0-9.]+\s*/, '')); // Remove leading numbers/dots
            
            areas.forEach(mainArea => {
              // Skip if empty or too short
              if (!mainArea || mainArea.length < 3) return;
              
              // Initialize stats if needed
              if (!researchAreaStats.has(mainArea)) {
                researchAreaStats.set(mainArea, {
                  publications: 0,
                  citations: 0,
                  score: 0,
                  years: new Set(),
                  recentPublications: 0,
                  facultyCount: 0,
                  venues: new Set(),
                  publicationsByYear: new Map()
                });
              }

              const stats = researchAreaStats.get(mainArea)!;
              
              // Count faculty only once per area
              if (!processedAreas.has(mainArea)) {
                stats.facultyCount++;
                processedAreas.add(mainArea);
                stats.score += 2; // Base score for having expertise
              }
            });
          });

          // Process publications for each area
          faculty.faculty_publications?.forEach(fp => {
            const pub = fp.publication;
            if (!pub?.year) return;

            // Update stats for all faculty's research areas
            processedAreas.forEach(area => {
              const stats = researchAreaStats.get(area)!;
              stats.publications++;
              stats.citations += pub.citation_count || 0;
              stats.years.add(pub.year);
              if (pub.venue) stats.venues.add(pub.venue);
              
              // Update publications by year
              if (!stats.publicationsByYear.has(pub.year)) {
                stats.publicationsByYear.set(pub.year, { count: 0, citations: 0 });
              }
              const yearStats = stats.publicationsByYear.get(pub.year)!;
              yearStats.count++;
              yearStats.citations += pub.citation_count || 0;
              
              // Count recent publications (last 2 years)
              if (pub.year >= mostRecentYear - 1) {
                stats.recentPublications++;
                stats.score += 3; // Bonus for recent publications
              }
              
              // Additional score for citations
              stats.score += Math.log(pub.citation_count + 1);
            });
          });
        });

        // Calculate final scores and sort research areas
        const topResearchAreas = Array.from(researchAreaStats.entries())
          .map(([topic, stats]) => {
            // Calculate a weighted score based on multiple factors
            const activityScore = stats.score;
            const diversityScore = stats.venues.size * 2;
            const impactScore = Math.log(stats.citations + 1) * 3;
            const facultyScore = stats.facultyCount * 4;
            const sustainabilityScore = stats.years.size * 2;
            
            const totalScore = activityScore + diversityScore + impactScore + facultyScore + sustainabilityScore;
            
            // Calculate research momentum using publication trends
            const pubTrends = Array.from(stats.publicationsByYear.entries())
              .map(([year, data]) => ({
                year,
                count: data.count,
                citations: data.citations
              }));
            
            const momentum = calculateResearchMomentum(pubTrends);
            
            return {
              topic,
              category: topic,
              score: totalScore,
              growth_rate: momentum,
              publications: stats.publications,
              citations: stats.citations
            };
          })
          .filter(area => area.publications > 0) // Only include areas with publications
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);

        // Process domain distribution for pie chart
        const domainDistribution = Array.from(researchAreaStats.entries())
          .filter(([_, stats]) => stats.publications > 0 || stats.citations > 0) // Only include active areas
          .map(([name, stats]) => ({
            name,
            value: stats.publications,
            citations: stats.citations
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10); // Only take top 10 for pie chart

        setData({
          publicationTrends: Array.from(overallPublicationsByYear.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([year, value]) => ({
              year,
              quarter: 1,
              publications: value.publications,
              citations: value.citations,
              domains: value.domains
            })),
          topResearchAreas,
          metrics: {
            totalCitations,
            averageHIndex,
            totalPublications,
            totalFaculty,
            domainDistribution
          }
        });
      } catch (error) {
        console.error('Error fetching research analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResearchAnalysis();
  }, [filters]);

  const handleFilterChange = (type: keyof FilterState, value: string | null) => {
    setFilters(prev => ({
      ...prev,
      [type]: value === 'all' ? null : value
    }));
  };

  const clearFilters = () => {
    setFilters({
      institution: null,
      department: null
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-28" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[400px]" />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-scholar-900">Research Analytics</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Select
                  value={filters.institution || undefined}
                  onValueChange={(value) => handleFilterChange('institution', value)}
                >
                  <SelectTrigger className="w-64 bg-scholar-100/30 hover:bg-scholar-100/50 transition-colors border-scholar-300 text-scholar-900">
                    <SelectValue placeholder="Select Institution" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-scholar-300">
                    <SelectItem value="all" className="text-scholar-900 hover:bg-scholar-100/50 focus:bg-scholar-100/50">
                      All Institutions
                    </SelectItem>
                    {organizations.map((org) => (
                      <SelectItem 
                        key={org} 
                        value={org}
                        className="text-scholar-900 hover:bg-scholar-100/50 focus:bg-scholar-100/50"
                      >
                        {org}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.department || undefined}
                  onValueChange={(value) => handleFilterChange('department', value)}
                >
                  <SelectTrigger className="w-64 bg-scholar-100/30 hover:bg-scholar-100/50 transition-colors border-scholar-300 text-scholar-900">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-scholar-300">
                    <SelectItem value="all" className="text-scholar-900 hover:bg-scholar-100/50 focus:bg-scholar-100/50">
                      All Departments
                    </SelectItem>
                    {departments.map((dept) => (
                      <SelectItem 
                        key={dept} 
                        value={dept}
                        className="text-scholar-900 hover:bg-scholar-100/50 focus:bg-scholar-100/50"
                      >
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(filters.institution || filters.department) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearFilters}
                    className="h-10 w-10 text-scholar-700 hover:text-scholar-900 hover:bg-scholar-100/50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-scholar-100/30 hover:bg-scholar-100/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-scholar-700">Total Citations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-scholar-900">
                  {data.metrics.totalCitations.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-scholar-100/30 hover:bg-scholar-100/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-scholar-700">Publications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-scholar-900">
                  {data.metrics.totalPublications.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-scholar-100/30 hover:bg-scholar-100/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-scholar-700">Faculty Members</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-scholar-900">
                  {data.metrics.totalFaculty.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-scholar-100/30 hover:bg-scholar-100/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-scholar-700">Avg. h-index</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-scholar-900">
                  {data.metrics.averageHIndex}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Research Analysis */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card className="h-full bg-scholar-100/30">
              <CardHeader>
                <CardTitle className="text-scholar-700">Publication Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[4/3]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.publicationTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D3D9D4" />
                      <XAxis dataKey="year" stroke="#2E3944" />
                      <YAxis stroke="#2E3944" />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#D3D9D4' }} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="publications" 
                        name="Publications"
                        stroke="#124E66" 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="citations" 
                        name="Citations"
                        stroke="#748D92"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full bg-scholar-100/30">
              <CardHeader>
                <CardTitle className="text-scholar-700">Top Research Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topResearchAreas.map((area, i) => (
                    <div key={area.topic} className="flex items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-medium text-scholar-900 break-words leading-snug">{area.topic}</p>
                        <div className="w-full bg-scholar-100 rounded-full h-2">
                          <div
                            className="bg-scholar-500 h-2 rounded-full"
                            style={{
                              width: `${(area.score / data.topResearchAreas[0].score) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                      <span className={cn(
                        "text-sm font-medium shrink-0 px-2 py-1 rounded",
                        area.growth_rate >= 70 ? "bg-scholar-100/50 text-scholar-700" : 
                        area.growth_rate >= 40 ? "bg-scholar-100/30 text-scholar-500" :
                        "bg-scholar-100/20 text-scholar-300"
                      )}>
                        {area.growth_rate}% momentum
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Research Areas Impact */}
          <Card className="bg-scholar-100/30">
            <CardHeader>
              <CardTitle className="text-scholar-700">Research Areas Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Pie Chart Section */}
                <div className="relative">
                  <div className="aspect-square w-full max-w-[600px] mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 20, right: 145, bottom: 20, left: 10 }}>
                        <Pie
                          data={data.metrics.domainDistribution.slice(0, 10).map(domain => ({
                            name: domain.name.length > 20 ? `${domain.name.substring(0, 20)}...` : domain.name,
                            fullName: domain.name,
                            value: domain.value
                          }))}
                          cx="40%"
                          cy="50%"
                          labelLine={false}
                          label={false}
                          outerRadius={100}
                          innerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={3}
                        >
                          {data.metrics.domainDistribution.slice(0, 10).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 shadow-lg rounded-lg border border-scholar-100">
                                  <p className="text-scholar-900 font-medium">{data.fullName}</p>
                                  <p className="text-scholar-700">{data.value} publications</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend 
                          verticalAlign="middle"
                          layout="vertical"
                          align="right"
                          iconSize={12}
                          iconType="circle"
                          wrapperStyle={{
                            right: 35,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '160px',
                            maxHeight: '100%',
                            overflowY: 'auto'
                          }}
                          formatter={(value: string, entry: any) => (
                            <span 
                              className="text-sm text-scholar-900 break-words leading-tight" 
                              style={{ 
                                display: 'inline-block', 
                                width: '130px',
                                marginTop: '4px',
                                marginBottom: '4px'
                              }}
                            >
                              {entry.payload.fullName}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Research Areas Details */}
                <div className="overflow-y-auto max-h-[600px] pr-4 custom-scrollbar">
                  <div className="space-y-4">
                    {data.topResearchAreas.map((area, i) => {
                      const mainTopic = area.topic.split('/')[0].trim();
                      return (
                        <div key={area.topic} className="p-4 bg-white/50 hover:bg-white/80 transition-colors rounded-lg shadow-sm">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-4">
                              <h4 className="text-sm font-medium text-scholar-900 break-words leading-snug flex-1">
                                {mainTopic}
                              </h4>
                              <span className={cn(
                                "text-sm font-medium shrink-0 px-2 py-1 rounded",
                                area.growth_rate >= 70 ? "bg-scholar-100/50 text-scholar-700" : 
                                area.growth_rate >= 40 ? "bg-scholar-100/30 text-scholar-500" :
                                "bg-scholar-100/20 text-scholar-300"
                              )}>
                                {area.growth_rate}% momentum
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="w-full bg-scholar-100 rounded-full h-2">
                                <div
                                  className="bg-scholar-500 h-2 rounded-full"
                                  style={{
                                    width: `${(area.score / data.topResearchAreas[0].score) * 100}%`
                                  }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-scholar-700">
                                <span>{area.publications} publications</span>
                                <span>{area.citations} citations</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Add this CSS at the end of the file, before the export
const styles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default Analytics;
