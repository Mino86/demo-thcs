import React, { useState } from 'react';
import {
  FileQuestion,
  Plus,
  Search,
  Trash2,
  CheckCircle,
  HelpCircle,
  X,
  Save,
  Tag
} from 'lucide-react';
import { QuestionBankItem, Grade, CognitiveLevel } from '../types/index.js';
import { api } from '../services/api.js';

interface QuestionBankViewProps {
  questions: QuestionBankItem[];
  onRefresh: () => Promise<void>;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  questions,
  onRefresh,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedStrand, setSelectedStrand] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    grade: '7' as Grade,
    strand: 'doc_hieu' as 'doc_hieu' | 'tieng_viet' | 'viet',
    cognitiveLevel: 'thong_hieu' as CognitiveLevel,
    questionType: 'tu_luan' as 'trac_nghiem' | 'tu_luan',
    genre: 'Thơ ca',
    prompt: '',
    options: ['', '', '', ''],
    answer: '',
    guide: '',
    maxScore: 1.0,
    tags: '',
  });

  const levelMap: Record<CognitiveLevel, { label: string; color: string }> = {
    nhan_biet: { label: 'Nhận biết', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    thong_hieu: { label: 'Thông hiểu', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    van_dung: { label: 'Vận dụng', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    van_dung_cao: { label: 'Vận dụng cao', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  };

  const strandMap: Record<string, string> = {
    doc_hieu: 'Đọc hiểu văn bản',
    tieng_viet: 'Tiếng Việt',
    viet: 'Tập làm văn / Viết',
  };

  const filtered = questions.filter((q) => {
    if (selectedGrade !== 'all' && q.grade !== selectedGrade) return false;
    if (selectedStrand !== 'all' && q.strand !== selectedStrand) return false;
    if (selectedLevel !== 'all' && q.cognitiveLevel !== selectedLevel) return false;
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();
      const match =
        q.prompt.toLowerCase().includes(s) ||
        q.answer.toLowerCase().includes(s) ||
        (q.tags && q.tags.some((t) => t.toLowerCase().includes(s)));
      if (!match) return false;
    }
    return true;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng?')) {
      try {
        await api.deleteQuestion(id);
        await onRefresh();
      } catch (err) {
        alert('Lỗi xóa câu hỏi');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prompt || !formData.answer) {
      alert('Vui lòng nhập nội dung câu hỏi và đáp án.');
      return;
    }

    try {
      const payload = {
        grade: formData.grade,
        strand: formData.strand,
        cognitiveLevel: formData.cognitiveLevel,
        questionType: formData.questionType,
        genre: formData.genre,
        prompt: formData.prompt,
        options: formData.questionType === 'trac_nghiem' ? formData.options : undefined,
        answer: formData.answer,
        guide: formData.guide,
        maxScore: Number(formData.maxScore),
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      await api.createQuestion(payload);
      await onRefresh();
      setIsModalOpen(false);
    } catch (err) {
      alert('Lỗi lưu câu hỏi');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-purple-600" />
            <span>Ngân hàng câu hỏi đánh giá năng lực</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kho câu hỏi phân loại theo 4 mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao) bám sát Yêu cầu cần đạt.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-semibold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm câu hỏi mới</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo nội dung câu hỏi, từ khóa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Grade */}
        <div className="flex items-center gap-1.5 text-xs">
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

        {/* Strand */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-slate-500">Mạch:</span>
          <select
            value={selectedStrand}
            onChange={(e) => setSelectedStrand(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50"
          >
            <option value="all">Tất cả mạch</option>
            <option value="doc_hieu">Đọc hiểu</option>
            <option value="tieng_viet">Tiếng Việt</option>
            <option value="viet">Viết</option>
          </select>
        </div>

        {/* Level */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-slate-500">Mức độ:</span>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="nhan_biet">Nhận biết</option>
            <option value="thong_hieu">Thông hiểu</option>
            <option value="van_dung">Vận dụng</option>
            <option value="van_dung_cao">Vận dụng cao</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8">
          <FileQuestion className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">Chưa có câu hỏi nào khớp với bộ lọc</h3>
          <p className="text-xs text-slate-500 mt-1">
            Bấm "Thêm câu hỏi mới" để bổ sung câu hỏi vào ngân hàng.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => {
            const levelInfo = levelMap[q.cognitiveLevel];
            return (
              <div
                key={q.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                      Lớp {q.grade}
                    </span>
                    <span className="font-semibold text-slate-700">
                      {strandMap[q.strand]}
                    </span>
                    <span>·</span>
                    <span className={`px-2 py-0.5 rounded font-medium border text-[11px] ${levelInfo.color}`}>
                      {levelInfo.label}
                    </span>
                    <span>·</span>
                    <span className="text-slate-500 text-[11px]">
                      {q.questionType === 'trac_nghiem' ? 'Trắc nghiệm' : 'Tự luận'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {q.maxScore} điểm
                    </span>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Prompt */}
                <div className="text-xs text-slate-900 font-semibold leading-relaxed">
                  {q.prompt}
                </div>

                {/* Options if MC */}
                {q.questionType === 'trac_nghiem' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-3 border-l-2 border-amber-400 text-xs text-slate-700">
                    {q.options.map((opt, i) => {
                      const letters = ['A', 'B', 'C', 'D'];
                      return (
                        <div key={i}>
                          <strong>{letters[i]}.</strong> {opt}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Answer & Guide */}
                <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                  <div>
                    <strong className="text-emerald-700">Đáp án:</strong>{' '}
                    <span className="text-slate-800">{q.answer}</span>
                  </div>
                  {q.guide && (
                    <div className="text-slate-500 italic text-[11px]">
                      Hướng dẫn chấm: {q.guide}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {q.tags && q.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {q.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ADD QUESTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleSave}
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200"
          >
            <div className="p-4 px-6 bg-[#0f2942] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Thêm câu hỏi mới vào ngân hàng</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Khối lớp</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value as Grade })}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                  >
                    <option value="6">Lớp 6</option>
                    <option value="7">Lớp 7</option>
                    <option value="8">Lớp 8</option>
                    <option value="9">Lớp 9</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mạch kĩ năng</label>
                  <select
                    value={formData.strand}
                    onChange={(e) => setFormData({ ...formData, strand: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                  >
                    <option value="doc_hieu">Đọc hiểu</option>
                    <option value="tieng_viet">Tiếng Việt</option>
                    <option value="viet">Tập làm văn</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mức độ tư duy</label>
                  <select
                    value={formData.cognitiveLevel}
                    onChange={(e) => setFormData({ ...formData, cognitiveLevel: e.target.value as CognitiveLevel })}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                  >
                    <option value="nhan_biet">Nhận biết</option>
                    <option value="thong_hieu">Thông hiểu</option>
                    <option value="van_dung">Vận dụng</option>
                    <option value="van_dung_cao">Vận dụng cao</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hình thức</label>
                  <select
                    value={formData.questionType}
                    onChange={(e) => setFormData({ ...formData, questionType: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                  >
                    <option value="tu_luan">Tự luận</option>
                    <option value="trac_nghiem">Trắc nghiệm</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nội dung câu hỏi *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              {formData.questionType === 'trac_nghiem' && (
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="block font-semibold text-slate-700">4 Phương án trắc nghiệm:</label>
                  {formData.options.map((opt, i) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 w-4">{letters[i]}.</span>
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...formData.options];
                            newOpts[i] = e.target.value;
                            setFormData({ ...formData, options: newOpts });
                          }}
                          className="flex-1 border border-slate-300 rounded px-2 py-1 bg-white"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Đáp án đúng *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    placeholder={formData.questionType === 'trac_nghiem' ? 'VD: A, B, C hoặc D' : 'Nội dung trả lời chi tiết'}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Điểm tối đa
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hướng dẫn chấm &amp; barem phân hóa
                </label>
                <textarea
                  rows={2}
                  value={formData.guide}
                  onChange={(e) => setFormData({ ...formData, guide: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 italic"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Thẻ từ khóa
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="VD: Thơ 4 chữ, Biện pháp tu từ, So sánh..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Lưu câu hỏi</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
