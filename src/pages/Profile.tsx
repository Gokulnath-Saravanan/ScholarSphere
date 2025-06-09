
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Building, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  full_name: string | null;
  institution: string | null;
  department: string | null;
  position: string | null;
  research_interests: string[] | null;
  bio: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || '',
          institution: null,
          department: null,
          position: null,
          research_interests: [],
          bio: null,
          avatar_url: null,
        };
        setProfile(newProfile);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async () => {
    if (!user || !profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addResearchInterest = () => {
    if (!newInterest.trim() || !profile) return;

    const interests = profile.research_interests || [];
    if (!interests.includes(newInterest.trim())) {
      setProfile({
        ...profile,
        research_interests: [...interests, newInterest.trim()],
      });
    }
    setNewInterest('');
  };

  const removeResearchInterest = (interest: string) => {
    if (!profile) return;

    setProfile({
      ...profile,
      research_interests: (profile.research_interests || []).filter(i => i !== interest),
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-16">
        {/* Back Navigation */}
        <section className="py-4 border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-2 text-scholar-blue-700 hover:text-scholar-blue-900">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </section>

        {/* Profile Form */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold scholar-gradient-text mb-2">Profile Settings</h1>
              <p className="text-scholar-blue-700">Manage your academic profile and research interests</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-scholar-blue-900 mb-2">
                        Full Name
                      </label>
                      <Input
                        value={profile.full_name || ''}
                        onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-scholar-blue-900 mb-2">
                        Bio
                      </label>
                      <Textarea
                        value={profile.bio || ''}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        placeholder="Tell us about yourself and your research..."
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Institutional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-scholar-blue-900 mb-2">
                        Institution
                      </label>
                      <Input
                        value={profile.institution || ''}
                        onChange={(e) => setProfile({...profile, institution: e.target.value})}
                        placeholder="e.g., Stanford University"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-scholar-blue-900 mb-2">
                        Department
                      </label>
                      <Input
                        value={profile.department || ''}
                        onChange={(e) => setProfile({...profile, department: e.target.value})}
                        placeholder="e.g., Computer Science"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-scholar-blue-900 mb-2">
                        Position
                      </label>
                      <Input
                        value={profile.position || ''}
                        onChange={(e) => setProfile({...profile, position: e.target.value})}
                        placeholder="e.g., Professor, PhD Student, Researcher"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Research Interests
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-scholar-blue-900 mb-2">
                        Add Research Interest
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={newInterest}
                          onChange={(e) => setNewInterest(e.target.value)}
                          placeholder="e.g., Machine Learning"
                          onKeyPress={(e) => e.key === 'Enter' && addResearchInterest()}
                        />
                        <Button onClick={addResearchInterest} variant="outline">
                          Add
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(profile.research_interests || []).map((interest, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-red-100"
                          onClick={() => removeResearchInterest(interest)}
                        >
                          {interest} ×
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Preview */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Profile Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="w-20 h-20 bg-scholar-blue-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <span className="text-xl font-bold text-scholar-blue-900">
                          {(profile.full_name || 'U').split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <h3 className="font-bold text-scholar-blue-900">{profile.full_name || 'Your Name'}</h3>
                      <p className="text-sm text-scholar-blue-700">{profile.position || 'Position'}</p>
                      <p className="text-sm text-scholar-blue-500">{profile.institution || 'Institution'}</p>
                    </div>
                    
                    {profile.bio && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-scholar-blue-900 mb-2">Bio</h4>
                        <p className="text-sm text-scholar-blue-700">{profile.bio}</p>
                      </div>
                    )}

                    {(profile.research_interests || []).length > 0 && (
                      <div>
                        <h4 className="font-semibold text-scholar-blue-900 mb-2">Research Interests</h4>
                        <div className="flex flex-wrap gap-1">
                          {(profile.research_interests || []).map((interest, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button onClick={updateProfile} disabled={loading} className="scholar-gradient">
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
