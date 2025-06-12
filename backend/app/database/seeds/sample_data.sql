- Sample faculty data
INSERT INTO faculty (name, title, department, institution, email, research_interests) VALUES
('Dr. John Smith', 'Professor', 'Computer Science', 'Tech University', 'john.smith@tech.edu', ARRAY['Artificial Intelligence', 'Machine Learning', 'Computer Vision']),
('Dr. Sarah Johnson', 'Associate Professor', 'Data Science', 'Data Institute', 'sarah.j@data.edu', ARRAY['Data Mining', 'Big Data Analytics', 'Natural Language Processing']),
('Dr. Michael Chen', 'Assistant Professor', 'Physics', 'Science University', 'mchen@science.edu', ARRAY['Quantum Computing', 'Theoretical Physics', 'Computational Physics']);

-- Sample publications data
INSERT INTO publications (title, abstract, authors, journal, year, doi, citations) VALUES
('Deep Learning Applications in Computer Vision', 'A comprehensive review of deep learning techniques in computer vision applications...', ARRAY['John Smith', 'Alice Brown'], 'Journal of AI', 2023, 'doi:10.1234/ai.2023.001', 45),
('Natural Language Processing in Healthcare', 'Exploring the applications of NLP in healthcare data analysis...', ARRAY['Sarah Johnson', 'David Wilson'], 'Data Science Review', 2023, 'doi:10.1234/ds.2023.002', 32),
('Quantum Computing: Present and Future', 'An overview of current quantum computing technologies...', ARRAY['Michael Chen'], 'Physics Today', 2023, 'doi:10.1234/ph.2023.003', 28);

-- Sample research works data
INSERT INTO research_works (title, description, researcher, domain, status, keywords) VALUES
('AI-Powered Medical Diagnosis', 'Research on using AI for accurate medical diagnosis...', 'John Smith', 'Healthcare AI', 'In Progress', ARRAY['AI', 'Healthcare', 'Machine Learning']),
('Big Data Analytics in Finance', 'Analyzing financial markets using big data...', 'Sarah Johnson', 'Finance', 'Completed', ARRAY['Big Data', 'Finance', 'Analytics']),
('Quantum Algorithm Optimization', 'Developing optimized algorithms for quantum computers...', 'Michael Chen', 'Quantum Computing', 'In Progress', ARRAY['Quantum', 'Algorithms', 'Optimization']); 