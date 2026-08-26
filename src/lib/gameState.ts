import {
  GameSessionState,
  SessionSummary,
  TeamState,
  PurchaseLog,
  GamePhase,
  CategoryId,
  TeacherRubric
} from '../data/types';
import {
  EXHIBITION_ROOMS,
  STATUE_ITEMS,
  EVIDENCE_ITEMS,
  INITIAL_TEAM_BUDGET,
  SHOPPING_DURATION_SECONDS
} from '../data/gameData';
import { STORY_PLACARDS_DATA } from '../data/storyPlacardsData';

import fs from 'fs';
import path from 'path';

// Global in-memory & file-based persistent store (Works on Railway & local environments)
declare global {
  var __GAME_SESSIONS__: Map<string, GameSessionState> | undefined;
  var __SESSION_COUNTER__: number | undefined;
  var __SESSIONS_INITIALIZED__: boolean | undefined;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

function loadSessionsFromFile(): Map<string, GameSessionState> | null {
  try {
    if (!fs.existsSync(SESSIONS_FILE)) return null;
    const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const map = new Map<string, GameSessionState>();
      parsed.forEach((session: GameSessionState) => {
        if (session && session.sessionId) {
          map.set(session.sessionId, session);
        }
      });
      return map;
    }
  } catch (e) {
    console.error('Failed to load sessions from file:', e);
  }
  return null;
}

let lastFileMtime = 0;

export function saveSessionsToFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (global.__GAME_SESSIONS__) {
      const list = Array.from(global.__GAME_SESSIONS__.values());
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
      try {
        lastFileMtime = fs.statSync(SESSIONS_FILE).mtimeMs;
      } catch (_) {}
    }
  } catch (e) {
    console.error('Failed to save sessions to file:', e);
  }
}

function getStore(): Map<string, GameSessionState> {
  let fileMtime = 0;
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      fileMtime = fs.statSync(SESSIONS_FILE).mtimeMs;
    }
  } catch (_) {}

  if (!global.__GAME_SESSIONS__ || fileMtime > lastFileMtime) {
    const fromFile = loadSessionsFromFile();
    if (fromFile !== null && fromFile.size > 0) {
      global.__GAME_SESSIONS__ = fromFile;
      global.__SESSION_COUNTER__ = fromFile.size + 10;
      global.__SESSIONS_INITIALIZED__ = true;
      lastFileMtime = fileMtime;
    } else if (!global.__GAME_SESSIONS__) {
      global.__GAME_SESSIONS__ = new Map();
      global.__SESSION_COUNTER__ = 100;
      global.__SESSIONS_INITIALIZED__ = true;
      saveSessionsToFile();
    }
  }
  return global.__GAME_SESSIONS__;
}

function nextCode(customCode?: string, sessionName?: string): string {
  const store = getStore();
  const existingCodes = new Set(Array.from(store.values()).map(s => s.sessionCode));

  let candidate = '';
  if (customCode && customCode.trim()) {
    candidate = customCode.trim().toUpperCase();
  } else if (sessionName) {
    const match = sessionName.match(/ม\.?\s*(\d+)\s*\/\s*(\d+)/);
    if (match) {
      const g = parseInt(match[1], 10);
      const r = parseInt(match[2], 10);
      const rStr = r < 10 ? `0${r}` : `${r}`;
      candidate = `${g}${rStr}`;
    }
  }

  if (!candidate) {
    if (!global.__SESSION_COUNTER__) global.__SESSION_COUNTER__ = 100;
    global.__SESSION_COUNTER__ += 1;
    candidate = String(global.__SESSION_COUNTER__);
  }

  // Ensure uniqueness if a session with this code already exists
  if (existingCodes.has(candidate)) {
    let suffix = 2;
    while (existingCodes.has(`${candidate}-${suffix}`)) {
      suffix += 1;
    }
    candidate = `${candidate}-${suffix}`;
  }

  return candidate;
}

// ─── Session CRUD ───────────────────────────────────────────────────────────

