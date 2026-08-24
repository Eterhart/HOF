'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SessionSummary, GameSessionState, GamePhase, TeamState, TeacherRubric } from '@/data/types';
import { EXHIBITION_ROOMS, STATUE_ITEMS, EVIDENCE_ITEMS } from '@/data/gameData';
import { STORY_PLACARDS_DATA } from '@/data/storyPlacardsData';
import { ArchiveMuseumModal } from '@/components/ArchiveMuseumModal';
import {
  PlusCircle,
  Trash2,
  Users,
  Clock,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Crown,
  Sparkles,
  ShoppingBag,
  Award,
  Eye,
  EyeOff,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Landmark,
  Search,
  BookOpen,
  QrCode,
  Copy,
  Maximize2,
  Check,
  LayoutDashboard,
  Sliders,
  FileText,
  Activity,
  Coins,
  ShieldCheck,
  CheckCheck,
  Save,
  Smartphone,
  User,
  Calendar,
  Flag,
  Gamepad2,
  Unlock,
  Lock,
  LogOut,
  Loader2,
} from 'lucide-react';

const PHASE_LABEL: Record<GamePhase, string> = {
  LOBBY: '1. รอเริ่ม',
  BRIEFING: '2. อ่านบรีฟ',
  SHOPPING: '3. กำลังเล่น (ซื้อของ)',
  EVALUATION: 'ประเมินผล',
  LEADERBOARD: '4. จบเกม',
};

const PHASE_COLOR: Record<GamePhase, string> = {
  LOBBY: 'bg-[#f5f5f7] text-[#7a7a7a] border-[#e0e0e0]',
  BRIEFING: 'bg-blue-50 text-blue-600 border-blue-200',
  SHOPPING: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  EVALUATION: 'bg-amber-50 text-amber-600 border-amber-200',
  LEADERBOARD: 'bg-[#1d1d1f] text-white border-[#1d1d1f]',
};

const PHASE_STEPS: {
  id: GamePhase;
  title: string;
  recommendedDuration: string;
  targetSeconds: number;
  description: string;
  nextPhase?: GamePhase;
  nextPhaseTitle?: string;
}[] = [
  {
    id: 'LOBBY',
    title: '1. รอเริ่ม (Lobby)',
    recommendedDuration: '3–5 นาที',
    targetSeconds: 180,
    description: 'นักเรียนสแกน QR Code เข้าร่วมและตั้งกลุ่ม',
    nextPhase: 'BRIEFING',
    nextPhaseTitle: '2. อ่านบรีฟ (Briefing)',
  },
  {
    id: 'BRIEFING',
    title: '2. อ่านบรีฟ (Briefing)',
    recommendedDuration: '5 นาที',
    targetSeconds: 300,
    description: 'ศึกษาบทบาทภัณฑารักษ์และโจทย์ห้องนิทรรศการ',
    nextPhase: 'SHOPPING',
    nextPhaseTitle: '3. ซื้อของจัดแสดง (Shopping)',
  },
  {
    id: 'SHOPPING',
    title: '3. ซื้อของจัดแสดง (Shopping)',
    recommendedDuration: '20 นาที',
    targetSeconds: 1200,
    description: 'เลือกซื้อรูปปั้น 4 ชิ้น, หลักฐาน 4 ชิ้น, เรื่องราว 1 ชิ้น',
    nextPhase: 'LEADERBOARD',
    nextPhaseTitle: '4. จบเกม (Leaderboard)',
  },
  {
    id: 'LEADERBOARD',
    title: '4. จบเกม',
    recommendedDuration: 'เวลาค้างไว้ที่นี่',
    targetSeconds: 0,
    description: 'ชมนิทรรศการ 3D, ตรวจเฉลย และสรุปบทเรียน',
  },
];

