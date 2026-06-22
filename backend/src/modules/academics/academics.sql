-- Drop legacy academic tables
DROP TABLE IF EXISTS study_materials CASCADE;
DROP TABLE IF EXISTS subject_documents CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS semesters CASCADE;

-- Create semesters table
CREATE TABLE semesters (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) UNIQUE NOT NULL
);

-- Create subjects table
CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  code VARCHAR(24) UNIQUE NOT NULL,
  name VARCHAR(128) NOT NULL,
  description TEXT,
  semester_id INTEGER NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create study materials table
CREATE TABLE study_materials (
  id SERIAL PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  file_url TEXT NOT NULL,
  material_type VARCHAR(64) NOT NULL, -- 'Textbooks', 'Question Papers', 'Notes'
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed semesters
INSERT INTO semesters(name) VALUES 
('Semester 1'), 
('Semester 2'), 
('Semester 3'), 
('Semester 4')
ON CONFLICT (name) DO NOTHING;

-- Seed subjects
INSERT INTO subjects(code, name, description, semester_id) VALUES 
('MATH-101', 'Calculus I', 'Limits, derivatives, integrals and strong problem-solving skills.', 1),
('ENG-101', 'English Literature', 'Annotation, essay structure, and literary analysis for modern texts.', 1),
('PHY-101', 'Physics: Motion & Energy', 'Motion, force, energy, and analytical lab reporting.', 2),
('CS-201', 'Data Structures & Algorithms', 'Arrays, linked lists, trees, graphs, and algorithmic complexity.', 3),
('CS-202', 'Database Management Systems', 'Relational model, SQL, normalization, and transaction management.', 3)
ON CONFLICT (code) DO NOTHING;

-- Seed study materials
INSERT INTO study_materials(title, file_url, material_type, subject_id) VALUES
('Limits & Continuity Guide', 'https://developers.cloudflare.com/learning/limits-derivatives/', 'Notes', 1),
('Derivative Practice Pack', 'https://developers.cloudflare.com/learning/practice-sets/', 'Question Papers', 1),
('Calculus Early Transcendentals Textbook', 'https://developers.cloudflare.com/learning/calculus-textbook/', 'Textbooks', 1),
('Vectors & Motion Cheat Sheet', 'https://developers.cloudflare.com/learning/motion-energy/', 'Notes', 3),
('Lab Report Template', 'https://developers.cloudflare.com/learning/labs/', 'Notes', 3),
('Essay Writing Rubric', 'https://developers.cloudflare.com/learning/essay-technique/', 'Notes', 2),
('Introduction to Algorithms (CLRS)', 'https://developers.cloudflare.com/learning/clrs/', 'Textbooks', 4),
('DBMS Course Notes', 'https://developers.cloudflare.com/learning/dbms-notes/', 'Notes', 5);
