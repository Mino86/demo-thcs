import React from 'react';
import {
  Sparkles,
  BookOpen,
  FileQuestion,
  Files,
  ArrowRight,
  Printer,
  Download,
  Calendar,
  Layers,
  Award,
  Clock,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { Exam, MaterialPassage, QuestionBankItem, TeacherDocument } from '../types/index.js';
import { PageId } from './Sidebar.js';

interface DashboardViewProps {
  exams: Exam[];
  materials: MaterialPassage[];
  questions: QuestionBankItem[];
  documents: TeacherDocument[];
  onNavigate: (page: PageId) => void;
  onPreviewExam: (exam: Exam) => void;
  onSelectMaterialToCreate: (mat: MaterialPassage) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  exams,
  materials,
  questions,
  documents,
  onNavigate,
  onPreviewExam,
  onSelectMaterialToCreate,
}) => {
  const recentExams = exams.slice(0, 4);

  // Stats calculation
  const gradeCounts = {
    '6': exams.filter(e => e.grade === '6').length,
    '7': exams.filter(e => e.grade === '7').length,
    '8': exams.filter(e => e.grade === '8').length,
    '9': exams.filter(e => e.grade === '9').length,
  };

  const textbookMap: Record<string, string> = {
    kntt: 'Kết nối tri thức',
    ctst: 'Chân trời sáng tạo',
    canh_dieu: 'Cánh Diều',
    all: 'Chương trình chung',
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d2238] via-[#153456] to-[#1c4470] text-white p-6 sm:p-8 shadow-md border border-[#214b7a]">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trợ lý AI chuyên biệt môn Ngữ Văn THCS · Chuẩn Công văn 3175/BGDĐT</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Biên soạn đề kiểm tra Ngữ văn thông minh, chuẩn quy cách sư phạm
          </h2>

          <p className="text-sm text-slate-200 leading-relaxed mb-6 max-w-2xl">
            Tự động tạo ma trận 2 chiều, bản đặc tả yêu cầu cần đạt GDPT 2018, ngữ liệu đọc hiểu ngoài SGK có xuất xứ chuẩn xác, câu hỏi phân hóa 4 mức độ nhận thức và hướng dẫn chấm chi tiết đến 0.25 điểm.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('create_exam')}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>Biên soạn đề mới ngay</span>
            </button>

            <button
              onClick={() => onNavigate('materials')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>Kho ngữ liệu ngoài SGK ({materials.length})</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Award className="w-72 h-72 text-amber-300 -mr-16" />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('exams')}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Đề thi đã lưu</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Files className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {exams.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Có ma trận &amp; bản đặc tả</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('materials')}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Ngữ liệu ngoài SGK</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {materials.length}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Đã thẩm định xuất xứ chuẩn
          </div>
        </div>

        <div
          onClick={() => onNavigate('questions')}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Ngân hàng câu hỏi</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileQuestion className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {questions.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Đọc hiểu, Tiếng Việt &amp; Viết
          </div>
        </div>

        <div
          onClick={() => onNavigate('documents')}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tài liệu giáo viên</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {documents.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Tệp PDF, DOCX, giáo án
          </div>
        </div>
      </div>

      {/* Main Sections: Recent Exams + Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Exams (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Đề kiểm tra đã biên soạn gần đây
                </h3>
                <p className="text-xs text-slate-500">
                  Xem lại, in ấn bản chuẩn hoặc tải file Word DOCX về máy
                </p>
              </div>

              <button
                onClick={() => onNavigate('exams')}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 group"
              >
                <span>Xem tất cả ({exams.length})</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {recentExams.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Chưa có đề thi nào. Hãy bấm "Tạo đề mới" để bắt đầu biên soạn.
              </div>
            ) : (
              <div className="space-y-3">
                {recentExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap text-xs text-slate-500">
                        <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                          Lớp {exam.grade}
                        </span>
                        <span className="font-medium text-slate-700">
                          {textbookMap[exam.textbook] || exam.textbook}
                        </span>
                        <span>·</span>
                        <span>Mã {exam.code}</span>
                        <span>·</span>
                        <span>{exam.durationMinutes} phút</span>
                      </div>

                      <h4
                        onClick={() => onPreviewExam(exam)}
                        className="text-sm font-bold text-slate-900 hover:text-blue-700 transition-colors cursor-pointer truncate"
                      >
                        {exam.title}
                      </h4>

                      <div className="text-xs text-slate-500 mt-1 truncate">
                        Ngữ liệu: "{exam.readingPassage.title}" ({exam.readingPassage.author})
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => onPreviewExam(exam)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                        <span>Xem &amp; In</span>
                      </button>

                      <a
                        href={`/api/exams/${exam.id}/export-docx`}
                        download
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải Word</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Phân loại theo khối:</span>
            <div className="flex items-center gap-3 font-semibold text-slate-700">
              <span>Lớp 6: {gradeCounts['6']}</span>
              <span>·</span>
              <span>Lớp 7: {gradeCounts['7']}</span>
              <span>·</span>
              <span>Lớp 8: {gradeCounts['8']}</span>
              <span>·</span>
              <span>Lớp 9: {gradeCounts['9']}</span>
            </div>
          </div>
        </div>

        {/* Right column: GDPT 2018 Guidelines */}
        <div className="space-y-4">
          <div className="bg-[#fcfaf7] rounded-xl border border-amber-200/70 p-5 shadow-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-2">
              <Award className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Chỉ đạo Công văn 3175/BGDĐT</span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed mb-3">
              "Trong đánh giá kết quả học tập cuối kì, cuối năm học, cuối cấp học, <strong>tránh dùng lại các văn bản đã học trong sách giáo khoa</strong> làm ngữ liệu xây dựng các đề kiểm tra đọc hiểu và viết để đánh giá chính xác khả năng đọc hiểu và viết của học sinh."
            </p>

            <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              💡 <strong>Văn Đề AI</strong> cam kết chỉ sử dụng ngữ liệu văn học thực tế đã được xuất bản ngoài SGK, không tự bịa đặt ngữ liệu.
            </div>
          </div>

          {/* Quick Start with Verified Materials */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider mb-3">
              Ngữ liệu tiêu biểu ngoài SGK
            </h4>
            <div className="space-y-2">
              {materials.slice(0, 3).map((mat) => (
                <div
                  key={mat.id}
                  onClick={() => onSelectMaterialToCreate(mat)}
                  className="p-2.5 rounded-lg border border-slate-100 hover:border-amber-300 hover:bg-amber-50/40 transition-colors cursor-pointer group"
                >
                  <div className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors truncate">
                    {mat.title}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between mt-0.5">
                    <span>{mat.author} · Lớp {mat.grade}</span>
                    <span className="text-amber-700 font-semibold group-hover:underline">
                      Dùng ra đề →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
