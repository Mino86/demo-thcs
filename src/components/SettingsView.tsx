import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Building,
  User,
  Clock,
  ShieldCheck,
  FileText,
  Type,
  BookOpen,
  Award
} from 'lucide-react';
import { AppSettings } from '../types/index.js';
import { api } from '../services/api.js';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => Promise<void>;
  hasApiKey: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  hasApiKey,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      alert('Lỗi lưu cài đặt');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-700" />
          <span>Cài đặt hệ thống &amp; Mẫu phôi đề thi</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Tùy chỉnh thông tin đơn vị trường học, phông chữ bản in và các thông số mặc định cho đề kiểm tra.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: School & Teacher Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Thông tin đơn vị trường học &amp; Giáo viên</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tên trường THCS *
              </label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                placeholder="VD: THCS Nguyễn Du"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phòng / Sở Giáo dục và Đào tạo *
              </label>
              <input
                type="text"
                required
                value={formData.districtName}
                onChange={(e) => setFormData({ ...formData, districtName: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                placeholder="VD: Phòng GD&ĐT Quận Hoàn Kiếm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tổ chuyên môn
              </label>
              <input
                type="text"
                value={formData.departmentName}
                onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                placeholder="VD: Tổ Ngữ Văn"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Họ và tên giáo viên ra đề
              </label>
              <input
                type="text"
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                placeholder="VD: Cô Nguyễn Thị Thu Hà"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Năm học hiện tại
              </label>
              <input
                type="text"
                value={formData.schoolYear}
                onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                placeholder="VD: 2024 - 2025"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Default Exam Parameters & Typography */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Type className="w-4 h-4 text-amber-600" />
            <span>Mẫu phông chữ &amp; Cấu hình đề kiểm tra mặc định</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Thời gian làm bài mặc định
              </label>
              <select
                value={formData.defaultDuration}
                onChange={(e) => setFormData({ ...formData, defaultDuration: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value={45}>45 phút (Kiểm tra 1 tiết)</option>
                <option value={60}>60 phút</option>
                <option value={90}>90 phút (Giữa kỳ / Cuối kỳ)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tỉ lệ điểm Đọc hiểu mặc định
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.defaultReadingRatio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultReadingRatio: Number(e.target.value),
                    defaultWritingRatio: 10 - Number(e.target.value),
                  })
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phông chữ xuất bản in / Word
              </label>
              <select
                value={formData.fontFamily}
                onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value as any })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="Times New Roman">Times New Roman (Tiêu chuẩn Bộ GD&ĐT)</option>
                <option value="Lora">Lora (Thanh lịch &amp; Văn học)</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans (Hiện đại)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: AI Engine Security Architecture */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Kiến trúc kết nối AI phía máy chủ (Server-side)</span>
          </h3>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Backend Node.js đang chạy mô hình Gemini 3.8 Flash</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Toàn bộ các tác vụ biên soạn ma trận, bản đặc tả và đề kiểm tra được bảo vệ an toàn trên máy chủ backend. API key không bao giờ bị lộ ra trình duyệt người dùng.
            </p>
          </div>
        </div>

        {/* Legal & Standards Reference Note */}
        <div className="bg-amber-50/70 rounded-2xl border border-amber-200/80 p-6 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <Award className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Quy chuẩn Bộ Giáo dục và Đào tạo</span>
          </div>
          <p className="text-xs text-amber-950 leading-relaxed">
            Hệ thống tuân thủ nghiêm ngặt <strong>Công văn số 3175/BGDĐT-GDTrH</strong>: Đề kiểm tra định kỳ không sử dụng lại các văn bản đã học trong SGK; đề thi phân hóa đủ 4 mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao); câu hỏi đánh giá đúng năng lực ngôn ngữ và tư duy thẩm mỹ của học sinh THCS.
          </p>
        </div>

        {/* Submit button */}
        <div className="flex items-center justify-between pt-2">
          <div>
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã lưu thành công cài đặt hệ thống!</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
