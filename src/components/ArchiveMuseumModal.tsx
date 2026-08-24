'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Landmark,
  Search,
  BookOpen,
  X,
} from 'lucide-react';
import { GameSessionState, StatueItem, EvidenceItem } from '@/data/types';
import { EXHIBITION_ROOMS, STATUE_ITEMS, EVIDENCE_ITEMS } from '@/data/gameData';
import { STORY_PLACARDS_DATA, StoryPlacardItem } from '@/data/storyPlacardsData';
import { CardDetailModal } from '@/components/CardDetailModal';
import { EvidenceDossierModal } from '@/components/EvidenceDossierModal';
import { ExhibitionRoomScreen } from '@/components/ExhibitionRoomScreen';

interface ArchiveMuseumModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSessionCode?: string;
  initialTeamId?: string;
}

export const ArchiveMuseumModal: React.FC<ArchiveMuseumModalProps> = ({
  isOpen,
  onClose,
  initialSessionCode,
  initialTeamId,
}) => {
  const [sessions, setSessions] = useState<GameSessionState[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Selected session and team to inspect
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Active sub-tab when inspecting team's room ('statues' | 'evidence' | 'stories')
  const [roomSubTab, setRoomSubTab] = useState<'statues' | 'evidence' | 'stories'>('statues');

  // Inspect detail item modal
  const [selectedDetailItem, setSelectedDetailItem] = useState<
    (StatueItem & { itemType: 'statue' }) | (EvidenceItem & { itemType: 'evidence' }) | null
  >(null);

  // Fetch all sessions with full state
  useEffect(() => {
    if (!isOpen) {
      setSelectedSessionId(null);
      setSelectedTeamId(null);
      return;
    }
    setIsLoading(true);
    fetch('/api/game?archive=true')
      .then((res) => res.json())
      .then((data: GameSessionState[]) => {
        if (Array.isArray(data)) {
          setSessions(data);
          if (initialSessionCode) {
            const found = data.find((s) => s.sessionCode === initialSessionCode || s.sessionId === initialSessionCode);
            if (found) {
              setSelectedSessionId(found.sessionId);
              if (initialTeamId) {
                setSelectedTeamId(initialTeamId);
              }
            }
          } else if (initialTeamId) {
            const found = data.find((s) => s.teams && s.teams[initialTeamId]);
            if (found) {
              setSelectedSessionId(found.sessionId);
              setSelectedTeamId(initialTeamId);
            }
          }
        }
      })
      .catch((err) => console.error('Failed to load archive sessions:', err))
      .finally(() => setIsLoading(false));
  }, [isOpen, initialSessionCode, initialTeamId]);

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.sessionId === selectedSessionId) || null;
  }, [sessions, selectedSessionId]);

  const activeTeams = useMemo(() => {
    if (!activeSession) return [];
    const all = Object.values(activeSession.teams || {});
    if (initialTeamId) {
      return all.sort((a, b) => (b.score?.totalScore ?? 0) - (a.score?.totalScore ?? 0));
    }
    // แสดงกลุ่มที่ส่งผลงานแล้ว หรือกลุ่มที่มีผลงาน/สมาชิกในรอบที่เล่นเสร็จแล้ว
    const filtered = all.filter((team) => {
      if (team.isSubmitted) return true;
      if (activeSession.phase === 'LEADERBOARD') return true;
      const itemCount = (team.statueInventory?.length || 0) + (team.evidenceInventory?.length || 0) + (team.storyInventory?.length || 0);
      if (itemCount > 0) return true;
      if (team.members && team.members.length > 0) return true;
      return false;
    });
    return filtered.sort((a, b) => (b.score?.totalScore ?? 0) - (a.score?.totalScore ?? 0));
  }, [activeSession, initialTeamId]);

  const activeTeam = useMemo(() => {
    if (!activeSession || !selectedTeamId) return null;
    return activeSession.teams[selectedTeamId] || null;
  }, [activeSession, selectedTeamId]);

  const activeRoom = useMemo(() => {
    if (!activeTeam) return null;
    return EXHIBITION_ROOMS.find((r) => r.id === activeTeam.roomId) || EXHIBITION_ROOMS[0];
  }, [activeTeam]);

  // Items owned by the active team
  const teamStatues = useMemo(() => {
    if (!activeTeam) return [];
    return STATUE_ITEMS.filter((s) => activeTeam.statueInventory?.includes(s.id));
  }, [activeTeam]);

  const teamEvidences = useMemo(() => {
    if (!activeTeam) return [];
    return EVIDENCE_ITEMS.filter((e) => activeTeam.evidenceInventory?.includes(e.id));
  }, [activeTeam]);

  const teamStories = useMemo(() => {
    if (!activeTeam) return [];
    return STORY_PLACARDS_DATA.filter((s: StoryPlacardItem) =>
      activeTeam.storyInventory?.includes(s.id)
    );
  }, [activeTeam]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 ${
        selectedTeamId ? 'bg-[#0a0307]' : 'bg-[#030712]'
      } backdrop-blur-xl animate-fadeIn select-none font-sans text-white overflow-y-auto cursor-pointer`}
    >
      {/* ── Seamless Fixed Cyber Background (โทนแดง Crimson/Rose เมื่อดูห้องนิทรรศการ) ── */}
      <div className={`fixed inset-0 pointer-events-none z-0 transition-colors duration-500 ${
        selectedTeamId ? 'bg-[#0a0307]' : 'bg-[#030712]'
      }`} />
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-all duration-500"
        style={{
          backgroundImage: selectedTeamId
            ? 'linear-gradient(to right, rgba(244, 63, 94, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(244, 63, 94, 0.08) 1px, transparent 1px)'
            : 'linear-gradient(to right, rgba(125, 211, 252, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(125, 211, 252, 0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: selectedTeamId
            ? 'radial-gradient(ellipse 85% 85% at 50% 45%, transparent 20%, #0a0307 95%)'
            : 'radial-gradient(ellipse 85% 85% at 50% 45%, transparent 20%, #030712 95%)',
        }}
      />
      <div className={`fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] blur-[120px] rounded-full pointer-events-none z-0 transition-colors duration-500 ${
        selectedTeamId ? 'bg-rose-950/45' : 'bg-sky-950/20'
      }`} />
      <div className={`fixed bottom-1/4 right-1/4 w-80 h-80 blur-[100px] rounded-full pointer-events-none z-0 transition-colors duration-500 ${
        selectedTeamId ? 'bg-red-950/35' : 'bg-blue-950/15'
      }`} />

      {/* ══════════════════════════════════════════════════════════════════════════
         STEP 1: SELECT SESSION / CLASS (เลือกรอบ/ห้องเรียน เช่น ม.3/1)
         ══════════════════════════════════════════════════════════════════════════ */}
      {!selectedSessionId ? (
        <div className="relative z-10 w-full max-w-[360px] mx-auto animate-fadeIn space-y-4">
          {/* Back Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-sky-950/60">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-sky-300 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-sky-300" />
              <span>&lt; ย้อนกลับ</span>
            </button>
            <span className="text-[10px] font-mono text-sky-400/70 tracking-widest uppercase">
              /// ARCHIVE
            </span>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-tight">
              พิพิธภัณฑ์
            </h2>
          </div>

          {/* Session List (UI แบบเดียวกับเลือกกลุ่ม) */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="py-10 text-center text-xs text-sky-300/70 font-mono">
                กำลังโหลดข้อมูล...
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-10 text-center text-xs text-sky-200/60 font-mono">
                -- ยังไม่มีบันทึกนิทรรศการ --
              </div>
            ) : (
              sessions.map((sess) => {
                const submittedCount = Object.values(sess.teams || {}).filter((t) => {
                  if (t.isSubmitted) return true;
                  if (sess.phase === 'LEADERBOARD') return true;
                  const itemCount = (t.statueInventory?.length || 0) + (t.evidenceInventory?.length || 0) + (t.storyInventory?.length || 0);
                  return itemCount > 0 || (t.members && t.members.length > 0);
                }).length;

                return (
                  <div
                    key={sess.sessionId}
                    onClick={() => setSelectedSessionId(sess.sessionId)}
                    className="w-full py-3.5 px-4 rounded-[4px] cyber-glass-btn flex items-center justify-between transition-all duration-200 cursor-pointer hover:border-sky-400/80"
                  >
                    {/* Left: Session / Class Name */}
                    <span className="font-serif font-bold text-sm sm:text-base text-white tracking-wide truncate pr-2">
                      {sess.sessionName || sess.sessionCode}
                    </span>

                    {/* Right: Submitted Team Count (No frame) */}
                    <span className="text-xs font-mono font-medium text-sky-300/80 shrink-0">
                      {submittedCount} กลุ่ม
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : !selectedTeamId ? (
        /* ══════════════════════════════════════════════════════════════════════════
           STEP 2: SELECT TEAM IN SESSION (เมื่อกดเลือกรอบ เช่น ม.3/1 -> เจอกลุ่มที่ส่งผลงานแล้ว)
           ══════════════════════════════════════════════════════════════════════════ */
        <div className="relative z-10 w-full max-w-[360px] mx-auto animate-fadeIn space-y-4">
          {/* Back Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-sky-950/60">
            <button
              type="button"
              onClick={() => setSelectedSessionId(null)}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-sky-300 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-sky-300" />
              <span>&lt; ย้อนกลับ</span>
            </button>
            <span className="text-[10px] font-mono text-sky-400/70 tracking-widest uppercase truncate max-w-[150px]">
              /// {activeSession?.sessionCode}
            </span>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-tight">
              เลือกกลุ่มที่ต้องการรับชม
            </h2>
          </div>

          {/* Team Cards List (แสดงเฉพาะกลุ่มที่ submit ผลงานแล้ว) */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {activeTeams.length === 0 ? (
              <div className="py-10 text-center text-xs text-sky-200/60 font-mono">
                -- ยังไม่มีกลุ่มที่ส่งผลงานจัดแสดง --
              </div>
            ) : (
              activeTeams.map((team) => {
                const room = EXHIBITION_ROOMS.find((r) => r.id === team.roomId);
                const sCount = team.statueInventory?.length ?? 0;
                const eCount = team.evidenceInventory?.length ?? 0;
                const stCount = team.storyInventory?.length ?? 0;
                const totalItems = sCount + eCount + stCount;

                return (
                  <div
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className="w-full py-3.5 px-4 rounded-[4px] cyber-glass-btn flex items-center justify-center text-center transition-all duration-200 cursor-pointer hover:border-sky-400/80"
                  >
                    {/* Team Name */}
                    <span className="font-serif font-bold text-sm sm:text-base text-white tracking-wide truncate">
                      {team.name}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════════════
           STEP 3: 3D INTERACTIVE EXHIBITION ROOM (เมื่อกดเลือกกลุ่ม)
           ══════════════════════════════════════════════════════════════════════════ */
        <div className="relative z-10 w-full max-w-5xl mx-auto animate-fadeIn space-y-4 my-auto pb-12">
          {/* Floating Back Button & Room Tag */}
          <div className="absolute top-2 left-2 z-30">
            <button
              type="button"
              onClick={() => {
                if (initialTeamId || initialSessionCode) {
                  onClose();
                } else {
                  setSelectedTeamId(null);
                }
              }}
              className="bg-transparent border-0 text-white/80 hover:text-white text-xs sm:text-sm font-mono font-bold tracking-wider cursor-pointer p-2 flex items-center gap-1 transition-all active:scale-95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
              title="ย้อนกลับ"
            >
              <span>&lt; BACK</span>
            </button>
          </div>
          <div className="absolute top-3.5 right-4 z-30 pointer-events-none">
            <span className="text-[10px] sm:text-xs font-mono text-rose-400/70 tracking-widest uppercase">
              /// ROOM 0{activeRoom?.roomNumber}
            </span>
          </div>

          {activeTeam && (
            <ExhibitionRoomScreen
              myTeam={activeTeam}
              allTeams={activeTeams}
              onSelectItem={(item) => setSelectedDetailItem(item)}
              onSubmitRoom={() => {}}
              isSubmitting={false}
              isReadOnly={true}
            />
          )}
        </div>
      )}

      {/* Evidence Dossier Modal for Evidence, CardDetailModal for Statues/Stories */}
      {selectedDetailItem && ('barcodeSerial' in selectedDetailItem || (selectedDetailItem as any).itemType === 'evidence') && activeTeam ? (
        <EvidenceDossierModal
          room={activeRoom}
          onClose={() => setSelectedDetailItem(null)}
          myTeam={activeTeam}
          onBuyItem={() => {}}
          initialEvidenceId={selectedDetailItem.id}
        />
      ) : selectedDetailItem ? (
        <CardDetailModal
          item={selectedDetailItem}
          onClose={() => setSelectedDetailItem(null)}
          myTeam={activeTeam || undefined}
          theme="rose"
        />
      ) : null}
    </div>
  );
};