export function createNewSession(sessionName: string, customCode?: string): GameSessionState {
  const store = getStore();
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const sessionCode = nextCode(customCode, sessionName);

  const session: GameSessionState = {
    sessionId,
    sessionCode,
    sessionName: sessionName.trim() || `รอบที่ ${global.__SESSION_COUNTER__ || 1}`,
    createdAt: Date.now(),
    phase: 'LOBBY',
    startTime: Date.now(),
    durationSeconds: SHOPPING_DURATION_SECONDS,
    teams: {},
    purchaseLogs: []
  };

  store.set(sessionId, session);
  saveSessionsToFile();
  return session;
}

export function getAllSessions(): SessionSummary[] {
  const store = getStore();
  return Array.from(store.values())
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(s => {
      checkAutoPhaseTransitions(s);
      return {
        sessionId: s.sessionId,
        sessionCode: s.sessionCode,
        sessionName: s.sessionName,
        createdAt: s.createdAt,
        phase: s.phase,
        teamCount: Object.keys(s.teams).length,
        playerCount: Object.values(s.teams).reduce((acc, t) => acc + t.members.length, 0)
      };
    });
}

export function getAllFullSessions(): GameSessionState[] {
  const store = getStore();
  const list = Array.from(store.values()).sort((a, b) => b.createdAt - a.createdAt);
  list.forEach(s => checkAutoPhaseTransitions(s));
  return list;
}

function checkAutoPhaseTransitions(session: GameSessionState) {
  if (!session.isPaused && session.durationSeconds > 0) {
    const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
    if (elapsed >= session.durationSeconds) {
      if (session.phase === 'BRIEFING') {
        // Phase 2 (Briefing) -> Auto transition to Phase 3 (Shopping) with 20 minutes default
        applyGamePhase(session, 'SHOPPING', SHOPPING_DURATION_SECONDS);
      } else if (session.phase === 'SHOPPING') {
        // Phase 3 (Shopping) -> Auto transition to Phase 4 (Leaderboard)
        applyGamePhase(session, 'LEADERBOARD');
      }
    }
  }
}

export function getSessionById(sessionId: string): GameSessionState | null {
  const session = getStore().get(sessionId) ?? null;
  if (session) checkAutoPhaseTransitions(session);
  return session;
}

export function getSessionByCode(sessionCode: string): GameSessionState | null {
  const all = Array.from(getStore().values());
  const session = all.find(s => s.sessionCode === sessionCode) ?? null;
  if (session) checkAutoPhaseTransitions(session);
  return session;
}

export function deleteSession(sessionId: string): boolean {
  const result = getStore().delete(sessionId);
  if (result) saveSessionsToFile();
  return result;
}

export function updateSessionName(
  sessionId: string,
  newName: string
): { success: boolean; session?: GameSessionState; error?: string } {
  const session = getSessionById(sessionId);
  if (!session) return { success: false, error: 'ไม่พบห้องนี้ในระบบ' };

  const trimmed = newName.trim();
  if (!trimmed) return { success: false, error: 'กรุณากรอกชื่อห้องเรียน' };

  session.sessionName = trimmed;
  saveSessionsToFile();
  return { success: true, session };
}

// ─── Session-scoped Helpers ──────────────────────────────────────────────────

export function getGameSession(sessionId: string): GameSessionState | null {
  return getSessionById(sessionId);
}

export function resetGameSession(sessionId: string): GameSessionState | null {
  const store = getStore();
  const existing = store.get(sessionId);
  if (!existing) return null;

  const fresh: GameSessionState = {
    sessionId: existing.sessionId,
    sessionCode: existing.sessionCode,
    sessionName: existing.sessionName,
    createdAt: existing.createdAt,
    phase: 'LOBBY',
    startTime: Date.now(),
    durationSeconds: SHOPPING_DURATION_SECONDS,
    teams: {},
    purchaseLogs: []
  };
  store.set(sessionId, fresh);
  saveSessionsToFile();
  return fresh;
}

export const ALL_ROOM_IDS: CategoryId[] = ['CAT-1', 'CAT-2', 'CAT-3', 'CAT-4', 'CAT-5', 'CAT-6', 'CAT-7', 'CAT-8'];

