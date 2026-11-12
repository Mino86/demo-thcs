import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { db } from './server/db.js';
import { Exam, MaterialPassage, QuestionBankItem, TeacherDocument, AppSettings, Grade, Textbook, ReadingQuestion, WritingQuestion, ExamMatrix, ExamSpecification } from './src/types/index.js';
import { generateExamDocx } from './server/docx-generator.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Ensure all /api responses default to JSON
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Helper to extract JSON from Gemini text output safely
function extractJson(text: string): any {
  if (!text || !text.trim()) {
    throw new Error('Dữ liệu phản hồi từ AI bị rỗng.');
  }

  // 1. Direct parse attempt
  try {
    return JSON.parse(text.trim());
  } catch (_) {}

  // 2. Strip markdown fences ```json ... ```
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch && fenceMatch[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch (_) {}
  }

  // 3. Find outermost { ... }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const substr = text.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(substr);
    } catch (_) {}
  }

  throw new Error('Không thể phân tích dữ liệu JSON từ kết quả của AI.');
}

// Resilient Gemini AI Caller with Fallback
async function callGeminiWithFallback(apiKey: string, prompt: string, systemInstruction: string): Promise<{ text: string; modelUsed: string }> {
  const models = [
    { name: 'gemini-3.8-flash', timeout: 15000 },
    { name: 'gemini-3.1-flash-lite', timeout: 35000 },
  ];

  let lastError: any = null;

  for (const item of models) {
    try {
      console.log(`[Văn Đề AI] Thử nghiệm mô hình: ${item.name} (timeout: ${item.timeout}ms)...`);
      const client = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
          timeout: item.timeout,
        },
      });

      const response = await client.models.generateContent({
        model: item.name,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '';
      if (text.trim().length > 0) {
        console.log(`[Văn Đề AI] Mô hình ${item.name} phản hồi thành công! Chiều dài: ${text.length}`);
        return { text, modelUsed: item.name };
      }
    } catch (err: any) {
      console.warn(`[Văn Đề AI] Mô hình ${item.name} không khả dụng:`, err?.status || err?.code || '', err?.message?.substring(0, 120));
      lastError = err;
    }
  }

  throw new Error(
    lastError?.message?.includes('503') || lastError?.message?.includes('high demand')
      ? 'Hệ thống AI hiện đang trong thời gian cao điểm. Vui lòng bấm thử lại sau giây lát.'
      : (lastError?.message || 'Không thể kết nối với dịch vụ Gemini AI.')
  );
}

// Helper to normalize and ensure exact math score matching
function normalizeExamScores(
  readingQuestions: ReadingQuestion[],
  targetReadingScore: number,
  targetWritingScore: number
): { normalizedQuestions: ReadingQuestion[]; finalReadingScore: number; finalWritingScore: number } {
  if (!readingQuestions || readingQuestions.length === 0) {
    return {
      normalizedQuestions: [],
      finalReadingScore: targetReadingScore,
      finalWritingScore: targetWritingScore,
    };
  }

  // Calculate current total
  const currentSum = readingQuestions.reduce((sum, q) => sum + (Number(q.score) || 0), 0);
  
  if (Math.abs(currentSum - targetReadingScore) < 0.05) {
    return {
      normalizedQuestions: readingQuestions,
      finalReadingScore: targetReadingScore,
      finalWritingScore: targetWritingScore,
    };
  }

  // Proportionally scale reading questions
  const factor = targetReadingScore / (currentSum || 1);
  let adjustedSum = 0;

  const normalized = readingQuestions.map((q, idx) => {
    if (idx === readingQuestions.length - 1) {
      // Last question takes remaining discrepancy to ensure 100% exact match
      const lastScore = Math.max(0.25, Math.round((targetReadingScore - adjustedSum) * 4) / 4);
      return { ...q, score: lastScore };
    }
    const scaled = Math.max(0.25, Math.round(((Number(q.score) || 0.5) * factor) * 4) / 4);
    adjustedSum += scaled;
    return { ...q, score: scaled };
  });

  return {
    normalizedQuestions: normalized,
    finalReadingScore: targetReadingScore,
    finalWritingScore: targetWritingScore,
  };
}

