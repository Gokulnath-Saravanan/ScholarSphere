-- Insert sample research trends data
INSERT INTO research_trends (id, topic, category, year, quarter, publication_count, citation_count, faculty_count, growth_rate, trending_score)
VALUES
  -- 2024 Q1
  ('rt1', 'Artificial Intelligence', 'Computer Science', 2024, 1, 150, 1200, 45, 15.5, 85),
  ('rt2', 'Machine Learning', 'Computer Science', 2024, 1, 180, 1500, 50, 18.2, 90),
  ('rt3', 'Quantum Computing', 'Physics', 2024, 1, 90, 800, 30, 12.8, 75),
  ('rt4', 'Climate Change', 'Environmental Science', 2024, 1, 200, 1800, 60, 20.1, 95),
  ('rt5', 'Biotechnology', 'Biology', 2024, 1, 160, 1400, 48, 16.7, 88),

  -- 2023 Q4
  ('rt6', 'Artificial Intelligence', 'Computer Science', 2023, 4, 130, 1000, 40, 12.5, 80),
  ('rt7', 'Machine Learning', 'Computer Science', 2023, 4, 150, 1200, 45, 15.2, 85),
  ('rt8', 'Quantum Computing', 'Physics', 2023, 4, 80, 700, 25, 10.8, 70),
  ('rt9', 'Climate Change', 'Environmental Science', 2023, 4, 180, 1600, 55, 18.1, 90),
  ('rt10', 'Biotechnology', 'Biology', 2023, 4, 140, 1200, 42, 14.7, 83),

  -- 2023 Q3
  ('rt11', 'Artificial Intelligence', 'Computer Science', 2023, 3, 120, 900, 38, 11.5, 78),
  ('rt12', 'Machine Learning', 'Computer Science', 2023, 3, 140, 1100, 43, 14.2, 82),
  ('rt13', 'Quantum Computing', 'Physics', 2023, 3, 75, 650, 23, 9.8, 68),
  ('rt14', 'Climate Change', 'Environmental Science', 2023, 3, 170, 1500, 52, 17.1, 88),
  ('rt15', 'Biotechnology', 'Biology', 2023, 3, 130, 1100, 40, 13.7, 80),

  -- 2023 Q2
  ('rt16', 'Artificial Intelligence', 'Computer Science', 2023, 2, 110, 800, 35, 10.5, 75),
  ('rt17', 'Machine Learning', 'Computer Science', 2023, 2, 130, 1000, 40, 13.2, 79),
  ('rt18', 'Quantum Computing', 'Physics', 2023, 2, 70, 600, 20, 8.8, 65),
  ('rt19', 'Climate Change', 'Environmental Science', 2023, 2, 160, 1400, 50, 16.1, 85),
  ('rt20', 'Biotechnology', 'Biology', 2023, 2, 120, 1000, 38, 12.7, 77),

  -- 2023 Q1
  ('rt21', 'Artificial Intelligence', 'Computer Science', 2023, 1, 100, 700, 32, 9.5, 72),
  ('rt22', 'Machine Learning', 'Computer Science', 2023, 1, 120, 900, 38, 12.2, 76),
  ('rt23', 'Quantum Computing', 'Physics', 2023, 1, 65, 550, 18, 7.8, 62),
  ('rt24', 'Climate Change', 'Environmental Science', 2023, 1, 150, 1300, 48, 15.1, 82),
  ('rt25', 'Biotechnology', 'Biology', 2023, 1, 110, 900, 35, 11.7, 74),

  -- 2022 Q4
  ('rt26', 'Artificial Intelligence', 'Computer Science', 2022, 4, 90, 600, 30, 8.5, 70),
  ('rt27', 'Machine Learning', 'Computer Science', 2022, 4, 110, 800, 35, 11.2, 73),
  ('rt28', 'Quantum Computing', 'Physics', 2022, 4, 60, 500, 15, 6.8, 60),
  ('rt29', 'Climate Change', 'Environmental Science', 2022, 4, 140, 1200, 45, 14.1, 80),
  ('rt30', 'Biotechnology', 'Biology', 2022, 4, 100, 800, 32, 10.7, 71),

  -- 2022 Q3
  ('rt31', 'Artificial Intelligence', 'Computer Science', 2022, 3, 80, 500, 28, 7.5, 68),
  ('rt32', 'Machine Learning', 'Computer Science', 2022, 3, 100, 700, 32, 10.2, 70),
  ('rt33', 'Quantum Computing', 'Physics', 2022, 3, 55, 450, 13, 5.8, 58),
  ('rt34', 'Climate Change', 'Environmental Science', 2022, 3, 130, 1100, 42, 13.1, 78),
  ('rt35', 'Biotechnology', 'Biology', 2022, 3, 90, 700, 30, 9.7, 69),

  -- 2022 Q2
  ('rt36', 'Artificial Intelligence', 'Computer Science', 2022, 2, 70, 400, 25, 6.5, 65),
  ('rt37', 'Machine Learning', 'Computer Science', 2022, 2, 90, 600, 30, 9.2, 68),
  ('rt38', 'Quantum Computing', 'Physics', 2022, 2, 50, 400, 12, 4.8, 55),
  ('rt39', 'Climate Change', 'Environmental Science', 2022, 2, 120, 1000, 40, 12.1, 75),
  ('rt40', 'Biotechnology', 'Biology', 2022, 2, 80, 600, 28, 8.7, 67),

  -- 2022 Q1
  ('rt41', 'Artificial Intelligence', 'Computer Science', 2022, 1, 60, 300, 22, 5.5, 62),
  ('rt42', 'Machine Learning', 'Computer Science', 2022, 1, 80, 500, 28, 8.2, 65),
  ('rt43', 'Quantum Computing', 'Physics', 2022, 1, 45, 350, 10, 3.8, 52),
  ('rt44', 'Climate Change', 'Environmental Science', 2022, 1, 110, 900, 38, 11.1, 72),
  ('rt45', 'Biotechnology', 'Biology', 2022, 1, 70, 500, 25, 7.7, 64); 