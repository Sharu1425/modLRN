export interface User {
    _id: string;
    id?: string;
    username?: string;
    email: string;
    name?: string;
    profile_picture?: string;
    is_admin?: boolean;
    has_face_descriptor?: boolean;
  }
  
  export interface Question {
    question: string;
    options: string[];
    answer: string;
  }
  
  export interface AssessmentConfig {
    topic: string;
    qnCount: number;
    difficulty: string;
  }
  
  export interface TestResult {
    id: string;
    score: number;
    total_questions: number;
    topic: string;
    difficulty: string;
    date: string;
    percentage?: number;
    time_taken?: number;
  }
  
  export interface DetailedTestResult {
    id: string;
    user_id: string;
    score: number;
    total_questions: number;
    questions: Question[];
    user_answers: string[];
    topic: string;
    difficulty: string;
    time_taken?: number;
    explanations?: Array<{ questionIndex: number; explanation: string }>;
    date: string;
    percentage: number;
    correct_answers: number;
    incorrect_answers: number;
  }
  
  export interface QuestionReview {
    question_index: number;
    question: string;
    options: string[];
    correct_answer: string;
    user_answer: string;
    is_correct: boolean;
    explanation?: string;
  }
  
  export interface DetailedResultResponse {
    success: boolean;
    result: DetailedTestResult;
    question_reviews: QuestionReview[];
  }
  
  export interface Analytics {
    total_assessments: number;
    average_score: number;
    total_questions: number;
    topics: string[];
    recent_results: TestResult[];
    topic_stats: Record<string, {
      count: number;
      total_score: number;
      total_questions: number;
      average_score: number;
    }>;
  }
  
  export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }
