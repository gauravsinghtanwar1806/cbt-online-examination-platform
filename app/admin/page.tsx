'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, AlertTriangle, CheckCircle, Database, Settings, 
  Users, Edit3, Save, RefreshCw, FileText, Check, ArrowLeft, ExternalLink, HelpCircle
} from 'lucide-react';
import { AnswerVerification, Exam, Question, ExamResult } from '@/lib/types';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'verification' | 'questions' | 'exams' | 'attempts'>('verification');
  
  // State
  const [verifications, setVerifications] = useState<AnswerVerification[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [examFilter, setExamFilter] = useState<string>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  // Form states
  const [editingQuestion, setEditingQuestion] = useState<{
    id: string;
    text: string;
    options: string[];
    imageUrl: string;
  } | null>(null);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [verRes, examRes, attRes] = await Promise.all([
        fetch('/api/admin/verification'),
        fetch('/api/admin/exams'),
        fetch('/api/admin/attempts')
      ]);

      const [verData, examData, attData] = await Promise.all([
        verRes.json(),
        examRes.json(),
        attRes.json()
      ]);

      if (verData.success) setVerifications(verData.verifications);
      if (examData.success) setExams(examData.exams);
      if (attData.success) setAttempts(attData.results);

      // Load initial questions for first exam
      loadQuestions('achiever_minor_test_02');
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (examId: string) => {
    try {
      const res = await fetch(`/api/admin/questions?examId=${examId}`);
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (e) {
      console.error('Error loading questions:', e);
    }
  };

  // Handle Approve Answer
  const handleApproveAnswer = async (questionId: string, approvedAnswer: number, newStatus: string = 'VERIFIED_MATCH') => {
    try {
      const res = await fetch('/api/admin/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          approvedAnswer,
          status: newStatus,
          notes: `Approved by Administrator (Answer Option ${approvedAnswer})`
        })
      });
      const data = await res.json();
      if (data.success) {
        setVerifications(prev => prev.map(v => v.questionId === questionId ? data.verification : v));
      }
    } catch (e) {
      alert('Failed to update verification.');
    }
  };

  // Handle Question Edit
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: editingQuestion.id,
          questionText: editingQuestion.text,
          options: editingQuestion.options,
          imageUrl: editingQuestion.imageUrl
        })
      });

      const data = await res.json();
      if (data.success) {
        setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? data.question : q));
        setEditingQuestion(null);
        alert('Question updated successfully!');
      }
    } catch (e) {
      alert('Failed to save question edit.');
    }
  };

  // Handle Exam Config Update
  const handleUpdateExam = async (examId: string, duration: number, marking: any, isPublished: boolean) => {
    try {
      const res = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId,
          durationMinutes: duration,
          isPublished,
          markingScheme: marking
        })
      });
      const data = await res.json();
      if (data.success) {
        setExams(prev => prev.map(ex => ex.id === examId ? data.exam : ex));
        alert('Examination configuration updated successfully!');
      }
    } catch (e) {
      alert('Failed to update exam configuration.');
    }
  };

  // Verification Stats
  const totalVer = verifications.length;
  const verifiedMatches = verifications.filter(v => v.status === 'VERIFIED_MATCH').length;
  const keyMismatches = verifications.filter(v => v.status === 'KEY_MISMATCH').length;
  const reviewRequired = verifications.filter(v => v.status === 'MANUAL_REVIEW_REQUIRED').length;

  const filteredVerifications = verifications.filter(v => {
    if (examFilter !== 'all' && v.examId !== examFilter) return false;
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Admin Top Header */}
      <header className="bg-slate-900 text-white py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-400 text-slate-950 p-2 rounded-lg font-bold text-sm">
              ADMIN
            </div>
            <div>
              <h1 className="text-xl font-bold">CBT Examination Operations & QA Dashboard</h1>
              <p className="text-xs text-slate-400">Answer Key Verification • Question Editor • Scoring Rules • Submissions</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Subnav Tabs */}
      <div className="bg-white border-b border-slate-200 px-6">
        <div className="max-w-7xl mx-auto flex space-x-8 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('verification')}
            className={`py-3.5 border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'verification'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Answer Key Verification ({totalVer})</span>
            {keyMismatches > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-100 text-red-700 font-bold">
                {keyMismatches} Discrepancy
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`py-3.5 border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'questions'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Question Bank & Diagrams</span>
          </button>

          <button
            onClick={() => setActiveTab('exams')}
            className={`py-3.5 border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'exams'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Examination Configuration</span>
          </button>

          <button
            onClick={() => setActiveTab('attempts')}
            className={`py-3.5 border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'attempts'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Candidate Submissions ({attempts.length})</span>
          </button>
        </div>
      </div>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900 mx-auto"></div>
            <p className="mt-4 text-sm text-slate-600">Loading administrator databases...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: ANSWER KEY VERIFICATION DASHBOARD */}
            {activeTab === 'verification' && (
              <div className="space-y-6">
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-bold text-slate-500 uppercase">Total Questions</span>
                    <div className="text-3xl font-extrabold text-slate-900 mt-1">{totalVer}</div>
                    <span className="text-xs text-slate-400">180 Achiever + 462 Diwali Bank</span>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-bold text-green-700 uppercase">Verified Matches</span>
                    <div className="text-3xl font-extrabold text-green-700 mt-1">{verifiedMatches}</div>
                    <span className="text-xs text-slate-400">AI / Derivation matches key 100%</span>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-bold text-red-600 uppercase">Key Mismatches</span>
                    <div className="text-3xl font-extrabold text-red-600 mt-1">{keyMismatches}</div>
                    <span className="text-xs text-slate-400">Derivation disagrees with key</span>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-bold text-amber-700 uppercase">Manual Review Needed</span>
                    <div className="text-3xl font-extrabold text-amber-700 mt-1">{reviewRequired}</div>
                    <span className="text-xs text-slate-400">Visual diagram checks</span>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="font-bold text-slate-700 uppercase">Examination:</span>
                    <select
                      value={examFilter}
                      onChange={(e) => setExamFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="all">All Examinations</option>
                      <option value="achiever_minor_test_02">Achiever Minor Test 02 (180 Qs)</option>
                      <option value="biology_diwali_assignment">Biology Diwali Assignment (462 Qs)</option>
                    </select>

                    <span className="font-bold text-slate-700 uppercase ml-2">Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="all">All Statuses</option>
                      <option value="KEY_MISMATCH">KEY_MISMATCH (Discrepancies)</option>
                      <option value="VERIFIED_MATCH">VERIFIED_MATCH</option>
                      <option value="MANUAL_REVIEW_REQUIRED">MANUAL_REVIEW_REQUIRED</option>
                    </select>
                  </div>

                  <div className="text-xs text-slate-500">
                    Showing <strong>{filteredVerifications.length}</strong> of <strong>{totalVer}</strong> questions
                  </div>
                </div>

                {/* Verification Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 uppercase font-bold text-slate-600 sticky top-0 border-b border-slate-200 z-10">
                        <tr>
                          <th className="px-4 py-3">Question ID</th>
                          <th className="px-3 py-3">Subject</th>
                          <th className="px-3 py-3 text-center">PDF Answer</th>
                          <th className="px-3 py-3 text-center">Verified Answer</th>
                          <th className="px-3 py-3 text-center">Approved Answer</th>
                          <th className="px-3 py-3">Status</th>
                          <th className="px-4 py-3">Verification Notes</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredVerifications.map((v) => {
                          let badgeBg = 'bg-green-100 text-green-800 border-green-200';
                          if (v.status === 'KEY_MISMATCH') badgeBg = 'bg-red-100 text-red-800 border-red-300 font-bold animate-pulse';
                          else if (v.status === 'MANUAL_REVIEW_REQUIRED') badgeBg = 'bg-amber-100 text-amber-800 border-amber-300';

                          return (
                            <tr key={v.questionId} className={`hover:bg-slate-50/80 transition ${v.status === 'KEY_MISMATCH' ? 'bg-red-50/30' : ''}`}>
                              <td className="px-4 py-3 font-mono font-bold text-slate-900">{v.questionId}</td>
                              <td className="px-3 py-3 font-medium text-slate-700">{v.subject} Q{v.questionNumber}</td>
                              <td className="px-3 py-3 text-center font-bold text-blue-900 bg-blue-50/50">
                                Option ({v.pdfAnswer})
                              </td>
                              <td className="px-3 py-3 text-center font-bold text-slate-800">
                                {v.verifiedAnswer ? `Option (${v.verifiedAnswer})` : '—'}
                              </td>
                              <td className="px-3 py-3 text-center font-extrabold text-green-700 bg-green-50/50">
                                Option ({v.approvedAnswer})
                              </td>
                              <td className="px-3 py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] border ${badgeBg}`}>
                                  {v.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={v.notes}>
                                {v.notes}
                              </td>
                              <td className="px-4 py-3 text-right whitespace-nowrap">
                                <div className="inline-flex items-center space-x-1.5">
                                  {v.status === 'KEY_MISMATCH' && (
                                    <>
                                      <button
                                        onClick={() => handleApproveAnswer(v.questionId, v.pdfAnswer, 'VERIFIED_MATCH')}
                                        className="px-2 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-[11px] font-semibold transition"
                                        title="Approve official PDF answer key as final"
                                      >
                                        Keep PDF ({v.pdfAnswer})
                                      </button>
                                      {v.verifiedAnswer && (
                                        <button
                                          onClick={() => handleApproveAnswer(v.questionId, v.verifiedAnswer, 'VERIFIED_MATCH')}
                                          className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-semibold transition"
                                          title="Override with mathematically verified derivation answer"
                                        >
                                          Use Derivation ({v.verifiedAnswer})
                                        </button>
                                      )}
                                    </>
                                  )}
                                  {v.status !== 'KEY_MISMATCH' && (
                                    <span className="text-[11px] text-green-700 font-semibold flex items-center space-x-1">
                                      <Check className="w-3.5 h-3.5 inline" />
                                      <span>Approved</span>
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: QUESTION BANK & DIAGRAMS */}
            {activeTab === 'questions' && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-slate-700 uppercase">Select Exam:</span>
                    <button
                      onClick={() => loadQuestions('achiever_minor_test_02')}
                      className="px-3 py-1.5 bg-blue-900 text-white rounded-lg text-xs font-semibold"
                    >
                      Achiever Minor Test 02 (180 Qs)
                    </button>
                    <button
                      onClick={() => loadQuestions('biology_diwali_assignment')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                    >
                      Biology Diwali Assignment (462 Qs)
                    </button>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Loaded {questions.length} questions
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Question List */}
                  <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-4 max-h-[700px] overflow-y-auto space-y-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Question</h3>
                    {questions.map((q) => (
                      <div
                        key={q.id}
                        onClick={() => {
                          setSelectedQuestion(q);
                          setEditingQuestion({
                            id: q.id,
                            text: q.questionText || (q as any).question_text || '',
                            options: [...(q.options || [])],
                            imageUrl: q.imageUrl || (q as any).image_url || ''
                          });
                        }}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                          selectedQuestion?.id === q.id 
                            ? 'border-blue-900 bg-blue-50/80 font-semibold text-blue-950' 
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold">{q.id}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">{q.subject}</span>
                        </div>
                        <div className="truncate text-slate-500">{q.questionText || (q as any).question_text}</div>
                      </div>
                    ))}
                  </div>

                  {/* Right Column: Editor */}
                  <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    {editingQuestion ? (
                      <form onSubmit={handleSaveQuestion} className="space-y-5">
                        <div className="flex items-center justify-between border-b pb-3">
                          <h3 className="text-base font-bold text-slate-900">
                            Editing Question: <span className="font-mono text-blue-900">{editingQuestion.id}</span>
                          </h3>
                          <button
                            type="submit"
                            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow transition"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Changes</span>
                          </button>
                        </div>

                        {/* Diagram Preview & Image URL */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            Associated High-Res Diagram / Formula Image URL
                          </label>
                          <input
                            type="text"
                            value={editingQuestion.imageUrl}
                            onChange={(e) => setEditingQuestion({ ...editingQuestion, imageUrl: e.target.value })}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono mb-2"
                          />
                          {editingQuestion.imageUrl && (
                            <div className="p-3 bg-slate-50 border rounded-xl inline-block max-w-full">
                              <img
                                src={editingQuestion.imageUrl}
                                alt="Diagram preview"
                                className="max-h-48 object-contain"
                              />
                            </div>
                          )}
                        </div>

                        {/* Question Text */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            Question Statement Text
                          </label>
                          <textarea
                            rows={4}
                            value={editingQuestion.text}
                            onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 font-sans leading-relaxed"
                          />
                        </div>

                        {/* 4 Options */}
                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Options (1 to 4)
                          </label>
                          {editingQuestion.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center space-x-2">
                              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                                {oIdx + 1}
                              </span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const newOpts = [...editingQuestion.options];
                                  newOpts[oIdx] = e.target.value;
                                  setEditingQuestion({ ...editingQuestion, options: newOpts });
                                }}
                                className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300"
                              />
                            </div>
                          ))}
                        </div>
                      </form>
                    ) : (
                      <div className="text-center py-24 text-slate-400">
                        <Edit3 className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
                        <p className="text-sm">Select any question on the left to review or edit text, options, and diagram image.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: EXAMINATION CONFIGURATION */}
            {activeTab === 'exams' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {exams.map((ex) => (
                  <div key={ex.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
                    <div className="flex items-start justify-between border-b pb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{ex.title}</h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{ex.sourcePdf}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ex.isPublished ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'}`}>
                        {ex.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                          Duration (Minutes)
                        </label>
                        <input
                          type="number"
                          defaultValue={ex.durationMinutes}
                          id={`duration_${ex.id}`}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                          Correct Marks
                        </label>
                        <input
                          type="number"
                          defaultValue={ex.markingScheme.correctMarks}
                          id={`correct_${ex.id}`}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                          Incorrect Negative Marks
                        </label>
                        <input
                          type="number"
                          defaultValue={ex.markingScheme.incorrectMarks}
                          id={`incorrect_${ex.id}`}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                          Unattempted Marks
                        </label>
                        <input
                          type="number"
                          defaultValue={ex.markingScheme.unattemptedMarks}
                          id={`unattempted_${ex.id}`}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={ex.isPublished}
                          id={`publish_${ex.id}`}
                          className="w-4 h-4 text-blue-900 rounded"
                        />
                        <span>Publicly Available to Students</span>
                      </label>

                      <button
                        onClick={() => {
                          const dur = (document.getElementById(`duration_${ex.id}`) as HTMLInputElement)?.value;
                          const cor = (document.getElementById(`correct_${ex.id}`) as HTMLInputElement)?.value;
                          const incor = (document.getElementById(`incorrect_${ex.id}`) as HTMLInputElement)?.value;
                          const unatt = (document.getElementById(`unattempted_${ex.id}`) as HTMLInputElement)?.value;
                          const pub = (document.getElementById(`publish_${ex.id}`) as HTMLInputElement)?.checked;

                          handleUpdateExam(ex.id, Number(dur), {
                            correctMarks: Number(cor),
                            incorrectMarks: Number(incor),
                            unattemptedMarks: Number(unatt)
                          }, pub);
                        }}
                        className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition shadow"
                      >
                        Update Configuration
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: CANDIDATE ATTEMPTS & SUBMISSIONS */}
            {activeTab === 'attempts' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Recorded Examination Submissions</h3>
                  <span className="text-xs text-slate-500 font-medium">Total: {attempts.length} attempts</span>
                </div>

                {attempts.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 stroke-1 mb-2" />
                    <p className="text-sm">No student attempts recorded yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 uppercase font-bold text-slate-600 border-b">
                        <tr>
                          <th className="px-6 py-3">Attempt ID</th>
                          <th className="px-4 py-3">Candidate</th>
                          <th className="px-4 py-3">Examination</th>
                          <th className="px-3 py-3 text-center">Score</th>
                          <th className="px-3 py-3 text-center">Percentage</th>
                          <th className="px-3 py-3 text-center">Accuracy</th>
                          <th className="px-4 py-3">Submitted At</th>
                          <th className="px-4 py-3 text-right">Scorecard</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attempts.map((att) => (
                          <tr key={att.attemptId} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4 font-mono font-bold text-slate-900">{att.attemptId}</td>
                            <td className="px-4 py-4">
                              <div className="font-bold text-slate-900">{att.studentName}</div>
                              <div className="text-[11px] text-slate-500">{att.studentEmail}</div>
                            </td>
                            <td className="px-4 py-4 font-medium text-slate-700">{att.examTitle}</td>
                            <td className="px-3 py-4 text-center font-extrabold text-blue-950 text-sm">
                              {att.finalScore} / {att.maximumMarks}
                            </td>
                            <td className="px-3 py-4 text-center font-bold text-emerald-700">{att.percentage}%</td>
                            <td className="px-3 py-4 text-center font-semibold text-slate-700">{att.accuracy}%</td>
                            <td className="px-4 py-4 text-slate-500">{new Date(att.submittedAt).toLocaleString()}</td>
                            <td className="px-4 py-4 text-right">
                              <Link
                                href={`/results/${att.attemptId}`}
                                target="_blank"
                                className="inline-flex items-center space-x-1 text-blue-700 font-bold hover:underline"
                              >
                                <span>View Result</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

