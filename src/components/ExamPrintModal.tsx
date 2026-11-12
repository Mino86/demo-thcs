import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
  CheckCircle,
  Table as TableIcon,
  Layers,
  BookOpen,
  Edit3
} from 'lucide-react';
import { Exam } from '../types/index.js';

interface ExamPrintModalProps {
  exam: Exam;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export const ExamPrintModal: React.FC<ExamPrintModalProps> = ({
  exam,
  isOpen,
  onClose,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'paper' | 'answers' | 'rubric' | 'matrix' | 'spec' | 'all'>('paper');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDocx = () => {
    window.open(`/api/exams/${exam.id}/export-docx`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      {/* Modal Card */}
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        {/* Header Toolbar (no-print) */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 no-print">
          <div>
            <div className="text-xs text-amber-300 font-medium">
              XEM TRƯỚC VÀ XUẤT BẢN ĐỀ THI
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-xl">
              {exam.title} - Mã đề {exam.code}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Chỉnh sửa</span>
            </button>

            <button
              onClick={handleDownloadDocx}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Word (.DOCX)</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In / Lưu PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5 Distinct View Tabs (no-print) */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-print">
          <button
            onClick={() => setActiveTab('paper')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'paper'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-600" />
            <span>1. Đề kiểm tra</span>
          </button>

          <button
            onClick={() => setActiveTab('answers')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'answers'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>2. Đáp án</span>
          </button>

          <button
            onClick={() => setActiveTab('rubric')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'rubric'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-amber-600" />
            <span>3. Hướng dẫn chấm</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-4 h-4 text-blue-600" />
            <span>4. Ma trận đề</span>
          </button>

          <button
            onClick={() => setActiveTab('spec')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'spec'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-600" />
            <span>5. Bản đặc tả</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-slate-800" />
            <span>In toàn bộ hồ sơ đề</span>
          </button>
        </div>

        {/* Printable Document Sheet */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-10 bg-slate-50 flex justify-center">
          <div className="bg-white w-full max-w-3xl p-6 sm:p-12 shadow-md border border-slate-200 text-slate-900 font-serif leading-relaxed exam-page">
            
            {/* PART 1: ĐỀ KIỂM TRA */}
            {(activeTab === 'paper' || activeTab === 'all') && (
              <div className="mb-12">
                {/* Standard School Header */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b-2 border-slate-800 text-center font-sans">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-700 font-medium">
                      {exam.district}
                    </div>
                    <div className="text-sm font-bold uppercase text-slate-900">
                      {exam.school}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-slate-700">
                      MÃ ĐỀ: <span className="text-base text-red-600">{exam.code}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-bold uppercase text-slate-900">
                      {exam.title}
                    </div>
                    <div className="text-xs italic text-slate-700">
                      Năm học: {exam.schoolYear}
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      Môn: Ngữ văn - Lớp {exam.grade}
                    </div>
                    <div className="text-[11px] italic text-slate-600">
                      Thời gian làm bài: {exam.durationMinutes} phút (Không kể phát đề)
                    </div>
                  </div>
                </div>

                {/* Student identification line */}
                <div className="py-3 text-xs italic text-slate-700 border-b border-dashed border-slate-300 flex justify-between font-sans">
                  <span>Họ và tên thí sinh: ............................................................................</span>
                  <span>Lớp: ................. SBD: .................</span>
                </div>

                {/* SECTION I: ĐỌC HIỂU */}
                <div className="mt-6">
                  <h3 className="text-sm font-bold uppercase text-slate-900 font-sans tracking-wide">
                    I. PHẦN ĐỌC HIỂU ({exam.readingScore.toFixed(1)} điểm)
                  </h3>
                  <p className="text-xs italic text-slate-600 mt-1">
                    Đọc văn bản sau và thực hiện các yêu cầu bên dưới:
                  </p>

                  {/* Reading Passage */}
                  <div className="my-4 p-4 sm:p-6 bg-slate-50/70 border border-slate-200 rounded-lg">
                    <h4 className="text-center font-bold text-sm uppercase text-slate-900 mb-3">
                      {exam.readingPassage.title}
                    </h4>
                    <div className="text-[13.5px] text-slate-800 leading-relaxed whitespace-pre-line text-justify">
                      {exam.readingPassage.content}
                    </div>
                    <div className="text-right mt-3 text-xs italic text-slate-600 font-sans">
                      (Nguồn: {exam.readingPassage.author}, "{exam.readingPassage.title}", {exam.readingPassage.source})
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="space-y-4 mt-5">
                    {exam.readingQuestions.map((q, idx) => (
                      <div key={q.id || idx} className="text-[13.5px]">
                        <p className="font-semibold text-slate-900">
                          Câu {idx + 1} ({q.score.toFixed(1)} điểm):{' '}
                          <span className="font-normal">{q.question}</span>
                        </p>

                        {q.type === 'trac_nghiem' && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 ml-4">
                            {q.options.map((opt, optIdx) => {
                              const letters = ['A', 'B', 'C', 'D'];
                              return (
                                <div key={optIdx} className="text-xs text-slate-800 font-sans">
                                  <strong className="text-slate-900">
                                    {letters[optIdx]}.
                                  </strong>{' '}
                                  {opt}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION II: VIẾT */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h3 className="text-sm font-bold uppercase text-slate-900 font-sans tracking-wide">
                    II. PHẦN TẬP LÀM VĂN / VIẾT ({exam.writingScore.toFixed(1)} điểm)
                  </h3>
                  <div className="mt-3 text-[13.5px] leading-relaxed">
                    <p className="text-justify font-medium text-slate-900">
                      {exam.writingQuestion.topic}
                    </p>
                    {exam.writingQuestion.requirements && (
                      <p className="text-xs italic text-slate-600 mt-2 font-sans">
                        * Yêu cầu: {exam.writingQuestion.requirements}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer note */}
                <div className="mt-10 text-center font-sans">
                  <div className="text-xs font-bold text-slate-800 tracking-wider">
                    ---------- HẾT ----------
                  </div>
                  <div className="text-[11px] italic text-slate-500 mt-1">
                    (Cán bộ coi thi không giải thích gì thêm)
                  </div>
                </div>
              </div>
            )}

            {/* PART 2: ĐÁP ÁN */}
            {(activeTab === 'answers' || activeTab === 'all') && (
              <div className="mt-12 pt-8 border-t-2 border-slate-400 font-sans">
                <div className="text-center mb-6">
                  <div className="text-xs font-bold uppercase text-slate-700">
                    {exam.school}
                  </div>
                  <h3 className="text-base font-bold uppercase text-slate-900 mt-1">
                    ĐÁP ÁN ĐỀ KIỂM TRA ĐỊNH KỲ (MÃ ĐỀ: {exam.code})
                  </h3>
                  <div className="text-xs italic text-slate-600">
                    Môn: Ngữ văn {exam.grade} - {exam.semester}
                  </div>
                </div>

                <h4 className="text-xs font-bold uppercase text-slate-900 mb-2">
                  I. BẢNG ĐÁP ÁN ĐỌC HIỂU ({exam.readingScore.toFixed(1)} ĐIỂM)
                </h4>
                <table className="w-full text-xs border-collapse border border-slate-300 mb-6">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold">
                      <th className="border border-slate-300 p-2 w-16 text-center">Câu</th>
                      <th className="border border-slate-300 p-2 w-28 text-center">Hình thức</th>
                      <th className="border border-slate-300 p-2 text-left">Đáp án chuẩn</th>
                      <th className="border border-slate-300 p-2 w-20 text-center">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exam.readingQuestions.map((q, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="border border-slate-300 p-2 text-center font-bold">
                          Câu {idx + 1}
                        </td>
                        <td className="border border-slate-300 p-2 text-center text-slate-600">
                          {q.type === 'trac_nghiem' ? 'Trắc nghiệm' : 'Tự luận'}
                        </td>
                        <td className="border border-slate-300 p-2 leading-relaxed">
                          {q.type === 'trac_nghiem' ? (
                            <strong className="text-emerald-700">Đáp án: {q.answer}</strong>
                          ) : (
                            <span className="text-slate-900 font-serif">{q.answer}</span>
                          )}
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-bold">
                          {q.score.toFixed(1)}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h4 className="text-xs font-bold uppercase text-slate-900 mb-2">
                  II. GỢI Ý ĐÁP ÁN BÀI VIẾT ({exam.writingScore.toFixed(1)} ĐIỂM)
                </h4>
                <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg text-xs leading-relaxed font-serif">
                  <div className="font-sans font-bold text-slate-900 mb-1">
                    Định hướng nội dung:
                  </div>
                  <p className="text-slate-800 whitespace-pre-line">
                    {exam.writingQuestion.contentOrientation || exam.writingQuestion.guide}
                  </p>
                </div>
              </div>
            )}

            {/* PART 3: HƯỚNG DẪN CHẤM */}
            {(activeTab === 'rubric' || activeTab === 'all') && (
              <div className="mt-12 pt-8 border-t-2 border-slate-400 font-sans">
                <div className="text-center mb-6">
                  <div className="text-xs font-bold uppercase text-slate-700">
                    {exam.school}
                  </div>
                  <h3 className="text-base font-bold uppercase text-slate-900 mt-1">
                    HƯỚNG DẪN CHẤM VÀ BIỂU ĐIỂM CHI TIẾT
                  </h3>
                  <div className="text-xs italic text-slate-600">
                    Áp dụng cho kì kiểm tra Ngữ văn Lớp {exam.grade}
                  </div>
                </div>

                {/* General Grading Principles */}
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs mb-6">
                  <div className="font-bold text-slate-900 mb-1 uppercase">Nguyên tắc chấm chung:</div>
                  <p className="text-slate-700 font-serif leading-relaxed">
                    {exam.generalGradingGuide ||
                      '1. Giáo viên nắm bắt đúng định hướng đổi mới đánh giá theo năng lực của Chương trình GDPT 2018, tránh đếm ý cho điểm một cách máy móc.\n2. Khuyến khích sự sáng tạo, suy nghĩ độc lập và giàu cảm xúc chân thật của học sinh.\n3. Điểm toàn bài kiểm tra làm tròn đến 0.25 điểm.'}
                  </p>
                </div>

                {/* Reading Guide Table */}
                <h4 className="text-xs font-bold uppercase text-slate-900 mb-2">
                  I. HƯỚNG DẪN CHẤM PHẦN ĐỌC HIỂU ({exam.readingScore.toFixed(1)} ĐIỂM)
                </h4>
                <table className="w-full text-xs border-collapse border border-slate-300 mb-6">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900">
                      <th className="border border-slate-300 p-2 w-16 text-center">Câu</th>
                      <th className="border border-slate-300 p-2 text-left">Hướng dẫn chấm &amp; Phân hóa barem</th>
                      <th className="border border-slate-300 p-2 w-20 text-center">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exam.readingQuestions.map((q, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="border border-slate-300 p-2 text-center font-bold">
                          Câu {idx + 1}
                        </td>
                        <td className="border border-slate-300 p-2 leading-relaxed">
                          <div className="font-semibold text-slate-900">Đáp án: {q.answer}</div>
                          <div className="text-slate-600 italic mt-0.5 font-serif">
                            Chi tiết: {q.guide}
                          </div>
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-bold">
                          {q.score.toFixed(1)}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Writing Rubric Table */}
                <h4 className="text-xs font-bold uppercase text-slate-900 mb-2">
                  II. TIÊU CHÍ RUBRIC ĐÁNH GIÁ BÀI VIẾT ({exam.writingScore.toFixed(1)} ĐIỂM)
                </h4>
                <table className="w-full text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900">
                      <th className="border border-slate-300 p-2 w-32 text-left">Tiêu chí</th>
                      <th className="border border-slate-300 p-2 text-left">Mô tả chuẩn đánh giá GDPT 2018</th>
                      <th className="border border-slate-300 p-2 w-20 text-center">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exam.writingQuestion.rubricCriteria?.map((crit, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="border border-slate-300 p-2 font-bold text-slate-900">
                          {crit.name}
                        </td>
                        <td className="border border-slate-300 p-2 text-slate-700 leading-relaxed font-serif">
                          {crit.description}
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-bold">
                          {crit.score.toFixed(1)}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* PART 4: MA TRẬN ĐỀ */}
            {(activeTab === 'matrix' || activeTab === 'all') && (
              <div className="mt-12 pt-8 border-t-2 border-slate-400 font-sans">
                <div className="text-center mb-6">
                  <h3 className="text-base font-bold uppercase text-slate-900">
                    MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ MÔN NGỮ VĂN
                  </h3>
                  <div className="text-xs italic text-slate-600">
                    (Theo khung hướng dẫn chuẩn của Bộ Giáo dục và Đào tạo)
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse border border-slate-300 text-center">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-bold">
                        <th className="border border-slate-300 p-2 text-left">Kĩ năng / Mạch</th>
                        <th className="border border-slate-300 p-2 text-left">Nội dung</th>
                        <th className="border border-slate-300 p-2">Nhận biết</th>
                        <th className="border border-slate-300 p-2">Thông hiểu</th>
                        <th className="border border-slate-300 p-2">Vận dụng</th>
                        <th className="border border-slate-300 p-2">Vận dụng cao</th>
                        <th className="border border-slate-300 p-2">Tổng điểm</th>
                        <th className="border border-slate-300 p-2">Tỉ lệ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exam.matrix?.rows?.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="border border-slate-300 p-2 font-bold text-left">{row.strand}</td>
                          <td className="border border-slate-300 p-2 text-left text-slate-700">{row.subStrand}</td>
                          <td className="border border-slate-300 p-2">{row.nhanBiet.score}đ</td>
                          <td className="border border-slate-300 p-2">{row.thongHieu.score}đ</td>
                          <td className="border border-slate-300 p-2">{row.vanDung.score}đ</td>
                          <td className="border border-slate-300 p-2">{row.vanDungCao.score}đ</td>
                          <td className="border border-slate-300 p-2 font-bold">{row.totalScore}đ</td>
                          <td className="border border-slate-300 p-2 font-semibold text-slate-600">{row.percentage}%</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-200 font-bold">
                        <td colSpan={2} className="border border-slate-300 p-2 text-left">Tổng số điểm</td>
                        <td className="border border-slate-300 p-2">{exam.matrix?.totalNhanBietScore || 0}đ</td>
                        <td className="border border-slate-300 p-2">{exam.matrix?.totalThongHieuScore || 0}đ</td>
                        <td className="border border-slate-300 p-2">{exam.matrix?.totalVanDungScore || 0}đ</td>
                        <td className="border border-slate-300 p-2">{exam.matrix?.totalVanDungCaoScore || 0}đ</td>
                        <td className="border border-slate-300 p-2">{exam.totalScore}đ</td>
                        <td className="border border-slate-300 p-2">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PART 5: BẢN ĐẶC TẢ */}
            {(activeTab === 'spec' || activeTab === 'all') && (
              <div className="mt-12 pt-8 border-t-2 border-slate-400 font-sans">
                <div className="text-center mb-6">
                  <h3 className="text-base font-bold uppercase text-slate-900">
                    BẢN ĐẶC TẢ MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ
                  </h3>
                  <div className="text-xs italic text-slate-600">
                    (Yêu cầu cần đạt chi tiết theo Chương trình GDPT 2018)
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-bold text-center">
                        <th className="border border-slate-300 p-2 w-20">Câu</th>
                        <th className="border border-slate-300 p-2 w-24">Kĩ năng</th>
                        <th className="border border-slate-300 p-2 w-28">Mức độ</th>
                        <th className="border border-slate-300 p-2 text-left">Yêu cầu cần đạt chuẩn GDPT 2018</th>
                        <th className="border border-slate-300 p-2 w-28">Hình thức</th>
                        <th className="border border-slate-300 p-2 w-16 text-center">Điểm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exam.specification?.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="border border-slate-300 p-2 font-bold text-center">{item.number}</td>
                          <td className="border border-slate-300 p-2 text-center text-slate-700">{item.strand}</td>
                          <td className="border border-slate-300 p-2 text-center font-medium">{item.cognitiveLevel}</td>
                          <td className="border border-slate-300 p-2 leading-relaxed font-serif">{item.standardRequired}</td>
                          <td className="border border-slate-300 p-2 text-center text-slate-600">{item.questionType}</td>
                          <td className="border border-slate-300 p-2 font-bold text-center">{item.score}đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
