'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { HeaderHUD } from '@/components/HeaderHUD';
import { LobbyScreen } from '@/components/LobbyScreen';
import { WaitingRoomScreen } from '@/components/WaitingRoomScreen';
import { SlotReelReveal } from '@/components/SlotReelReveal';
import { BriefingScreen } from '@/components/BriefingScreen';
import { MarketScreen } from '@/components/MarketScreen';
import { ExhibitionRoomScreen } from '@/components/ExhibitionRoomScreen';
import { SubmittedWaitingScreen } from '@/components/SubmittedWaitingScreen';
import { LeaderboardScreen } from '@/components/LeaderboardScreen';
import { CardDetailModal } from '@/components/CardDetailModal';
import { ArchiveMuseumModal } from '@/components/ArchiveMuseumModal';
import { GameSessionState, TeamState, StatueItem, EvidenceItem } from '@/data/types';
import { SHOPPING_DURATION_SECONDS, STATUE_ITEMS, EVIDENCE_ITEMS } from '@/data/gameData';
import { STORY_PLACARDS_DATA } from '@/data/storyPlacardsData';
import { Bell, ArrowRight, History, Sparkles, Trash2, Landmark, Pause, Loader2, ShoppingBag, Clock, Lock, X } from 'lucide-react';

interface RecentSession {
  code: string;
  name: string;
  visitedAt: number;
}

