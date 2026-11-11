'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  Award, CheckCircle2, XCircle, MinusCircle, Clock, Percent, 
  BarChart3, BookOpen, ArrowLeft, ChevronDown, ChevronUp, Filter, Home
} from 'lucide-react';
import { ExamResult, QuestionResultAnalysis } from '@/lib/types';

export default function ResultsPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(params);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadResult() {
      try {
        const res = await fetch(`/api/attempts/${attemptId}`);
        const data = await res.json();
        if (data.success && data.result) {
          setResult(data.result);
        } else {
          alert('Result could not be loaded.');
        }
      } catch (e) {
        console.error('Error fetching result:', e);
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [attemptId]);

  const toggleExpand = (qId: string) => {
    setExpandedQuestions(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const expandAll = () => {
    if (!result) return;
    const allExp: Record<string, boolean> = {};
    result.questionsAnalysis.forEach(q => { allExp[q.questionId] = true; });
    setExpandedQuestions(allExp);
  };

  const collapseAll = () => {
    setExpandedQuestions({});
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        <p className="mt-4 font-semibold text-slate-700">Compiling Evaluation & Official Solutions...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-xl font-bold text-slate-800">Result Not Found</h2>
        <p className="text-slate-500 text-sm mt-2">The requested examination attempt result does not exist or has expired.</p>
        <Link href="/" className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-semibold">
          Return to Portal
        </Link>
      </div>
    );
  }

  // Format Time
  const minutes = Math.floor(result.timeSpentSeconds / 60);
  const seconds = result.timeSpentSeconds % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  // Unique Subjects for filter
  const subjectsList = ['all', ...Array.from(new Set(result.questionsAnalysis.map(q => q.subject).filter(Boolean)))];

  // Filtered Questions
  const filteredQuestions = result.questionsAnalysis.filter(q => {
    if (filterSubject !== 'all' && q.subject !== filterSubject) return false;
    if (filterStatus === 'correct') return q.isCorrect;
    if (filterStatus === 'incorrect') return q.isAttempted && !q.isCorrect;
    if (filterStatus === 'unattempted') return !q.isAttempted;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Banner */}
      <header className="bg-blue-900 text-white shadow py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-extrabold bg-amber-400 text-blue-950 uppercase">
                Official Scorecard
              </span>
              <h1 className="text-xl font-bold">{result.examTitle}</h1>
            </div>
            <p className="text-xs text-blue-200 mt-1">
              Candidate: <span className="font-semibold text-white">{result.studentName}</span> ({result.studentEmail})
              {result.selectedChapterName && ` • Scope: ${result.selectedChapterName}`}
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-800 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition border border-blue-600 shadow-sm"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Portal Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8 flex-1">
        {/* Scorecard Hero Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Final Score */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 col-span-2 sm:col-span-1 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Final Score</span>
            <div className="my-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-950">
                {result.finalScore} <span className="text-base text-slate-400 font-semibold">/ {result.maximumMarks}</span>
              </div>
            </div>
            <span className="text-xs text-slate-500 font-medium">NEET Scoring (+4 / -1 / 0)</span>
          </div>

          {/* Percentage */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Percentage</span>
            <div className="my-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700">
                {result.percentage}%
              </div>
            </div>
            <span className="text-xs text-slate-500 font-medium">Of total possible marks</span>
          </div>

          {/* Accuracy */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accuracy</span>
            <div className="my-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-700">
                {result.accuracy}%
              </div>
            </div>
            <span className="text-xs text-slate-500 font-medium">Correct / Attempted</span>
          </div>

          {/* Question Breakdown */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Question Stats</span>
            <div className="my-2 space-y-1 text-xs">
              <div className="flex justify-between text-green-700 font-bold">
                <span>Correct:</span>
                <span>{result.correctAnswers}</span>
              </div>
              <div className="flex justify-between text-red-600 font-bold">
                <span>Incorrect:</span>
                <span>{result.incorrectAnswers}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Unattempted:</span>
                <span>{result.unattemptedQuestions}</span>
              </div>
            </div>
            <span className="text-xs text-slate-500 font-medium">Total: {result.totalQuestions} Questions</span>
          </div>

          {/* Time Taken */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 col-span-2 sm:col-span-1 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time Taken</span>
            <div className="my-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-800">
                {timeFormatted}
              </div>
            </div>
            <span className="text-xs text-slate-500 font-medium">Total active exam time</span>
          </div>
        </section>

        {/* Subject-Wise Performance Table */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-900" />
              <span>Subject-Wise & Section Performance Analysis</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 text-xs font-semibold uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Section / Subject</th>
                  <th className="px-4 py-3 text-center">Total</th>
                  <th className="px-4 py-3 text-center">Attempted</th>
                  <th className="px-4 py-3 text-center text-green-700">Correct</th>
                  <th className="px-4 py-3 text-center text-red-600">Incorrect</th>
                  <th className="px-4 py-3 text-center text-slate-500">Unattempted</th>
                  <th className="px-4 py-3 text-center">Accuracy</th>
                  <th className="px-6 py-3 text-right">Net Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.values(result.subjectPerformance).map((s) => (
                  <tr key={s.subject} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{s.subject}</td>
                    <td className="px-4 py-4 text-center font-medium">{s.total}</td>
                    <td className="px-4 py-4 text-center font-medium">{s.attempted}</td>
                    <td className="px-4 py-4 text-center font-bold text-green-700">+{s.correct}</td>
                    <td className="px-4 py-4 text-center font-bold text-red-600">-{s.incorrect}</td>
                    <td className="px-4 py-4 text-center text-slate-500">{s.unattempted}</td>
                    <td className="px-4 py-4 text-center font-semibold text-slate-700">{s.accuracy}%</td>
                    <td className="px-6 py-4 text-right font-extrabold text-blue-950 text-base">
                      {s.score} <span className="text-xs text-slate-400 font-normal">pts</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Detailed Question-by-Question Review */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-900" />
                <span>Question-by-Question Review & Detailed Explanations</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Review official answer keys, selected responses, and step-by-step derivations.</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={expandAll}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Status Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-500 uppercase mr-1">Status:</span>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-md font-semibold transition ${filterStatus === 'all' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                All ({result.totalQuestions})
              </button>
              <button
                onClick={() => setFilterStatus('correct')}
                className={`px-3 py-1 rounded-md font-semibold transition ${filterStatus === 'correct' ? 'bg-green-700 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
              >
                Correct ({result.correctAnswers})
              </button>
              <button
                onClick={() => setFilterStatus('incorrect')}
                className={`px-3 py-1 rounded-md font-semibold transition ${filterStatus === 'incorrect' ? 'bg-red-700 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
              >
                Incorrect ({result.incorrectAnswers})
              </button>
              <button
                onClick={() => setFilterStatus('unattempted')}
                className={`px-3 py-1 rounded-md font-semibold transition ${filterStatus === 'unattempted' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Unattempted ({result.unattemptedQuestions})
              </button>
            </div>

            {/* Subject Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-500 uppercase mr-1">Subject:</span>
              {subjectsList.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setFilterSubject(subj)}
                  className={`px-2.5 py-1 rounded-md font-semibold capitalize transition ${filterSubject === subj ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>

          {/* Question Cards List */}
          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const isExpanded = expandedQuestions[q.questionId] !== false; // default open

              let badgeBg = 'bg-slate-100 text-slate-700 border-slate-300';
              let badgeLabel = 'Unattempted (0)';
              if (q.isAttempted) {
                if (q.isCorrect) {
                  badgeBg = 'bg-green-100 text-green-800 border-green-300';
                  badgeLabel = 'Correct (+4.00)';
                } else {
                  badgeBg = 'bg-red-100 text-red-800 border-red-300';
                  badgeLabel = 'Incorrect (-1.00)';
                }
              }

              return (
                <div
                  key={q.questionId}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  {/* Card Header */}
                  <div
                    onClick={() => toggleExpand(q.questionId)}
                    className="p-4 sm:px-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-slate-900 text-sm sm:text-base">
                        Q{q.questionNumber}.
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                        {q.subject}
                      </span>
                      {q.chapterName && (
                        <span className="hidden md:inline-block px-2.5 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700">
                          {q.chapterName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${badgeBg}`}>
                        {badgeLabel}
                      </span>
                      <button className="text-slate-400 hover:text-slate-600">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Card Body */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 space-y-5">
                      {/* Diagram Image Crop */}
                      {(q.imageUrl || (q as any).image_url) && (
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white p-3 inline-block max-w-full">
                          <img
                            src={q.imageUrl || (q as any).image_url}
                            alt={`Question ${q.questionNumber}`}
                            className="max-h-[300px] w-auto object-contain mx-auto"
                          />
                        </div>
                      )}

                      {/* Question Text */}
                      <div className="text-sm sm:text-base text-slate-900 leading-relaxed font-semibold bg-slate-50/90 p-4 rounded-xl border border-slate-200">
                        {q.questionText || (q as any).question_text || (
                          <span className="text-slate-400 italic">Question statement</span>
                        )}
                      </div>

                      {/* Options with Answer Comparison */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Options:</p>
                        {q.options.map((optText, optIdx) => {
                          const optNum = optIdx + 1;
                          const isStudentSelected = q.selectedOption === optNum;
                          const isApprovedCorrect = q.approvedAnswer === optNum;

                          let optionClass = 'border-slate-200 bg-white text-slate-700';
                          if (isApprovedCorrect) {
                            optionClass = 'border-green-500 bg-green-50 text-green-950 font-semibold ring-1 ring-green-500';
                          } else if (isStudentSelected && !isApprovedCorrect) {
                            optionClass = 'border-red-500 bg-red-50 text-red-950 font-semibold ring-1 ring-red-500';
                          }

                          return (
                            <div
                              key={optNum}
                              className={`p-3 rounded-xl border flex items-start space-x-3 text-sm transition ${optionClass}`}
                            >
                              <div className="pt-0.5 shrink-0">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${
                                  isApprovedCorrect 
                                    ? 'bg-green-600 text-white' 
                                    : isStudentSelected 
                                      ? 'bg-red-600 text-white' 
                                      : 'bg-slate-200 text-slate-700'
                                }`}>
                                  {optNum}
                                </span>
                              </div>
                              <div className="flex-1 leading-snug">
                                {q.optionImages && q.optionImages[optIdx] ? (
                                  <div className="space-y-1">
                                    <img 
                                      src={q.optionImages[optIdx]} 
                                      alt={`Option (${optNum})`}
                                      className="max-h-20 w-auto rounded border border-slate-200 bg-white p-1"
                                    />
                                    {optText && !optText.startsWith("See Option") && (
                                      <div className="text-xs">{optText}</div>
                                    )}
                                  </div>
                                ) : (
                                  <span>{optText}</span>
                                )}
                              </div>
                              <div className="shrink-0 text-xs font-bold">
                                {isApprovedCorrect && (
                                  <span className="text-green-700 flex items-center space-x-1">
                                    <CheckCircle2 className="w-4 h-4 inline" />
                                    <span>Correct Answer</span>
                                  </span>
                                )}
                                {isStudentSelected && !isApprovedCorrect && (
                                  <span className="text-red-700 flex items-center space-x-1">
                                    <XCircle className="w-4 h-4 inline" />
                                    <span>Your Selection</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Detailed Solution / Explanation */}
                      {(q.solutionText || q.solutionImageUrl) && (
                        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs sm:text-sm text-slate-800 space-y-3">
                          <div className="font-bold text-amber-900 uppercase tracking-wide flex items-center space-x-1.5">
                            <BookOpen className="w-4 h-4" />
                            <span>Official Solution & Concept Derivation:</span>
                          </div>

                          {/* Original Solution Page Image (High-Fidelity Math & Formulas) */}
                          {q.solutionImageUrl && (
                            <div className="border border-amber-200/80 rounded-lg overflow-hidden bg-white shadow-sm p-2">
                              <p className="text-[11px] font-semibold text-amber-900/80 mb-1.5">Original Solution Book Diagram & Working:</p>
                              <img
                                src={q.solutionImageUrl}
                                alt={`Question ${q.questionNumber} Detailed Solution`}
                                className="max-h-96 w-auto max-w-full object-contain mx-auto rounded"
                                loading="lazy"
                              />
                            </div>
                          )}

                          {/* Solution Text / Transcription */}
                          {q.solutionText && (
                            <div className="whitespace-pre-line leading-relaxed font-mono text-slate-800 bg-white/70 p-3 rounded-lg border border-amber-100">
                              {q.solutionText}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-xs text-center border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 NTA NEET Online CBT Examination Platform</p>
        </div>
      </footer>
    </div>
  );
}

