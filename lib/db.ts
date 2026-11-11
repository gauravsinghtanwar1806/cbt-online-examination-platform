import fs from 'fs';
import path from 'path';
import { Exam, Question, QuestionStudentView, AnswerVerification, ExamAttempt, ExamResult, StudentResponse } from './types';
import { calculateExamScore } from './scoring';

const DATA_DIR = path.join(process.cwd(), 'data');

// Default Exams Manifest
const DEFAULT_EXAMS: Record<string, Exam> = {
  achiever_minor_test_02: {
    id: 'achiever_minor_test_02',
    title: 'Achiever Minor Test 02',
    description: 'NTA NEET Full Mock Test covering Physics (Q1-45), Chemistry (Q46-90), and Biology (Q91-180). Includes numerical calculations, organic mechanisms, and anatomical diagrams.',
    sourcePdf: 'Achiever Minor Test 02.pdf',
    totalQuestions: 180,
    durationMinutes: 180,
    isPublished: true,
    subjects: [
      { id: 'physics', name: 'Physics', questionStart: 1, questionEnd: 45 },
      { id: 'chemistry', name: 'Chemistry', questionStart: 46, questionEnd: 90 },
      { id: 'biology', name: 'Biology', questionStart: 91, questionEnd: 180 }
    ],
    markingScheme: {
      correctMarks: 4.0,
      incorrectMarks: -1.0,
      unattemptedMarks: 0.0
    }
  },
  biology_diwali_assignment: {
    id: 'biology_diwali_assignment',
    title: 'Biology Diwali Assignment',
    description: 'Comprehensive 28-Chapter Question Bank for Pre-Medical NEET. Attempt specific individual chapters or take the complete subject test.',
    sourcePdf: 'Biology Diwali Assignment.pdf',
    totalQuestions: 462,
    durationMinutes: 200,
    isPublished: true,
    chapters: [], // populated dynamically from data
    markingScheme: {
      correctMarks: 4.0,
      incorrectMarks: -1.0,
      unattemptedMarks: 0.0
    }
  }
};

// In-memory cache for ultra-fast response
let cachedQuestions: Record<string, Question[]> = {};
let cachedVerifications: Record<string, AnswerVerification> = {};
let cachedAttempts: Record<string, ExamAttempt> = {};
let cachedResults: Record<string, ExamResult> = {};
let cachedExams: Record<string, Exam> = { ...DEFAULT_EXAMS };

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load data into cache
export function initDb() {
  // Load Achiever questions
  const achieverPath = path.join(DATA_DIR, 'achiever_minor_test_02_questions.json');
  if (fs.existsSync(achieverPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(achieverPath, 'utf-8'));
      cachedQuestions['achiever_minor_test_02'] = data;
    } catch (e) {
      console.error('Error loading achiever questions:', e);
    }
  }

  // Load Biology Diwali questions
  const bioPath = path.join(DATA_DIR, 'biology_diwali_questions.json');
  if (fs.existsSync(bioPath)) {
    try {
      const data: Question[] = JSON.parse(fs.readFileSync(bioPath, 'utf-8'));
      cachedQuestions['biology_diwali_assignment'] = data;

      // Build chapters list
      const chapterMap = new Map<number, { name: string; count: number }>();
      for (const q of data) {
        if (q.chapterIndex && q.chapterName) {
          const existing = chapterMap.get(q.chapterIndex);
          if (existing) {
            existing.count += 1;
          } else {
            chapterMap.set(q.chapterIndex, { name: q.chapterName, count: 1 });
          }
        }
      }

      const chaptersList = Array.from(chapterMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([index, info]) => ({
          id: `ch_${index}`,
          index,
          name: info.name,
          questionCount: info.count
        }));

      cachedExams['biology_diwali_assignment'].chapters = chaptersList;
    } catch (e) {
      console.error('Error loading biology questions:', e);
    }
  }

  // Load Verifications
  const verPath = path.join(DATA_DIR, 'answer_verification.json');
  if (fs.existsSync(verPath)) {
    try {
      cachedVerifications = JSON.parse(fs.readFileSync(verPath, 'utf-8'));
    } catch (e) {
      console.error('Error loading verifications:', e);
    }
  }

  // Load Attempts
  const attemptsPath = path.join(DATA_DIR, 'attempts.json');
  if (fs.existsSync(attemptsPath)) {
    try {
      cachedAttempts = JSON.parse(fs.readFileSync(attemptsPath, 'utf-8'));
    } catch (e) {
      console.error('Error loading attempts:', e);
    }
  }

  // Load Results
  const resultsPath = path.join(DATA_DIR, 'results.json');
  if (fs.existsSync(resultsPath)) {
    try {
      cachedResults = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
    } catch (e) {
      console.error('Error loading results:', e);
    }
  }

  // Load Exam Config
  const examsConfigPath = path.join(DATA_DIR, 'exams_config.json');
  if (fs.existsSync(examsConfigPath)) {
    try {
      const customExams = JSON.parse(fs.readFileSync(examsConfigPath, 'utf-8'));
      cachedExams = { ...cachedExams, ...customExams };
    } catch (e) {
      console.error('Error loading exam config:', e);
    }
  }
}

// Initialize on import
initDb();

export function getExams(): Exam[] {
  return Object.values(cachedExams);
}

export function getExam(id: string): Exam | null {
  return cachedExams[id] || null;
}

export function updateExamConfig(id: string, updates: Partial<Exam>): Exam | null {
  if (!cachedExams[id]) return null;
  cachedExams[id] = { ...cachedExams[id], ...updates };
  // Save to disk
  try {
    fs.writeFileSync(path.join(DATA_DIR, 'exams_config.json'), JSON.stringify(cachedExams, null, 2));
  } catch (e) {
    console.error('Error saving exams config:', e);
  }
  return cachedExams[id];
}

