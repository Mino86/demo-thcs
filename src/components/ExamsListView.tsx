import React, { useState } from 'react';
import {
  Files,
  Search,
  Printer,
  Download,
  Edit3,
  Copy,
  Trash2,
  Plus,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { Exam, Grade, Textbook, ExamType } from '../types/index.js';
import { api } from '../services/api.js';

interface ExamsListViewProps {
  exams: Exam[];
  onNavigateToCreate: () => void;
  onPreviewExam: (exam: Exam) => void;
  onEditExam: (exam: Exam) => void;
  onRefresh: () => Promise<void>;
}

export const ExamsListView: React.FC<ExamsListViewProps> = ({
  exams,
  onNavigateToCreate,
  onPreviewExam,
  onEditExam,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedTextbook, setSelectedTextbook] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const textbookMap: Record<string, string> = {
    kntt: 'Kết nối tri thức',
    ctst: 'Chân trời sáng tạo',
    canh_dieu: 'Cánh Diều',
    all: 'Chung GDPT 2018',
  };

  const examTypeMap: Record<string, string> = {
    giua_ky_1: 'Giữa HK I',
    cuoi_ky_1: 'Cuối HK I',
    giua_ky_2: 'Giữa HK II',
    cuoi_ky_2: 'Cuối HK II',
    thuong_xuyen: 'Thường xuyên',
    on_tap: 'Khảo sát / Ôn tập',
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    draft: { label: 'Bản dự thảo', color: 'bg-slate-100 text-slate-700' },
    reviewed: { label: 'Đã thẩm định', color: 'bg-blue-50 text-blue-700' },
    approved: { label: 'Đã phê duyệt', color: 'bg-emerald-50 text-emerald-700' },
  };

  const filtered = exams.filter((e) => {
    if (selectedGrade !== 'all' && e.grade !== selectedGrade) return false;
    if (selectedTextbook !== 'all' && e.textbook !== selectedTextbook) return false;
    if (selectedType !== 'all' && e.examType !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        e.title.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        e.readingPassage.title.toLowerCase().includes(q) ||
        e.readingPassage.author.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa bộ đề "${title}"? Thao tác này không thể hoàn tác.`)) {
      try {
        await api.deleteExam(id);
        await onRefresh();
      } catch (err) {
        alert('Lỗi xóa đề thi');
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.duplicateExam(id);
      await onRefresh();
    } catch (err) {
      alert('Lỗi nhân bản đề thi');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Files className="w-5 h-5 text-blue-600" />
            <span>Quản lý đề kiểm tra Ngữ văn đã biên soạn</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Xem trước bản in chuẩn, kiểm duyệt nội dung, nhân bản và tải file Word (.DOCX) về máy.
          </p>
        </div>

        <button
          onClick={onNavigateToCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Biên soạn đề mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên đề, mã đề, tác phẩm, tác giả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Grade */}
        <div className="flex items-center gap-1 text-xs">
          <span className="font-semibold text-slate-500">Khối:</span>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50"
          >
            <option value="all">Tất cả khối</option>
            <option value="6">Lớp 6</option>
            <option value="7">Lớp 7</option>
            <option value="8">Lớp 8</option>
            <option value="9">Lớp 9</option>
          </select>
        </div>

        {/* Textbook */}
        <div className="flex items-center gap-1 text-xs">
          <span className="font-semibold text-slate-500">Bộ sách:</span>
          <select
            value={selectedTextbook}
            onChange={(e) => setSelectedTextbook(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50"
          >
            <option value="all">Tất cả bộ sách</option>
            <option value="kntt">Kết nối tri thức</option>
            <option value="ctst">Chân trời sáng tạo</option>
            <option value="canh_dieu">Cánh Diều</option>
          </select>
        </div>

        {/* Exam Type */}
        <div className="flex items-center gap-1 text-xs">
          <span className="font-semibold text-slate-500">Kỳ thi:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50"
          >
            <option value="all">Tất cả kỳ thi</option>
            <option value="giua_ky_1">Giữa HK I</option>
            <option value="cuoi_ky_1">Cuối HK I</option>
            <option value="giua_ky_2">Giữa HK II</option>
            <option value="cuoi_ky_2">Cuối HK II</option>
            <option value="thuong_xuyen">Thường xuyên</option>
          </select>
        </div>
      </div>

      {/* Exams Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8">
          <Files className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">Chưa có đề thi nào trong danh mục này</h3>
          <p className="text-xs text-slate-500 mt-1">
            Bấm "Biên soạn đề mới" để tạo đề với sự hỗ trợ của trợ lý AI.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((exam) => {
            const statusInfo = statusMap[exam.status] || statusMap['draft'];
            return (
              <div
                key={exam.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Info */}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                    <span className="font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded">
                      Lớp {exam.grade}
                    </span>
                    <span className="font-semibold text-slate-700">
                      {textbookMap[exam.textbook] || exam.textbook}
                    </span>
                    <span>·</span>
                    <span className="text-slate-600 font-medium">
                      {examTypeMap[exam.examType] || exam.examType}
                    </span>
                    <span>·</span>
                    <span>Mã đề: <strong className="text-red-600 font-mono">{exam.code}</strong></span>
                    <span>·</span>
                    <span>{exam.durationMinutes} phút</span>
                    <span>·</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <h3
                    onClick={() => onPreviewExam(exam)}
                    className="text-base font-bold text-slate-900 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    {exam.title}
                  </h3>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                    <span>
                      Ngữ liệu đọc hiểu: <strong className="text-slate-800 font-serif">"{exam.readingPassage.title}"</strong> ({exam.readingPassage.author})
                    </span>
                    <span>·</span>
                    <span>{exam.readingQuestions.length} câu đọc hiểu ({exam.readingScore}đ) + Viết ({exam.writingScore}đ)</span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => onEditExam(exam)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                    title="Chỉnh sửa chi tiết"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Duyệt &amp; Sửa</span>
                  </button>

                  <button
                    onClick={() => onPreviewExam(exam)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
                    title="Xem trước & In"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-300" />
                    <span>Xem &amp; In</span>
                  </button>

                  <a
                    href={`/api/exams/${exam.id}/export-docx`}
                    download
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
                    title="Tải file Word (.DOCX)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải DOCX</span>
                  </a>

                  <button
                    onClick={() => handleDuplicate(exam.id)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Nhân bản đề (Tạo mã đề mới)"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(exam.id, exam.title)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa đề"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
