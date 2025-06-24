import { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Building, GraduationCap, X } from 'lucide-react';
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
      <div className="min-h-screen bg-[#D3D9D4]/10 flex items-center justify-center">
        <p className="text-[#212A31]">Please sign in to view your profile.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#D3D9D4]/10 flex items-center justify-center">
        <p className="text-[#212A31]">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D3D9D4]">
      <Header />
      
      <main className="pt-16 bg-[#D3D9D4]">
        {/* Back Navigation */}
        <section className="py-4 border-b border-[#748D92]/20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-2 text-[#2E3944] hover:text-[#212A31]">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </section>

        {/* Profile Form */}
        <section className="py-12 bg-[#D3D9D4]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#212A31] mb-2">Profile Settings</h1>
              <p className="text-[#2E3944]">Manage your academic profile and research interests</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-[#748D92]/20 bg-white shadow-sm">
                  <CardHeader className="bg-white">
                    <CardTitle className="flex items-center gap-2 text-[#212A31]">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 bg-white">
                    <div>
                      <label className="block text-sm font-medium text-[#212A31] mb-2">
                        Full Name
                      </label>
                      <Input
                        value={profile.full_name || ''}
                        onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                        placeholder="Enter your full name"
                        className="bg-white border-[#748D92] focus:border-[#124E66] placeholder-[#748D92]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#212A31] mb-2">
                        Bio
                      </label>
                      <Textarea
                        value={profile.bio || ''}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        placeholder="Tell us about yourself and your research..."
                        className="bg-white border-[#748D92] focus:border-[#124E66] placeholder-[#748D92]"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#748D92]/20 bg-white shadow-sm">
                  <CardHeader className="bg-white">
                    <CardTitle className="flex items-center gap-2 text-[#212A31]">
                      <Building className="h-5 w-5" />
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 bg-white">
                    <div>
                      <label className="block text-sm font-medium text-[#212A31] mb-2">
                        Institution
                      </label>
                      <Input
                        value={profile.institution || ''}
                        onChange={(e) => setProfile({...profile, institution: e.target.value})}
                        placeholder="Enter your institution"
                        className="bg-white border-[#748D92] focus:border-[#124E66] placeholder-[#748D92]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#212A31] mb-2">
                        Department
                      </label>
                      <Input
                        value={profile.department || ''}
                        onChange={(e) => setProfile({...profile, department: e.target.value})}
                        placeholder="Enter your department"
                        className="bg-white border-[#748D92] focus:border-[#124E66] placeholder-[#748D92]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#212A31] mb-2">
                        Position
                      </label>
                      <Input
                        value={profile.position || ''}
                        onChange={(e) => setProfile({...profile, position: e.target.value})}
                        placeholder="Enter your position"
                        className="bg-white border-[#748D92] focus:border-[#124E66] placeholder-[#748D92]"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#748D92]/20 bg-white shadow-sm">
                  <CardHeader className="bg-white">
                    <CardTitle className="flex items-center gap-2 text-[#212A31]">
                      <GraduationCap className="h-5 w-5" />
                      Research Interests
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 bg-white">
                    <div className="flex flex-wrap gap-2">
                      {profile.research_interests?.map((interest, index) => (
                        <Badge
                          key={index}
                          className="bg-[#124E66] hover:bg-[#2E3944] text-white"
                          onClick={() => removeResearchInterest(interest)}
                        >
                          {interest}
                          <X className="h-3 w-3 ml-1 cursor-pointer" />
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="Add a research interest"
                        className="bg-white border-[#748D92] focus:border-[#124E66] placeholder-[#748D92]"
                        onKeyPress={(e) => e.key === 'Enter' && addResearchInterest()}
                      />
                      <Button
                        type="button"
                        onClick={addResearchInterest}
                        className="bg-[#124E66] hover:bg-[#2E3944] text-white"
                      >
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    onClick={updateProfile}
                    disabled={loading}
                    className="bg-[#124E66] hover:bg-[#2E3944] text-white"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>

              {/* Preview Card */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24 border-[#748D92]/20 bg-white shadow-sm">
                  <CardHeader className="bg-white">
                    <CardTitle className="text-[#212A31]">Profile Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="bg-white">
                    <div className="space-y-4">
                      <div className="w-32 h-32 mx-auto bg-[#D3D9D4] rounded-full flex items-center justify-center">
                        <User className="w-16 h-16 text-[#748D92]" />
                      </div>

                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-[#212A31]">
                          {profile.full_name || 'Your Name'}
                        </h3>
                        <p className="text-[#2E3944]">
                          {profile.position || 'Position'} at {profile.institution || 'Institution'}
                        </p>
                        <p className="text-[#2E3944]">
                          {profile.department || 'Department'}
                        </p>
                      </div>

                      <div className="border-t border-[#748D92]/20 pt-4">
                        <h4 className="text-sm font-semibold text-[#212A31] mb-2">Research Interests</h4>
                        <div className="flex flex-wrap gap-1">
                          {profile.research_interests?.map((interest, index) => (
                            <Badge
                              key={index}
                              className="bg-[#124E66] text-white"
                            >
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {profile.bio && (
                        <div className="border-t border-[#748D92]/20 pt-4">
                          <h4 className="text-sm font-semibold text-[#212A31] mb-2">Bio</h4>
                          <p className="text-sm text-[#2E3944]">{profile.bio}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
