import { Exam, Question, StudentResponse, AnswerVerification, ExamResult, SubjectScore, QuestionResultAnalysis } from './types';

export function calculateExamScore(
  exam: Exam,
  questions: Question[],
  verifications: Record<string, AnswerVerification>,
  responses: Record<string, StudentResponse>,
  attemptId: string,
  studentName: string,
  studentEmail: string,
  timeSpentSeconds: number,
  selectedChapterName?: string,
  solutionTexts: Record<string, string> = {}
): ExamResult {
  const marking = exam.markingScheme;
  const totalQuestions = questions.length;
  const maximumMarks = totalQuestions * marking.correctMarks;

  let attemptedCount = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  let positiveMarks = 0;
  let negativeMarks = 0;

  const subjectMap: Record<string, SubjectScore> = {};
  const questionsAnalysis: QuestionResultAnalysis[] = [];

  for (const q of questions) {
    const subj = q.subject || 'General';
    if (!subjectMap[subj]) {
      subjectMap[subj] = {
        subject: subj,
        total: 0,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        unattempted: 0,
        positiveMarks: 0,
        negativeMarks: 0,
        score: 0,
        accuracy: 0
      };
    }
    subjectMap[subj].total += 1;

    const resp = responses[q.id];
    const selectedOption = (resp && typeof resp.selectedOption === 'number') ? resp.selectedOption : null;
    const isAttempted = selectedOption !== null && selectedOption >= 1 && selectedOption <= 4;

    const ver = verifications[q.id];
    // Strict requirement: approved_answer is used for evaluation
    // Fallback order: ver.approvedAnswer -> ver.approved_answer -> q.officialAnswer -> q.official_answer -> 1
    const approvedAnswer: number = (
      (ver && typeof (ver as any).approvedAnswer === 'number') ? (ver as any).approvedAnswer :
      (ver && typeof (ver as any).approved_answer === 'number') ? (ver as any).approved_answer :
      (typeof (q as any).officialAnswer === 'number') ? (q as any).officialAnswer :
      (typeof (q as any).official_answer === 'number') ? (q as any).official_answer : 1
    );
    const verStatus = ver ? (ver.status || (ver as any).status || 'VERIFIED_MATCH') : 'VERIFIED_MATCH';

    let isCorrect = false;
    let marksAwarded = 0;

    if (isAttempted) {
      attemptedCount += 1;
      subjectMap[subj].attempted += 1;

      if (selectedOption === approvedAnswer) {
        isCorrect = true;
        correctCount += 1;
        subjectMap[subj].correct += 1;
        marksAwarded = marking.correctMarks;
        positiveMarks += marking.correctMarks;
        subjectMap[subj].positiveMarks += marking.correctMarks;
      } else {
        isCorrect = false;
        incorrectCount += 1;
        subjectMap[subj].incorrect += 1;
        const penalty = Math.abs(marking.incorrectMarks);
        marksAwarded = -penalty;
        negativeMarks += penalty;
        subjectMap[subj].negativeMarks += penalty;
      }
    } else {
      unattemptedCount += 1;
      subjectMap[subj].unattempted += 1;
      marksAwarded = marking.unattemptedMarks;
    }

    questionsAnalysis.push({
      questionId: q.id,
      questionNumber: q.questionNumber || (q as any).question_number,
      subject: subj,
      chapterName: q.chapterName || (q as any).chapter_name,
      questionText: q.questionText || (q as any).question_text || '',
      options: q.options || [],
      imageUrl: q.imageUrl || (q as any).image_url || '',
      matchData: q.matchData || (q as any).match_data,
      tableData: (q as any).tableData || (q as any).table_data,
      selectedOption: selectedOption,
      approvedAnswer: approvedAnswer,
      isCorrect: isCorrect,
      isAttempted: isAttempted,
      marksAwarded: marksAwarded,
      solutionText: solutionTexts[q.id] || (q as any).solution_text || (q as any).solutionText || undefined,
      solutionImageUrl: (q as any).solutionImageUrl || (q as any).solution_image_url || (`/images/achiever_solutions/sol_${q.questionNumber || (q as any).question_number}.png`),
      verificationStatus: verStatus
    });
  }

  // Calculate subject-wise score and accuracy
  for (const subj of Object.keys(subjectMap)) {
    const s = subjectMap[subj];
    s.score = s.positiveMarks - s.negativeMarks;
    s.accuracy = s.attempted > 0 ? Number(((s.correct / s.attempted) * 100).toFixed(1)) : 0;
  }

  const finalScore = positiveMarks - negativeMarks;
  const percentage = maximumMarks > 0 ? Number(((finalScore / maximumMarks) * 100).toFixed(2)) : 0;
  const accuracy = attemptedCount > 0 ? Number(((correctCount / attemptedCount) * 100).toFixed(1)) : 0;

  return {
    attemptId,
    examId: exam.id,
    examTitle: exam.title,
    studentName,
    studentEmail,
    selectedChapterName,
    totalQuestions,
    attemptedQuestions: attemptedCount,
    correctAnswers: correctCount,
    incorrectAnswers: incorrectCount,
    unattemptedQuestions: unattemptedCount,
    positiveMarks,
    negativeMarks,
    finalScore,
    maximumMarks,
    percentage,
    accuracy,
    timeSpentSeconds,
    submittedAt: new Date().toISOString(),
    subjectPerformance: subjectMap,
    questionsAnalysis
  };
}

