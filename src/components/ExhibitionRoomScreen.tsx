'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Send, ShieldAlert, Landmark, Search, BookOpen, Sparkles, Info, Eye, ChevronRight, CheckCircle2, Lock, Crown, ArrowLeft, AlertTriangle, User, FileText } from 'lucide-react';
import { TeamState, StatueItem, EvidenceItem } from '@/data/types';
import { EXHIBITION_ROOMS, STATUE_ITEMS, EVIDENCE_ITEMS } from '@/data/gameData';
import { STORY_PLACARDS_DATA, StoryPlacardItem } from '@/data/storyPlacardsData';

interface ExhibitionRoomScreenProps {
  myTeam: TeamState;
  allTeams?: TeamState[];
  onSelectItem: (item: (StatueItem & { itemType: 'statue' }) | (EvidenceItem & { itemType: 'evidence' })) => void;
  onSubmitRoom?: () => void;
  isSubmitting?: boolean;
  isReadOnly?: boolean;
}

const FIREFLY_PARTICLES = [
  { id: 1, left: '6%', top: '15%', size: 4, duration: 8.5, delay: 0.2 },
  { id: 2, left: '14%', top: '35%', size: 5, duration: 11.2, delay: 2.1 },
  { id: 3, left: '22%', top: '70%', size: 3.5, duration: 9.8, delay: 1.4 },
  { id: 4, left: '30%', top: '25%', size: 4.5, duration: 13.0, delay: 3.5 },
  { id: 5, left: '38%', top: '85%', size: 3, duration: 8.0, delay: 0.8 },
  { id: 6, left: '46%', top: '45%', size: 5.5, duration: 12.5, delay: 4.2 },
  { id: 7, left: '54%', top: '18%', size: 4, duration: 10.0, delay: 1.9 },
  { id: 8, left: '62%', top: '65%', size: 3.5, duration: 9.2, delay: 2.7 },
  { id: 9, left: '70%', top: '30%', size: 5, duration: 14.0, delay: 5.0 },
  { id: 10, left: '78%', top: '75%', size: 4, duration: 8.8, delay: 0.5 },
  { id: 11, left: '86%', top: '20%', size: 5.5, duration: 11.5, delay: 3.1 },
  { id: 12, left: '93%', top: '55%', size: 3.5, duration: 10.5, delay: 1.6 },
  { id: 13, left: '10%', top: '80%', size: 4, duration: 9.0, delay: 4.0 },
  { id: 14, left: '25%', top: '40%', size: 3, duration: 12.0, delay: 0.9 },
  { id: 15, left: '50%', top: '88%', size: 4.5, duration: 8.2, delay: 2.8 },
  { id: 16, left: '68%', top: '12%', size: 3.5, duration: 13.5, delay: 1.1 },
  { id: 17, left: '82%', top: '48%', size: 4, duration: 10.2, delay: 4.6 },
  { id: 18, left: '96%', top: '85%', size: 5, duration: 9.5, delay: 2.3 },
  { id: 19, left: '18%', top: '10%', size: 3.5, duration: 11.0, delay: 5.4 },
  { id: 20, left: '42%', top: '60%', size: 4, duration: 10.8, delay: 3.7 },
  { id: 21, left: '75%', top: '92%', size: 3, duration: 8.7, delay: 1.8 },
  { id: 22, left: '88%', top: '38%', size: 4.5, duration: 12.8, delay: 0.4 },
];

