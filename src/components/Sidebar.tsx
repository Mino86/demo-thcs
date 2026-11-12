import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  FileQuestion,
  Files,
  FolderArchive,
  Settings,
  GraduationCap,
  X,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export type PageId = 
  | 'dashboard' 
  | 'create_exam' 
  | 'materials' 
  | 'questions' 
  | 'exams' 
  | 'documents' 
  | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  isOpen: boolean;
  onClose: () => void;
  schoolName: string;
  teacherName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isOpen,
  onClose,
  schoolName,
  teacherName,
}) => {
  const navItems = [
    {
      id: 'dashboard' as PageId,
      label: 'Trang tổng quan',
      icon: LayoutDashboard,
      description: 'Tổng hợp số liệu & đề gần đây',
    },
    {
      id: 'create_exam' as PageId,
      label: 'Tạo đề mới',
      icon: Sparkles,
      description: 'Soạn đề chuẩn ma trận AI',
      highlight: true,
    },
    {
      id: 'materials' as PageId,
      label: 'Ngân hàng ngữ liệu',
      icon: BookOpen,
      description: 'Kho văn bản ngoài SGK lớp 6-9',
    },
    {
      id: 'questions' as PageId,
      label: 'Ngân hàng câu hỏi',
      icon: FileQuestion,
      description: 'Câu hỏi đọc hiểu & tiếng Việt',
    },
    {
      id: 'exams' as PageId,
      label: 'Đề đã tạo',
      icon: Files,
      description: 'Quản lý, duyệt, in và xuất Word',
    },
    {
      id: 'documents' as PageId,
      label: 'Tài liệu giáo viên',
      icon: FolderArchive,
      description: 'Tài liệu PDF, DOCX, giáo án',
    },
    {
      id: 'settings' as PageId,
      label: 'Cài đặt hệ thống',
      icon: Settings,
      description: 'Thông tin trường & mẫu in',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0d2238] text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-[#1a385a] ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="p-5 flex items-center justify-between border-b border-[#1b3b60]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
              <GraduationCap className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white leading-tight">
                VĂN ĐỀ AI
              </div>
              <div className="text-[11px] font-medium text-amber-300 tracking-wider">
                TRỢ LÝ RA ĐỀ NGỮ VĂN THCS
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Official standard banner */}
        <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-[#142e4c] border border-[#224773] text-[11px] text-slate-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="leading-tight">
            Chuẩn <strong className="text-white">GDPT 2018</strong> &amp; Công văn <strong className="text-white">3175/BGDĐT</strong>
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectPage(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all group ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-md'
                    : item.highlight
                    ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20'
                    : 'text-slate-300 hover:bg-white/8 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive
                        ? 'text-slate-950'
                        : item.highlight
                        ? 'text-amber-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <div className="truncate">
                    <div className="text-sm tracking-tight truncate leading-tight">
                      {item.label}
                    </div>
                    <div
                      className={`text-[11px] truncate mt-0.5 ${
                        isActive
                          ? 'text-slate-900/80'
                          : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-slate-950 shrink-0 ml-1" />}
              </button>
            );
          })}
        </nav>

        {/* Teacher profile section */}
        <div className="p-4 border-t border-[#1b3b60] bg-[#091a2c]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-amber-400 text-sm">
              {teacherName ? teacherName.charAt(0) : 'G'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">
                {teacherName || 'Giáo viên Ngữ văn'}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {schoolName || 'Trường THCS'}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
