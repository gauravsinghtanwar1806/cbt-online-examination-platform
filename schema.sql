-- CBT Examination Platform - Relational Database Schema
-- Compatible with PostgreSQL (Supabase / Render / Neon / Local PostgreSQL)

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'student', -- 'student', 'admin', 'proctor'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Examinations
CREATE TABLE IF NOT EXISTS examinations (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    source_pdf VARCHAR(255),
    total_questions INT NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 180,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Subjects
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(64) PRIMARY KEY,
    exam_id VARCHAR(64) REFERENCES examinations(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    question_start INT NOT NULL,
    question_end INT NOT NULL
);

-- 4. Chapters
CREATE TABLE IF NOT EXISTS chapters (
    id VARCHAR(64) PRIMARY KEY,
    exam_id VARCHAR(64) REFERENCES examinations(id) ON DELETE CASCADE,
    chapter_index INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    question_count INT NOT NULL DEFAULT 0
);

-- 5. Marking Schemes
CREATE TABLE IF NOT EXISTS marking_schemes (
    id VARCHAR(64) PRIMARY KEY,
    exam_id VARCHAR(64) REFERENCES examinations(id) ON DELETE CASCADE,
    correct_marks FLOAT NOT NULL DEFAULT 4.0,
    incorrect_marks FLOAT NOT NULL DEFAULT -1.0,
    unattempted_marks FLOAT NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Questions
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(64) PRIMARY KEY,
    exam_id VARCHAR(64) REFERENCES examinations(id) ON DELETE CASCADE,
    subject VARCHAR(64) NOT NULL,
    chapter_id VARCHAR(64) REFERENCES chapters(id) ON DELETE SET NULL,
    question_number INT NOT NULL,
    question_type VARCHAR(64) NOT NULL DEFAULT 'mcq', -- 'mcq', 'assertion_reason', 'statement_based', 'match_following', 'diagram_based'
    question_text TEXT NOT NULL,
    image_url VARCHAR(255),
    source_pdf VARCHAR(255),
    source_page INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Question Options
CREATE TABLE IF NOT EXISTS question_options (
    id VARCHAR(64) PRIMARY KEY,
    question_id VARCHAR(64) REFERENCES questions(id) ON DELETE CASCADE,
    option_number INT NOT NULL CHECK (option_number BETWEEN 1 AND 4),
    option_text TEXT NOT NULL
);

-- 8. Answer Keys (Strictly protected - never served via student question API)
CREATE TABLE IF NOT EXISTS answer_keys (
    id VARCHAR(64) PRIMARY KEY,
    question_id VARCHAR(64) UNIQUE REFERENCES questions(id) ON DELETE CASCADE,
    official_answer INT NOT NULL CHECK (official_answer BETWEEN 1 AND 4),
    solution_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Answer Verification & Audit
CREATE TABLE IF NOT EXISTS answer_verification (
    id VARCHAR(64) PRIMARY KEY,
    question_id VARCHAR(64) UNIQUE REFERENCES questions(id) ON DELETE CASCADE,
    pdf_answer INT NOT NULL,
    verified_answer INT,
    approved_answer INT NOT NULL,
    status VARCHAR(64) NOT NULL DEFAULT 'VERIFIED_MATCH', -- 'VERIFIED_MATCH', 'KEY_MISMATCH', 'AI_UNCERTAIN', 'OCR_UNCERTAIN', 'MANUAL_REVIEW_REQUIRED'
    notes TEXT,
    reviewed_by_admin BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Exam Attempts
CREATE TABLE IF NOT EXISTS exam_attempts (
    id VARCHAR(64) PRIMARY KEY,
    exam_id VARCHAR(64) REFERENCES examinations(id) ON DELETE CASCADE,
    student_id VARCHAR(64) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    selected_chapter_id VARCHAR(64), -- If student attempts a single chapter
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    time_spent_seconds INT NOT NULL DEFAULT 0,
    is_submitted BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at TIMESTAMP WITH TIME ZONE
);

-- 11. Student Responses
CREATE TABLE IF NOT EXISTS student_responses (
    id VARCHAR(64) PRIMARY KEY,
    attempt_id VARCHAR(64) REFERENCES exam_attempts(id) ON DELETE CASCADE,
    question_id VARCHAR(64) REFERENCES questions(id) ON DELETE CASCADE,
    selected_option INT CHECK (selected_option BETWEEN 1 AND 4),
    is_marked_for_review BOOLEAN NOT NULL DEFAULT FALSE,
    palette_state VARCHAR(32) NOT NULL DEFAULT 'not_visited', -- 'not_visited', 'not_answered', 'answered', 'marked_for_review', 'answered_and_marked'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (attempt_id, question_id)
);

-- 12. Exam Results
CREATE TABLE IF NOT EXISTS exam_results (
    id VARCHAR(64) PRIMARY KEY,
    attempt_id VARCHAR(64) UNIQUE REFERENCES exam_attempts(id) ON DELETE CASCADE,
    total_questions INT NOT NULL,
    attempted_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    incorrect_answers INT NOT NULL,
    unattempted_questions INT NOT NULL,
    positive_marks FLOAT NOT NULL,
    negative_marks FLOAT NOT NULL,
    final_score FLOAT NOT NULL,
    maximum_marks FLOAT NOT NULL,
    percentage FLOAT NOT NULL,
    accuracy FLOAT NOT NULL,
    subject_performance JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_questions_chapter_id ON questions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_question_options_q_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON exam_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_exam ON exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_responses_attempt ON student_responses(attempt_id);
