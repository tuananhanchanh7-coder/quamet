
import React, { useState, useEffect } from 'react';
import { Subject, Grade, LessonPlanData, AiResponse } from './types';
import Sidebar from '@/components/AppSidebar';
import FileUpload from '@/components/FileUpload';
import ResultView from '@/components/ResultView';
import Login from '@/components/Login';
import { enhanceLessonPlan } from '@/services/geminiService';
import AdminDashboard from '@/components/AdminDashboard';
import JSZip from 'jszip';
import { auth } from './lib/firebase';
import { signOut } from 'firebase/auth';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  const [lessonPlans, setLessonPlans] = useState<LessonPlanData[]>([{
    subject: Subject.GDCD,
    grade: Grade.GRADE_6,
    lessonPlanFile: null,
    curriculumFile: null,
    aiCompetencyFile: null,
    addAiCompetency: false,
    addAiCompetencyGreen: false,
  }]);

  const addLessonPlan = () => {
    setLessonPlans([...lessonPlans, {
      subject: Subject.GDCD,
      grade: Grade.GRADE_6,
      lessonPlanFile: null,
      curriculumFile: null,
      aiCompetencyFile: null,
      addAiCompetency: false,
      addAiCompetencyGreen: false,
    }]);
  };

  const removeLessonPlan = (index: number) => {
    setLessonPlans(lessonPlans.filter((_, i) => i !== index));
  };

  const updateLessonPlan = (index: number, data: Partial<LessonPlanData>) => {
    const newLessonPlans = [...lessonPlans];
    newLessonPlans[index] = { ...newLessonPlans[index], ...data };
    setLessonPlans(newLessonPlans);
  };

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
      if (localStorage.getItem('isAdmin') === 'true') {
        setIsAdmin(true);
      }
    }
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [enhancedResults, setEnhancedResults] = useState<AiResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <Login onLogin={() => {
      setIsAuthenticated(true);
      if (localStorage.getItem('isAdmin') === 'true') setIsAdmin(true);
    }} />;
  }

  const extractTextFromDocx = async (file: File): Promise<string> => {
    try {
      const zip = new JSZip();
      const content = await zip.loadAsync(file);
      const docXmlStr = await content.file('word/document.xml')?.async('string');
      
      if (!docXmlStr) return "";

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(docXmlStr, 'application/xml');
      const paragraphs = xmlDoc.getElementsByTagName('w:p');
      let text = "";
      
      for (let i = 0; i < paragraphs.length; i++) {
        text += paragraphs[i].textContent + "\n";
      }
      return text;
    } catch (e) {
      console.error("Lỗi trích xuất text:", e);
      return "";
    }
  };

  const handleProcess = async () => {
    for (const plan of lessonPlans) {
      if (!plan.lessonPlanFile) {
        setError("Vui lòng tải lên file giáo án bắt buộc cho tất cả bài học.");
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const promises = lessonPlans.map(async (plan) => {
        const realLessonPlanText = await extractTextFromDocx(plan.lessonPlanFile!);
        const realPpctText = plan.curriculumFile ? await extractTextFromDocx(plan.curriculumFile) : "";
        const realAiCompetencyText = plan.aiCompetencyFile ? await extractTextFromDocx(plan.aiCompetencyFile) : "";

        return enhanceLessonPlan({
          ...plan,
          lessonPlanContent: realLessonPlanText || "Không thể đọc giáo án.",
          ppctContent: realPpctText || "",
          aiCompetencyContent: realAiCompetencyText
        });
      });
      
      const results = await Promise.all(promises);
      
      setEnhancedResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = (mode: string) => {
    handleProcess();
  };

  return (
    <div className="min-h-screen flex flex-col bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('https://picsum.photos/seed/community/1920/1080?blur=10')" }}>
      <div className="min-h-screen bg-white/80 backdrop-blur-sm flex flex-col">
        <header className="bg-white/90 border-b border-blue-50 py-5 px-6 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200/50 flex-shrink-0 group hover:scale-105 transition-transform">
              <svg className="w-8 h-8 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-950 via-blue-800 to-cyan-600 leading-tight tracking-[-0.02em] uppercase drop-shadow-sm">
                Tích hợp Năng lực số & AI
              </h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <div className="inline-flex items-center px-4 py-1.5 bg-slate-100 border border-slate-200 rounded-full shadow-sm">
                  <span className="text-[11px] text-slate-700 font-bold uppercase tracking-widest">Phát triển bởi Thầy Trương Tuấn Anh</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#E5F2FF] border border-[#B3D9FF] rounded-full shadow-sm">
                  <svg className="w-4 h-4 text-[#0068FF]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.002 9.404C2.002 5.314 6.012 2 11 2s8.998 3.314 8.998 7.404-4.008 7.404-8.998 7.404c-.69 0-1.36-.065-2.006-.188l-3.906 2.052a.256.256 0 01-.363-.26l.512-3.056C3.473 13.91 2.002 11.83 2.002 9.404z" />
                  </svg>
                  <span className="text-[11px] text-[#0068FF] font-black tracking-widest">ZALO: 0368901865</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <button 
                onClick={() => setShowAdminDashboard(true)}
                className="text-purple-600 hover:text-purple-800 font-bold text-xs uppercase tracking-widest transition-colors mr-4 bg-purple-100/50 px-3 py-1.5 rounded-lg"
              >
                QUẢN TRỊ
              </button>
            )}
            <button 
              onClick={async () => {
                await signOut(auth);
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('isAdmin');
                window.location.reload();
              }}
              className="text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-widest transition-colors mr-4"
            >
              ĐĂNG XUẤT
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="text-gray-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-colors"
            >
              LÀM MỚI
            </button>
          </div>
        </div>
      </header>

      {showAdminDashboard && <AdminDashboard onClose={() => setShowAdminDashboard(false)} />}

      <main className="flex-grow max-w-7xl mx-auto w-full p-6 lg:p-10 flex flex-col lg:flex-row gap-10">
        <Sidebar />

        <div className="flex-grow space-y-10">
          {!enhancedResults ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {lessonPlans.map((plan, index) => (
                  <div key={index} className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                      <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                         <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shadow-md shadow-blue-200">{index + 1}</span>
                         Cấu hình bài dạy
                      </h2>
                      {lessonPlans.length > 1 && (
                        <button onClick={() => removeLessonPlan(index)} className="text-red-500 hover:text-red-600 font-bold text-xs uppercase tracking-widest transition-colors">Xóa bài</button>
                      )}
                    </div>
                    
                    <div className="p-8 space-y-8">
                      {/* Row 1: Selectors */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Môn học</label>
                          <select 
                            value={plan.subject}
                            onChange={(e) => updateLessonPlan(index, { subject: e.target.value as Subject })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all font-semibold text-slate-700 shadow-sm"
                          >
                            {Object.values(Subject).map(sub => <option key={sub} value={sub}>{sub}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Khối lớp</label>
                          <select 
                            value={plan.grade}
                            onChange={(e) => updateLessonPlan(index, { grade: e.target.value as Grade })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all font-semibold text-slate-700 shadow-sm"
                          >
                            {Object.values(Grade).map(gr => <option key={gr} value={gr}>{gr}</option>)}
                          </select>
                        </div>
                      </div>

                      <hr className="border-slate-100" />

                      {/* Row 2: File upload */}
                      <FileUpload 
                        label="GIÁO ÁN GỐC (.DOCX)" 
                        required 
                        accept=".docx"
                        file={plan.lessonPlanFile}
                        onFileChange={(file) => updateLessonPlan(index, { lessonPlanFile: file })}
                      />

                      <hr className="border-slate-100" />

                      {/* Row 3: Options */}
                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Tùy chọn tích hợp</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group shadow-sm">
                            <input 
                              type="checkbox" 
                              className="mt-1 w-5 h-5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 transition-all"
                              checked={plan.addAiCompetency}
                              onChange={(e) => updateLessonPlan(index, { addAiCompetency: e.target.checked })}
                            />
                            <div>
                              <span className="font-bold text-slate-800 block text-[13px] uppercase tracking-wide">Tích hợp Năng lực số</span>
                              <span className="text-[13px] text-slate-500 mt-1 block leading-snug">Tự động sinh Năng lực số phù hợp với bài học, chèn vào cuối mục I.2.</span>
                            </div>
                          </label>
                          <label className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group shadow-sm">
                            <input 
                              type="checkbox" 
                              className="mt-1 w-5 h-5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 transition-all"
                              checked={plan.addAiCompetencyGreen}
                              onChange={(e) => updateLessonPlan(index, { addAiCompetencyGreen: e.target.checked })}
                            />
                            <div>
                              <span className="font-bold text-slate-800 block text-[13px] uppercase tracking-wide">Tích hợp AI</span>
                              <span className="text-[13px] text-slate-500 mt-1 block leading-snug">Tự động sinh Năng lực AI phù hợp, chèn vào mục tiêu.</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
              ))}
              <button 
                onClick={addLessonPlan}
                className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold uppercase tracking-widest hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                Thêm bài dạy
              </button>

              <button 
                onClick={handleProcess}
                disabled={isLoading}
                className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-200/50 transition-all flex items-center justify-center gap-4 uppercase tracking-widest
                  ${isLoading ? 'bg-slate-300 cursor-not-allowed text-white shadow-none' : 'bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-1'}`}
              >
                {isLoading ? "ĐANG TỰ ĐỘNG TÍCH HỢP..." : "XỬ LÝ TÍCH HỢP"}
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {enhancedResults!.map((result, index) => (
                <ResultView 
                  key={index}
                  result={result} 
                  originalFile={lessonPlans[index].lessonPlanFile!}
                  onBack={() => setEnhancedResults(null)} 
                  onRefine={(mode) => handleProcess()} 
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 text-center text-slate-500 text-[13px] font-medium no-print opacity-80">
        <span className="font-black uppercase tracking-widest text-[#0068FF] mr-2">TRƯƠNG TUẤN ANH</span> 
        <span className="mx-1 text-slate-300">|</span> 
        <span className="italic ml-2">"Nhân cách là thứ theo ta suốt đời, còn danh lợi chỉ là nhất thời."</span>
      </footer>
      </div>
    </div>
  );
};

export default App;
