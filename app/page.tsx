'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, Award, ShieldCheck, CheckCircle2, ChevronRight, AlertCircle, User, ArrowRight, Settings } from 'lucide-react';
import { Exam, ChapterInfo } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Registration Modal State
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/exams');
      const data = await res.json();
      if (data.success) {
        setExams(data.exams);
      }
    } catch (e) {
      console.error('Failed to load exams', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStartClick = (exam: Exam) => {
    setSelectedExam(exam);
    setSelectedChapter('all');
    setErrorMsg('');
    setShowModal(true);
  };

  const handleStartExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentEmail.trim()) {
      setErrorMsg('Please enter both your name and email address to begin.');
      return;
    }

    if (!selectedExam) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload: any = {
        examId: selectedExam.id,
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim(),
      };

      if (selectedExam.id === 'biology_diwali_assignment' && selectedChapter !== 'all') {
        payload.chapterIndex = Number(selectedChapter);
      }

      const res = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.attempt) {
        // Store in localStorage for session restoration
        localStorage.setItem(`cbt_attempt_${selectedExam.id}`, JSON.stringify(data.attempt));
        // Redirect to exam screen
        const url = selectedChapter !== 'all' 
          ? `/exam/${selectedExam.id}?attemptId=${data.attempt.id}&chapter=${selectedChapter}`
          : `/exam/${selectedExam.id}?attemptId=${data.attempt.id}`;
        router.push(url);
      } else {
        setErrorMsg(data.error || 'Failed to start examination attempt.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error starting examination.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Banner & Navigation */}
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-400 text-blue-950 font-bold p-2.5 rounded-lg shadow text-xl tracking-wider">
              NTA NEET
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Computer-Based Test (CBT) Portal</h1>
              <p className="text-xs text-blue-200">National Testing Agency NEET Standards • Online Examination Engine</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/admin"
              className="inline-flex items-center space-x-2 px-3.5 py-2 text-sm font-medium bg-blue-800 hover:bg-blue-700 rounded-lg transition border border-blue-600 shadow-sm"
            >
              <Settings className="w-4 h-4 text-amber-300" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Welcome & Instructions Card */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Available Official Examinations</h2>
              <p className="text-sm text-slate-600">Select an assessment below to launch the proctored computer-based test interface.</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-green-500 inline-block"></span>
                <span>Correct: +4 Marks</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-red-500 inline-block"></span>
                <span>Incorrect: -1 Mark</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-slate-300 inline-block"></span>
                <span>Unattempted: 0 Marks</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-xs text-slate-600">
            <div className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Auto-Saving:</strong> Every answer selection is instantly saved and synced to the secure server.</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span><strong>Session Protection:</strong> Accidental refresh or network loss restores your progress automatically.</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span><strong>Instant Analytics:</strong> Receive subject-wise breakdown, percentage, accuracy, and detailed solutions.</span>
            </div>
          </div>
        </section>

        {/* Examination Cards */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900 mx-auto"></div>
            <p className="mt-4 text-sm text-slate-600">Loading examinations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold tracking-wide uppercase">
                      {exam.id === 'achiever_minor_test_02' ? 'Full Mock Test' : 'Chapter Question Bank'}
                    </span>
                    <span className="flex items-center text-xs text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {exam.durationMinutes} Minutes
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">{exam.title}</h3>
                  <p className="text-sm text-slate-600 mb-5 leading-relaxed">{exam.description}</p>

                  {/* Subject or Chapter coverage pills */}
                  {exam.id === 'achiever_minor_test_02' && (
                    <div className="mb-6 space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject Coverage</p>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg font-medium">
                          <div className="text-slate-900 font-bold">Physics</div>
                          <div className="text-slate-500">Q 1–45 (45 Qs)</div>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg font-medium">
                          <div className="text-slate-900 font-bold">Chemistry</div>
                          <div className="text-slate-500">Q 46–90 (45 Qs)</div>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg font-medium">
                          <div className="text-slate-900 font-bold">Biology</div>
                          <div className="text-slate-500">Q 91–180 (90 Qs)</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {exam.id === 'biology_diwali_assignment' && (
                    <div className="mb-6 space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chapter Coverage</p>
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs text-slate-700 flex items-center justify-between">
                        <span><strong>28 Comprehensive Chapters</strong> (Plant Diversity, Ecology, Genetics, Physiology...)</span>
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">462 Total Questions</span>
                      </div>
                    </div>
                  )}

                  {/* Marking Scheme Summary */}
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-900 flex items-center justify-between">
                    <span>Marking: <strong>+{exam.markingScheme.correctMarks}</strong> correct / <strong>{exam.markingScheme.incorrectMarks}</strong> incorrect</span>
                    <span className="font-semibold">{exam.totalQuestions} Questions</span>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Source: <code className="text-slate-700 font-semibold">{exam.sourcePdf}</code>
                  </div>
                  <button
                    onClick={() => handleStartClick(exam)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-sm transition"
                  >
                    <span>Start Test</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Student Entry Modal */}
      {showModal && selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-blue-900 text-white p-6">
              <h3 className="text-lg font-bold">Candidate Registration</h3>
              <p className="text-xs text-blue-200 mt-1">Please enter your details to initiate your examination session.</p>
            </div>

            <form onSubmit={handleStartExam} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address / Roll ID
                </label>
                <input
                  type="email"
                  required
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              {/* If Biology Diwali Assignment, allow selecting chapter */}
              {selectedExam.id === 'biology_diwali_assignment' && selectedExam.chapters && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Scope
                  </label>
                  <select
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
                  >
                    <option value="all">Attempt All 28 Chapters (462 Questions)</option>
                    {selectedExam.chapters.map((ch) => (
                      <option key={ch.index} value={ch.index}>
                        Ch {ch.index}: {ch.name} ({ch.questionCount} Questions)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 space-y-1">
                <div><strong>Examination:</strong> {selectedExam.title}</div>
                <div><strong>Standard Duration:</strong> {selectedExam.durationMinutes} Minutes</div>
                <div><strong>Timer:</strong> Starts immediately upon launch. Auto-submits at 00:00:00.</div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold bg-blue-900 hover:bg-blue-800 text-white rounded-lg transition shadow flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Initializing...</span>
                    </>
                  ) : (
                    <span>Proceed to Test</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-xs text-center border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 NTA NEET Online CBT Examination Platform • All Rights Reserved</p>
          <p className="mt-1 text-slate-500">Official Allen Career Institute Test Series Data • Dual-Layer Answer Key Verification Engine</p>
        </div>
      </footer>
    </div>
  );
}

