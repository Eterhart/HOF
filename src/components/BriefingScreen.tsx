'use client';

import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, FileText, AlertTriangle, Coins, Target, Landmark, BookOpen } from 'lucide-react';
import { TeamState, StatueItem, EvidenceItem } from '@/data/types';
import { EXHIBITION_ROOMS, STATUE_ITEMS, EVIDENCE_ITEMS } from '@/data/gameData';

interface BriefingScreenProps {
  myTeam: TeamState;
  onEnterMarket: () => void;
}

export const BriefingScreen: React.FC<BriefingScreenProps> = ({ myTeam, onEnterMarket }) => {
  const room = EXHIBITION_ROOMS.find((r) => r.id === myTeam.roomId) || EXHIBITION_ROOMS[0];

  // Target items for this specific room
  const targetStatues = STATUE_ITEMS.filter((s) => room.targetStatueIds.includes(s.id));
  const targetEvidences = EVIDENCE_ITEMS.filter((e) => room.targetEvidenceIds.includes(e.id));
  const primarySculpture = targetStatues[0] || STATUE_ITEMS[0];
  const primaryImage = primarySculpture.sculptureImage || primarySculpture.frontImage || `/sculptures/${primarySculpture.id}.webp`;

  return (
    <div className="relative w-full max-w-2xl mx-auto px-3 xs:px-4 sm:px-6 py-4 sm:py-6 space-y-5 select-none animate-fadeIn text-[#e0e6ed]">
      {/* ── TOP SCI-FI TITLE HEADER (Abyssal Chaos Style) ── */}
      <div className="flex items-center justify-between pt-1">
        {/* Stylized Cyan Cyber Title Bracket */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-cyan-950/40 border border-cyan-500/40 rounded-[4px] shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-xs animate-pulse">●</span>
            <span className="font-mono text-xs sm:text-sm font-bold tracking-[0.25em] text-cyan-300 uppercase">
              [ CASE FILE // {room.id} ]
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400/50 hidden xs:inline tracking-wider">
            SECTOR 0{room.roomNumber}
          </span>
        </div>

        {/* Level / Status Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#150a10] border border-rose-500/40 rounded-full text-right shadow-[0_0_12px_rgba(225,29,72,0.2)]">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          <span className="text-[11px] font-mono text-rose-300 font-semibold tracking-wider">
            BUDGET: ฿{myTeam.budget.toLocaleString()}
          </span>
        </div>
      </div>

      {/* ── TOP ROOM NAVIGATION PILL TABS ── */}
      <div className="w-full grid grid-cols-2 gap-2 bg-[#0d131f]/80 p-1 rounded-lg border border-cyan-900/40">
        <div className="py-2 px-3 bg-gradient-to-r from-cyan-950/80 to-[#102035]/90 rounded border border-cyan-500/40 text-center shadow-[inset_0_0_10px_rgba(6,182,212,0.2)]">
          <div className="text-[10px] font-mono text-cyan-400/70 tracking-widest uppercase">
            EXHIBITION ROOM
          </div>
          <div className="text-xs sm:text-sm font-bold text-white font-serif tracking-wide truncate">
            {room.nameTh}
          </div>
        </div>

        <div className="py-2 px-3 bg-[#080d16]/70 rounded border border-cyan-900/30 text-center flex flex-col justify-center">
          <div className="text-[10px] font-mono text-rose-400/70 tracking-widest uppercase">
            HISTORICAL ERA
          </div>
          <div className="text-xs sm:text-sm font-mono font-medium text-rose-200 truncate">
            {room.historicalPeriod}
          </div>
        </div>
      </div>

      {/* ── 3D HOLOGRAPHIC DIORAMA ISOMETRIC CUBE CONTAINER ── */}
      <div className="relative w-full h-[270px] sm:h-[310px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#09101d] via-[#050912] to-[#08050c] border border-cyan-500/30 shadow-[0_15px_45px_rgba(0,0,0,0.85)] flex flex-col items-center justify-center isolate">
        {/* Background Cyber Grid & Nebula Rays */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

        {/* Ambient Holographic Ring */}
        <div className="absolute top-8 w-44 sm:w-56 h-44 sm:h-56 rounded-full border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.15)] animate-pulse pointer-events-none" />

        {/* Floating Holographic Sculpture & Diamond Grid Base */}
        <div className="relative z-10 flex flex-col items-center -mt-3">
          {/* Sculpture Floating Image */}
          <div className="relative w-28 h-32 sm:w-36 sm:h-40 flex items-center justify-center transition-transform hover:scale-105 duration-300">
            <img
              src={primaryImage}
              alt={primarySculpture.nameTh}
              className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_25px_rgba(6,182,212,0.5)] contrast-110"
              loading="eager"
            />
            {/* Soft Halo Light */}
            <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-xl pointer-events-none" />
          </div>

          {/* Isometric Glowing Laser Platform Grid Base */}
          <div
            className="w-48 sm:w-60 h-10 sm:h-12 -mt-4 shadow-[0_0_20px_rgba(6,182,212,0.4)] relative"
            style={{
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              background: 'linear-gradient(135deg, rgba(6,182,212,0.4) 0%, rgba(14,165,233,0.15) 50%, rgba(225,29,72,0.3) 100%)',
              border: '1px solid rgba(6,182,212,0.6)',
            }}
          >
            <div className="absolute inset-1 border border-cyan-300/40 opacity-70" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9]" />
            </div>
          </div>
        </div>

        {/* Holographic Watermark Tag */}
        <div className="absolute bottom-2.5 right-3 font-mono text-[9px] text-cyan-400/50 tracking-widest pointer-events-none">
          SYSTEM: 3D DIORAMA // TARGET: 0{room.roomNumber}
        </div>
      </div>

      {/* ── CURATOR NARRATIVE AUDIO DIALOGUE BOX (สไตล์กล่องคำพูด AI) ── */}
      <div className="relative p-4 rounded-xl bg-gradient-to-r from-[#0c1626]/90 via-[#0a1220]/95 to-[#120a14]/90 border border-cyan-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.6)] space-y-2">
        <div className="flex items-center gap-2 text-cyan-300">
          {/* Pixel Face Assistant Icon */}
          <div className="w-6 h-6 rounded-md bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-xs font-mono shadow-[0_0_8px_rgba(6,182,212,0.4)]">
            (•‿•)
          </div>
          <span className="text-xs font-mono font-bold tracking-wider text-cyan-200 uppercase">
            CURATOR&apos;S VOICE LOG // บันทึกเสียงภัณฑารักษ์
          </span>
          {/* Mini Animated Equalizer */}
          <div className="ml-auto flex items-end gap-0.5 h-3">
            <span className="w-0.5 h-2 bg-cyan-400 animate-pulse" />
            <span className="w-0.5 h-3 bg-cyan-400 animate-pulse delay-75" />
            <span className="w-0.5 h-1.5 bg-cyan-400 animate-pulse delay-150" />
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#d4e1f0] leading-relaxed font-sans italic pl-1 border-l-2 border-cyan-500/50">
          &ldquo;{room.curatorNarrative}&rdquo;
        </p>
      </div>

      {/* ── TACTICAL OBJECTIVES & SCORING SYSTEM (Translucent Glassmorphism & Inner Glow) ── */}
      {/* ── MISSION INTELLIGENCE: 2-COLUMN LAYOUT (ซ้าย TARGET / ขวา REWARDS) ── */}
      <div className="relative rounded-2xl p-4 sm:p-5 bg-[#061224]/35 backdrop-blur-xl border border-cyan-400/30 animate-hologram-glow">
        {/* Hologram Corner Tech Marks */}
        <div className="absolute top-1 left-2.5 text-[10px] text-cyan-400/60 font-mono select-none">+</div>
        <div className="absolute top-1 right-2.5 text-[10px] text-cyan-400/60 font-mono select-none">+</div>
        <div className="absolute bottom-1 left-2.5 text-[10px] text-cyan-400/40 font-mono select-none">+</div>
        <div className="absolute bottom-1 right-2.5 text-[10px] text-cyan-400/40 font-mono select-none">+</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* ══════════════════════════════════════════════════════════════════
             LEFT COLUMN: TARGET COLLECTION
             ══════════════════════════════════════════════════════════════════ */}
          <div className="space-y-2.5 flex flex-col justify-between">
            <div>
              {/* Category Tag */}
              <div className="text-[9px] font-mono text-cyan-400/80 tracking-widest uppercase pl-2 flex items-center gap-1.5 mb-1.5">
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                <span>ANONYMOUS PLATFORM</span>
              </div>

              {/* Heading Ribbon */}
              <div className="relative flex items-center justify-between py-1.5 px-3 rounded-l-md bg-gradient-to-r from-blue-900/60 via-cyan-900/35 to-transparent border-l-2 border-cyan-400">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-300" />
                  <h3 className="font-serif font-bold text-sm sm:text-base text-white tracking-wide">
                    Target Collection
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[9px] font-mono font-semibold text-cyan-300">
                  9 ITEMS
                </span>
              </div>
            </div>

            {/* 3 Vertical Stacked Cards (Unified Cyan-Navy Cyber Style) */}
            <div className="space-y-2 pt-0.5">
              {/* Statues Card */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-b from-[#081b33]/90 via-[#051326]/95 to-[#020a17]/95 border border-cyan-500/40 shadow-[inset_0_1px_0_rgba(56,189,248,0.2),0_4px_12px_rgba(0,0,0,0.5)] flex items-center gap-3.5">
                <div className="text-3xl sm:text-4xl font-mono font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] shrink-0 leading-none">
                  4
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-serif font-bold text-white">
                    <Landmark className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">รูปปั้นบุคคลสำคัญ</span>
                  </div>
                  <p className="text-[11px] text-cyan-100/70 font-sans leading-tight">
                    ประมูลรูปปั้นบุคคลที่ตรงกับห้องของคุณ
                  </p>
                </div>
              </div>

              {/* Evidence Card */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-b from-[#081b33]/90 via-[#051326]/95 to-[#020a17]/95 border border-cyan-500/40 shadow-[inset_0_1px_0_rgba(56,189,248,0.2),0_4px_12px_rgba(0,0,0,0.5)] flex items-center gap-3.5">
                <div className="text-3xl sm:text-4xl font-mono font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] shrink-0 leading-none">
                  4
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-serif font-bold text-white">
                    <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">หลักฐานจริง</span>
                  </div>
                  <p className="text-[11px] text-cyan-100/70 font-sans leading-tight">
                    สแกน QR คัดกรอง <span className="text-cyan-400 font-medium">(ระวังของปลอม)</span>
                  </p>
                </div>
              </div>

              {/* Stories Card */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-b from-[#081b33]/90 via-[#051326]/95 to-[#020a17]/95 border border-cyan-500/40 shadow-[inset_0_1px_0_rgba(56,189,248,0.2),0_4px_12px_rgba(0,0,0,0.5)] flex items-center gap-3.5">
                <div className="text-3xl sm:text-4xl font-mono font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] shrink-0 leading-none">
                  1
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-serif font-bold text-white">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">ป้ายเรื่องราว</span>
                  </div>
                  <p className="text-[11px] text-cyan-100/70 font-sans leading-tight">
                    ป้ายประวัติศาสตร์ประกอบนิทรรศการ
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
             RIGHT COLUMN: DEDUCTION REWARDS
             ══════════════════════════════════════════════════════════════════ */}
          <div className="space-y-2.5 flex flex-col justify-between pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-cyan-900/40 md:pl-4">
            <div>
              {/* Category Tag */}
              <div className="text-[9px] font-mono text-cyan-400/80 tracking-widest uppercase pl-2 flex items-center gap-1.5 mb-1.5">
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                <span>SCORING RULES</span>
              </div>

              {/* Heading Ribbon */}
              <div className="relative flex items-center justify-between py-1.5 px-3 rounded-l-md bg-gradient-to-r from-blue-900/60 via-cyan-900/35 to-transparent border-l-2 border-cyan-400">
                <h3 className="font-serif font-bold text-sm sm:text-base text-white tracking-wide">
                  Deduction Rewards
                </h3>
                <span className="text-[10px] font-mono text-cyan-300/70 uppercase tracking-wider">
                  RULES
                </span>
              </div>
            </div>

            {/* 4 Scoring Cards Grid (2x2) (Unified Cyan-Navy Cyber Style) */}
            <div className="grid grid-cols-2 gap-2.5 pt-0.5 h-full">
              {/* Reward 1 */}
              <div className="p-3 rounded-xl bg-gradient-to-b from-[#081b33]/90 via-[#051326]/95 to-[#020a17]/95 border border-cyan-500/40 shadow-[inset_0_1px_0_rgba(56,189,248,0.2),0_4px_12px_rgba(0,0,0,0.5)] flex flex-col justify-center text-center space-y-1">
                <span className="text-base sm:text-lg font-mono font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">+1,000 pt</span>
                <span className="text-xs text-white font-serif font-bold">รูปปั้นตรงยุค</span>
                <span className="text-[10px] text-cyan-100/70 font-sans">รูปปั้นตรงกับธีมห้อง</span>
              </div>

              {/* Reward 2 */}
              <div className="p-3 rounded-xl bg-gradient-to-b from-[#081b33]/90 via-[#051326]/95 to-[#020a17]/95 border border-cyan-500/40 shadow-[inset_0_1px_0_rgba(56,189,248,0.2),0_4px_12px_rgba(0,0,0,0.5)] flex flex-col justify-center text-center space-y-1">
                <span className="text-base sm:text-lg font-mono font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">+1,000 pt</span>
                <span className="text-xs text-white font-serif font-bold">หลักฐานจริง</span>
                <span className="text-[10px] text-cyan-100/70 font-sans">เอกสารหลักฐานจริง</span>
              </div>

              {/* Penalty */}
              <div className="p-3 rounded-xl bg-gradient-to-b from-[#081b33]/90 via-[#051326]/95 to-[#020a17]/95 border border-cyan-500/40 shadow-[inset_0_1px_0_rgba(56,189,248,0.2),0_4px_12px_rgba(0,0,0,0.5)] flex flex-col justify-center text-center space-y-1">
                <span className="text-base sm:text-lg font-mono font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">−200 pt</span>
                <span className="text-xs text-white font-serif font-bold">หลักฐานเท็จ</span>
                <span className="text-[10px] text-cyan-100/70 font-sans">ระวังของปลอมแปลง</span>
              </div>

              {/* Bonus */}
              <div className="p-3 rounded-xl bg-gradient-to-b from-[#081b33]/90 via-[#051326]/95 to-[#020a17]/95 border border-cyan-500/40 shadow-[inset_0_1px_0_rgba(56,189,248,0.2),0_4px_12px_rgba(0,0,0,0.5)] flex flex-col justify-center text-center space-y-1">
                <span className="text-base sm:text-lg font-mono font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">โบนัส</span>
                <span className="text-xs text-white font-serif font-bold">งบประมาณเหลือ</span>
                <span className="text-[10px] text-cyan-100/70 font-sans">+1 คะแนน / $1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM LAUNCH ACTION BAR (Start Auction Button) ── */}
      <div className="pt-2 flex items-center justify-between gap-3 -mr-3 xs:-mr-4 sm:-mr-6">
        {/* Left Team Group Pill */}
        <div className="px-3.5 py-2.5 rounded-full bg-black/60 border border-cyan-800/50 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-mono text-cyan-300 font-medium">
            TEAM GROUP: {myTeam.members?.length || 1} PEOPLE
          </span>
        </div>

        {/* Right Crimson START CTA BUTTON (Flush to Right Screen Edge) */}
        <button
          onClick={onEnterMarket}
          className="group relative pl-6 sm:pl-8 pr-3 sm:pr-5 py-2 sm:py-2.5 flex items-center justify-between gap-4 sm:gap-6 border-r-4 border-r-rose-400 active:scale-[0.98] transition-all duration-300 cursor-pointer overflow-hidden select-none"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(153, 27, 27, 0.25) 30%, rgba(190, 18, 60, 0.75) 65%, rgba(225, 29, 72, 0.95) 100%)',
          }}
        >
          {/* Seamless Laser Lines on Top & Bottom fading from 0 to 100 */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/30 to-rose-400/90 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/30 to-rose-400/90 pointer-events-none" />

          {/* Gentle Shimmer Wave Moving Left to Right (ซ้ายไปขวา อ่อน ๆ เป็นคลื่น) */}
          <div className="absolute inset-y-0 w-3/5 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none animate-wave-ltr mix-blend-screen" />

          {/* Left Element: THE VOID >>> and Hazard Stripes */}
          <div className="flex flex-col items-start justify-center pr-2 pl-2">
            <div className="text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.18em] text-[#f5d061] uppercase drop-shadow-sm flex items-center gap-0.5">
              <span>THE VOID</span>
              <span className="text-[8px] opacity-80 tracking-tighter">&gt;&gt;&gt;</span>
            </div>
            <div className="text-[10px] sm:text-[11px] font-mono font-black text-rose-300/90 tracking-tighter leading-tight select-none">
              ///////
            </div>
          </div>

          {/* Center Element: Elegant Serif 'Start' */}
          <div className="font-serif font-bold text-xl sm:text-2xl text-amber-50 tracking-wider drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] group-hover:text-white transition-colors">
            Start
          </div>

          {/* Right Element: Large Double Chevron Arrow Banner */}
          <div className="flex items-center justify-center pl-2 text-rose-100 group-hover:translate-x-1 transition-transform duration-300">
            <svg
              className="w-6 h-7 sm:w-7 sm:h-8 fill-none stroke-current"
              viewBox="0 0 28 32"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Outer Chevron */}
              <path d="M6 4 L16 16 L6 28" className="text-white/60" />
              {/* Inner Chevron */}
              <path d="M14 4 L24 16 L14 28" className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
};

