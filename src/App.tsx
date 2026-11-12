import React, { useState, useEffect } from 'react';
import { Sidebar, PageId } from './components/Sidebar.js';
import { Navbar } from './components/Navbar.js';
import { DashboardView } from './components/DashboardView.js';
import { CreateExamView } from './components/CreateExamView.js';
import { MaterialBankView } from './components/MaterialBankView.js';
import { QuestionBankView } from './components/QuestionBankView.js';
import { ExamsListView } from './components/ExamsListView.js';
import { DocumentsView } from './components/DocumentsView.js';
import { SettingsView } from './components/SettingsView.js';
import { ExamPrintModal } from './components/ExamPrintModal.js';
import { ExamEditModal } from './components/ExamEditModal.js';
import {
  Exam,
  MaterialPassage,
  QuestionBankItem,
  TeacherDocument,
  AppSettings
} from './types/index.js';
import { api } from './services/api.js';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data state
  const [settings, setSettings] = useState<AppSettings>({
    schoolName: 'THCS Nguyễn Du',
    districtName: 'Phòng GD&ĐT Quận Hoàn Kiếm',
    departmentName: 'Tổ Ngữ Văn',
    teacherName: 'Nguyễn Thị Thu Hà',
    schoolYear: '2024 - 2025',
    defaultDuration: 90,
    defaultReadingRatio: 6,
    defaultWritingRatio: 4,
    fontFamily: 'Times New Roman',
    fontSize: 13,
  });

  const [materials, setMaterials] = useState<MaterialPassage[]>([]);
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [documents, setDocuments] = useState<TeacherDocument[]>([]);
  const [hasApiKey, setHasApiKey] = useState(true);

  // Cross-page selection
  const [selectedPassageForCreation, setSelectedPassageForCreation] = useState<MaterialPassage | null>(null);

  // Active Modals
  const [previewExam, setPreviewExam] = useState<Exam | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Initial load
  const loadAllData = async () => {
    try {
      const [s, m, q, e, d, aiStatus] = await Promise.all([
        api.getSettings().catch(() => settings),
        api.getMaterials().catch(() => []),
        api.getQuestions().catch(() => []),
        api.getExams().catch(() => []),
        api.getDocuments().catch(() => []),
        api.getAiStatus().catch(() => ({ hasApiKey: true, model: 'gemini-3.8-flash' })),
      ]);

      if (s) setSettings(s);
      setMaterials(m);
      setQuestions(q);
      setExams(e);
      setDocuments(d);
      setHasApiKey(aiStatus.hasApiKey);
    } catch (err) {
      console.error('Initial data loading error:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    await api.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleSelectMaterialToCreate = (material: MaterialPassage) => {
    setSelectedPassageForCreation(material);
    setCurrentPage('create_exam');
  };

  const handleExamCreated = (newExam: Exam) => {
    setExams(prev => [newExam, ...prev]);
  };

  const handleSaveEditedExam = async (updatedExam: Exam) => {
    await api.updateExam(updatedExam.id, updatedExam);
    setExams(prev => prev.map(e => (e.id === updatedExam.id ? updatedExam : e)));
    if (previewExam?.id === updatedExam.id) {
      setPreviewExam(updatedExam);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col lg:flex-row text-slate-800 antialiased font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={(page) => {
          if (page !== 'create_exam') {
            setSelectedPassageForCreation(null);
          }
          setCurrentPage(page);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        schoolName={settings.schoolName}
        teacherName={settings.teacherName}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          currentPage={currentPage}
          onNavigateToCreate={() => {
            setSelectedPassageForCreation(null);
            setCurrentPage('create_exam');
          }}
          hasApiKey={hasApiKey}
          schoolName={settings.schoolName}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentPage === 'dashboard' && (
            <DashboardView
              exams={exams}
              materials={materials}
              questions={questions}
              documents={documents}
              onNavigate={(page) => setCurrentPage(page)}
              onPreviewExam={(e) => setPreviewExam(e)}
              onSelectMaterialToCreate={handleSelectMaterialToCreate}
            />
          )}

          {currentPage === 'create_exam' && (
            <CreateExamView
              materials={materials}
              documents={documents}
              initialPassage={selectedPassageForCreation}
              onExamCreated={handleExamCreated}
              onPreviewExam={(e) => setPreviewExam(e)}
              onEditExam={(e) => setEditingExam(e)}
            />
          )}

          {currentPage === 'materials' && (
            <MaterialBankView
              materials={materials}
              onSelectToCreate={handleSelectMaterialToCreate}
              onRefresh={loadAllData}
            />
          )}

          {currentPage === 'questions' && (
            <QuestionBankView
              questions={questions}
              onRefresh={loadAllData}
            />
          )}

          {currentPage === 'exams' && (
            <ExamsListView
              exams={exams}
              onNavigateToCreate={() => {
                setSelectedPassageForCreation(null);
                setCurrentPage('create_exam');
              }}
              onPreviewExam={(e) => setPreviewExam(e)}
              onEditExam={(e) => setEditingExam(e)}
              onRefresh={loadAllData}
            />
          )}

          {currentPage === 'documents' && (
            <DocumentsView
              documents={documents}
              onRefresh={loadAllData}
              onSelectPassageToCreate={handleSelectMaterialToCreate}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              hasApiKey={hasApiKey}
            />
          )}
        </main>
      </div>

      {/* Preview and Print Modal */}
      {previewExam && (
        <ExamPrintModal
          exam={previewExam}
          isOpen={!!previewExam}
          onClose={() => setPreviewExam(null)}
          onEdit={() => {
            const toEdit = previewExam;
            setPreviewExam(null);
            setEditingExam(toEdit);
          }}
        />
      )}

      {/* Edit and Review Modal */}
      {editingExam && (
        <ExamEditModal
          exam={editingExam}
          isOpen={!!editingExam}
          onClose={() => setEditingExam(null)}
          onSave={handleSaveEditedExam}
        />
      )}
    </div>
  );
}
