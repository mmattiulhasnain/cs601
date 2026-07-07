export interface AssignmentHeader {
  courseCode: string;
  courseName: string;
  assignmentNo: string;
  semester: string;
  totalMarks: number;
  dueDate: string;
}

export interface StudentInfo {
  studentName: string;
  studentId: string;
  semester: string;
  university: string;
}

export interface Q1Row {
  sentMessage: string;
  receivedMessage: string;
  detectedError: "Single bit error" | "Burst error";
  explanation: string;
}

export interface Q2Row {
  bitsCorrected: number;
  minHammingDistance: number;
  explanation?: string;
}

export interface AssignmentSolution {
  id: number;
  title: string;
  styleName: string;
  colorTheme: {
    primary: string; // Tailwind class
    primaryHex: string; // Hex for DOCX
    secondaryHex: string; // Hex for DOCX accents
    bgLight: string;
  };
  hasCoverPage: boolean;
  docTitle: string;
  introduction: string;
  conclusion: string;
  q1Data: Q1Row[];
  q2Data: Q2Row[];
  formattingNote: string;
  disabledSections?: {
    intro?: boolean;
    diagram?: boolean;
    q1?: boolean;
    q2?: boolean;
    conclusion?: boolean;
  };
  q1Title?: string;
  q1Subtitle?: string;
  q1ColHeaders?: string[];
  q2Title?: string;
  q2Subtitle?: string;
  q2ColHeaders?: string[];
}

export interface ToDoItem {
  id: string;
  task: string;
  category: "instructor" | "user" | "formatting";
  completed: boolean;
  isCompulsory: boolean;
  description: string;
}
