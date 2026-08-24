export type CategoryId = 'CAT-1' | 'CAT-2' | 'CAT-3' | 'CAT-4' | 'CAT-5' | 'CAT-6' | 'CAT-7' | 'CAT-8';

export interface ExhibitionRoom {
  id: CategoryId;
  roomNumber: number;
  nameTh: string;
  nameEn: string;
  historicalPeriod: string;
  curatorNarrative: string;
  keyLesson: string;
  color: string;
  icon: string;
  targetStatueIds: number[];
  targetEvidenceIds: number[];
  trapEvidenceId: number;
}

export interface StatueItem {
  id: number;
  nameTh: string;
  nameEn: string;
  role: string;
  era: string;
  categoryId: CategoryId;
  categoryNameTh: string;
  price: number;
  frontImage: string;
  backImage: string;
  sculptureImage?: string;
  qrUrl: string;
  badges: string[];
}

export interface EvidenceItem {
  id: number;
  barcodeSerial: string;
  titleTh: string;
  titleEn: string;
  categoryId: CategoryId;
  categoryNameTh: string;
  mediaType: string;
  archiveSource: string;
  summary: string;
  price: number;
  isAuthentic: boolean;
  frontImage: string;
  backImage: string;
  qrUrl: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  joinedAt: number;
}

export interface PurchaseLog {
  id: string;
  teamId: string;
  memberName: string;
  itemType: 'statue' | 'evidence' | 'story';
  itemId: number;
  itemName: string;
  price: number;
  timestamp: number;
}

export interface TeacherRubric {
  evidenceAccuracy: number;        // 0 - 5 (ความถูกต้องของการคัดกรองหลักฐาน)
  analysisLink: number;            // 0 - 5 (การวิเคราะห์และเชื่อมโยงเหตุการณ์)
  presentationExplanation: number; // 0 - 5 (การอธิบายระหว่างการนำเสนอ)
  presentationSkill: number;       // 0 - 5 (ทักษะการนำเสนอในบทบาทภัณฑารักษ์)
  total: number;                  // 0 - 20
  notes?: string;
  evaluatedAt?: number;
  creativity?: number;
  contentAccuracy?: number;
  evidenceSelection?: number;
  exhibitionLayout?: number;
  reasoning?: number;
  presentation?: number;
}

export interface Chapter1Score {
  evidenceAnalysis: number;   // max 40
  factVsOpinion: number;      // max 20
  reasoning: number;          // max 20
  historicalLink: number;     // max 10
  collaboration: number;      // max 10
  total: number;              // max 100
}

export interface Chapter2Score {
  roomMatch: number;          // max 30
  budgetManagement: number;   // max 20
  exhibitionLayout: number;   // max 20
  contentAccuracy: number;    // max 20
  presentation: number;       // max 10
  total: number;              // max 100
}

export interface TeamState {
  id: string;
  code: string;
  name: string;
  roomId?: CategoryId; // Assigned randomly when teacher starts game
  members: TeamMember[];
  budget: number;
  initialBudget: number;
  statueInventory: number[];
  evidenceInventory: number[];
  storyInventory?: number[];
  isSubmitted: boolean;
  submittedAt?: number;
  submittedBy?: string;
  chapter1Score?: Chapter1Score;
  chapter2Score?: Chapter2Score;
  teacherRubric?: TeacherRubric;
  evidenceReasonings?: Record<number, string>;
  score?: {
    statuePoints: number;
    evidencePoints: number;
    trapPenalties: number;
    budgetBonus: number;
    speedBonus: number;
    totalScore: number;
    statueDetails: { id: number; name: string; isMatch: boolean; points: number }[];
    evidenceDetails: { id: number; title: string; isAuthentic: boolean; isMatch: boolean; points: number }[];
  };
}

export type GamePhase = 'LOBBY' | 'BRIEFING' | 'SHOPPING' | 'EVALUATION' | 'LEADERBOARD';

export interface GameSessionState {
  sessionId: string;
  sessionCode: string;   // 6-char code students enter e.g. "CUR001"
  sessionName: string;   // teacher-defined name e.g. "ม.5/1 - รอบเช้า"
  createdAt: number;     // timestamp ms
  phase: GamePhase;
  startTime: number;
  durationSeconds: number;
  teams: Record<string, TeamState>;
  purchaseLogs: PurchaseLog[];
  isPaused?: boolean;
  pausedAt?: number;
}

// Lightweight summary for session list
export interface SessionSummary {
  sessionId: string;
  sessionCode: string;
  sessionName: string;
  createdAt: number;
  phase: GamePhase;
  teamCount: number;
  playerCount: number;
}
