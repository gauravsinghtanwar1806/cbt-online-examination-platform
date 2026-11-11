'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Clock, ShieldAlert, CheckCircle, ChevronLeft, ChevronRight, 
  Bookmark, RotateCcw, AlertTriangle, Send, Menu, X, User 
} from 'lucide-react';
import { QuestionStudentView, PaletteStatus, StudentResponse } from '@/lib/types';

export default function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: examId } = use(params);
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  const chapterParam = searchParams.get('chapter');
  const chapterIndex = chapterParam ? parseInt(chapterParam, 10) : undefined;

  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [examTitle, setExamTitle] = useState('');
  const [questions, setQuestions] = useState<QuestionStudentView[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, StudentResponse>>({});
  const [studentInfo, setStudentInfo] = useState<{ name: string; email: string }>({ name: 'Candidate', email: '' });
  
  // Timer State
  const [totalSeconds, setTotalSeconds] = useState(180 * 60);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  // Mobile Palette Toggle
  const [showMobilePalette, setShowMobilePalette] = useState(false);

  // Active Subject Filter tab (for Achiever: Physics, Chemistry, Biology)
  const [activeSubject, setActiveSubject] = useState<string>('All');

  // Accessibility & Interface controls
  const [fontSize, setFontSize] = useState<'text-sm' | 'text-base' | 'text-lg'>('text-base');
  const [paletteFilter, setPaletteFilter] = useState<'all' | 'answered' | 'not_answered' | 'marked'>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Keyboard Shortcuts Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input field
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === '1') handleSelectOption(1);
      else if (e.key === '2') handleSelectOption(2);
      else if (e.key === '3') handleSelectOption(3);
      else if (e.key === '4') handleSelectOption(4);
      else if (e.key.toLowerCase() === 'c') handleClearResponse();
      else if (e.key.toLowerCase() === 'm') handleMarkForReviewAndNext();
      else if (e.key.toLowerCase() === 's' || e.key === 'Enter') handleSaveAndNext();
      else if (e.key === 'ArrowLeft') handleNavigate(currentIndex - 1);
      else if (e.key === 'ArrowRight') handleNavigate(currentIndex + 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions, responses, timeSpent]);

  // Load questions and restore previous session
  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch questions
        const url = chapterIndex 
          ? `/api/exams/${examId}/questions?chapter=${chapterIndex}`
          : `/api/exams/${examId}/questions`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (!data.success || !data.questions || data.questions.length === 0) {
          alert('Failed to load examination questions.');
          router.push('/');
          return;
        }

        setExamTitle(data.examTitle || 'Examination');
        setQuestions(data.questions);

        // 2. Set timer duration
        const durationSec = (data.durationMinutes || 180) * 60;

        // 3. Check localStorage for session recovery
        const savedSessionKey = `cbt_session_${examId}_${attemptId || 'default'}`;
        const savedSession = localStorage.getItem(savedSessionKey);

        let initialResponses: Record<string, StudentResponse> = {};
        let initialTimeSpent = 0;

        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            initialResponses = parsed.responses || {};
            initialTimeSpent = parsed.timeSpent || 0;
            if (parsed.studentInfo) setStudentInfo(parsed.studentInfo);
          } catch (e) {
            console.error('Session restore error:', e);
          }
        } else {
          // Attempt info from home
          const attemptData = localStorage.getItem(`cbt_attempt_${examId}`);
          if (attemptData) {
            try {
              const parsed = JSON.parse(attemptData);
              setStudentInfo({ name: parsed.studentName, email: parsed.studentEmail });
            } catch (e) {}
          }
        }

        // Initialize state for each question if not already visited
        data.questions.forEach((q: QuestionStudentView, idx: number) => {
          if (!initialResponses[q.id]) {
            initialResponses[q.id] = {
              questionId: q.id,
              selectedOption: null,
              isMarkedForReview: false,
              paletteState: idx === 0 ? 'not_answered' : 'not_visited'
            };
          }
        });

        // Current question 0 is now visited
        if (data.questions.length > 0) {
          const firstId = data.questions[0].id;
          if (initialResponses[firstId].paletteState === 'not_visited') {
            initialResponses[firstId].paletteState = 'not_answered';
          }
        }

        setResponses(initialResponses);
        setTotalSeconds(Math.max(0, durationSec - initialTimeSpent));
        setTimeSpent(initialTimeSpent);

      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [examId, attemptId, chapterIndex, router]);

  // Timer Tick
  useEffect(() => {
    if (loading || isSubmitting) return;

    const timer = setInterval(() => {
      setTotalSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit when timer reaches 0
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });

      setTimeSpent((prev) => {
        const next = prev + 1;
        // Periodic sync to localStorage
        if (next % 5 === 0) {
          persistSession(next, responses);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isSubmitting, responses]);

  const persistSession = (currentSpent: number, currentResponses: Record<string, StudentResponse>) => {
    const savedSessionKey = `cbt_session_${examId}_${attemptId || 'default'}`;
    try {
      localStorage.setItem(savedSessionKey, JSON.stringify({
        timeSpent: currentSpent,
        responses: currentResponses,
        studentInfo
      }));
    } catch (e) {}
  };

  const handleSelectOption = (optionNum: number) => {
    if (questions.length === 0) return;
    const currentQ = questions[currentIndex];
    const prev = responses[currentQ.id];

    const nextState: PaletteStatus = prev.isMarkedForReview ? 'answered_and_marked' : 'answered';

    const updated = {
      ...responses,
      [currentQ.id]: {
        ...prev,
        selectedOption: optionNum,
        paletteState: nextState
      }
    };

    setResponses(updated);
    persistSession(timeSpent, updated);
    syncResponseToBackend(currentQ.id, optionNum, prev.isMarkedForReview, nextState);
  };

  const handleClearResponse = () => {
    if (questions.length === 0) return;
    const currentQ = questions[currentIndex];
    const prev = responses[currentQ.id];

    const nextState: PaletteStatus = prev.isMarkedForReview ? 'marked_for_review' : 'not_answered';

    const updated = {
      ...responses,
      [currentQ.id]: {
        ...prev,
        selectedOption: null,
        paletteState: nextState
      }
    };

    setResponses(updated);
    persistSession(timeSpent, updated);
    syncResponseToBackend(currentQ.id, null, prev.isMarkedForReview, nextState);
  };

  const handleMarkForReviewAndNext = () => {
    if (questions.length === 0) return;
    const currentQ = questions[currentIndex];
    const prev = responses[currentQ.id];

    const isMarked = true;
    const nextState: PaletteStatus = (prev.selectedOption !== null) 
      ? 'answered_and_marked' 
      : 'marked_for_review';

    const updated = {
      ...responses,
      [currentQ.id]: {
        ...prev,
        isMarkedForReview: isMarked,
        paletteState: nextState
      }
    };

    setResponses(updated);
    persistSession(timeSpent, updated);
    syncResponseToBackend(currentQ.id, prev.selectedOption, isMarked, nextState);

    // Navigate to next
    handleNavigate(currentIndex + 1);
  };

  const handleSaveAndNext = () => {
    if (questions.length === 0) return;
    const currentQ = questions[currentIndex];
    const prev = responses[currentQ.id];

    let nextState = prev.paletteState;
    if (prev.selectedOption !== null) {
      nextState = prev.isMarkedForReview ? 'answered_and_marked' : 'answered';
    } else {
      nextState = prev.isMarkedForReview ? 'marked_for_review' : 'not_answered';
    }

    const updated = {
      ...responses,
      [currentQ.id]: {
        ...prev,
        paletteState: nextState
      }
    };

    setResponses(updated);
    persistSession(timeSpent, updated);
    syncResponseToBackend(currentQ.id, prev.selectedOption, prev.isMarkedForReview, nextState);

    // Navigate to next
    handleNavigate(currentIndex + 1);
  };

  const handleNavigate = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= questions.length) return;
    const targetQ = questions[newIndex];
    
    // If target question is not visited, mark as not answered
    const targetPrev = responses[targetQ.id];
    if (targetPrev && targetPrev.paletteState === 'not_visited') {
      const nextPaletteState: PaletteStatus = 'not_answered';
      const updated: Record<string, StudentResponse> = {
        ...responses,
        [targetQ.id]: {
          ...targetPrev,
          paletteState: nextPaletteState
        }
      };
      setResponses(updated);
      persistSession(timeSpent, updated);
      syncResponseToBackend(targetQ.id, targetPrev.selectedOption, targetPrev.isMarkedForReview, nextPaletteState);
    }

    setCurrentIndex(newIndex);
  };

  const syncResponseToBackend = async (questionId: string, option: number | null, isMarked: boolean, paletteState: PaletteStatus) => {
    if (!attemptId) return;
    try {
      await fetch(`/api/attempts/${attemptId}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          selectedOption: option,
          isMarkedForReview: isMarked,
          paletteState
        })
      });
    } catch (e) {
      // Offline / network glitch handled via local persistence
    }
  };

  const handleAutoSubmit = () => {
    alert('Time limit reached! The examination is now being automatically evaluated and submitted.');
    executeSubmission();
  };

  const executeSubmission = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowSubmitModal(false);

    try {
      const effectiveAttemptId = attemptId || `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const payload = {
        timeSpentSeconds: timeSpent,
        responses,
        examId,
        studentName: studentInfo.name || 'Candidate',
        studentEmail: studentInfo.email || 'candidate@nta-neet.ac.in',
        chapterIndex: chapterIndex ? Number(chapterIndex) : undefined
      };

      console.log('[Exam Page] Submitting examination:', { attemptId: effectiveAttemptId, payload });

      const res = await fetch(`/api/attempts/${effectiveAttemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.result) {
        // Save result directly in localStorage for instant offline/cold-start reliability
        try {
          localStorage.setItem(`cbt_result_${data.result.attemptId}`, JSON.stringify(data.result));
        } catch (e) {}

        // Clear active session storage
        try {
          localStorage.removeItem(`cbt_session_${examId}_${attemptId || 'default'}`);
        } catch (e) {}

        // Redirect to results
        router.push(`/results/${data.result.attemptId}`);
      } else {
        const errMsg = data.error || (data.details ? `${data.error}: ${data.details}` : 'Submission failed. Please try again.');
        alert(errMsg);
        setIsSubmitting(false);
      }
    } catch (e: any) {
      alert(e.message || 'Submission error. Please verify your connection.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        <p className="mt-4 font-semibold text-slate-700">Loading NTA CBT Examination Environment...</p>
        <p className="text-xs text-slate-500 mt-1">Configuring question palette, timer, and auto-sync</p>
      </div>
    );
  }

  // Current Question
  const currentQ = questions[currentIndex] || null;
  const currentResp = currentQ ? responses[currentQ.id] : null;
  const selectedOption = currentResp?.selectedOption ?? null;

  // Format Timer HH:MM:SS
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const timeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Counts for Palette Legend
  let answeredCount = 0;
  let notAnsweredCount = 0;
  let notVisitedCount = 0;
  let markedCount = 0;
  let answeredAndMarkedCount = 0;

  questions.forEach(q => {
    const s = responses[q.id]?.paletteState || 'not_visited';
    if (s === 'answered') answeredCount++;
    else if (s === 'not_answered') notAnsweredCount++;
    else if (s === 'not_visited') notVisitedCount++;
    else if (s === 'marked_for_review') markedCount++;
    else if (s === 'answered_and_marked') answeredAndMarkedCount++;
  });

  // Extract unique subjects for section tabs
  const subjects = ['All', ...Array.from(new Set(questions.map(q => q.subject).filter(Boolean)))];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 select-none">
      {/* Top Proctored Exam Header */}
      <header className="bg-blue-900 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between shadow z-20 shrink-0 gap-2">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="bg-amber-400 text-blue-950 font-extrabold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[11px] sm:text-xs tracking-wider shrink-0">
            NEET
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-base font-bold leading-tight truncate max-w-[130px] xs:max-w-[200px] sm:max-w-md">
              {examTitle}
            </h1>
            <p className="text-[11px] text-blue-200 hidden sm:block truncate">
              Candidate: <span className="text-white font-medium">{studentInfo.name}</span>
            </p>
          </div>
        </div>

        {/* Center/Right: Timer & Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          <div className="flex items-center space-x-1 sm:space-x-2 bg-blue-950/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-blue-700 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
            <span className="text-[10px] sm:text-xs text-blue-200 uppercase font-semibold hidden md:inline">Time:</span>
            <span className={`text-xs sm:text-lg font-mono font-bold tracking-wider ${totalSeconds < 300 ? 'text-red-400 animate-bounce' : 'text-amber-300'}`}>
              {timeFormatted}
            </span>
          </div>

          {/* Submit Test Button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center space-x-1 px-2.5 sm:px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition active:scale-95 shrink-0"
            title="Submit your examination"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span>Submit</span>
          </button>

          {/* Mobile Palette Toggle Button */}
          <button
            onClick={() => setShowMobilePalette(!showMobilePalette)}
            className="lg:hidden p-1.5 bg-blue-800 hover:bg-blue-700 text-white rounded-lg border border-blue-600 active:scale-95 shrink-0"
            aria-label="Toggle Question Palette"
          >
            {showMobilePalette ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Subject Tabs Bar (Physics, Chemistry, Biology) + Font Size & Controls */}
      <div className="bg-white border-b border-slate-200 px-2.5 sm:px-4 py-1.5 flex items-center justify-between shrink-0 shadow-sm overflow-x-auto gap-2">
        <div className="flex items-center space-x-1.5 shrink-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">Sections:</span>
          {subjects.map((subj) => (
            <button
              key={subj}
              onClick={() => {
                setActiveSubject(subj);
                if (subj !== 'All') {
                  const firstSubjIdx = questions.findIndex(q => q.subject === subj);
                  if (firstSubjIdx !== -1) handleNavigate(firstSubjIdx);
                }
              }}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                activeSubject === subj 
                  ? 'bg-blue-900 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {/* Font Size Adjuster */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
            <button
              onClick={() => setFontSize('text-sm')}
              className={`px-2 py-0.5 rounded font-bold transition ${fontSize === 'text-sm' ? 'bg-white shadow text-blue-900' : 'text-slate-600'}`}
              title="Small text"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('text-base')}
              className={`px-2 py-0.5 rounded font-bold transition ${fontSize === 'text-base' ? 'bg-white shadow text-blue-900' : 'text-slate-600'}`}
              title="Normal text"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('text-lg')}
              className={`px-2 py-0.5 rounded font-bold transition ${fontSize === 'text-lg' ? 'bg-white shadow text-blue-900' : 'text-slate-600'}`}
              title="Large text"
            >
              A+
            </button>
          </div>

          {/* Palette button for mobile */}
          <button
            onClick={() => setShowMobilePalette(!showMobilePalette)}
            className="lg:hidden px-2 py-1 bg-amber-400 hover:bg-amber-300 text-blue-950 rounded text-xs font-bold shadow-sm transition active:scale-95"
          >
            Palette ({currentIndex + 1}/{questions.length})
          </button>

          <div className="text-xs text-slate-500 font-medium hidden md:block">
            Question <span className="font-bold text-slate-800">{currentIndex + 1}</span> of <span className="font-bold text-slate-800">{questions.length}</span>
          </div>
        </div>
      </div>

      {/* Backdrop overlay for mobile palette drawer */}
      {showMobilePalette && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setShowMobilePalette(false)}
        />
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative min-w-0">
        {/* QUESTION PALETTE DRAWER (Fixed drawer on mobile, static sidebar on lg+) */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-[82vw] max-w-xs sm:w-80 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
          ${showMobilePalette ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Palette Header & Legend */}
          <div className="p-3 border-b border-slate-200 bg-slate-50 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Question Palette</h2>
              <button
                onClick={() => setShowMobilePalette(false)}
                className="lg:hidden p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200"
                aria-label="Close palette"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-green-500 text-white shrink-0">
                  {answeredCount}
                </span>
                <span className="text-slate-700">Answered</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-red-500 text-white shrink-0">
                  {notAnsweredCount}
                </span>
                <span className="text-slate-700">Not Answered</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-slate-200 text-slate-700 shrink-0">
                  {notVisitedCount}
                </span>
                <span className="text-slate-700">Not Visited</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-purple-500 text-white shrink-0">
                  {markedCount}
                </span>
                <span className="text-slate-700">Marked for Review</span>
              </div>
              <div className="col-span-2 flex items-center space-x-1.5 pt-1">
                <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-green-500 text-white shrink-0 relative after:content-[''] after:absolute after:-top-0.5 after:-right-0.5 after:w-2 after:h-2 after:bg-purple-500 after:rounded-full after:border after:border-white">
                  {answeredAndMarkedCount}
                </span>
                <span className="text-slate-700">Answered & Marked for Review</span>
              </div>
            </div>
          </div>

          {/* Palette Number Grid */}
          <div className="flex-1 p-3 overflow-y-auto">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const s = responses[q.id]?.paletteState || 'not_visited';
                const isCurrent = idx === currentIndex;

                let stateClass = 'palette-not-visited';
                if (s === 'not_answered') stateClass = 'palette-not-answered';
                else if (s === 'answered') stateClass = 'palette-answered';
                else if (s === 'marked_for_review') stateClass = 'palette-marked';
                else if (s === 'answered_and_marked') stateClass = 'palette-answered-marked';

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      handleNavigate(idx);
                      setShowMobilePalette(false);
                    }}
                    className={`
                      h-9 w-9 rounded-lg font-bold text-xs flex items-center justify-center transition border
                      ${stateClass}
                      ${isCurrent ? 'ring-2 ring-blue-900 ring-offset-2 scale-105 z-10' : 'hover:opacity-90'}
                    `}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Palette Footer Status & Mobile Submit */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2 shrink-0">
            <div className="text-xs text-slate-600 flex justify-between font-medium">
              <span>Section: <strong>{currentQ?.subject}</strong></span>
              <span>Total: <strong>{questions.length}</strong></span>
            </div>
            {/* Direct Submit button at bottom of mobile drawer */}
            <button
              onClick={() => {
                setShowMobilePalette(false);
                setShowSubmitModal(true);
              }}
              className="w-full lg:hidden py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow flex items-center justify-center space-x-1.5 transition active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Entire Test</span>
            </button>
          </div>
        </aside>

        {/* MAIN QUESTION DISPLAY AREA */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Question Top Meta Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <span className="text-base font-bold text-slate-900">
                Question No. {currentIndex + 1}
              </span>
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                {currentQ?.subject}
              </span>
              {currentQ?.chapterName && (
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700 truncate max-w-xs">
                  {currentQ.chapterName}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                +4.00
              </span>
              <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                -1.00
              </span>
            </div>
          </div>

          {/* Question Text & Options Scrollable Canvas */}
          <div className="flex-1 p-3 sm:p-6 overflow-y-auto overflow-x-hidden space-y-3.5 sm:space-y-6 min-w-0">
            {/* Question Text Statement (Always rendered prominently) */}
            <div className={`leading-relaxed font-semibold text-slate-900 bg-slate-50/90 p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-sm break-words ${fontSize}`}>
              <div className="flex items-start space-x-2">
                <span className="text-blue-900 font-extrabold shrink-0">Q{currentIndex + 1}.</span>
                <span className="flex-1 whitespace-pre-line min-w-0 break-words">
                  {currentQ?.questionText || (currentQ as any)?.question_text || (
                    <span className="text-amber-800 italic">
                      [Question statement under review. Please refer to options below.]
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Match-the-Following Structured Table (Rendered cleanly when present) */}
            {currentQ?.matchData && currentQ.matchData.rows && currentQ.matchData.rows.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden my-3">
                <div className="bg-blue-900/10 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <span>{currentQ.matchData.column1Title || 'List-I'}</span>
                  <span>{currentQ.matchData.column2Title || 'List-II'}</span>
                </div>
                
                <div className="divide-y divide-slate-100">
                  {currentQ.matchData.rows.map((row, rIdx) => (
                    <div 
                      key={rIdx} 
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 hover:bg-slate-50/70 transition text-xs sm:text-sm"
                    >
                      {/* Left Column Item */}
                      <div className="flex items-start space-x-2 min-w-0">
                        <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-950 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-300">
                          {row.leftKey}
                        </span>
                        <span className="font-medium text-slate-900 leading-snug break-words">
                          {row.leftText}
                        </span>
                      </div>

                      {/* Right Column Item */}
                      <div className="flex items-start space-x-2 min-w-0 pl-0 sm:pl-3 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0">
                        <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-950 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-300">
                          {row.rightKey}
                        </span>
                        <span className="text-slate-800 leading-snug break-words">
                          {row.rightText}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Relevant Diagram or Illustration (Rendered ONLY if genuine diagram exists) */}
            {Boolean(currentQ?.imageUrl || (currentQ as any)?.image_url) && (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm p-2 sm:p-4 w-full text-center">
                <img
                  src={currentQ?.imageUrl || (currentQ as any)?.image_url}
                  alt={`Diagram for Question ${currentIndex + 1}`}
                  className="max-h-[260px] xs:max-h-[320px] sm:max-h-[420px] w-auto max-w-full object-contain mx-auto rounded"
                  loading="eager"
                />
              </div>
            )}

            {/* 4 Interactive Selectable Options (Touch-Friendly for Mobile) */}
            <div className="space-y-2 sm:space-y-3 pt-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Option:</p>
              {currentQ?.options.map((optText, optIdx) => {
                const optNum = optIdx + 1;
                const isSelected = selectedOption === optNum;

                return (
                  <label
                    key={optNum}
                    onClick={() => handleSelectOption(optNum)}
                    className={`
                      flex items-start space-x-3 p-3 sm:p-4 rounded-xl border-2 transition cursor-pointer select-none min-h-[48px] active:scale-[0.99] min-w-0
                      ${isSelected 
                        ? 'border-blue-700 bg-blue-50 text-blue-950 font-semibold shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 bg-white'}
                    `}
                  >
                    <div className="pt-0.5 shrink-0">
                      <div className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs transition
                        ${isSelected ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-400 bg-white text-slate-700'}
                      `}>
                        {optNum}
                      </div>
                    </div>
                    <div className={`flex-1 leading-snug break-words min-w-0 ${fontSize}`}>
                      {currentQ?.optionImages && currentQ.optionImages[optIdx] ? (
                        <div className="space-y-1.5">
                          <img 
                            src={currentQ.optionImages[optIdx]} 
                            alt={`Option (${optNum}) formula/diagram`}
                            className="max-h-20 sm:max-h-32 w-auto max-w-full object-contain rounded border border-slate-200 bg-white p-1"
                            loading="eager"
                          />
                          {optText && !optText.startsWith("See Option") && (
                            <div className="text-xs text-slate-600 font-medium break-words">{optText}</div>
                          )}
                        </div>
                      ) : (
                        <span className="break-words">{optText}</span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Controls Bar */}
          <footer className="bg-slate-50 border-t border-slate-200 px-2.5 sm:px-6 py-2 sm:py-3 shrink-0 flex items-center justify-between gap-1.5 sm:gap-2 shadow-inner pb-[max(0.6rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button
                onClick={handleMarkForReviewAndNext}
                className="px-2.5 sm:px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition flex items-center space-x-1 sm:space-x-1.5 shadow-sm active:scale-95 min-h-[38px]"
                title="Mark for Review & Next"
              >
                <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>Mark Review<span className="hidden sm:inline"> & Next</span></span>
              </button>

              <button
                onClick={handleClearResponse}
                disabled={selectedOption === null && !currentResp?.isMarkedForReview}
                className="px-2 sm:px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium transition flex items-center space-x-1 sm:space-x-1.5 disabled:opacity-40 active:scale-95 min-h-[38px]"
                title="Clear selected option"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>Clear<span className="hidden sm:inline"> Response</span></span>
              </button>
            </div>

            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button
                onClick={() => handleNavigate(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="px-2.5 sm:px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium transition flex items-center space-x-1 disabled:opacity-40 active:scale-95 min-h-[38px]"
                title="Previous Question"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span>Prev<span className="hidden sm:inline">ious</span></span>
              </button>

              <button
                onClick={handleSaveAndNext}
                className="px-3.5 sm:px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs sm:text-sm font-bold transition flex items-center space-x-1 sm:space-x-1.5 shadow active:scale-95 min-h-[38px]"
                title="Save & Next Question"
              >
                <span>Save & Next</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </footer>
        </main>

        {/* RIGHT SIDEBAR ON LARGE SCREENS (Summary & Quick Stats) */}
        <aside className="hidden xl:flex flex-col w-64 bg-slate-50 border-l border-slate-200 p-4 justify-between shrink-0">
          <div className="space-y-4">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
              <div className="text-xs text-slate-500 font-semibold uppercase">Candidate Profile</div>
              <div className="font-bold text-slate-900 text-sm mt-1">{studentInfo.name}</div>
              <div className="text-xs text-slate-500 truncate">{studentInfo.email}</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b pb-2">
                Attempt Summary
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Questions:</span>
                  <span className="font-bold text-slate-900">{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Answered:</span>
                  <span className="font-bold text-green-700">{answeredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Not Answered:</span>
                  <span className="font-bold text-red-700">{notAnsweredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Not Visited:</span>
                  <span className="font-bold text-slate-600">{notVisitedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Marked for Review:</span>
                  <span className="font-bold text-purple-700">{markedCount + answeredAndMarkedCount}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-sm"
          >
            <Send className="w-4 h-4" />
            <span>Submit Examination</span>
          </button>
        </aside>
      </div>

      {/* Confirmation Modal Before Manual Submission */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="bg-blue-900 text-white p-5">
              <h3 className="text-lg font-bold flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Confirm Final Submission</span>
              </h3>
              <p className="text-xs text-blue-200 mt-1">
                Are you sure you want to finish the examination?
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Total Questions:</span>
                  <span className="font-bold text-slate-900">{questions.length}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-green-700 font-medium">Answered Questions:</span>
                  <span className="font-bold text-green-700">{answeredCount + answeredAndMarkedCount}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-red-700 font-medium">Unanswered Questions:</span>
                  <span className="font-bold text-red-700">{notAnsweredCount + notVisitedCount}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-purple-700 font-medium">Marked for Review:</span>
                  <span className="font-bold text-purple-700">{markedCount + answeredAndMarkedCount}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Once submitted, you will not be able to change your answers. Your responses will be evaluated on the secure server using the approved NEET answer key.
              </p>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Resume Test
                </button>
                <button
                  type="button"
                  onClick={executeSubmission}
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition shadow flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Evaluating...</span>
                    </>
                  ) : (
                    <span>Yes, Submit Examination</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
