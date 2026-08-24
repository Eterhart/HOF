'use client';

import React, { useState, useEffect } from 'react';
import { Users, User, PlusCircle, LogIn, Sparkles, ArrowLeft, ArrowRight, Crown, Landmark, Flag, Gamepad2, UserCheck, UserPlus } from 'lucide-react';
import { GameSessionState } from '@/data/types';

interface LobbyScreenProps {
  session: GameSessionState;
  onCreateTeam: (teamName: string, leaderName: string) => Promise<void>;
  onJoinTeam: (code: string, memberName: string) => Promise<void>;
  onReclaimIdentity?: (teamId: string, memberId: string) => Promise<void>;
  onExitSession?: () => void;
  onOpenArchive?: () => void;
  isLoading: boolean;
  errorMessage: string | null;
  initialMode?: 'select' | 'create' | 'join';
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  session,
  onCreateTeam,
  onJoinTeam,
  onReclaimIdentity,
  onExitSession,
  onOpenArchive,
  isLoading,
  errorMessage,
  initialMode = 'select',
}) => {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>(initialMode);
  const [teamName, setTeamName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [memberName, setMemberName] = useState('');
  const [joinUserMode, setJoinUserMode] = useState<'choose' | 'existing' | 'new'>('choose');

  useEffect(() => {
    setJoinCode('');
    setMemberName('');
    setJoinUserMode('choose');
  }, [mode]);

  const teamsList = Object.values(session.teams || {});

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    await onCreateTeam(teamName, leaderName);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    await onJoinTeam(joinCode, memberName);
  };

  return (
    <div className="min-h-[88vh] flex flex-col items-center justify-center px-4 py-8 max-w-lg mx-auto select-none animate-fadeIn text-[#e0f2fe] relative overflow-hidden font-sans">
      {/* ── Soft Comfortable Cyber Grid Background (ตารางนุ่มนวล ไม่แสบตา) ── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(125,211,252,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(125,211,252,0.06)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_85%_at_50%_45%,transparent_20%,#030712_95%)] pointer-events-none z-0" />

      {/* ── Ambient Volumetric Spotlight Glow ── */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-950/20 blur-[100px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-950/15 blur-[90px] rounded-full pointer-events-none z-0" />

      {/* ── Hero Header ── */}
      <div className="relative z-10 w-full text-center space-y-2.5 mb-6">
        {/* Top Frameless Room Code & System Bar */}
        <div className="flex items-center justify-between text-xs font-mono text-sky-300 px-1 pb-1">
          <div className="flex items-center gap-2">
            <span className="text-sky-200/90 font-sans text-xs">รหัสห้อง:</span>
            <strong className="font-mono text-[#f5c768] font-black text-base sm:text-lg tracking-widest drop-shadow-[0_0_8px_rgba(245,199,104,0.5)]">
              {session.sessionCode}
            </strong>
            {onExitSession && (
              <button
                onClick={onExitSession}
                className="text-sky-300 hover:text-white underline text-[11px] font-sans transition cursor-pointer pl-0.5"
              >
                (เปลี่ยนห้อง)
              </button>
            )}
          </div>

          <span className="text-[10px] font-mono text-sky-400/70 tracking-[0.2em] uppercase">
            /// THE HALL OF FAME
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-white drop-shadow-[0_0_20px_rgba(125,211,252,0.3)]">
          The Hall of Fame
        </h1>

        <p className="text-sm sm:text-base text-[#f5c768] font-serif tracking-wide drop-shadow-[0_1px_8px_rgba(245,199,104,0.3)]">
          ภารกิจภัณฑารักษ์ฝึกหัด
        </p>

        <p className="text-xs sm:text-sm text-sky-200/80 max-w-lg mx-auto leading-relaxed font-sans">
          กอบกู้ห้องจัดแสดงที่ถูกโจรกรรม สืบคืนหลักฐานข้อเท็จจริง และบริหารงบประมาณบูรณะนิทรรศการหอเกียรติยศ
        </p>

        {/* Glowing Tech Accent Line */}
        <div className="relative pt-1 flex items-center justify-center">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-sky-400/50 to-transparent shadow-[0_0_8px_rgba(125,211,252,0.4)]" />
          <span className="absolute px-3 bg-[#030712] text-[9.5px] font-mono text-sky-300/80 tracking-widest uppercase">
            /// TEAM SELECTION
          </span>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="relative z-10 w-full max-w-md mb-4 p-3 bg-rose-950/80 border border-rose-600/80 text-rose-200 rounded-[8px] text-xs text-center font-medium shadow-[0_0_12px_rgba(225,29,72,0.4)] animate-fadeIn">
          {errorMessage}
        </div>
      )}

      {/* ─── MODE 1: 3 COMPACT SHARP BUTTONS (CENTERED) ─── */}
      {mode === 'select' && (
        <div className="relative z-10 w-full max-w-[340px] mx-auto space-y-4 animate-fadeIn">
          {/* Main Terminal Box with 4 Perfectly Aligned Corner Brackets & Gentle Inner Glow */}
          <div className="relative p-4 sm:p-5 rounded-none bg-[#061224]/90 border border-sky-400/25 backdrop-blur-xl space-y-2.5 animate-frame-inner-glow">
            {/* 4 Perfectly Aligned Tech Corner Brackets (เขี้ยว 4 มุมตรงสนิท ซ้าย-ขวาเท่ากัน 100%) */}
            <div className="absolute inset-0 pointer-events-none">
              <span className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-sky-300 shadow-[0_0_8px_rgba(125,211,252,0.6)]" />
              <span className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-sky-300 shadow-[0_0_8px_rgba(125,211,252,0.6)]" />
              <span className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-sky-300 shadow-[0_0_8px_rgba(125,211,252,0.6)]" />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-sky-300 shadow-[0_0_8px_rgba(125,211,252,0.6)]" />
            </div>

            {/* Phase Notices */}
            {session.phase === 'LEADERBOARD' && (
              <div className="p-2.5 bg-zinc-900/90 border border-zinc-700 rounded-[4px] text-center text-xs text-zinc-300 font-medium inline-flex items-center justify-center gap-1.5 w-full">
                <Flag className="w-3.5 h-3.5 text-zinc-400" />
                <span>รอบการเล่นนี้จบลงแล้ว (ปิดรับสมัครและสร้างกลุ่ม)</span>
              </div>
            )}
            {/* Choice 1: Create Team Button */}
            <button
              type="button"
              onClick={() => session.phase === 'LOBBY' && teamsList.length < 8 && setMode('create')}
              disabled={session.phase !== 'LOBBY' || teamsList.length >= 8}
              className={`w-[260px] max-w-full mx-auto py-3.5 px-4 rounded-[4px] cyber-glass-btn text-center block ${
                session.phase !== 'LOBBY' || teamsList.length >= 8
                  ? 'opacity-40 cursor-not-allowed text-slate-400'
                  : 'text-white hover:text-cyan-100 cursor-pointer'
              }`}
            >
              <span className="text-sm sm:text-base font-serif font-bold tracking-wide">
                สร้างกลุ่มใหม่
              </span>
            </button>

            {/* Choice 2: Join Team Button */}
            <button
              type="button"
              onClick={() => session.phase !== 'LEADERBOARD' && setMode('join')}
              disabled={session.phase === 'LEADERBOARD'}
              className={`w-[260px] max-w-full mx-auto py-3.5 px-4 rounded-[4px] cyber-glass-btn-gold text-center block ${
                session.phase === 'LEADERBOARD'
                  ? 'opacity-40 cursor-not-allowed text-slate-400'
                  : 'text-white hover:text-[#fde68a] cursor-pointer'
              }`}
            >
              <span className="text-sm sm:text-base font-serif font-bold tracking-wide">
                เข้าร่วมกลุ่ม
              </span>
            </button>

            {/* Choice 3: Grand Archive Button */}
            {onOpenArchive && (
              <>
                {/* ── Divider Line (ขีดกั้น) ── */}
                <div className="w-full pt-2 pb-0.5 flex items-center justify-center">
                  <div className="w-[260px] max-w-full h-[1px] bg-gradient-to-r from-transparent via-sky-500/50 to-transparent shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                </div>

                <button
                  type="button"
                  onClick={onOpenArchive}
                  className="w-[260px] max-w-full mx-auto py-3.5 px-4 rounded-[4px] cyber-glass-btn text-center text-white hover:text-cyan-100 cursor-pointer block"
                >
                  <span className="text-sm sm:text-base font-serif font-bold tracking-wide">
                    พิพิธภัณฑ์
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── MODE 2: FORM CREATE TEAM (สร้างกลุ่มใหม่) ─── */}
      {mode === 'create' && (
        <div className="relative z-10 w-full max-w-[360px] mx-auto animate-fadeIn">
          <form onSubmit={handleCreate} className="relative p-2 sm:p-3 space-y-4">
            {/* Back Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-sky-950/60">
              <button
                type="button"
                onClick={() => setMode('select')}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-sky-300 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-sky-300" />
                <span>&lt; ย้อนกลับ</span>
              </button>
              <span className="text-[10px] font-mono text-sky-400/70 tracking-widest uppercase">
                /// CREATE TEAM
              </span>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-tight">
                สร้างกลุ่มใหม่
              </h2>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="ชื่อกลุ่ม"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full py-3 px-4 rounded-[4px] cyber-glass-btn text-sm font-serif text-white placeholder-sky-300/40 focus:outline-none focus:border-sky-300 focus:ring-1 focus:ring-sky-300 transition-all duration-200"
                />
              </div>

              <div>
                <input
                  type="text"
                  required
                  placeholder="ชื่อของคุณ"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="w-full py-3 px-4 rounded-[4px] cyber-glass-btn text-sm font-serif text-white placeholder-sky-300/40 focus:outline-none focus:border-sky-300 focus:ring-1 focus:ring-sky-300 transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || teamsList.length >= 8}
              className={`w-[200px] max-w-full mx-auto py-3 px-4 rounded-[4px] cyber-glass-btn text-center block ${
                isLoading || teamsList.length >= 8
                  ? 'opacity-40 cursor-not-allowed text-slate-400'
                  : 'text-white hover:text-cyan-100 cursor-pointer'
              }`}
            >
              <span className="text-sm sm:text-base font-serif font-bold tracking-wide">
                {isLoading ? 'กำลังสร้างกลุ่ม...' : 'สร้างกลุ่มใหม่'}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* ─── MODE 3: SELECT FROM EXISTING TEAMS (เลือกกลุ่ม และสวมตัวตนเดิม / เข้าร่วม) ─── */}
      {mode === 'join' && (
        <div className="relative z-10 w-full max-w-[380px] mx-auto animate-fadeIn">
          <div className="relative p-2 sm:p-3 space-y-3.5">
            {/* Back Header */}
            <div className="flex items-center justify-between pb-2 border-b border-sky-950/60">
              <button
                type="button"
                onClick={() => {
                  if (joinUserMode !== 'choose') {
                    setJoinUserMode('choose');
                  } else if (joinCode) {
                    setJoinCode('');
                    setMemberName('');
                    setJoinUserMode('choose');
                  } else {
                    setJoinCode('');
                    setMemberName('');
                    setJoinUserMode('choose');
                    setMode('select');
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-sky-300 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-sky-300" />
                <span>&lt; ย้อนกลับ</span>
              </button>
              <span className="text-[10px] font-mono text-sky-400/70 tracking-widest uppercase">
                /// SELECT TEAM & IDENTITY
              </span>
            </div>

            {!joinCode ? (
              <>
                <div className="text-center space-y-1">
                  <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-tight">
                    เลือกกลุ่มของคุณ
                  </h2>
                  <p className="text-[11.5px] text-sky-300/75">
                    แตะเลือกกลุ่มเพื่อสวมตัวตนเดิมเล่นต่อ หรือเข้าร่วมเป็นสมาชิกใหม่
                  </p>
                </div>

                {/* Team Cards List */}
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {teamsList.length === 0 ? (
                    <div className="py-6 text-center text-xs text-sky-200/60 font-mono">
                      -- ยังไม่มีกลุ่มในห้องนี้ --
                    </div>
                  ) : (
                    teamsList.map((team) => {
                      const membersCount = (team.members || []).length;
                      const isFull = membersCount >= 5;

                      return (
                        <div
                          key={team.id}
                          onClick={() => {
                            setJoinCode(team.code);
                            setJoinUserMode('choose');
                          }}
                          className="w-full py-3.5 px-4 rounded-[4px] cyber-glass-btn flex items-center justify-between transition-all duration-200 cursor-pointer hover:border-sky-400/80 active:scale-98"
                        >
                          {/* Left: Team Name */}
                          <span className="font-serif font-bold text-sm sm:text-base text-white tracking-wide">
                            {team.name}
                          </span>

                          {/* Right: Member Count */}
                          <span
                            className={`text-xs font-mono font-medium ${
                              isFull ? 'text-rose-400 font-bold' : 'text-sky-300/80'
                            }`}
                          >
                            {isFull ? '5/5 คน (เต็ม)' : `${membersCount}/5 คน`}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              (() => {
                const selectedTeam = teamsList.find((t) => t.code === joinCode);
                if (!selectedTeam) return null;
                const hasMembers = selectedTeam.members && selectedTeam.members.length > 0;
                const canAddNew = selectedTeam.members.length < 5;

                return (
                  <div className="space-y-4 pt-1 animate-fadeIn">
                    {/* Big Prominent Team Title (ทีม อาฟู่ ตัวใหญ่) */}
                    <div className="text-center space-y-1 py-1">
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-white tracking-wide drop-shadow-[0_0_25px_rgba(125,211,252,0.4)]">
                        ทีม {selectedTeam.name}
                      </h2>
                    </div>

                    {/* Step 1: Choice Buttons (ยังไม่โผล่ฟอร์มจนกว่าจะกดเลือก) */}
                    {joinUserMode === 'choose' && (
                      <div className="space-y-3 pt-2">
                        <div className="text-center pb-0.5">
                          <span className="text-xs text-sky-300/80 font-sans font-medium">
                            เลือกรูปแบบการเข้าสู่กลุ่ม
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* Option 1: เคยสร้าง User แล้ว */}
                          <button
                            type="button"
                            onClick={() => setJoinUserMode('existing')}
                            disabled={!hasMembers}
                            className={`py-3.5 px-3 rounded-[4px] cyber-glass-btn flex flex-col items-center justify-center gap-1.5 transition active:scale-[0.98] ${
                              !hasMembers
                                ? 'opacity-40 cursor-not-allowed border-sky-950/40'
                                : 'cursor-pointer hover:border-sky-400/80'
                            }`}
                          >
                            <UserCheck className="w-5 h-5 text-sky-400" />
                            <span className="text-xs sm:text-sm font-serif font-bold text-white">
                              เคยสร้าง User แล้ว
                            </span>
                            <span className="text-[10px] text-sky-300/60 font-sans">
                              {hasMembers ? `สวมตัวตน (${selectedTeam.members.length} คน)` : 'ยังไม่มีสมาชิก'}
                            </span>
                          </button>

                          {/* Option 2: สร้างบัญชีใหม่ */}
                          <button
                            type="button"
                            onClick={() => setJoinUserMode('new')}
                            disabled={!canAddNew}
                            className={`py-3.5 px-3 rounded-[4px] cyber-glass-btn flex flex-col items-center justify-center gap-1.5 transition active:scale-[0.98] ${
                              !canAddNew
                                ? 'opacity-40 cursor-not-allowed border-sky-950/40'
                                : 'cursor-pointer hover:border-sky-400/80'
                            }`}
                          >
                            <UserPlus className="w-5 h-5 text-amber-400" />
                            <span className="text-xs sm:text-sm font-serif font-bold text-white">
                              สร้างบัญชีใหม่
                            </span>
                            <span className="text-[10px] text-sky-300/60 font-sans">
                              {canAddNew ? 'เข้าร่วมเป็นสมาชิกใหม่' : 'กลุ่มเต็มแล้ว (5/5)'}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                  {/* Step 2A: เคยสร้าง User แล้ว (สวมตัวตน) */}
                  {joinUserMode === 'existing' && (
                    <div className="space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between pb-1">
                        <button
                          type="button"
                          onClick={() => setJoinUserMode('choose')}
                          className="inline-flex items-center gap-1 text-xs text-sky-300 hover:text-white transition font-mono cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>&lt; เลือกวิธีอื่น</span>
                        </button>
                        <span className="text-[11px] text-sky-300/80 font-sans font-medium">
                          เลือกชื่อของคุณเพื่อสวมตัวตน
                        </span>
                      </div>

                      {/* Grid 3 Columns with Square Cards (สี่เหลี่ยมจัตุรัส แถวละ 3 ไอคอน user + ชื่อ user) */}
                      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 pt-1">
                        {selectedTeam.members.map((m, mIdx) => (
                          <button
                            key={m.id || mIdx}
                            type="button"
                            onClick={() =>
                              onReclaimIdentity
                                ? onReclaimIdentity(selectedTeam.id, m.id)
                                : onJoinTeam(selectedTeam.code, m.name)
                            }
                            disabled={isLoading}
                            className="aspect-square p-2.5 rounded-[4px] cyber-glass-btn flex flex-col items-center justify-center gap-2 transition-all duration-200 cursor-pointer hover:border-sky-400 active:scale-95 group text-center select-none"
                          >
                            <User className="w-8 h-8 sm:w-9 sm:h-9 text-sky-300 group-hover:text-white transition-all drop-shadow-[0_0_12px_rgba(125,211,252,0.6)] stroke-[1.6]" />

                            <span className="font-serif font-bold text-xs sm:text-sm text-white group-hover:text-cyan-200 truncate max-w-full px-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                              {m.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2B: สร้างบัญชีใหม่ */}
                  {joinUserMode === 'new' && (
                    <div className="space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between pb-1">
                        <button
                          type="button"
                          onClick={() => setJoinUserMode('choose')}
                          className="inline-flex items-center gap-1 text-xs text-sky-300 hover:text-white transition font-mono cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>&lt; เลือกวิธีอื่น</span>
                        </button>
                        <span className="text-[11px] text-sky-300/80 font-sans font-medium">
                          ระบุชื่อเพื่อสร้างบัญชีใหม่
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="พิมพ์ชื่อของคุณ (สมาชิกใหม่)"
                          value={memberName}
                          onChange={(e) => setMemberName(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && memberName.trim() && !isLoading) {
                              e.preventDefault();
                              onJoinTeam(selectedTeam.code, memberName);
                            }
                          }}
                          className="flex-1 py-3 px-4 rounded-[4px] cyber-glass-btn text-xs sm:text-sm font-serif text-white placeholder-sky-300/40 focus:outline-none focus:border-sky-300 focus:ring-1 focus:ring-sky-300 transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => onJoinTeam(selectedTeam.code, memberName)}
                          disabled={isLoading || !memberName.trim()}
                          className={`px-5 py-3 rounded-[4px] cyber-glass-btn-gold text-xs font-bold font-serif shrink-0 cursor-pointer transition active:scale-95 ${
                            isLoading || !memberName.trim() ? 'opacity-40 cursor-not-allowed' : 'text-white hover:text-amber-200'
                          }`}
                        >
                          {isLoading ? '...' : 'เข้าร่วม ➔'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })())}
          </div>
        </div>
      )}
    </div>
  );
};