const PHASE_ORDER: Record<GamePhase, number> = {
  LOBBY: 1,
  BRIEFING: 2,
  SHOPPING: 3,
  EVALUATION: 3,
  LEADERBOARD: 4,
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleString('th-TH', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTimeOnly(ts: number) {
  return new Date(ts).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function TeacherPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('curator_teacher_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword) return;
    setLoginError(null);
    setIsLoggingIn(true);

    // Small natural delay for smooth auth feel
    await new Promise((resolve) => setTimeout(resolve, 300));
    setIsLoggingIn(false);

    if (loginUsername.trim() === 'SSPHT' && loginPassword === 'SSPHT') {
      setIsSuccess(true);
      setIsFadingOut(false);
      localStorage.setItem('curator_teacher_auth', 'true');

      // รอให้ตัวอักษร Welcome ลอยขึ้น (~1.2s) แล้วค่อยคลายความเบลอ
      setTimeout(() => {
        setIsFadingOut(true);
      }, 1200);

      // ปิด Login modal และเข้าสู่ Dashboard เมื่อฉากหลังคมชัด (~1.6s)
      setTimeout(() => {
        setIsAuthenticated(true);
        setIsSuccess(false);
        setIsFadingOut(false);
        setLoginUsername('');
        setLoginPassword('');
        setLoginError(null);
        setIsShaking(false);
      }, 1600);
    } else {
      setLoginError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง (SSPHT)');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('curator_teacher_auth');
    setIsAuthenticated(false);
    setLoginUsername('');
    setLoginPassword('');
    setLoginError(null);
    setIsSuccess(false);
    setIsFadingOut(false);
  };

  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [detail, setDetail] = useState<GameSessionState | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState<{ sessionCode: string; sessionName: string } | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<{ sessionCode: string; teamId?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [gradeInput, setGradeInput] = useState('ม.3');
  const [roomInput, setRoomInput] = useState('1');
  const [remarkInput, setRemarkInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🌟 Teacher Dashboard 2 Main Tabs
  const [activeTeacherTab, setActiveTeacherTab] = useState<'control' | 'gallery'>('control');

  // 🌟 Quick Rubric State (1-5)
  const [rubricDrafts, setRubricDrafts] = useState<Record<string, TeacherRubric>>({});
  const [rubricSavedToast, setRubricSavedToast] = useState<string | null>(null);
  const [frozenElapsedSeconds, setFrozenElapsedSeconds] = useState<number | null>(null);
  const [expandedMembersTeamId, setExpandedMembersTeamId] = useState<string | null>(null);
  const [previewPhase, setPreviewPhase] = useState<GamePhase | null>(null);
  const [phaseDurations, setPhaseDurations] = useState<Record<GamePhase, number>>({
    LOBBY: 5,
    BRIEFING: 5,
    SHOPPING: 20,
    LEADERBOARD: 10,
    EVALUATION: 5,
  });

  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);
  const [alertModal, setAlertModal] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [now, setNow] = useState(Date.now());
  const [phaseStartTimes, setPhaseStartTimes] = useState<Record<string, number>>({});
  const [dismissedPrompts, setDismissedPrompts] = useState<Record<string, boolean>>({});
  const [addedExtraTime, setAddedExtraTime] = useState<Record<string, number>>({});

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!detail) return;
    setPhaseStartTimes((prev) => {
      const key = `${detail.sessionId}-${detail.phase}`;
      const startTime = detail.startTime > 0 ? detail.startTime : Date.now();
      if (!prev[key] || Math.abs(prev[key] - startTime) > 5000) {
        return { ...prev, [key]: startTime };
      }
      return prev;
    });
  }, [detail?.sessionId, detail?.phase, detail?.startTime]);

  const fetchSessions = useCallback(async () => {
    const res = await fetch('/api/game');
    if (res.ok) setSessions(await res.json());
  }, []);

  const fetchDetail = useCallback(async (sid: string) => {
    const res = await fetch(`/api/game?sid=${sid}`);
    if (res.ok) {
      const data: GameSessionState = await res.json();
      setDetail(data);
      // Populate rubric drafts from existing saved rubrics
      if (data.teams) {
        const drafts: Record<string, TeacherRubric> = {};
        Object.values(data.teams).forEach((t) => {
          if (t.teacherRubric) {
            drafts[t.id] = { ...t.teacherRubric };
          } else {
            drafts[t.id] = {
              evidenceAccuracy: 0,
              analysisLink: 0,
              presentationExplanation: 0,
              presentationSkill: 0,
              total: 0,
              notes: '',
            };
          }
        });
        setRubricDrafts((prev) => ({ ...drafts, ...prev }));
      }
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (!selectedSessionId) return;
    fetchDetail(selectedSessionId);
    const interval = setInterval(() => fetchDetail(selectedSessionId), 1500);
    return () => clearInterval(interval);
  }, [selectedSessionId, fetchDetail]);

  async function handleCreateSession(e: React.FormEvent) {
    e.preventDefault();
    const gNum = gradeInput.replace(/\D/g, '') || '3'; // e.g. "3"
    const rNum = roomInput.replace(/\D/g, '') || '1';  // e.g. "12"
    const rFormatted = parseInt(rNum, 10) < 10 ? `0${parseInt(rNum, 10)}` : rNum;
    const sessionCode = `${gNum}${rFormatted}`; // e.g. "301", "302", "312"
    const sessionName = remarkInput.trim()
      ? `ม.${gNum}/${rNum} - ${remarkInput.trim()}`
      : `ม.${gNum}/${rNum}`;

    setCreating(true);
    const res = await fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_session', sessionName, sessionCode }),
    });
    const data = await res.json();
    setCreating(false);
    setShowCreateModal(false);
    setRemarkInput('');
    await fetchSessions();
    setSelectedSessionId(data.sessionId);
  }

  async function handleDelete(sessionId: string) {
    setConfirmModal({
      title: 'ลบห้องเรียน (Session)',
      message: 'คุณแน่ใจหรือไม่ว่าต้องการลบ Session นี้? ข้อมูลกลุ่มและการซื้อทั้งหมดจะหายถาวร',
      confirmText: 'ลบทันที',
      cancelText: 'ยกเลิก',
      isDestructive: true,
      onConfirm: async () => {
        await fetch('/api/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete_session', sessionId }),
        });
        if (selectedSessionId === sessionId) setSelectedSessionId(null);
        await fetchSessions();
      },
    });
  }

  const [timerMinutes, setTimerMinutes] = useState('20');
  const [timerSeconds, setTimerSeconds] = useState('00');

  function getDurationSeconds(): number {
    const m = parseInt(timerMinutes, 10) || 0;
    const s = parseInt(timerSeconds, 10) || 0;
    return Math.max(5, m * 60 + s);
  }

  async function executeSetPhase(phase: GamePhase, customDuration?: number) {
    if (!selectedSessionId) return;
    setLoading(true);
    const duration = customDuration ?? (phase === 'SHOPPING' ? getDurationSeconds() : undefined);
    let rightNow = Date.now();

    if (phase === 'LEADERBOARD') {
      const currentElapsed = Math.max(0, Math.floor((Date.now() - (detail?.startTime && detail.startTime > 0 ? detail.startTime : Date.now())) / 1000));
      setFrozenElapsedSeconds(currentElapsed);
    } else {
      // Resuming from LEADERBOARD to an active phase
      if (detail?.phase === 'LEADERBOARD' && frozenElapsedSeconds !== null && frozenElapsedSeconds > 0) {
        rightNow = Date.now() - (frozenElapsedSeconds * 1000);
      }
      setFrozenElapsedSeconds(null);
    }

    const phaseKey = `${selectedSessionId}-${phase}`;
    setNow(Date.now());
    setPhaseStartTimes((prev) => ({ ...prev, [phaseKey]: rightNow }));
    setDetail((prev) => (prev ? { ...prev, phase, startTime: rightNow } : null));

    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_phase',
          sessionId: selectedSessionId,
          phase,
          durationSeconds: duration,
        }),
      });
      await fetchDetail(selectedSessionId);
      await fetchSessions();
    } catch (err) {
      console.error('Error setting phase:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSetPhase(phase: GamePhase, customDuration?: number) {
    if (!selectedSessionId) return;
    if (detail && detail.phase === phase && !customDuration && phase !== 'SHOPPING') return;

    if (phase !== 'LOBBY' && detail && Object.keys(detail.teams || {}).length === 0) {
      setAlertModal({
        title: 'ยังเริ่มเกมไม่ได้',
        message: 'กรุณารอนักเรียนสร้างกลุ่มอย่างน้อย 1 กลุ่มก่อนเริ่มเกม',
      });
      return;
    }

    await executeSetPhase(phase, customDuration);
  }

  async function handleAdjustDuration(stepId: GamePhase, newMinutes: number) {
    const mins = Math.max(0, newMinutes);
    setPhaseDurations((prev) => ({ ...prev, [stepId]: mins }));
    if (selectedSessionId && detail && detail.phase === stepId) {
      const durSec = mins * 60;
      setDetail((prev) => (prev ? { ...prev, durationSeconds: durSec } : null));
      try {
        await fetch('/api/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_duration',
            sessionId: selectedSessionId,
            durationSeconds: durSec,
          }),
        });
      } catch (err) {
        console.error('Failed to update duration:', err);
      }
    }
  }

  async function handleReset() {
    if (!selectedSessionId) return;
    setConfirmModal({
      title: 'ต้องการล้างข้อมูลใช่ไหม?',
      message: 'ข้อมูลจะหายทุกอย่าง ทั้งกลุ่มนักเรียน, การจัดซื้อการ์ด และคะแนนทั้งหมดจะถูกล้างใหม่เป็นห้องว่าง',
      confirmText: 'ยืนยันล้างข้อมูล',
      cancelText: 'ยกเลิก',
      isDestructive: true,
      onConfirm: async () => {
        setPhaseStartTimes({});
        setDismissedPrompts({});
        setAddedExtraTime({});
        await fetch('/api/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reset_game', sessionId: selectedSessionId }),
        });
        await fetchDetail(selectedSessionId);
        await fetchSessions();
      },
    });
  }

  async function handleTogglePause() {
    if (!selectedSessionId) return;
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_pause', sessionId: selectedSessionId }),
      });
      if (res.ok) {
        await fetchDetail(selectedSessionId);
      }
    } catch (err) {
      console.error('Error toggling pause:', err);
    }
  }

  async function handleEndGame() {
    setConfirmModal({
      title: 'จบเกมและสรุปผล',
      message: 'คุณแน่ใจหรือไม่ว่าต้องการจบเกมเพื่อตรวจคำตอบและสรุปบทเรียน?',
      confirmText: 'ยืนยันจบเกม',
      cancelText: 'ยกเลิก',
      onConfirm: async () => {
        await executeSetPhase('LEADERBOARD');
      },
    });
  }

  async function handleUnlockSubmission(teamId: string, teamName: string) {
    if (!selectedSessionId) return;
    setConfirmModal({
      title: 'อนุมัติให้ส่งนิทรรศการใหม่',
      message: `ต้องการปลดล็อกให้กลุ่ม "${teamName}" แก้ไขและส่งผลงานนิทรรศการใหม่อีกครั้งใช่หรือไม่?`,
      confirmText: 'อนุมัติให้ส่งใหม่',
      cancelText: 'ยกเลิก',
      onConfirm: async () => {
        try {
          await fetch('/api/game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'unlock_team_submission',
              sessionId: selectedSessionId,
              teamId,
            }),
          });
          await fetchDetail(selectedSessionId);
          await fetchSessions();
        } catch (err) {
          console.error('Error unlocking submission:', err);
        }
      },
    });
  }

  async function handleSaveRubric(teamId: string) {
    if (!selectedSessionId) return;
    const draft = rubricDrafts[teamId] || {
      evidenceAccuracy: 0,
      analysisLink: 0,
      presentationExplanation: 0,
      presentationSkill: 0,
      notes: '',
      total: 0,
    };
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_rubric',
          sessionId: selectedSessionId,
          teamId,
          rubric: draft,
        }),
      });
      if (res.ok) {
        setRubricSavedToast(teamId);
        setTimeout(() => setRubricSavedToast(null), 3000);
        await fetchDetail(selectedSessionId);
      }
    } catch (err) {
      console.error('Error saving rubric:', err);
    }
  }

  const renderQrModal = () => {
    if (!showQrModal) return null;
    const joinUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/?session=${showQrModal.sessionCode}`
        : `/?session=${showQrModal.sessionCode}`;

    return (
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowQrModal(null);
          }
        }}
        className="fixed inset-0 z-[99999] bg-[#f5f5f7] flex flex-col justify-between p-4 sm:p-8 animate-fadeIn select-none overflow-hidden font-sans cursor-pointer"
      >
        {/* Top Header */}
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-4 shrink-0 cursor-default" onClick={(e) => e.stopPropagation()}>
          <div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#1d1d1f] tracking-tight">
              {showQrModal.sessionName}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                navigator.clipboard.writeText(joinUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              }}
              className="py-2.5 px-4 sm:px-5 bg-white hover:bg-zinc-100 text-[#1d1d1f] rounded-full text-xs sm:text-sm font-medium transition active:scale-95 flex items-center gap-2 border border-[#e0e0e0] shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#7a7a7a]" />}
              <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}</span>
            </button>
            <button
              onClick={() => setShowQrModal(null)}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1d1d1f] hover:bg-black text-white flex items-center justify-center transition active:scale-95 cursor-pointer shadow-md font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Center: Massive QR & PIN */}
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto my-auto space-y-6 cursor-default" onClick={(e) => e.stopPropagation()}>
          <div className="p-5 sm:p-8 bg-white border border-[#e0e0e0] rounded-[32px] shadow-xl flex flex-col items-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(joinUrl)}`}
              alt="QR Code สำหรับเข้าร่วมเกม"
              className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 object-contain rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs sm:text-sm uppercase tracking-widest text-[#7a7a7a] font-semibold">
              รหัสห้อง (Session PIN)
            </span>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {showQrModal.sessionCode.split('').map((char, i) => (
                <div
                  key={i}
                  className="w-12 h-14 sm:w-16 sm:h-20 bg-white border border-[#e0e0e0] rounded-2xl flex items-center justify-center text-2xl sm:text-4xl font-mono font-black text-[#1d1d1f] shadow-sm"
                >
                  {char}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="w-full max-w-3xl mx-auto text-center shrink-0 cursor-default" onClick={(e) => e.stopPropagation()}>
          <p className="text-xs sm:text-sm text-[#7a7a7a]">
            เปิดกล้องโทรศัพท์มือถือ หรือเข้าเว็บ <strong className="text-[#0066cc] font-mono">{typeof window !== 'undefined' ? window.location.host : '...'}</strong> แล้วใส่รหัสห้อง
          </p>
        </div>
      </div>
    );
  };

  const renderCommonModals = () => (
    <>
      {/* Classroom Projector QR Modal */}
      {renderQrModal()}

      {/* Grand Archive Modal */}
      <ArchiveMuseumModal
        isOpen={archiveTarget !== null}
        onClose={() => setArchiveTarget(null)}
        initialSessionCode={archiveTarget?.sessionCode}
        initialTeamId={archiveTarget?.teamId}
      />

      {/* Custom Confirmation Modal */}
      {confirmModal && (
        <div
          onClick={() => setConfirmModal(null)}
          className="fixed inset-0 z-[100000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#e0e0e0] rounded-[24px] max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 text-center cursor-default"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${confirmModal.isDestructive ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-[#0066cc]'}`}>
              {confirmModal.isDestructive ? <AlertTriangle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1d1d1f] tracking-tight">
                {confirmModal.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#7a7a7a] mt-1.5 leading-relaxed">
                {confirmModal.message}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 rounded-full bg-[#f5f5f7] hover:bg-[#e0e0e0] text-[#1d1d1f] text-xs sm:text-sm font-medium transition active:scale-95 cursor-pointer"
              >
                {confirmModal.cancelText || 'ยกเลิก'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = confirmModal.onConfirm;
                  setConfirmModal(null);
                  action();
                }}
                className={`flex-1 py-2.5 rounded-full text-white text-xs sm:text-sm font-medium transition active:scale-95 shadow-sm cursor-pointer ${
                  confirmModal.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-[#0066cc] hover:bg-[#0071e3]'
                }`}
              >
                {confirmModal.confirmText || 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal */}
      {alertModal && (
        <div
          onClick={() => setAlertModal(null)}
          className="fixed inset-0 z-[100000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#e0e0e0] rounded-[24px] max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 text-center cursor-default"
          >
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1d1d1f] tracking-tight">
                {alertModal.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#7a7a7a] mt-1.5 leading-relaxed">
                {alertModal.message}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setAlertModal(null)}
                className="w-full py-2.5 rounded-full bg-[#1d1d1f] hover:bg-black text-white text-xs sm:text-sm font-medium transition active:scale-95 shadow-sm cursor-pointer"
              >
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ─── Authentication Loading Gate ────────────────────────────────────────────
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center font-sans">
        <div className="w-8 h-8 rounded-full border-2 border-[#0066cc] border-t-transparent animate-spin" />
      </div>
    );
  }

  // ─── Login Screen (macOS / Apple Style UI) ──────────────────────────────────
  if (isAuthenticated === false) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 select-none transition-all duration-500 ease-out bg-[#f5f5f7] ${
          isFadingOut
            ? 'bg-opacity-0 backdrop-blur-none opacity-0 pointer-events-none'
            : 'opacity-100'
        }`}
      >
        {/* Modal Container */}
        <div className="relative max-w-[440px] w-full cursor-default">
          {/* Floating Welcome Message Layer */}
          {isSuccess && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <h2 className="text-3xl sm:text-4xl text-[#1D1D1F] font-light tracking-wide animate-welcome-sequence select-none">
                Welcome
              </h2>
            </div>
          )}

          {/* Modal Card Content (ค่อยๆ จางลงโดยไม่เปลี่ยนรูปทรง) */}
          <div
            className={`bg-[#F8F8FA] text-[#1D1D1F] border border-black/[0.12] shadow-[0_24px_64px_rgba(0,0,0,0.18),0_4px_12px_rgba(0,0,0,0.04)] rounded-[22px] w-full overflow-hidden transition-all duration-400 ease-out text-center ${
              isSuccess ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
            }`}
          >
            {/* macOS Header Bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.08] bg-white/70 backdrop-blur-md">
              <h3 className="font-bold text-[15.5px] text-[#1D1D1F] tracking-tight">
                Sign In
              </h3>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-3 py-1 bg-white hover:bg-[#F2F2F7] active:bg-[#E5E5EA] border border-black/15 rounded-[7px] text-xs font-normal text-[#1D1D1F] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleLogin} autoComplete="on" className="p-6 sm:p-7 space-y-5">
              {/* Apple Blue Profile Silhouette Icon */}
              <div className="flex justify-center pt-1 pb-0.5">
                <div className="w-12 h-12 rounded-full bg-[#0071E3]/12 flex items-center justify-center text-[#0071E3]">
                  <svg className="w-6.5 h-6.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1">
                <h4 className="text-[17px] font-bold text-[#1D1D1F] tracking-tight">
                  Login with Game Master ID
                </h4>
                <p className="text-xs text-[#86868B] max-w-[300px] mx-auto leading-relaxed">
                  กรอกชื่อผู้ใช้และรหัสผ่าน SSPHT เพื่อเข้าสู่แผงควบคุมการสอน
                </p>
              </div>

              {/* Error Alert */}
              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 text-left animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Input Fields */}
              <div className={`space-y-3 text-left max-w-[340px] mx-auto w-full transition-all ${isShaking ? 'animate-shake' : ''}`}>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1D1D1F] block">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868B]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={loginUsername}
                      onChange={(e) => {
                        setLoginUsername(e.target.value);
                        if (loginError) setLoginError(null);
                      }}
                      placeholder="Username"
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/15 bg-white text-sm text-[#1D1D1F] outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1D1D1F] block">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868B]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (loginError) setLoginError(null);
                      }}
                      placeholder="Password"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-black/15 bg-white text-sm text-[#1D1D1F] outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#86868B] hover:text-[#1D1D1F] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn || !loginUsername.trim() || !loginPassword}
                className="w-full max-w-[340px] mx-auto py-2.5 px-4 rounded-full bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-white font-medium text-sm tracking-tight transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังเข้าสู่ระบบ...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─── Single Session Detail View ─────────────────────────────────────────────
  if (selectedSessionId && detail) {
    const teams = Object.values(detail.teams || {});
    const playerCount = teams.reduce((sum, t) => sum + (t.members?.length || 0), 0);

    // Calculate learning & competency progress metrics for all teams
    const teamProgressList = teams.map((team) => {
      const room = team.roomId ? EXHIBITION_ROOMS.find((r) => r.id === team.roomId) : null;
      const statues = team.statueInventory || [];
      const evidences = team.evidenceInventory || [];
      const stories = team.storyInventory || [];

      const correctStatuesCount = room ? statues.filter((id) => room.targetStatueIds.includes(id)).length : 0;
      const correctEvidencesCount = room ? evidences.filter((id) => room.targetEvidenceIds.includes(id)).length : 0;
      const correctStoriesCount = room
        ? stories.filter((id) => STORY_PLACARDS_DATA.find((s) => s.id === id)?.categoryId === room.id).length
        : 0;

      const totalItems = statues.length + evidences.length + stories.length;
      const correctItems = correctStatuesCount + correctEvidencesCount + correctStoriesCount;
      const targetItems = 10;

      const ch1 = team.chapter1Score?.total ?? Math.min(100, Math.round((correctEvidencesCount / 4) * 60 + (team.members.length > 0 ? 20 : 0) + (stories.length > 0 ? 20 : 0)));
      const ch2 = team.chapter2Score?.total ?? Math.min(100, Math.round((correctStatuesCount / 4) * 50 + (totalItems / 10) * 30 + 20));
      const rubricTotal = team.teacherRubric?.total ?? 0;
      const combinedScore = team.teacherRubric ? Math.round(ch1 * 0.35 + ch2 * 0.35 + (rubricTotal * 4) * 0.3) : Math.round(ch1 * 0.5 + ch2 * 0.5);

      return {
        team,
        room,
        statuesCount: statues.length,
        evidencesCount: evidences.length,
        storiesCount: stories.length,
        totalItems,
        correctItems,
        targetItems,
        ch1Score: ch1,
        ch2Score: ch2,
        combinedScore,
        rubricTotal,
      };
    });

    const elapsedSeconds = detail.phase === 'LOBBY'
      ? 0
      : Math.max(0, Math.floor((now - (detail.startTime > 0 ? detail.startTime : now)) / 1000));
    const displayElapsed = detail.phase === 'LOBBY'
      ? 0
      : detail.phase === 'LEADERBOARD' && frozenElapsedSeconds !== null
      ? frozenElapsedSeconds
      : elapsedSeconds;

    const currentPhaseStart = phaseStartTimes[`${selectedSessionId}-${detail.phase}`] || detail.startTime || now;
    const phaseElapsedSeconds = detail.phase === 'LOBBY' || detail.phase === 'LEADERBOARD'
      ? 0
      : Math.max(0, Math.floor((now - currentPhaseStart) / 1000));

    const formatElapsed = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
      <div className="min-h-screen bg-[#f5f5f7] font-sans pb-16">
        {/* Top Sticky Bar */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[#e0e0e0] px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedSessionId(null)}
              className="flex items-center gap-1.5 text-[#0066cc] text-xs sm:text-sm font-semibold hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>รอบทั้งหมด</span>
            </button>
            <span className="text-[#e0e0e0]">|</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-[#1d1d1f]">{detail.sessionName}</span>
              <span className="px-2 py-0.5 rounded-full font-mono font-bold text-xs bg-blue-50 text-[#0066cc] border border-blue-200">
                {detail.sessionCode}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Pause / Resume Button */}
            <button
              onClick={handleTogglePause}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold active:scale-95 transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                detail.isPaused
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
              }`}
              title={detail.isPaused ? 'กดเพื่อเล่นเกมต่อ' : 'กดเพื่อหยุดเวลาเกมชั่วคราว'}
            >
              {detail.isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
              <span>{detail.isPaused ? 'เล่นเกมต่อ' : 'พักเกมชั่วคราว'}</span>
            </button>
            <button
              onClick={() => setShowQrModal({ sessionCode: detail.sessionCode, sessionName: detail.sessionName })}
              className="px-3 py-1.5 bg-[#f5f5f7] hover:bg-[#e0e0e0] text-[#1d1d1f] border border-[#e0e0e0] rounded-full text-xs font-semibold active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-[#0066cc]" />
              <span>ฉาย QR Code</span>
            </button>
            <button
              onClick={() => setArchiveTarget({ sessionCode: detail.sessionCode })}
              className="px-3 py-1.5 bg-[#1d1d1f] hover:bg-black text-white rounded-full text-xs font-semibold active:scale-95 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Landmark className="w-3.5 h-3.5 text-amber-300" />
              <span>พิพิธภัณฑ์</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-[#7a7a7a] hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-full transition cursor-pointer"
              title="ออกจากระบบ (Logout SSPHT)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="max-w-7xl 2xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-5">
          {/* 🌟 Apple-style 2 Main Tabs Navigation */}
          <div className="bg-white border border-[#e0e0e0] rounded-2xl p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'control', label: '1. ควบคุมเกม & ทักษะ (Chapter Control)', icon: Sliders },
              { id: 'gallery', label: '2. เดินตรวจนิทรรศการ (Walk Gallery)', icon: Landmark },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTeacherTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTeacherTab(tab.id as any)}
                  className={`flex-1 min-w-[180px] sm:min-w-0 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    isActive
                      ? 'bg-[#1d1d1f] text-white shadow-xs'
                      : 'text-[#7a7a7a] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-[#7a7a7a]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ══════════════════════════════════════════════════════════════════════
              TAB 1: 🎮 ควบคุมเกม & ทักษะ (Chapter Control & Skills Framework)
             ══════════════════════════════════════════════════════════════════════ */}
          {activeTeacherTab === 'control' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* ─── 📱 1st Component: Clean Classroom QR Code & PIN Join Area ─── */}
              <div className="bg-white border border-[#e0e0e0] rounded-[24px] p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0066cc] text-xs font-semibold">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>สแกนเข้าร่วมห้องเรียนและสร้างทีม</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#1d1d1f] tracking-tight">
                    {detail.sessionName}
                  </h3>
                  <p className="text-xs text-[#7a7a7a]">
                    ให้นักเรียนสแกน QR Code หรือเข้าเว็บแล้วพิมพ์รหัสห้อง (PIN)
                  </p>
                </div>

                {/* Centered QR Code with click-to-expand */}
                <div
                  onClick={() => setShowQrModal({ sessionCode: detail.sessionCode, sessionName: detail.sessionName })}
                  className="relative group p-3 bg-white border border-[#e0e0e0] rounded-[24px] shadow-sm cursor-pointer transition-transform active:scale-95"
                  title="คลิกเพื่อขยาย QR Code เต็มจอ"
                >
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(
                      typeof window !== 'undefined'
                        ? `${window.location.origin}/?session=${detail.sessionCode}`
                        : `/?session=${detail.sessionCode}`
                    )}`}
                    alt="QR Code"
                    className="w-48 h-48 sm:w-60 sm:h-60 object-contain rounded-xl"
                  />
                  <div className="absolute inset-0 bg-[#0066cc]/10 opacity-0 group-hover:opacity-100 rounded-[24px] flex items-center justify-center transition">
                    <div className="px-3.5 py-1.5 rounded-full bg-[#0066cc] text-white text-xs font-medium flex items-center gap-1.5 shadow-lg">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>คลิกเพื่อขยายเต็มจอ</span>
                    </div>
                  </div>
                </div>

                {/* PIN Box Section */}
                <div className="pt-1 flex flex-col items-center justify-center gap-2">
                  <span className="text-[11px] uppercase tracking-widest text-[#7a7a7a] font-semibold">
                    รหัสห้อง (SESSION PIN)
                  </span>
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                    {detail.sessionCode.split('').map((char, cIdx) => (
                      <div
                        key={`pin-char-${cIdx}`}
                        className="w-10 h-12 sm:w-12 sm:h-14 bg-white border border-[#e0e0e0] rounded-xl flex items-center justify-center font-mono font-black text-xl sm:text-2xl text-[#1d1d1f] shadow-xs"
                      >
                        {char}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== 'undefined') {
                          const joinUrl = typeof window !== 'undefined'
                            ? `${window.location.origin}/?session=${detail.sessionCode}`
                            : `/?session=${detail.sessionCode}`;
                          navigator.clipboard.writeText(joinUrl);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                      className="ml-1 px-3 py-3 bg-[#f5f5f7] hover:bg-[#e0e0e0] border border-[#e0e0e0] rounded-xl text-xs font-semibold text-[#1d1d1f] flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
                      title="คัดลอกลิงก์ห้องเรียน"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#7a7a7a]" />}
                      <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ─── ⏱️ 2nd Component: Dedicated Game State & Active Timer Square Card ─── */}
              <div className="max-w-md mx-auto w-full bg-white border border-[#e0e0e0] rounded-[24px] p-6 sm:p-7 shadow-sm text-center flex flex-col items-center justify-center space-y-3.5">
                {/* บรรทัด 1: สถานะปัจจุบัน (CURRENT STATE) */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-[#0066cc] text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#0066cc] animate-pulse" />
                  <span>สถานะปัจจุบัน (CURRENT STATE)</span>
                </div>

                {/* บรรทัด 2: ชื่อขั้นตอน + ป้ายสถานะ */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <h3 className="text-2xl font-black text-[#1d1d1f] tracking-tight">
                    {PHASE_LABEL[detail.phase]}
                  </h3>
                  {detail.isPaused ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full border font-bold bg-amber-50 text-amber-800 border-amber-300 animate-pulse inline-flex items-center gap-1 shadow-xs">
                      <Pause className="w-3 h-3 fill-current" />
                      พักเกมชั่วคราว
                    </span>
                  ) : (
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${PHASE_COLOR[detail.phase]}`}>
                      {detail.phase === 'LEADERBOARD' ? 'เสร็จสิ้น' : 'กำลังดำเนินการ'}
                    </span>
                  )}
                </div>

                {/* บรรทัด 3: รายละเอียดขั้นตอน */}
                <p className="text-xs text-[#7a7a7a] max-w-xs leading-relaxed">
                  {PHASE_STEPS.find((s) => s.id === detail.phase)?.description || 'ขั้นตอนการจัดกิจกรรม'}
                </p>

                {/* บรรทัดต่อมา: กล่องเวลาใน State นี้ + Total Time */}
                <div className="w-full bg-[#f5f5f7] border border-[#e0e0e0] rounded-2xl p-4 flex flex-col items-center justify-center space-y-1.5 shadow-2xs">
                  <span className="text-[11px] font-bold text-[#7a7a7a] uppercase tracking-wider">
                    เวลาใน State นี้
                  </span>
                  <div className="text-4xl font-mono font-black text-[#0066cc] tracking-tight">
                    {detail.phase === 'LOBBY'
                      ? '--:--'
                      : detail.phase === 'LEADERBOARD'
                      ? 'จบเกม'
                      : formatElapsed(phaseElapsedSeconds)}
                  </div>
                  <div className="text-xs font-mono text-[#7a7a7a] pt-2 border-t border-[#e0e0e0] w-full text-center">
                    Total Time: <strong className="font-bold text-[#1d1d1f]">{formatElapsed(displayElapsed)}</strong>
                    {detail.isPaused ? (
                      <span className="text-amber-600 ml-1 font-bold">(หยุดเวลาชั่วคราว)</span>
                    ) : detail.phase === 'LOBBY' ? (
                      <span className="text-zinc-500 ml-1 font-normal">(รอเริ่ม)</span>
                    ) : detail.phase === 'LEADERBOARD' ? (
                      <span className="text-amber-600 ml-1 font-normal">(เสร็จสิ้น)</span>
                    ) : null}
                  </div>
                </div>

                {/* Pause Button in State Square Card */}
                <button
                  type="button"
                  onClick={handleTogglePause}
                  className={`w-auto px-5 py-2 rounded-full text-xs font-bold active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                    detail.isPaused
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {detail.isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                  <span>{detail.isPaused ? 'เริ่มเกมต่อ' : 'พักเกมชั่วคราว'}</span>
                </button>
              </div>

              {/* ─── ตารางแสดง 8 กลุ่ม (แบ่งด้วยเส้น ไร้กรอบการ์ด, สมาชิก List 1. 2. 3., ไร้พื้นหลังขาว) ─── */}
              <div className="w-full border border-[#e0e0e0] rounded-2xl overflow-hidden shadow-2xs bg-transparent">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-y-0 divide-[#e0e0e0]">
                  {Array.from({ length: 8 }, (_, idx) => {
                    const team = teams[idx];
                    const room = team?.roomId ? EXHIBITION_ROOMS.find((r) => r.id === team.roomId) : null;
                    const memberCount = team?.members?.length || 0;
                    const isLastColLg = idx % 4 === 3;
                    const isTopRowLg = idx < 4;
                    const isLeftColSm = idx % 2 === 0;
                    const isNotBottomSm = idx < 6;

                    return (
                      <div
                        key={`group-grid-cell-${idx + 1}`}
                        className={`p-3.5 sm:p-4 flex flex-col justify-between gap-2.5 transition-colors bg-transparent hover:bg-black/[0.02] ${
                          !isLastColLg ? 'lg:border-r border-[#e0e0e0]' : ''
                        } ${isTopRowLg ? 'lg:border-b border-[#e0e0e0]' : ''} ${
                          isLeftColSm ? 'sm:border-r lg:border-r-0 border-[#e0e0e0]' : ''
                        } ${isNotBottomSm ? 'sm:border-b lg:border-b-0 border-[#e0e0e0]' : ''}`}
                      >
                        {/* Top: Header (#1 Team Name, Room & Big Thin Member Count X/5) */}
                        <div className="flex items-start justify-between gap-3">
                          {/* Left Details */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-[10px] font-mono font-bold text-[#7a7a7a]">
                                #{idx + 1}
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-[#1d1d1f] truncate">
                                {team ? team.name : 'ยังไม่มีกลุ่ม'}
                              </h4>
                            </div>

                            {/* ชื่อหัวข้อที่ได้ + สถานะการส่ง */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-[11px] font-semibold text-[#0066cc] truncate">
                                {room ? `ห้อง ${room.roomNumber}: ${room.nameTh}` : (team ? 'รอสุ่มห้อง' : '—')}
                              </p>
                              {team && (
                                <span className={`shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-bold inline-flex items-center gap-0.5 ${
                                  team.isSubmitted
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : detail.phase === 'SHOPPING' || detail.phase === 'EVALUATION'
                                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                    : 'bg-[#f5f5f7] text-[#7a7a7a] border-[#e0e0e0]'
                                }`}>
                                  {team.isSubmitted ? '✓ ส่งแล้ว' : detail.phase === 'SHOPPING' ? 'กำลังจัด' : 'ยังไม่ส่ง'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right: Big Thin X/5 Spanning ~3 Lines */}
                          <div className="shrink-0 flex items-center justify-center select-none pt-0.5">
                            <span className={`text-3xl sm:text-4xl font-mono font-extralight tracking-tighter leading-none ${
                              memberCount >= 5
                                ? 'text-rose-500 font-light'
                                : memberCount > 0
                                ? 'text-[#0066cc] font-light'
                                : 'text-[#c7c7cc]'
                            }`}>
                              {memberCount}<span className="text-xl sm:text-2xl font-thin opacity-60">/5</span>
                            </span>
                          </div>
                        </div>

                        {/* Bottom: สมาชิก List เป็นบรรทัด 1. 2. 3. */}
                        <div className="pt-2 border-t border-[#f0f0f2] space-y-1 text-[11px]">
                          <span className="text-[10px] text-[#7a7a7a] font-medium block">รายชื่อสมาชิก:</span>
                          {team?.members && team.members.length > 0 ? (
                            <ol className="space-y-0.5 text-[#1d1d1f] font-medium leading-snug">
                              {team.members.map((m, mIdx) => (
                                <li key={m.id || mIdx} className="truncate">
                                  {mIdx + 1}. {m.name}
                                </li>
                              ))}
                            </ol>
                          ) : (
                            <span className="text-[#a1a1a6] italic block text-[10.5px]">—</span>
                          )}
                        </div>

                        {/* Action: ปลดล็อกให้ส่งใหม่ (เมื่อทีมส่งแล้ว) */}
                        {team && team.isSubmitted && (
                          <div className="pt-2 border-t border-[#f0f0f2]">
                            <button
                              type="button"
                              onClick={() => handleUnlockSubmission(team.id, team.name)}
                              className="w-full py-1 px-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-md text-[10.5px] font-semibold flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
                              title="อนุมัติให้กลุ่มนี้แก้ไขและส่งนิทรรศการใหม่อีกครั้ง"
                            >
                              <Unlock className="w-3 h-3 text-amber-700" />
                              <span>อนุมัติให้ส่งใหม่</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ─── 2-Column Responsive Layout: Controls on Left, Student View on Right ─── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* 👈 LEFT COLUMN: Stepper & Live Phase Controller */}
                <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-8 bg-white border border-[#e0e0e0] rounded-[24px] p-5 sm:p-6 space-y-5 shadow-sm">
                  <div className="border-b border-[#e0e0e0] pb-4">
                    <h2 className="text-base font-bold text-[#1d1d1f] flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#0066cc]" />
                      <span>แผงควบคุมขั้นตอนการสอน (Game Master Control)</span>
                    </h2>
                    <p className="text-xs text-[#7a7a7a] mt-0.5">
                      ครูสามารถคลิกเลือกและสลับขั้นตอนการสอน พร้อมปรับระยะเวลานับถอยหลังของแต่ละขั้นตอนได้โดยตรง
                    </p>
                  </div>

                  {/* 4 Phase Cards (2-column layout on left side) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {PHASE_STEPS.map((step, sIdx) => {
                      const isActive = detail.phase === step.id;
                      const isPast = PHASE_ORDER[detail.phase] > PHASE_ORDER[step.id];
                      const hasTimer = step.id === 'BRIEFING' || step.id === 'SHOPPING';
                      const currentDuration = phaseDurations[step.id] !== undefined
                        ? phaseDurations[step.id]
                        : (isActive && detail.durationSeconds !== undefined ? Math.round(detail.durationSeconds / 60) : (step.id === 'SHOPPING' ? 20 : 5));
                      const isNoTimer = currentDuration === 0;
                      const targetSeconds = isNoTimer ? 0 : currentDuration * 60;
                      const progressPercent = isActive && hasTimer && targetSeconds > 0
                        ? Math.min(100, Math.max(1, Math.round((phaseElapsedSeconds / targetSeconds) * 100)))
                        : isPast
                        ? 100
                        : 0;

                      return (
                        <div
                          key={step.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3.5 relative overflow-hidden ${
                            isActive
                              ? 'bg-emerald-950 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/25'
                              : isPast
                              ? 'bg-emerald-50/40 border-emerald-200/80 text-[#1d1d1f]'
                              : 'bg-[#fafafc] border-[#e0e0e0] text-[#7a7a7a]'
                          }`}
                        >
                          {/* 🌟 หลอดเวลาสีเขียวพื้นหลัง (เฉพาะ Phase ที่มีการจับเวลาและมีเวลานับถอยหลัง) */}
                          {isActive && hasTimer && targetSeconds > 0 && (
                            <div
                              className="absolute top-0 bottom-0 left-0 bg-emerald-600/40 transition-all duration-1000 ease-linear pointer-events-none z-0 border-r border-emerald-400/50"
                              style={{ width: `${progressPercent}%` }}
                            />
                          )}

                          <div className="space-y-2 relative z-10">
                            <div className="flex items-center justify-between">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isActive
                                    ? 'bg-emerald-500 text-white shadow-xs'
                                    : isPast
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white border border-[#e0e0e0] text-[#7a7a7a]'
                                }`}
                              >
                                {isPast ? <Check className="w-3.5 h-3.5" /> : sIdx + 1}
                              </span>
                              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                                isActive
                                  ? 'bg-emerald-800/80 text-emerald-100 border border-emerald-600/50'
                                  : 'bg-zinc-200/60 text-zinc-700'
                              }`}>
                                {!hasTimer
                                  ? (step.id === 'LOBBY' ? 'รอเริ่ม' : 'จบเกม')
                                  : isNoTimer
                                  ? 'ไม่จับเวลา'
                                  : `${currentDuration} นาที`}
                              </span>
                            </div>

                            <div>
                              <h3 className={`text-sm font-bold ${isActive ? 'text-white' : 'text-[#1d1d1f]'}`}>
                                {step.title}
                              </h3>
                              <p className={`text-xs mt-0.5 line-clamp-2 ${isActive ? 'text-emerald-100/80' : 'text-[#7a7a7a]'}`}>
                                {step.description}
                              </p>
                            </div>

                            {/* หลอดความคืบหน้าเวลาสีเขียว (เฉพาะ Phase ที่มีการจับเวลาและกำลังดำเนินการ) */}
                            {isActive && hasTimer ? (
                              <div className="space-y-1 pt-1 min-h-[38px]">
                                <div className="flex items-center justify-between text-[10px] font-mono text-emerald-200">
                                  <span>เวลาผ่านไป:</span>
                                  <span>
                                    {formatElapsed(phaseElapsedSeconds)}
                                    {isNoTimer ? ' (ไม่จับเวลา)' : ` / ${formatElapsed(targetSeconds)} (${progressPercent}%)`}
                                  </span>
                                </div>
                                {targetSeconds > 0 ? (
                                  <div className="w-full bg-black/40 rounded-full h-2 p-0.5 overflow-hidden border border-emerald-400/40">
                                    <div
                                      className="bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(52,211,153,0.9)]"
                                      style={{ width: `${progressPercent}%` }}
                                    />
                                  </div>
                                ) : (
                                  <div className="w-full h-2" />
                                )}
                              </div>
                            ) : (
                              <div className="min-h-[12px]" />
                            )}

                            {/* Matching Middle Container for all 4 Cards */}
                            {hasTimer ? (
                              /* Duration Adjuster & Presets (Card 2 & Card 3) */
                              <div className={`p-3 sm:p-3.5 rounded-2xl border space-y-2.5 ${
                                isActive ? 'bg-emerald-900/80 border-emerald-700/80' : 'bg-[#fbfbfd] border-[#e0e0e0]'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-bold ${isActive ? 'text-emerald-100' : 'text-[#1d1d1f]'}`}>ตั้งเวลา:</span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleAdjustDuration(step.id, Math.max(0, currentDuration - 1))}
                                      className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-sm border cursor-pointer active:scale-95 transition-all shadow-xs ${
                                        isActive ? 'bg-emerald-800 border-emerald-600 text-white hover:bg-emerald-700' : 'bg-white border-[#d2d2d7] text-[#1d1d1f] hover:bg-zinc-100'
                                      }`}
                                      title="ลดเวลา 1 นาที"
                                    >
                                      -
                                    </button>
                                    {isNoTimer ? (
                                      <span className={`font-bold text-xs px-2.5 py-1 rounded-lg border ${
                                        isActive ? 'text-emerald-100 bg-emerald-800/90 border-emerald-600' : 'text-[#0066cc] bg-blue-50 border-blue-200'
                                      }`}>
                                        ไม่จับเวลา
                                      </span>
                                    ) : (
                                      <div className="flex items-baseline gap-1">
                                        <span className={`font-mono font-black text-base px-1 min-w-[28px] text-center ${
                                          isActive ? 'text-white' : 'text-[#1d1d1f]'
                                        }`}>
                                          {currentDuration}
                                        </span>
                                        <span className={`text-xs ${isActive ? 'text-emerald-200' : 'text-[#7a7a7a]'}`}>นาที</span>
                                      </div>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleAdjustDuration(step.id, currentDuration + (isNoTimer ? 3 : 1))}
                                      className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-sm border cursor-pointer active:scale-95 transition-all shadow-xs ${
                                        isActive ? 'bg-emerald-800 border-emerald-600 text-white hover:bg-emerald-700' : 'bg-white border-[#d2d2d7] text-[#1d1d1f] hover:bg-zinc-100'
                                      }`}
                                      title="เพิ่มเวลา 1 นาที"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {/* Quick Presets (4x2 Symmetrical Grid) */}
                                <div className="grid grid-cols-4 gap-1.5 pt-1.5 border-t border-emerald-700/40">
                                  {[
                                    { label: 'ไม่จับเวลา', val: 0 },
                                    { label: '3 นาที', val: 3 },
                                    { label: '5 นาที', val: 5 },
                                    { label: '10 นาที', val: 10 },
                                    { label: '15 นาที', val: 15 },
                                    { label: '20 นาที', val: 20 },
                                    { label: '25 นาที', val: 25 },
                                    { label: '30 นาที', val: 30 },
                                  ].map((p) => (
                                    <button
                                      key={p.label}
                                      type="button"
                                      onClick={() => handleAdjustDuration(step.id, p.val)}
                                      className={`py-1.5 px-1 rounded-lg text-[11px] font-mono font-medium cursor-pointer transition-all active:scale-95 flex items-center justify-center text-center shadow-xs border ${
                                        currentDuration === p.val
                                          ? isActive
                                            ? 'bg-white text-emerald-950 font-bold border-white shadow-sm'
                                            : 'bg-[#0066cc] text-white font-bold border-[#0066cc] shadow-sm'
                                          : isActive
                                          ? 'bg-emerald-800/90 text-emerald-100 border-emerald-700 hover:bg-emerald-700 hover:text-white'
                                          : 'bg-white text-[#1d1d1f] border-[#e0e0e0] hover:bg-zinc-100'
                                      }`}
                                    >
                                      {p.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : step.id === 'LOBBY' ? (
                              /* Status Info Box for Card 1 (Lobby) */
                              <div className={`p-3 sm:p-3.5 rounded-2xl border space-y-2.5 ${
                                isActive ? 'bg-emerald-900/80 border-emerald-700/80' : 'bg-[#fbfbfd] border-[#e0e0e0]'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-bold ${isActive ? 'text-emerald-100' : 'text-[#1d1d1f]'}`}>สถานะห้องเรียน:</span>
                                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg border ${
                                    isActive ? 'bg-emerald-800 text-emerald-100 border-emerald-600' : 'bg-blue-50 text-[#0066cc] border-blue-200'
                                  }`}>
                                    PIN: {detail.sessionCode}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-emerald-700/40">
                                  <div className={`p-2 rounded-xl text-center border ${
                                    isActive ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200' : 'bg-white border-[#e0e0e0] text-[#1d1d1f]'
                                  }`}>
                                    <div className="text-[10px] text-[#7a7a7a]">กลุ่มทั้งหมด</div>
                                    <div className="text-base font-bold font-mono">{teams.length}</div>
                                  </div>
                                  <div className={`p-2 rounded-xl text-center border ${
                                    isActive ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200' : 'bg-white border-[#e0e0e0] text-[#1d1d1f]'
                                  }`}>
                                    <div className="text-[10px] text-[#7a7a7a]">ผู้เล่นรวม</div>
                                    <div className="text-base font-bold font-mono">{teams.reduce((acc, t) => acc + (t.members?.length || 0), 0)}</div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* Status Info Box for Card 4 (Ending) */
                              <div className={`p-3 sm:p-3.5 rounded-2xl border space-y-2.5 ${
                                isActive ? 'bg-emerald-900/80 border-emerald-700/80' : 'bg-[#fbfbfd] border-[#e0e0e0]'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-bold ${isActive ? 'text-emerald-100' : 'text-[#1d1d1f]'}`}>สถานะการส่งงาน:</span>
                                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg border ${
                                    isActive ? 'bg-emerald-800 text-emerald-100 border-emerald-600' : 'bg-blue-50 text-[#0066cc] border-blue-200'
                                  }`}>
                                    {teams.filter((t) => t.isSubmitted).length}/{teams.length} กลุ่ม
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-emerald-700/40">
                                  <div className={`p-2 rounded-xl text-center border ${
                                    isActive ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200' : 'bg-white border-[#e0e0e0] text-[#1d1d1f]'
                                  }`}>
                                    <div className="text-[10px] text-[#7a7a7a]">ส่งตรวจแล้ว</div>
                                    <div className="text-base font-bold font-mono text-emerald-600">{teams.filter((t) => t.isSubmitted).length}</div>
                                  </div>
                                  <div className={`p-2 rounded-xl text-center border ${
                                    isActive ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200' : 'bg-white border-[#e0e0e0] text-[#1d1d1f]'
                                  }`}>
                                    <div className="text-[10px] text-[#7a7a7a]">ยังไม่ส่ง</div>
                                    <div className="text-base font-bold font-mono text-amber-600">{teams.filter((t) => !t.isSubmitted).length}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <button
                            type="button"
                            onClick={() => handleSetPhase(step.id, hasTimer ? (isNoTimer ? 0 : currentDuration * 60) : undefined)}
                            disabled={loading}
                            className={`relative z-10 w-full py-2.5 rounded-full text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs ${
                              isActive
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-white font-black shadow-md shadow-emerald-950/50'
                                : hasTimer
                                ? 'bg-[#0066cc] hover:bg-[#0071e3] text-white'
                                : 'bg-white hover:bg-[#0066cc] text-[#0066cc] hover:text-white border border-[#0066cc]/40'
                            }`}
                          >
                            {isActive
                              ? (detail.isPaused
                                ? `❚❚ พักเกมชั่วคราว (${formatElapsed(phaseElapsedSeconds)})`
                                : !hasTimer
                                ? (step.id === 'LOBBY' ? '● กำลังรอเริ่มเกม' : '● จบเกมแล้ว (เสร็จสิ้น)')
                                : isNoTimer
                                ? `● กำลังดำเนินการ (${formatElapsed(phaseElapsedSeconds)} - ไม่จับเวลา)`
                                : `● กำลังดำเนินการ (${formatElapsed(phaseElapsedSeconds)})`)
                              : (!hasTimer
                                ? (step.id === 'LOBBY' ? 'สลับมารอเริ่ม' : 'จบเกม & สรุปผล')
                                : isNoTimer
                                ? '▶ เริ่ม (ไม่จับเวลา)'
                                : `▶ เริ่ม (${currentDuration} นาที)`)}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Emergency Controls */}
                  <div className="pt-3 border-t border-[#e0e0e0] flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTogglePause}
                        disabled={loading || detail.phase === 'LEADERBOARD'}
                        className={`px-4 py-2 rounded-full text-xs font-semibold active:scale-95 transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                          detail.isPaused
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {detail.isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                        <span>{detail.isPaused ? 'เริ่มเกมต่อ' : 'พักเกมชั่วคราว'}</span>
                      </button>
                      <button
                        onClick={handleReset}
                        disabled={loading}
                        className="px-4 py-2 bg-[#f5f5f7] hover:bg-rose-50 text-[#7a7a7a] hover:text-rose-600 border border-[#e0e0e0] rounded-full text-xs font-medium active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>รีเซ็ต Session</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-[#7a7a7a] italic">
                      * ครูสามารถกดสลับขั้นตอนกลับไปกลับมาได้ตลอดเวลาโดยที่ข้อมูลไม่สูญหาย
                    </p>
                  </div>
                </div>

                {/* 👉 RIGHT COLUMN: 📱 Student Screen Live Simulator */}
                <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-4 bg-white border border-[#e0e0e0] rounded-[24px] p-5 sm:p-6 space-y-4 shadow-sm">
                  <div className="border-b border-[#e0e0e0] pb-4">
                    <h3 className="text-base font-bold text-[#1d1d1f]">
                      มุมมองที่นักเรียน
                    </h3>
                  </div>

                  {/* Direct Clean Screen Container */}
                  <div className="w-full rounded-2xl overflow-hidden border border-[#e0e0e0] shadow-sm bg-slate-950 h-[680px]">
                    <iframe
                      id="student-preview-frame"
                      src={typeof window !== 'undefined' ? `${window.location.origin}/?session=${detail.sessionCode}&spectator=1` : `/?session=${detail.sessionCode}&spectator=1`}
                      title="Student Screen Live View"
                      className="w-full h-full border-0 bg-slate-950"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              TAB 3: 🏛️ เดินตรวจนิทรรศการ (Walk Gallery & Rapid Rubric)
             ══════════════════════════════════════════════════════════════════════ */}
          {activeTeacherTab === 'gallery' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* 8 Exhibition Room Evaluation Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {EXHIBITION_ROOMS.map((room) => {
                  const assignedTeam = teams.find((t) => t.roomId === room.id);
                  if (!assignedTeam) {
                    return (
                      <div key={room.id} className="bg-white/60 border border-dashed border-[#e0e0e0] rounded-2xl p-5 text-center space-y-2">
                        <span className="text-xs font-mono text-[#7a7a7a]">ห้อง {room.roomNumber}: {room.nameTh}</span>
                        <p className="text-xs text-[#7a7a7a] italic">ยังไม่มีกลุ่มที่รับผิดชอบห้องนี้</p>
                      </div>
                    );
                  }

                  const teamId = assignedTeam.id;
                  const draft = rubricDrafts[teamId] || {
                    evidenceAccuracy: assignedTeam.teacherRubric?.evidenceAccuracy ?? assignedTeam.teacherRubric?.contentAccuracy ?? 0,
                    analysisLink: assignedTeam.teacherRubric?.analysisLink ?? assignedTeam.teacherRubric?.reasoning ?? 0,
                    presentationExplanation: assignedTeam.teacherRubric?.presentationExplanation ?? assignedTeam.teacherRubric?.creativity ?? assignedTeam.teacherRubric?.exhibitionLayout ?? 0,
                    presentationSkill: assignedTeam.teacherRubric?.presentationSkill ?? assignedTeam.teacherRubric?.presentation ?? 0,
                    total: assignedTeam.teacherRubric?.total ?? 0,
                    notes: assignedTeam.teacherRubric?.notes || '',
                  };

                  const currentTotal =
                    ((draft.evidenceAccuracy as number) || 0) +
                    ((draft.analysisLink as number) || 0) +
                    ((draft.presentationExplanation as number) || (draft.creativity as number) || 0) +
                    ((draft.presentationSkill as number) || 0);

                  const updateScoreKey = (key: keyof TeacherRubric, scoreOption: number) => {
                    setRubricDrafts((prev) => {
                      const existing = prev[teamId] || {
                        evidenceAccuracy: 0,
                        analysisLink: 0,
                        presentationExplanation: 0,
                        presentationSkill: 0,
                        total: 0,
                        notes: '',
                      };
                      const currentVal = (existing[key] as number) || 0;
                      const newVal = currentVal === scoreOption ? 0 : scoreOption;
                      const updated = { ...existing, [key]: newVal };
                      updated.total =
                        ((updated.evidenceAccuracy as number) || 0) +
                        ((updated.analysisLink as number) || 0) +
                        ((updated.presentationExplanation as number) || (updated.creativity as number) || 0) +
                        ((updated.presentationSkill as number) || 0);
                      return { ...prev, [teamId]: updated };
                    });
                  };

                  const rubricCriteria: { key: keyof TeacherRubric; label: string }[] = [
                    { key: 'evidenceAccuracy', label: '1. ความถูกต้องของการคัดกรองหลักฐาน (5)' },
                    { key: 'analysisLink', label: '2. การวิเคราะห์และเชื่อมโยงเหตุการณ์ (5)' },
                    { key: 'presentationExplanation', label: '3. การอธิบายระหว่างการนำเสนอ (5)' },
                    { key: 'presentationSkill', label: '4. ทักษะการนำเสนอในบทบาทภัณฑารักษ์ (5)' },
                  ];

                  const correctStatues = (assignedTeam.statueInventory || []).filter((id) =>
                    room.targetStatueIds.includes(id)
                  ).length;

                  const correctEvidences = (assignedTeam.evidenceInventory || []).filter((id) =>
                    room.targetEvidenceIds.includes(id) && EVIDENCE_ITEMS.find((e) => e.id === id)?.isAuthentic
                  ).length;

                  const fakeEvidences = (assignedTeam.evidenceInventory || []).filter(
                    (id) => !EVIDENCE_ITEMS.find((e) => e.id === id)?.isAuthentic
                  ).length;

                  const correctStories = (assignedTeam.storyInventory || []).filter(
                    (id) => STORY_PLACARDS_DATA.find((s) => s.id === id)?.categoryId === room.id
                  ).length;

                  const totalSubmitted =
                    (assignedTeam.statueInventory?.length || 0) +
                    (assignedTeam.evidenceInventory?.length || 0) +
                    (assignedTeam.storyInventory?.length || 0);

                  const totalCorrect = correctStatues + correctEvidences + correctStories;

                  return (
                    <div
                      key={room.id}
                      className="bg-white border border-[#e0e0e0] rounded-2xl p-5 space-y-4 shadow-sm hover:border-[#0066cc]/50 transition flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="border-b border-[#e0e0e0] pb-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-mono text-[#7a7a7a] uppercase tracking-wider">{room.historicalPeriod}</span>
                              <h3 className="text-base font-bold text-[#1d1d1f]">ห้อง {room.roomNumber}: {room.nameTh}</h3>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="text-xs font-bold text-[#0066cc]">กลุ่ม: {assignedTeam.name}</span>
                                <button
                                  type="button"
                                  onClick={() => setExpandedMembersTeamId(expandedMembersTeamId === teamId ? null : teamId)}
                                  className="text-xs text-[#0066cc] hover:text-[#004499] underline underline-offset-2 font-medium cursor-pointer transition active:scale-95"
                                >
                                  {expandedMembersTeamId === teamId ? 'ซ่อนสมาชิกทีม' : `ดูสมาชิกทีม (${assignedTeam.members?.length || 0} คน)`}
                                </button>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setArchiveTarget({ sessionCode: detail.sessionCode, teamId: assignedTeam.id })}
                              className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-full text-xs font-bold active:scale-95 transition flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              <Landmark className="w-3.5 h-3.5 text-amber-700" />
                              <span>ดูห้อง 3D</span>
                            </button>
                          </div>

                          {/* Expanded Member Badges Drawer */}
                          {expandedMembersTeamId === teamId && (
                            <div className="p-2.5 bg-[#f5f5f7] border border-[#e0e0e0] rounded-xl flex items-center gap-2 flex-wrap animate-in fade-in duration-150">
                              {(!assignedTeam.members || assignedTeam.members.length === 0) ? (
                                <span className="text-[11px] text-[#7a7a7a] italic">ยังไม่มีสมาชิกในทีมนี้</span>
                              ) : (
                                assignedTeam.members.map((m, mIdx) => (
                                  <span
                                    key={m.id || mIdx}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#e0e0e0] rounded-full text-xs text-[#1d1d1f] font-medium shadow-2xs"
                                  >
                                    <User className="w-3 h-3 text-zinc-400" />
                                    <span>{m.name}</span>
                                    {mIdx === 0 && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
                                  </span>
                                ))
                              )}
                            </div>
                          )}
                        </div>

                        {/* 🌟 Helper Box: สรุปความถูกต้องของชิ้นงานที่กลุ่มจัดแสดง (ตัวช่วยตรวจให้คะแนนคุณครู) */}
                        <div className="p-3 bg-[#f5f5f7] border border-[#e0e0e0] rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between font-mono">
                            <span className="text-[11px] font-bold text-[#1d1d1f] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#0066cc]" />
                              สรุปความถูกต้องของชิ้นงานที่นำมาแสดง:
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                              totalCorrect >= 10
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : totalCorrect >= 7
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-zinc-200 text-zinc-700'
                            }`}>
                              รวมถูกต้อง {totalCorrect}/10 ชิ้น
                            </span>
                          </div>

                          {/* Breakdown Grid / Badges */}
                          <div className="grid grid-cols-3 gap-1.5 text-center text-[10.5px]">
                            <div className="p-1.5 bg-white rounded-lg border border-[#e0e0e0] flex flex-col items-center justify-center">
                              <span className="text-[#7a7a7a]">ประติมากรรม</span>
                              <span className={`font-mono font-bold ${correctStatues === 4 ? 'text-emerald-600' : 'text-[#1d1d1f]'}`}>
                                {correctStatues}/4 ชิ้น
                              </span>
                            </div>

                            <div className="p-1.5 bg-white rounded-lg border border-[#e0e0e0] flex flex-col items-center justify-center">
                              <span className="text-[#7a7a7a]">หลักฐานจริง</span>
                              <span className={`font-mono font-bold ${correctEvidences === 4 ? 'text-emerald-600' : 'text-[#1d1d1f]'}`}>
                                {correctEvidences}/4 ชิ้น
                              </span>
                              {fakeEvidences > 0 && (
                                <span className="text-[9.5px] font-bold text-rose-600">
                                  (เท็จ {fakeEvidences})
                                </span>
                              )}
                            </div>

                            <div className="p-1.5 bg-white rounded-lg border border-[#e0e0e0] flex flex-col items-center justify-center">
                              <span className="text-[#7a7a7a]">เรื่องราว</span>
                              <span className={`font-mono font-bold ${correctStories === 2 ? 'text-emerald-600' : 'text-[#1d1d1f]'}`}>
                                {correctStories}/2 ป้าย
                              </span>
                            </div>
                          </div>

                          {totalSubmitted === 0 && (
                            <p className="text-[10.5px] text-[#7a7a7a] italic text-center">
                              กลุ่มนี้ยังไม่ได้ส่งสิ่งของจัดแสดง
                            </p>
                          )}
                        </div>

                        {/* 5 Quick Tap Criteria */}
                        <div className="space-y-2.5">
                          {rubricCriteria.map((crit) => {
                            const val = (draft[crit.key] as number) || 0;
                            return (
                              <div key={crit.key} className="flex items-center justify-between gap-2 text-xs">
                                <span className="font-medium text-zinc-700">{crit.label}</span>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((scoreOption) => (
                                    <button
                                      key={scoreOption}
                                      type="button"
                                      onClick={() => updateScoreKey(crit.key, scoreOption)}
                                      className={`w-8 h-7 rounded-lg text-xs font-mono font-bold transition active:scale-95 cursor-pointer ${
                                        val === scoreOption
                                          ? 'bg-[#0066cc] text-white shadow-xs'
                                          : 'bg-[#f5f5f7] hover:bg-[#e0e0e0] text-[#1d1d1f] border border-[#e0e0e0]'
                                      }`}
                                    >
                                      {scoreOption}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Footer: Total & Save */}
                      <div className="pt-3 border-t border-[#e0e0e0] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#7a7a7a]">รวม:</span>
                          <span className="font-mono font-black text-lg text-emerald-600">
                            {currentTotal} <span className="text-[10px] font-normal text-[#7a7a7a]">/20 pts</span>
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSaveRubric(teamId)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold active:scale-95 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{rubricSavedToast === teamId ? 'บันทึกแล้ว ✓' : 'บันทึกคะแนน'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
        {renderCommonModals()}
      </div>
    );
  }

  // ─── Session List View ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans pb-16">
      {/* Top Header Bar with Logout */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[#e0e0e0] px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-bold text-sm sm:text-base text-[#1d1d1f] leading-tight">
              Curator Teacher Dashboard
            </h1>
            <span className="text-[10px] text-[#7a7a7a]">
              Game Master Control Panel
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#f5f5f7] text-[#1d1d1f] border border-[#e0e0e0] hidden xs:inline-block">
            SSPHT
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-full text-xs font-semibold active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
            title="ออกจากระบบ"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl 2xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 🌟 1. Prominent Center Create Session Card (มองกลางจอก็เห็นทันที) */}
        <div className="max-w-2xl mx-auto bg-white border border-[#e0e0e0] rounded-[24px] p-6 sm:p-7 shadow-xs text-center space-y-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0066cc] text-xs font-bold">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>เปิดห้องเรียนใหม่</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1d1d1f] tracking-tight">
              สร้าง Session การสอน
            </h2>
            <p className="text-xs text-[#7a7a7a]">
              เลือกระดับชั้นและห้องเรียน เพื่อเริ่มเกมกิจกรรมสำหรับคาบเรียนนี้
            </p>
          </div>

          <form onSubmit={handleCreateSession} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={gradeInput}
                onChange={(e) => setGradeInput(e.target.value)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-full border border-[#e0e0e0] bg-[#f5f5f7] text-xs sm:text-sm font-bold text-[#1d1d1f] focus:outline-none focus:border-[#0066cc] focus:bg-white transition cursor-pointer"
              >
                {['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <select
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-full border border-[#e0e0e0] bg-[#f5f5f7] text-xs sm:text-sm font-bold text-[#1d1d1f] focus:outline-none focus:border-[#0066cc] focus:bg-white transition cursor-pointer"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={`ห้อง ${i + 1}`}>ห้อง {i + 1}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#0066cc] hover:bg-[#0071e3] text-white rounded-full text-xs sm:text-sm font-bold active:scale-95 transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{creating ? 'กำลังสร้าง...' : 'สร้าง Session ทันที'}</span>
            </button>
          </form>
        </div>

        {/* 🌟 2. Header & Link to All Museum Archive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h3 className="text-base font-bold text-[#1d1d1f] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0066cc]" />
              <span>จำนวน Session ({sessions.length})</span>
            </h3>
            <p className="text-xs text-[#7a7a7a]">
              เลือก Session เพื่อเปิดหน้าควบคุมเกมและจัดการกิจกรรมในชั้นเรียน
            </p>
          </div>
          <button
            onClick={() => setArchiveTarget({ sessionCode: '' })}
            className="inline-flex items-center gap-1.5 text-xs text-[#0066cc] hover:underline font-semibold cursor-pointer"
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>ดูพิพิธภัณฑ์ที่เคยจัดแสดงทั้งหมด</span>
          </button>
        </div>

        {/* 🌟 3. Single-Column Session Row List (เรียงกันทีละบรรทัด) */}
        {sessions.length === 0 ? (
          <div className="bg-white border border-[#e0e0e0] rounded-[24px] py-16 flex flex-col items-center justify-center gap-3 text-[#7a7a7a] text-center shadow-xs">
            <Clock className="w-10 h-10 opacity-20 text-[#7a7a7a]" />
            <p className="text-sm font-medium">ยังไม่มี Session การสอน — ใช้แผงด้านบนเพื่อสร้างห้องเรียนใหม่</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div
                key={s.sessionId}
                className="bg-white border border-[#e0e0e0] hover:border-[#0066cc] rounded-[20px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-xs hover:shadow-md group"
              >
                {/* Left Info */}
                <div
                  className="flex-1 min-w-0 cursor-pointer space-y-1.5"
                  onClick={() => setSelectedSessionId(s.sessionId)}
                >
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className="text-lg font-black text-[#1d1d1f] tracking-tight">{s.sessionName}</h4>
                    <span className={`text-xs px-3 py-0.5 rounded-full border font-bold ${PHASE_COLOR[s.phase]}`}>
                      {PHASE_LABEL[s.phase]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs text-[#7a7a7a] flex-wrap">
                    <span className="font-mono font-bold bg-[#f5f5f7] px-2 py-0.5 rounded-md border border-[#e0e0e0] text-[#1d1d1f]">
                      PIN: {s.sessionCode}
                    </span>
                    <span>•</span>
                    <span className="font-medium text-zinc-700 inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-zinc-400" />
                      <span><strong>{s.teamCount}</strong> กลุ่ม</span>
                    </span>
                    <span>•</span>
                    <span className="font-medium text-zinc-700 inline-flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      <span><strong>{s.playerCount}</strong> คน</span>
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-zinc-600">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{formatDate(s.createdAt)}</span>
                    </span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#e0e0e0]/70 justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(s.sessionId);
                    }}
                    className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition cursor-pointer"
                    title="ลบห้องเรียนนี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div
          onClick={() => setShowCreateModal(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#e0e0e0] rounded-[24px] max-w-sm w-full p-6 space-y-4 shadow-xl cursor-default"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#1d1d1f]">สร้าง Session ใหม่</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#7a7a7a] hover:text-[#1d1d1f] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#7a7a7a] font-medium block mb-1.5">
                    ระดับชั้น
                  </label>
                  <select
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e0e0e0] bg-[#f5f5f7] text-sm font-semibold text-[#1d1d1f] focus:outline-none focus:border-[#0066cc] focus:bg-white transition cursor-pointer"
                  >
                    {['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'].map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#7a7a7a] font-medium block mb-1.5">
                    ห้อง
                  </label>
                  <select
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e0e0e0] bg-[#f5f5f7] text-sm font-semibold text-[#1d1d1f] focus:outline-none focus:border-[#0066cc] focus:bg-white transition cursor-pointer"
                  >
                    {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((r) => (
                      <option key={r} value={r}>
                        ห้อง {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#7a7a7a] font-medium block mb-1.5">
                  หมายเหตุเพิ่มเติม <span className="text-[#a1a1a6] font-normal">(ไม่บังคับ)</span>
                </label>
                <input
                  type="text"
                  value={remarkInput}
                  onChange={(e) => setRemarkInput(e.target.value)}
                  placeholder="เช่น รอบเช้า, คาบ 3, แข่งขัน"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e0e0] text-sm text-[#1d1d1f] focus:outline-none focus:border-[#0066cc] placeholder-[#a1a1a6]"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 border border-[#e0e0e0] text-[#1d1d1f] rounded-full text-sm font-medium hover:bg-[#f5f5f7] transition active:scale-95 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 bg-[#0066cc] text-white rounded-full text-sm font-medium hover:bg-[#0071e3] transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {creating ? 'กำลังสร้าง...' : 'สร้าง Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Common Modals */}
      {renderCommonModals()}
    </div>
  );
}
