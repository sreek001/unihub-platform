const pool = require('./db');

// --- Fallback In-Memory Datastore ---
let inMemorySemesters = [
  { id: 1, name: 'Semester 1' },
  { id: 2, name: 'Semester 2' },
  { id: 3, name: 'Semester 3' },
  { id: 4, name: 'Semester 4' },
]

let inMemorySubjects = [
  { id: 1, semester_id: 1, code: 'MATH-101', name: 'Calculus I', description: 'Limits, derivatives, integrals and strong problem-solving skills.' },
  { id: 2, semester_id: 1, code: 'ENG-101', name: 'English Literature', description: 'Annotation, essay structure, and literary analysis for modern texts.' },
  { id: 3, semester_id: 2, code: 'PHY-101', name: 'Physics: Motion & Energy', description: 'Motion, force, energy, and analytical lab reporting.' },
  { id: 4, semester_id: 3, code: 'CS-201', name: 'Data Structures & Algorithms', description: 'Arrays, linked lists, trees, graphs, and algorithmic complexity.' },
  { id: 5, semester_id: 3, code: 'CS-202', name: 'Database Management Systems', description: 'Relational model, SQL, normalization, and transaction management.' },
]

let inMemoryMaterials = [
  { id: 1, subject_id: 1, title: 'Limits & Continuity Guide', url: 'https://developers.cloudflare.com/learning/limits-derivatives/', type: 'Notes' },
  { id: 2, subject_id: 1, title: 'Derivative Practice Pack', url: 'https://developers.cloudflare.com/learning/practice-sets/', type: 'Question Papers' },
  { id: 3, subject_id: 1, title: 'Calculus Early Transcendentals Textbook', url: 'https://developers.cloudflare.com/learning/calculus-textbook/', type: 'Textbooks' },
  { id: 4, subject_id: 3, title: 'Vectors & Motion Cheat Sheet', url: 'https://developers.cloudflare.com/learning/motion-energy/', type: 'Notes' },
  { id: 5, subject_id: 3, title: 'Lab Report Template', url: 'https://developers.cloudflare.com/learning/labs/', type: 'Notes' },
  { id: 6, subject_id: 2, title: 'Essay Writing Rubric', url: 'https://developers.cloudflare.com/learning/essay-technique/', type: 'Notes' },
  { id: 7, subject_id: 4, title: 'Introduction to Algorithms (CLRS)', url: 'https://developers.cloudflare.com/learning/clrs/', type: 'Textbooks' },
  { id: 8, subject_id: 5, title: 'DBMS Course Notes', url: 'https://developers.cloudflare.com/learning/dbms-notes/', type: 'Notes' },
]

/**
 * GET /api/academics/semesters
 */
async function getSemesters(req, res) {
  try {
    const { rows } = await pool.query('SELECT id, name FROM semesters ORDER BY name');
    return res.json({ success: true, semesters: rows });
  } catch (err) {
    console.warn('[Academics DB] query failed, using in-memory semesters fallback:', err.message);
    return res.json({ success: true, semesters: inMemorySemesters });
  }
}

/**
 * GET /api/academics/subjects?semester_id=X
 */
async function getSubjects(req, res) {
  const { semester_id } = req.query;
  if (!semester_id) {
    return res.status(400).json({ success: false, message: 'semester_id query parameter is required' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, code, name, description FROM subjects WHERE semester_id = $1 ORDER BY name',
      [semester_id]
    );
    return res.json({ success: true, subjects: rows });
  } catch (err) {
    console.warn('[Academics DB] query failed, using in-memory subjects fallback:', err.message);
    const subjects = inMemorySubjects.filter(s => s.semester_id === Number(semester_id));
    return res.json({ success: true, subjects });
  }
}

/**
 * GET /api/academics/materials?subject_id=Y
 */
async function getMaterials(req, res) {
  const { subject_id } = req.query;
  if (!subject_id) {
    return res.status(400).json({ success: false, message: 'subject_id query parameter is required' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, title, file_url AS url, material_type AS type FROM study_materials WHERE subject_id = $1 ORDER BY title',
      [subject_id]
    );
    return res.json({ success: true, materials: rows });
  } catch (err) {
    console.warn('[Academics DB] query failed, using in-memory materials fallback:', err.message);
    const materials = inMemoryMaterials.filter(m => m.subject_id === Number(subject_id));
    return res.json({ success: true, materials });
  }
}

/**
 * POST /api/academics/materials
 */
async function createMaterial(req, res) {
  const { title, url, type, subjectId } = req.body;
  if (!title || !url || !type || !subjectId) {
    return res.status(400).json({ success: false, message: 'title, url, type, and subjectId are required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO study_materials(title, file_url, material_type, subject_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [title, url, type, subjectId]
    );
    return res.status(201).json({ success: true, createdId: rows[0].id });
  } catch (err) {
    console.warn('[Academics DB] insert failed, using in-memory materials fallback:', err.message);
    const newMat = {
      id: Date.now(),
      subject_id: Number(subjectId),
      title,
      url,
      type
    };
    inMemoryMaterials.push(newMat);
    return res.status(201).json({ success: true, createdId: newMat.id });
  }
}

/**
 * GET /api/academics/resources (Legacy aggregated structure)
 */
async function getAggregateResources(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT
        sem.name AS category,
        s.id AS subject_id,
        s.code,
        s.name AS subject_name,
        s.description AS subject_description,
        m.id AS doc_id,
        m.title AS doc_title,
        m.file_url AS doc_url,
        m.material_type AS doc_type
      FROM semesters sem
      JOIN subjects s ON s.semester_id = sem.id
      LEFT JOIN study_materials m ON m.subject_id = s.id
      ORDER BY sem.name, s.name, m.title`,
    );

    const sections = rows.reduce((acc, row) => {
      let section = acc.find((item) => item.category === row.category);
      if (!section) {
        section = { category: row.category, subjects: [] };
        acc.push(section);
      }

      if (row.subject_id) {
        let subject = section.subjects.find((s) => s.id === row.subject_id);
        if (!subject) {
          subject = {
            id: row.subject_id,
            code: row.code,
            name: row.subject_name,
            description: row.subject_description,
            topics: [],
            docs: [],
          };
          section.subjects.push(subject);
        }

        if (row.doc_id) {
          subject.docs.push({
            id: row.doc_id,
            title: row.doc_title,
            url: row.doc_url,
            type: row.doc_type,
          });
        }
      }
      return acc;
    }, []);

    return res.json({ subjects: sections });
  } catch (err) {
    console.warn('[Academics DB] query failed, using in-memory aggregate resources fallback:', err.message);
  }

  // Fallback memory aggregation
  const sections = inMemorySemesters.map(sem => {
    const subjects = inMemorySubjects
      .filter(subj => subj.semester_id === sem.id)
      .map(subj => {
        const docs = inMemoryMaterials
          .filter(mat => mat.subject_id === subj.id)
          .map(mat => ({
            id: mat.id,
            title: mat.title,
            url: mat.url,
            type: mat.type,
          }));
        return {
          id: subj.id,
          code: subj.code,
          name: subj.name,
          description: subj.description,
          topics: [],
          docs
        };
      });
    return { category: sem.name, subjects };
  });
  res.json({ subjects: sections });
}

module.exports = {
  getSemesters,
  getSubjects,
  getMaterials,
  createMaterial,
  getAggregateResources,
};
