export type Grade = '6' | '7' | '8' | '9';

export type Textbook = 'kntt' | 'ctst' | 'canh_dieu' | 'all';

export type ExamType = 
  | 'thuong_xuyen' // Kiểm tra thường xuyên (15p - 45p)
  | 'giua_ky_1'    // Kiểm tra giữa học kỳ I
  | 'cuoi_ky_1'    // Kiểm tra cuối học kỳ I
  | 'giua_ky_2'    // Kiểm tra giữa học kỳ II
  | 'cuoi_ky_2'    // Kiểm tra cuối học kỳ II
  | 'on_tap';      // Khảo sát / Ôn tập chuyên đề

export type ExamFormat = 'doc_hieu' | 'viet' | 'ket_hop';

export type CognitiveLevel = 'nhan_biet' | 'thong_hieu' | 'van_dung' | 'van_dung_cao';

export type GenreType = 
  | 'tho_luc_bat'
  | 'tho_4_5_chu'
  | 'tho_duong_luat'
  | 'tho_tu_do'
  | 'truyen_dong_thoai'
  | 'truyen_ngan'
  | 'truyen_khoa_hoc_vien_tuong'
  | 'truyen_co_tich_truyen_thuyet'
  | 'truyen_lich_su'
  | 'ki_tuy_but_tan_van'
  | 'nghi_luan_xa_hoi'
  | 'nghi_luan_van_hoc'
  | 'van_ban_thong_tin';

export interface ReadingQuestion {
  id: string;
  number: number;
  type: 'trac_nghiem' | 'tu_luan';
  cognitiveLevel: CognitiveLevel;
  strand: 'doc_hieu' | 'tieng_viet';
  question: string;
  options?: string[]; // [A, B, C, D]
  answer: string;
  guide: string;
  score: number;
}

export interface WritingCriterion {
  name: string;
  description: string;
  score: number;
}

export interface WritingQuestion {
  id: string;
  topic: string;
  cognitiveLevel: CognitiveLevel;
  requirements: string;
  contentOrientation?: string; // Định hướng nội dung bài viết
  guide: string;
  score: number;
  rubricCriteria: WritingCriterion[];
}

export interface MatrixRow {
  strand: string; // Kĩ năng Đọc / Tiếng Việt / Viết
  subStrand: string; // Thể loại / Nội dung
  nhanBiet: { tnCount: number; tlCount: number; score: number };
  thongHieu: { tnCount: number; tlCount: number; score: number };
  vanDung: { tnCount: number; tlCount: number; score: number };
  vanDungCao: { tnCount: number; tlCount: number; score: number };
  totalScore: number;
  percentage: number;
}

export interface ExamMatrix {
  rows: MatrixRow[];
  totalNhanBietScore: number;
  totalThongHieuScore: number;
  totalVanDungScore: number;
  totalVanDungCaoScore: number;
  totalScore: number;
}

export interface SpecificationItem {
  number: string;
  strand: string;
  genre: string;
  cognitiveLevel: string;
  standardRequired: string; // Yêu cầu cần đạt
  questionType: string;
  score: number;
}

export interface ExamSpecification {
  items: SpecificationItem[];
}

export interface MaterialPassage {
  id: string;
  title: string;
  author: string;
  source: string;
  genre: string;
  grade: Grade;
  textbook: Textbook;
  theme: string;
  content: string;
  wordCount: number;
  notes?: string;
  tags: string[];
  isVerified: boolean;
  createdAt: string;
}

export interface QuestionBankItem {
  id: string;
  grade: Grade;
  strand: 'doc_hieu' | 'tieng_viet' | 'viet';
  cognitiveLevel: CognitiveLevel;
  questionType: 'trac_nghiem' | 'tu_luan';
  genre: string;
  passageSnippet?: string;
  prompt: string;
  options?: string[];
  answer: string;
  guide: string;
  maxScore: number;
  tags: string[];
  createdAt: string;
}

export interface VariantCode {
  code: string;
  title: string;
  readingQuestions: ReadingQuestion[];
  writingQuestion: WritingQuestion;
}

export interface Exam {
  id: string;
  code: string;
  title: string;
  school: string;
  district: string;
  grade: Grade;
  textbook: Textbook;
  examType: ExamType;
  durationMinutes: number;
  totalScore: number;
  readingScore: number;
  writingScore: number;
  scope?: string; // Phạm vi kiến thức, bài học, chủ đề
  learningOutcomes?: string[]; // Yêu cầu cần đạt (YCCĐ)
  unitName?: string; // Tên bài học / chuyên đề cụ thể
  referenceDocumentName?: string; // Tên tài liệu giáo viên đính kèm
  cognitiveRatios: {
    nhanBiet: number;
    thongHieu: number;
    vanDung: number;
    vanDungCao: number;
  };
  readingPassage: {
    title: string;
    author: string;
    source: string;
    content: string;
    genre: string;
    isAiSuggested?: boolean;
    isCustom?: boolean;
  };
  readingQuestions: ReadingQuestion[];
  writingQuestion: WritingQuestion;
  matrix: ExamMatrix;
  specification: ExamSpecification;
  generalGradingGuide?: string; // Hướng dẫn chấm chung
  variants?: VariantCode[];
  status: 'draft' | 'reviewed' | 'approved';
  teacherName: string;
  schoolYear: string;
  semester: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt';
  fileSize: number;
  grade: Grade;
  textbook: Textbook;
  theme: string;
  extractedText: string;
  createdAt: string;
}

export interface AppSettings {
  schoolName: string;
  districtName: string;
  departmentName: string;
  teacherName: string;
  schoolYear: string;
  defaultDuration: number;
  defaultReadingRatio: number;
  defaultWritingRatio: number;
  fontFamily: 'Times New Roman' | 'Lora' | 'Plus Jakarta Sans';
  fontSize: number;
}
