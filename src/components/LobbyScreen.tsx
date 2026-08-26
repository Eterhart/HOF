'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Users, User, PlusCircle, LogIn, Sparkles, ArrowLeft, ArrowRight, Crown, Landmark, Flag, Gamepad2, UserCheck, UserPlus, X } from 'lucide-react';
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
  const [showNewUserModal, setShowNewUserModal] = useState(false);

  useEffect(() => {
    setJoinCode('');
    setMemberName('');
    setShowNewUserModal(false);
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
            <div className="w-[260px] max-w-full mx-auto space-y-1">
              <button
                type="button"
                onClick={() => session.phase === 'LOBBY' && teamsList.length < 8 && setMode('create')}
                disabled={session.phase !== 'LOBBY' || teamsList.length >= 8}
                className={`w-full py-3.5 px-4 rounded-[4px] cyber-glass-btn text-center block ${
                  session.phase !== 'LOBBY' || teamsList.length >= 8
                    ? 'opacity-40 cursor-not-allowed text-slate-400 pointer-events-none'
                    : 'text-white hover:text-cyan-100 cursor-pointer'
                }`}
              >
                <span className="text-sm sm:text-base font-serif font-bold tracking-wide">
                  {teamsList.length >= 8 ? 'ไม่สามารถสร้างทีมได้' : 'สร้างกลุ่มใหม่'}
                </span>
              </button>
              {teamsList.length >= 8 && session.phase === 'LOBBY' && (
                <p className="text-[11px] text-rose-400 font-mono text-center tracking-tight">
                  * ห้องนี้มีกลุ่มครบ 8 ทีมแล้ว
                </p>
              )}
            </div>

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
                เข้าร่วมทีม
              </span>
            </button>
          </div>

          {/* ── Return to Home Button (กลับสู่หน้าแรก - สไตล์เดียวกับ /// THE HALL OF FAME) ── */}
          {onExitSession && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onExitSession}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-400/70 hover:text-white tracking-[0.15em] transition-colors cursor-pointer active:scale-95 py-1 px-3"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-sky-400/70" />
                <span>กลับสู่หน้าแรก</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── MODE 2: FORM CREATE TEAM (สร้างกลุ่มใหม่) ─── */}
      {mode === 'create' && (
        <div className="relative z-10 w-full max-w-[360px] mx-auto animate-fadeIn">
          {teamsList.length >= 8 ? (
            <div className="relative p-4 text-center space-y-4">
              <div className="p-3 bg-amber-950/50 border border-amber-500/50 rounded-[4px] text-xs text-amber-200 space-y-1">
                <p className="font-bold">ห้องนี้สร้างกลุ่มครบ 8 ทีมแล้ว</p>
                <p className="text-amber-300/80">ไม่สามารถสร้างกลุ่มใหม่เพิ่มได้ กรุณาเลือกเข้าร่วมกลุ่มที่มีอยู่</p>
              </div>
              <button
                type="button"
                onClick={() => setMode('join')}
                className="w-[220px] max-w-full mx-auto py-3 px-4 rounded-[4px] cyber-glass-btn-gold text-center block text-white hover:text-[#fde68a] cursor-pointer"
              >
                <span className="text-sm font-serif font-bold tracking-wide">
                  ไปที่หน้าเข้าร่วมกลุ่ม ➔
                </span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="relative p-2 sm:p-3 space-y-4">
              {/* Back Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-sky-950/60">
                <button
                  type="button"
                  onClick={() => setMode('select')}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-sky-300 hover:text-white transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-sky-300" />
                  <span>ย้อนกลับ</span>
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
          )}
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
                  if (joinCode) {
                    setJoinCode('');
                    setMemberName('');
                    setShowNewUserModal(false);
                  } else {
                    setJoinCode('');
                    setMemberName('');
                    setShowNewUserModal(false);
                    setMode('select');
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-sky-300 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-sky-300" />
                <span>ย้อนกลับ</span>
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
                    แตะเลือกกลุ่มเพื่อสวมตัวตนเดิมเล่นต่อ หรือสร้าง User ใหม่
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
                            setMemberName('');
                            setShowNewUserModal(false);
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
                            {isFull ? 'เต็ม' : `${membersCount}/5 คน`}
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
                const members = selectedTeam.members || [];
                const canAddNew = members.length < 5;

                return (
                  <div className="space-y-3 pt-1 animate-fadeIn">
                    {/* Big Prominent Team Title */}
                    <div className="text-center space-y-1 py-1">
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-white tracking-wide drop-shadow-[0_0_25px_rgba(125,211,252,0.4)]">
                        {selectedTeam.name}
                      </h2>
                      <p className="text-[11px] text-sky-300/80 font-sans">
                        เลือก User เดิมเพื่อสวมตัวตน {canAddNew && 'หรือแตะ (+) เพื่อสร้าง User ใหม่'}
                      </p>
                    </div>

                    {/* Grid 3 Columns: Existing Members + Yellow Create New User Card */}
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-3 pt-1">
                      {/* 1. Existing Members */}
                      {members.map((m, mIdx) => (
                        <button
                          key={m.id || mIdx}
                          type="button"
                          onClick={() =>
                            onReclaimIdentity
                              ? onReclaimIdentity(selectedTeam.id, m.id)
                              : onJoinTeam(selectedTeam.code, m.name)
                          }
                          disabled={isLoading}
                          className="aspect-square p-2.5 rounded-[6px] cyber-glass-btn flex flex-col items-center justify-center gap-2 transition-all duration-200 cursor-pointer hover:border-sky-400 active:scale-95 group text-center select-none"
                        >
                          <User className="w-8 h-8 sm:w-9 sm:h-9 text-sky-300 group-hover:text-white transition-all drop-shadow-[0_0_12px_rgba(125,211,252,0.6)] stroke-[1.6]" />
                          <span className="font-serif font-bold text-xs sm:text-sm text-white group-hover:text-cyan-200 truncate max-w-full px-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                            {m.name}
                          </span>
                        </button>
                      ))}

                      {/* 2. Card: Create New User (Hidden if team has 5 members) */}
                      {canAddNew && (
                        <button
                          type="button"
                          onClick={() => {
                            setMemberName('');
                            setShowNewUserModal(true);
                          }}
                          disabled={isLoading}
                          className="aspect-square p-2.5 rounded-[6px] border-0 border-none bg-transparent hover:bg-white/5 flex flex-col items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-95 group text-center select-none shadow-none"
                        >
                          <UserPlus className="w-8 h-8 sm:w-9 sm:h-9 text-amber-400 group-hover:text-amber-200 transition-all drop-shadow-[0_0_12px_rgba(245,158,11,0.6)] stroke-[1.6]" />
                          <span className="font-serif font-bold text-xs sm:text-sm text-amber-300 group-hover:text-amber-100 truncate max-w-full px-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                            เพิ่ม
                          </span>
                        </button>
                      )}
                    </div>

                    {/* New User Creation Cyber Modal (สไตล์เดียวกับ แจ้งเตือนตลาดยังไม่เปิด) */}
                    {typeof document !== 'undefined' &&
                      showNewUserModal &&
                      createPortal(
                        <div
                          className="fixed inset-0 z-[99999999] bg-[#020617]/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
                          onClick={() => setShowNewUserModal(false)}
                        >
                          {/* Ambient volumetric blue glow */}
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(14,165,233,0.22),transparent_75%)] pointer-events-none" />

                          {/* Cyber Blue Glass Box (สไตล์เดียวกับ Game Overview / แจ้งเตือนตลาด) */}
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

                            {/* Icon Box */}
                            <div className="w-12 h-12 mx-auto rounded-none bg-sky-950/90 border border-sky-400/80 flex items-center justify-center shadow-[0_0_18px_rgba(56,189,248,0.5)]">
                              <UserPlus className="w-6 h-6 text-sky-300 animate-pulse" />
                            </div>

                            {/* Content */}
                            <div className="space-y-1.5">
                              <span className="text-[10.5px] font-mono text-sky-400 uppercase tracking-widest font-bold block">
                                /// CREATE NEW IDENTITY
                              </span>
                              <h3 className="text-xl sm:text-2xl font-serif font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(125,211,252,0.4)]">
                                พิมพ์ชื่อของคุณ
                              </h3>
                              <p className="text-xs sm:text-sm text-sky-200/90 font-sans leading-relaxed">
                                เข้าร่วมเป็นสมาชิกของทีม <strong className="text-white">&ldquo;{selectedTeam.name}&rdquo;</strong>
                              </p>
                            </div>

                            {/* Input Form */}
                            <div className="space-y-3 pt-1">
                              <input
                                type="text"
                                placeholder="USERNAME"
                                value={memberName}
                                onChange={(e) => setMemberName(e.target.value)}
                                autoFocus
                                maxLength={20}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && memberName.trim() && !isLoading) {
                                    e.preventDefault();
                                    onJoinTeam(selectedTeam.code, memberName.trim());
                                    setShowNewUserModal(false);
                                  }
                                }}
                                className="w-full py-2.5 px-4 rounded-none bg-sky-950/60 border border-sky-400/70 text-white font-serif text-xs sm:text-sm placeholder-sky-300/40 focus:outline-none focus:border-sky-300 focus:ring-1 focus:ring-sky-300 shadow-[inset_0_0_12px_rgba(56,189,248,0.15)] transition-all text-center"
                              />

                              {/* Action Buttons */}
                              <div className="grid grid-cols-2 gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setShowNewUserModal(false)}
                                  className="w-full py-2.5 px-3 rounded-none bg-slate-900/80 hover:bg-slate-800/80 border border-slate-600 text-slate-300 font-serif font-bold text-xs sm:text-sm transition active:scale-95 cursor-pointer"
                                >
                                  ยกเลิก
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (memberName.trim() && !isLoading) {
                                      onJoinTeam(selectedTeam.code, memberName.trim());
                                      setShowNewUserModal(false);
                                    }
                                  }}
                                  disabled={isLoading || !memberName.trim()}
                                  className={`w-full py-2.5 px-3 rounded-none bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400 text-sky-200 font-serif font-bold text-xs sm:text-sm transition active:scale-95 shadow-[0_0_15px_rgba(56,189,248,0.25)] ${
                                    isLoading || !memberName.trim()
                                      ? 'opacity-40 cursor-not-allowed'
                                      : 'cursor-pointer hover:text-white'
                                  }`}
                                >
                                  {isLoading ? 'กำลังเข้าร่วม...' : 'ยืนยันสร้างบัญชี ➔'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>,
                        document.body
                      )}
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
};
