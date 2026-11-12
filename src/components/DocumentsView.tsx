import React, { useState, useRef } from 'react';
import {
  FolderArchive,
  Upload,
  FileText,
  FileSpreadsheet,
  File,
  Trash2,
  Sparkles,
  X,
  Search,
  CheckCircle2,
  Clock,
  BookOpen
} from 'lucide-react';
import { TeacherDocument, Grade, Textbook, MaterialPassage } from '../types/index.js';
import { api } from '../services/api.js';

interface DocumentsViewProps {
  documents: TeacherDocument[];
  onRefresh: () => Promise<void>;
  onSelectPassageToCreate: (mat: MaterialPassage) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onRefresh,
  onSelectPassageToCreate,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [viewingDoc, setViewingDoc] = useState<TeacherDocument | null>(null);

  // Form for new upload
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docGrade, setDocGrade] = useState<Grade>('7');
  const [docTextbook, setDocTextbook] = useState<Textbook>('kntt');
  const [docTheme, setDocTheme] = useState('');
  const [docContent, setDocContent] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileType, setSelectedFileType] = useState<'pdf' | 'docx' | 'txt'>('txt');
  const [fileSize, setFileSize] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setFileSize(file.size);
    if (!docTitle) {
      setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') setSelectedFileType('pdf');
    else if (ext === 'docx' || ext === 'doc') setSelectedFileType('docx');
    else setSelectedFileType('txt');

    // Read content if txt
    if (file.type === 'text/plain' || ext === 'txt') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setDocContent(text);
      };
      reader.readAsText(file);
    } else {
      // For PDF / DOCX, provide a text extraction area or instructions
      setDocContent(
        `[Nội dung tệp ${file.name}]\nBạn có thể dán trích đoạn văn bản từ tệp này vào đây để AI sử dụng làm căn cứ biên soạn đề kiểm tra.`
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) {
      alert('Vui lòng nhập tên tài liệu.');
      return;
    }

    setIsUploading(true);
    try {
      await api.uploadDocument({
        title: docTitle,
        fileName: selectedFileName || `${docTitle}.${selectedFileType}`,
        fileType: selectedFileType,
        fileSize: fileSize || 1024,
        grade: docGrade,
        textbook: docTextbook,
        theme: docTheme || 'Chung',
        extractedText: docContent || '',
      });

      await onRefresh();
      setIsModalOpen(false);
      setDocTitle('');
      setDocContent('');
      setSelectedFileName('');
    } catch (err) {
      alert('Lỗi tải lên tài liệu');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Bạn có chắc muốn xóa tài liệu "${title}"?`)) {
      try {
        await api.deleteDocument(id);
        await onRefresh();
        if (viewingDoc?.id === id) setViewingDoc(null);
      } catch (err) {
        alert('Lỗi xóa tài liệu');
      }
    }
  };

  const handleUseForExam = (doc: TeacherDocument) => {
    // Convert document text to a passage format and send to Create Exam view
    const passage: MaterialPassage = {
      id: `doc-passage-${Date.now()}`,
      title: doc.title,
      author: 'Tài liệu giáo viên',
      source: `Tệp tham khảo: ${doc.fileName}`,
      genre: doc.theme || 'Văn bản văn học',
      grade: doc.grade,
      textbook: doc.textbook,
      theme: doc.theme,
      content: doc.extractedText || 'Nội dung từ tài liệu giáo viên cung cấp.',
      wordCount: (doc.extractedText || '').split(/\s+/).filter(Boolean).length,
      tags: ['Tài liệu tải lên', `Lớp ${doc.grade}`],
      isVerified: true,
      createdAt: new Date().toISOString(),
    };
    onSelectPassageToCreate(passage);
  };

  const filtered = documents.filter((d) => {
    if (selectedGrade !== 'all' && d.grade !== selectedGrade) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        d.title.toLowerCase().includes(q) ||
        d.fileName.toLowerCase().includes(q) ||
        d.theme.toLowerCase().includes(q) ||
        d.extractedText.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-amber-600" />
            <span>Tài liệu tham khảo &amp; Giáo án Ngữ văn</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý kho tệp PDF, DOCX, TXT để làm nguồn tư liệu trích dẫn đề thi theo khối lớp, bộ sách và chuyên đề.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-semibold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Tải lên tài liệu mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên tài liệu, tệp, chủ đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Grade */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-slate-500">Khối lớp:</span>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50"
          >
            <option value="all">Tất cả khối lớp</option>
            <option value="6">Lớp 6</option>
            <option value="7">Lớp 7</option>
            <option value="8">Lớp 8</option>
            <option value="9">Lớp 9</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8">
          <FolderArchive className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">Chưa có tài liệu nào trong thư viện</h3>
          <p className="text-xs text-slate-500 mt-1">
            Bấm "Tải lên tài liệu mới" để bổ sung tệp PDF, Word DOCX hoặc TXT làm nguồn tham khảo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                      Lớp {doc.grade}
                    </span>
                    <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {doc.fileType}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {(doc.fileSize / 1024).toFixed(0)} KB
                  </span>
                </div>

                <h3
                  onClick={() => setViewingDoc(doc)}
                  className="text-sm font-bold text-slate-900 hover:text-blue-700 transition-colors cursor-pointer line-clamp-1"
                >
                  {doc.title}
                </h3>
                <div className="text-xs text-slate-500 mt-0.5 truncate">
                  Tệp: {doc.fileName}
                </div>
                {doc.theme && (
                  <div className="text-xs text-amber-800 bg-amber-50/70 px-2 py-0.5 rounded mt-2 inline-block">
                    Chủ đề: {doc.theme}
                  </div>
                )}

                <p className="text-xs text-slate-600 line-clamp-3 mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-serif">
                  {doc.extractedText || 'Chưa có nội dung văn bản trích xuất.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleDelete(doc.id, doc.title)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  title="Xóa tài liệu"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingDoc(doc)}
                    className="px-2.5 py-1.5 text-xs text-slate-700 hover:text-slate-900 font-medium"
                  >
                    Xem nội dung
                  </button>
                  <button
                    onClick={() => handleUseForExam(doc)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-xs"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Lấy làm đề</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW DOCUMENT CONTENT MODAL */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
            <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-300 font-medium">
                  TÀI LIỆU THAM KHẢO · LỚP {viewingDoc.grade} · {viewingDoc.fileType.toUpperCase()}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {viewingDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="text-xs text-slate-500 flex items-center justify-between pb-3 border-b border-slate-100">
                <span>Tên tệp gốc: <strong>{viewingDoc.fileName}</strong></span>
                <span>Chủ đề: <strong>{viewingDoc.theme}</strong></span>
              </div>

              <div className="font-serif text-xs text-slate-800 leading-relaxed whitespace-pre-line p-4 bg-slate-50 rounded-xl border border-slate-200">
                {viewingDoc.extractedText}
              </div>
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200"
              >
                Đóng
              </button>

              <button
                onClick={() => {
                  const d = viewingDoc;
                  setViewingDoc(null);
                  handleUseForExam(d);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Chuyển sang soạn đề thi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200"
          >
            <div className="p-4 px-6 bg-[#0f2942] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Tải lên tài liệu giáo viên</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* File picker */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-amber-50/30"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <div className="font-bold text-slate-800">
                  {selectedFileName ? selectedFileName : 'Chọn tệp PDF, DOCX, TXT từ máy tính'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Hỗ trợ tài liệu tham khảo, tuyển tập văn bản ngoài SGK hoặc giáo án chuyên đề
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên tài liệu / Tiêu đề chuyên đề *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Tuyển tập văn học thiếu nhi thế kỷ 20..."
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Khối lớp</label>
                  <select
                    value={docGrade}
                    onChange={(e) => setDocGrade(e.target.value as Grade)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
                  >
                    <option value="6">Lớp 6</option>
                    <option value="7">Lớp 7</option>
                    <option value="8">Lớp 8</option>
                    <option value="9">Lớp 9</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bộ sách</label>
                  <select
                    value={docTextbook}
                    onChange={(e) => setDocTextbook(e.target.value as Textbook)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
                  >
                    <option value="kntt">Kết nối tri thức</option>
                    <option value="ctst">Chân trời sáng tạo</option>
                    <option value="canh_dieu">Cánh Diều</option>
                    <option value="all">Chung GDPT 2018</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chủ đề / Chuyên đề kiến thức
                </label>
                <input
                  type="text"
                  placeholder="VD: Thơ lục bát, Truyện ngắn, Tình mẫu tử..."
                  value={docTheme}
                  onChange={(e) => setDocTheme(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nội dung văn bản trích xuất / Ghi chú ngữ liệu
                </label>
                <textarea
                  rows={5}
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Dán nội dung văn bản từ tệp vào đây..."
                  className="w-full font-serif text-xs border border-slate-300 rounded-lg p-2.5"
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
                disabled={isUploading}
                className="flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs disabled:opacity-60"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Đang lưu...' : 'Lưu tài liệu'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
