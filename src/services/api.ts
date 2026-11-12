import { Exam, MaterialPassage, QuestionBankItem, TeacherDocument, AppSettings } from '../types/index.js';

// Safe JSON fetcher that never tries to parse HTML into JSON
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (networkError: any) {
    throw new Error(`Lỗi kết nối mạng tới máy chủ: ${networkError.message || networkError}`);
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!isJson) {
    // If the server or proxy returned HTML (e.g., 502/504 Bad Gateway, 404 page, or Vite fallback)
    const rawText = await res.text().catch(() => '');
    if (!res.ok) {
      throw new Error(
        `Máy chủ phản hồi mã lỗi ${res.status} (${res.statusText || 'Lỗi trang HTML'}). Vui lòng kiểm tra lại dịch vụ backend.`
      );
    }
    throw new Error(
      `Máy chủ phản hồi định dạng không phải JSON (${contentType || 'text/html'}) cho đường dẫn ${url}.`
    );
  }

  let data: any;
  try {
    data = await res.json();
  } catch (jsonErr: any) {
    throw new Error(`Dữ liệu nhận được từ máy chủ không phải JSON hợp lệ: ${jsonErr.message}`);
  }

  if (!res.ok) {
    throw new Error(data?.error || `Yêu cầu máy chủ thất bại với mã lỗi ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Settings
  async getSettings(): Promise<AppSettings> {
    return fetchJson<AppSettings>('/api/settings');
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    await fetchJson('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
  },

  // Materials (Ngân hàng ngữ liệu)
  async getMaterials(): Promise<MaterialPassage[]> {
    return fetchJson<MaterialPassage[]>('/api/materials');
  },

  async createMaterial(material: Omit<MaterialPassage, 'id' | 'createdAt'>): Promise<MaterialPassage> {
    return fetchJson<MaterialPassage>('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(material),
    });
  },

  async updateMaterial(id: string, updates: Partial<MaterialPassage>): Promise<MaterialPassage> {
    return fetchJson<MaterialPassage>(`/api/materials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async deleteMaterial(id: string): Promise<void> {
    await fetchJson(`/api/materials/${id}`, { method: 'DELETE' });
  },

  // Questions (Ngân hàng câu hỏi)
  async getQuestions(): Promise<QuestionBankItem[]> {
    return fetchJson<QuestionBankItem[]>('/api/questions');
  },

  async createQuestion(question: Omit<QuestionBankItem, 'id' | 'createdAt'>): Promise<QuestionBankItem> {
    return fetchJson<QuestionBankItem>('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question),
    });
  },

  async deleteQuestion(id: string): Promise<void> {
    await fetchJson(`/api/questions/${id}`, { method: 'DELETE' });
  },

  // Exams (Quản lý đề đã tạo)
  async getExams(): Promise<Exam[]> {
    return fetchJson<Exam[]>('/api/exams');
  },

  async getExam(id: string): Promise<Exam> {
    return fetchJson<Exam>(`/api/exams/${id}`);
  },

  async saveExam(exam: Exam): Promise<Exam> {
    return fetchJson<Exam>('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exam),
    });
  },

  async updateExam(id: string, updates: Partial<Exam>): Promise<Exam> {
    return fetchJson<Exam>(`/api/exams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async deleteExam(id: string): Promise<void> {
    await fetchJson(`/api/exams/${id}`, { method: 'DELETE' });
  },

  async duplicateExam(id: string): Promise<Exam> {
    return fetchJson<Exam>(`/api/exams/${id}/duplicate`, { method: 'POST' });
  },

  // Teacher Documents
  async getDocuments(): Promise<TeacherDocument[]> {
    return fetchJson<TeacherDocument[]>('/api/documents');
  },

  async uploadDocument(doc: Omit<TeacherDocument, 'id' | 'createdAt'>): Promise<TeacherDocument> {
    return fetchJson<TeacherDocument>('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
  },

  async deleteDocument(id: string): Promise<void> {
    await fetchJson(`/api/documents/${id}`, { method: 'DELETE' });
  },

  // AI Exam Generation
  async generateExam(params: any): Promise<Exam> {
    return fetchJson<Exam>('/api/generate-exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  },

  async regenerateSection(params: { examId: string; section: 'reading' | 'writing' | 'matrix_spec' | 'guide'; instruction?: string }): Promise<Exam> {
    return fetchJson<Exam>('/api/regenerate-section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  },

  // AI Status
  async getAiStatus(): Promise<{ hasApiKey: boolean; model: string }> {
    return fetchJson<{ hasApiKey: boolean; model: string }>('/api/ai-status');
  },
};
