'use client';

import React, { useState } from 'react';
import {
  Trophy,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Award,
  Layers,
  Search,
  Landmark,
  BookOpen,
  Gem,
  Coins,
  Star,
  FileText,
  FileSearch,
} from 'lucide-react';
import { GameSessionState } from '@/data/types';
import { EXHIBITION_ROOMS, STATUE_ITEMS, EVIDENCE_ITEMS } from '@/data/gameData';
import { STORY_PLACARDS_DATA } from '@/data/storyPlacardsData';

interface LeaderboardScreenProps {
  session: GameSessionState;
  onClose?: () => void;
  onResetGame?: () => void;
  myTeamId?: string;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  session,
  onClose,
  onResetGame,
  myTeamId,
}) => {
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const teams = Object.values(session.teams || {});
  const sortedTeams = [...teams].sort(
    (a, b) => (b.score?.totalScore ?? 0) - (a.score?.totalScore ?? 0)
  );

  const myTeam = teams.find((t) => t.id === myTeamId) || sortedTeams[0];
  const myRoom = EXHIBITION_ROOMS.find((r) => r.id === myTeam?.roomId);
  const myRank = sortedTeams.findIndex((t) => t.id === myTeam?.id) + 1;

  const statuesCount = myTeam?.statueInventory?.length ?? 0;
  const evidenceCount = myTeam?.evidenceInventory?.length ?? 0;
  const storiesCount = myTeam?.storyInventory?.length ?? 0;
  const totalItemsCount = statuesCount + evidenceCount + storiesCount;

  const statueDetails = myTeam?.score?.statueDetails || [];
  const evidenceDetails = myTeam?.score?.evidenceDetails || [];

  const correctStatuesCount = myRoom
    ? (myTeam?.statueInventory || []).filter((id) => myRoom.targetStatueIds.includes(id)).length
    : statueDetails.filter((s) => s.isMatch).length;

  const authenticEvidenceCount = myRoom
    ? (myTeam?.evidenceInventory || []).filter((id) => myRoom.targetEvidenceIds.includes(id)).length
    : evidenceDetails.filter((e) => e.isMatch && e.isAuthentic).length;

  const correctStoriesCount = myRoom
    ? (myTeam?.storyInventory || []).filter((id) => STORY_PLACARDS_DATA.find((s) => s.id === id)?.categoryId === myRoom.id).length
    : (myTeam?.storyInventory?.length ?? 0);

  const totalEvaluatedItems = statueDetails.length + evidenceDetails.length;
  const correctEvaluatedItems = correctStatuesCount + authenticEvidenceCount;

  // ── Missing Target Items (ไอเทมตรงตามโจทย์ที่ขาดหายไป - เฉลยเป็นสีเทา) ──
  const missingStatueIds = myRoom
    ? myRoom.targetStatueIds.filter((id) => !(myTeam?.statueInventory || []).includes(id))
    : [];

  const missingEvidenceIds = myRoom
    ? myRoom.targetEvidenceIds.filter((id) => !(myTeam?.evidenceInventory || []).includes(id))
    : [];

  const roomStoryIds = myRoom
    ? STORY_PLACARDS_DATA.filter((s) => s.categoryId === myRoom.id).map((s) => s.id)
    : [];
  const missingStoryIds = roomStoryIds.filter(
    (id) => !(myTeam?.storyInventory || []).includes(id)
  );

  const totalMissingCount = missingStatueIds.length + missingEvidenceIds.length + missingStoryIds.length;

  const accuracyPercent =
    totalEvaluatedItems > 0
      ? Math.round((correctEvaluatedItems / totalEvaluatedItems) * 100)
      : 0;

  const totalScore = myTeam?.score?.totalScore ?? 0;
  const ratingLabel =
    totalItemsCount === 0
      ? '• ไม่ได้จัดแสดง'
      : totalScore >= 800
      ? '▲ ระดับยอดเยี่ยม'
      : totalScore >= 400
      ? '▲ ระดับดีมาก'
      : totalScore > 200
      ? '▲ ระดับผ่านเกณฑ์'
      : '• รอเริ่มประเมิน';

  return (
    <div className="min-h-screen relative font-sans text-white select-none animate-fadeIn pb-20">
      {/* ── Seamless Fixed Cyber Blue Grid Background (ตรงตามหน้าแรก http://localhost:3000 100%) ── */}
      <div className="fixed inset-0 bg-[#030712] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(125,211,252,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(125,211,252,0.06)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_85%_85%_at_50%_45%,transparent_20%,#030712_95%)] pointer-events-none z-0" />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-950/20 blur-[100px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-blue-950/15 blur-[90px] rounded-full pointer-events-none z-0" />

      <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6 space-y-6 relative z-10">

      {/* ── 1. TOP SPEECH BUBBLE & ROBOT AVATAR (GLASSMORPHIC) ── */}
      <div className="relative z-10 flex items-start gap-3 sm:gap-4 max-w-xl mx-auto pt-1">
        {/* Cute Glowing Robot Avatar */}
        <div className="relative w-12 h-12 rounded-full bg-[#05111d]/90 backdrop-blur-md border-2 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.6)] flex flex-col items-center justify-center shrink-0">
          {/* Face */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_5px_#22d3ee]" />
            <span className="text-[10px] text-cyan-300 font-bold">◡</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_5px_#22d3ee]" />
          </div>
          {/* Audio Wave */}
          <div className="flex items-center gap-0.5">
            <span className="w-[1.5px] h-1.5 bg-cyan-400/70" />
            <span className="w-[1.5px] h-2 bg-cyan-400" />
            <span className="w-[1.5px] h-1 bg-cyan-400/50" />
            <span className="w-[1.5px] h-2.5 bg-cyan-300" />
            <span className="w-[1.5px] h-1.5 bg-cyan-400/70" />
          </div>
        </div>

        {/* Audio Wave Bar on top of Speech Bubble */}
        <div className="flex-1 space-y-1.5">
          {/* Waveform Line */}
          <div className="flex items-center gap-1 opacity-70 pl-2">
            <div className="w-1 h-2 bg-cyan-400/80 rounded-full animate-pulse" />
            <div className="w-1 h-3.5 bg-cyan-300 rounded-full" />
            <div className="w-1 h-1.5 bg-cyan-400/60 rounded-full" />
            <div className="w-1 h-3 bg-cyan-300 rounded-full" />
            <div className="w-1 h-2 bg-cyan-400/80 rounded-full" />
            <div className="w-20 h-[1px] bg-gradient-to-r from-cyan-400/60 to-transparent ml-1" />
          </div>

          {/* Translucent Sci-Fi Speech Bubble */}
          <div className="relative p-3.5 sm:p-4 rounded-[10px] bg-[#07172b]/75 backdrop-blur-xl border border-cyan-500/35 shadow-[0_0_20px_rgba(6,182,212,0.2)] text-xs sm:text-[13.5px] text-cyan-100 font-sans leading-relaxed">
            <p>
              การจัดแสดงนิทรรศการประวัติศาสตร์เสร็จสิ้นแล้ว คณะกรรมการได้ประเมินผลงานการจัดแสดงและสรุปคะแนนภัณฑารักษ์เรียบร้อย
            </p>
          </div>
        </div>
      </div>

      <div
        className="relative z-10 rounded-[12px] border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.12)] backdrop-blur-xl overflow-hidden p-5 sm:p-8 space-y-8 animate-gentle-inner-glow"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(7, 11, 18, 0.15) 0%, rgba(7, 11, 18, 0.45) 40%, rgba(7, 11, 18, 0.85) 70%, rgba(7, 11, 18, 0.98) 100%)',
        }}
      >
        {/* ── HEADER BANNER: DEDUCTION COMPLETED ── */}
        <div className="relative z-10 text-center space-y-2 pt-1">
          <div className="relative inline-block">
            <h1 className="relative font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-white to-red-200 tracking-[0.16em] uppercase drop-shadow-[0_0_15px_rgba(239,68,68,0.9)]">
              สรุปผลการจัดนิทรรศการ
            </h1>
          </div>

          <div className="text-cyan-300/80 font-serif text-xs sm:text-sm tracking-[0.2em]">
            — รายงานผลการประเมินภัณฑารักษ์ประจำห้องจัดแสดง —
          </div>

          <div className="font-mono text-[11px] sm:text-xs text-cyan-400/60 pt-1 flex items-center justify-center gap-2">
            <span>• โหมดการจัดแสดง: ปกติ</span>
            <span className="text-cyan-400/30">|</span>
            <span>
              ความสมบูรณ์ของห้องจัดแสดง: <strong className="text-cyan-200">{totalItemsCount}/9 ชิ้น</strong>
            </span>
            <span>•</span>
          </div>
        </div>

        {/* ── SECTION 1: SKILLS & CARDS BREAKDOWN ── */}
        <div className="relative z-10 space-y-3 pt-2">
          {/* Subtle Top Header Tag */}
          <div className="text-[10px] font-mono text-cyan-400/70 tracking-[0.18em] uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            • ระบบบันทึกข้อมูลพิพิธภัณฑ์
          </div>

          <p className="text-xs sm:text-[13.5px] text-cyan-100 font-sans tracking-wide leading-relaxed">
            กลุ่มของคุณได้จัดแสดงสิ่งของตรงตามโจทย์ <strong className="font-mono">{correctStatuesCount + authenticEvidenceCount + correctStoriesCount}</strong> ชิ้น{' '}
            {totalItemsCount - (correctStatuesCount + authenticEvidenceCount + correctStoriesCount) > 0 ? (
              <>
                และไม่ตรงตามโจทย์/หลักฐานเท็จ <strong className="font-mono">{totalItemsCount - (correctStatuesCount + authenticEvidenceCount + correctStoriesCount)}</strong> ชิ้น{' '}
                <span className="opacity-90">
                  (ประติมากรรมตรง {correctStatuesCount}/4, หลักฐานจริง {authenticEvidenceCount}/4, เรื่องราวตรง {correctStoriesCount}/1)
                </span>
              </>
            ) : (
              <span>
                (ถูกต้องตรงตามโจทย์ครบทุกชิ้น 100%)
              </span>
            )}
          </p>

          {/* Borderless Cyber Stat Vector Badges Row (No Boxes, Uniform Cyan Color) */}
          <div className="flex items-center justify-between overflow-x-auto py-2 gap-3 text-center custom-dark-scrollbar">
            {[
              { label: 'ตรงตามโจทย์', count: `${correctStatuesCount + authenticEvidenceCount + correctStoriesCount} ชิ้น`, icon: <Sparkles className="w-5 h-5 text-emerald-300" /> },
              { label: 'ไม่ตรงโจทย์/เท็จ', count: `${Math.max(0, totalItemsCount - (correctStatuesCount + authenticEvidenceCount + correctStoriesCount))} ชิ้น`, icon: <ShieldAlert className={`w-5 h-5 ${totalItemsCount - (correctStatuesCount + authenticEvidenceCount + correctStoriesCount) > 0 ? 'text-rose-400' : 'text-cyan-300'}`} /> },
              { label: 'ความถูกต้อง', count: `${accuracyPercent}%`, icon: <Award className="w-5 h-5 text-cyan-300" /> },
              { label: 'โบนัสงบประมาณ', count: `+${myTeam?.score?.budgetBonus ?? 0}`, icon: <Gem className="w-5 h-5 text-cyan-300" /> },
              { label: 'อันดับภัณฑารักษ์', count: `อันดับ ${myRank}`, icon: <Trophy className="w-5 h-5 text-cyan-300" /> },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center px-1.5 py-1 shrink-0 group transition-transform hover:scale-110 cursor-default"
              >
                <div className="mb-1.5 flex items-center justify-center filter drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                  {stat.icon}
                </div>
                <span className="font-sans text-[10.5px] text-cyan-400/70 mb-0.5">{stat.label}</span>
                <span className="font-mono font-bold text-xs sm:text-sm text-cyan-100">
                  {stat.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 2: ITEMS COLLECTED & MISSING REVEAL ── */}
        <div className="relative z-10 space-y-3 pt-3">
          <div className="flex items-center justify-between border-b border-cyan-900/30 pb-1.5">
            <div className="text-[10px] font-mono text-cyan-400/70 tracking-[0.18em] uppercase">
              • ระบบบันทึกข้อมูลพิพิธภัณฑ์
            </div>
            <span className="text-xs sm:text-sm font-sans font-bold text-white tracking-wider">
              ของสะสมที่จัดแสดง {totalItemsCount}/9 รายการ{' '}
              {totalMissingCount > 0 && (
                <span className="text-slate-400 text-xs font-normal font-sans">
                  (ขาดอีก <strong className="text-amber-300 font-mono">{totalMissingCount}</strong> รายการ)
                </span>
              )}
            </span>
          </div>

          {/* Glowing Crystal Orb Items with Correct/Incorrect Badges + Missing Items in Gray */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 xs:gap-3 sm:gap-4.5 py-2 px-1">
            {/* 1. Collected Statues */}
            {myTeam?.statueInventory?.map((id) => {
              const item = STATUE_ITEMS.find((s) => s.id === id);
              const isMatch = myRoom ? myRoom.targetStatueIds.includes(id) : false;

              return (
                <div
                  key={`statue-orb-${id}`}
                  className="relative group shrink-0 flex flex-col items-center cursor-pointer w-16 sm:w-20"
                  title={item?.nameTh}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center p-1.5 transition-transform group-hover:scale-110 border ${
                    isMatch
                      ? 'bg-gradient-to-b from-[#103b2b]/90 to-[#061f16]/90 border-emerald-400/70 shadow-[0_0_16px_rgba(16,185,129,0.4)]'
                      : 'bg-gradient-to-b from-[#3d121c]/90 to-[#21060c]/90 border-rose-500/70 shadow-[0_0_16px_rgba(244,63,94,0.45)]'
                  }`}>
                    <img
                      src={item?.sculptureImage || item?.frontImage || `/sculptures/${id}.webp`}
                      alt={item?.nameTh}
                      className="max-h-full max-w-full object-contain filter drop-shadow-md"
                    />
                  </div>
                  <span className="text-[10px] font-sans text-white truncate max-w-full text-center mt-1">
                    {item?.nameTh.split(' ')[0]}
                  </span>
                  <span className={`text-[9px] font-mono font-bold mt-0.5 ${
                    isMatch ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {isMatch ? '✓ ตรงโจทย์' : '✕ ไม่ตรง'}
                  </span>
                </div>
              );
            })}

            {/* 2. Collected Evidence */}
            {myTeam?.evidenceInventory?.map((id) => {
              const item = EVIDENCE_ITEMS.find((e) => e.id === id);
              const isMatch = myRoom ? myRoom.targetEvidenceIds.includes(id) : false;
              const isAuthentic = item?.isAuthentic ?? true;
              const isCorrect = isMatch && isAuthentic;

              return (
                <div
                  key={`evidence-orb-${id}`}
                  className="relative group shrink-0 flex flex-col items-center cursor-pointer w-16 sm:w-20"
                  title={item?.titleTh}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center p-1.5 transition-transform group-hover:scale-110 border ${
                    isCorrect
                      ? 'bg-gradient-to-b from-[#103b2b]/90 to-[#061f16]/90 border-emerald-400/70 shadow-[0_0_16px_rgba(16,185,129,0.4)]'
                      : 'bg-gradient-to-b from-[#3d121c]/90 to-[#21060c]/90 border-rose-500/70 shadow-[0_0_16px_rgba(244,63,94,0.45)]'
                  }`}>
                    <FileText className={`w-6 h-6 ${isCorrect ? 'text-emerald-300' : 'text-rose-300'}`} />
                  </div>
                  <span className="text-[10px] font-sans text-white truncate max-w-full text-center mt-1">
                    {item?.titleTh.slice(0, 6)}..
                  </span>
                  <span className={`text-[9px] font-mono font-bold mt-0.5 ${
                    isCorrect
                      ? 'text-emerald-400'
                      : !isAuthentic
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}>
                    {isCorrect ? '✓ ของจริง' : !isAuthentic ? '✕ ของเท็จ' : '✕ ผิดห้อง'}
                  </span>
                </div>
              );
            })}

            {/* 3. Collected Story */}
            {myTeam?.storyInventory?.map((id) => {
              const item = STORY_PLACARDS_DATA.find((s) => s.id === id);
              const isMatch = myRoom ? item?.categoryId === myRoom.id : false;

              return (
                <div
                  key={`story-orb-${id}`}
                  className="relative group shrink-0 flex flex-col items-center cursor-pointer w-16 sm:w-20"
                  title={item?.titleTh}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center p-1.5 transition-transform group-hover:scale-110 border ${
                    isMatch
                      ? 'bg-gradient-to-b from-[#103b2b]/90 to-[#061f16]/90 border-emerald-400/70 shadow-[0_0_16px_rgba(16,185,129,0.4)]'
                      : 'bg-gradient-to-b from-[#3d121c]/90 to-[#21060c]/90 border-rose-500/70 shadow-[0_0_16px_rgba(244,63,94,0.45)]'
                  }`}>
                    <BookOpen className={`w-5 h-5 ${isMatch ? 'text-emerald-300' : 'text-rose-300'}`} />
                  </div>
                  <span className="text-[10px] font-sans text-white truncate max-w-full text-center mt-1">
                    {item?.recordDate || item?.titleTh || `#${id}`}
                  </span>
                  <span className={`text-[9px] font-mono font-bold mt-0.5 ${
                    isMatch ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {isMatch ? '✓ ตรงโจทย์' : '✕ ไม่ตรง'}
                  </span>
                </div>
              );
            })}

            {/* ── 4. MISSING TARGET ITEMS (เฉลยอันที่ขาดหาย - สีเทา) ── */}
            {missingStatueIds.map((id) => {
              const item = STATUE_ITEMS.find((s) => s.id === id);
              return (
                <div
                  key={`missing-statue-${id}`}
                  className="relative group shrink-0 flex flex-col items-center cursor-help w-16 sm:w-20 opacity-45 hover:opacity-85 transition-opacity"
                  title={`[เฉลยที่ขาดหาย] ${item?.nameTh}`}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center p-1.5 border-2 border-dashed border-slate-500/70 bg-slate-900/80 grayscale shadow-inner">
                    <img
                      src={item?.sculptureImage || item?.frontImage || `/sculptures/${id}.webp`}
                      alt={item?.nameTh}
                      className="max-h-full max-w-full object-contain filter grayscale contrast-75 brightness-75"
                    />
                  </div>
                  <span className="text-[10px] font-sans text-slate-400 truncate max-w-full text-center mt-1">
                    {item?.nameTh.split(' ')[0]}
                  </span>
                  <span className="text-[9px] font-mono font-bold mt-0.5 text-slate-400 bg-slate-800/80 px-1 rounded">
                    ✕ ขาดหาย
                  </span>
                </div>
              );
            })}

            {missingEvidenceIds.map((id) => {
              const item = EVIDENCE_ITEMS.find((e) => e.id === id);
              return (
                <div
                  key={`missing-evidence-${id}`}
                  className="relative group shrink-0 flex flex-col items-center cursor-help w-16 sm:w-20 opacity-45 hover:opacity-85 transition-opacity"
                  title={`[เฉลยที่ขาดหาย] ${item?.titleTh}`}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center p-1.5 border-2 border-dashed border-slate-500/70 bg-slate-900/80 grayscale shadow-inner">
                    <FileText className="w-6 h-6 text-slate-400" />
                  </div>
                  <span className="text-[10px] font-sans text-slate-400 truncate max-w-full text-center mt-1">
                    {item?.titleTh.slice(0, 6)}..
                  </span>
                  <span className="text-[9px] font-mono font-bold mt-0.5 text-slate-400 bg-slate-800/80 px-1 rounded">
                    ✕ ขาดหาย
                  </span>
                </div>
              );
            })}

            {missingStoryIds.map((id) => {
              const item = STORY_PLACARDS_DATA.find((s) => s.id === id);
              return (
                <div
                  key={`missing-story-${id}`}
                  className="relative group shrink-0 flex flex-col items-center cursor-help w-16 sm:w-20 opacity-45 hover:opacity-85 transition-opacity"
                  title={`[เฉลยที่ขาดหาย] ${item?.titleTh}`}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center p-1.5 border-2 border-dashed border-slate-500/70 bg-slate-900/80 grayscale shadow-inner">
                    <BookOpen className="w-5 h-5 text-slate-400" />
                  </div>
                  <span className="text-[10px] font-sans text-slate-400 truncate max-w-full text-center mt-1">
                    {item?.recordDate || item?.titleTh || `#${id}`}
                  </span>
                  <span className="text-[9px] font-mono font-bold mt-0.5 text-slate-400 bg-slate-800/80 px-1 rounded">
                    ✕ ขาดหาย
                  </span>
                </div>
              );
            })}

            {totalItemsCount === 0 && totalMissingCount === 0 && (
              <div className="py-2 text-xs font-sans text-cyan-400/50 text-center w-full">
                ไม่มีไอเทมในห้องจัดแสดง
              </div>
            )}
          </div>
        </div>

        {/* ── SECTION 3: POINTS & FACTOR UPDATE ── */}
        <div className="relative z-10 space-y-3.5 pt-3">
          <div className="border-b border-cyan-900/30 pb-1.5 flex items-center justify-between">
            <div className="text-[10px] font-mono text-cyan-400/70 tracking-[0.18em] uppercase">
              • ระบบบันทึกข้อมูลพิพิธภัณฑ์
            </div>
            <h3 className="text-xs sm:text-sm font-sans font-bold text-white tracking-wide">
              เกณฑ์การประเมินคะแนนภัณฑารักษ์
            </h3>
          </div>

          {/* Borderless Factor Rows */}
          <div className="space-y-4 pt-1">
            {/* 1. Main Points */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3.5">
                {/* Red Rhombus Badge */}
                <div className="w-7 h-7 rotate-45 rounded-[2px] bg-red-950/80 border border-red-500/80 flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.6)] shrink-0">
                  <Star className="-rotate-45 w-3.5 h-3.5 text-red-300 fill-red-300" />
                </div>
                <div className="flex items-baseline gap-2.5">
                  <span className="font-serif font-bold text-sm sm:text-base text-white tracking-wide">
                    คะแนนประเมินรวม +{myTeam?.score?.totalScore ?? 0}
                  </span>
                  <span className="px-2 py-0.5 rounded-[3px] bg-amber-950/80 border border-amber-500/60 text-amber-300 font-mono text-[9.5px] font-bold">
                    {ratingLabel}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-sans text-cyan-300/60 hidden sm:inline">
                (การจัดแสดงห้องนิทรรศการสมบูรณ์)
              </span>
            </div>

            {/* 2. Statue Factor */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3.5">
                {/* Green Hexagon */}
                <div className="w-7 h-7 rounded-[4px] bg-emerald-950/80 border border-emerald-500/70 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.4)] shrink-0">
                  <Landmark className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <span className="font-sans font-bold text-xs sm:text-sm text-emerald-100 tracking-wide">
                  คะแนนประติมากรรมบุคคล +{myTeam?.score?.statuePoints ?? 0}
                </span>
              </div>
              <span className="text-[11px] font-sans text-cyan-300/60">
                (ความสอดคล้องตามยุคสมัย)
              </span>
            </div>

            {/* 3. Evidence Factor */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3.5">
                {/* Purple Hexagon */}
                <div className="w-7 h-7 rounded-[4px] bg-purple-950/80 border border-purple-500/70 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.4)] shrink-0">
                  <FileSearch className="w-3.5 h-3.5 text-purple-300" />
                </div>
                <span className="font-sans font-bold text-xs sm:text-sm text-purple-100 tracking-wide">
                  คะแนนหลักฐานจริงที่จัดแสดง +{myTeam?.score?.evidencePoints ?? 0}
                </span>
              </div>
              <span className="text-[11px] font-sans text-cyan-300/60">
                (ผ่านการคัดกรองหลักฐานเท็จ)
              </span>
            </div>

            {/* 4. Gold Remaining */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3.5">
                {/* Gold Triangle Badge */}
                <div className="w-7 h-7 rounded-full bg-amber-950/80 border border-amber-400/70 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.5)] shrink-0">
                  <Coins className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <span className="font-mono font-bold text-xs sm:text-sm text-amber-200 tracking-wide">
                  งบประมาณคงเหลือ +฿{(myTeam?.budget ?? 0).toLocaleString()}
                </span>
              </div>
              <span className="text-[11px] font-sans text-amber-300/70">
                (+{myTeam?.score?.budgetBonus ?? 0} คะแนนประสิทธิภาพการเงิน)
              </span>
            </div>
          </div>
        </div>

        {/* ── SECTION 4: ALL TEAMS RANKINGS ACCORDION (BORDERLESS LIST) ── */}
        <div className="relative z-10 space-y-2.5 pt-4 border-t border-cyan-900/30">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400/80 pb-1">
            <span>• ทำเนียบเกียรติยศภัณฑารักษ์ •</span>
            <span>ทั้งหมด {sortedTeams.length} กลุ่ม</span>
          </div>

          <div className="space-y-1.5">
            {sortedTeams.map((team, index) => {
              const room = EXHIBITION_ROOMS.find((r) => r.id === team.roomId);
              const isMe = team.id === myTeam?.id;
              const isExpanded = expandedTeamId === team.id;

              return (
                <div
                  key={team.id}
                  className={`transition-all duration-200 ${
                    isMe
                      ? 'bg-cyan-500/10 border-l-2 border-cyan-400 pl-2'
                      : 'hover:bg-white/[0.03] pl-2'
                  }`}
                >
                  <div
                    onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                    className="py-2.5 pr-2 flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                          index === 0
                            ? 'bg-amber-400 text-black shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                            : index === 1
                            ? 'bg-slate-300 text-black'
                            : index === 2
                            ? 'bg-amber-700 text-white'
                            : 'text-cyan-400/70'
                        }`}
                      >
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-xs sm:text-sm text-white truncate">
                            {team.name}
                          </span>
                          {isMe && (
                            <span className="text-[9px] bg-cyan-500 text-black px-1.5 py-0.2 rounded-[2px] font-sans font-bold">
                              กลุ่มของคุณ
                            </span>
                          )}
                        </div>
                        <span className="text-[10.5px] text-cyan-300/60 font-sans">
                          ห้อง {room?.roomNumber}: {room?.nameTh.split('(')[0]}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-sm sm:text-base font-bold font-mono text-cyan-200">
                          {team.score?.totalScore ?? 0}
                        </span>
                        <span className="text-[9px] text-cyan-400/50 block font-mono">
                          ฿{team.budget.toLocaleString()}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && team.score && (
                    <div className="py-2.5 px-3 bg-black/40 space-y-2 text-xs font-sans animate-fadeIn border-t border-cyan-900/20">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        <div className="py-1 px-1.5 flex flex-col items-center">
                          <span className="text-cyan-400/60 text-[10px] flex items-center gap-1 mb-0.5">
                            <Landmark className="w-3 h-3" /> ประติมากรรม
                          </span>
                          <span className="text-amber-300 font-bold font-mono">+{team.score.statuePoints}</span>
                        </div>
                        <div className="py-1 px-1.5 flex flex-col items-center">
                          <span className="text-cyan-400/60 text-[10px] flex items-center gap-1 mb-0.5">
                            <Search className="w-3 h-3" /> หลักฐานจริง
                          </span>
                          <span className="text-purple-300 font-bold font-mono">+{team.score.evidencePoints}</span>
                        </div>
                        <div className="py-1 px-1.5 flex flex-col items-center">
                          <span className="text-cyan-400/60 text-[10px] flex items-center gap-1 mb-0.5">
                            <ShieldAlert className="w-3 h-3" /> บทลงโทษ
                          </span>
                          <span className={team.score.trapPenalties > 0 ? 'text-red-400 font-bold font-mono' : 'text-cyan-300/40 font-mono'}>
                            -{team.score.trapPenalties}
                          </span>
                        </div>
                        <div className="py-1 px-1.5 flex flex-col items-center">
                          <span className="text-cyan-400/60 text-[10px] flex items-center gap-1 mb-0.5">
                            <Coins className="w-3 h-3" /> โบนัสงบประมาณ
                          </span>
                          <span className="text-emerald-300 font-bold font-mono">+{team.score.budgetBonus}</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-cyan-300/70 pt-0.5">
                        สมาชิกในกลุ่ม: <span className="text-white">{team.members.map((m) => m.name).join(', ')}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 3. BOTTOM GLOWING CRIMSON END BUTTON ── */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-2">
        <button
          onClick={onClose || onResetGame}
          className="w-48 sm:w-56 py-3 px-6 bg-gradient-to-r from-red-950/80 via-red-900 to-red-950/80 hover:from-red-900 hover:via-red-800 hover:to-red-900 text-white border border-red-500/50 rounded-[4px] font-serif font-extrabold text-sm sm:text-base tracking-[0.35em] uppercase shadow-[0_0_25px_rgba(239,68,68,0.7),inset_0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_35px_rgba(239,68,68,0.95),inset_0_0_20px_rgba(239,68,68,0.5)] active:scale-95 transition-all duration-300 cursor-pointer text-center"
        >
          C L O S E
        </button>

        {/* Reflection below End Button */}
        <div className="w-32 h-2 bg-gradient-to-r from-transparent via-red-500/20 to-transparent blur-xs mt-1" />
      </div>
      </div>
    </div>
  );
};
