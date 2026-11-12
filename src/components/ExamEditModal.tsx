import React, { useState } from 'react';
import { X, Save, Plus, Trash2, CheckCircle, FileText, HelpCircle } from 'lucide-react';
import { Exam, ReadingQuestion, WritingCriterion } from '../types/index.js';

interface ExamEditModalProps {
  exam: Exam;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedExam: Exam) => Promise<void>;
}

export const ExamEditModal: React.FC<ExamEditModalProps> = ({
  exam,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Exam>(JSON.parse(JSON.stringify(exam)));
  const [activeTab, setActiveTab] = useState<'info' | 'passage' | 'questions' | 'writing'>('info');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      alert('Lỗi lưu đề thi');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateQuestion = (index: number, field: keyof ReadingQuestion, value: any) => {
    const updated = [...formData.readingQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, readingQuestions: updated });
  };

  const handleUpdateOption = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...formData.readingQuestions];
    const opts = [...(updated[qIndex].options || [])];
    opts[optIndex] = value;
    updated[qIndex] = { ...updated[qIndex], options: opts };
    setFormData({ ...formData, readingQuestions: updated });
  };

  const handleDeleteQuestion = (index: number) => {
    const updated = formData.readingQuestions.filter((_, i) => i !== index);
    setFormData({ ...formData, readingQuestions: updated });
  };

  const handleAddQuestion = () => {
    const newQ: ReadingQuestion = {
      id: `q-${Date.now()}`,
      number: formData.readingQuestions.length + 1,
      type: 'tu_luan',
      cognitiveLevel: 'thong_hieu',
      strand: 'doc_hieu',
      question: 'Câu hỏi mới của giáo viên...',
      answer: 'Gợi ý câu trả lời...',
      guide: 'Hướng dẫn chấm điểm...',
      score: 1.0,
    };
    setFormData({
      ...formData,
      readingQuestions: [...formData.readingQuestions, newQ],
    });
  };

  const handleUpdateRubric = (index: number, field: keyof WritingCriterion, value: any) => {
    const criteria = [...(formData.writingQuestion.rubricCriteria || [])];
    criteria[index] = { ...criteria[index], [field]: value };
    setFormData({
      ...formData,
      writingQuestion: { ...formData.writingQuestion, rubricCriteria: criteria },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-4 sm:px-6 bg-[#0f2942] text-white flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <span>Chỉnh sửa và Duyệt đề kiểm tra</span>
              <span className="text-xs bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded">
                Mã {formData.code}
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Giáo viên duyệt kỹ văn bản, câu hỏi và đáp án trước khi ban hành chính thức.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'info' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Thông tin chung
          </button>
          <button
            onClick={() => setActiveTab('passage')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'passage' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Ngữ liệu đọc hiểu
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'questions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Câu hỏi đọc hiểu ({formData.readingQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab('writing')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'writing' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Phần Viết &amp; Rubric
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: General Info */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu đề đề kiểm tra
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trường THCS
                </label>
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phòng / Sở GD&amp;ĐT
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã đề thi
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thời gian làm bài (phút)
                </label>
                <input
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Điểm Đọc hiểu
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.readingScore}
                  onChange={(e) => setFormData({ ...formData, readingScore: Number(e.target.value) })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Điểm Viết
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.writingScore}
                  onChange={(e) => setFormData({ ...formData, writingScore: Number(e.target.value) })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trạng thái duyệt
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="draft">Bản dự thảo (Đang biên soạn)</option>
                  <option value="reviewed">Đã thẩm định chuyên môn</option>
                  <option value="approved">Đã phê duyệt chính thức</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Giáo viên ra đề
                </label>
                <input
                  type="text"
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Reading Passage */}
          {activeTab === 'passage' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên tác phẩm / Nhan đề
                  </label>
                  <input
                    type="text"
                    value={formData.readingPassage.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        readingPassage: { ...formData.readingPassage, title: e.target.value },
                      })
                    }
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tác giả
                  </label>
                  <input
                    type="text"
                    value={formData.readingPassage.author}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        readingPassage: { ...formData.readingPassage, author: e.target.value },
                      })
                    }
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nguồn xuất bản / Xuất xứ
                  </label>
                  <input
                    type="text"
                    value={formData.readingPassage.source}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        readingPassage: { ...formData.readingPassage, source: e.target.value },
                      })
                    }
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Toàn văn ngữ liệu trích dẫn
                </label>
                <textarea
                  rows={10}
                  value={formData.readingPassage.content}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      readingPassage: { ...formData.readingPassage, content: e.target.value },
                    })
                  }
                  className="w-full text-sm font-serif border border-slate-300 rounded-lg p-3 leading-relaxed focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Questions */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">
                  Danh sách câu hỏi đọc hiểu &amp; Tiếng Việt
                </span>
                <button
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm câu hỏi mới</span>
                </button>
              </div>

              {formData.readingQuestions.map((q, idx) => (
                <div key={q.id || idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        Câu {idx + 1}
                      </span>
                      <select
                        value={q.type}
                        onChange={(e) => handleUpdateQuestion(idx, 'type', e.target.value)}
                        className="text-xs border border-slate-300 rounded bg-white px-2 py-1"
                      >
                        <option value="trac_nghiem">Trắc nghiệm</option>
                        <option value="tu_luan">Tự luận</option>
                      </select>
                      <select
                        value={q.cognitiveLevel}
                        onChange={(e) => handleUpdateQuestion(idx, 'cognitiveLevel', e.target.value)}
                        className="text-xs border border-slate-300 rounded bg-white px-2 py-1"
                      >
                        <option value="nhan_biet">Nhận biết</option>
                        <option value="thong_hieu">Thông hiểu</option>
                        <option value="van_dung">Vận dụng</option>
                        <option value="van_dung_cao">Vận dụng cao</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-slate-600">Điểm:</span>
                        <input
                          type="number"
                          step="0.25"
                          value={q.score}
                          onChange={(e) => handleUpdateQuestion(idx, 'score', Number(e.target.value))}
                          className="w-16 border border-slate-300 rounded px-1.5 py-0.5 text-center bg-white"
                        />
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(idx)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Nội dung câu hỏi
                    </label>
                    <textarea
                      rows={2}
                      value={q.question}
                      onChange={(e) => handleUpdateQuestion(idx, 'question', e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>

                  {/* Options if Multiple Choice */}
                  {q.type === 'trac_nghiem' && q.options && (
                    <div className="space-y-1.5 pl-2 border-l-2 border-amber-400">
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Các phương án lựa chọn:
                      </label>
                      {q.options.map((opt, optIdx) => {
                        const letters = ['A', 'B', 'C', 'D'];
                        return (
                          <div key={optIdx} className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700 w-4">
                              {letters[optIdx]}.
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleUpdateOption(idx, optIdx, e.target.value)}
                              className="flex-1 text-xs border border-slate-300 rounded px-2 py-1 bg-white"
                            />
                          </div>
                        );
                      })}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-bold text-emerald-700">Đáp án đúng:</span>
                        <select
                          value={q.answer}
                          onChange={(e) => handleUpdateQuestion(idx, 'answer', e.target.value)}
                          className="text-xs font-bold border border-emerald-400 rounded px-2 py-1 bg-emerald-50 text-emerald-900"
                        >
                          <option value="A">Phương án A</option>
                          <option value="B">Phương án B</option>
                          <option value="C">Phương án C</option>
                          <option value="D">Phương án D</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Answer / Guide */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.type === 'tu_luan' && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Đáp án chi tiết
                        </label>
                        <textarea
                          rows={2}
                          value={q.answer}
                          onChange={(e) => handleUpdateQuestion(idx, 'answer', e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                        />
                      </div>
                    )}
                    <div className={q.type === 'trac_nghiem' ? 'sm:col-span-2' : ''}>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        Hướng dẫn chấm &amp; Phân hóa barem điểm
                      </label>
                      <textarea
                        rows={2}
                        value={q.guide}
                        onChange={(e) => handleUpdateQuestion(idx, 'guide', e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white italic"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: Writing Section */}
          {activeTab === 'writing' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đề bài Tập làm văn / Viết
                </label>
                <textarea
                  rows={3}
                  value={formData.writingQuestion.topic}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      writingQuestion: { ...formData.writingQuestion, topic: e.target.value },
                    })
                  }
                  className="w-full text-sm border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Yêu cầu bắt buộc đối với học sinh
                </label>
                <input
                  type="text"
                  value={formData.writingQuestion.requirements}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      writingQuestion: { ...formData.writingQuestion, requirements: e.target.value },
                    })
                  }
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hướng dẫn chấm tổng quát
                </label>
                <textarea
                  rows={2}
                  value={formData.writingQuestion.guide}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      writingQuestion: { ...formData.writingQuestion, guide: e.target.value },
                    })
                  }
                  className="w-full text-sm border border-slate-300 rounded-lg p-2 italic"
                />
              </div>

              {/* Rubric criteria */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase mb-2">
                  Tiêu chí Rubric đánh giá bài viết
                </h4>
                <div className="space-y-2">
                  {formData.writingQuestion.rubricCriteria?.map((crit, idx) => (
                    <div key={idx} className="p-3 border border-slate-200 rounded-lg bg-slate-50 flex items-center gap-3">
                      <input
                        type="text"
                        value={crit.name}
                        onChange={(e) => handleUpdateRubric(idx, 'name', e.target.value)}
                        className="w-48 text-xs font-bold border border-slate-300 rounded px-2 py-1 bg-white"
                      />
                      <input
                        type="text"
                        value={crit.description}
                        onChange={(e) => handleUpdateRubric(idx, 'description', e.target.value)}
                        className="flex-1 text-xs border border-slate-300 rounded px-2 py-1 bg-white"
                      />
                      <input
                        type="number"
                        step="0.25"
                        value={crit.score}
                        onChange={(e) => handleUpdateRubric(idx, 'score', Number(e.target.value))}
                        className="w-16 text-xs text-center border border-slate-300 rounded px-2 py-1 bg-white font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {saveSuccess ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Đã lưu các thay đổi thành công!
              </span>
            ) : (
              <span>Kiểm tra thang điểm khớp với tổng số điểm đề thi trước khi lưu.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded-xl transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu và Cập nhật'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
