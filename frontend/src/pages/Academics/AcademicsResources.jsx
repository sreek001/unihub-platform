import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Folder, Mail, Sparkles, ArrowRight, Check, Plus, Trash2, RotateCw, CheckCircle, AlertCircle, PlusCircle, Search, HelpCircle, Eye } from 'lucide-react'
import { cloudflareDocs, contactMail } from '../../config/cdn.js'

// --- Fallback Mock Data ---
const fallbackSemesters = [
  { id: 1, name: 'Semester 1' },
  { id: 2, name: 'Semester 2' },
  { id: 3, name: 'Semester 3' },
  { id: 4, name: 'Semester 4' },
]

const fallbackSubjects = {
  1: [
    { id: 1, code: 'MATH-101', name: 'Calculus I', description: 'Limits, derivatives, integrals and strong problem-solving skills.', topics: ['Limits', 'Derivatives', 'Integrals', 'Series'] },
    { id: 2, code: 'ENG-101', name: 'English Literature', description: 'Annotation, essay structure, and literary analysis for modern texts.', topics: ['Analysis', 'Argument', 'Literary devices'] },
  ],
  2: [
    { id: 3, code: 'PHY-101', name: 'Physics: Motion & Energy', description: 'Motion, force, energy, and analytical lab reporting.', topics: ['Kinematics', 'Dynamics', 'Work', 'Energy'] },
  ],
  3: [
    { id: 4, code: 'CS-201', name: 'Data Structures & Algorithms', description: 'Arrays, linked lists, trees, graphs, and algorithmic complexity.', topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs'] },
    { id: 5, code: 'CS-202', name: 'Database Management Systems', description: 'Relational model, SQL, normalization, and transaction management.', topics: ['SQL', 'Relational Model', 'Normalization'] },
  ],
  4: []
}

const fallbackMaterials = {
  1: [
    { id: 1, title: 'Limits & Continuity Guide', url: 'https://developers.cloudflare.com/learning/limits-derivatives/', type: 'Notes' },
    { id: 2, title: 'Derivative Practice Pack', url: 'https://developers.cloudflare.com/learning/practice-sets/', type: 'Question Papers' },
    { id: 3, title: 'Calculus Early Transcendentals Textbook', url: 'https://developers.cloudflare.com/learning/calculus-textbook/', type: 'Textbooks' },
  ],
  2: [
    { id: 6, title: 'Essay Writing Rubric', url: 'https://developers.cloudflare.com/learning/essay-technique/', type: 'Notes' },
  ],
  3: [
    { id: 4, title: 'Vectors & Motion Cheat Sheet', url: 'https://developers.cloudflare.com/learning/motion-energy/', type: 'Notes' },
    { id: 5, title: 'Lab Report Template', url: 'https://developers.cloudflare.com/learning/labs/', type: 'Notes' },
  ],
  4: [
    { id: 7, title: 'Introduction to Algorithms (CLRS)', url: 'https://developers.cloudflare.com/learning/clrs/', type: 'Textbooks' },
  ],
  5: [
    { id: 8, title: 'DBMS Course Notes', url: 'https://developers.cloudflare.com/learning/dbms-notes/', type: 'Notes' },
  ],
}

// Default preloaded flashcards mapping
const defaultFlashcards = {
  1: [
    { id: 'fc-m1', question: 'What is the derivative of sin(x)?', answer: 'cos(x)', mastered: false },
    { id: 'fc-m2', question: 'What is the limit of sin(x)/x as x approaches 0?', answer: '1', mastered: false },
    { id: 'fc-m3', question: 'State the Power Rule for derivatives.', answer: 'd/dx (x^n) = n * x^(n-1)', mastered: false },
  ],
  2: [
    { id: 'fc-e1', question: 'What is a metaphor?', answer: 'A figure of speech that directly refers to one thing by mentioning another for rhetorical effect.', mastered: false },
  ],
  3: [
    { id: 'fc-p1', question: 'What is Newton\'s Second Law of Motion?', answer: 'F = ma (Force = mass * acceleration)', mastered: false },
    { id: 'fc-p2', question: 'State the Law of Conservation of Energy.', answer: 'Energy cannot be created or destroyed, only transformed.', mastered: false },
  ],
  4: [
    { id: 'fc-ds1', question: 'What is the time complexity of binary search?', answer: 'O(log n)', mastered: false },
  ]
}

function AcademicsResources() {
  // --- Data Flow States ---
  const [semesters, setSemesters] = useState(fallbackSemesters)
  const [activeSemesterId, setActiveSemesterId] = useState(1)
  const [subjects, setSubjects] = useState([])
  const [activeSubjectId, setActiveSubjectId] = useState(null)
  const [materials, setMaterials] = useState([])
  const [apiOnline, setApiOnline] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch semesters on mount
  useEffect(() => {
    fetch('http://localhost:4000/api/academics/semesters')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.semesters.length > 0) {
          setSemesters(data.semesters)
          setActiveSemesterId(data.semesters[0].id)
          setApiOnline(true)
        }
      })
      .catch(err => {
        console.warn('Academics API offline, running in simulation mode:', err)
        setSemesters(fallbackSemesters)
        setActiveSemesterId(1)
        setApiOnline(false)
      })
  }, [])

  // Fetch subjects when activeSemesterId changes
  useEffect(() => {
    if (!activeSemesterId) return

    if (apiOnline) {
      fetch(`http://localhost:4000/api/academics/subjects?semester_id=${activeSemesterId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSubjects(data.subjects)
            if (data.subjects.length > 0) {
              setActiveSubjectId(data.subjects[0].id)
            } else {
              setActiveSubjectId(null)
            }
          }
        })
        .catch(err => {
          console.warn('API subjects fetch failed, falling back:', err)
          const mockSubjs = fallbackSubjects[activeSemesterId] || []
          setSubjects(mockSubjs)
          setActiveSubjectId(mockSubjs.length > 0 ? mockSubjs[0].id : null)
        })
    } else {
      const mockSubjs = fallbackSubjects[activeSemesterId] || []
      setSubjects(mockSubjs)
      setActiveSubjectId(mockSubjs.length > 0 ? mockSubjs[0].id : null)
    }
  }, [activeSemesterId, apiOnline])

  // Fetch materials when activeSubjectId changes
  useEffect(() => {
    if (!activeSubjectId) {
      setMaterials([])
      return
    }

    if (apiOnline) {
      fetch(`http://localhost:4000/api/academics/materials?subject_id=${activeSubjectId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setMaterials(data.materials)
          }
        })
        .catch(err => {
          console.warn('API materials fetch failed, falling back:', err)
          setMaterials(fallbackMaterials[activeSubjectId] || [])
        })
    } else {
      setMaterials(fallbackMaterials[activeSubjectId] || [])
    }
  }, [activeSubjectId, apiOnline])

  // Get current active subject details
  const activeSubject = useMemo(() => {
    return subjects.find(s => s.id === activeSubjectId) || null
  }, [activeSubjectId, subjects])

  // --- Task Planner State ---
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('academics_tasks')
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Revise Calculus I limits notes', completed: false, category: 'Math' },
      { id: 2, text: 'Check lost keyring status', completed: true, category: 'Admin' },
      { id: 3, text: 'Review Statistics practice set', completed: false, category: 'Math' },
    ]
  })

  useEffect(() => {
    localStorage.setItem('academics_tasks', JSON.stringify(tasks))
    window.dispatchEvent(new Event('storage'))
  }, [tasks])

  const [newTaskText, setNewTaskText] = useState('')
  const [newTaskCategory, setNewTaskCategory] = useState('Math')

  const handleAddTask = (e) => {
    e.preventDefault()
    if (!newTaskText.trim()) return
    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      completed: false,
      category: newTaskCategory
    }
    setTasks([...tasks, newTask])
    setNewTaskText('')
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  // --- GPA Calculator State ---
  const [gpaCourses, setGpaCourses] = useState([
    { id: 1, name: 'Calculus I', grade: 'A', credits: 4 },
    { id: 2, name: 'Physics Mechanics', grade: 'B+', credits: 3 },
    { id: 3, name: 'English Composition', grade: 'A-', credits: 3 },
  ])
  const [gpaCourseName, setGpaCourseName] = useState('')
  const [gpaGrade, setGpaGrade] = useState('A')
  const [gpaCredits, setGpaCredits] = useState(3)

  const gradePoints = {
    'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0
  }

  const calculatedGPA = useMemo(() => {
    let totalCredits = 0
    let totalPoints = 0
    gpaCourses.forEach(c => {
      const credits = Number(c.credits)
      const gradeVal = gradePoints[c.grade] || 4.0
      totalCredits += credits
      totalPoints += gradeVal * credits
    })
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00'
  }, [gpaCourses])

  const handleAddGpaCourse = (e) => {
    e.preventDefault()
    const name = gpaCourseName.trim() || `Course #${gpaCourses.length + 1}`
    const newCourse = {
      id: Date.now(),
      name,
      grade: gpaGrade,
      credits: Number(gpaCredits)
    }
    setGpaCourses([...gpaCourses, newCourse])
    setGpaCourseName('')
  }

  const deleteGpaCourse = (id) => {
    setGpaCourses(gpaCourses.filter(c => c.id !== id))
  }

  // --- Flashcard State ---
  const [flashcards, setFlashcards] = useState(() => {
    const saved = localStorage.getItem('academics_flashcards')
    return saved ? JSON.parse(saved) : defaultFlashcards
  })
  
  useEffect(() => {
    localStorage.setItem('academics_flashcards', JSON.stringify(flashcards))
  }, [flashcards])

  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')

  const activeDeck = useMemo(() => {
    return flashcards[activeSubjectId] || []
  }, [activeSubjectId, flashcards])

  useEffect(() => {
    setCurrentCardIndex(0)
    setIsFlipped(false)
  }, [activeSubjectId])

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleNextCard = () => {
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentCardIndex((prev) => (activeDeck.length > 0 ? (prev + 1) % activeDeck.length : 0))
    }, 150)
  }

  const handlePrevCard = () => {
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentCardIndex((prev) => (activeDeck.length > 0 ? (prev - 1 + activeDeck.length) % activeDeck.length : 0))
    }, 150)
  }

  const handleMarkMastered = (cardId, currentMastered) => {
    const updatedDeck = activeDeck.map(card => 
      card.id === cardId ? { ...card, mastered: !currentMastered } : card
    )
    setFlashcards({
      ...flashcards,
      [activeSubjectId]: updatedDeck
    })
  }

  const handleAddFlashcard = (e) => {
    e.preventDefault()
    if (!newQuestion.trim() || !newAnswer.trim()) return
    const newCard = {
      id: `fc-custom-${Date.now()}`,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      mastered: false
    }
    setFlashcards({
      ...flashcards,
      [activeSubjectId]: [...activeDeck, newCard]
    })
    setNewQuestion('')
    setNewAnswer('')
  }

  // --- Document/Material Uploader ---
  const [newDocTitle, setNewDocTitle] = useState('')
  const [newDocType, setNewDocType] = useState('Notes')
  const [newDocUrl, setNewDocUrl] = useState('')

  const handleAddDocument = (e) => {
    e.preventDefault()
    if (!newDocTitle.trim() || !activeSubjectId) return
    const customUrl = newDocUrl.trim() || 'https://developers.cloudflare.com/learning/'

    if (apiOnline) {
      fetch('http://localhost:4000/api/academics/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newDocTitle.trim(),
          url: customUrl,
          type: newDocType,
          subjectId: activeSubjectId
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // reload materials
          fetch(`http://localhost:4000/api/academics/materials?subject_id=${activeSubjectId}`)
            .then(res => res.json())
            .then(d => {
              if (d.success) setMaterials(d.materials)
            })
        }
      })
      .catch(err => {
        console.error('API add material failed, adding locally:', err)
        addLocalMaterial(newDocTitle.trim(), customUrl, newDocType)
      })
    } else {
      addLocalMaterial(newDocTitle.trim(), customUrl, newDocType)
    }

    setNewDocTitle('')
    setNewDocUrl('')
  }

  const addLocalMaterial = (title, url, type) => {
    const newDoc = {
      id: Date.now(),
      title,
      url,
      type
    }
    setMaterials([...materials, newDoc])
  }

  const deleteDocument = (docId) => {
    // Note: Local filter update, backend sync optional
    setMaterials(materials.filter(d => d.id !== docId))
  }

  // Filtering subjects on search
  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return subjects
    return subjects.filter(subj => 
      subj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subj.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subj.description && subj.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [searchQuery, subjects])

  // Categorize materials
  const categorizedMaterials = useMemo(() => {
    return {
      'Textbooks': materials.filter(m => m.type === 'Textbooks'),
      'Question Papers': materials.filter(m => m.type === 'Question Papers'),
      'Notes': materials.filter(m => m.type === 'Notes' || m.type === 'Lecture notes' || m.type === 'Reference' || m.type === 'Quick reference' || m.type === 'Cheat Sheet' || m.type === 'Template' || m.type === 'Rubric' || m.type === 'Reading list'),
    }
  }, [materials])

  const masteredCount = useMemo(() => activeDeck.filter(c => c.mastered).length, [activeDeck])
  const totalCards = activeDeck.length

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 3D Flip Card CSS Styles */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* Header Banner */}
      <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <Sparkles className="h-4 w-4" /> Academics Hub
            </p>
            <h1 className="text-3xl font-extrabold text-slate-800 font-sans">Academics Resources & Material Map</h1>
            <p className="max-w-2xl text-slate-500 text-sm leading-relaxed">
              Find reference guides, calculate your GPA, manage your daily study tasks, and practice with flashcards.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white w-64 transition duration-200"
              />
            </div>
            <Link to="/lost-found" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 transition shadow-sm hover:shadow">
              Lost & Found
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* --- STEP 1: Semester Select --- */}
        <div className="border-t border-slate-100 mt-6 pt-6">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-3">Step 1: Choose Semester</label>
          <div className="flex flex-wrap gap-2">
            {semesters.map((sem) => (
              <button
                key={sem.id}
                onClick={() => setActiveSemesterId(sem.id)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-200 border ${
                  activeSemesterId === sem.id
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {sem.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <section className="grid gap-8 lg:grid-cols-[330px_minmax(0,1fr)]">
        
        {/* Left Side Utilities: Navigation/Subjects, Tasks, GPA */}
        <aside className="space-y-8">
          
          {/* --- STEP 2: Subject Selector --- */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-slate-700">
              <Folder className="h-5 w-5 text-indigo-600" />
              <h2 className="font-bold text-lg">Step 2: Choose Subject</h2>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {filteredSubjects.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No matching subjects found.</p>
              ) : (
                filteredSubjects.map((subject) => (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => setActiveSubjectId(subject.id)}
                    className={`w-full rounded-2xl border p-3.5 text-left transition duration-200 ${
                      subject.id === activeSubjectId 
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold shadow-sm' 
                        : 'border-slate-100 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{subject.name}</span>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {subject.code}
                      </span>
                    </div>
                    {subject.description && (
                      <p className="mt-1 text-xs text-slate-400 line-clamp-1 leading-normal">{subject.description}</p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Academic Tasks Tracker */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-indigo-600" />
                Study Planner
              </h3>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">
                {tasks.filter(t => !t.completed).length} to-do
              </span>
            </div>

            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                placeholder="New study task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="flex-grow px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50 focus:bg-white"
              />
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className="px-2 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none bg-slate-50"
              >
                <option value="Math">Math</option>
                <option value="Physics">Physics</option>
                <option value="English">English</option>
                <option value="General">Gen</option>
              </select>
              <button type="submit" className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition">
                <Plus className="h-4 w-4" />
              </button>
            </form>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No tasks planned. Add one above!</p>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 transition bg-slate-50/20">
                    <div className="flex items-center gap-2.5 min-w-0 cursor-pointer" onClick={() => toggleTask(task.id)}>
                      <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center transition-all ${
                        task.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {task.completed && <Check className="h-3 w-3" />}
                      </div>
                      <span className={`text-xs font-medium truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {task.text}
                      </span>
                    </div>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Semester GPA Calculator */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Eye className="h-5 w-5 text-indigo-600" />
              GPA Calculator
            </h3>
            
            <form onSubmit={handleAddGpaCourse} className="space-y-2">
              <input
                type="text"
                placeholder="Course (e.g. Calculus I)"
                value={gpaCourseName}
                onChange={(e) => setGpaCourseName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none bg-slate-50/50 focus:bg-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Grade</label>
                  <select
                    value={gpaGrade}
                    onChange={(e) => setGpaGrade(e.target.value)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none bg-slate-50"
                  >
                    {Object.keys(gradePoints).map(g => (
                      <option key={g} value={g}>{g} ({gradePoints[g]})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={gpaCredits}
                    onChange={(e) => setGpaCredits(Number(e.target.value))}
                    className="w-full px-2 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none bg-slate-50"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-1">
                <PlusCircle className="h-3.5 w-3.5" /> Add Course
              </button>
            </form>

            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {gpaCourses.map(course => (
                <div key={course.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg text-xs">
                  <div>
                    <span className="font-bold text-slate-700">{course.name}</span>
                    <span className="text-slate-400 ml-1.5">({course.credits} cr)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-indigo-700">{course.grade}</span>
                    <button 
                      onClick={() => deleteGpaCourse(course.id)}
                      className="text-slate-400 hover:text-red-500 p-0.5 rounded transition"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Estimated GPA</p>
                <p className="text-2xl font-extrabold text-slate-800">{calculatedGPA}</p>
              </div>
              <div className="bg-indigo-50 px-3 py-1.5 rounded-xl text-[10px] text-indigo-700 font-semibold">
                {gpaCourses.reduce((sum, c) => sum + c.credits, 0)} Total Credits
              </div>
            </div>
          </div>
          
          <div className="rounded-3xl border border-slate-200 bg-white p-5 text-xs text-slate-500">
            <p className="font-bold text-slate-800">Support Desk</p>
            <p className="mt-2 leading-relaxed">Need custom documentation? Contact the team at <a className="text-indigo-600 hover:underline font-semibold" href={`mailto:${contactMail}`}>{contactMail}</a>.</p>
          </div>

        </aside>

        {/* Right Side Content Area: STEP 3: Material List */}
        <div className="space-y-8">
          
          {activeSubject ? (
            <div className="space-y-6">
              
              {/* Subject Description Header */}
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Step 3: Access Materials</p>
                  <h2 className="text-2xl font-bold text-slate-800">{activeSubject.name}</h2>
                  {activeSubject.description && (
                    <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{activeSubject.description}</p>
                  )}
                </div>
              </div>

              {/* Categorized materials lists */}
              <div className="space-y-8">
                {Object.keys(categorizedMaterials).map((categoryName) => {
                  const items = categorizedMaterials[categoryName]
                  return (
                    <div key={categoryName} className="space-y-3">
                      <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        {categoryName} ({items.length})
                      </h3>
                      
                      {items.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center text-xs text-slate-400">
                          No {categoryName.toLowerCase()} uploaded for this subject yet.
                        </div>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                          {items.map((doc) => (
                            <article key={doc.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between group">
                              <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{doc.type}</span>
                                  <h4 className="text-sm font-bold text-slate-800 mt-2">{doc.title}</h4>
                                </div>
                                <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition shrink-0">
                                  <BookOpen className="h-4 w-4" />
                                </div>
                              </div>
                              
                              <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                                <button 
                                  onClick={() => deleteDocument(doc.id)} 
                                  className="text-slate-400 hover:text-red-500 transition-colors"
                                  title="Delete resource"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                                <a href={doc.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800">
                                  Open File <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                                </a>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Add Custom Document form */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm mb-4">Add Study Resource Link</h3>
                <form onSubmit={handleAddDocument} className="grid gap-4 md:grid-cols-3 items-end">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Document Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Syllabus, Lecture Notes"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none bg-slate-50/50 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Resource Type</label>
                    <select
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value)}
                      className="w-full px-2.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none bg-slate-50 cursor-pointer"
                    >
                      <option value="Notes">Notes</option>
                      <option value="Textbooks">Textbooks</option>
                      <option value="Question Papers">Question Papers</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Document URL (Optional)</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://..."
                        value={newDocUrl}
                        onChange={(e) => setNewDocUrl(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none bg-slate-50/50 focus:bg-white"
                      />
                      <button type="submit" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shrink-0">
                        <Plus className="h-4 w-4" /> Add
                      </button>
                    </div>
                  </div>
                </form>
              </div>

            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-400">
              Select a subject from the left panel to explore resources.
            </div>
          )}

          {/* Flashcards Practice Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  <HelpCircle className="h-3 w-3" /> Study Tool
                </span>
                <h3 className="text-xl font-bold text-slate-800 mt-1">Interactive Flashcards</h3>
                <p className="text-xs text-slate-400">Flip cards to test your academic knowledge.</p>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-4">
                <div className="text-xs">
                  <span className="text-slate-400">Mastery: </span>
                  <span className="font-extrabold text-slate-700">{masteredCount} / {totalCards}</span>
                </div>
                <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${totalCards > 0 ? (masteredCount / totalCards) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {activeDeck.length === 0 ? (
              <div className="h-64 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-50/50">
                <HelpCircle className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-sm font-semibold">No flashcards in this subject yet</p>
                <p className="text-xs mt-1">Use the creator below to add your first flashcard!</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-6">
                
                {/* 3D Flashcard */}
                <div 
                  className="w-full max-w-lg h-60 perspective-1000 cursor-pointer"
                  onClick={handleFlip}
                >
                  <div className={`w-full h-full relative transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    
                    {/* Front side */}
                    <div className="absolute inset-0 bg-white border-2 border-indigo-100 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition backface-hidden">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Question {currentCardIndex + 1} of {activeDeck.length}</span>
                        {activeDeck[currentCardIndex]?.mastered && (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="h-3 w-3" /> Mastered
                          </span>
                        )}
                      </div>
                      <div className="text-center py-4">
                        <p className="text-xl font-bold text-slate-800 leading-relaxed">
                          {activeDeck[currentCardIndex]?.question}
                        </p>
                      </div>
                      <div className="flex justify-center items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase">
                        <RotateCw className="h-3.5 w-3.5" /> Tap Card to Reveal Answer
                      </div>
                    </div>

                    {/* Back side */}
                    <div className="absolute inset-0 bg-indigo-50 border-2 border-indigo-200 rounded-3xl p-8 flex flex-col justify-between shadow-sm rotate-y-180 backface-hidden">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Answer</span>
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">Flipped</span>
                      </div>
                      <div className="text-center py-4">
                        <p className="text-lg font-extrabold text-slate-800 leading-relaxed">
                          {activeDeck[currentCardIndex]?.answer}
                        </p>
                      </div>
                      <div className="flex justify-center items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase">
                        <RotateCw className="h-3.5 w-3.5 text-indigo-500" /> Tap to Flip Back
                      </div>
                    </div>

                  </div>
                </div>

                {/* Card Controls */}
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handlePrevCard}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => handleMarkMastered(activeDeck[currentCardIndex].id, activeDeck[currentCardIndex].mastered)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 ${
                      activeDeck[currentCardIndex]?.mastered
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {activeDeck[currentCardIndex]?.mastered ? 'Move to practice' : 'Mark as Mastered!'}
                  </button>
                  <button 
                    onClick={handleNextCard}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition"
                  >
                    Next Card
                  </button>
                </div>
              </div>
            )}

            {/* Custom card creator form */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6">
              <h4 className="font-bold text-slate-800 text-xs mb-3">Create Custom Flashcard</h4>
              <form onSubmit={handleAddFlashcard} className="grid gap-4 sm:grid-cols-2 items-end">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Question</label>
                  <input
                    type="text"
                    placeholder="e.g., What is key-value store?"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none bg-white focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Answer</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., A database storing data in key-value pairs"
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none bg-white focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                    <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shrink-0">
                      Add Card
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          {/* Quick guide on using resources */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-800">How to use this resource map</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Click a subject name in the left syllabus to filter folders. Study checklists and flashcards update automatically to match your active subject context. Upload guides locally to compile a central dashboard.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/lost-found" className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-5 py-3 text-sm font-bold text-white transition shadow-sm hover:shadow">Go to Lost & Found</Link>
              <a className="rounded-2xl border border-slate-200 hover:bg-slate-50 px-5 py-3 text-sm font-bold text-slate-600 transition" href={`mailto:${contactMail}`}>Email the team</a>
            </div>
          </div>

        </div>

      </section>
    </div>
  )
}

export default AcademicsResources
