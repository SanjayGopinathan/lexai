-- LexAI Sample Data
-- Run this in psql: \i sample_data.sql

\c lexai_db;

-- Demo user (password: demo1234)
INSERT INTO users (name, email, hashed_password, role, is_active, created_at)
VALUES (
  'Arjun Sharma',
  'demo@lexai.in',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMqJqhN8/LewKyNAh1K8LZO5Vy',
  'student',
  true,
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Sample moot session
INSERT INTO moot_sessions (
  user_id, case_title, case_domain, user_role, verdict,
  score_argument, score_citation, score_rebuttal,
  score_terminology, score_persuasion, overall_score,
  feedback, strong_points, weak_points,
  started_at, ended_at
)
SELECT
  id, 'Consumer Fraud – Defective Product', 'Consumer Law',
  'Plaintiff', 'For Plaintiff',
  85, 80, 78, 82, 88, 82.6,
  'Excellent command of Consumer Protection Act 2019. Work on case citations.',
  '["Strong opening statement","Good use of CPA sections"]',
  '["Need more Supreme Court citations","Rebuttal was too brief"]',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days' + INTERVAL '1 hour'
FROM users WHERE email = 'demo@lexai.in'
ON CONFLICT DO NOTHING;
