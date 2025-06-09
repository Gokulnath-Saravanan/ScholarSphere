
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  institution TEXT,
  department TEXT,
  position TEXT,
  research_interests TEXT[],
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create faculty table for faculty management
CREATE TABLE public.faculty (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  institution TEXT NOT NULL,
  position TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  research_areas TEXT[] NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  h_index INTEGER DEFAULT 0,
  citations INTEGER DEFAULT 0,
  publications_count INTEGER DEFAULT 0,
  collaborations_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create publications table
CREATE TABLE public.publications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL,
  journal TEXT,
  year INTEGER NOT NULL,
  doi TEXT,
  abstract TEXT,
  keywords TEXT[],
  citation_count INTEGER DEFAULT 0,
  type TEXT DEFAULT 'journal',
  faculty_id UUID REFERENCES public.faculty(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collaborations table
CREATE TABLE public.collaborations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id_1 UUID REFERENCES public.faculty(id) ON DELETE CASCADE,
  faculty_id_2 UUID REFERENCES public.faculty(id) ON DELETE CASCADE,
  project_title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create research trends table for analytics
CREATE TABLE public.research_trends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  frequency INTEGER NOT NULL DEFAULT 0,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_trends ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for faculty (public read access for discovery)
CREATE POLICY "Anyone can view faculty" ON public.faculty FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create faculty profiles" ON public.faculty FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update their own faculty profile" ON public.faculty FOR UPDATE USING (user_id = auth.uid());

-- Create policies for publications (public read access)
CREATE POLICY "Anyone can view publications" ON public.publications FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create publications" ON public.publications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update publications" ON public.publications FOR UPDATE TO authenticated USING (true);

-- Create policies for collaborations (public read access)
CREATE POLICY "Anyone can view collaborations" ON public.collaborations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create collaborations" ON public.collaborations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update collaborations" ON public.collaborations FOR UPDATE TO authenticated USING (true);

-- Create policies for research trends (public read access)
CREATE POLICY "Anyone can view research trends" ON public.research_trends FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage research trends" ON public.research_trends FOR ALL TO authenticated USING (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data for analytics
INSERT INTO public.research_trends (keyword, frequency, year, month) VALUES
('artificial intelligence', 145, 2024, 1),
('machine learning', 132, 2024, 1),
('data science', 98, 2024, 1),
('quantum computing', 67, 2024, 1),
('blockchain', 54, 2024, 1),
('artificial intelligence', 158, 2024, 2),
('machine learning', 143, 2024, 2),
('data science', 105, 2024, 2),
('quantum computing', 72, 2024, 2),
('blockchain', 48, 2024, 2),
('artificial intelligence', 171, 2024, 3),
('machine learning', 156, 2024, 3),
('data science', 112, 2024, 3),
('quantum computing', 78, 2024, 3),
('blockchain', 52, 2024, 3);

-- Insert sample faculty data
INSERT INTO public.faculty (name, department, institution, position, email, research_areas, bio, h_index, citations, publications_count, collaborations_count) VALUES
('Dr. Sarah Chen', 'Computer Science', 'MIT', 'Professor', 'sarah.chen@mit.edu', ARRAY['Artificial Intelligence', 'Machine Learning', 'Neural Networks'], 'Leading researcher in AI and machine learning with 15+ years of experience.', 45, 8500, 120, 25),
('Dr. Michael Rodriguez', 'Physics', 'Stanford University', 'Associate Professor', 'mrodriguez@stanford.edu', ARRAY['Quantum Computing', 'Theoretical Physics'], 'Expert in quantum computing and theoretical physics applications.', 38, 6200, 95, 18),
('Dr. Emily Johnson', 'Biology', 'Harvard University', 'Professor', 'emily.j@harvard.edu', ARRAY['Computational Biology', 'Genomics', 'Bioinformatics'], 'Pioneer in computational biology and genomics research.', 52, 9800, 145, 32);

-- Insert sample publications
INSERT INTO public.publications (title, authors, journal, year, abstract, keywords, citation_count, faculty_id) VALUES
('Advanced Neural Network Architectures for Natural Language Processing', ARRAY['Sarah Chen', 'David Kim', 'Lisa Wang'], 'Nature Machine Intelligence', 2024, 'This paper presents novel neural network architectures for improving natural language processing tasks.', ARRAY['neural networks', 'NLP', 'deep learning'], 45, (SELECT id FROM public.faculty WHERE name = 'Dr. Sarah Chen')),
('Quantum Algorithms for Optimization Problems', ARRAY['Michael Rodriguez', 'Anna Schmidt'], 'Physical Review Letters', 2024, 'We propose new quantum algorithms for solving complex optimization problems.', ARRAY['quantum computing', 'optimization', 'algorithms'], 32, (SELECT id FROM public.faculty WHERE name = 'Dr. Michael Rodriguez')),
('Genomic Analysis Using Machine Learning Techniques', ARRAY['Emily Johnson', 'Robert Chen', 'Maria Garcia'], 'Cell', 2024, 'Application of machine learning to genomic data analysis reveals new insights.', ARRAY['genomics', 'machine learning', 'bioinformatics'], 67, (SELECT id FROM public.faculty WHERE name = 'Dr. Emily Johnson'));

-- Insert sample collaborations
INSERT INTO public.collaborations (faculty_id_1, faculty_id_2, project_title, description, start_date, status) VALUES
((SELECT id FROM public.faculty WHERE name = 'Dr. Sarah Chen'), (SELECT id FROM public.faculty WHERE name = 'Dr. Emily Johnson'), 'AI-Driven Genomic Analysis Platform', 'Developing an AI platform for automated genomic data analysis and interpretation.', '2024-01-15', 'active'),
((SELECT id FROM public.faculty WHERE name = 'Dr. Michael Rodriguez'), (SELECT id FROM public.faculty WHERE name = 'Dr. Sarah Chen'), 'Quantum Machine Learning Framework', 'Creating a framework that combines quantum computing with machine learning algorithms.', '2024-02-01', 'active');