export const ExhibitionRoomScreen: React.FC<ExhibitionRoomScreenProps> = ({
  myTeam,
  onSelectItem,
  onSubmitRoom = () => {},
  isSubmitting = false,
  isReadOnly = false,
}) => {
  const [activeType, setActiveType] = useState<'statues' | 'evidence' | 'stories'>('statues');
  const currentDisplayedTeam = myTeam;
  const isViewingSelf = true;

  const room = EXHIBITION_ROOMS.find((r) => r.id === currentDisplayedTeam.roomId) || EXHIBITION_ROOMS[0];

  // Owned inventories of currently displayed team
  const ownedStatues = useMemo(() => {
    return STATUE_ITEMS.filter((s) => currentDisplayedTeam.statueInventory?.includes(s.id));
  }, [currentDisplayedTeam.statueInventory]);

  const ownedEvidences = useMemo(() => {
    return EVIDENCE_ITEMS.filter((e) => currentDisplayedTeam.evidenceInventory?.includes(e.id));
  }, [currentDisplayedTeam.evidenceInventory]);

  const ownedStories = useMemo(() => {
    return STORY_PLACARDS_DATA.filter((s: StoryPlacardItem) => currentDisplayedTeam.storyInventory?.includes(s.id));
  }, [currentDisplayedTeam.storyInventory]);

  // Missing Target Items when in Archive / isReadOnly mode (เฉลยไอเทมที่ขาดหายไป)
  const missingStatues = useMemo(() => {
    if (!isReadOnly) return [];
    const ownedIds = new Set(currentDisplayedTeam.statueInventory || []);
    return room.targetStatueIds
      .filter((id) => !ownedIds.has(id))
      .map((id) => STATUE_ITEMS.find((s) => s.id === id))
      .filter(Boolean) as StatueItem[];
  }, [isReadOnly, room.targetStatueIds, currentDisplayedTeam.statueInventory]);

  const missingEvidences = useMemo(() => {
    if (!isReadOnly) return [];
    const ownedIds = new Set(currentDisplayedTeam.evidenceInventory || []);
    return room.targetEvidenceIds
      .filter((id) => !ownedIds.has(id))
      .map((id) => EVIDENCE_ITEMS.find((e) => e.id === id))
      .filter(Boolean) as EvidenceItem[];
  }, [isReadOnly, room.targetEvidenceIds, currentDisplayedTeam.evidenceInventory]);

  const missingStories = useMemo(() => {
    if (!isReadOnly) return [];
    const ownedIds = new Set(currentDisplayedTeam.storyInventory || []);
    return STORY_PLACARDS_DATA
      .filter((s) => s.categoryId === room.id && !ownedIds.has(s.id));
  }, [isReadOnly, room.id, currentDisplayedTeam.storyInventory]);

  const allDisplayStatues = useMemo(() => {
    if (!isReadOnly) return ownedStatues.map((s) => ({ ...s, isMissing: false }));
    const owned = ownedStatues.map((s) => ({ ...s, isMissing: false }));
    const missing = missingStatues.map((s) => ({ ...s, isMissing: true }));
    return [...owned, ...missing];
  }, [isReadOnly, ownedStatues, missingStatues]);

  const allDisplayEvidences = useMemo(() => {
    if (!isReadOnly) return ownedEvidences.map((e) => ({ ...e, isMissing: false }));
    const owned = ownedEvidences.map((e) => ({ ...e, isMissing: false }));
    const missing = missingEvidences.map((e) => ({ ...e, isMissing: true }));
    return [...owned, ...missing];
  }, [isReadOnly, ownedEvidences, missingEvidences]);

  const allDisplayStories = useMemo(() => {
    if (!isReadOnly) return ownedStories.map((s) => ({ ...s, isMissing: false }));
    const owned = ownedStories.map((s) => ({ ...s, isMissing: false }));
    const missing = missingStories.map((s) => ({ ...s, isMissing: true }));
    return [...owned, ...missing];
  }, [isReadOnly, ownedStories, missingStories]);

  const isTeamSubmitted = Boolean(isReadOnly || (isViewingSelf ? myTeam.isSubmitted : currentDisplayedTeam.isSubmitted));

  // Selected items staged for exhibition (for self: default 0/9, for other teams: display all their items)
  const [selectedStatueIds, setSelectedStatueIds] = useState<number[]>([]);
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<number[]>([]);
  const [selectedStoryIds, setSelectedStoryIds] = useState<number[]>([]);

  const toggleStatue = (id: number) => {
    if (!isViewingSelf || isTeamSubmitted) {
      const s = STATUE_ITEMS.find((item) => item.id === id);
      if (s) onSelectItem({ ...s, itemType: 'statue' });
      return;
    }
    setSelectedStatueIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleEvidence = (id: number) => {
    if (!isViewingSelf || isTeamSubmitted) {
      const ev = EVIDENCE_ITEMS.find((item) => item.id === id);
      if (ev) onSelectItem({ ...ev, itemType: 'evidence' });
      return;
    }
    setSelectedEvidenceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleStory = (id: number) => {
    if (!isViewingSelf || isTeamSubmitted) {
      const st = STORY_PLACARDS_DATA.find((item) => item.id === id);
      if (st) onSelectItem({ ...st, itemType: 'story' } as any);
      return;
    }
    setSelectedStoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  const currentStatuesCount = isViewingSelf && !isTeamSubmitted
    ? selectedStatueIds.filter((id) => myTeam.statueInventory?.includes(id)).length
    : ownedStatues.length;
  const currentEvidenceCount = isViewingSelf && !isTeamSubmitted
    ? selectedEvidenceIds.filter((id) => myTeam.evidenceInventory?.includes(id)).length
    : ownedEvidences.length;
  const currentStoriesCount = isViewingSelf && !isTeamSubmitted
    ? selectedStoryIds.filter((id) => myTeam.storyInventory?.includes(id)).length
    : ownedStories.length;

  const selectedTotalCount = currentStatuesCount + currentEvidenceCount + currentStoriesCount;
  const isComplete = currentStatuesCount >= 4 && currentEvidenceCount >= 4 && currentStoriesCount >= 1;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-0 pb-32 space-y-4 select-none animate-fadeIn font-sans relative">
      {/* ─── AMBIENT SOFT RED FIREFLIES PARTICLES LAYER (เอฟเฟกต์หิ่งห้อยสีแดงอ่อนๆ ลอยละมุน) ─── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {FIREFLY_PARTICLES.map((f) => (
          <span
            key={`firefly-${f.id}`}
            className="firefly-particle"
            style={{
              left: f.left,
              top: f.top,
              width: `${f.size}px`,
              height: `${f.size}px`,
              animationDuration: `${f.duration}s`,
              animationDelay: `${f.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ─── 1. CURATOR EXHIBITION ROOM HEADER BANNER (FRAMELESS + WIDE SPOTLIGHT + GENEROUS SPACING) ─── */}
      <div className="relative pt-1 pb-8 sm:pt-2 sm:pb-12 px-4 sm:px-8 flex flex-col items-center justify-center text-center">
        {/* Overhead Volumetric Spotlight Beam (ไฟส่องลงมาจากเพดานบนสุด) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl sm:max-w-4xl h-full min-h-[380px] pointer-events-none flex flex-col items-center z-0">
          <div className="w-24 sm:w-36 h-2 bg-amber-100/90 rounded-full blur-[2px] shadow-[0_0_25px_rgba(255,230,180,0.9)] mb-0.5" />
          <div
            className="w-full h-full"
            style={{
              clipPath: 'polygon(22% 0%, 78% 0%, 100% 100%, 0% 100%)',
              background:
                'radial-gradient(ellipse at 50% 0%, rgba(255, 235, 190, 0.45) 0%, rgba(225, 29, 72, 0.15) 50%, rgba(225, 29, 72, 0.02) 80%, transparent 100%)',
              filter: 'blur(16px)',
              maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
            }}
          />
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-80 bg-rose-600/10 blur-[120px] pointer-events-none z-0" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center space-y-4 sm:space-y-5 pt-6 sm:pt-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2">
            <span className="text-rose-300 font-mono text-xs sm:text-sm font-bold tracking-widest uppercase drop-shadow-sm">
              ห้องจัดแสดงที่ {room.roomNumber}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-100 via-white to-amber-100 tracking-wide drop-shadow-[0_2px_15px_rgba(225,29,72,0.5)] pt-1 pb-1">
            {room.nameTh}
          </h1>

          {/* Curator Narrative */}
          <p className="text-xs sm:text-[14px] text-rose-200/85 max-w-2xl sm:max-w-3xl leading-relaxed font-sans font-normal text-center px-2 sm:px-6">
            {room.curatorNarrative || room.keyLesson}
          </p>

          {/* Group Attribution (ผลงานของกลุ่ม) */}
          {currentDisplayedTeam?.name && (
            <div className="pt-2 sm:pt-3">
              <span className="text-xs sm:text-sm font-serif text-rose-200/90 tracking-wide">
                ผลงานของกลุ่ม: <strong className="text-[#f5d061] font-bold">{currentDisplayedTeam.name}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── 2. EXHIBITION GALLERY TABS (ซ่อนเมื่ออยู่ในโหมด Archive เพื่อแสดงของทั้งหมดรวดเดียว) ─── */}
      {!isReadOnly && (
        <div className="relative z-20 border-b border-rose-950/80 pb-0 pt-0 flex items-center justify-center -mt-px bg-[#09050b]/95 px-2">
          <div className="relative grid grid-cols-3 w-full max-w-xs xs:max-w-sm sm:max-w-md items-center justify-center">
            {/* Sliding Dark Active Box Indicator */}
            <div
              className="absolute top-0 bottom-0 w-1/3 left-0 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none z-0"
              style={{
                transform:
                  activeType === 'statues'
                    ? 'translateX(0%)'
                    : activeType === 'evidence'
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
                    background:
                      'radial-gradient(ellipse 90% 60% at 50% 100%, rgba(225, 29, 72, 0.35) 0%, rgba(159, 18, 57, 0.15) 50%, transparent 85%)',
                  }}
                />
              </div>
            </div>

            {/* Tab 1: Statues */}
            <button
              onClick={() => setActiveType('statues')}
              className={`relative z-10 w-full py-2.5 px-0.5 flex items-center justify-center gap-1 sm:gap-1.5 transition-colors duration-300 cursor-pointer tracking-wider font-serif ${
                activeType === 'statues'
                  ? 'text-white font-bold drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]'
                  : 'text-rose-300/40 hover:text-white font-medium'
              }`}
            >
              <Landmark className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="text-[10px] xs:text-xs sm:text-sm truncate">
                รูปปั้น ({ownedStatues.length}/4)
              </span>
            </button>

            {/* Tab 2: Evidence */}
            <button
              onClick={() => setActiveType('evidence')}
              className={`relative z-10 w-full py-2.5 px-0.5 flex items-center justify-center gap-1 sm:gap-1.5 transition-colors duration-300 cursor-pointer tracking-wider font-serif ${
                activeType === 'evidence'
                  ? 'text-white font-bold drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]'
                  : 'text-rose-300/40 hover:text-white font-medium'
              }`}
            >
              <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="text-[10px] xs:text-xs sm:text-sm truncate">
                หลักฐาน ({ownedEvidences.length}/4)
              </span>
            </button>

            {/* Tab 3: Stories */}
            <button
              onClick={() => setActiveType('stories')}
              className={`relative z-10 w-full py-2.5 px-0.5 flex items-center justify-center gap-1 sm:gap-1.5 transition-colors duration-300 cursor-pointer tracking-wider font-serif ${
                activeType === 'stories'
                  ? 'text-white font-bold drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]'
                  : 'text-rose-300/40 hover:text-white font-medium'
              }`}
            >
              <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="text-[10px] xs:text-xs sm:text-sm truncate">
                เรื่องราว ({ownedStories.length}/1)
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Global Empty State in isReadOnly mode if total is 0 */}
      {isReadOnly && ownedStatues.length === 0 && ownedEvidences.length === 0 && ownedStories.length === 0 && (
        <div className="py-16 text-center p-6 space-y-3">
          <Landmark className="w-10 h-10 text-rose-500/40 mx-auto" />
          <div className="font-serif text-base text-rose-200 font-bold">
            ยังไม่มีของจัดแสดงในห้องนี้
          </div>
        </div>
      )}

      {/* ─── 3. 3D PEDESTAL GALLERY (หมวดประติมากรรม) ─── */}
      {(isReadOnly ? allDisplayStatues.length > 0 : activeType === 'statues') && (
        <div className="space-y-4 pt-2">
          {allDisplayStatues.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-4 md:gap-x-6 gap-y-8 sm:gap-y-10 md:gap-y-12 justify-items-center max-w-6xl mx-auto pt-2 pb-8">
              {allDisplayStatues.map((statue: any, idx: number) => {
                const isSelected = isViewingSelf && !isTeamSubmitted ? selectedStatueIds.includes(statue.id) : true;
                const imageSrc = statue.sculptureImage || statue.frontImage || `/sculptures/${statue.id}.webp`;
                const isMatch = room.targetStatueIds.includes(statue.id);
                const isMissing = Boolean(statue.isMissing);
                const isUnrelated = isReadOnly && !isMissing && !isMatch;

                return (
                  <div
                    key={`pedestal-statue-${statue.id}`}
                    onClick={() => {
                      if (isMissing) {
                        onSelectItem({ ...statue, itemType: 'statue' });
                      } else {
                        toggleStatue(statue.id);
                      }
                    }}
                    className={`group relative isolate flex flex-col items-center w-full cursor-pointer select-none transition-all duration-300 active:scale-[0.98] ${
                      isSelected ? 'scale-[1.02]' : 'opacity-60 grayscale-[40%]'
                    }`}
                  >
                    {/* Unrelated Banner in Archive Mode */}
                    {isUnrelated && (
                      <div className="absolute top-[32%] sm:top-[34%] left-0 right-0 z-30 flex items-center justify-center pointer-events-none">
                        <div
                          className="w-[82%] max-w-[170px] sm:max-w-[200px] py-1 sm:py-1.5 flex items-center justify-center shadow-lg select-none backdrop-blur-sm bg-black/45 border-y border-rose-500/40"
                          style={{
                            maskImage: 'linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%)',
                          }}
                        >
                          <span className="text-rose-200 font-sans font-extrabold text-[10px] sm:text-xs tracking-[0.25em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                            UNRELATED
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Missing Banner in Archive Mode */}
                    {isMissing && (
                      <div className="absolute top-[32%] sm:top-[34%] left-0 right-0 z-30 flex items-center justify-center pointer-events-none">
                        <div
                          className="w-[82%] max-w-[170px] sm:max-w-[200px] py-1 sm:py-1.5 flex items-center justify-center shadow-lg select-none backdrop-blur-sm bg-black/60 border-y border-amber-500/60"
                          style={{
                            maskImage: 'linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%)',
                          }}
                        >
                          <span className="text-amber-300 font-sans font-extrabold text-[10px] sm:text-xs tracking-[0.25em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                            MISSING
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Inspect Detail Info Button */}
                    {!isReadOnly && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectItem({ ...statue, itemType: 'statue' });
                        }}
                        className="absolute top-0 left-2 sm:left-4 z-40 w-6 h-6 rounded-full bg-black/60 border border-white/25 text-white/70 hover:text-white hover:bg-black/90 flex items-center justify-center transition active:scale-90"
                        title="ดูรายละเอียด"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Volumetric Overhead Spotlight */}
                    <div
                      className={`absolute -top-8 left-1/2 -translate-x-1/2 w-[160px] sm:w-[200px] md:w-[230px] h-[220px] sm:h-[260px] md:h-[290px] pointer-events-none flex flex-col items-center z-0 transition-opacity duration-300 ${
                        isMissing ? 'opacity-35' : isSelected ? 'opacity-90' : 'opacity-30'
                      }`}
                    >
                      <div className="w-8 sm:w-10 h-1 bg-amber-100/90 rounded-full blur-[1.5px] shadow-[0_0_12px_rgba(255,230,180,0.9)] mb-0.5" />
                      <div
                        className="w-full h-full"
                        style={{
                          clipPath: 'polygon(38% 0%, 62% 0%, 100% 100%, 0% 100%)',
                          background:
                            'linear-gradient(180deg, rgba(255, 235, 190, 0.65) 0%, rgba(255, 220, 160, 0.25) 40%, rgba(255, 200, 140, 0.08) 75%, transparent 100%)',
                          filter: 'blur(7px)',
                        }}
                      />
                    </div>

                    {/* 3D Sculpture Object & Turntable Mount */}
                    <div className="relative z-20 w-full flex flex-col items-center justify-end -mb-3 sm:-mb-4 transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
                      <div className="relative w-28 h-32 xs:w-32 xs:h-36 sm:w-40 sm:h-44 md:w-44 md:h-48 flex items-end justify-center">
                        <img
                          src={imageSrc}
                          alt={statue.nameTh}
                          className={`max-w-full max-h-full object-contain object-bottom filter transition-all duration-500 drop-shadow-[0_12px_22px_rgba(0,0,0,0.8)] group-hover:drop-shadow-[0_18px_28px_rgba(225,29,72,0.4)] ${
                            isMissing ? 'grayscale opacity-50 contrast-75 brightness-75' : ''
                          }`}
                          loading="lazy"
                        />
                      </div>

                      {/* Turntable Base Mount */}
                      <div className="flex flex-col items-center -mt-0.5 z-20">
                        <div className="w-1 h-3 sm:h-3.5 bg-gradient-to-r from-[#2a2a2e] via-[#8e8e93] to-[#1c1c1e] rounded-xs shadow-sm" />
                        <div
                          className="w-12 sm:w-15 md:w-16 h-2.5 sm:h-3 rounded-[50%] shadow-lg -mt-0.5 border-t border-rose-400/40 relative z-20"
                          style={{
                            background:
                              'radial-gradient(ellipse at 50% 30%, #3a3a40 0%, #1c1c20 60%, #0c0c0e 100%)',
                          }}
                        >
                          <div className="absolute inset-0.5 rounded-[50%] border border-rose-500/20 pointer-events-none" />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-0.5 rounded-full bg-rose-500/40 blur-[1px]" />
                        </div>
                      </div>
                    </div>

                    {/* Draped Velvet Cloth Pedestal */}
                    <div className="relative w-full max-w-[150px] xs:max-w-[170px] sm:max-w-[200px] md:max-w-[230px] flex flex-col items-center z-10">
                      <div
                        className="w-full h-6 sm:h-8 rounded-[50%] z-10 relative shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.8)] border-t border-white/15"
                        style={{
                          background:
                            'radial-gradient(ellipse at 50% 35%, #4a3a3e 0%, #2e2024 45%, #180f12 85%, #0e0709 100%)',
                        }}
                      >
                        <div
                          className="absolute inset-0 rounded-[50%] opacity-20 pointer-events-none"
                          style={{
                            backgroundImage:
                              'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)',
                          }}
                        />

                        {/* Order Index Plaque */}
                        {!isReadOnly && (
                          <div className="absolute -top-2.5 sm:-top-3 right-1 z-30 px-2 py-0.5 rounded-[3px] bg-[#1a120b] border border-[#d4af37] shadow-[0_2px_8px_rgba(212,175,55,0.35)] flex items-center gap-1">
                            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#f5d061]">
                              #{idx + 1}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Vertical Draped Cloth Body */}
                      <div
                        className="w-full min-h-[115px] sm:min-h-[130px] md:min-h-[145px] -mt-3 sm:-mt-4 flex flex-col items-center justify-start pt-5 sm:pt-6 pb-4 px-2 z-0 relative overflow-hidden transition-all duration-300 shadow-[0_12px_25px_rgba(0,0,0,0.9)]"
                        style={{
                          background:
                            'linear-gradient(90deg, #0d070a 0%, #1f1418 8%, #0d070a 16%, #3a282e 26%, #180f12 36%, #4a353c 50%, #180f12 64%, #3a282e 74%, #0d070a 84%, #1f1418 92%, #0d070a 100%)',
                          maskImage:
                            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 75%, rgba(0,0,0,0.3) 92%, rgba(0,0,0,0) 100%)',
                          WebkitMaskImage:
                            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 75%, rgba(0,0,0,0.3) 92%, rgba(0,0,0,0) 100%)',
                        }}
                      >
                        <div
                          className="absolute inset-0 opacity-15 pointer-events-none"
                          style={{
                            backgroundImage:
                              'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 2px)',
                          }}
                        />
                        <div className="absolute left-[44%] right-[44%] top-0 bottom-0 bg-white/10 blur-[5px] pointer-events-none" />

                        {/* Item Label */}
                        <div className="relative z-10 text-center space-y-1 w-full px-1.5 pt-0.5">
                          <h3 className="text-xs xs:text-sm sm:text-[15px] md:text-base font-serif font-extrabold text-white tracking-wide leading-snug group-hover:text-[#f5d061] transition-colors break-words drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] line-clamp-2">
                            {statue.nameTh}
                          </h3>
                          {statue.role && (
                            <p className="text-[9.5px] sm:text-[10px] md:text-[11px] text-rose-300/90 font-sans tracking-tight leading-tight break-words line-clamp-3">
                              {statue.role}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center p-6 space-y-3">
              <Landmark className="w-10 h-10 text-rose-500/40 mx-auto" />
              <div className="font-serif text-base text-rose-200 font-bold">
                ยังไม่มีประติมากรรมจัดแสดงในห้องนี้
              </div>
              <p className="text-xs text-rose-300/60 max-w-md mx-auto">
                ไปที่แท็บ <strong className="text-white">“ร้านค้า”</strong> เพื่อเลือกซื้อประติมากรรมบุคคลสำคัญที่สอดคล้องกับนิทรรศการห้องนี้
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── 4. 3D PEDESTAL GALLERY (หมวดหลักฐาน) ─── */}
      {(isReadOnly ? allDisplayEvidences.length > 0 : activeType === 'evidence') && (
        <div className="space-y-4 pt-2">
          {allDisplayEvidences.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-4 md:gap-x-6 gap-y-8 sm:gap-y-10 md:gap-y-12 justify-items-center max-w-6xl mx-auto pt-2 pb-8">
              {allDisplayEvidences.map((evidence: any, idx: number) => {
                const isSelected = isViewingSelf && !isTeamSubmitted ? selectedEvidenceIds.includes(evidence.id) : true;
                const isMatch = room.targetEvidenceIds.includes(evidence.id) && (evidence.isAuthentic ?? true);
                const isMissing = Boolean(evidence.isMissing);
                const isUnrelated = isReadOnly && !isMissing && !isMatch;

                return (
                  <div
                    key={`pedestal-evidence-${evidence.id}`}
                    onClick={() => {
                      if (isMissing) {
                        onSelectItem({ ...evidence, itemType: 'evidence' });
                      } else {
                        toggleEvidence(evidence.id);
                      }
                    }}
                    className={`group relative isolate flex flex-col items-center w-full cursor-pointer select-none transition-all duration-300 active:scale-[0.98] ${
                      isSelected ? 'scale-[1.02]' : 'opacity-60 grayscale-[40%]'
                    }`}
                  >
                    {/* Unrelated Banner in Archive Mode */}
                    {isUnrelated && (
                      <div className="absolute top-[32%] sm:top-[34%] left-0 right-0 z-30 flex items-center justify-center pointer-events-none">
                        <div
                          className="w-[82%] max-w-[170px] sm:max-w-[200px] py-1 sm:py-1.5 flex items-center justify-center shadow-lg select-none backdrop-blur-sm bg-black/45 border-y border-rose-500/40"
                          style={{
                            maskImage: 'linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%)',
                          }}
                        >
                          <span className="text-rose-200 font-sans font-extrabold text-[10px] sm:text-xs tracking-[0.25em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                            {evidence.isAuthentic === false ? 'Fake evidence' : 'UNRELATED'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Missing Banner in Archive Mode */}
                    {isMissing && (
                      <div className="absolute top-[32%] sm:top-[34%] left-0 right-0 z-30 flex items-center justify-center pointer-events-none">
                        <div
                          className="w-[82%] max-w-[170px] sm:max-w-[200px] py-1 sm:py-1.5 flex items-center justify-center shadow-lg select-none backdrop-blur-sm bg-black/60 border-y border-amber-500/60"
                          style={{
                            maskImage: 'linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%)',
                          }}
                        >
                          <span className="text-amber-300 font-sans font-extrabold text-[10px] sm:text-xs tracking-[0.25em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                            MISSING
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Inspect Detail Info Button */}
                    {!isReadOnly && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectItem({ ...evidence, itemType: 'evidence' });
                        }}
                        className="absolute top-0 left-2 sm:left-4 z-40 w-6 h-6 rounded-full bg-black/60 border border-white/25 text-white/70 hover:text-white hover:bg-black/90 flex items-center justify-center transition active:scale-90"
                        title="สแกนตรวจสอบ"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Volumetric Spotlight */}
                    <div
                      className={`absolute -top-8 left-1/2 -translate-x-1/2 w-[160px] sm:w-[200px] md:w-[230px] h-[220px] sm:h-[260px] md:h-[290px] pointer-events-none flex flex-col items-center z-0 transition-opacity duration-300 ${
                        isMissing ? 'opacity-35' : isSelected ? 'opacity-90' : 'opacity-30'
                      }`}
                    >
                      <div className="w-8 sm:w-10 h-1 bg-amber-100/90 rounded-full blur-[1.5px] shadow-[0_0_12px_rgba(255,230,180,0.9)] mb-0.5" />
                      <div
                        className="w-full h-full"
                        style={{
                          clipPath: 'polygon(38% 0%, 62% 0%, 100% 100%, 0% 100%)',
                          background:
                            'linear-gradient(180deg, rgba(255, 235, 190, 0.65) 0%, rgba(255, 220, 160, 0.25) 40%, rgba(255, 200, 140, 0.08) 75%, transparent 100%)',
                          filter: 'blur(7px)',
                        }}
                      />
                    </div>

                    {/* Evidence Document / Paper Lying Flat on Cylinder */}
                    <div className="relative z-20 w-full h-24 xs:h-28 sm:h-32 md:h-36 flex flex-col items-center justify-end -mb-2 sm:-mb-2.5 transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
                      <div
                        className="relative w-[72px] xs:w-[80px] sm:w-[92px] md:w-[102px] flex items-center justify-center p-0.5 transition-all duration-500 group-hover:scale-105"
                        style={{
                          transform: 'perspective(360px) rotateX(56deg) rotateZ(4deg)',
                          transformOrigin: '50% 90%',
                        }}
                      >
                        <img
                          src={evidence.frontImage}
                          alt={evidence.titleTh}
                          className={`w-full h-auto object-contain filter transition-all duration-500 drop-shadow-[0_6px_14px_rgba(0,0,0,0.95)] group-hover:drop-shadow-[0_10px_20px_rgba(225,29,72,0.4)] rounded-[3px] ${
                            isMissing ? 'grayscale opacity-50 contrast-75 brightness-75' : ''
                          }`}
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* Draped Velvet Cloth Pedestal */}
                    <div className="relative w-full max-w-[150px] xs:max-w-[170px] sm:max-w-[200px] md:max-w-[230px] flex flex-col items-center z-10">
                      <div
                        className="w-full h-6 sm:h-8 rounded-[50%] z-10 relative shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.8)] border-t border-white/15"
                        style={{
                          background:
                            'radial-gradient(ellipse at 50% 35%, #4a3a3e 0%, #2e2024 45%, #180f12 85%, #0e0709 100%)',
                        }}
                      >
                        <div
                          className="absolute inset-0 rounded-[50%] opacity-20 pointer-events-none"
                          style={{
                            backgroundImage:
                              'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)',
                          }}
                        />
                        {!isReadOnly && (
                          <div className="absolute -top-2.5 sm:-top-3 right-1 z-30 px-2 py-0.5 rounded-[3px] bg-[#1a120b] border border-[#d4af37] shadow-[0_2px_8px_rgba(212,175,55,0.35)] flex items-center gap-1">
                            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#f5d061]">
                              #{idx + 1}
                            </span>
                          </div>
                        )}
                      </div>

                      <div
                        className="w-full min-h-[115px] sm:min-h-[130px] md:min-h-[145px] -mt-3 sm:-mt-4 flex flex-col items-center justify-start pt-5 sm:pt-6 pb-4 px-2 z-0 relative overflow-hidden transition-all duration-300 shadow-[0_12px_25px_rgba(0,0,0,0.9)]"
                        style={{
                          background:
                            'linear-gradient(90deg, #0d070a 0%, #1f1418 8%, #0d070a 16%, #3a282e 26%, #180f12 36%, #4a353c 50%, #180f12 64%, #3a282e 74%, #0d070a 84%, #1f1418 92%, #0d070a 100%)',
                          maskImage:
                            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 75%, rgba(0,0,0,0.3) 92%, rgba(0,0,0,0) 100%)',
                          WebkitMaskImage:
                            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 75%, rgba(0,0,0,0.3) 92%, rgba(0,0,0,0) 100%)',
                        }}
                      >
                        <div
                          className="absolute inset-0 opacity-15 pointer-events-none"
                          style={{
                            backgroundImage:
                              'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 2px)',
                          }}
                        />
                        <div className="absolute left-[44%] right-[44%] top-0 bottom-0 bg-white/10 blur-[5px] pointer-events-none" />

                        <div className="relative z-10 text-center space-y-1 w-full px-1 pt-0.5">
                          <h3 className="text-xs xs:text-sm sm:text-[15px] md:text-base font-serif font-extrabold text-white tracking-wide leading-snug group-hover:text-[#f5d061] transition-colors break-words drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] line-clamp-2">
                            {evidence.titleTh}
                          </h3>
                          {evidence.titleEn && (
                            <p className="text-[9px] sm:text-[10px] md:text-[11px] text-rose-300/80 font-mono tracking-wide leading-tight break-words line-clamp-1">
                              {evidence.titleEn}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center p-6 space-y-3">
              <Search className="w-10 h-10 text-rose-500/40 mx-auto" />
              <div className="font-serif text-base text-rose-200 font-bold">
                ยังไม่มีหลักฐานประวัติศาสตร์จัดแสดงในห้องนี้
              </div>
              <p className="text-xs text-rose-300/60 max-w-md mx-auto">
                ไปที่แท็บ <strong className="text-white">“ร้านค้า”</strong> เพื่อค้นหาและเลือกซื้อหลักฐานประวัติศาสตร์ที่เกี่ยวข้อง
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── 5. 3D PEDESTAL GALLERY (หมวดเรื่องราว / ป้ายบทเรียน) ─── */}
      {(isReadOnly ? allDisplayStories.length > 0 : activeType === 'stories') && (
        <div className="space-y-4 pt-2">
          {allDisplayStories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-4 md:gap-x-6 gap-y-8 sm:gap-y-10 md:gap-y-12 justify-items-center justify-center max-w-6xl mx-auto pt-2 pb-8">
              {allDisplayStories.map((story: any, idx: number) => {
                const isSelected = isViewingSelf && !isTeamSubmitted ? selectedStoryIds.includes(story.id) : true;
                const imageSrc = story.image || `/placards/${story.id}.webp`;
                const isMatch = story.categoryId === room.id;
                const isMissing = Boolean(story.isMissing);
                const isUnrelated = isReadOnly && !isMissing && !isMatch;

                return (
                  <div
                    key={`pedestal-story-${story.id}`}
                    onClick={() => {
                      if (isMissing) {
                        onSelectItem({ ...story, itemType: 'story' } as any);
                      } else {
                        toggleStory(story.id);
                      }
                    }}
                    className={`group relative isolate flex flex-col items-center w-full max-w-[150px] xs:max-w-[170px] sm:max-w-[200px] md:max-w-[230px] cursor-pointer select-none transition-all duration-300 active:scale-[0.98] ${
                      isSelected ? 'scale-[1.02]' : 'opacity-60 grayscale-[40%]'
                    }`}
                  >
                    {/* Unrelated Banner in Archive Mode */}
                    {isUnrelated && (
                      <div className="absolute top-[32%] sm:top-[34%] left-0 right-0 z-30 flex items-center justify-center pointer-events-none">
                        <div
                          className="w-[82%] max-w-[170px] sm:max-w-[200px] py-1 sm:py-1.5 flex items-center justify-center shadow-lg select-none backdrop-blur-sm bg-black/45 border-y border-rose-500/40"
                          style={{
                            maskImage: 'linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%)',
                          }}
                        >
                          <span className="text-rose-200 font-sans font-extrabold text-[10px] sm:text-xs tracking-[0.25em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                            UNRELATED
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Missing Banner in Archive Mode */}
                    {isMissing && (
                      <div className="absolute top-[32%] sm:top-[34%] left-0 right-0 z-30 flex items-center justify-center pointer-events-none">
                        <div
                          className="w-[82%] max-w-[170px] sm:max-w-[200px] py-1 sm:py-1.5 flex items-center justify-center shadow-lg select-none backdrop-blur-sm bg-black/60 border-y border-amber-500/60"
                          style={{
                            maskImage: 'linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%)',
                          }}
                        >
                          <span className="text-amber-300 font-sans font-extrabold text-[10px] sm:text-xs tracking-[0.25em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                            MISSING
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Inspect Detail Info Button */}
                    {!isReadOnly && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectItem({ ...story, itemType: 'story' } as any);
                        }}
                        className="absolute top-0 left-2 sm:left-4 z-40 w-6 h-6 rounded-full bg-black/60 border border-white/25 text-white/70 hover:text-white hover:bg-black/90 flex items-center justify-center transition active:scale-90"
                        title="ตรวจสอบข้อมูลเรื่องราว"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Volumetric Overhead Spotlight */}
                    <div
                      className={`absolute -top-8 left-1/2 -translate-x-1/2 w-[160px] sm:w-[200px] md:w-[230px] h-[220px] sm:h-[260px] md:h-[290px] pointer-events-none flex flex-col items-center z-0 transition-opacity duration-300 ${
                        isMissing ? 'opacity-35' : isSelected ? 'opacity-90' : 'opacity-30'
                      }`}
                    >
                      <div className="w-8 sm:w-10 h-1 bg-amber-100/90 rounded-full blur-[1.5px] shadow-[0_0_12px_rgba(255,230,180,0.9)] mb-0.5" />
                      <div
                        className="w-full h-full"
                        style={{
                          clipPath: 'polygon(38% 0%, 62% 0%, 100% 100%, 0% 100%)',
                          background:
                            'linear-gradient(180deg, rgba(255, 235, 190, 0.65) 0%, rgba(255, 220, 160, 0.25) 40%, rgba(255, 200, 140, 0.08) 75%, transparent 100%)',
                          filter: 'blur(7px)',
                        }}
                      />
                    </div>

                    {/* Story Document / Paper Lying Flat on Cylinder */}
                    <div className="relative z-20 w-full h-24 xs:h-28 sm:h-32 md:h-36 flex flex-col items-center justify-end -mb-2 sm:-mb-2.5 transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
                      <div
                        className="relative w-[72px] xs:w-[80px] sm:w-[92px] md:w-[102px] flex items-center justify-center p-0.5 transition-all duration-500 group-hover:scale-105"
                        style={{
                          transform: 'perspective(360px) rotateX(56deg) rotateZ(4deg)',
                          transformOrigin: '50% 90%',
                        }}
                      >
                        <img
                          src={imageSrc}
                          alt={story.titleTh}
                          className={`w-full h-auto object-contain filter transition-all duration-500 drop-shadow-[0_6px_14px_rgba(0,0,0,0.95)] group-hover:drop-shadow-[0_10px_20px_rgba(225,29,72,0.4)] rounded-[3px] ${
                            isMissing ? 'grayscale opacity-50 contrast-75 brightness-75' : ''
                          }`}
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* Draped Velvet Cloth Pedestal */}
                    <div className="relative w-full max-w-[150px] xs:max-w-[170px] sm:max-w-[200px] md:max-w-[230px] flex flex-col items-center z-10">
                      <div
                        className="w-full h-6 sm:h-8 rounded-[50%] z-10 relative shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.8)] border-t border-white/15"
                        style={{
                          background:
                            'radial-gradient(ellipse at 50% 35%, #4a3a3e 0%, #2e2024 45%, #180f12 85%, #0e0709 100%)',
                        }}
                      >
                        <div
                          className="absolute inset-0 rounded-[50%] opacity-20 pointer-events-none"
                          style={{
                            backgroundImage:
                              'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)',
                          }}
                        />

                        {/* Order Index Plaque */}
                        {!isReadOnly && (
                          <div className="absolute -top-2.5 sm:-top-3 right-1 z-30 px-2 py-0.5 rounded-[3px] bg-[#1a120b] border border-[#d4af37] shadow-[0_2px_8px_rgba(212,175,55,0.35)] flex items-center gap-1">
                            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#f5d061]">
                              #{idx + 1}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Vertical Draped Cloth Body */}
                      <div
                        className="w-full min-h-[115px] sm:min-h-[130px] md:min-h-[145px] -mt-3 sm:-mt-4 flex flex-col items-center justify-start pt-5 sm:pt-6 pb-4 px-2 z-0 relative overflow-hidden transition-all duration-300 shadow-[0_12px_25px_rgba(0,0,0,0.9)]"
                        style={{
                          background:
                            'linear-gradient(90deg, #0d070a 0%, #1f1418 8%, #0d070a 16%, #3a282e 26%, #180f12 36%, #4a353c 50%, #180f12 64%, #3a282e 74%, #0d070a 84%, #1f1418 92%, #0d070a 100%)',
                          maskImage:
                            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 75%, rgba(0,0,0,0.3) 92%, rgba(0,0,0,0) 100%)',
                          WebkitMaskImage:
                            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 75%, rgba(0,0,0,0.3) 92%, rgba(0,0,0,0) 100%)',
                        }}
                      >
                        <div
                          className="absolute inset-0 opacity-15 pointer-events-none"
                          style={{
                            backgroundImage:
                              'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 2px)',
                          }}
                        />
                        <div className="absolute left-[44%] right-[44%] top-0 bottom-0 bg-white/10 blur-[5px] pointer-events-none" />

                        {/* Item Label */}
                        <div className="relative z-10 text-center space-y-1 w-full px-1 pt-0.5">
                          <h3 className="text-xs xs:text-sm sm:text-[15px] md:text-base font-serif font-extrabold text-white tracking-wide leading-snug group-hover:text-[#f5d061] transition-colors break-words drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] line-clamp-2">
                            {story.titleTh}
                          </h3>
                          <p className="text-[9px] sm:text-[10px] md:text-[11px] text-rose-300/80 font-mono tracking-wide leading-tight break-words line-clamp-1">
                            {story.recordDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center p-6 space-y-3">
              <BookOpen className="w-10 h-10 text-rose-500/40 mx-auto" />
              <div className="font-serif text-base text-rose-200 font-bold">
                {isViewingSelf ? 'ยังไม่มีชิ้นงานจัดแสดงในหมวดนี้' : `กลุ่ม ${currentDisplayedTeam.name} ยังไม่มีชิ้นงานในหมวดนี้`}
              </div>
              <p className="text-xs text-rose-300/60 max-w-md mx-auto">
                สามารถซื้อชิ้นงานเพื่อเสริมความรู้และความสมบูรณ์ของห้องนิทรรศการได้ที่ร้านค้า
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── 6. PERSISTENT PROMINENT FLOATING CYBER GLASS BAR (กล่องข้อความลอยเด่น แสงไฟอบอุ่น) ─── */}
      {!isReadOnly && (
        <div className="fixed bottom-8 sm:bottom-10 md:bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex justify-center w-full px-4">
          {isTeamSubmitted ? (
            <div
              style={{
                background:
                  'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(0, 0, 0, 0) 0%, rgba(245, 199, 104, 0.05) 45%, rgba(30, 20, 8, 0.35) 85%, rgba(20, 12, 4, 0.55) 100%)',
              }}
              className="relative w-auto min-w-[170px] max-w-[220px] py-2.5 sm:py-3 px-6 rounded-[4px] text-white shadow-[0_0_20px_rgba(245,199,104,0.3)] backdrop-blur-sm flex items-center justify-center select-none overflow-hidden border border-[#f5c768]/70 border-t-white/40 border-b-[#f5c768]"
            >
              {/* Corner Cyber Accents */}
              <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#f5c768] pointer-events-none" />
              <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#f5c768] pointer-events-none" />
              <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#f5c768] pointer-events-none" />
              <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#f5c768] pointer-events-none" />

              {/* Subtle Top Overhead Light Reflection */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffe4a0]/80 to-transparent pointer-events-none" />

              {/* Animated Bottom Laser Glow */}
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#2a1e0d]/50 overflow-hidden pointer-events-none">
                <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#f5c768] to-transparent shadow-[0_0_12px_#f5c768] animate-smooth-beam" />
              </div>

              <div className="font-serif text-sm sm:text-base font-bold text-white tracking-wider text-center drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                ส่งเรียบร้อย
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                if (selectedTotalCount === 0 || isSubmitting) return;
                if (!isComplete) {
                  setShowIncompleteModal(true);
                } else {
                  onSubmitRoom();
                }
              }}
              disabled={selectedTotalCount === 0 || isSubmitting}
              style={
                selectedTotalCount > 0
                  ? {
                      background:
                        'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(0, 0, 0, 0) 0%, rgba(245, 199, 104, 0.05) 45%, rgba(30, 20, 8, 0.35) 85%, rgba(20, 12, 4, 0.55) 100%)',
                    }
                  : undefined
              }
              className={`relative w-[72%] xs:w-[66%] sm:w-auto max-w-[290px] sm:max-w-xs px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-[4px] shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-sm flex items-center justify-between gap-2.5 select-none transition-all duration-200 active:scale-95 overflow-hidden ${
                selectedTotalCount > 0
                  ? 'border border-[#f5c768]/80 border-t-white/40 border-b-[#f5c768] text-white hover:brightness-110 shadow-[0_0_30px_rgba(245,199,104,0.35)] cursor-pointer'
                  : 'bg-[#12141a]/50 border border-zinc-700/60 text-zinc-400 cursor-not-allowed shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
              }`}
            >
              {/* Corner Cyber Accents */}
              <span className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 pointer-events-none ${
                selectedTotalCount > 0 ? 'border-[#f5c768]' : 'border-zinc-500/50'
              }`} />
              <span className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 pointer-events-none ${
                selectedTotalCount > 0 ? 'border-[#f5c768]' : 'border-zinc-500/50'
              }`} />
              <span className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 pointer-events-none ${
                selectedTotalCount > 0 ? 'border-[#f5c768]' : 'border-zinc-500/50'
              }`} />
              <span className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 pointer-events-none ${
                selectedTotalCount > 0 ? 'border-[#f5c768]' : 'border-zinc-500/50'
              }`} />

              {/* Animated Bottom Laser Glow for active button */}
              {selectedTotalCount > 0 && (
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#2a1e0d]/90 overflow-hidden pointer-events-none">
                  <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#f5c768] to-transparent shadow-[0_0_12px_#f5c768] animate-smooth-beam" />
                </div>
              )}

              <div className="text-left min-w-0 flex-1">
                <div className={`font-serif text-xs sm:text-sm font-bold tracking-wide truncate ${
                  selectedTotalCount > 0
                    ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]'
                    : 'text-zinc-300'
                }`}>
                  {selectedTotalCount === 0
                    ? 'โปรดเลือกสิ่งของจัดแสดง'
                    : isSubmitting
                    ? 'กำลังส่งผลงาน...'
                    : 'ส่งผลงานและเปิดนิทรรศการ'}
                </div>
                {/* 🌟 แสดงเป็น List สัดส่วนจำนวนชิ้น */}
                <div className={`flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono ${
                  selectedTotalCount > 0 ? 'text-[#f5d061]' : 'text-zinc-400/80'
                }`}>
                  <span className={currentStatuesCount >= 4 ? (selectedTotalCount > 0 ? 'text-white font-bold' : 'text-zinc-300 font-bold') : ''}>
                    ประติมากรรม {currentStatuesCount}/4
                  </span>
                  <span>•</span>
                  <span className={currentEvidenceCount >= 4 ? (selectedTotalCount > 0 ? 'text-white font-bold' : 'text-zinc-300 font-bold') : ''}>
                    หลักฐาน {currentEvidenceCount}/4
                  </span>
                  <span>•</span>
                  <span className={currentStoriesCount >= 1 ? (selectedTotalCount > 0 ? 'text-white font-bold' : 'text-zinc-300 font-bold') : ''}>
                    เรื่องราว {currentStoriesCount}/1
                  </span>
                </div>
              </div>

              {/* Dynamic 0/9 -> 9/9 Total Badge */}
              <div
                className={`px-2.5 py-1 rounded-[4px] font-mono font-extrabold text-xs sm:text-sm shrink-0 border transition-all duration-200 ${
                  selectedTotalCount >= 9
                    ? 'bg-[#2a1e0d]/90 border-[#f5c768] text-white shadow-[0_0_10px_rgba(245,199,104,0.4)]'
                    : selectedTotalCount > 0
                    ? 'bg-[#2a1e0d]/90 border-[#f5c768] text-white shadow-[0_0_10px_rgba(245,199,104,0.4)]'
                    : 'bg-zinc-800/90 border-zinc-600/60 text-zinc-300'
                }`}
              >
                {selectedTotalCount}/9
              </div>
            </button>
          )}
        </div>
      )}

      {/* ─── 7. 🛡️ CYBER INCOMPLETE SUBMISSION WARNING MODAL ─── */}
      {showIncompleteModal && (
        <div
          className="fixed inset-0 z-[99999] bg-[#020617]/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
          onClick={() => setShowIncompleteModal(false)}
        >
          {/* Ambient volumetric blue glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(14,165,233,0.22),transparent_75%)] pointer-events-none" />

          {/* Cyber Blue Glass Box (สไตล์เดียวกับ ยังไม่ถึงเวลาเปิดร้านค้า) */}
          <div
            className="relative w-full max-w-[380px] sm:max-w-[420px] rounded-none bg-[#061224]/95 border border-sky-400/60 shadow-[0_0_40px_rgba(56,189,248,0.45)] backdrop-blur-2xl p-6 sm:p-7 text-center space-y-4 overflow-hidden animate-beam-expand-blink"
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

            {/* Shield Icon Box */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-none bg-sky-950/90 border border-sky-400/80 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.5)]">
              <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7 text-sky-300 animate-pulse" />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <span className="text-[10.5px] font-mono text-sky-400 uppercase tracking-widest font-bold block">
                /// EXHIBITION STATUS WARNING
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(125,211,252,0.4)]">
                นิทรรศการยังไม่ครบตามเป้าหมาย
              </h3>
              <p className="text-xs sm:text-sm text-sky-200/90 font-sans leading-relaxed pt-1">
                ห้องนิทรรศการที่สมบูรณ์ควรมีทั้งหมด <strong className="text-white">9 ชิ้น</strong> แต่ตอนนี้คุณเลือกไว้ <strong className="text-sky-300">{selectedTotalCount}/9 ชิ้น</strong>
              </p>
            </div>

            {/* List breakdown box */}
            <div className="bg-sky-950/40 border border-sky-500/30 rounded-none p-3.5 text-xs font-mono space-y-2 text-left shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-sky-200/80 inline-flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  <span>ประติมากรรมบุคคล:</span>
                </span>
                <span className={currentStatuesCount >= 4 ? 'text-sky-300 font-bold drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]' : 'text-rose-400 font-bold'}>
                  {currentStatuesCount}/4 ชิ้น {currentStatuesCount >= 4 ? '✓ ครบ' : `(ขาดอีก ${4 - currentStatuesCount})`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sky-200/80 inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>หลักฐานทางประวัติศาสตร์:</span>
                </span>
                <span className={currentEvidenceCount >= 4 ? 'text-sky-300 font-bold drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]' : 'text-rose-400 font-bold'}>
                  {currentEvidenceCount}/4 ชิ้น {currentEvidenceCount >= 4 ? '✓ ครบ' : `(ขาดอีก ${4 - currentEvidenceCount})`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sky-200/80 inline-flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                  <span>ป้ายเรื่องราวสรุปบทเรียน:</span>
                </span>
                <span className={currentStoriesCount >= 1 ? 'text-sky-300 font-bold drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]' : 'text-rose-400 font-bold'}>
                  {currentStoriesCount}/1 ป้าย {currentStoriesCount >= 1 ? '✓ ครบ' : `(ขาดอีก ${1 - currentStoriesCount})`}
                </span>
              </div>
            </div>

            <p className="text-xs text-sky-300/80 font-sans">
              คุณแน่ใจหรือไม่ว่าต้องการยืนยันส่งผลงานและเปิดนิทรรศการในตอนนี้?
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowIncompleteModal(false)}
                className="w-full py-2.5 px-4 rounded-none bg-slate-900/60 hover:bg-slate-800/80 border border-slate-600 text-slate-300 font-serif font-bold text-xs sm:text-sm transition active:scale-95 cursor-pointer"
              >
                กลับไปเลือกต่อ
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowIncompleteModal(false);
                  onSubmitRoom();
                }}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-none bg-sky-500/25 hover:bg-sky-500/40 border border-sky-400 text-sky-100 font-serif font-bold text-xs sm:text-sm transition active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.35)]"
              >
                ยืนยันส่งผลงาน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
