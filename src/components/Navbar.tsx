import React from 'react';
import { Menu, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { PageId } from './Sidebar.js';

interface NavbarProps {
  onOpenSidebar: () => void;
  currentPage: PageId;
  onNavigateToCreate: () => void;
  hasApiKey: boolean;
  schoolName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSidebar,
  currentPage,
  onNavigateToCreate,
  hasApiKey,
  schoolName,
}) => {
  const pageTitles: Record<PageId, string> = {
    dashboard: 'Trang tổng quan',
    create_exam: 'Biên soạn đề kiểm tra mới',
    materials: 'Ngân hàng ngữ liệu đọc hiểu',
    questions: 'Ngân hàng câu hỏi đánh giá năng lực',
    exams: 'Quản lý đề kiểm tra đã tạo',
    documents: 'Kho tài liệu & giáo án giáo viên',
    settings: 'Cài đặt hệ thống & mẫu đề',
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Zone 1: Mobile toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base lg:text-lg font-bold text-slate-900 truncate">
            {pageTitles[currentPage]}
          </h1>
          <div className="text-xs text-slate-500 hidden sm:block truncate">
            {schoolName} · Năm học 2024 - 2025
          </div>
        </div>
      </div>

      {/* Zone 2: System Status & Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        {/* AI Server Status */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-800 border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Gemini 3.8 Flash sẵn sàng</span>
        </div>

        {/* Primary Action Button */}
        {currentPage !== 'create_exam' && (
          <button
            onClick={onNavigateToCreate}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0d2238] to-[#1e3a5f] hover:from-[#13304e] hover:to-[#254670] text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="whitespace-nowrap">Tạo đề mới</span>
          </button>
        )}
      </div>
    </header>
  );
};
