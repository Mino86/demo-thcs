import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit,
  ArrowRight,
  Sparkles,
  X,
  Save,
  Filter
} from 'lucide-react';
import { MaterialPassage, Grade, Textbook } from '../types/index.js';
import { api } from '../services/api.js';

interface MaterialBankViewProps {
  materials: MaterialPassage[];
  onSelectToCreate: (material: MaterialPassage) => void;
  onRefresh: () => Promise<void>;
}

export const MaterialBankView: React.FC<MaterialBankViewProps> = ({
  materials,
  onSelectToCreate,
  onRefresh,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // View modal state
  const [viewingMaterial, setViewingMaterial] = useState<MaterialPassage | null>(null);

  // Add/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    source: '',
    genre: 'Thơ lục bát',
    grade: '7' as Grade,
    textbook: 'kntt' as Textbook,
    theme: '',
    content: '',
    tags: '',
  });

  // Filter materials
  const filtered = materials.filter((m) => {
    if (selectedGrade !== 'all' && m.grade !== selectedGrade) return false;
    if (selectedGenre !== 'all' && m.genre !== selectedGenre) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        m.title.toLowerCase().includes(q) ||
        m.author.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q) ||
        m.source.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const allGenres = Array.from(new Set(materials.map((m) => m.genre)));

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: '',
      author: '',
      source: '',
      genre: 'Thơ bốn chữ / năm chữ',
      grade: '7',
      textbook: 'kntt',
      theme: 'Tình cảm gia đình',
      content: '',
      tags: 'Thơ hiện đại, Tình cảm gia đình',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: MaterialPassage) => {
    setEditingId(m.id);
    setFormData({
      title: m.title,
      author: m.author,
      source: m.source,
      genre: m.genre,
      grade: m.grade,
      textbook: m.textbook,
      theme: m.theme,
      content: m.content,
      tags: m.tags.join(', '),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa ngữ liệu này khỏi kho?')) {
      try {
        await api.deleteMaterial(id);
        await onRefresh();
        if (viewingMaterial?.id === id) setViewingMaterial(null);
      } catch (err) {
        alert('Lỗi xóa ngữ liệu');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Vui lòng nhập tên tác phẩm và nội dung văn bản.');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        author: formData.author || 'Khuyết danh',
        source: formData.source || 'Sưu tầm văn học',
        genre: formData.genre,
        grade: formData.grade,
        textbook: formData.textbook,
        theme: formData.theme,
        content: formData.content,
        wordCount: formData.content.split(/\s+/).filter(Boolean).length,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        isVerified: true,
      };

      if (editingId) {
        await api.updateMaterial(editingId, payload);
      } else {
        await api.createMaterial(payload);
      }

      await onRefresh();
      setIsModalOpen(false);
    } catch (err) {
      alert('Lỗi lưu ngữ liệu');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>Ngân hàng ngữ liệu đọc hiểu ngoài SGK</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kho tác phẩm thơ, truyện ngắn, tản văn, văn bản nghị luận đã thẩm định xuất xứ chuẩn xác theo Công văn 3175/BGDĐT.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-semibold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm ngữ liệu mới</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên tác phẩm, tác giả hoặc từ khóa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Grade Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Khối:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            {['all', '6', '7', '8', '9'].map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  selectedGrade === g
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {g === 'all' ? 'Tất cả' : `Lớp ${g}`}
              </button>
            ))}
          </div>
        </div>

        {/* Genre Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Thể loại:</span>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50"
          >
            <option value="all">Tất cả thể loại</option>
            {allGenres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">Không tìm thấy ngữ liệu phù hợp</h3>
          <p className="text-xs text-slate-500 mt-1">
            Hãy thử tìm với từ khóa khác hoặc bấm "Thêm ngữ liệu mới" để bổ sung vào kho.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((mat) => (
            <div
              key={mat.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                      Lớp {mat.grade}
                    </span>
                    <span className="text-slate-600 font-medium truncate">
                      {mat.genre}
                    </span>
                  </div>

                  {mat.isVerified && (
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã thẩm định</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3
                  onClick={() => setViewingMaterial(mat)}
                  className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors cursor-pointer line-clamp-1"
                >
                  {mat.title}
                </h3>

                {/* Author & Source */}
                <div className="text-xs text-slate-500 italic mt-1 line-clamp-1">
                  Tác giả: <strong className="text-slate-700 font-semibold">{mat.author}</strong>
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {mat.source}
                </div>

                {/* Content snippet */}
                <p className="text-xs font-serif text-slate-700 mt-3 line-clamp-4 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {mat.content}
                </p>
              </div>

              {/* Action footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(mat)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(mat.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingMaterial(mat)}
                    className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Xem toàn văn
                  </button>

                  <button
                    onClick={() => onSelectToCreate(mat)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-xs transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Dùng ra đề</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODAL */}
      {viewingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
            <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-300 font-medium">
                  NGỮ LIỆU ĐỌC HIỂU · LỚP {viewingMaterial.grade} · {viewingMaterial.genre}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {viewingMaterial.title}
                </h3>
              </div>
              <button
                onClick={() => setViewingMaterial(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="text-xs text-slate-600 flex flex-wrap gap-4 pb-3 border-b border-slate-100">
                <span>Tác giả: <strong className="text-slate-900">{viewingMaterial.author}</strong></span>
                <span>Xuất xứ: <strong className="text-slate-900">{viewingMaterial.source}</strong></span>
                <span>Số chữ: <strong className="text-slate-900">{viewingMaterial.wordCount}</strong></span>
              </div>

              <div className="font-serif text-[14px] text-slate-800 leading-relaxed whitespace-pre-line text-justify p-4 bg-slate-50/70 rounded-xl border border-slate-200">
                {viewingMaterial.content}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {viewingMaterial.tags.map((tag, i) => (
                  <span key={i} className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setViewingMaterial(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  const m = viewingMaterial;
                  setViewingMaterial(null);
                  onSelectToCreate(m);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Chuyển sang soạn đề với ngữ liệu này</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleSave}
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200"
          >
            <div className="p-4 px-6 bg-[#0f2942] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingId ? 'Chỉnh sửa ngữ liệu đọc hiểu' : 'Thêm mới ngữ liệu đọc hiểu'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tên tác phẩm / Tựa đề bài thơ, đoạn trích *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tác giả *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nguồn xuất bản / Trích dẫn chuẩn *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Khối lớp phù hợp
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value as Grade })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="6">Lớp 6</option>
                    <option value="7">Lớp 7</option>
                    <option value="8">Lớp 8</option>
                    <option value="9">Lớp 9</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Thể loại văn học
                  </label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Toàn văn nội dung ngữ liệu đọc hiểu *
                </label>
                <textarea
                  rows={8}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full font-serif text-xs border border-slate-300 rounded-lg p-3 leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Thẻ từ khóa (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="VD: Tình mẫu tử, Thơ lục bát, Biện pháp tu từ..."
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
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
                <span>Lưu ngữ liệu</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
