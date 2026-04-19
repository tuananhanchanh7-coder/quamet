
export enum Subject {
  GDCD = 'Giáo dục công dân',
  NGU_VAN = 'Ngữ văn',
  LICH_SU = 'Lịch sử',
  DIA_LY = 'Địa lí',
  TOAN = 'Toán học',
  TIENG_ANH = 'Tiếng Anh',
  KHOA_HOC_TU_NHIEN = 'Khoa học tự nhiên',
  CONG_NGHE = 'Công nghệ',
  TIN_HOC = 'Tin học',
  VAT_LI = 'Vật lí',
  HOA_HOC = 'Hóa học',
  SINH_HOC = 'Sinh học',
  AM_NHAC = 'Âm nhạc',
  MY_THUAT = 'Mĩ thuật',
  THE_DUC = 'Thể dục',
  QUOC_PHONG = 'Giáo dục quốc phòng và an ninh',
  KINH_TE_PHAP_LUAT = 'Giáo dục kinh tế và pháp luật'
}

export enum Grade {
  GRADE_6 = 'Lớp 6',
  GRADE_7 = 'Lớp 7',
  GRADE_8 = 'Lớp 8',
  GRADE_9 = 'Lớp 9',
  GRADE_10 = 'Lớp 10',
  GRADE_11 = 'Lớp 11',
  GRADE_12 = 'Lớp 12'
}

export interface LessonPlanData {
  subject: Subject;
  grade: Grade;
  lessonPlanFile: File | null;
  curriculumFile: File | null;
  aiCompetencyFile: File | null;
  lessonPlanContent?: string;
  ppctContent?: string;
  aiCompetencyContent?: string;
  addAiCompetency: boolean;
  addAiCompetencyGreen: boolean;
}

export interface SummaryReport {
  integratedCompetency: string;
  pedagogicalSummary: {
    competenciesFormed: string;
    alignmentLevel: string;
    expectedEfficiency: string;
  };
  locations: {
    section: string;
    status: 'success' | 'failed';
    reason?: string;
  }[];
}

export interface AiSection {
  id: string;
  competency: string;
  position: string;
  content: string;
  targetText: string;
}

export interface AiLesson {
  lessonTitle: string;
  sections: AiSection[];
}

export interface AiResponse {
  fullContent: string;
  lessons: AiLesson[];
  totalParts: number;
  report: SummaryReport;
}