export function getUniqueShuffledRooms(count: number = 8): CategoryId[] {
  const pool = [...ALL_ROOM_IDS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export function shuffleTeamsRooms(sessionId: string): GameSessionState | null {
  const session = getSessionById(sessionId);
  if (!session) return null;

  const teams = Object.values(session.teams);
  if (teams.length > 0) {
    const shuffled = getUniqueShuffledRooms(teams.length);
    teams.forEach((team, index) => {
      team.roomId = shuffled[index];
    });
  }

  saveSessionsToFile();
  return session;
}

export function applyGamePhase(session: GameSessionState, phase: GamePhase, customDurationSeconds?: number): GameSessionState {
  // If moving out of LOBBY to BRIEFING or SHOPPING, guarantee every team gets a UNIQUE room (no duplicates)
  if (phase !== 'LOBBY') {
    const teams = Object.values(session.teams);
    if (teams.length > 0) {
      const assigned = new Set<CategoryId>();
      let hasDuplicateOrMissing = false;
      for (const t of teams) {
        if (!t.roomId || assigned.has(t.roomId)) {
          hasDuplicateOrMissing = true;
          break;
        }
        assigned.add(t.roomId);
      }

      if (hasDuplicateOrMissing) {
        const shuffled = getUniqueShuffledRooms(teams.length);
        teams.forEach((team, index) => {
          team.roomId = shuffled[index];
        });
      }
    }
  }

  session.phase = phase;
  session.startTime = Date.now();
  session.isPaused = false;
  session.pausedAt = undefined;

  if (customDurationSeconds !== undefined) {
    session.durationSeconds = customDurationSeconds;
  } else if (phase === 'LOBBY' || phase === 'LEADERBOARD') {
    session.durationSeconds = 0;
  } else if (phase === 'BRIEFING') {
    session.durationSeconds = 300;
  } else if (phase === 'SHOPPING') {
    session.durationSeconds = SHOPPING_DURATION_SECONDS;
  }

  if (phase === 'LEADERBOARD' || phase === 'EVALUATION') {
    Object.values(session.teams).forEach(team => {
      team.isSubmitted = true;
      if (!team.submittedAt) team.submittedAt = Date.now();
      calculateTeamScore(team, session);
    });
  }
  saveSessionsToFile();
  return session;
}

export function setGamePhase(sessionId: string, phase: GamePhase, customDurationSeconds?: number): GameSessionState | null {
  const session = getStore().get(sessionId) ?? null;
  if (!session) return null;
  return applyGamePhase(session, phase, customDurationSeconds);
}

export function updateSessionDuration(sessionId: string, durationSeconds: number): GameSessionState | null {
  const session = getSessionById(sessionId);
  if (!session) return null;
  session.durationSeconds = durationSeconds;
  saveSessionsToFile();
  return session;
}

export function restartPhaseTimer(sessionId: string): GameSessionState | null {
  const session = getSessionById(sessionId);
  if (!session) return null;
  session.startTime = Date.now();
  saveSessionsToFile();
  return session;
}

export function togglePauseGame(sessionId: string): GameSessionState | null {
  const session = getSessionById(sessionId);
  if (!session) return null;
  if (!session.isPaused) {
    session.isPaused = true;
    session.pausedAt = Date.now();
  } else {
    if (session.pausedAt) {
      const pauseDuration = Date.now() - session.pausedAt;
      session.startTime += pauseDuration;
    }
    session.isPaused = false;
    session.pausedAt = undefined;
  }
  saveSessionsToFile();
  return session;
}

export function createTeam(
  sessionId: string,
  teamName: string,
  leaderName: string
): { team: TeamState; memberId: string } | { error: string } {
  const session = getSessionById(sessionId);
  if (!session) return { error: 'ไม่พบ Session นี้ในระบบ' };

  if (session.phase === 'LEADERBOARD') {
    return { error: 'รอบการเล่นนี้จบลงแล้ว ไม่สามารถสร้างกลุ่มใหม่ได้' };
  }

  if (session.phase !== 'LOBBY') {
    return { error: 'รอบการเล่นนี้เริ่มไปแล้ว ไม่สามารถสร้างกลุ่มใหม่ได้' };
  }

  if (Object.keys(session.teams).length >= 8) {
    return { error: 'มีกลุ่มครบ 8 กลุ่มแล้วในรอบนี้' };
  }

  const usedRoomIds = new Set(Object.values(session.teams).map(t => t.roomId).filter(Boolean));
  const availableRooms = ALL_ROOM_IDS.filter(r => !usedRoomIds.has(r));
  const assignedRoom: CategoryId = availableRooms.length > 0
    ? availableRooms[Math.floor(Math.random() * availableRooms.length)]
    : ALL_ROOM_IDS[Math.floor(Math.random() * ALL_ROOM_IDS.length)];

  const teamId = `team_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const code = (Math.floor(1000 + Math.random() * 9000)).toString();
  const memberId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newTeam: TeamState = {
    id: teamId,
    code,
    name: teamName.trim() || `กลุ่มที่ ${Object.keys(session.teams).length + 1}`,
    roomId: assignedRoom,
    members: [{ id: memberId, name: leaderName.trim() || 'หัวหน้าทีม', avatar: '', joinedAt: Date.now() }],
    budget: INITIAL_TEAM_BUDGET,
    initialBudget: INITIAL_TEAM_BUDGET,
    statueInventory: [],
    evidenceInventory: [],
    storyInventory: [],
    isSubmitted: false
  };

  session.teams[teamId] = newTeam;
  saveSessionsToFile();
  return { team: newTeam, memberId };
}

export function joinTeam(
  sessionId: string,
  code: string,
  memberName: string
): { team: TeamState; memberId: string } | { error: string } {
  const session = getSessionById(sessionId);
  if (!session) return { error: 'ไม่พบ Session นี้ในระบบ' };

  if (session.phase === 'LEADERBOARD') {
    return { error: 'รอบการเล่นนี้จบลงแล้ว ไม่สามารถเข้าร่วมกลุ่มได้' };
  }

  const team = Object.values(session.teams).find(t => t.code === code.trim());
  if (!team) return { error: 'ไม่พบรหัสกลุ่มนี้ กรุณาตรวจสอบรหัส 4 หลักอีกครั้ง' };
  if (team.members.length >= 5) return { error: 'กลุ่มนี้มีสมาชิกครบ 5 คนแล้ว' };

  const memberId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  team.members.push({
    id: memberId,
    name: memberName.trim() || `สมาชิก ${team.members.length + 1}`,
    avatar: '',
    joinedAt: Date.now()
  });

  saveSessionsToFile();
  return { team, memberId };
}

export function reclaimMemberIdentity(
  sessionId: string,
  teamId: string,
  memberId: string
): { team: TeamState; memberId: string } | { error: string } {
  const session = getSessionById(sessionId);
  if (!session) return { error: 'ไม่พบ Session นี้ในระบบ' };

  const team = session.teams[teamId];
  if (!team) return { error: 'ไม่พบกลุ่มที่เลือก' };

  const member = team.members.find((m) => m.id === memberId);
  if (!member) return { error: 'ไม่พบข้อมูลสมาชิกนี้ในกลุ่ม' };

  return { team, memberId: member.id };
}

export function leaveTeam(
  sessionId: string,
  teamId: string,
  memberId: string
): { success: boolean; error?: string } {
  const session = getSessionById(sessionId);
  if (!session) return { success: false, error: 'ไม่พบ Session' };

  const team = session.teams[teamId];
  if (!team) return { success: false, error: 'ไม่พบกลุ่ม' };

  team.members = team.members.filter(m => m.id !== memberId);
  // If no members remain, remove team from session
  if (team.members.length === 0) {
    delete session.teams[teamId];
  }

  saveSessionsToFile();
  return { success: true };
}

export function updateTeamName(
  sessionId: string,
  teamId: string,
  newName: string
): { success: boolean; team?: TeamState; error?: string } {
  const session = getSessionById(sessionId);
  if (!session) return { success: false, error: 'ไม่พบ Session' };

  const team = session.teams[teamId];
  if (!team) return { success: false, error: 'ไม่พบกลุ่ม' };

  const trimmed = newName.trim();
  if (!trimmed) return { success: false, error: 'กรุณากรอกชื่อกลุ่ม' };

  team.name = trimmed;
  saveSessionsToFile();
  return { success: true, team };
}

export function updateMemberName(
  sessionId: string,
  teamId: string,
  memberId: string,
  newName: string
): { success: boolean; team?: TeamState; memberName?: string; error?: string } {
  const session = getSessionById(sessionId);
  if (!session) return { success: false, error: 'ไม่พบ Session' };

  const team = session.teams[teamId];
  if (!team) return { success: false, error: 'ไม่พบกลุ่ม' };

  const member = team.members.find((m) => m.id === memberId);
  if (!member) return { success: false, error: 'ไม่พบข้อมูลสมาชิก' };

  const trimmed = newName.trim();
  if (!trimmed) return { success: false, error: 'กรุณากรอกชื่อของคุณ' };

  member.name = trimmed;
  saveSessionsToFile();
  return { success: true, team, memberName: trimmed };
}

export function purchaseItem(
  sessionId: string,
  teamId: string,
  memberName: string,
  itemType: 'statue' | 'evidence' | 'story',
  itemId: number
): { success: boolean; team?: TeamState; error?: string } {
  const session = getSessionById(sessionId);
  if (!session) return { success: false, error: 'ไม่พบ Session' };

  if (session.phase !== 'SHOPPING') {
    return { success: false, error: 'ยังไม่ถึงช่วงเวลาซื้อของจัดแสดง (รอครูเปิดตลาด)' };
  }

  const team = session.teams[teamId];
  if (!team) return { success: false, error: 'ไม่พบข้อมูลกลุ่ม' };

  if (!team.storyInventory) {
    team.storyInventory = [];
  }

  if (itemType === 'statue') {
    const statue = STATUE_ITEMS.find(s => s.id === itemId);
    if (!statue) return { success: false, error: 'ไม่พบการ์ดรูปปั้น' };
    if (team.statueInventory.includes(itemId)) return { success: false, error: 'กลุ่มของคุณมีการ์ดนี้แล้ว' };
    if (team.budget < statue.price) return { success: false, error: 'งบประมาณไม่เพียงพอ' };

    team.budget -= statue.price;
    team.statueInventory.push(itemId);
    session.purchaseLogs.unshift({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      teamId, memberName, itemType: 'statue', itemId,
      itemName: `${statue.nameTh} (${statue.nameEn})`,
      price: statue.price, timestamp: Date.now()
    });
    saveSessionsToFile();
    return { success: true, team };
  } else if (itemType === 'evidence') {
    const evidence = EVIDENCE_ITEMS.find(e => e.id === itemId);
    if (!evidence) return { success: false, error: 'ไม่พบการ์ดหลักฐาน' };
    if (team.evidenceInventory.includes(itemId)) return { success: false, error: 'กลุ่มของคุณมีการ์ดนี้แล้ว' };
    if (team.budget < evidence.price) return { success: false, error: 'งบประมาณไม่เพียงพอ' };

    team.budget -= evidence.price;
    team.evidenceInventory.push(itemId);
    session.purchaseLogs.unshift({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      teamId, memberName, itemType: 'evidence', itemId,
      itemName: `${evidence.titleTh} [${evidence.barcodeSerial}]`,
      price: evidence.price, timestamp: Date.now()
    });
    saveSessionsToFile();
    return { success: true, team };
  } else if (itemType === 'story') {
    const story = STORY_PLACARDS_DATA.find((s: any) => s.id === itemId);
    if (!story) return { success: false, error: 'ไม่พบรายการที่เลือก' };
    if (team.storyInventory.includes(itemId)) return { success: false, error: 'กลุ่มของคุณมีรายการนี้แล้ว' };
    if (team.budget < story.price) return { success: false, error: 'งบประมาณไม่เพียงพอ' };

    team.budget -= story.price;
    team.storyInventory.push(itemId);
    session.purchaseLogs.unshift({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      teamId,
      memberName,
      itemType: 'story',
      itemId,
      itemName: `${story.titleTh} [${story.recordDate}]`,
      price: story.price,
      timestamp: Date.now()
    });
    saveSessionsToFile();
    return { success: true, team };
  }

  return { success: false, error: 'ประเภทสินค้าไม่ถูกต้อง' };
}

export function submitExhibitionRoom(
  sessionId: string,
  teamId: string,
  memberName?: string
): { success: boolean; team?: TeamState; error?: string } {
  const session = getSessionById(sessionId);
  if (!session) return { success: false, error: 'ไม่พบ Session' };

  const team = session.teams[teamId];
  if (!team) return { success: false, error: 'ไม่พบข้อมูลกลุ่ม' };

  team.isSubmitted = true;
  team.submittedAt = Date.now();
  if (memberName) {
    team.submittedBy = memberName;
  }
  calculateTeamScore(team, session);
  saveSessionsToFile();
  return { success: true, team };
}

export function unlockTeamSubmission(
  sessionId: string,
  teamId: string
): { success: boolean; team?: TeamState; error?: string } {
  const session = getSessionById(sessionId);
  if (!session) return { success: false, error: 'ไม่พบ Session' };

  const team = session.teams[teamId];
  if (!team) return { success: false, error: 'ไม่พบข้อมูลกลุ่ม' };

  team.isSubmitted = false;
  team.submittedAt = undefined;
  team.submittedBy = undefined;
  saveSessionsToFile();
  return { success: true, team };
}

export function unlockAllTeamsSubmission(
  sessionId: string
): { success: boolean; count?: number; error?: string } {
  const session = getSessionById(sessionId);
  if (!session) return { success: false, error: 'ไม่พบ Session' };

  let count = 0;
  for (const team of Object.values(session.teams || {})) {
    if (team.isSubmitted) {
      team.isSubmitted = false;
      team.submittedAt = undefined;
      team.submittedBy = undefined;
      count++;
    }
  }
  saveSessionsToFile();
  return { success: true, count };
}

export function updateTeacherRubric(
  sessionId: string,
  teamId: string,
  rubric: Partial<TeacherRubric>
): { success: boolean; team?: TeamState; error?: string } {
  const session = getSessionById(sessionId);
  if (!session) return { success: false, error: 'ไม่พบ Session' };
  const team = session.teams[teamId];
  if (!team) return { success: false, error: 'ไม่พบข้อมูลกลุ่ม' };

  const evidenceAccuracy = Math.min(5, Math.max(0, rubric.evidenceAccuracy ?? rubric.contentAccuracy ?? 0));
  const analysisLink = Math.min(5, Math.max(0, rubric.analysisLink ?? rubric.reasoning ?? 0));
  const presentationExplanation = Math.min(5, Math.max(0, rubric.presentationExplanation ?? rubric.creativity ?? rubric.exhibitionLayout ?? 0));
  const presentationSkill = Math.min(5, Math.max(0, rubric.presentationSkill ?? rubric.presentation ?? 0));

  const total = evidenceAccuracy + analysisLink + presentationExplanation + presentationSkill;

  team.teacherRubric = {
    evidenceAccuracy,
    analysisLink,
    presentationExplanation,
    presentationSkill,
    total,
    notes: rubric.notes || '',
    evaluatedAt: Date.now(),
    creativity: presentationExplanation,
    contentAccuracy: evidenceAccuracy,
    evidenceSelection: evidenceAccuracy,
    exhibitionLayout: presentationExplanation,
    reasoning: analysisLink,
    presentation: presentationSkill,
  };

  calculateTeamScore(team, session);
  saveSessionsToFile();
  return { success: true, team };
}

export function calculateTeamScore(team: TeamState, session: GameSessionState): void {
  const room = EXHIBITION_ROOMS.find((r) => r.id === (team.roomId || 'CAT-1'));
  if (!room) return;

  const totalItemsCount = (team.statueInventory?.length || 0) + (team.evidenceInventory?.length || 0) + (team.storyInventory?.length || 0);
  if (totalItemsCount === 0) {
    team.score = {
      statuePoints: 0,
      evidencePoints: 0,
      trapPenalties: 0,
      budgetBonus: 0,
      speedBonus: 0,
      totalScore: 0,
      statueDetails: [],
      evidenceDetails: [],
    };
    team.chapter1Score = {
      evidenceAnalysis: 0,
      factVsOpinion: 0,
      reasoning: 0,
      historicalLink: 0,
      collaboration: 0,
      total: 0,
    };
    team.chapter2Score = {
      roomMatch: 0,
      budgetManagement: 0,
      exhibitionLayout: 0,
      contentAccuracy: 0,
      presentation: 0,
      total: 0,
    };
    return;
  }

  let statuePoints = 0;
  let evidencePoints = 0;
  let trapPenalties = 0;
  let matchedStatues = 0;
  let matchedEvidences = 0;
  let authenticEvidences = 0;

  const statueDetails = team.statueInventory.map((id) => {
    const statue = STATUE_ITEMS.find((s) => s.id === id);
    const isMatch = room.targetStatueIds.includes(id);
    if (isMatch) matchedStatues++;
    const points = isMatch ? 100 : 20;
    statuePoints += points;
    return { id, name: statue ? statue.nameTh : `Statue #${id}`, isMatch, points };
  });

  const evidenceDetails = team.evidenceInventory.map((id) => {
    const evidence = EVIDENCE_ITEMS.find((e) => e.id === id);
    const isAuthentic = evidence ? evidence.isAuthentic : true;
    if (isAuthentic) authenticEvidences++;
    const isMatch = room.targetEvidenceIds.includes(id);
    if (isMatch) matchedEvidences++;
    let points = 0;
    if (!isAuthentic) {
      points = -200;
      trapPenalties += 200;
    } else if (isMatch) {
      points = 100;
      evidencePoints += 100;
    } else {
      points = 20;
      evidencePoints += 20;
    }
    return { id, title: evidence ? evidence.titleTh : `Evidence #${id}`, isAuthentic, isMatch, points };
  });

  const budgetBonus = Math.floor(team.budget / 50);
  let speedBonus = 0;
  if (team.submittedAt) {
    const elapsed = (team.submittedAt - session.startTime) / 1000;
    if (elapsed < session.durationSeconds / 2) speedBonus = 100;
    else if (elapsed < session.durationSeconds) speedBonus = 50;
  }

  // ── 📚 Chapter 1: นักสืบประวัติศาสตร์ (Max 100 คะแนน) ──
  const ch1_analysis = Math.min(40, Math.round((matchedEvidences / 4) * 40));
  const ch1_fact = Math.min(20, Math.round((authenticEvidences / Math.max(1, team.evidenceInventory.length)) * 20));
  const ch1_reasoning = Math.min(20, Math.round((matchedEvidences / 4) * 15 + (team.evidenceInventory.length > 0 ? 5 : 0)));
  const ch1_histLink = (team.storyInventory && team.storyInventory.length > 0) ? 10 : 5;
  const ch1_collab = Math.min(10, Math.round((team.members.length / 3) * 10));
  const ch1_total = Math.min(100, ch1_analysis + ch1_fact + ch1_reasoning + ch1_histLink + ch1_collab);

  team.chapter1Score = {
    evidenceAnalysis: ch1_analysis,
    factVsOpinion: ch1_fact,
    reasoning: ch1_reasoning,
    historicalLink: ch1_histLink,
    collaboration: ch1_collab,
    total: ch1_total,
  };

  // ── 🏛️ Chapter 2: ภัณฑารักษ์ (Max 100 คะแนน) ──
  const ch2_match = Math.min(30, Math.round((matchedStatues / 4) * 30));
  const ch2_budget = Math.min(20, Math.round(Math.min(1, team.budget / 800) * 20));
  const ch2_layout = Math.min(20, Math.round(((team.statueInventory.length + team.evidenceInventory.length) / 8) * 20));
  const ch2_content = Math.min(20, Math.round(((matchedStatues + matchedEvidences) / 8) * 20));
  const presScore = team.teacherRubric?.presentationSkill ?? team.teacherRubric?.presentation ?? 4;
  const ch2_presentation = Math.min(10, Math.round((presScore / 5) * 10));
  const ch2_total = Math.min(100, ch2_match + ch2_budget + ch2_layout + ch2_content + ch2_presentation);

  team.chapter2Score = {
    roomMatch: ch2_match,
    budgetManagement: ch2_budget,
    exhibitionLayout: ch2_layout,
    contentAccuracy: ch2_content,
    presentation: ch2_presentation,
    total: ch2_total,
  };

  const totalPointsRaw = Math.max(0, statuePoints + evidencePoints - trapPenalties + budgetBonus + speedBonus);

  team.score = {
    statuePoints,
    evidencePoints,
    trapPenalties,
    budgetBonus,
    speedBonus,
    totalScore: totalPointsRaw,
    statueDetails,
    evidenceDetails,
  };
}