// ---------------- API ROUTES ----------------

// AI Status Check
app.get('/api/ai-status', (req: Request, res: Response) => {
  res.json({
    hasApiKey: !!process.env.GEMINI_API_KEY,
    model: 'gemini-3.8-flash',
  });
});

// Settings
app.get('/api/settings', (req: Request, res: Response) => {
  res.json(db.getSettings());
});

app.post('/api/settings', (req: Request, res: Response) => {
  db.saveSettings(req.body as AppSettings);
  res.json({ success: true, settings: req.body });
});

// Materials (Ngân hàng ngữ liệu)
app.get('/api/materials', (req: Request, res: Response) => {
  res.json(db.getMaterials());
});

app.post('/api/materials', (req: Request, res: Response) => {
  const materials = db.getMaterials();
  const newMaterial: MaterialPassage = {
    ...req.body,
    id: `mat-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  materials.unshift(newMaterial);
  db.saveMaterials(materials);
  res.status(201).json(newMaterial);
});

app.put('/api/materials/:id', (req: Request, res: Response) => {
  const materials = db.getMaterials();
  const index = materials.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Không tìm thấy ngữ liệu' });
  }
  materials[index] = { ...materials[index], ...req.body };
  db.saveMaterials(materials);
  res.json(materials[index]);
});

app.delete('/api/materials/:id', (req: Request, res: Response) => {
  let materials = db.getMaterials();
  materials = materials.filter(m => m.id !== req.params.id);
  db.saveMaterials(materials);
  res.json({ success: true });
});

// Questions (Ngân hàng câu hỏi)
app.get('/api/questions', (req: Request, res: Response) => {
  res.json(db.getQuestions());
});

app.post('/api/questions', (req: Request, res: Response) => {
  const questions = db.getQuestions();
  const newQuestion: QuestionBankItem = {
    ...req.body,
    id: `q-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  questions.unshift(newQuestion);
  db.saveQuestions(questions);
  res.status(201).json(newQuestion);
});

app.delete('/api/questions/:id', (req: Request, res: Response) => {
  let questions = db.getQuestions();
  questions = questions.filter(q => q.id !== req.params.id);
  db.saveQuestions(questions);
  res.json({ success: true });
});

// Exams (Quản lý đề đã tạo)
app.get('/api/exams', (req: Request, res: Response) => {
  res.json(db.getExams());
});

app.get('/api/exams/:id', (req: Request, res: Response) => {
  const exams = db.getExams();
  const exam = exams.find(e => e.id === req.params.id);
  if (!exam) {
    return res.status(404).json({ error: 'Không tìm thấy đề thi' });
  }
  res.json(exam);
});

app.post('/api/exams', (req: Request, res: Response) => {
  const exams = db.getExams();
  const newExam: Exam = {
    ...req.body,
    id: req.body.id || `exam-${Date.now()}`,
    status: req.body.status || 'draft', // Never automatically approved
    createdAt: req.body.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  exams.unshift(newExam);
  db.saveExams(exams);
  res.status(201).json(newExam);
});

app.put('/api/exams/:id', (req: Request, res: Response) => {
  const exams = db.getExams();
  const index = exams.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Không tìm thấy đề thi' });
  }
  exams[index] = { ...exams[index], ...req.body, updatedAt: new Date().toISOString() };
  db.saveExams(exams);
  res.json(exams[index]);
});

app.delete('/api/exams/:id', (req: Request, res: Response) => {
  let exams = db.getExams();
  exams = exams.filter(e => e.id !== req.params.id);
  db.saveExams(exams);
  res.json({ success: true });
});

app.post('/api/exams/:id/duplicate', (req: Request, res: Response) => {
  const exams = db.getExams();
  const original = exams.find(e => e.id === req.params.id);
  if (!original) {
    return res.status(404).json({ error: 'Không tìm thấy đề thi để nhân bản' });
  }
  const duplicated: Exam = {
    ...JSON.parse(JSON.stringify(original)),
    id: `exam-${Date.now()}`,
    title: `${original.title} (Bản sao)`,
    code: `${Number(original.code || '101') + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
  };
  exams.unshift(duplicated);
  db.saveExams(exams);
  res.status(201).json(duplicated);
});

// Teacher Documents
app.get('/api/documents', (req: Request, res: Response) => {
  res.json(db.getDocuments());
});

app.post('/api/documents', (req: Request, res: Response) => {
  const docs = db.getDocuments();
  const newDoc: TeacherDocument = {
    ...req.body,
    id: `doc-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  docs.unshift(newDoc);
  db.saveDocuments(docs);
  res.status(201).json(newDoc);
});

app.delete('/api/documents/:id', (req: Request, res: Response) => {
  let docs = db.getDocuments();
  docs = docs.filter(d => d.id !== req.params.id);
  db.saveDocuments(docs);
  res.json({ success: true });
});

// Export DOCX
app.get('/api/exams/:id/export-docx', async (req: Request, res: Response) => {
  try {
    const exams = db.getExams();
    const exam = exams.find(e => e.id === req.params.id);
    if (!exam) {
      return res.status(404).json({ error: 'Không tìm thấy đề thi' });
    }
    const buffer = await generateExamDocx(exam, true, true);
    const cleanFileName = `De_Kiem_Tra_Ngu_Van_${exam.grade}_Ma_${exam.code}.docx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(cleanFileName)}"`);
    res.send(buffer);
  } catch (error: any) {
    console.error('Docx export error:', error);
    res.status(500).json({ error: 'Không thể tạo file DOCX: ' + error.message });
  }
});

// ---------------- GEMINI AI EXAM GENERATION ----------------
app.post('/api/generate-exam', async (req: Request, res: Response) => {
  try {
    const currentApiKey = process.env.GEMINI_API_KEY;
    if (!currentApiKey) {
      return res.status(400).json({
        error: 'Chưa cấu hình GEMINI_API_KEY. Vui lòng kiểm tra tab Settings > Secrets trong AI Studio.',
      });
    }

    const {
      grade = '6',
      textbook = 'kntt',
      examType = 'giua_ky_1',
      format = 'ket_hop',
      genre,
      scope = '',
      learningOutcomes = [],
      unitName = '',
      durationMinutes = 90,
      totalScore = 10,
      readingScore = 6,
      writingScore = 4,
      cognitiveRatios = { nhanBiet: 30, thongHieu: 35, vanDung: 25, vanDungCao: 10 },
      questionCount = { reading: 6 },
      passageSourceType = 'ai_suggest', // 'bank' | 'custom' | 'ai_suggest'
      selectedPassage,
      customPassage,
      referenceDocumentText = '',
      referenceDocumentName = '',
      teacherNotes = '',
      numVariants = 1,
    } = req.body;

    // Check for missing comparison text requirement
    if (passageSourceType === 'custom' && (!customPassage?.content || !customPassage?.content.trim())) {
      return res.status(400).json({
        error: 'Thiếu tài liệu đối chiếu: Bạn đã chọn tự nhập ngữ liệu nhưng chưa cung cấp nội dung văn bản. Vui lòng dán văn bản hoặc chọn đề xuất AI.',
      });
    }

    const textbookMap: Record<string, string> = {
      kntt: 'Kết nối tri thức với cuộc sống',
      ctst: 'Chân trời sáng tạo',
      canh_dieu: 'Cánh Diều',
      all: 'Chung cho Chương trình GDPT 2018',
    };

    const examTypeMap: Record<string, string> = {
      thuong_xuyen: 'Kiểm tra thường xuyên (15p - 45p)',
      giua_ky_1: 'Kiểm tra định kỳ Giữa Học kỳ I',
      cuoi_ky_1: 'Kiểm tra định kỳ Cuối Học kỳ I',
      giua_ky_2: 'Kiểm tra định kỳ Giữa Học kỳ II',
      cuoi_ky_2: 'Kiểm tra định kỳ Cuối Học kỳ II',
      on_tap: 'Khảo sát chất lượng / Ôn tập chuyên đề',
    };

    const textbookName = textbookMap[textbook] || 'Chương trình GDPT 2018';
    const examTypeName = examTypeMap[examType] || 'Kiểm tra định kỳ';

    let passageInstruction = '';
    if (passageSourceType === 'custom' && customPassage?.content) {
      passageInstruction = `SỬ DỤNG CHÍNH XÁC VĂN BẢN NGỮ LIỆU DO GIÁO VIÊN CUNG CẤP SAU ĐÂY:
- Tựa đề: ${customPassage.title || 'Văn bản đọc hiểu'}
- Tác giả: ${customPassage.author || 'Tác giả'}
- Nguồn / Xuất xứ: ${customPassage.source || 'Giáo viên cung cấp'}
- Thể loại: ${genre || customPassage.genre || 'Văn bản văn học'}
- Nội dung ngữ liệu:
${customPassage.content}
ĐẶC BIỆT LƯU Ý: Tuyệt đối dùng ngữ liệu này, không tự thay đổi văn bản của giáo viên.`;
    } else if (passageSourceType === 'bank' && selectedPassage?.content) {
      passageInstruction = `SỬ DỤNG NGỮ LIỆU ĐÃ CHỌN TỪ NGÂN HÀNG:
- Tựa đề: ${selectedPassage.title}
- Tác giả: ${selectedPassage.author}
- Nguồn / Xuất xứ: ${selectedPassage.source}
- Thể loại: ${selectedPassage.genre}
- Nội dung:
${selectedPassage.content}`;
    } else {
      passageInstruction = `YÊU CẦU NGỮ LIỆU ĐỌC HIỂU:
Do đây là đề kiểm tra môn Ngữ văn theo Công văn 3175/BGDĐT-GDTrH: ngữ liệu đọc hiểu PHẢI LÀ VĂN BẢN NGOÀI SÁCH GIÁO KHOA của khối lớp ${grade}.
QUY TẮC BẮT BUỘC VỀ TÍNH XÁC THỰC:
1. Bạn PHẢI trích một tác phẩm VĂN HỌC THỰC TẾ ĐÃ ĐƯỢC XUẤT BẢN CỦA TÁC GIẢ THẬT (ví dụ: Thạch Lam, Nguyễn Ngọc Tư, Trần Đăng Khoa, Đỗ Trung Lai, Nguyễn Khoa Điềm, Y Phương, Bằng Việt, Tô Hoài, Võ Quảng, Tạ Duy Anh, Nguyễn Quang Thiều, Báo Tuổi Trẻ, Báo Nhân Dân, Tạp chí Văn học...).
2. TUYỆT ĐỐI KHÔNG TỰ BỊA ĐẶT tên tác giả, tên tác phẩm hoặc câu thơ, đoạn văn giả mạo. Phải ghi rõ nguồn trích dẫn thật (Tập thơ, tuyển tập, NXB, năm xuất bản).
3. Thể loại yêu cầu: ${genre || 'Phù hợp lứa tuổi THCS Lớp ' + grade}.
4. Dung lượng vừa phải cho học sinh làm bài trong ${durationMinutes} phút.`;
    }

    let referenceDocInstruction = '';
    if (referenceDocumentText && referenceDocumentText.trim()) {
      referenceDocInstruction = `\nTÀI LIỆU THAM KHẢO DO GIÁO VIÊN ĐÍNH KÈM (${referenceDocumentName || 'Tài liệu tham khảo'}):\n${referenceDocumentText.substring(0, 3000)}\n-> BẮT BUỘC: Hãy căn cứ vào tài liệu tham khảo này để xây dựng nội dung câu hỏi, định hướng bài viết và chuẩn đánh giá.`;
    }

    const learningOutcomesText = Array.isArray(learningOutcomes) && learningOutcomes.length > 0
      ? `\nCÁC YÊU CẦU CẦN ĐẠT (YCCĐ) TRỌNG TÂM CẦN ĐÁNH GIÁ:\n- ${learningOutcomes.join('\n- ')}`
      : '';

    const scopeText = scope ? `\nPHẠM VI KIẾN THỨC / CHỦ ĐỀ / BÀI HỌC: "${scope}" ${unitName ? `(${unitName})` : ''}` : '';

    const systemPrompt = `Bạn là Chuyên gia Cố vấn Hội đồng Bộ môn Ngữ Văn THCS thuộc Bộ Giáo dục và Đào tạo Việt Nam, am hiểu sâu sắc Chương trình GDPT 2018 và Công văn số 3175/BGDĐT-GDTrH về đổi mới phương pháp dạy học và kiểm tra, đánh giá môn Ngữ văn.

NHIỆM VỤ:
Biên soạn một bộ đề kiểm tra hoàn chỉnh, chuẩn sư phạm và quy cách của Bộ GD&ĐT cho môn Ngữ văn Lớp ${grade}, Bộ sách "${textbookName}", Loại đề: "${examTypeName}".
${scopeText}
${learningOutcomesText}
${referenceDocInstruction}

CÁC QUY TẮC CHẤT LƯỢNG NGHIÊM NGẶT:
1. KHÔNG ĐƯỢC TỰ BỊA VĂN BẢN, TÁC GIẢ, TRÍCH DẪN HAY CHUẨN ĐẦU RA. Trích dẫn tác phẩm thật, chính xác nguồn.
2. TỔNG ĐIỂM: Đúng ${totalScore} điểm (Tổng điểm phần Đọc hiểu: ${readingScore}đ, Phần Viết: ${writingScore}đ). Tổng điểm các câu hỏi đọc hiểu PHẢI CỘNG LẠI CHÍNH XÁC bằng ${readingScore} điểm. Điểm phần viết PHẢI BẰNG ${writingScore} điểm.
3. PHÂN BỐ MỨC ĐỘ TƯ DUY:
   - Nhận biết: ~${cognitiveRatios?.nhanBiet || 30}%
   - Thông hiểu: ~${cognitiveRatios?.thongHieu || 35}%
   - Vận dụng: ~${cognitiveRatios?.vanDung || 25}%
   - Vận dụng cao: ~${cognitiveRatios?.vanDungCao || 10}%
4. PHẦN ĐỌC HIỂU: Gồm ngữ liệu văn bản thật, khoảng ${questionCount?.reading || 6} câu hỏi (trắc nghiệm và tự luận ngắn, có câu tiếng Việt tích hợp từ ngữ liệu). Đáp án phải tương ứng chính xác với câu hỏi.
5. PHẦN VIẾT: 1 đề bài phù hợp Yêu cầu cần đạt Lớp ${grade}, PHẢI CÓ:
   - Yêu cầu hình thức và dung lượng
   - Định hướng nội dung bài viết chi tiết
   - Tiêu chí đánh giá Rubric chấm điểm rõ ràng
6. HƯỚNG DẪN CHẤM: Barem phân hóa chi tiết đến 0.25đ hoặc 0.5đ cho từng câu.
7. MA TRẬN ĐỀ KIỂM TRA: Bảng ma trận 2 chiều chuẩn mẫu của Bộ GD&ĐT.
8. BẢN ĐẶC TẢ MA TRẬN: Bảng mô tả chi tiết Yêu cầu cần đạt (chuẩn GDPT 2018) cho từng câu.
${Number(numVariants) > 1 ? `9. TẠO THÊM ${Number(numVariants) - 1} MÃ ĐỀ TƯƠNG ĐƯƠNG (Mã 102, 103...) cùng ma trận.` : ''}
${teacherNotes ? `YÊU CẦU RIÊNG CỦA GIÁO VIÊN: "${teacherNotes}"` : ''}

ĐỊNH DẠNG TRẢ VỀ:
BẮT BUỘC trả về ĐÚNG MỘT JSON OBJECT duy nhất (không kèm markdown ngoài khối json):
{
  "code": "101",
  "title": "ĐỀ KIỂM TRA ĐỊNH KỲ MÔN NGỮ VĂN ${grade}",
  "school": "TRƯỜNG THCS NGUYỄN DU",
  "district": "PHÒNG GIÁO DỤC VÀ ĐÀO TẠO",
  "grade": "${grade}",
  "textbook": "${textbook}",
  "examType": "${examType}",
  "durationMinutes": ${durationMinutes},
  "totalScore": ${totalScore},
  "readingScore": ${readingScore},
  "writingScore": ${writingScore},
  "readingPassage": {
    "title": "Tên văn bản",
    "author": "Tên tác giả",
    "source": "Nguồn trích dẫn rõ ràng, chính xác",
    "genre": "Thể loại",
    "content": "Toàn văn ngữ liệu đọc hiểu",
    "isAiSuggested": true
  },
  "readingQuestions": [
    {
      "id": "q1",
      "number": 1,
      "type": "trac_nghiem",
      "cognitiveLevel": "nhan_biet",
      "strand": "doc_hieu",
      "question": "Nội dung câu hỏi?",
      "options": ["A", "B", "C", "D"],
      "answer": "A",
      "guide": "Giải thích chi tiết",
      "score": 0.5
    }
  ],
  "writingQuestion": {
    "id": "wq1",
    "topic": "Đề bài tập làm văn / viết",
    "cognitiveLevel": "van_dung_cao",
    "requirements": "Dung lượng, thể loại, yêu cầu",
    "contentOrientation": "Định hướng nội dung cụ thể: Mở bài cần nêu gì, Thân bài cần triển khai các ý nào, Kết bài rút ra bài học gì",
    "guide": "Hướng dẫn chấm tổng quát",
    "score": ${writingScore},
    "rubricCriteria": [
      { "name": "Đảm bảo cấu trúc bài văn", "description": "Mở - Thân - Kết rõ ràng", "score": 0.5 }
    ]
  },
  "generalGradingGuide": "Nguyên tắc chấm chung: Căn cứ vào bài làm thực tế của học sinh để đánh giá linh hoạt, trân trọng những suy nghĩ sáng tạo, giàu cảm xúc...",
  "matrix": {
    "rows": [],
    "totalNhanBietScore": 1.0,
    "totalThongHieuScore": 2.5,
    "totalVanDungScore": 2.5,
    "totalVanDungCaoScore": 4.0,
    "totalScore": ${totalScore}
  },
  "specification": {
    "items": []
  },
  "variants": []
}`;

    const prompt = `${passageInstruction}

Hãy tạo đề thi hoàn chỉnh, đáp án, hướng dẫn chấm, ma trận và bản đặc tả theo định dạng JSON như đã yêu cầu. Trả lời thuần JSON, không văn bản thừa ngoài JSON.`;

    const { text, modelUsed } = await callGeminiWithFallback(currentApiKey, prompt, systemPrompt);
    const parsed = extractJson(text);

    // Normalize and mathematically guarantee score sum
    const targetReadingScore = Number(readingScore) || 6;
    const targetWritingScore = Number(writingScore) || 4;
    const targetTotal = Number(totalScore) || (targetReadingScore + targetWritingScore);

    const { normalizedQuestions } = normalizeExamScores(
      parsed.readingQuestions || [],
      targetReadingScore,
      targetWritingScore
    );

    const settings = db.getSettings();
    const generatedExam: Exam = {
      id: `exam-${Date.now()}`,
      code: parsed.code || '101',
      title: parsed.title || `ĐỀ KIỂM TRA ĐỊNH KỲ NGỮ VĂN ${grade}`,
      school: settings.schoolName || parsed.school || 'TRƯỜNG THCS NGUYỄN DU',
      district: settings.districtName || parsed.district || 'PHÒNG GD&ĐT',
      grade: (parsed.grade || grade) as Grade,
      textbook: (parsed.textbook || textbook) as Textbook,
      examType: (parsed.examType || examType) as any,
      durationMinutes: Number(durationMinutes) || 90,
      totalScore: targetTotal,
      readingScore: targetReadingScore,
      writingScore: targetWritingScore,
      scope: scope || unitName || '',
      learningOutcomes: learningOutcomes || [],
      unitName: unitName || '',
      referenceDocumentName: referenceDocumentName || '',
      cognitiveRatios: cognitiveRatios || { nhanBiet: 30, thongHieu: 35, vanDung: 25, vanDungCao: 10 },
      readingPassage: parsed.readingPassage || {
        title: 'Văn bản đọc hiểu',
        author: 'Khuyết danh',
        source: 'Văn học Việt Nam',
        genre: genre || 'Thơ ca',
        content: '',
      },
      readingQuestions: normalizedQuestions,
      writingQuestion: {
        ...(parsed.writingQuestion || {}),
        score: targetWritingScore,
      },
      matrix: parsed.matrix || { rows: [], totalNhanBietScore: 0, totalThongHieuScore: 0, totalVanDungScore: 0, totalVanDungCaoScore: 0, totalScore: targetTotal },
      specification: parsed.specification || { items: [] },
      generalGradingGuide: parsed.generalGradingGuide || 'Giáo viên linh hoạt đánh giá năng lực tư duy, sáng tạo và cảm thụ văn học của học sinh.',
      variants: parsed.variants || [],
      status: 'draft', // Never automatically approved! Teacher must review and approve.
      teacherName: settings.teacherName || 'Giáo viên bộ môn',
      schoolYear: settings.schoolYear || '2024 - 2025',
      semester: examType.includes('1') ? 'Học kỳ I' : 'Học kỳ II',
      notes: teacherNotes || `Đề thi do AI (${modelUsed}) hỗ trợ biên soạn theo chuẩn GDPT 2018.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to persistent database
    const exams = db.getExams();
    exams.unshift(generatedExam);
    db.saveExams(exams);

    return res.json(generatedExam);
  } catch (error: any) {
    console.error('Exam generation error:', error);
    return res.status(500).json({
      error: 'Không thể tạo đề: ' + (error?.message || 'Lỗi xử lý AI từ máy chủ.'),
    });
  }
});

// ---------------- REGENERATE INDIVIDUAL SECTION ----------------
app.post('/api/regenerate-section', async (req: Request, res: Response) => {
  try {
    const currentApiKey = process.env.GEMINI_API_KEY;
    if (!currentApiKey) {
      return res.status(400).json({
        error: 'Chưa cấu hình GEMINI_API_KEY.',
      });
    }

    const { examId, section, instruction = '' } = req.body;
    const exams = db.getExams();
    const examIndex = exams.findIndex(e => e.id === examId);
    if (examIndex === -1) {
      return res.status(404).json({ error: 'Không tìm thấy đề thi.' });
    }

    const currentExam = exams[examIndex];

    let prompt = '';
    let systemInstruction = `Bạn là Chuyên gia Ngữ Văn THCS. Hãy tạo lại nội dung phần "${section}" cho đề kiểm tra Ngữ văn lớp ${currentExam.grade}.
Đề bài hiện tại: "${currentExam.title}".
Văn bản ngữ liệu hiện tại: "${currentExam.readingPassage.title}" của ${currentExam.readingPassage.author}.
${instruction ? `Yêu cầu điều chỉnh của giáo viên: "${instruction}"` : ''}
Chỉ trả về JSON hợp lệ theo định dạng yêu cầu.`;

    if (section === 'reading') {
      prompt = `Hãy tạo lại phần Đọc hiểu (ngữ liệu đọc hiểu mới ngoài SGK lớp ${currentExam.grade} và danh sách ${currentExam.readingQuestions.length || 6} câu hỏi đọc hiểu kèm đáp án, tổng điểm đúng bằng ${currentExam.readingScore} điểm).
Định dạng JSON:
{
  "readingPassage": { "title": string, "author": string, "source": string, "genre": string, "content": string },
  "readingQuestions": [ { "id": string, "number": number, "type": "trac_nghiem"|"tu_luan", "cognitiveLevel": string, "strand": string, "question": string, "options": string[], "answer": string, "guide": string, "score": number } ]
}`;
    } else if (section === 'writing') {
      prompt = `Hãy tạo lại phần Tập làm văn / Viết (đề bài mới, yêu cầu, định hướng nội dung và barem rubric tiêu chí đánh giá, tổng điểm đúng bằng ${currentExam.writingScore} điểm).
Định dạng JSON:
{
  "writingQuestion": {
    "id": "wq1",
    "topic": string,
    "cognitiveLevel": "van_dung_cao",
    "requirements": string,
    "contentOrientation": string,
    "guide": string,
    "score": ${currentExam.writingScore},
    "rubricCriteria": [ { "name": string, "description": string, "score": number } ]
  }
}`;
    } else if (section === 'matrix_spec') {
      prompt = `Hãy tạo lại Ma trận đề 2 chiều và Bản đặc tả ma trận chuẩn GDPT 2018 cho đề thi có ${currentExam.readingQuestions.length} câu đọc hiểu (${currentExam.readingScore}đ) và 1 bài viết (${currentExam.writingScore}đ), tổng điểm ${currentExam.totalScore}đ.
Định dạng JSON:
{
  "matrix": { "rows": [], "totalNhanBietScore": number, "totalThongHieuScore": number, "totalVanDungScore": number, "totalVanDungCaoScore": number, "totalScore": ${currentExam.totalScore} },
  "specification": { "items": [] }
}`;
    } else if (section === 'guide') {
      prompt = `Hãy tạo lại Hướng dẫn chấm chi tiết và Đáp án toàn diện cho các câu hỏi đọc hiểu và bài viết của đề thi này.
Định dạng JSON:
{
  "readingQuestions": [ { "id": string, "number": number, "type": string, "cognitiveLevel": string, "strand": string, "question": string, "options": string[], "answer": string, "guide": string, "score": number } ],
  "generalGradingGuide": string
}`;
    } else {
      return res.status(400).json({ error: 'Mục cần tạo lại không hợp lệ.' });
    }

    const { text } = await callGeminiWithFallback(currentApiKey, prompt, systemInstruction);
    const parsed = extractJson(text);

    // Merge changes into current exam
    if (section === 'reading') {
      if (parsed.readingPassage) currentExam.readingPassage = parsed.readingPassage;
      if (parsed.readingQuestions) {
        const { normalizedQuestions } = normalizeExamScores(parsed.readingQuestions, currentExam.readingScore, currentExam.writingScore);
        currentExam.readingQuestions = normalizedQuestions;
      }
    } else if (section === 'writing' && parsed.writingQuestion) {
      currentExam.writingQuestion = { ...parsed.writingQuestion, score: currentExam.writingScore };
    } else if (section === 'matrix_spec') {
      if (parsed.matrix) currentExam.matrix = parsed.matrix;
      if (parsed.specification) currentExam.specification = parsed.specification;
    } else if (section === 'guide') {
      if (parsed.readingQuestions) currentExam.readingQuestions = parsed.readingQuestions;
      if (parsed.generalGradingGuide) currentExam.generalGradingGuide = parsed.generalGradingGuide;
    }

    currentExam.updatedAt = new Date().toISOString();
    exams[examIndex] = currentExam;
    db.saveExams(exams);

    return res.json(currentExam);
  } catch (error: any) {
    console.error('Section regeneration error:', error);
    return res.status(500).json({
      error: 'Không thể tạo lại phần này: ' + (error?.message || 'Lỗi xử lý AI.'),
    });
  }
});

// 404 handler for all unmatched API routes so they NEVER fall into Vite SPA HTML
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    error: `Không tìm thấy endpoint API: ${req.method} ${req.originalUrl}`,
  });
});

// Express Error Handler for API routes
app.use('/api', (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[API Middleware Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Lỗi xử lý API phía máy chủ.',
  });
});

// Vite Middleware for Development / Static for Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
