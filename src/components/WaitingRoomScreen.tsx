'use client';

import React, { useState, useEffect } from 'react';
import { Users, LogOut, Loader2, Crown, Sparkles, Pencil, Check, X } from 'lucide-react';
import { GameSessionState, TeamState } from '@/data/types';

interface WaitingRoomScreenProps {
  session: GameSessionState;
  myTeam: TeamState;
  myMemberId: string | null;
  onLeaveTeam: () => Promise<void>;
  onUpdateTeamName?: (newName: string) => Promise<void>;
  onUpdateMemberName?: (newName: string) => Promise<void>;
  isLoading: boolean;
}

export const WaitingRoomScreen: React.FC<WaitingRoomScreenProps> = ({
  session,
  myTeam,
  myMemberId,
  onLeaveTeam,
  onUpdateTeamName,
  onUpdateMemberName,
  isLoading,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(myTeam.name);
  const [isSaving, setIsSaving] = useState(false);

  const [isEditingMember, setIsEditingMember] = useState(false);
  const [memberNameInput, setMemberNameInput] = useState('');
  const [isSavingMember, setIsSavingMember] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setNameInput(myTeam.name);
    }
  }, [myTeam.name, isEditing]);

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === myTeam.name) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      if (onUpdateTeamName) {
        await onUpdateTeamName(trimmed);
      } else {
        await fetch('/api/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_team_name',
            sessionId: session.sessionId,
            teamId: myTeam.id,
            newName: trimmed,
          }),
        });
      }
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMemberName = async () => {
    const trimmed = memberNameInput.trim();
    if (!trimmed || !myMemberId) {
      setIsEditingMember(false);
      return;
    }
    setIsSavingMember(true);
    try {
      if (onUpdateMemberName) {
        await onUpdateMemberName(trimmed);
      } else {
        await fetch('/api/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_member_name',
            sessionId: session.sessionId,
            teamId: myTeam.id,
            memberId: myMemberId,
            newName: trimmed,
          }),
        });
      }
      setIsEditingMember(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingMember(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 max-w-lg mx-auto select-none animate-fadeIn text-[#e0f2fe] relative overflow-hidden font-sans">
      {/* ── Soft Comfortable Cyber Grid Background (ตารางนุ่มนวล ไม่แสบตา) ── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(125,211,252,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(125,211,252,0.06)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_85%_at_50%_45%,transparent_20%,#030712_95%)] pointer-events-none z-0" />

      {/* ── Ambient Volumetric Spotlight Glow ── */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-950/20 blur-[100px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-950/15 blur-[90px] rounded-full pointer-events-none z-0" />

      {/* Header */}
      <div className="relative z-10 w-full text-center space-y-2 mb-5">
        {/* Top Frameless Room Code & System Bar */}
        <div className="flex items-center justify-between text-xs font-mono text-sky-300 px-1 pb-1">
          <div className="flex items-center gap-2">
            <span className="text-sky-200/90 font-sans text-xs">รหัสห้อง:</span>
            <strong className="font-mono text-[#f5c768] font-black text-base sm:text-lg tracking-widest drop-shadow-[0_0_8px_rgba(245,199,104,0.5)]">
              {session.sessionCode}
            </strong>
          </div>

          <span className="text-[10px] font-mono text-sky-400/70 tracking-[0.2em] uppercase">
            /// WAITING ROSTER
          </span>
        </div>

        {/* Team Name + Pencil Edit Button */}
        {isEditing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveName();
            }}
            className="flex items-center justify-center gap-2 max-w-sm mx-auto animate-fadeIn py-1"
          >
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={25}
              autoFocus
              className="flex-1 py-2 px-3.5 rounded-[4px] cyber-glass-btn text-center text-lg sm:text-2xl font-serif font-black text-white placeholder-sky-300/40 focus:outline-none focus:border-sky-300 focus:ring-1 focus:ring-sky-300 transition-all duration-200"
              placeholder="กรอกชื่อกลุ่มใหม่..."
              disabled={isSaving}
            />
            <button
              type="submit"
              disabled={isSaving || !nameInput.trim()}
              className="p-2.5 rounded-[4px] cyber-glass-btn-gold text-white hover:text-amber-200 transition active:scale-95 cursor-pointer disabled:opacity-50 shrink-0 flex items-center justify-center"
              title="บันทึกชื่อกลุ่ม"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setNameInput(myTeam.name);
                setIsEditing(false);
              }}
              disabled={isSaving}
              className="p-2.5 rounded-[4px] cyber-glass-btn text-white hover:text-cyan-200 transition active:scale-95 cursor-pointer shrink-0 flex items-center justify-center"
              title="ยกเลิก"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="inline-flex items-center justify-center gap-2 sm:gap-2.5 max-w-full px-2 group">
            <h1 className="text-2xl sm:text-4xl font-serif font-black text-white tracking-tight drop-shadow-[0_0_20px_rgba(125,211,252,0.3)] truncate">
              {myTeam.name}
            </h1>
            <button
              type="button"
              onClick={() => {
                setNameInput(myTeam.name);
                setIsEditing(true);
              }}
              className="p-1.5 sm:p-2 rounded-full text-sky-400/70 hover:text-sky-200 hover:bg-sky-500/20 transition active:scale-90 cursor-pointer shrink-0"
              title="เปลี่ยนชื่อกลุ่ม"
            >
              <Pencil className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          </div>
        )}

        {/* Glowing Tech Accent Line */}
        <div className="relative pt-1 flex items-center justify-center">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-sky-400/50 to-transparent shadow-[0_0_8px_rgba(125,211,252,0.4)]" />
          <span className="absolute px-3 bg-[#030712] text-[9.5px] font-mono text-sky-300/80 tracking-widest uppercase">
            /// TEAM ROSTER READY
          </span>
        </div>
      </div>

      {/* Main Frameless Content */}
      <div className="relative z-10 w-full max-w-[360px] mx-auto space-y-5">
        {/* Member Roster (รายชื่อสมาชิก คลีน ไร้กรอบ) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs pb-1.5 border-b border-sky-950/70">
            <span className="font-medium text-sky-300/80 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-300" />
              สมาชิกในกลุ่ม
            </span>
            <span className="font-bold text-[#f5c768] font-mono">
              {myTeam.members.length} / 5 คน
            </span>
          </div>

          <div className="space-y-1.5">
            {myTeam.members.map((member, idx) => {
              const isCurrent = member.id === myMemberId;
              const isLeader = idx === 0;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-2 px-1 text-[#e0f2fe]"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* ไอคอนมงกุฎเฉพาะหัวหน้ากลุ่มเท่านั้น */}
                    {isLeader && (
                      <Crown className="w-4 h-4 text-amber-400 drop-shadow-[0_0_6px_rgba(245,199,104,0.6)] shrink-0" />
                    )}

                    {isCurrent && isEditingMember ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSaveMemberName();
                        }}
                        className="flex items-center gap-1.5 flex-1 animate-fadeIn"
                      >
                        <input
                          type="text"
                          value={memberNameInput}
                          onChange={(e) => setMemberNameInput(e.target.value)}
                          maxLength={20}
                          autoFocus
                          className="px-2.5 py-1 rounded-[4px] cyber-glass-btn text-xs sm:text-sm font-medium text-white placeholder-sky-300/40 focus:outline-none focus:border-sky-300 w-32 sm:w-40"
                          placeholder="พิมพ์ชื่อของคุณ..."
                          disabled={isSavingMember}
                        />
                        <button
                          type="submit"
                          disabled={isSavingMember || !memberNameInput.trim()}
                          className="p-1.5 rounded-[4px] cyber-glass-btn-gold text-white hover:text-amber-200 transition active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center"
                          title="บันทึกชื่อ"
                        >
                          {isSavingMember ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingMember(false)}
                          disabled={isSavingMember}
                          className="p-1.5 rounded-[4px] cyber-glass-btn text-white hover:text-cyan-200 transition active:scale-95 cursor-pointer flex items-center justify-center"
                          title="ยกเลิก"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`text-sm font-medium truncate ${isCurrent ? 'text-white font-bold' : 'text-sky-100'}`}>
                          {member.name}
                        </span>
                        {isCurrent && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setMemberNameInput(member.name);
                                setIsEditingMember(true);
                              }}
                              className="p-1 rounded-full text-sky-400/70 hover:text-sky-200 hover:bg-sky-500/20 transition active:scale-90 cursor-pointer shrink-0"
                              title="เปลี่ยนชื่อของคุณ"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-400/40 px-1.5 py-0.5 rounded font-mono font-medium shrink-0">
                              คุณ
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-sky-400/50 font-mono shrink-0 pl-2">#{idx + 1}</span>
                </div>
              );
            })}

            {/* Empty slots placeholders (คลีน ไร้กรอบหนา) */}
            {Array.from({ length: Math.max(0, 5 - myTeam.members.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center justify-start py-1.5 px-1 text-xs text-sky-400/30 font-mono"
              >
                <span className="mr-2">+</span>
                <span>รอเพื่อนเข้าร่วมกลุ่ม...</span>
              </div>
            ))}
          </div>
        </div>

        {/* 🌟 สรุปเนื้อหาและขั้นตอนการเล่นเกมคร่าว ๆ (มุมแหลม, โปร่งใส Glassmorphism, Inner Glow กระพริบช้า ๆ อ่อนโยน, เส้นขอบล่างวิ่งไปมา) */}
        <div className="relative p-4 pb-5 rounded-none bg-[#061224]/45 border border-sky-400/35 animate-gentle-inner-glow backdrop-blur-2xl space-y-2.5 text-left overflow-hidden">
          {/* Top Subtle Gloss Accent */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-sky-300/50 to-transparent pointer-events-none" />

          {/* 🌟 เส้นขอบล่างเรืองแสง แอนิเมชันวิ่งไปมาซ้าย-ขวาอย่างละมุน */}
          <div className="absolute inset-x-0 bottom-0 h-[2.5px] bg-sky-950/90 overflow-hidden pointer-events-none">
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_12px_rgba(56,189,248,0.9),0_0_24px_rgba(56,189,248,0.7)] animate-smooth-beam" />
          </div>

          <div className="space-y-2.5 text-[13px] sm:text-[13.5px] text-sky-100/90 font-light leading-relaxed font-sans">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 min-w-[20px] min-h-[20px] aspect-square rounded-none bg-sky-950/90 border border-sky-400/70 text-sky-300 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5 font-normal shadow-[inset_0_0_4px_rgba(56,189,248,0.3)]">
                1
              </span>
              <div>
                <strong className="text-white font-normal">วิเคราะห์โจทย์ห้อง:</strong> เมื่อเริ่มเกม แต่ละกลุ่มจะได้รับสุ่มห้องนิทรรศการประวัติศาสตร์ 1 ใน 8 ยุคสมัย
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 min-w-[20px] min-h-[20px] aspect-square rounded-none bg-sky-950/90 border border-sky-400/70 text-sky-300 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5 font-normal shadow-[inset_0_0_4px_rgba(56,189,248,0.3)]">
                2
              </span>
              <div>
                <strong className="text-white font-normal">บริหารงบประมาณ:</strong> เลือกซื้อรูปปั้นบุคคลสำคัญ การ์ดหลักฐาน และป้ายเรื่องราวให้สอดคล้องกับยุคสมัยที่ได้รับ (ระวังหลักฐานปลอมหลอก!)
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 min-w-[20px] min-h-[20px] aspect-square rounded-none bg-sky-950/90 border border-sky-400/70 text-sky-300 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5 font-normal shadow-[inset_0_0_4px_rgba(56,189,248,0.3)]">
                3
              </span>
              <div>
                <strong className="text-white font-normal">จัดนิทรรศการ:</strong> จัดวางวัตถุจัดแสดง และตรวจสอบความถูกต้องของรูปปั้นและหลักฐานว่าตรงกับโจทย์ที่ได้รับหรือไม่
              </div>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2 py-2 text-xs font-medium text-sky-300 font-sans">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-300" />
          <span>กำลังรอครูผู้สอนกดเริ่มเกม...</span>
        </div>

        {/* Leave Team Button */}
        <div className="pt-2 text-center border-t border-sky-950/60">
          <button
            onClick={onLeaveTeam}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-400/80 hover:text-rose-400 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>&lt; ออกจากกลุ่ม / เปลี่ยนกลุ่ม</span>
          </button>
        </div>
      </div>
    </div>
  );
};
