'use client';

import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { StatueItem, EvidenceItem, TeamState, ExhibitionRoom } from '@/data/types';
import { STATUE_ITEMS, EVIDENCE_ITEMS, EXHIBITION_ROOMS } from '@/data/gameData';
import { MuseumPedestal } from '@/components/MuseumPedestal';
import { EvidenceDossierModal } from '@/components/EvidenceDossierModal';
import { EvidenceWorldUnderneathView } from '@/components/EvidenceWorldUnderneathView';
import { StoryPlacardsView } from '@/components/StoryPlacardsView';
import { HologramConfirmModal } from '@/components/HologramConfirmModal';

interface MarketScreenProps {
  myTeam: TeamState;
  onSelectItem: (item: (StatueItem & { itemType: 'statue' }) | (EvidenceItem & { itemType: 'evidence' })) => void;
  onBuyItem: (itemType: 'statue' | 'evidence' | 'story', itemId: number) => void;
  onGoToBriefing?: () => void;
  isBuying?: boolean;
  activeType?: 'statues' | 'evidence' | 'stories';
  onTabChange?: (tab: 'statues' | 'evidence' | 'stories') => void;
}

export const MarketScreen: React.FC<MarketScreenProps> = ({
  myTeam,
  onSelectItem,
  onBuyItem,
  onGoToBriefing,
  isBuying = false,
  activeType: controlledActiveType,
  onTabChange,
}) => {
  const [internalActiveType, setInternalActiveType] = useState<'evidence' | 'stories' | 'statues'>('evidence');
  const activeType = controlledActiveType ?? internalActiveType;
  const handleTabChange = onTabChange ?? setInternalActiveType;

  const [selectedRoomForDossier, setSelectedRoomForDossier] = useState<ExhibitionRoom | null>(null);
  const [hideOwned, setHideOwned] = useState<boolean>(false);

  const [confirmBuyTarget, setConfirmBuyTarget] = useState<{
    type: 'statue' | 'evidence' | 'story';
    id: number;
    name: string;
    price: number;
  } | null>(null);

  // Filter items
  const filteredStatues = useMemo(() => {
    return STATUE_ITEMS.filter((item) => {
      if (hideOwned && myTeam.statueInventory?.includes(item.id)) {
        return false;
      }
      return true;
    });
  }, [hideOwned, myTeam.statueInventory]);

  return (
    <div className="max-w-5xl mx-auto px-2 xs:px-3 sm:px-6 md:px-8 pt-0 pb-16 space-y-4 select-none animate-fadeIn">
      
      {/* ─── TABS HEADER (Rendered here only if not controlled from top sticky header) ─── */}
      {!controlledActiveType && (
        <div className="border-b border-rose-950/80 pb-0 pt-0 -mx-2 xs:-mx-3 sm:-mx-6 md:-mx-8 px-2 sm:px-4 flex items-center justify-center -mt-px bg-[#09050b]/95">
          {/* Centered Sliding Tabs Container (3 Sub-tabs: หลักฐาน | เรื่องราว | ประติมากรรม) */}
          <div className="relative grid grid-cols-3 w-full max-w-xs xs:max-w-sm sm:max-w-md items-center justify-center">
            {/* Sliding Dark Active Box Indicator */}
            <div
              className="absolute top-0 bottom-0 w-1/3 left-0 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none z-0"
              style={{
                transform:
                  activeType === 'evidence'
                    ? 'translateX(0%)'
                    : activeType === 'stories'
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
              onClick={() => handleTabChange('evidence')}
              className={`relative z-10 w-full py-2.5 px-0.5 flex items-center justify-center transition-colors duration-300 cursor-pointer tracking-wider font-serif ${
                activeType === 'evidence'
                  ? 'text-white font-bold drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]'
                  : 'text-rose-300/40 hover:text-white font-medium'
              }`}
            >
              <span className="text-[11px] xs:text-xs sm:text-sm truncate">หลักฐาน</span>
            </button>

            {/* Tab 2: Stories (เรื่องราว) */}
            <button
              onClick={() => handleTabChange('stories')}
              className={`relative z-10 w-full py-2.5 px-0.5 flex items-center justify-center transition-colors duration-300 cursor-pointer tracking-wider font-serif ${
                activeType === 'stories'
                  ? 'text-white font-bold drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]'
                  : 'text-rose-300/40 hover:text-white font-medium'
              }`}
            >
              <span className="text-[11px] xs:text-xs sm:text-sm truncate">เรื่องราว</span>
            </button>

            {/* Tab 3: Statues (ประติมากรรม) */}
            <button
              onClick={() => handleTabChange('statues')}
              className={`relative z-10 w-full py-2.5 px-0.5 flex items-center justify-center transition-colors duration-300 cursor-pointer tracking-wider font-serif ${
                activeType === 'statues'
                  ? 'text-white font-bold drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]'
                  : 'text-rose-300/40 hover:text-white font-medium'
              }`}
            >
              <span className="text-[11px] xs:text-xs sm:text-sm truncate">ประติมากรรม</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── TOGGLE HIDE PURCHASED ITEMS (ปุ่มกดซ่อนสินค้าที่ซื้อแล้ว) ─── */}
      <div className="flex items-center justify-between px-1 pt-1 pb-0.5">
        <span className="text-[11px] font-mono text-rose-300/60">
          {hideOwned ? '✦ กำลังซ่อนสินค้าที่ครอบครองแล้ว' : '✦ แสดงสินค้าทั้งหมดในตลาด'}
        </span>
        <button
          type="button"
          onClick={() => setHideOwned(!hideOwned)}
          className={`px-3 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border ${
            hideOwned
              ? 'bg-rose-950/90 border-rose-500 text-rose-200 shadow-[0_0_12px_rgba(225,29,72,0.45)]'
              : 'bg-[#150a11]/80 border-rose-950 text-rose-300/70 hover:text-white hover:border-rose-800'
          }`}
        >
          {hideOwned ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-rose-400" />
              <span>ซ่อนสินค้าที่ซื้อแล้ว (เปิดใช้งาน)</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-rose-400/80" />
              <span>ซ่อนสินค้าที่ซื้อแล้ว</span>
            </>
          )}
        </button>
      </div>

      {/* ─── TAB 1: 3D SCULPTURES AUCTION (White 3D Cylinders with Spotlights - แถวละ 2 รูปปั้น) ─── */}
      {activeType === 'statues' && (
        <div className="relative pt-4 sm:pt-6 pb-10">
          {filteredStatues.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 xs:gap-x-6 sm:gap-x-10 md:gap-x-14 gap-y-10 sm:gap-y-14 md:gap-y-16 justify-items-center max-w-4xl mx-auto">
              {filteredStatues.map((item) => {
                const statue = item as StatueItem;
                const isOwned = myTeam.statueInventory.includes(statue.id);
                const imageSrc = statue.sculptureImage || statue.frontImage || `/sculptures/${statue.id}.webp`;

                return (
                  <MuseumPedestal
                    key={`store-statue-${statue.id}`}
                    imageSrc={imageSrc}
                    alt={statue.nameTh}
                    isOwned={isOwned}
                    name={statue.nameTh}
                    nameEn={statue.nameEn}
                    price={statue.price}
                    itemType="statue"
                    onClick={() => onSelectItem({ ...statue, itemType: 'statue' })}
                    onBuyNow={(e) => {
                      e.stopPropagation();
                      setConfirmBuyTarget({ type: 'statue', id: statue.id, name: statue.nameTh, price: statue.price });
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center rounded-[16px] border border-dashed border-rose-900/50 bg-[#0d050c]/50 p-6 space-y-2 max-w-lg mx-auto">
              <div className="font-serif text-base text-rose-200 font-bold">
                คุณได้ครอบครองประติมากรรมทั้งหมดแล้ว
              </div>
              <p className="text-xs text-rose-300/60">
                คลิกปุ่ม &quot;ซ่อนสินค้าที่ซื้อแล้ว&quot; ด้านบนเพื่อดูรายการประติมากรรมทั้งหมด
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: HISTORICAL EVIDENCE WORLD UNDERNEATH / LOVE & DEEPSPACE ROADMAP ─── */}
      {activeType === 'evidence' && (
        <EvidenceWorldUnderneathView
          myTeam={myTeam}
          onSelectRoom={(room) => setSelectedRoomForDossier(room)}
        />
      )}

      {/* ─── TAB 3: MUSEUM EXHIBIT STORIES & PLACARDS ─── */}
      {activeType === 'stories' && (
        <StoryPlacardsView
          myTeam={myTeam}
          isBuying={isBuying}
          onBuyItem={(id) => onBuyItem('story', id)}
          hideOwned={hideOwned}
        />
      )}

      {/* ─── EVIDENCE ARCHIVE / DOSSIER VIEWER MODAL ─── */}
      {selectedRoomForDossier && (
        <EvidenceDossierModal
          room={selectedRoomForDossier}
          onClose={() => setSelectedRoomForDossier(null)}
          myTeam={myTeam}
          onBuyItem={(type, id) => {
            const ev = EVIDENCE_ITEMS.find((e) => e.id === id);
            if (ev) {
              setConfirmBuyTarget({ type: 'evidence', id: ev.id, name: ev.titleTh, price: ev.price });
            }
          }}
          isBuying={isBuying}
        />
      )}

      {/* ─── HOLOGRAPHIC TERMINAL BUY CONFIRMATION MODAL ─── */}
      {confirmBuyTarget && (
        <HologramConfirmModal
          title={confirmBuyTarget.type === 'evidence' ? 'Notice' : 'Notice'}
          itemName={confirmBuyTarget.name}
          itemType={confirmBuyTarget.type}
          currentBudget={myTeam?.budget ?? 0}
          price={confirmBuyTarget.price}
          warningNote={
            confirmBuyTarget.type === 'evidence'
              ? 'หากซื้อหลักฐานเท็จ คุณจะถูกหักคะแนน'
              : undefined
          }
          onCancel={() => setConfirmBuyTarget(null)}
          onConfirm={() => {
            onBuyItem(confirmBuyTarget.type, confirmBuyTarget.id);
            setConfirmBuyTarget(null);
          }}
          isLoading={isBuying}
        />
      )}

    </div>
  );
};
