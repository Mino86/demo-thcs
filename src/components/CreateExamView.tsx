import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Table as TableIcon,
  Layers,
  Printer,
  Download,
  Edit3,
  Sliders,
  HelpCircle,
  RefreshCw,
  PlusCircle,
  Copy,
  Save,
  Check,
  ChevronDown,
  UploadCloud,
  FileCheck,
  RotateCcw,
  Info
} from 'lucide-react';
import {
  Grade,
  Textbook,
  ExamType,
  ExamFormat,
  Exam,
  MaterialPassage,
  TeacherDocument,
  ReadingQuestion,
  WritingCriterion
} from '../types/index.js';
import { api } from '../services/api.js';
import { CURRICULUM_DATA, CurriculumUnit } from '../data/curriculumData.js';

interface CreateExamViewProps {
  materials: MaterialPassage[];
  documents?: TeacherDocument[];
  initialPassage?: MaterialPassage | null;
  onExamCreated: (exam: Exam) => void;
  onPreviewExam: (exam: Exam) => void;
  onEditExam: (exam: Exam) => void;
}

export const CreateExamView: React.FC<CreateExamViewProps> = ({
  materials,
  documents = [],
  initialPassage,
  onExamCreated,
  onPreviewExam,
  onEditExam,
}) => {
  // 1. Grade, Textbook, Exam Type
  const [grade, setGrade] = useState<Grade>('7');
  const [textbook, setTextbook] = useState<Textbook>('kntt');
  const [examType, setExamType] = useState<ExamType>('giua_ky_1');

  // 2. Scope, Unit, Learning Outcomes (YCCĐ)
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [scope, setScope] = useState<string>('');
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([]);
  const [genre, setGenre] = useState<string>('Thơ bốn chữ / năm chữ');

  // 3. Format & Structure
  const [format, setFormat] = useState<ExamFormat>('ket_hop');

  // 4. Time & Total Score
  const [durationMode, setDurationMode] = useState<'preset' | 'custom'>('preset');
  const [durationMinutes, setDurationMinutes] = useState<number>(90);
  const [totalScoreMode, setTotalScoreMode] = useState<'10' | 'custom'>('10');
  const [totalScore, setTotalScore] = useState<number>(10);
  const [readingScore, setReadingScore] = useState<number>(6.0);
  const [writingScore, setWritingScore] = useState<number>(4.0);

  // 5. Cognitive Levels (% total 100%)
  const [cognitiveRatios, setCognitiveRatios] = useState({
    nhanBiet: 30,
    thongHieu: 35,
    vanDung: 25,
    vanDungCao: 10,
  });

  // 6. Question counts & Variants
  const [readingQuestionCount, setReadingQuestionCount] = useState<number>(6);
  const [numVariants, setNumVariants] = useState<number>(1);

  // 7. Passage source
  const [passageSourceType, setPassageSourceType] = useState<'ai_suggest' | 'bank' | 'custom'>(
    initialPassage ? 'bank' : 'ai_suggest'
  );
  const [selectedPassageId, setSelectedPassageId] = useState<string>(initialPassage?.id || '');
  const [customPassage, setCustomPassage] = useState({
    title: '',
    author: '',
    source: '',
    genre: '',
    content: '',
  });

  // 8. Reference Document Attachment
  const [refDocMode, setRefDocMode] = useState<'none' | 'existing' | 'upload'>('none');
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [uploadedDoc, setUploadedDoc] = useState<{ fileName: string; content: string }>({
    fileName: '',
    content: '',
  });

  // 9. Teacher Custom Instructions
  const [teacherNotes, setTeacherNotes] = useState<string>('');

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generated Result
  const [generatedExam, setGeneratedExam] = useState<Exam | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'exam' | 'answers' | 'rubric' | 'matrix' | 'spec'>('exam');
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [isSavingExam, setIsSavingExam] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Regenerate Section State
  const [isRegeneratingSection, setIsRegeneratingSection] = useState(false);
  const [regenSectionTarget, setRegenSectionTarget] = useState<'reading' | 'writing' | 'matrix_spec' | 'guide' | null>(null);
  const [regenInstruction, setRegenInstruction] = useState('');
  const [showRegenModal, setShowRegenModal] = useState(false);

  // Available units filtered by grade and textbook
  const filteredUnits = CURRICULUM_DATA.filter(
    (u) => u.grade === grade && (textbook === 'all' || u.textbook === textbook)
  );

  // Genres preset by grade
  const genresByGrade: Record<Grade, string[]> = {
    '6': [
      'Thơ lục bát',
      'Truyện đồng thoại',
      'Truyện cổ tích, truyền thuyết',
      'Kí / Tản văn',
      'Văn bản nghị luận xã hội',
      'Văn bản thông tin',
    ],
    '7': [
      'Thơ bốn chữ / năm chữ',
      'Truyện ngắn hiện đại',
      'Tùy bút / Tản văn',
      'Thơ Đường luật',
      'Văn bản nghị luận xã hội',
      'Văn bản thông tin',
    ],
    '8': [
      'Thơ sáu chữ / bảy chữ / tám chữ',
      'Truyện ngắn hiện đại',
      'Truyện lịch sử',
      'Truyện cười / Truyện trào phúng',
      'Văn bản nghị luận văn học',
      'Văn bản thông tin thuyết minh',
    ],
    '9': [
      'Thơ hiện đại / Thơ tự do',
      'Truyện ngắn Việt Nam hiện đại',
      'Truyện thơ Nôm / Truyện truyền kì',
      'Kịch bản văn học',
      'Văn bản nghị luận xã hội & văn học',
      'Văn bản thông tin đa phương tiện',
    ],
  };

  // When grade or textbook changes, update selected unit and genre
  useEffect(() => {
    const units = CURRICULUM_DATA.filter(
      (u) => u.grade === grade && (textbook === 'all' || u.textbook === textbook)
    );
    if (units.length > 0) {
      setSelectedUnitId(units[0].id);
      setGenre(units[0].genre);
      setSelectedOutcomes(units[0].learningOutcomes);
      setScope(`${units[0].unitName} (${units[0].genre} - Trọng tâm tiếng Việt: ${units[0].grammarFocus})`);
    } else {
      setSelectedUnitId('');
      if (genresByGrade[grade]?.[0]) {
        setGenre(genresByGrade[grade][0]);
      }
    }
  }, [grade, textbook]);

  // When selected unit changes
  const handleUnitChange = (unitId: string) => {
    setSelectedUnitId(unitId);
    const unit = CURRICULUM_DATA.find((u) => u.id === unitId);
    if (unit) {
      setGenre(unit.genre);
      setSelectedOutcomes(unit.learningOutcomes);
      setScope(`${unit.unitName} (${unit.genre} - Tiếng Việt: ${unit.grammarFocus})`);
    }
  };

  // Toggle learning outcome checkbox
  const toggleOutcome = (outcome: string) => {
    setSelectedOutcomes((prev) =>
      prev.includes(outcome) ? prev.filter((o) => o !== outcome) : [...prev, outcome]
    );
  };

  // Adjust Reading / Writing Score with automatic constraint checking
  const handleScorePresetChange = (r: number, w: number) => {
    setReadingScore(r);
    setWritingScore(w);
    setTotalScore(r + w);
  };

  // Cognitive ratios handlers
  const handleRatioChange = (field: keyof typeof cognitiveRatios, value: number) => {
    setCognitiveRatios((prev) => ({ ...prev, [field]: value }));
  };

  const autoBalanceRatios = () => {
    setCognitiveRatios({
      nhanBiet: 30,
      thongHieu: 35,
      vanDung: 25,
      vanDungCao: 10,
    });
  };

  const totalCognitiveSum =
    cognitiveRatios.nhanBiet +
    cognitiveRatios.thongHieu +
    cognitiveRatios.vanDung +
    cognitiveRatios.vanDungCao;

  // Handle file upload for reference document
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setUploadedDoc({
        fileName: file.name,
        content: text || '',
      });
    };
    reader.readAsText(file);
  };

  // Generate Exam
  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    // Validation
    if (totalCognitiveSum !== 100) {
      setErrorMessage(`Tổng tỉ lệ 4 mức độ nhận thức hiện là ${totalCognitiveSum}%. Vui lòng nhấn nút "Cân đối chuẩn" để đạt đúng 100%.`);
      setIsGenerating(false);
      return;
    }

    if (Math.abs(readingScore + writingScore - totalScore) > 0.01) {
      setErrorMessage(`Tổng điểm đọc hiểu (${readingScore}đ) và viết (${writingScore}đ) phải chính xác bằng thang điểm (${totalScore}đ).`);
      setIsGenerating(false);
      return;
    }

    if (passageSourceType === 'bank' && !selectedPassageId) {
      setErrorMessage('Vui lòng chọn một ngữ liệu từ ngân hàng ngữ liệu.');
      setIsGenerating(false);
      return;
    }

    if (passageSourceType === 'custom' && (!customPassage.content || !customPassage.title)) {
      setErrorMessage('Vui lòng nhập đầy đủ tiêu đề và nội dung ngữ liệu văn bản của bạn.');
      setIsGenerating(false);
      return;
    }

    try {
      setGenerationStep('1/4: Đang phân tích chuẩn GDPT 2018 & Yêu cầu cần đạt...');
      await new Promise((r) => setTimeout(r, 600));

      setGenerationStep('2/4: Đang thiết lập Ma trận 2 chiều và Bản đặc tả...');
      await new Promise((r) => setTimeout(r, 600));

      setGenerationStep('3/4: Đang gọi Gemini AI biên soạn đề thi, đáp án và hướng dẫn chấm...');

      const selectedDocObj = documents.find((d) => d.id === selectedDocId);
      const referenceText =
        refDocMode === 'existing'
          ? selectedDocObj?.extractedText || ''
          : refDocMode === 'upload'
          ? uploadedDoc.content
          : '';

      const referenceDocName =
        refDocMode === 'existing'
          ? selectedDocObj?.title || ''
          : refDocMode === 'upload'
          ? uploadedDoc.fileName
          : '';

      const payload = {
        grade,
        textbook,
        examType,
        format,
        genre,
        durationMinutes,
        totalScore,
        readingScore,
        writingScore,
        scope,
        learningOutcomes: selectedOutcomes,
        unitName: CURRICULUM_DATA.find((u) => u.id === selectedUnitId)?.unitName || '',
        referenceDocumentName: referenceDocName,
        referenceDocumentText: referenceText,
        cognitiveRatios,
        questionCount: { reading: readingQuestionCount },
        passageSourceType,
        selectedPassage: materials.find((m) => m.id === selectedPassageId),
        customPassage: passageSourceType === 'custom' ? customPassage : undefined,
        teacherNotes,
        numVariants,
      };

      const result = await api.generateExam(payload);

      setGenerationStep('4/4: Hoàn tất bộ đề kiểm tra!');
      setGeneratedExam(result);
      onExamCreated(result);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'Không thể tạo đề thi. Vui lòng kiểm tra lại kết nối hoặc thử lại.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Save changes to current exam
  const handleSaveExamChanges = async () => {
    if (!generatedExam) return;
    setIsSavingExam(true);
    try {
      const updated = await api.updateExam(generatedExam.id, generatedExam);
      setGeneratedExam(updated);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    } catch (err: any) {
      alert(`Lỗi lưu đề thi: ${err.message || err}`);
    } finally {
      setIsSavingExam(false);
    }
  };

  // Open modal to trigger individual section regeneration
  const openRegenerateModal = (target: 'reading' | 'writing' | 'matrix_spec' | 'guide') => {
    setRegenSectionTarget(target);
    setRegenInstruction('');
    setShowRegenModal(true);
  };

  // Trigger individual section regeneration
  const handleTriggerSectionRegen = async () => {
    if (!generatedExam || !regenSectionTarget) return;
    setIsRegeneratingSection(true);
    try {
      const updated = await api.regenerateSection({
        examId: generatedExam.id,
        section: regenSectionTarget,
        instruction: regenInstruction,
      });
      setGeneratedExam(updated);
      setShowRegenModal(false);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    } catch (err: any) {
      alert(`Không thể tạo lại phần này: ${err.message || err}`);
    } finally {
      setIsRegeneratingSection(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Biên soạn đề kiểm tra Ngữ văn THCS</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Trợ lý AI chuyên biệt cho lớp 6, 7, 8, 9 · Chuẩn GDPT 2018 · Công văn 3175/BGDĐT
          </p>
        </div>

        {generatedExam && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onPreviewExam(generatedExam)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Xem trước bản in</span>
            </button>
            <a
              href={`/api/exams/${generatedExam.id}/export-docx`}
              download
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Word (.DOCX)</span>
            </a>
          </div>
        )}
      </div>

      {/* Main Generator Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        
        {/* Step 1: Grade, Textbook, Exam Type */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px]">1</span>
            <span>Khối lớp, Bộ sách &amp; Kỳ kiểm tra</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Grade */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Khối lớp
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl">
                {(['6', '7', '8', '9'] as Grade[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGrade(g)}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                      grade === g
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Lớp {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Textbook */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Bộ sách giáo khoa
              </label>
              <select
                value={textbook}
                onChange={(e) => setTextbook(e.target.value as Textbook)}
                className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="kntt">Kết nối tri thức với cuộc sống</option>
                <option value="ctst">Chân trời sáng tạo</option>
                <option value="canh_dieu">Cánh Diều</option>
                <option value="all">Chung chương trình GDPT 2018</option>
              </select>
            </div>

            {/* Exam Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Loại đề kiểm tra
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as ExamType)}
                className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="thuong_xuyen">Kiểm tra thường xuyên (15p - 45p)</option>
                <option value="giua_ky_1">Kiểm tra giữa học kỳ I</option>
                <option value="cuoi_ky_1">Kiểm tra cuối học kỳ I</option>
                <option value="giua_ky_2">Kiểm tra giữa học kỳ II</option>
                <option value="cuoi_ky_2">Kiểm tra cuối học kỳ II</option>
                <option value="on_tap">Khảo sát / Ôn tập chuyên đề</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Curriculum Scope, Lesson Unit & Learning Outcomes (YCCĐ) */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px]">2</span>
              <span>Phạm vi kiến thức, Bài học &amp; Yêu cầu cần đạt (YCCĐ)</span>
            </div>
            <span className="text-[11px] text-amber-700 font-medium">Bám sát khung chương trình Bộ GD&amp;ĐT</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Unit / Lesson Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Chọn bài học / Chủ đề theo SGK Lớp {grade}
              </label>
              <select
                value={selectedUnitId}
                onChange={(e) => handleUnitChange(e.target.value)}
                className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="">-- Tùy chỉnh phạm vi tự do --</option>
                {filteredUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.unitName} ({u.genre} - Tiếng Việt: {u.grammarFocus})
                  </option>
                ))}
              </select>
            </div>

            {/* Main Genre */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Thể loại văn bản chính
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                {genresByGrade[grade]?.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scope text field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phạm vi kiến thức &amp; Trọng tâm chuyên đề
            </label>
            <input
              type="text"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="VD: Bài 1 và Bài 2 - Thơ bốn chữ, biện pháp so sánh, nhân hóa, viết bài văn biểu cảm..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Learning Outcomes Checklist (YCCĐ) */}
          {selectedOutcomes.length > 0 && (
            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Yêu cầu cần đạt chuẩn GDPT 2018 tích hợp vào đề:</span>
                </span>
                <span className="text-[11px] text-amber-800 font-semibold">
                  Đã chọn {selectedOutcomes.length} mục
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {selectedOutcomes.map((outcome, idx) => (
                  <label
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-800 cursor-pointer p-1.5 bg-white rounded-lg border border-amber-100 hover:border-amber-300 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedOutcomes.includes(outcome)}
                      onChange={() => toggleOutcome(outcome)}
                      className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="leading-snug">{outcome}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Duration, Total Score, Structure & Score Split */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px]">3</span>
            <span>Thời gian, Thang điểm &amp; Cấu trúc đề</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Duration */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Thời gian làm bài</label>
                <button
                  type="button"
                  onClick={() => setDurationMode(durationMode === 'preset' ? 'custom' : 'preset')}
                  className="text-[11px] text-blue-600 hover:underline font-medium"
                >
                  {durationMode === 'preset' ? 'Tùy chỉnh phút' : 'Chọn nhanh'}
                </button>
              </div>

              {durationMode === 'preset' ? (
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
                  {[45, 60, 90].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDurationMinutes(t)}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        durationMinutes === t
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t} phút
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="15"
                    max="180"
                    step="5"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full text-xs font-bold border border-slate-300 rounded-xl px-3 py-2 bg-white"
                  />
                  <span className="text-xs text-slate-500 shrink-0 font-medium">phút</span>
                </div>
              )}
            </div>

            {/* Total Score */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Thang điểm tổng</label>
                <button
                  type="button"
                  onClick={() => setTotalScoreMode(totalScoreMode === '10' ? 'custom' : '10')}
                  className="text-[11px] text-blue-600 hover:underline font-medium"
                >
                  {totalScoreMode === '10' ? 'Tùy chỉnh điểm' : 'Thang 10'}
                </button>
              </div>

              {totalScoreMode === '10' ? (
                <div className="py-2 px-3 bg-slate-100 rounded-xl text-xs font-bold text-slate-900 text-center">
                  Thang điểm 10.0 (Chuẩn)
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="100"
                    step="1"
                    value={totalScore}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTotalScore(val);
                      setReadingScore(Math.round(val * 0.6 * 10) / 10);
                      setWritingScore(Math.round(val * 0.4 * 10) / 10);
                    }}
                    className="w-full text-xs font-bold border border-slate-300 rounded-xl px-3 py-2 bg-white"
                  />
                  <span className="text-xs text-slate-500 shrink-0 font-medium">điểm</span>
                </div>
              )}
            </div>

            {/* Exam Format */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cấu trúc dạng đề
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as ExamFormat)}
                className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="ket_hop">Kết hợp Đọc hiểu + Viết</option>
                <option value="doc_hieu">Chuyên đề Đọc hiểu văn bản</option>
                <option value="viet">Chuyên đề Tập làm văn / Viết</option>
              </select>
            </div>

            {/* Reading / Writing Score Ratio */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tỉ lệ điểm Đọc hiểu / Viết
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
                {[
                  { r: 6, w: 4, label: '6 : 4' },
                  { r: 5, w: 5, label: '5 : 5' },
                  { r: 4, w: 6, label: '4 : 6' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleScorePresetChange(item.r, item.w)}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                      readingScore === item.r && writingScore === item.w
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Detail Score Slider / Inputs */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Điểm phần Đọc hiểu:</span>
                <span className="font-bold text-slate-900">{readingScore.toFixed(1)} điểm</span>
              </div>
              <input
                type="range"
                min="0"
                max={totalScore}
                step="0.5"
                value={readingScore}
                onChange={(e) => {
                  const r = Number(e.target.value);
                  setReadingScore(r);
                  setWritingScore(Math.round((totalScore - r) * 10) / 10);
                }}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Điểm phần Viết:</span>
                <span className="font-bold text-slate-900">{writingScore.toFixed(1)} điểm</span>
              </div>
              <input
                type="range"
                min="0"
                max={totalScore}
                step="0.5"
                value={writingScore}
                onChange={(e) => {
                  const w = Number(e.target.value);
                  setWritingScore(w);
                  setReadingScore(Math.round((totalScore - w) * 10) / 10);
                }}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          {/* Cognitive Levels Matrix Sliders */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <span>Tỉ lệ ma trận 4 mức độ nhận thức (Chuẩn Bộ GD&amp;ĐT)</span>
              </span>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold ${totalCognitiveSum === 100 ? 'text-emerald-700' : 'text-red-600'}`}>
                  Tổng: <strong>{totalCognitiveSum}%</strong>
                  {totalCognitiveSum !== 100 && ' (Cần đạt 100%)'}
                </span>
                <button
                  type="button"
                  onClick={autoBalanceRatios}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Cân đối chuẩn</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <div className="text-[11px] font-semibold text-slate-600 mb-1 flex justify-between">
                  <span>1. Nhận biết</span>
                  <span className="font-bold text-slate-900">{cognitiveRatios.nhanBiet}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={cognitiveRatios.nhanBiet}
                  onChange={(e) => handleRatioChange('nhanBiet', Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-600 mb-1 flex justify-between">
                  <span>2. Thông hiểu</span>
                  <span className="font-bold text-slate-900">{cognitiveRatios.thongHieu}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="60"
                  step="5"
                  value={cognitiveRatios.thongHieu}
                  onChange={(e) => handleRatioChange('thongHieu', Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-600 mb-1 flex justify-between">
                  <span>3. Vận dụng</span>
                  <span className="font-bold text-slate-900">{cognitiveRatios.vanDung}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="5"
                  value={cognitiveRatios.vanDung}
                  onChange={(e) => handleRatioChange('vanDung', Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-600 mb-1 flex justify-between">
                  <span>4. Vận dụng cao</span>
                  <span className="font-bold text-slate-900">{cognitiveRatios.vanDungCao}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={cognitiveRatios.vanDungCao}
                  onChange={(e) => handleRatioChange('vanDungCao', Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Material Passage Source Selection */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px]">4</span>
              <span>Nguồn ngữ liệu đọc hiểu ngoài SGK</span>
            </div>
            <span className="text-[11px] text-amber-700 font-normal">
              Quy định Công văn 3175: Không dùng lại văn bản đã học
            </span>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPassageSourceType('ai_suggest')}
              className={`p-3 rounded-xl border text-left transition-all ${
                passageSourceType === 'ai_suggest'
                  ? 'border-amber-500 bg-amber-50/50 text-slate-900 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI đề xuất văn bản thật</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Trích dẫn tác phẩm thật, tác giả uy tín (không tự bịa), phân biệt rõ nhãn AI đề xuất.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPassageSourceType('bank')}
              className={`p-3 rounded-xl border text-left transition-all ${
                passageSourceType === 'bank'
                  ? 'border-amber-500 bg-amber-50/50 text-slate-900 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Kho ngữ liệu đã duyệt ({materials.length})</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Dùng các văn bản đã kiểm duyệt nguồn gốc có sẵn trong hệ thống.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPassageSourceType('custom')}
              className={`p-3 rounded-xl border text-left transition-all ${
                passageSourceType === 'custom'
                  ? 'border-amber-500 bg-amber-50/50 text-slate-900 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Tự nhập / Dán văn bản</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Đưa bài thơ hoặc đoạn trích truyện bạn chuẩn bị sẵn vào đề thi.
              </p>
            </button>
          </div>

          {/* Conditional details for source */}
          {passageSourceType === 'bank' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Chọn tác phẩm từ kho ngữ liệu:
              </label>
              <select
                value={selectedPassageId}
                onChange={(e) => setSelectedPassageId(e.target.value)}
                className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2 bg-white"
              >
                <option value="">-- Chọn một ngữ liệu đọc hiểu --</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.genre} - Lớp {m.grade}] "{m.title}" - {m.author}
                  </option>
                ))}
              </select>

              {materials.find((m) => m.id === selectedPassageId) && (
                <div className="mt-2 p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-slate-900">{materials.find((m) => m.id === selectedPassageId)?.title}</div>
                  <div className="text-slate-500 italic">
                    Tác giả: {materials.find((m) => m.id === selectedPassageId)?.author} · {materials.find((m) => m.id === selectedPassageId)?.source}
                  </div>
                  <div className="text-slate-700 line-clamp-3 font-serif mt-1">
                    {materials.find((m) => m.id === selectedPassageId)?.content}
                  </div>
                </div>
              )}
            </div>
          )}

          {passageSourceType === 'custom' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên tác phẩm *
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Đất nước, Làng quê ngày mới..."
                    value={customPassage.title}
                    onChange={(e) => setCustomPassage({ ...customPassage, title: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tác giả *
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Nguyễn Khoa Điềm, Thạch Lam..."
                    value={customPassage.author}
                    onChange={(e) => setCustomPassage({ ...customPassage, author: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nguồn xuất bản / Trích dẫn
                  </label>
                  <input
                    type="text"
                    placeholder="VD: NXB Kim Đồng, Báo Tuổi Trẻ..."
                    value={customPassage.source}
                    onChange={(e) => setCustomPassage({ ...customPassage, source: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Toàn văn nội dung ngữ liệu đọc hiểu *
                </label>
                <textarea
                  rows={6}
                  placeholder="Dán bài thơ hoặc đoạn trích văn xuôi vào đây..."
                  value={customPassage.content}
                  onChange={(e) => setCustomPassage({ ...customPassage, content: e.target.value })}
                  className="w-full text-xs font-serif border border-slate-300 rounded-lg p-3 bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 5: Reference Document Attachment & Teacher's Custom Request */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px]">5</span>
              <span>Tài liệu tham khảo đối chiếu &amp; Yêu cầu riêng</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reference Document Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Tài liệu tham khảo đối chiếu (PDF / DOCX / TXT)
              </label>

              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl mb-2">
                <button
                  type="button"
                  onClick={() => setRefDocMode('none')}
                  className={`py-1 text-xs font-bold rounded-lg transition-all ${
                    refDocMode === 'none' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Không kèm
                </button>
                <button
                  type="button"
                  onClick={() => setRefDocMode('existing')}
                  className={`py-1 text-xs font-bold rounded-lg transition-all ${
                    refDocMode === 'existing' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Chọn từ kho ({documents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRefDocMode('upload')}
                  className={`py-1 text-xs font-bold rounded-lg transition-all ${
                    refDocMode === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Tải tệp mới
                </button>
              </div>

              {refDocMode === 'existing' && (
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2 bg-white"
                >
                  <option value="">-- Chọn tài liệu giáo viên đã tải lên --</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      [{d.fileType.toUpperCase()}] {d.title} (Lớp {d.grade})
                    </option>
                  ))}
                </select>
              )}

              {refDocMode === 'upload' && (
                <div className="p-3 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center">
                  <input
                    type="file"
                    id="ref-file-input"
                    accept=".txt,.docx,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="ref-file-input"
                    className="cursor-pointer flex flex-col items-center justify-center gap-1"
                  >
                    <UploadCloud className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700">
                      {uploadedDoc.fileName ? uploadedDoc.fileName : 'Nhấn để tải tài liệu tham khảo'}
                    </span>
                    <span className="text-[10px] text-slate-500">Hỗ trợ định dạng .TXT, .DOCX, .PDF</span>
                  </label>
                </div>
              )}

              {refDocMode === 'none' && (
                <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-xl flex items-start gap-2 text-[11px] text-blue-900">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Lưu ý:</strong> AI sẽ tự động đối chiếu các chuẩn đầu ra GDPT 2018 theo cơ sở dữ liệu có sẵn. Nếu có giáo án hoặc văn bản so sánh riêng của trường, bạn có thể đính kèm để AI bám sát chính xác.
                  </span>
                </div>
              )}
            </div>

            {/* Custom Notes & Variants */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Yêu cầu sư phạm bổ sung của giáo viên
                </label>
                <textarea
                  rows={2}
                  placeholder="VD: Chú trọng câu hỏi tiếng Việt về biện pháp tu từ; bài viết định hướng lòng biết ơn cha mẹ..."
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tạo mã đề tương đương
                </label>
                <select
                  value={numVariants}
                  onChange={(e) => setNumVariants(Number(e.target.value))}
                  className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2 bg-white"
                >
                  <option value={1}>1 mã đề chính thức (Mã 101)</option>
                  <option value={2}>2 mã đề tương đương (Mã 101 &amp; 102)</option>
                  <option value={3}>3 mã đề tương đương (Mã 101, 102, 103)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Đề thi được lưu ở trạng thái 'Bản thảo' để giáo viên duyệt và chỉnh sửa trước khi xuất bản</span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-60 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý sư phạm...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Biên soạn đề kiểm tra với AI</span>
              </>
            )}
          </button>
        </div>

        {/* Live Loading Indicator with steps */}
        {isGenerating && (
          <div className="mt-4 p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
              <span>{generationStep}</span>
            </div>
            <div className="w-full bg-amber-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full w-2/3 animate-pulse rounded-full" />
            </div>
            <p className="text-[11px] text-slate-600 italic">
              AI đang bám sát chuẩn kiến thức kĩ năng Ngữ Văn THCS và lập ma trận chuẩn theo công văn 3175/BGDĐT...
            </p>
          </div>
        )}

      </div>

      {/* Generated Result Preview Section with 5 DISTINCT TABS */}
      {generatedExam && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                  MÃ ĐỀ {generatedExam.code}
                </span>
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  {generatedExam.status === 'draft' ? 'Bản thảo (Chờ duyệt)' : 'Đã duyệt'}
                </span>
                {saveSuccessNotice && (
                  <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-fade-in">
                    <Check className="w-3 h-3" />
                    <span>Đã lưu thành công!</span>
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {generatedExam.title}
              </h3>
              <p className="text-xs text-slate-500">
                Lớp {generatedExam.grade} · Thời gian: {generatedExam.durationMinutes} phút · Tổng điểm: {generatedExam.totalScore}đ (Đọc hiểu: {generatedExam.readingScore}đ, Viết: {generatedExam.writingScore}đ)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsEditingInline(!isEditingInline)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  isEditingInline
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingInline ? 'Đang mở chỉnh sửa' : 'Chỉnh sửa nhanh'}</span>
              </button>

              <button
                onClick={handleSaveExamChanges}
                disabled={isSavingExam}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                {isSavingExam ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Lưu thay đổi</span>
              </button>

              <button
                onClick={() => onPreviewExam(generatedExam)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-amber-300" />
                <span>Bản in chuẩn</span>
              </button>

              <a
                href={`/api/exams/${generatedExam.id}/export-docx`}
                download
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất Word</span>
              </a>
            </div>
          </div>

          {/* 5 Distinct Result Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveResultTab('exam')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeResultTab === 'exam'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>1. Đề kiểm tra</span>
            </button>

            <button
              onClick={() => setActiveResultTab('answers')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeResultTab === 'answers'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>2. Đáp án</span>
            </button>

            <button
              onClick={() => setActiveResultTab('rubric')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeResultTab === 'rubric'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-amber-600" />
              <span>3. Hướng dẫn chấm</span>
            </button>

            <button
              onClick={() => setActiveResultTab('matrix')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeResultTab === 'matrix'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TableIcon className="w-4 h-4 text-blue-600" />
              <span>4. Ma trận</span>
            </button>

            <button
              onClick={() => setActiveResultTab('spec')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeResultTab === 'spec'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4 text-purple-600" />
              <span>5. Bản đặc tả</span>
            </button>
          </div>

          {/* TAB 1: ĐỀ KIỂM TRA */}
          {activeResultTab === 'exam' && (
            <div className="space-y-6">
              {/* Header Toolbar for Tab 1 */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="font-semibold text-slate-700">
                  Phần I: Đọc hiểu ({generatedExam.readingScore}đ) + Phần II: Viết ({generatedExam.writingScore}đ)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openRegenerateModal('reading')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Tạo lại phần Đọc hiểu (AI)</span>
                  </button>
                  <button
                    onClick={() => openRegenerateModal('writing')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tạo lại phần Viết (AI)</span>
                  </button>
                </div>
              </div>

              {/* Reading Passage Box */}
              <div className="p-5 bg-slate-50/80 border border-slate-200 rounded-xl font-serif">
                {isEditingInline ? (
                  <div className="space-y-3 font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={generatedExam.readingPassage.title}
                        onChange={(e) =>
                          setGeneratedExam({
                            ...generatedExam,
                            readingPassage: { ...generatedExam.readingPassage, title: e.target.value },
                          })
                        }
                        className="text-xs font-bold border border-slate-300 rounded px-2 py-1"
                        placeholder="Tiêu đề tác phẩm"
                      />
                      <input
                        type="text"
                        value={generatedExam.readingPassage.author}
                        onChange={(e) =>
                          setGeneratedExam({
                            ...generatedExam,
                            readingPassage: { ...generatedExam.readingPassage, author: e.target.value },
                          })
                        }
                        className="text-xs border border-slate-300 rounded px-2 py-1"
                        placeholder="Tác giả"
                      />
                      <input
                        type="text"
                        value={generatedExam.readingPassage.source}
                        onChange={(e) =>
                          setGeneratedExam({
                            ...generatedExam,
                            readingPassage: { ...generatedExam.readingPassage, source: e.target.value },
                          })
                        }
                        className="text-xs border border-slate-300 rounded px-2 py-1"
                        placeholder="Nguồn xuất bản"
                      />
                    </div>
                    <textarea
                      rows={8}
                      value={generatedExam.readingPassage.content}
                      onChange={(e) =>
                        setGeneratedExam({
                          ...generatedExam,
                          readingPassage: { ...generatedExam.readingPassage, content: e.target.value },
                        })
                      }
                      className="w-full text-xs font-serif border border-slate-300 rounded p-2"
                    />
                  </div>
                ) : (
                  <>
                    <h4 className="text-center font-bold text-sm text-slate-900 font-sans uppercase mb-2">
                      {generatedExam.readingPassage.title}
                    </h4>
                    <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line text-justify">
                      {generatedExam.readingPassage.content}
                    </div>
                    <div className="text-right text-[11px] text-slate-500 italic mt-3 font-sans">
                      (Nguồn: {generatedExam.readingPassage.author}, "{generatedExam.readingPassage.title}", {generatedExam.readingPassage.source})
                    </div>
                  </>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs uppercase text-slate-900">
                  Phần I: Đọc hiểu ({generatedExam.readingScore} điểm)
                </h4>
                {generatedExam.readingQuestions.map((q, idx) => (
                  <div key={q.id || idx} className="text-xs p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                    {isEditingInline ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">Câu {idx + 1}:</span>
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => {
                              const updatedQs = [...generatedExam.readingQuestions];
                              updatedQs[idx].question = e.target.value;
                              setGeneratedExam({ ...generatedExam, readingQuestions: updatedQs });
                            }}
                            className="flex-1 text-xs border border-slate-300 rounded px-2 py-1"
                          />
                          <input
                            type="number"
                            step="0.25"
                            value={q.score}
                            onChange={(e) => {
                              const updatedQs = [...generatedExam.readingQuestions];
                              updatedQs[idx].score = Number(e.target.value);
                              setGeneratedExam({ ...generatedExam, readingQuestions: updatedQs });
                            }}
                            className="w-16 text-xs border border-slate-300 rounded px-2 py-1 font-bold text-center"
                          />
                          <span className="text-[11px] text-slate-500">điểm</span>
                        </div>
                        {q.type === 'trac_nghiem' && q.options && (
                          <div className="grid grid-cols-2 gap-2 pl-4">
                            {q.options.map((opt, oIdx) => (
                              <input
                                key={oIdx}
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const updatedQs = [...generatedExam.readingQuestions];
                                  const opts = [...(updatedQs[idx].options || [])];
                                  opts[oIdx] = e.target.value;
                                  updatedQs[idx].options = opts;
                                  setGeneratedExam({ ...generatedExam, readingQuestions: updatedQs });
                                }}
                                className="text-xs border border-slate-200 rounded px-2 py-1"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-slate-900">
                          Câu {idx + 1} ({q.score.toFixed(1)}đ): <span className="font-normal font-serif text-slate-800">{q.question}</span>
                        </p>
                        {q.type === 'trac_nghiem' && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 ml-4">
                            {q.options.map((opt, optIdx) => {
                              const letters = ['A', 'B', 'C', 'D'];
                              return (
                                <div key={optIdx} className="text-slate-700">
                                  <strong>{letters[optIdx]}.</strong> {opt}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Writing Section */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h4 className="font-bold text-xs uppercase text-slate-900">
                  Phần II: Tập làm văn / Viết ({generatedExam.writingScore} điểm)
                </h4>
                {isEditingInline ? (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={generatedExam.writingQuestion.topic}
                      onChange={(e) =>
                        setGeneratedExam({
                          ...generatedExam,
                          writingQuestion: { ...generatedExam.writingQuestion, topic: e.target.value },
                        })
                      }
                      className="w-full text-xs border border-slate-300 rounded p-2 font-medium"
                    />
                    <input
                      type="text"
                      value={generatedExam.writingQuestion.requirements || ''}
                      onChange={(e) =>
                        setGeneratedExam({
                          ...generatedExam,
                          writingQuestion: { ...generatedExam.writingQuestion, requirements: e.target.value },
                        })
                      }
                      placeholder="Yêu cầu hình thức & dung lượng"
                      className="w-full text-xs border border-slate-300 rounded px-2 py-1 text-slate-600 italic"
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <p className="text-xs text-slate-900 font-medium font-serif leading-relaxed">
                      {generatedExam.writingQuestion.topic}
                    </p>
                    {generatedExam.writingQuestion.requirements && (
                      <p className="text-xs text-slate-500 italic">
                        * Yêu cầu: {generatedExam.writingQuestion.requirements}
                      </p>
                    )}
                    {generatedExam.writingQuestion.contentOrientation && (
                      <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-700">
                        <strong className="text-slate-900 font-sans">Định hướng nội dung: </strong>
                        <span className="font-serif">{generatedExam.writingQuestion.contentOrientation}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ĐÁP ÁN */}
          {activeResultTab === 'answers' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="font-semibold text-slate-700">
                  Bảng đáp án chính xác tương ứng cho từng câu hỏi đọc hiểu và gợi ý bài viết
                </span>
                <button
                  onClick={() => openRegenerateModal('guide')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tạo lại Đáp án (AI)</span>
                </button>
              </div>

              {/* Reading Questions Answer Key */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase mb-2">
                  Đáp án Phần Đọc hiểu ({generatedExam.readingScore} điểm)
                </h4>
                <table className="w-full text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold">
                      <th className="border border-slate-300 p-2 w-16 text-center">Câu</th>
                      <th className="border border-slate-300 p-2 w-28 text-center">Hình thức</th>
                      <th className="border border-slate-300 p-2 text-left">Nội dung đáp án chuẩn</th>
                      <th className="border border-slate-300 p-2 w-20 text-center">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedExam.readingQuestions.map((q, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="border border-slate-300 p-2 text-center font-bold">
                          Câu {idx + 1}
                        </td>
                        <td className="border border-slate-300 p-2 text-center text-slate-600">
                          {q.type === 'trac_nghiem' ? 'Trắc nghiệm' : 'Tự luận ngắn'}
                        </td>
                        <td className="border border-slate-300 p-2 leading-relaxed">
                          {isEditingInline ? (
                            <input
                              type="text"
                              value={q.answer}
                              onChange={(e) => {
                                const updatedQs = [...generatedExam.readingQuestions];
                                updatedQs[idx].answer = e.target.value;
                                setGeneratedExam({ ...generatedExam, readingQuestions: updatedQs });
                              }}
                              className="w-full text-xs border border-slate-300 rounded px-2 py-1"
                            />
                          ) : q.type === 'trac_nghiem' ? (
                            <span className="font-bold text-emerald-800 text-sm">
                              Đáp án: {q.answer}
                            </span>
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
              </div>

              {/* Writing Suggested Content */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase mb-2">
                  Gợi ý đáp án &amp; Dàn ý phần Tập làm văn ({generatedExam.writingScore} điểm)
                </h4>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs leading-relaxed">
                  <div>
                    <strong className="text-slate-900">Đề bài: </strong>
                    <span className="font-medium text-slate-800">{generatedExam.writingQuestion.topic}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <strong className="text-slate-900">Định hướng nội dung cụ thể:</strong>
                    <p className="text-slate-700 font-serif mt-1 whitespace-pre-line">
                      {generatedExam.writingQuestion.contentOrientation || generatedExam.writingQuestion.guide}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HƯỚNG DẪN CHẤM */}
          {activeResultTab === 'rubric' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="font-semibold text-slate-700">
                  Barem điểm chi tiết phân hóa 0.25đ - 0.5đ và tiêu chí Rubric đánh giá bài viết
                </span>
                <button
                  onClick={() => openRegenerateModal('guide')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tạo lại Hướng dẫn chấm (AI)</span>
                </button>
              </div>

              {/* General Grading Principles */}
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-xs space-y-1.5">
                <h4 className="font-bold text-amber-950 uppercase flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-700" />
                  <span>Hướng dẫn chấm chung (Chuẩn Bộ GD&amp;ĐT)</span>
                </h4>
                <p className="text-slate-800 leading-relaxed font-serif">
                  {generatedExam.generalGradingGuide ||
                    '1. Căn cứ vào bài làm thực tế của học sinh để đánh giá linh hoạt, trân trọng những suy nghĩ độc lập, cảm xúc chân thành và cách diễn đạt giàu tính sáng tạo.\n2. Chấp nhận các cách diễn đạt tương đương nhưng đúng trọng tâm yêu cầu.\n3. Điểm toàn bài là tổng điểm của các câu thành phần, làm tròn đến 0.25 điểm.'}
                </p>
              </div>

              {/* Reading Detailed Rubric */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase mb-2">
                  I. Barem chấm chi tiết Phần Đọc hiểu ({generatedExam.readingScore} điểm)
                </h4>
                <table className="w-full text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold">
                      <th className="border border-slate-300 p-2 w-16 text-center">Câu</th>
                      <th className="border border-slate-300 p-2 text-left">Yêu cầu cụ thể &amp; Hướng dẫn chấm chi tiết</th>
                      <th className="border border-slate-300 p-2 w-20 text-center">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedExam.readingQuestions.map((q, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="border border-slate-300 p-2 text-center font-bold">
                          Câu {idx + 1}
                        </td>
                        <td className="border border-slate-300 p-2 leading-relaxed">
                          {isEditingInline ? (
                            <textarea
                              rows={2}
                              value={q.guide}
                              onChange={(e) => {
                                const updatedQs = [...generatedExam.readingQuestions];
                                updatedQs[idx].guide = e.target.value;
                                setGeneratedExam({ ...generatedExam, readingQuestions: updatedQs });
                              }}
                              className="w-full text-xs border border-slate-300 rounded p-1"
                            />
                          ) : (
                            <div>
                              <div className="font-semibold text-slate-900">Đáp án: {q.answer}</div>
                              <div className="text-slate-600 italic mt-1 font-serif">
                                Hướng dẫn chấm: {q.guide}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-bold">
                          {q.score.toFixed(1)}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Writing Rubric Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase mb-2">
                  II. Tiêu chí Rubric bài Tập làm văn / Viết ({generatedExam.writingScore} điểm)
                </h4>
                <table className="w-full text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold">
                      <th className="border border-slate-300 p-2 w-36 text-left">Tiêu chí</th>
                      <th className="border border-slate-300 p-2 text-left">Yêu cầu đánh giá chuẩn GDPT 2018</th>
                      <th className="border border-slate-300 p-2 w-20 text-center">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedExam.writingQuestion.rubricCriteria?.map((crit, idx) => (
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
            </div>
          )}

          {/* TAB 4: MA TRẬN ĐỀ */}
          {activeResultTab === 'matrix' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="font-semibold text-slate-700">
                  Ma trận 2 chiều đề kiểm tra định kỳ (Theo mẫu chuẩn của Bộ GD&amp;ĐT)
                </span>
                <button
                  onClick={() => openRegenerateModal('matrix_spec')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tạo lại Ma trận (AI)</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse border border-slate-300 text-center">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold">
                      <th className="border border-slate-300 p-2 text-left">Kĩ năng</th>
                      <th className="border border-slate-300 p-2 text-left">Nội dung / Mạch</th>
                      <th className="border border-slate-300 p-2">Nhận biết</th>
                      <th className="border border-slate-300 p-2">Thông hiểu</th>
                      <th className="border border-slate-300 p-2">Vận dụng</th>
                      <th className="border border-slate-300 p-2">Vận dụng cao</th>
                      <th className="border border-slate-300 p-2">Tổng điểm</th>
                      <th className="border border-slate-300 p-2">Tỉ lệ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedExam.matrix?.rows?.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="border border-slate-300 p-2 font-bold text-left">{row.strand}</td>
                        <td className="border border-slate-300 p-2 text-left text-slate-700">{row.subStrand}</td>
                        <td className="border border-slate-300 p-2">{row.nhanBiet.score}đ</td>
                        <td className="border border-slate-300 p-2">{row.thongHieu.score}đ</td>
                        <td className="border border-slate-300 p-2">{row.vanDung.score}đ</td>
                        <td className="border border-slate-300 p-2">{row.vanDungCao.score}đ</td>
                        <td className="border border-slate-300 p-2 font-bold">{row.totalScore}đ</td>
                        <td className="border border-slate-300 p-2">{row.percentage}%</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-200 font-bold text-slate-900">
                      <td colSpan={2} className="border border-slate-300 p-2 text-left">Tổng điểm</td>
                      <td className="border border-slate-300 p-2">{generatedExam.matrix?.totalNhanBietScore || 0}đ</td>
                      <td className="border border-slate-300 p-2">{generatedExam.matrix?.totalThongHieuScore || 0}đ</td>
                      <td className="border border-slate-300 p-2">{generatedExam.matrix?.totalVanDungScore || 0}đ</td>
                      <td className="border border-slate-300 p-2">{generatedExam.matrix?.totalVanDungCaoScore || 0}đ</td>
                      <td className="border border-slate-300 p-2">{generatedExam.totalScore}đ</td>
                      <td className="border border-slate-300 p-2">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: BẢN ĐẶC TẢ */}
          {activeResultTab === 'spec' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="font-semibold text-slate-700">
                  Bản đặc tả ma trận đề kiểm tra (Yêu cầu cần đạt chuẩn GDPT 2018 cho từng câu)
                </span>
                <button
                  onClick={() => openRegenerateModal('matrix_spec')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Tạo lại Bản đặc tả (AI)</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold text-center">
                      <th className="border border-slate-300 p-2 w-16">Câu</th>
                      <th className="border border-slate-300 p-2 w-24">Kĩ năng</th>
                      <th className="border border-slate-300 p-2 w-28">Mức độ</th>
                      <th className="border border-slate-300 p-2 text-left">Yêu cầu cần đạt chuẩn GDPT 2018</th>
                      <th className="border border-slate-300 p-2 w-28">Hình thức</th>
                      <th className="border border-slate-300 p-2 w-16 text-center">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedExam.specification?.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="border border-slate-300 p-2 font-bold text-center">{item.number}</td>
                        <td className="border border-slate-300 p-2 text-center text-slate-700">{item.strand}</td>
                        <td className="border border-slate-300 p-2 text-center font-medium">{item.cognitiveLevel}</td>
                        <td className="border border-slate-300 p-2 leading-relaxed">{item.standardRequired}</td>
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
      )}

      {/* Modal: Regenerate Individual Section with AI */}
      {showRegenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>
                  {regenSectionTarget === 'reading' && 'Tạo lại Phần Đọc hiểu với AI'}
                  {regenSectionTarget === 'writing' && 'Tạo lại Phần Viết với AI'}
                  {regenSectionTarget === 'matrix_spec' && 'Tạo lại Ma trận & Bản đặc tả với AI'}
                  {regenSectionTarget === 'guide' && 'Tạo lại Đáp án & Hướng dẫn chấm với AI'}
                </span>
              </h3>
              <button
                onClick={() => setShowRegenModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              AI sẽ tạo lại riêng phần này, giữ nguyên các phần còn lại của đề thi và bảo toàn chính xác tổng điểm.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Yêu cầu điều chỉnh của giáo viên (Tùy chọn)
              </label>
              <textarea
                rows={3}
                placeholder="VD: Hãy chọn bài thơ ngắn hơn; đổi câu hỏi số 3 sang kiểm tra từ láy; nâng độ khó câu hỏi suy luận..."
                value={regenInstruction}
                onChange={(e) => setRegenInstruction(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRegenModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleTriggerSectionRegen}
                disabled={isRegeneratingSection}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-60"
              >
                {isRegeneratingSection ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang tạo lại...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Xác nhận tạo lại</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
