import fs from 'fs';
import path from 'path';
import { Exam, Question, QuestionStudentView, AnswerVerification, ExamAttempt, ExamResult, StudentResponse } from './types';
import { calculateExamScore } from './scoring';

const DATA_DIR = path.join(process.cwd(), 'data');
const TMP_DIR = '/tmp';

// Resilient filesystem helpers for serverless environments (e.g. Vercel)
function safeWriteJson(filename: string, data: any) {
  // 1. Try local data dir (works in local dev / persistent disk)
  try {
    fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
  } catch (e) {
    // Expected on Vercel read-only filesystem (/var/task)
  }

  // 2. Try /tmp (guaranteed writable in AWS Lambda / Vercel Serverless)
  try {
    if (fs.existsSync(TMP_DIR)) {
      fs.writeFileSync(path.join(TMP_DIR, filename), JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.warn(`[db] Notice: Could not write to ${TMP_DIR}/${filename}:`, e);
  }
}

function safeReadJson(filename: string): any | null {
  // 1. Check /tmp first for newest serverless writes
  try {
    const tmpPath = path.join(TMP_DIR, filename);
    if (fs.existsSync(tmpPath)) {
      return JSON.parse(fs.readFileSync(tmpPath, 'utf-8'));
    }
  } catch (e) {}

  // 2. Fallback to DATA_DIR (bundled with deployment)
  try {
    const dataPath = path.join(DATA_DIR, filename);
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
  } catch (e) {}

  return null;
}

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
let isInitialized = false;

// Ensure data directory exists if possible
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {}

// Load data into cache
export function initDb() {
  if (isInitialized && cachedQuestions['achiever_minor_test_02'] && cachedQuestions['achiever_minor_test_02'].length > 0) {
    return;
  }

  // Load Achiever questions
  const achieverData = safeReadJson('achiever_minor_test_02_questions.json');
  if (achieverData && Array.isArray(achieverData)) {
    cachedQuestions['achiever_minor_test_02'] = achieverData;
  }

  // Load Biology Diwali questions
  const bioData = safeReadJson('biology_diwali_questions.json');
  if (bioData && Array.isArray(bioData)) {
    cachedQuestions['biology_diwali_assignment'] = bioData;

    // Build chapters list
    const chapterMap = new Map<number, { name: string; count: number }>();
    for (const q of bioData) {
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
  }

  // Load Verifications
  const verData = safeReadJson('answer_verification.json');
  if (verData) {
    cachedVerifications = verData;
  }

  // Load Attempts
  const attemptsData = safeReadJson('attempts.json');
  if (attemptsData) {
    cachedAttempts = { ...cachedAttempts, ...attemptsData };
  }

  // Load Results
  const resultsData = safeReadJson('results.json');
  if (resultsData) {
    cachedResults = { ...cachedResults, ...resultsData };
  }

  // Load Exam Config
  const examsConfig = safeReadJson('exams_config.json');
  if (examsConfig) {
    cachedExams = { ...cachedExams, ...examsConfig };
  }

  isInitialized = true;
}

// Initialize on import
initDb();

export function getExams(): Exam[] {
  initDb();
  return Object.values(cachedExams);
}

export function getExam(id: string): Exam | null {
  initDb();
  return cachedExams[id] || DEFAULT_EXAMS[id] || null;
}

export function updateExamConfig(id: string, updates: Partial<Exam>): Exam | null {
  initDb();
  if (!cachedExams[id]) return null;
  cachedExams[id] = { ...cachedExams[id], ...updates };
  safeWriteJson('exams_config.json', cachedExams);
  return cachedExams[id];
}

// Student Questions API strictly strips answer keys and solutions!
export function getStudentQuestions(examId: string, chapterIndex?: number): QuestionStudentView[] {
  initDb();
  let list = cachedQuestions[examId] || [];
  if (chapterIndex && chapterIndex > 0) {
    list = list.filter(q => (q.chapterIndex === chapterIndex || (q as any).chapter_index === chapterIndex));
  }

  return list.map(q => ({
    id: q.id,
    examId: q.examId || (q as any).exam_id,
    subject: q.subject,
    chapterIndex: q.chapterIndex || (q as any).chapter_index,
    chapterName: q.chapterName || (q as any).chapter_name,
    questionNumber: q.questionNumber || (q as any).question_number,
    questionType: q.questionType || (q as any).question_type || 'mcq',
    questionText: q.questionText || (q as any).question_text || '',
    options: q.options || [],
    optionImages: q.optionImages || (q as any).option_images,
    imageUrl: q.imageUrl || (q as any).image_url || '',
    matchData: q.matchData || (q as any).match_data,
    tableData: q.tableData || (q as any).table_data
  }));
}

// Admin Questions API includes full details
export function getAdminQuestions(examId: string): Question[] {
  initDb();
  return cachedQuestions[examId] || [];
}

export function updateQuestion(id: string, updates: Partial<Question>): Question | null {
  initDb();
  for (const examId of Object.keys(cachedQuestions)) {
    const list = cachedQuestions[examId];
    const idx = list.findIndex(q => q.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      const filename = examId === 'achiever_minor_test_02' ? 'achiever_minor_test_02_questions.json' : 'biology_diwali_questions.json';
      safeWriteJson(filename, list);
      return list[idx];
    }
  }
  return null;
}

// Answer Verifications
export function getVerifications(): AnswerVerification[] {
  initDb();
  return Object.values(cachedVerifications);
}

export function getVerification(questionId: string): AnswerVerification | null {
  initDb();
  return cachedVerifications[questionId] || null;
}

export function updateVerification(questionId: string, updates: Partial<AnswerVerification>): AnswerVerification | null {
  initDb();
  if (!cachedVerifications[questionId]) return null;
  cachedVerifications[questionId] = {
    ...cachedVerifications[questionId],
    ...updates,
    reviewedByAdmin: true
  };
  safeWriteJson('answer_verification.json', cachedVerifications);
  return cachedVerifications[questionId];
}

// Attempts and Submissions
export function createAttempt(examId: string, studentName: string, studentEmail: string, chapterIndex?: number): ExamAttempt {
  initDb();
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
  initDb();
  return cachedAttempts[attemptId] || null;
}

export function saveResponse(attemptId: string, questionId: string, response: StudentResponse): boolean {
  initDb();
  const attempt = cachedAttempts[attemptId];
  if (!attempt || attempt.isSubmitted) return false;
  attempt.responses[questionId] = response;
  saveAttempts();
  return true;
}

export function submitExamAttempt(
  attemptId: string,
  timeSpentSeconds: number,
  finalResponses?: Record<string, StudentResponse>,
  examId?: string,
  studentName?: string,
  studentEmail?: string,
  chapterIndex?: number
): ExamResult | null {
  initDb();

  let attempt = cachedAttempts[attemptId];
  if (!attempt) {
    // In serverless environments (Vercel), requests can hit a different lambda instance or cold container.
    // Reconstitute the attempt dynamically so evaluation never fails.
    const resolvedExamId = examId || 'achiever_minor_test_02';
    attempt = {
      id: attemptId,
      examId: resolvedExamId,
      studentName: studentName || 'Candidate',
      studentEmail: studentEmail || 'candidate@nta-neet.ac.in',
      selectedChapterIndex: chapterIndex,
      startTime: new Date(Date.now() - (timeSpentSeconds || 0) * 1000).toISOString(),
      timeSpentSeconds: timeSpentSeconds || 0,
      isSubmitted: false,
      responses: finalResponses || {}
    };
    cachedAttempts[attemptId] = attempt;
  }

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
  const exam = cachedExams[attempt.examId] || DEFAULT_EXAMS[attempt.examId] || DEFAULT_EXAMS['achiever_minor_test_02'];
  let questions = cachedQuestions[attempt.examId] || [];

  // Fallback: If questions not yet loaded in this lambda container, force re-read
  if (questions.length === 0) {
    const filename = attempt.examId === 'achiever_minor_test_02' ? 'achiever_minor_test_02_questions.json' : 'biology_diwali_questions.json';
    const loaded = safeReadJson(filename);
    if (loaded && Array.isArray(loaded)) {
      questions = loaded;
      cachedQuestions[attempt.examId] = loaded;
    }
  }

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
  initDb();
  if (cachedResults[attemptId]) {
    return cachedResults[attemptId];
  }
  const diskResults = safeReadJson('results.json');
  if (diskResults && diskResults[attemptId]) {
    cachedResults[attemptId] = diskResults[attemptId];
    return diskResults[attemptId];
  }
  return null;
}

export function storeResult(result: ExamResult): void {
  initDb();
  cachedResults[result.attemptId] = result;
  saveResults();
}

export function getAllResults(): ExamResult[] {
  initDb();
  return Object.values(cachedResults).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

function saveAttempts() {
  safeWriteJson('attempts.json', cachedAttempts);
}

function saveResults() {
  safeWriteJson('results.json', cachedResults);
}


