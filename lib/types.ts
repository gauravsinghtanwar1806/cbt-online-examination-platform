export type PaletteStatus = 
  | 'not_visited'          // Grey
  | 'not_answered'         // Red
  | 'answered'             // Green
  | 'marked_for_review'    // Purple
  | 'answered_and_marked'; // Green with purple indicator

export type QuestionType = 'mcq' | 'assertion_reason' | 'statement_based' | 'match_following' | 'diagram_based';

export type VerificationStatus = 
  | 'VERIFIED_MATCH'
  | 'KEY_MISMATCH'
  | 'AI_UNCERTAIN'
  | 'OCR_UNCERTAIN'
  | 'MISSING_ANSWER_KEY'
  | 'MANUAL_REVIEW_REQUIRED';

export interface MarkingScheme {
  correctMarks: number;     // e.g. +4
  incorrectMarks: number;   // e.g. -1
  unattemptedMarks: number; // e.g. 0
}

export interface SubjectInfo {
  id: string;
  name: string;
  questionStart: number;
  questionEnd: number;
}

export interface ChapterInfo {
  id: string;
  index: number;
  name: string;
  questionCount: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  sourcePdf: string;
  totalQuestions: number;
  durationMinutes: number;
  isPublished: boolean;
  subjects?: SubjectInfo[];
  chapters?: ChapterInfo[];
  markingScheme: MarkingScheme;
}

export interface Question {
  id: string;
  examId: string;
  subject: string;
  chapterIndex?: number;
  chapterName?: string;
  questionNumber: number;
  questionType: QuestionType;
  questionText: string;
  options: string[];
  optionImages?: string[];
  imageUrl?: string;
  officialAnswer?: number;
  solutionText?: string;
  solutionFinalAnswer?: number;
  sourcePdf: string;
  sourcePage: number;
}

// Student view has NO correct answers or solutions
export interface QuestionStudentView {
  id: string;
  examId: string;
  subject: string;
  chapterIndex?: number;
  chapterName?: string;
  questionNumber: number;
  questionType: QuestionType;
  questionText: string;
  options: string[];
  optionImages?: string[];
  imageUrl?: string;
}

export interface AnswerVerification {
  questionId: string;
  examId: string;
  chapterIndex?: number;
  chapterName?: string;
  questionNumber: number;
  subject: string;
  pdfAnswer: number;
  verifiedAnswer: number | null;
  approvedAnswer: number;
  status: VerificationStatus;
  notes: string;
  reviewedByAdmin: boolean;
}

export interface StudentResponse {
  questionId: string;
  selectedOption: number | null; // 1, 2, 3, 4 or null
  isMarkedForReview: boolean;
  paletteState: PaletteStatus;
}

export interface SubjectScore {
  subject: string;
  total: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  positiveMarks: number;
  negativeMarks: number;
  score: number;
  accuracy: number;
}

export interface QuestionResultAnalysis {
  questionId: string;
  questionNumber: number;
  subject: string;
  chapterName?: string;
  questionText: string;
  options: string[];
  optionImages?: string[];
  imageUrl?: string;
  selectedOption: number | null;
  approvedAnswer: number;
  isCorrect: boolean;
  isAttempted: boolean;
  marksAwarded: number;
  solutionText?: string;
  solutionImageUrl?: string;
  verificationStatus: VerificationStatus;
}

export interface ExamResult {
  attemptId: string;
  examId: string;
  examTitle: string;
  studentName: string;
  studentEmail: string;
  selectedChapterName?: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattemptedQuestions: number;
  positiveMarks: number;
  negativeMarks: number;
  finalScore: number;
  maximumMarks: number;
  percentage: number;
  accuracy: number;
  timeSpentSeconds: number;
  submittedAt: string;
  subjectPerformance: Record<string, SubjectScore>;
  questionsAnalysis: QuestionResultAnalysis[];
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentName: string;
  studentEmail: string;
  selectedChapterIndex?: number;
  startTime: string;
  timeSpentSeconds: number;
  isSubmitted: boolean;
  submittedAt?: string;
  responses: Record<string, StudentResponse>;
}