// Student Questions API strictly strips answer keys and solutions!
export function getStudentQuestions(examId: string, chapterIndex?: number): QuestionStudentView[] {
  let list = cachedQuestions[examId] || [];
  if (chapterIndex && chapterIndex > 0) {
    list = list.filter(q => q.chapterIndex === chapterIndex);
  }

  return list.map(q => ({
    id: q.id,
    examId: q.examId,
    subject: q.subject,
    chapterIndex: q.chapterIndex,
    chapterName: q.chapterName,
    questionNumber: q.questionNumber,
    questionType: q.questionType,
    questionText: q.questionText,
    options: q.options,
    imageUrl: q.imageUrl
  }));
}

// Admin Questions API includes full details
export function getAdminQuestions(examId: string): Question[] {
  return cachedQuestions[examId] || [];
}

export function updateQuestion(id: string, updates: Partial<Question>): Question | null {
  for (const examId of Object.keys(cachedQuestions)) {
    const list = cachedQuestions[examId];
    const idx = list.findIndex(q => q.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      // Save
      const filename = examId === 'achiever_minor_test_02' ? 'achiever_minor_test_02_questions.json' : 'biology_diwali_questions.json';
      try {
        fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(list, null, 2));
      } catch (e) {
        console.error('Error saving question update:', e);
      }
      return list[idx];
    }
  }
  return null;
}

// Answer Verifications
export function getVerifications(): AnswerVerification[] {
  return Object.values(cachedVerifications);
}

export function getVerification(questionId: string): AnswerVerification | null {
  return cachedVerifications[questionId] || null;
}

export function updateVerification(questionId: string, updates: Partial<AnswerVerification>): AnswerVerification | null {
  if (!cachedVerifications[questionId]) return null;
  cachedVerifications[questionId] = {
    ...cachedVerifications[questionId],
    ...updates,
    reviewedByAdmin: true
  };
  try {
    fs.writeFileSync(path.join(DATA_DIR, 'answer_verification.json'), JSON.stringify(cachedVerifications, null, 2));
  } catch (e) {
    console.error('Error saving verifications:', e);
  }
  return cachedVerifications[questionId];
}

// Attempts and Submissions
export function createAttempt(examId: string, studentName: string, studentEmail: string, chapterIndex?: number): ExamAttempt {
  const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const attempt: ExamAttempt = {
    id: attemptId,
    examId,
    studentName,
    studentEmail,
    selectedChapterIndex: chapterIndex,
    startTime: new Date().toISOString(),
    timeSpentSeconds: 0,
    isSubmitted: false,
    responses: {}
  };
  cachedAttempts[attemptId] = attempt;
  saveAttempts();
  return attempt;
}

export function getAttempt(attemptId: string): ExamAttempt | null {
  return cachedAttempts[attemptId] || null;
}

export function saveResponse(attemptId: string, questionId: string, response: StudentResponse): boolean {
  const attempt = cachedAttempts[attemptId];
  if (!attempt || attempt.isSubmitted) return false;
  attempt.responses[questionId] = response;
  saveAttempts();
  return true;
}

export function submitExamAttempt(attemptId: string, timeSpentSeconds: number, finalResponses?: Record<string, StudentResponse>): ExamResult | null {
  const attempt = cachedAttempts[attemptId];
  if (!attempt) return null;
  if (attempt.isSubmitted && cachedResults[attemptId]) {
    return cachedResults[attemptId];
  }

  if (finalResponses) {
    attempt.responses = { ...attempt.responses, ...finalResponses };
  }
  attempt.timeSpentSeconds = timeSpentSeconds;
  attempt.isSubmitted = true;
  attempt.submittedAt = new Date().toISOString();
  saveAttempts();

  // Evaluate
  const exam = cachedExams[attempt.examId];
  let questions = cachedQuestions[attempt.examId] || [];
  let selectedChapterName: string | undefined = undefined;

  if (attempt.selectedChapterIndex && attempt.selectedChapterIndex > 0) {
    questions = questions.filter(q => q.chapterIndex === attempt.selectedChapterIndex);
    if (questions.length > 0 && questions[0].chapterName) {
      selectedChapterName = questions[0].chapterName;
    }
  }

  // Extract solutions map
  const solutionsMap: Record<string, string> = {};
  for (const q of questions) {
    if ((q as any).solution_text) {
      solutionsMap[q.id] = (q as any).solution_text;
    }
  }

  const result = calculateExamScore(
    exam,
    questions,
    cachedVerifications,
    attempt.responses,
    attemptId,
    attempt.studentName,
    attempt.studentEmail,
    timeSpentSeconds,
    selectedChapterName,
    solutionsMap
  );

  cachedResults[attemptId] = result;
  saveResults();
  return result;
}

export function getResult(attemptId: string): ExamResult | null {
  return cachedResults[attemptId] || null;
}

export function getAllResults(): ExamResult[] {
  return Object.values(cachedResults).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

function saveAttempts() {
  try {
    fs.writeFileSync(path.join(DATA_DIR, 'attempts.json'), JSON.stringify(cachedAttempts, null, 2));
  } catch (e) {
    console.error('Error saving attempts:', e);
  }
}

function saveResults() {
  try {
    fs.writeFileSync(path.join(DATA_DIR, 'results.json'), JSON.stringify(cachedResults, null, 2));
  } catch (e) {
    console.error('Error saving results:', e);
  }
}
