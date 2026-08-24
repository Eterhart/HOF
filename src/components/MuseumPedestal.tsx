'use client';

import React from 'react';
import { Lock, Check } from 'lucide-react';

interface MuseumPedestalProps {
  imageSrc?: string;
  alt: string;
  isOwned?: boolean;
  name: string;
  nameEn?: string;
  price?: number;
  itemType?: 'statue' | 'evidence';
  className?: string;
  onClick?: () => void;
  onBuyNow?: (e: React.MouseEvent) => void;
  isInventory?: boolean;
}

export const MuseumPedestal: React.FC<MuseumPedestalProps> = ({
  imageSrc = '',
  alt,
  isOwned = false,
  name,
  nameEn,
  price,
  className = '',
  onClick,
  onBuyNow,
  isInventory = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative isolate flex flex-col items-center w-full cursor-pointer select-none transition-all duration-300 active:scale-[0.98] ${className}`}
    >
      {/* ─── Horizontal Black Banner: Sold Out (แถบดำโปร่งแสงชัดเจน มองเห็นรูปปั้นด้านหลัง) ─── */}
      {isOwned && (
        <div className="absolute top-[36%] left-0 right-0 z-30 flex items-center justify-center pointer-events-none">
          <div
            className="w-[78%] max-w-[165px] sm:max-w-[195px] py-1.5 flex items-center justify-center shadow-lg select-none backdrop-blur-sm bg-black/35 border-y border-white/20"
            style={{
              maskImage: 'linear-gradient(90deg, transparent 0%, black 20%, black 80%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 20%, black 80%, transparent 100%)',
            }}
          >
            <span className="text-white font-sans font-bold text-xs sm:text-sm tracking-[0.25em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
              Sold Out
            </span>
          </div>
        </div>
      )}

      {/* ─── 1. VOLUMETRIC SPOTLIGHT ─── */}
      <div
        className={`absolute -top-10 left-1/2 -translate-x-1/2 w-[180px] sm:w-[240px] md:w-[280px] h-[270px] sm:h-[310px] md:h-[350px] pointer-events-none flex flex-col items-center z-0 ${
          isOwned ? 'opacity-25' : 'opacity-70'
        }`}
      >
        {/* Overhead Spot Origin */}
        <div className="w-8 sm:w-10 h-1 sm:h-1.5 bg-amber-100/90 rounded-full blur-[1.5px] shadow-[0_0_12px_rgba(255,230,180,0.9)] mb-0.5" />

        {/* Feathered Volumetric Light Cone */}
        <div
          className="w-full h-full opacity-60 group-hover:opacity-85 transition-opacity duration-500"
          style={{
            clipPath: 'polygon(38% 0%, 62% 0%, 100% 100%, 0% 100%)',
            background:
              'linear-gradient(180deg, rgba(255, 235, 190, 0.65) 0%, rgba(255, 220, 160, 0.25) 40%, rgba(255, 200, 140, 0.08) 75%, transparent 100%)',
            filter: 'blur(8px)',
          }}
        />
      </div>

      {/* ─── 2. Sculpture 3D Object + High-Tech Mount (z-20) ─── */}
      <div
        className={`relative z-20 w-full flex flex-col items-center justify-end -mb-4 sm:-mb-5 transition-transform duration-500 ease-out group-hover:-translate-y-2 ${
          isOwned ? 'opacity-40 grayscale-[35%]' : ''
        }`}
      >
        {imageSrc ? (
          <>
            <div className="relative w-32 h-36 xs:w-36 xs:h-40 sm:w-44 sm:h-48 md:w-48 md:h-52 flex items-end justify-center">
              <img
                src={imageSrc}
                alt={alt}
                className="max-w-full max-h-full object-contain object-bottom filter transition-all duration-500 drop-shadow-[0_12px_20px_rgba(0,0,0,0.6)] group-hover:drop-shadow-[0_18px_28px_rgba(225,29,72,0.3)]"
                loading="lazy"
              />

              {/* Lock Badge when in Inventory & Unowned */}
              {isInventory && !isOwned && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/75 backdrop-blur-md border border-rose-500/60 shadow-lg flex items-center justify-center">
                    <Lock className="w-4 h-4 text-rose-300" />
                  </div>
                </div>
              )}
            </div>

            {/* High-Tech Circular Turntable Base Mount */}
            <div className="flex flex-col items-center -mt-1 z-20">
              {/* Vertical Metal Stem */}
              <div className="w-1 sm:w-1.5 h-3.5 sm:h-4.5 bg-gradient-to-r from-[#2a2a2e] via-[#8e8e93] to-[#1c1c1e] rounded-xs shadow-sm" />

              {/* Sci-Fi Turntable Rim Resting ON the Cloth */}
              <div
                className="w-14 sm:w-16 h-3 sm:h-3.5 rounded-[50%] shadow-lg -mt-0.5 border-t border-rose-400/40 relative z-20"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 30%, #3a3a40 0%, #1c1c20 60%, #0c0c0e 100%)',
                }}
              >
                <div className="absolute inset-0.5 rounded-[50%] border border-rose-500/20 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-1 rounded-full bg-rose-500/40 blur-[1px]" />
              </div>
            </div>
          </>
        ) : (
          <div className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 flex items-center justify-center" />
        )}
      </div>

      {/* ─── 3. DRAPED VELVET CLOTH PEDESTAL (ผ้าคลุมแท่นทรงกระบอก) (z-10) ─── */}
      <div
        className={`relative w-full max-w-[170px] xs:max-w-[195px] sm:max-w-[240px] md:max-w-[270px] flex flex-col items-center z-10 ${
          !isOwned && isInventory ? 'opacity-40 grayscale-[50%]' : isOwned && !isInventory ? 'opacity-65' : ''
        }`}
      >
        {/* Top Cloth Cap (หัวแท่นวงรีคลุมผ้า) */}
        <div
          className="w-full h-8 sm:h-10 rounded-[50%] z-10 relative shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.8)] border-t border-white/15"
          style={{
            background:
              'radial-gradient(ellipse at 50% 35%, #4a3a3e 0%, #2e2024 45%, #180f12 85%, #0e0709 100%)',
          }}
        >
          {/* Subtle Cloth Weave Grain */}
          <div
            className="absolute inset-0 rounded-[50%] opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)',
            }}
          />

          {/* ── Gold Framed Price Plaque (วางอยู่บนขวาตามภาพตัวอย่าง) ── */}
          {!isInventory && !isOwned && price !== undefined && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (onBuyNow) onBuyNow(e);
              }}
              className="absolute -top-3 sm:-top-3.5 right-1 sm:right-2 z-30 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-[4px] bg-[#1a120b] border border-[#d4af37] shadow-[0_2px_10px_rgba(212,175,55,0.35)] hover:shadow-[0_0_15px_rgba(245,208,97,0.7)] hover:border-[#f5d061] active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-1 group/btn"
              title="สั่งซื้อประติมากรรม"
            >
              {/* Small Gold Corner Screws / Accents */}
              <span className="text-[9px] sm:text-[10px] text-[#f5d061] font-mono font-medium opacity-85">฿</span>
              <span className="text-[11px] sm:text-xs font-mono font-bold text-[#f5d061] tracking-wider group-hover/btn:text-white transition-colors">
                {price.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* ── Vertical Draped Cloth Body with Flowing Velvet Folds ── */}
        <div
          className="w-full min-h-[125px] sm:min-h-[145px] -mt-4 sm:-mt-5 flex flex-col items-center justify-start pt-6 sm:pt-7 pb-5 px-2.5 z-0 relative overflow-hidden transition-all duration-300 shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
          style={{
            /* Draped velvet cloth texture with alternating vertical highlights and deep fold shadows */
            background:
              'linear-gradient(90deg, #0d070a 0%, #1f1418 8%, #0d070a 16%, #3a282e 26%, #180f12 36%, #4a353c 50%, #180f12 64%, #3a282e 74%, #0d070a 84%, #1f1418 92%, #0d070a 100%)',
            maskImage:
              'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 75%, rgba(0,0,0,0.3) 92%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 75%, rgba(0,0,0,0.3) 92%, rgba(0,0,0,0) 100%)',
          }}
        >
          {/* Subtle Fabric Grain Overlay */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 2px)',
            }}
          />

          {/* Central Highlight Fold on Cloth */}
          <div className="absolute left-[44%] right-[44%] top-0 bottom-0 bg-white/10 blur-[6px] pointer-events-none" />

          {/* ── Item Label Printed on Draped Cloth Face ── */}
          <div className="relative z-10 text-center space-y-1 w-full px-1 pt-1">
            <h3 className="text-sm sm:text-base md:text-[17px] font-serif font-extrabold text-white tracking-wide leading-snug group-hover:text-[#f5d061] transition-colors break-words drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
              {name}
            </h3>

            {nameEn && nameEn !== name && (
              <p className="text-[9.5px] sm:text-[11px] text-rose-300/80 font-mono uppercase tracking-wider leading-tight break-words">
                {nameEn}
              </p>
            )}

            {/* Inventory Status Pill */}
            {isInventory && (
              <div className="pt-2 flex items-center justify-center">
                <span
                  className={`text-[10px] sm:text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full border backdrop-blur-md ${
                    isOwned
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                      : 'bg-black/60 text-white/50 border-white/20'
                  }`}
                >
                  {isOwned ? '✓ ในคลังสะสม' : 'ยังไม่ครอบครอง'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