export default function GamePage() {
  const router = useRouter();

  // ── Session (student must pick a session first) ──────────────────────────
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<GameSessionState | null>(null);

  // ── Team identity ─────────────────────────────────────────────────────────
  const [myTeamId, setMyTeamId] = useState<string | null>(null);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);
  const myTeamIdRef = useRef<string | null>(null);
  const myMemberIdRef = useRef<string | null>(null);

  useEffect(() => {
    myTeamIdRef.current = myTeamId;
  }, [myTeamId]);

  useEffect(() => {
    myMemberIdRef.current = myMemberId;
  }, [myMemberId]);
  const [hasSeenReveal, setHasSeenReveal] = useState<boolean>(false);
  const [isSpectator, setIsSpectator] = useState<boolean>(false);
  const [spectatorTeam, setSpectatorTeam] = useState<TeamState>({
    id: 'admin_spectator_team',
    code: 'ADMIN99',
    name: 'Admin (ห้องสงครามเกาหลี)',
    roomId: 'CAT-2', // ห้องที่ 2: สงครามเกาหลีและการแบ่งแยกเส้นขนานที่ 38
    members: [
      { id: 'admin_mem_1', name: 'Admin (ผู้ดูแลระบบ)', avatar: '', joinedAt: Date.now() }
    ],
    budget: 5000,
    initialBudget: 5000,
    statueInventory: [],
    evidenceInventory: [],
    storyInventory: [],
    isSubmitted: false,
  });

  // ── UI state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'briefing' | 'market' | 'room'>('briefing');
  const [marketSubTab, setMarketSubTab] = useState<'evidence' | 'stories' | 'statues'>('evidence');
  const [selectedItem, setSelectedItem] = useState<(StatueItem & { itemType: 'statue' }) | (EvidenceItem & { itemType: 'evidence' }) | null>(null);
  const [isBuying, setIsBuying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isViewingSubmittedRoom, setIsViewingSubmittedRoom] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [showBriefingLockedAlert, setShowBriefingLockedAlert] = useState(false);
  const [showEmptyExhibitionUrgentAlert, setShowEmptyExhibitionUrgentAlert] = useState(false);
  const lastLogCountRef = useRef<number | null>(null);
  const seenPurchaseLogIdsRef = useRef<Set<string>>(new Set());
  const prevPhaseRef = useRef<string | null>(null);
  const prevDurationRef = useRef<number | null>(null);
  const announcedCheckpointsRef = useRef<Set<number>>(new Set());
  const announcedBudgetThresholdsRef = useRef<Set<number>>(new Set());
  const autoSubmittedRef = useRef(false);
  const emptyExhibitionAlertShownRef = useRef(false);
  const prevIsSubmittedRef = useRef<boolean | null>(null);

  // ── Notification (เด้งอันล่าสุดทันที, รอ 5 วิ ค่อยปิดไปเอง, ปัดขึ้นปิดได้, มีปุ่ม X) ────────
  interface NotificationItem {
    id: string;
    type: 'curator' | 'purchase';
    title?: string;
    message: React.ReactNode;
    durationMs?: number;
  }
  const [currentNoti, setCurrentNoti] = useState<NotificationItem | null>(null);
  const [isNotiExiting, setIsNotiExiting] = useState(false);
  const notiTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchDeltaYRef = useRef<number>(0);
  const notiCardRef = useRef<HTMLDivElement>(null);

  const dismissNotification = useCallback(() => {
    if (isNotiExiting || !currentNoti) return;
    if (notiTimerRef.current) clearTimeout(notiTimerRef.current);
    setIsNotiExiting(true);
    setTimeout(() => {
      setCurrentNoti(null);
      setIsNotiExiting(false);
      if (notiCardRef.current) {
        notiCardRef.current.style.transform = '';
      }
    }, 280);
  }, [isNotiExiting, currentNoti]);

  const handleNotiTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    touchStartYRef.current = clientY;
    touchDeltaYRef.current = 0;
  };

  const handleNotiTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStartYRef.current === null) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const delta = clientY - touchStartYRef.current;
    if (delta < 0) {
      touchDeltaYRef.current = delta;
      if (notiCardRef.current) {
        notiCardRef.current.style.transform = `translate3d(0, ${delta}px, 0)`;
      }
    }
  };

  const handleNotiTouchEnd = () => {
    if (touchStartYRef.current === null) return;
    if (touchDeltaYRef.current < -30) {
      dismissNotification();
    } else {
      if (notiCardRef.current) {
        notiCardRef.current.style.transition = 'transform 0.2s ease-out';
        notiCardRef.current.style.transform = '';
        setTimeout(() => {
          if (notiCardRef.current) notiCardRef.current.style.transition = '';
        }, 200);
      }
    }
    touchStartYRef.current = null;
    touchDeltaYRef.current = 0;
  };

  const queueNotification = useCallback((item: { type: 'curator' | 'purchase'; title?: string; message: React.ReactNode; durationMs?: number }) => {
    if (notiTimerRef.current) clearTimeout(notiTimerRef.current);

    const newItem: NotificationItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      durationMs: item.durationMs || 5000,
    };

    // เด้งอันล่าสุดมาทันที
    setCurrentNoti(newItem);
    setIsNotiExiting(false);
    if (notiCardRef.current) {
      notiCardRef.current.style.transform = '';
    }

    // รอ 5 วิ ค่อยปิดไปเอง
    notiTimerRef.current = setTimeout(() => {
      setIsNotiExiting(true);
      setTimeout(() => {
        setCurrentNoti(null);
        setIsNotiExiting(false);
      }, 280);
    }, newItem.durationMs || 5000);
  }, []);

  // Handle attempt to enter Market (ร้านค้า) - Block if currently in BRIEFING phase
  const handleEnterMarket = () => {
    if (session?.phase === 'BRIEFING') {
      setShowBriefingLockedAlert(true);
      return;
    }
    setActiveTab('market');
  };

  // ── Session code entry state ──────────────────────────────────────────────
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const [initialLobbyMode, setInitialLobbyMode] = useState<'select' | 'create' | 'join'>('select');
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [availableSessions, setAvailableSessions] = useState<
    { sessionId: string; sessionCode: string; sessionName: string; createdAt: number; phase: string; teamCount: number; playerCount: number }[]
  >([]);

  const saveRecentSession = (code: string, name: string) => {
    try {
      const raw = localStorage.getItem('curator_recent_sessions');
      const list: RecentSession[] = raw ? JSON.parse(raw) : [];
      const filtered = list.filter(item => item.code !== code);
      const updated = [{ code, name, visitedAt: Date.now() }, ...filtered].slice(0, 5);
      localStorage.setItem('curator_recent_sessions', JSON.stringify(updated));
      setRecentSessions(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearRecentSessions = () => {
    localStorage.removeItem('curator_recent_sessions');
    setRecentSessions([]);
  };

  // ── Auto-detect QR code scanning URL params: ?session=CUR001 or ?code=CUR001 ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem('curator_recent_sessions');
      if (raw) setRecentSessions(JSON.parse(raw));
    } catch (e) {}

    // Fetch active sessions from server (ห้องที่เปิดให้เล่น: phase !== 'LEADERBOARD')
    const loadOpenSessions = () => {
      fetch('/api/game')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const openSessions = data.filter((s: any) => s.phase !== 'LEADERBOARD');
            setAvailableSessions(openSessions);
          }
        })
        .catch(e => console.error('Failed to load active sessions:', e));
    };

    loadOpenSessions();
    const activeSessionsInterval = setInterval(loadOpenSessions, 3000);

    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const queryCode = params.get('session') || params.get('code');
    const autoAction = params.get('action');
    const isSpec = params.get('spectator') === '1' || params.get('spectator') === 'true' || params.get('admin') === '1';

    if (isSpec) {
      setIsSpectator(true);
      setHasSeenReveal(true);
      setMyMemberId('admin_mem_1');
    }

    if (queryCode) {
      setIsAutoLoading(true);
      const code = queryCode.trim().toUpperCase();
      (async () => {
        try {
          const res = await fetch(`/api/game?code=${code}`);
          if (res.ok) {
            const data = await res.json();
            setSessionId(data.sessionId);
            setSession(data);
            if (!isSpec) {
              localStorage.setItem('curator_session_id', data.sessionId);
              saveRecentSession(data.sessionCode, data.sessionName);
            }
            if (autoAction === 'create' || autoAction === 'create_team') {
              setInitialLobbyMode('create');
            } else if (autoAction === 'join') {
              setInitialLobbyMode('join');
            }
          }
        } catch (e) {
          console.error('Failed to auto join from QR code:', e);
        } finally {
          setIsAutoLoading(false);
        }
      })();
    }

    return () => clearInterval(activeSessionsInterval);
  }, []);

  // ── Restore from localStorage (Only when accessing via direct room link) ──
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const queryCode = params.get('session') || params.get('code');

    const sid = localStorage.getItem('curator_session_id');
    const teamId = localStorage.getItem('curator_team_id');
    const memberId = localStorage.getItem('curator_member_id');

    if (queryCode) {
      // Accessed via direct room link -> auto-restore team/member
      if (sid) setSessionId(sid);
      if (teamId) setMyTeamId(teamId);
      if (memberId) setMyMemberId(memberId);
    }
  }, []);

  // ── Sync URL Query with Active Session Code ────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (session?.sessionCode) {
      if (url.searchParams.get('session') !== session.sessionCode && url.searchParams.get('code') !== session.sessionCode) {
        url.searchParams.set('session', session.sessionCode);
        window.history.replaceState({}, '', url.toString());
      }
    } else if (!sessionId) {
      if (url.searchParams.has('session') || url.searchParams.has('code')) {
        url.searchParams.delete('session');
        url.searchParams.delete('code');
        const cleanUrl = url.pathname + (url.search ? url.search : '');
        window.history.replaceState({}, '', cleanUrl);
      }
    }
  }, [session?.sessionCode, sessionId]);

  // ── Poll session state ────────────────────────────────────────────────────
  const fetchSession = useCallback(async (sid?: string) => {
    const id = sid ?? sessionId;
    if (!id) return;
    try {
      const res = await fetch(`/api/game?sid=${id}`, { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 404) {
          localStorage.removeItem('curator_session_id');
          localStorage.removeItem('curator_team_id');
          localStorage.removeItem('curator_member_id');
          setSessionId(null);
          setMyTeamId(null);
          setMyMemberId(null);
          setSession(null);
        }
        return;
      }
      const data: GameSessionState = await res.json();
      setSession(data);
      if (data.sessionCode && data.sessionName) {
        saveRecentSession(data.sessionCode, data.sessionName);
      }

      // Check if teacher changed phase to trigger Slot Reel Reveal or auto-route
      if (data.phase === 'LOBBY') {
        setHasSeenReveal(false);
      } else if (prevPhaseRef.current === 'LOBBY' || (data.phase === 'BRIEFING' && prevPhaseRef.current !== 'BRIEFING')) {
        setHasSeenReveal(false);
      }

      // If teacher changes phase to BRIEFING: Force student to Briefing tab
      if (data.phase === 'BRIEFING' && prevPhaseRef.current !== 'BRIEFING') {
        setActiveTab('briefing');
        announcedCheckpointsRef.current.clear();
        announcedBudgetThresholdsRef.current.clear();
        autoSubmittedRef.current = false;
        emptyExhibitionAlertShownRef.current = false;
      }

      const activeTeamId = myTeamIdRef.current || myTeamId;
      const activeMemberId = myMemberIdRef.current || myMemberId;
      const currentTeam = activeTeamId ? data.teams[activeTeamId] : null;

      // If teacher starts SHOPPING phase: Force student to Market & Show Curator alert
      if (data.phase === 'SHOPPING' && prevPhaseRef.current !== 'SHOPPING') {
        setActiveTab('market');
        announcedCheckpointsRef.current.clear();
        announcedBudgetThresholdsRef.current.clear();
        autoSubmittedRef.current = false;
        emptyExhibitionAlertShownRef.current = false;
        if (data.durationSeconds > 0) {
          const mins = Math.ceil(data.durationSeconds / 60);
          queueNotification({
            type: 'curator',
            message: `มีเวลาให้ซื้อของ ${mins} นาที`,
            durationMs: 5000,
          });
        } else {
          queueNotification({
            type: 'curator',
            message: 'เริ่มรอบจัดซื้อของจัดแสดง (ไม่จับเวลา)',
            durationMs: 5000,
          });
        }
      }

      // If teacher adjusts duration during active SHOPPING phase -> Notify students!
      if (
        data.phase === 'SHOPPING' &&
        prevPhaseRef.current === 'SHOPPING' &&
        prevDurationRef.current !== null &&
        prevDurationRef.current !== data.durationSeconds
      ) {
        if (data.durationSeconds === 0) {
          queueNotification({
            type: 'curator',
            message: 'ปรับเป็นไม่จับเวลา',
            durationMs: 5000,
          });
        } else {
          const mins = Math.round(data.durationSeconds / 60);
          const diffMins = Math.round((data.durationSeconds - prevDurationRef.current) / 60);
          const msg = diffMins > 0
            ? `ทดเวลาเพิ่ม เป็น ${mins} นาที`
            : `ลดเวลาลง เหลือ ${mins} นาที`;
          queueNotification({
            type: 'curator',
            message: msg,
            durationMs: 5000,
          });

          // If duration adjusted, re-evaluate remaining time
          const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
          const remaining = Math.max(0, data.durationSeconds - elapsed);

          if (remaining > 60) {
            emptyExhibitionAlertShownRef.current = false;
          } else if (remaining <= 60 && remaining > 0) {
            const teamForCheck = isSpectator ? spectatorTeam : currentTeam;
            if (teamForCheck && !teamForCheck.isSubmitted) {
              const totalItems = (teamForCheck.statueInventory?.length || 0) + (teamForCheck.evidenceInventory?.length || 0) + (teamForCheck.storyInventory?.length || 0);
              if (totalItems === 0) {
                emptyExhibitionAlertShownRef.current = true;
                setShowEmptyExhibitionUrgentAlert(true);
              }
            }
          }

          // Allow future checkpoints to re-announce if time was increased
          announcedCheckpointsRef.current.forEach((sec) => {
            if (sec < remaining) {
              announcedCheckpointsRef.current.delete(sec);
            }
          });
        }
      }

      prevPhaseRef.current = data.phase;
      prevDurationRef.current = data.durationSeconds;

      // Toast on new purchases (แจ้งเตือนเพื่อนร่วมทีมทุกคนทันทีแบบ Real-time)
      const myTeamLogs = (data.purchaseLogs || []).filter((log) => activeTeamId && log.teamId === activeTeamId);
      if (lastLogCountRef.current === null) {
        lastLogCountRef.current = myTeamLogs.length;
        myTeamLogs.forEach((l) => seenPurchaseLogIdsRef.current.add(l.id));
      } else {
        const newLogs = myTeamLogs.filter((l) => !seenPurchaseLogIdsRef.current.has(l.id));
        if (newLogs.length > 0) {
          newLogs.forEach((l) => seenPurchaseLogIdsRef.current.add(l.id));
          const latest = newLogs[0];
          const currentTeamMember = currentTeam?.members.find((m) => m.id === activeMemberId);
          const isMe = currentTeamMember && latest.memberName === currentTeamMember.name;
          const budgetSuffix = currentTeam ? ` (เหลืองบ ฿${currentTeam.budget.toLocaleString()})` : '';

          if (!isMe) {
            queueNotification({
              type: 'purchase',
              message: (
                <span>
                  <strong className="font-bold text-white">{latest.memberName}</strong> ซื้อ &ldquo;{latest.itemName}&rdquo; ในราคา ฿{latest.price ? latest.price.toLocaleString() : '500'}{budgetSuffix}
                </span>
              ),
              durationMs: 5000,
            });
          }
        }
        lastLogCountRef.current = myTeamLogs.length;
      }

      // Budget threshold Curator alerts during SHOPPING phase
      if (data.phase === 'SHOPPING' && currentTeam) {
        const budgetAlerts = [
          { threshold: 0, text: 'งบประมาณของทีมหมดแล้ว (฿0) ไม่สามารถซื้อสินค้าเพิ่มได้' },
          { threshold: 500, text: 'งบประมาณเหลือน้อยมาก เหลือเพียง ฿500' },
          { threshold: 1000, text: 'งบประมาณของทีมเหลือเพียง ฿1,000 ตรวจสอบงบก่อนซื้อ' },
          { threshold: 2000, text: 'งบประมาณของทีมเหลือ ฿2,000 วางแผนการเงินให้รอบคอบ' },
          { threshold: 3000, text: 'งบประมาณของทีมเหลือ ฿3,000 วางแผนการเงินให้ดี' },
        ];

        for (const alert of budgetAlerts) {
          if (currentTeam.budget <= alert.threshold && !announcedBudgetThresholdsRef.current.has(alert.threshold)) {
            announcedBudgetThresholdsRef.current.add(alert.threshold);
            queueNotification({
              type: 'curator',
              message: alert.text,
              durationMs: 5000,
            });
            break;
          }
        }
      }

      // Check if team submitted or teacher approved/unlocked submission for this team
      if (currentTeam) {
        if (prevIsSubmittedRef.current === false && currentTeam.isSubmitted === true) {
          const currentTeamMember = currentTeam.members.find((m) => m.id === myMemberId);
          const isMe = currentTeam.submittedBy && currentTeamMember && currentTeam.submittedBy === currentTeamMember.name;
          const submitterLabel = isMe
            ? 'คุณ'
            : currentTeam.submittedBy
            ? `เพื่อนร่วมทีม (${currentTeam.submittedBy})`
            : 'เพื่อนร่วมทีม';

          queueNotification({
            type: 'curator',
            message: (
              <span>
                <strong className="font-bold text-white">{submitterLabel}</strong> ได้ทำการส่งมอบห้องนิทรรศการเรียบร้อยแล้ว!
              </span>
            ),
            durationMs: 6000,
          });
        } else if (prevIsSubmittedRef.current === true && currentTeam.isSubmitted === false) {
          autoSubmittedRef.current = false;
          queueNotification({
            type: 'curator',
            message: 'คุณครูได้อนุมัติให้ทีมของคุณแก้ไขและส่งนิทรรศการใหม่อีกครั้งแล้ว!',
            durationMs: 5000,
          });
        }
        prevIsSubmittedRef.current = currentTeam.isSubmitted;
      }
    } catch (e) {
      console.error('Failed to fetch session:', e);
    }
  }, [sessionId, queueNotification]);

  useEffect(() => {
    if (!sessionId) return;
    fetchSession();
    const interval = setInterval(() => fetchSession(), 1500);
    return () => clearInterval(interval);
  }, [fetchSession, sessionId]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(SHOPPING_DURATION_SECONDS);

  // ── Enter Session by code ─────────────────────────────────────────────────
  const handleEnterSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    setCodeLoading(true);
    setCodeError(null);
    try {
      const res = await fetch(`/api/game?code=${code}`);
      if (!res.ok) {
        const d = await res.json();
        setCodeError(d.error || 'ไม่พบรหัสห้องนี้');
        return;
      }
      const data: GameSessionState = await res.json();
      setSessionId(data.sessionId);
      setSession(data);
      localStorage.setItem('curator_session_id', data.sessionId);
      saveRecentSession(data.sessionCode, data.sessionName);
    } catch {
      setCodeError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleQuickEnterSession = async (code: string) => {
    setCodeInput(code);
    setCodeLoading(true);
    setCodeError(null);
    try {
      const res = await fetch(`/api/game?code=${code}`);
      if (!res.ok) {
        const d = await res.json();
        setCodeError(d.error || 'ไม่พบรหัสห้องนี้');
        return;
      }
      const data: GameSessionState = await res.json();
      setSessionId(data.sessionId);
      setSession(data);
      localStorage.setItem('curator_session_id', data.sessionId);
      saveRecentSession(data.sessionCode, data.sessionName);
    } catch {
      setCodeError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setCodeLoading(false);
    }
  };

  const myTeam = isSpectator ? spectatorTeam : (session && myTeamId ? session.teams[myTeamId] : undefined);

  useEffect(() => {
    if (myTeam) {
      if (
        myTeam.isSubmitted ||
        (myTeam.statueInventory && myTeam.statueInventory.length > 0) ||
        (myTeam.evidenceInventory && myTeam.evidenceInventory.length > 0) ||
        (myTeam.storyInventory && myTeam.storyInventory.length > 0) ||
        localStorage.getItem(`curator_revealed_${myTeam.id}`) === 'true'
      ) {
        setHasSeenReveal(true);
      }
    }
  }, [myTeam]);

  // ── API helpers ───────────────────────────────────────────────────────────
  async function post(body: object) {
    return fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, sessionId })
    });
  }

  const handleCreateTeam = async (teamName: string, leaderName: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await post({ action: 'create_team', teamName, leaderName });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'เกิดข้อผิดพลาดในการสร้างกลุ่ม');
      } else {
        setMyTeamId(data.team.id);
        setMyMemberId(data.memberId);
        setHasSeenReveal(false);
        localStorage.setItem('curator_team_id', data.team.id);
        localStorage.setItem('curator_member_id', data.memberId);
        localStorage.removeItem(`curator_revealed_${data.team.id}`);
        setActiveTab('briefing');
        await fetchSession();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTeam = async (code: string, memberName: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await post({ action: 'join_team', code, memberName });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'ไม่พบรหัสกลุ่มหรือกลุ่มเต็มแล้ว');
      } else {
        setMyTeamId(data.team.id);
        setMyMemberId(data.memberId);
        setHasSeenReveal(false);
        localStorage.setItem('curator_team_id', data.team.id);
        localStorage.setItem('curator_member_id', data.memberId);
        localStorage.removeItem(`curator_revealed_${data.team.id}`);
        setActiveTab('briefing');
        await fetchSession();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReclaimIdentity = async (teamId: string, memberId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await post({ action: 'reclaim_identity', teamId, memberId });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'ไม่สามารถสวมตัวตนสมาชิกนี้ได้');
      } else {
        setMyTeamId(data.team.id);
        setMyMemberId(data.memberId);
        localStorage.setItem('curator_team_id', data.team.id);
        localStorage.setItem('curator_member_id', data.memberId);
        if (session?.phase === 'SHOPPING') {
          setActiveTab('market');
        } else if (session?.phase === 'EVALUATION' || session?.phase === 'LEADERBOARD') {
          setActiveTab('room');
        } else {
          setActiveTab('briefing');
        }
        await fetchSession();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!confirm('คุณต้องการออกจากกลุ่มนี้ใช่หรือไม่?')) return;
    setIsLoading(true);
    try {
      if (myTeamId && myMemberId) {
        await post({ action: 'leave_team', teamId: myTeamId, memberId: myMemberId });
        localStorage.removeItem(`curator_revealed_${myTeamId}`);
      }
      localStorage.removeItem('curator_team_id');
      localStorage.removeItem('curator_member_id');
      setMyTeamId(null);
      setMyMemberId(null);
      setHasSeenReveal(false);
      await fetchSession();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTeamName = async (newName: string) => {
    if (!sessionId || !myTeamId) return;
    try {
      const res = await post({ action: 'update_team_name', teamId: myTeamId, newName });
      const data = await res.json();
      if (data.team && session) {
        setSession({
          ...session,
          teams: {
            ...session.teams,
            [myTeamId]: data.team,
          },
        });
      }
      await fetchSession();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateMemberName = async (newName: string) => {
    if (!sessionId || !myTeamId || !myMemberId) return;
    try {
      const res = await post({
        action: 'update_member_name',
        teamId: myTeamId,
        memberId: myMemberId,
        newName,
      });
      const data = await res.json();
      if (data.team && session) {
        setSession({
          ...session,
          teams: {
            ...session.teams,
            [myTeamId]: data.team,
          },
        });
      }
      await fetchSession();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuyItem = async (itemType: 'statue' | 'evidence' | 'story', itemId: number) => {
    if (isSpectator) {
      setIsBuying(true);
      setTimeout(() => {
        setSpectatorTeam((prev: TeamState) => {
          const cost = itemType === 'statue' ? 300 : itemType === 'evidence' ? 250 : 100;
          return {
            ...prev,
            budget: Math.max(0, prev.budget - cost),
            statueInventory: itemType === 'statue' && !prev.statueInventory.includes(itemId) ? [...prev.statueInventory, itemId] : prev.statueInventory,
            evidenceInventory: itemType === 'evidence' && !prev.evidenceInventory.includes(itemId) ? [...prev.evidenceInventory, itemId] : prev.evidenceInventory,
            storyInventory: itemType === 'story' && !(prev.storyInventory || []).includes(itemId) ? [...(prev.storyInventory || []), itemId] : prev.storyInventory,
          };
        });
        setSelectedItem(null);
        queueNotification({
          type: 'purchase',
          message: 'จำลองซื้อการ์ดสำเร็จ (โหมดสอดส่อง)',
          durationMs: 2500,
        });
        setIsBuying(false);
      }, 150);
      return;
    }
    if (!myTeamId) return;
    setIsBuying(true);
    try {
      const member = myTeam?.members.find((m: any) => m.id === myMemberId);
      const res = await post({ action: 'buy_item', teamId: myTeamId, memberName: member?.name || 'สมาชิก', itemType, itemId });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'ไม่สามารถซื้อได้');
      } else {
        setSelectedItem(null);

        // Notify buyer immediately
        const statue = itemType === 'statue' ? STATUE_ITEMS.find((s) => s.id === itemId) : null;
        const evidence = itemType === 'evidence' ? EVIDENCE_ITEMS.find((e) => e.id === itemId) : null;
        const story = itemType === 'story' ? STORY_PLACARDS_DATA.find((s: any) => s.id === itemId) : null;
        const itemName = statue ? `${statue.nameTh} (${statue.nameEn})` : evidence ? `${evidence.titleTh}` : story ? `${story.titleTh}` : 'ของจัดแสดง';
        const price = statue ? statue.price : evidence ? evidence.price : story ? story.price : 500;
        const memberName = member?.name || 'คุณ';
        const remainingBudget = data.team?.budget !== undefined ? data.team.budget : (myTeam ? Math.max(0, myTeam.budget - price) : 0);

        queueNotification({
          type: 'purchase',
          message: (
            <span>
              <strong className="font-bold text-white">{memberName}</strong> ซื้อ &ldquo;{itemName}&rdquo; ในราคา ฿{price.toLocaleString()} (เหลืองบ ฿{remainingBudget.toLocaleString()})
            </span>
          ),
          durationMs: 4500,
        });

        await fetchSession();
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsBuying(false);
    }
  };

  const handleSubmitRoom = async () => {
    if (isSpectator) {
      setIsSubmitting(true);
      setTimeout(() => {
        setSpectatorTeam((prev: TeamState) => ({ ...prev, isSubmitted: true, submittedAt: Date.now() }));
        queueNotification({
          type: 'curator',
          message: 'จำลองส่งมอบห้องนิทรรศการสำเร็จ (โหมดสอดส่อง)',
          durationMs: 2500,
        });
        setIsSubmitting(false);
      }, 200);
      return;
    }
    if (!myTeamId) return;
    setIsSubmitting(true);
    try {
      const member = myTeam?.members.find((m: any) => m.id === myMemberId);
      await post({ action: 'submit_room', teamId: myTeamId, memberName: member?.name || 'สมาชิก' });
      await fetchSession();
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!session || session.phase !== 'SHOPPING') return;
    if (session.isPaused) return;
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
      const remaining = Math.max(0, session.durationSeconds - elapsed);
      setTimeLeft(remaining);

      // Periodic Curator Reminder Checkpoints: 15 min, 10 min, 5 min, 3 min, 1 min
      if (session.durationSeconds > 0) {
        const checkpoints = [
          { sec: 900, text: 'เหลือเวลาอีก 15 นาที' },
          { sec: 600, text: 'เหลือเวลาอีก 10 นาที' },
          { sec: 300, text: 'เหลือเวลาอีก 5 นาที เร่งมือจัดซื้อให้ครบ' },
          { sec: 180, text: 'เหลือเวลาอีก 3 นาที ตรวจสอบความถูกต้องของนิทรรศการ' },
          { sec: 60, text: 'เหลือเวลา 1 นาทีสุดท้าย ตรวจสอบและเตรียมส่งมอบนิทรรศการ' },
          { sec: 30, text: '30 วินาทีสุดท้าย ระบบจะส่งมอบนิทรรศการอัตโนมัติ' },
        ];

        for (const cp of checkpoints) {
          if (remaining <= cp.sec && remaining > cp.sec - 3 && !announcedCheckpointsRef.current.has(cp.sec)) {
            announcedCheckpointsRef.current.add(cp.sec);
            queueNotification({
              type: 'curator',
              message: cp.text,
              durationMs: 5000,
            });
            break;
          }
        }
      }

      // ถ้าเวลาถูกปรับเพิ่มเกิน 60 วิ -> รีเซ็ต flag ให้พร้อมเตือนใหม่เมื่อเวลากลับมาเหลือน้อยกว่า 1 นาที
      if (remaining > 60) {
        emptyExhibitionAlertShownRef.current = false;
      }

      // ถ้าเหลือเวลา <= 60 วินาที และทีมยังไม่ได้เลือกของจัดแสดงสักอย่าง -> เด้งแจ้งเตือนด่วนพาไปหน้านิทรรศการ
      if (remaining <= 60 && remaining > 0 && session.durationSeconds > 0 && myTeam && !myTeam.isSubmitted) {
        const totalItems = (myTeam.statueInventory?.length || 0) + (myTeam.evidenceInventory?.length || 0) + (myTeam.storyInventory?.length || 0);
        if (totalItems === 0 && !emptyExhibitionAlertShownRef.current) {
          emptyExhibitionAlertShownRef.current = true;
          setShowEmptyExhibitionUrgentAlert(true);
        } else if (totalItems > 0 && showEmptyExhibitionUrgentAlert) {
          setShowEmptyExhibitionUrgentAlert(false);
        }
      }

      // เมื่อหมดเวลา (เมื่อตั้งเวลา > 0)
      if (remaining === 0 && session.durationSeconds > 0) {
        if (!autoSubmittedRef.current) {
          autoSubmittedRef.current = true;
          if (myTeam && !myTeam.isSubmitted) {
            handleSubmitRoom();
            const totalItems = (myTeam.statueInventory?.length || 0) + (myTeam.evidenceInventory?.length || 0) + (myTeam.storyInventory?.length || 0);
            queueNotification({
              type: 'curator',
              message: totalItems > 0
                ? 'หมดเวลาการจัดนิทรรศการแล้ว! ระบบได้ส่งมอบห้องนิทรรศการของคุณเรียบร้อยแล้ว'
                : 'หมดเวลาการจัดนิทรรศการแล้ว (ไม่มีการเลือกของจัดแสดงในรอบนี้)',
              durationMs: 5000,
            });
            setActiveTab('room');
          }
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [session, queueNotification, myTeam]);

  const handleSetPhase = async (phase: any) => {
    await post({ action: 'set_phase', phase });
    await fetchSession();
  };

  const handleExitSession = () => {
    localStorage.removeItem('curator_session_id');
    localStorage.removeItem('curator_team_id');
    localStorage.removeItem('curator_member_id');
    if (myTeamId) {
      localStorage.removeItem(`curator_revealed_${myTeamId}`);
    }
    setSessionId(null);
    setSession(null);
    setMyTeamId(null);
    setMyMemberId(null);
    setHasSeenReveal(false);
  };

  const handleResetGame = async () => {
    if (confirm('รีเซ็ตเกมและล้างข้อมูลกลุ่มทั้งหมด?')) {
      await post({ action: 'reset_game' });
      if (myTeamId) localStorage.removeItem(`curator_revealed_${myTeamId}`);
      localStorage.removeItem('curator_team_id');
      localStorage.removeItem('curator_member_id');
      setMyTeamId(null);
      setMyMemberId(null);
      setHasSeenReveal(false);
      await fetchSession();
    }
  };

  // ─── Loading Screen (When resolving room code directly) ──────────────────
  if (isAutoLoading && (!sessionId || !session)) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-sky-200 select-none animate-fadeIn font-mono text-xs gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-sky-400/30 border-t-sky-400 animate-spin" />
        <span className="tracking-widest uppercase text-sky-400/80">/// LOADING ROOM SESSION...</span>
      </div>
    );
  }

  // ─── Screen: Enter Session Code ───────────────────────────────────────────
  if (!sessionId || !session) {
    return (
      <div className="min-h-screen bg-[#030712] text-[#e0f2fe] flex flex-col items-center justify-center px-4 select-none animate-fadeIn relative overflow-hidden font-sans">
        {/* ── Soft Comfortable Cyber Grid Background (ตารางนุ่มนวล ไม่แสบตา) ── */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(34,211,238,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.07)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_85%_at_50%_45%,transparent_20%,#030712_95%)] pointer-events-none z-0" />

        {/* ── Ambient Volumetric Spotlight Glow ── */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-950/25 blur-[100px] rounded-full pointer-events-none z-0" />
        {/* ── Ambient Volumetric Spotlight Glow ── */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-950/20 blur-[100px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-950/15 blur-[90px] rounded-full pointer-events-none z-0" />

        <div className="relative z-10 w-full max-w-[360px] space-y-6 text-center animate-fadeIn">
          {/* Top Tech Category & Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-sky-400/70 tracking-[0.2em] uppercase px-1">
              <span>/// SYSTEM TERMINAL</span>
              <span>THE HALL OF FAME</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-black text-white tracking-tight drop-shadow-[0_0_20px_rgba(125,211,252,0.3)]">
              The Hall of Fame
            </h1>

            <p className="text-sm sm:text-base text-[#f5c768] font-serif tracking-wide drop-shadow-[0_1px_8px_rgba(245,199,104,0.3)]">
              ภารกิจภัณฑารักษ์ฝึกหัด
            </p>

            <p className="text-xs sm:text-sm text-sky-200/75 max-w-xs mx-auto leading-relaxed font-sans">
              ระบุรหัสห้องเรียนเพื่อเข้าสู่ห้องจัดแสดง
            </p>

            {/* Glowing Tech Accent Line */}
            <div className="relative pt-1 flex items-center justify-center">
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-sky-400/50 to-transparent shadow-[0_0_8px_rgba(125,211,252,0.4)]" />
              <span className="absolute px-3 bg-[#030712] text-[9.5px] font-mono text-sky-300/80 tracking-widest uppercase">
                /// ACCESS CODE
              </span>
            </div>
          </div>

          {/* ── Main Input Form (Frameless & Clean) ── */}
          <div className="relative space-y-4">
            <form onSubmit={handleEnterSession} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="รหัสห้องเกม"
                  value={codeInput}
                  onChange={e => setCodeInput(e.target.value.toUpperCase())}
                  maxLength={10}
                  className="w-full px-4 py-3 bg-[#081b33] border-2 border-sky-900/90 focus:border-sky-400 rounded-[4px] text-center text-2xl sm:text-3xl font-mono font-black tracking-[0.25em] text-[#f5c768] placeholder:text-sky-400/35 placeholder:font-sans placeholder:font-medium placeholder:text-lg sm:placeholder:text-xl placeholder:tracking-normal focus:outline-none focus:shadow-[0_0_15px_rgba(125,211,252,0.35)] transition"
                  autoFocus
                />
              </div>

              {codeError && (
                <div className="p-2 rounded-[4px] bg-rose-950/80 border border-rose-600/70 text-xs text-rose-300 font-medium animate-fadeIn">
                  {codeError}
                </div>
              )}

              <button
                type="submit"
                disabled={codeLoading || !codeInput.trim()}
                className={`w-[220px] max-w-full mx-auto py-3 px-4 rounded-[4px] cyber-glass-btn text-center block ${
                  codeLoading || !codeInput.trim()
                    ? 'opacity-40 cursor-not-allowed text-slate-400'
                    : 'text-white hover:text-cyan-100 cursor-pointer'
                }`}
              >
                <span className="text-sm sm:text-base font-serif font-bold tracking-wide">
                  {codeLoading ? 'กำลังเข้าห้อง...' : 'เข้าห้อง'}
                </span>
              </button>
            </form>
          </div>

          {/* ── Available Active Rooms (ห้องที่เปิดให้เล่น) ── */}
          <div className="relative pt-2 space-y-2 text-left animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-sky-300/80 px-1 pb-1 border-b border-sky-950/70">
              <span className="font-medium flex items-center gap-1.5 text-sky-300/90 font-mono text-[11px] uppercase tracking-wider">
                <Landmark className="w-3.5 h-3.5 text-sky-400" />
                ห้องที่เปิดให้เล่น
              </span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {availableSessions.length === 0 ? (
                <div className="py-4 text-center text-xs text-sky-300/50 font-mono">
                  -- ยังไม่มีห้องที่เปิดให้เล่นในขณะนี้ --
                </div>
              ) : (
                availableSessions.map((rs) => (
                  <div
                    key={rs.sessionCode}
                    onClick={() => handleQuickEnterSession(rs.sessionCode)}
                    className="w-full py-3 px-4 rounded-[4px] cyber-glass-btn flex items-center justify-between transition-all duration-200 cursor-pointer hover:border-sky-400/80"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs sm:text-sm font-serif font-bold text-white truncate">
                        {rs.sessionName || rs.sessionCode}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-xs text-[#f5c768] shrink-0">
                      {rs.sessionCode}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Divider Line (ขีดกั้น) ── */}
          <div className="w-full pt-3 pb-1 flex items-center justify-center">
            <div className="w-[260px] max-w-full h-[1px] bg-gradient-to-r from-transparent via-sky-500/50 to-transparent shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
          </div>

          {/* ── Grand Archive Museum Button (พิพิธภัณฑ์) ── */}
          <div>
            <button
              type="button"
              onClick={() => setIsArchiveOpen(true)}
              className="w-[260px] max-w-full mx-auto py-3.5 px-4 rounded-[4px] cyber-glass-btn text-center text-white hover:text-cyan-100 cursor-pointer block"
            >
              <span className="text-sm sm:text-base font-serif font-bold tracking-wide">
                พิพิธภัณฑ์
              </span>
            </button>
          </div>
        </div>

        {/* Grand Archive Modal */}
        <ArchiveMuseumModal
          isOpen={isArchiveOpen}
          onClose={() => setIsArchiveOpen(false)}
        />
      </div>
    );
  }

  // ─── Screen: Game ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#070609] text-[#f2e6e6] flex flex-col selection:bg-rose-900 selection:text-white">
      {/* ── Topmost Global Notification Portal (Layer สูงสุดเสมอ อยู่เหนือทุก Modal z-[99999999]) ── */}
      {typeof document !== 'undefined' &&
        currentNoti &&
        createPortal(
          <div className="fixed top-3.5 sm:top-4 left-1/2 -translate-x-1/2 z-[99999999] w-[94%] max-w-lg pointer-events-none flex flex-col items-center select-none">
            <div
              key={currentNoti.id}
              ref={notiCardRef}
              onClick={dismissNotification}
              onTouchStart={handleNotiTouchStart}
              onTouchMove={handleNotiTouchMove}
              onTouchEnd={handleNotiTouchEnd}
              onMouseDown={handleNotiTouchStart}
              onMouseMove={handleNotiTouchMove}
              onMouseUp={handleNotiTouchEnd}
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(6, 18, 36, 0) 0%, rgba(6, 18, 36, 0.35) 40%, rgba(6, 18, 36, 0.98) 80%, #061224 100%)',
              }}
              className={`relative w-full p-4 sm:p-4.5 rounded-none border-2 border-sky-400/75 shadow-[0_16px_40px_rgba(0,0,0,0.95),0_0_30px_rgba(56,189,248,0.45)] backdrop-blur-2xl flex items-start gap-3.5 pointer-events-auto overflow-hidden text-left cursor-pointer active:scale-[0.99] select-none ${
                isNotiExiting ? 'animate-ios-slide-out' : 'animate-ios-spring-in'
              }`}
            >
              {/* Corner Cyber Accents */}
              <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-sky-300 pointer-events-none" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-sky-300 pointer-events-none" />
              <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-sky-300 pointer-events-none" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-sky-300 pointer-events-none" />

              {/* Top Subtle Gloss Accent */}
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-300/80 to-transparent pointer-events-none" />

              {/* เส้นขอบล่างเรืองแสง แอนิเมชันวิ่งไปมาซ้าย-ขวา */}
              <div className="absolute inset-x-0 bottom-0 h-[3px] bg-sky-950/90 overflow-hidden pointer-events-none">
                <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_15px_rgba(56,189,248,1)] animate-smooth-beam" />
              </div>

              {/* Pixel Face Assistant Avatar Transmitter */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-none bg-cyan-950/90 border border-cyan-400/80 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.5)] text-xs sm:text-sm font-mono font-bold text-cyan-300 mt-0.5">
                (•‿•)
              </div>

              {/* Chat Body */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2 border-b border-sky-900/70 pb-1.5">
                  <span className="text-xs sm:text-[13px] font-mono text-cyan-200 uppercase tracking-wider font-bold flex items-center gap-1.5 truncate">
                    CURATOR&apos;S VOICE LOG // บันทึกเสียงภัณฑารักษ์
                  </span>
                  
                  <div className="flex items-center gap-2.5 shrink-0">
                    {/* Mini Animated Equalizer */}
                    <div className="flex items-end gap-0.5 h-3.5 shrink-0">
                      <span className="w-0.5 h-2.5 bg-cyan-400 animate-pulse" />
                      <span className="w-0.5 h-3.5 bg-cyan-400 animate-pulse delay-75" />
                      <span className="w-0.5 h-2 bg-cyan-400 animate-pulse delay-150" />
                    </div>

                    {/* Close X Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification();
                      }}
                      className="p-1 -mr-1 text-sky-300 hover:text-white hover:bg-sky-500/25 rounded-none transition cursor-pointer active:scale-90 flex items-center justify-center"
                      title="ปิดการแจ้งเตือน"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-base sm:text-lg md:text-xl text-[#f0f9ff] font-sans font-light sm:font-normal leading-relaxed pt-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] tracking-wide">
                  {currentNoti.message}
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ─── 🛡️ Cyber Pause Overlay Modal (ผู้คุมกำลังหยุดเกม) ─── */}
      {typeof document !== 'undefined' &&
        session.isPaused &&
        createPortal(
          <div className="fixed inset-0 z-[99999999] bg-[#020617]/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
            {/* Ambient volumetric blue glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(14,165,233,0.18),transparent_75%)] pointer-events-none" />

            {/* Cyber Blue Glass Box (สไตล์เดียวกับกรอบ game overview ในหน้า Waiting Room) */}
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] rounded-none bg-[#061224]/80 border border-sky-400/50 shadow-[0_0_30px_rgba(56,189,248,0.35)] backdrop-blur-2xl p-6 sm:p-7 text-center space-y-4 overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Top Subtle Gloss Accent */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-sky-300/60 to-transparent pointer-events-none" />

              {/* เส้นขอบล่างเรืองแสง แอนิเมชันวิ่งไปมาซ้าย-ขวา */}
              <div className="absolute inset-x-0 bottom-0 h-[2.5px] bg-sky-950/90 overflow-hidden pointer-events-none">
                <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_12px_rgba(56,189,248,0.9),0_0_24px_rgba(56,189,248,0.7)] animate-smooth-beam" />
              </div>

              {/* Pause Icon */}
              <div className="w-12 h-12 mx-auto rounded-none bg-sky-950/90 border border-sky-400/80 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                <Pause className="w-6 h-6 text-sky-300 animate-pulse fill-current" />
              </div>

              {/* Text: ผู้คุมกำลังหยุดเกม & กำลังรอคำสั่งจากผู้คุมเกม */}
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-serif font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(125,211,252,0.4)]">
                  ผู้คุมกำลังหยุดเกม
                </h2>
                <div className="flex items-center justify-center gap-2 pt-1 text-xs sm:text-sm font-medium text-sky-300 font-sans">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  <span>กำลังรอคำสั่งจากผู้คุมเกม</span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ─── 🛡️ Cyber Briefing Locked Alert Modal (นักเรียนกดไปร้านค้าไม่ได้ในช่วงอ่านเรื่องราว) ─── */}
      {typeof document !== 'undefined' &&
        showBriefingLockedAlert &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999999] bg-[#020617]/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
            onClick={() => setShowBriefingLockedAlert(false)}
          >
            {/* Ambient volumetric blue glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(14,165,233,0.22),transparent_75%)] pointer-events-none" />

            {/* Cyber Blue Glass Box (สไตล์เดียวกับ Game Overview พร้อมเอฟเฟกต์บีมเปิดกว้างบนล่างพร้อมกันและกระพริบ) */}
            <div
              className="relative w-full max-w-[360px] sm:max-w-[400px] rounded-none bg-[#061224]/95 border border-sky-400/60 shadow-[0_0_40px_rgba(56,189,248,0.45)] backdrop-blur-2xl p-6 sm:p-7 text-center space-y-4 overflow-hidden animate-beam-expand-blink"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top & Bottom Laser Beams */}
              <div className="absolute inset-x-0 top-0 h-[2.5px] bg-sky-400 shadow-[0_0_15px_#38bdf8] animate-pulse pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-[2.5px] bg-sky-400 shadow-[0_0_15px_#38bdf8] animate-pulse pointer-events-none" />

              {/* Left & Right Laser Lines */}
              <div className="absolute inset-y-0 left-0 w-[2px] bg-sky-400/80 shadow-[0_0_10px_#38bdf8] animate-pulse pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-[2px] bg-sky-400/80 shadow-[0_0_10px_#38bdf8] animate-pulse pointer-events-none" />

              {/* 4 Perfectly Aligned Tech Corner Brackets */}
              <div className="absolute inset-0 pointer-events-none">
                <span className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-sky-300 shadow-[0_0_8px_#38bdf8]" />
                <span className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-sky-300 shadow-[0_0_8px_#38bdf8]" />
                <span className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-sky-300 shadow-[0_0_8px_#38bdf8]" />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-sky-300 shadow-[0_0_8px_#38bdf8]" />
              </div>

              {/* Scanning Vertical Light Beam */}
              <div className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-300 to-transparent shadow-[0_0_8px_#38bdf8] pointer-events-none animate-beam-scanline-v" />

              {/* Lock Icon Box */}
              <div className="w-12 h-12 mx-auto rounded-none bg-sky-950/90 border border-sky-400/80 flex items-center justify-center shadow-[0_0_18px_rgba(56,189,248,0.5)]">
                <Lock className="w-6 h-6 text-sky-300 animate-pulse" />
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <span className="text-[10.5px] font-mono text-sky-400 uppercase tracking-widest font-bold block">
                  /// BRIEFING IN PROGRESS
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(125,211,252,0.4)]">
                  ยังไม่ถึงเวลาเปิดร้านค้า
                </h3>
                <p className="text-xs sm:text-sm text-sky-200/90 font-sans leading-relaxed pt-1">
                  ขณะนี้อยู่ในขั้นตอน <strong className="text-white">&ldquo;อ่านบรีฟ&rdquo;</strong> ให้นักเรียนศึกษาโจทย์และบทบาทภัณฑารักษ์ให้พร้อมก่อนที่คุณครูจะเปิดร้านค้า
                </p>
              </div>

              {/* Dismiss Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowBriefingLockedAlert(false)}
                  className="w-full py-2.5 px-4 rounded-none bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400 text-sky-200 font-serif font-bold text-xs sm:text-sm transition active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.25)]"
                >
                  รับทราบ (เข้าใจแล้ว)
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ─── 🏛️ Cyber Empty Exhibition 1-Minute Alert Modal (เตือนเมื่อเหลือ 1 นาทีและยังไม่เลือกของจัดแสดง) ─── */}
      {typeof document !== 'undefined' &&
        showEmptyExhibitionUrgentAlert &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999999] bg-[#020617]/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
            onClick={() => setShowEmptyExhibitionUrgentAlert(false)}
          >
            {/* Ambient volumetric alert glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(56,189,248,0.25),transparent_75%)] pointer-events-none" />

            {/* Cyber Blue Glass Box (สไตล์เดียวกับ Briefing Alert) */}
            <div
              className="relative w-full max-w-[360px] sm:max-w-[400px] rounded-none bg-[#061224]/95 border border-sky-400/70 shadow-[0_0_40px_rgba(56,189,248,0.45)] backdrop-blur-2xl p-6 sm:p-7 text-center space-y-4 overflow-hidden animate-beam-expand-blink"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top & Bottom Laser Beams */}
              <div className="absolute inset-x-0 top-0 h-[2.5px] bg-sky-400 shadow-[0_0_15px_#38bdf8] animate-pulse pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-[2.5px] bg-sky-400 shadow-[0_0_15px_#38bdf8] animate-pulse pointer-events-none" />

              {/* Left & Right Laser Lines */}
              <div className="absolute inset-y-0 left-0 w-[2px] bg-sky-400/80 shadow-[0_0_10px_#38bdf8] animate-pulse pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-[2px] bg-sky-400/80 shadow-[0_0_10px_#38bdf8] animate-pulse pointer-events-none" />

              {/* 4 Tech Corner Brackets */}
              <div className="absolute inset-0 pointer-events-none">
                <span className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-sky-300 shadow-[0_0_8px_#38bdf8]" />
                <span className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-sky-300 shadow-[0_0_8px_#38bdf8]" />
                <span className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-sky-300 shadow-[0_0_8px_#38bdf8]" />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-sky-300 shadow-[0_0_8px_#38bdf8]" />
              </div>

              {/* Scanning Vertical Light Beam */}
              <div className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-300 to-transparent shadow-[0_0_8px_#38bdf8] pointer-events-none animate-beam-scanline-v" />

              {/* Landmark Icon Box */}
              <div className="w-12 h-12 mx-auto rounded-none bg-sky-950/90 border border-sky-400/80 flex items-center justify-center shadow-[0_0_18px_rgba(56,189,248,0.5)]">
                <Landmark className="w-6 h-6 text-sky-300 animate-pulse" />
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <span className="text-[10.5px] font-mono text-sky-400 uppercase tracking-widest font-bold block">
                  /// 1 MINUTE REMAINING // URGENT ACTION
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(125,211,252,0.4)]">
                  เหลือเวลา 1 นาทีสุดท้าย
                </h3>
                <p className="text-xs sm:text-sm text-sky-200/90 font-sans leading-relaxed pt-1">
                  ทีมของคุณยังไม่ได้เลือกของจัดแสดงในห้องนิทรรศการเลย กรุณาเลือกของเพื่อจัดวางและเตรียมส่งมอบงาน
                </p>
              </div>

              {/* Action Button: พาไปหน้าจัดนิทรรศการ */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmptyExhibitionUrgentAlert(false);
                    setActiveTab('room');
                  }}
                  className="w-full py-2.5 px-4 rounded-none bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400 text-sky-100 font-serif font-bold text-xs sm:text-sm transition active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.3)] flex items-center justify-center gap-2"
                >
                  <span>ไปที่หน้านิทรรศการ</span>
                  <ArrowRight className="w-4 h-4 text-sky-300" />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ─── STICKY FLOATING TOP NAVIGATION HUD & MAIN TABS (ลอยอยู่ตลอดเวลา) ─── */}
      {myTeam && session.phase !== 'LOBBY' && hasSeenReveal && !myTeam.isSubmitted && (
        <div className="sticky top-0 z-50 w-full bg-[#08050a]/95 backdrop-blur-xl border-b border-rose-950/70 shadow-lg select-none">
          <HeaderHUD
            session={session}
            myTeam={myTeam}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            timeLeft={timeLeft}
            onSetPhase={handleSetPhase}
            onResetGame={handleResetGame}
          />

          {/* ─── LUXURY MAIN NAVIGATION TABS ─── */}
          {session.phase !== 'LEADERBOARD' && (
            <div className="border-t border-rose-950/60 border-b border-rose-950/70 pb-0 pt-0 flex items-center justify-center select-none bg-[#0c080f]/90 backdrop-blur-xs px-2">
              <div className="relative grid grid-cols-3 w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-xl items-center justify-center">
                {/* ── Sliding Dark Active Box Indicator ── */}
                <div
                  className="absolute top-0 bottom-0 w-1/3 left-0 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none z-0"
                  style={{
                    transform: activeTab === 'briefing' ? 'translateX(0%)' : activeTab === 'market' ? 'translateX(100%)' : 'translateX(200%)',
                  }}
                >
                  {/* Dark Box with Internal Glow & Rose Rim */}
                  <div
                    className="w-full h-full rounded-t-[3px] shadow-sm relative overflow-hidden border-t border-rose-500/40 border-b-2 border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.4)]"
                    style={{
                      background: 'linear-gradient(180deg, #2b1118 0%, #1a080d 60%, #120509 100%)',
                    }}
                  >
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'radial-gradient(ellipse 90% 60% at 50% 100%, rgba(225, 29, 72, 0.35) 0%, rgba(159, 18, 57, 0.15) 50%, transparent 85%)',
                      }}
                    />
                  </div>
                </div>

                {/* Tab 1: Briefing */}
                <button
                  onClick={() => setActiveTab('briefing')}
                  className={`relative z-10 w-full py-2 sm:py-2.5 px-1 flex items-center justify-center transition-colors duration-300 cursor-pointer tracking-wider ${
                    activeTab === 'briefing'
                      ? 'text-white font-bold drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]'
                      : 'text-rose-300/40 hover:text-white font-medium'
                  }`}
                >
                  <span className="text-[11px] xs:text-xs sm:text-sm md:text-base truncate">ภารกิจ &amp; เรื่องราว</span>
                </button>

                {/* Tab 2: Market */}
                <button
                  onClick={handleEnterMarket}
                  className={`relative z-10 w-full py-2 sm:py-2.5 px-1 flex items-center justify-center transition-colors duration-300 cursor-pointer tracking-wider ${
                    activeTab === 'market'
                      ? 'text-white font-bold drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]'
                      : 'text-rose-300/40 hover:text-white font-medium'
                  }`}
                >
                  <span className="text-[11px] xs:text-xs sm:text-sm md:text-base truncate">ร้านค้า</span>
                </button>

                {/* Tab 3: Room Inventory */}
                <button
                  onClick={() => setActiveTab('room')}
                  className={`relative z-10 w-full py-2 sm:py-2.5 px-1 flex items-center justify-center gap-1 sm:gap-1.5 transition-colors duration-300 cursor-pointer tracking-wider ${
                    activeTab === 'room'
                      ? 'text-white font-bold drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]'
                      : 'text-rose-300/40 hover:text-white font-medium'
                  }`}
                >
                  <span className="text-[11px] xs:text-xs sm:text-sm md:text-base truncate">นิทรรศการ</span>
                  {myTeam && (myTeam.statueInventory.length + myTeam.evidenceInventory.length) > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] xs:text-[10px] font-bold shrink-0 ${
                      activeTab === 'room' ? 'bg-rose-500 text-white' : 'bg-rose-950 text-rose-300 border border-rose-800/50'
                    }`}>
                      {myTeam.statueInventory.length + myTeam.evidenceInventory.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ─── MARKET SUB TABS (หลักฐาน | เรื่องราว | ประติมากรรม) ─── */}
          {activeTab === 'market' && session.phase !== 'LEADERBOARD' && (
            <div className="border-b border-rose-950/80 pb-0 pt-0 flex items-center justify-center select-none bg-[#09050b]/95 backdrop-blur-xs px-2">
              <div className="relative grid grid-cols-3 w-full max-w-xs xs:max-w-sm sm:max-w-md items-center justify-center">
                {/* Sliding Dark Active Box Indicator */}
                <div
                  className="absolute top-0 bottom-0 w-1/3 left-0 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none z-0"
                  style={{
                    transform:
                      marketSubTab === 'evidence'
                        ? 'translateX(0%)'
                        : marketSubTab === 'stories'
                        ? 'translateX(100%)'
                        : 'translateX(200%)',
                  }}
                >
                  {/* Dark Box with Internal Glow (No Top Border) */}
                  <div
                    className="w-full h-full shadow-sm relative overflow-hidden border-b-2 border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.4)]"
                    style={{
                      background: 'linear-gradient(180deg, #2b1118 0%, #1a080d 60%, #120509 100%)',
                    }}
                  >
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'radial-gradient(ellipse 90% 60% at 50% 100%, rgba(225, 29, 72, 0.35) 0%, rgba(159, 18, 57, 0.15) 50%, transparent 85%)',
                      }}
                    />
                  </div>
                </div>

                {/* Tab 1: Evidence (หลักฐาน) */}
                <button
                  onClick={() => setMarketSubTab('evidence')}
                  className={`relative z-10 w-full py-2 sm:py-2.5 px-0.5 flex items-center justify-center transition-colors duration-300 cursor-pointer tracking-wider font-serif ${
                    marketSubTab === 'evidence'
                      ? 'text-white font-bold drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]'
                      : 'text-rose-300/40 hover:text-white font-medium'
                  }`}
                >
                  <span className="text-[10.5px] xs:text-xs sm:text-sm truncate">
                    หลักฐาน ({myTeam.evidenceInventory?.length || 0}/4)
                  </span>
                </button>

                {/* Tab 2: Stories (เรื่องราว) */}
                <button
                  onClick={() => setMarketSubTab('stories')}
                  className={`relative z-10 w-full py-2 sm:py-2.5 px-0.5 flex items-center justify-center transition-colors duration-300 cursor-pointer tracking-wider font-serif ${
                    marketSubTab === 'stories'
                      ? 'text-white font-bold drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]'
                      : 'text-rose-300/40 hover:text-white font-medium'
                  }`}
                >
                  <span className="text-[10.5px] xs:text-xs sm:text-sm truncate">
                    เรื่องราว ({myTeam.storyInventory?.length || 0}/1)
                  </span>
                </button>

                {/* Tab 3: Statues (ประติมากรรม) */}
                <button
                  onClick={() => setMarketSubTab('statues')}
                  className={`relative z-10 w-full py-2 sm:py-2.5 px-0.5 flex items-center justify-center transition-colors duration-300 cursor-pointer tracking-wider font-serif ${
                    marketSubTab === 'statues'
                      ? 'text-white font-bold drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]'
                      : 'text-rose-300/40 hover:text-white font-medium'
                  }`}
                >
                  <span className="text-[10.5px] xs:text-xs sm:text-sm truncate">
                    รูปปั้น ({myTeam.statueInventory?.length || 0}/4)
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slot Reel Reveal Screen when game starts */}
      {myTeam && session.phase !== 'LOBBY' && session.phase !== 'LEADERBOARD' && !myTeam.isSubmitted && !hasSeenReveal && (
        <SlotReelReveal
          myTeam={myTeam}
          onComplete={() => {
            setHasSeenReveal(true);
            try {
              localStorage.setItem(`curator_revealed_${myTeam.id}`, 'true');
            } catch (e) {}
            setActiveTab('briefing');
          }}
        />
      )}

      <main className="flex-1 pb-16 sm:pb-8">
        {!myTeam ? (
          /* Student has not joined any team yet */
          <LobbyScreen
            session={session}
            onCreateTeam={handleCreateTeam}
            onJoinTeam={handleJoinTeam}
            onReclaimIdentity={handleReclaimIdentity}
            onExitSession={handleExitSession}
            onOpenArchive={() => setIsArchiveOpen(true)}
            isLoading={isLoading}
            errorMessage={errorMessage}
            initialMode={initialLobbyMode}
          />
        ) : session.phase === 'LOBBY' ? (
          /* Student is in a team, waiting for teacher to start */
          <WaitingRoomScreen
            session={session}
            myTeam={myTeam}
            myMemberId={myMemberId}
            onLeaveTeam={handleLeaveTeam}
            onUpdateTeamName={handleUpdateTeamName}
            onUpdateMemberName={handleUpdateMemberName}
            isLoading={isLoading}
          />
        ) : session.phase === 'LEADERBOARD' ? (
          <LeaderboardScreen session={session} onClose={handleExitSession} onResetGame={handleResetGame} myTeamId={myTeamId || undefined} />
        ) : myTeam.isSubmitted ? (
          <SubmittedWaitingScreen
            session={session}
            myTeam={myTeam}
            onViewExhibition={() => {
              router.push(`/archive?session=${session.sessionCode}&team=${myTeam.id}`);
            }}
          />
        ) : session.phase === 'BRIEFING' || activeTab === 'briefing' ? (
          <BriefingScreen myTeam={myTeam} onEnterMarket={handleEnterMarket} />
        ) : activeTab === 'room' ? (
          <ExhibitionRoomScreen
            myTeam={myTeam}
            allTeams={Object.values(session.teams || {})}
            onSelectItem={item => setSelectedItem(item)}
            onSubmitRoom={handleSubmitRoom}
            isSubmitting={isSubmitting}
          />
        ) : (
          <MarketScreen
            myTeam={myTeam}
            onSelectItem={item => setSelectedItem(item)}
            onBuyItem={handleBuyItem}
            onGoToBriefing={() => setActiveTab('briefing')}
            isBuying={isBuying}
            activeType={marketSubTab}
            onTabChange={setMarketSubTab}
          />
        )}
      </main>

      <CardDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onBuy={handleBuyItem}
        myTeam={myTeam}
        isBuying={isBuying}
      />

      <ArchiveMuseumModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
      />
    </div>
  );
}
