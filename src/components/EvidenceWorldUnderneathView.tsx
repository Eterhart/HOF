'use client';

import React from 'react';
import { ExhibitionRoom, TeamState } from '@/data/types';
import { EXHIBITION_ROOMS } from '@/data/gameData';

interface EvidenceWorldUnderneathViewProps {
  myTeam: TeamState;
  onSelectRoom: (room: ExhibitionRoom) => void;
}

// Map each room to authentic historical photographs in public/history_covers/ & archive cards
const ROOM_COVER_IMAGES: Record<string, string> = {
  'CAT-1': '/history_covers/korean_war.webp',
  'CAT-2': '/history_covers/vietnam_war.webp',
  'CAT-3': '/history_covers/cuban_crisis.webp',
  'CAT-4': '/history_covers/berlin_wall.webp',
  'CAT-5': '/history_covers/united_nations.webp',
  'CAT-6': '/history_covers/eu.webp',
  'CAT-7': '/history_covers/asean.webp',
  'CAT-8': '/history_covers/wto_hq.webp',
};

const ROOM_CODE_NAMES: Record<string, { code: string; serial: string }> = {
  'CAT-1': { code: 'KW-01', serial: 'A-101' },
  'CAT-2': { code: 'VW-02', serial: 'A-102' },
  'CAT-3': { code: 'CM-03', serial: 'A-103' },
  'CAT-4': { code: 'BW-04', serial: 'A-104' },
  'CAT-5': { code: 'UN-05', serial: 'A-105' },
  'CAT-6': { code: 'EU-06', serial: 'A-106' },
  'CAT-7': { code: 'AS-07', serial: 'A-107' },
  'CAT-8': { code: 'WT-08', serial: 'A-108' },
};

export const EvidenceWorldUnderneathView: React.FC<EvidenceWorldUnderneathViewProps> = ({
  myTeam,
  onSelectRoom,
}) => {
  return (
    <div className="relative w-full min-h-[900px] overflow-hidden rounded-[24px] bg-[#070609] border border-rose-950/60 shadow-[0_25px_70px_rgba(0,0,0,0.85)] my-3 sm:my-6 select-none">
      {/* ── AMBIENT SCI-FI BACKGROUND & NEBULA LIGHTING ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Deep Crimson & Indigo Nebula Glows */}
        <div
          className="absolute top-0 left-0 w-full h-[600px] opacity-40"
          style={{
            background:
              'radial-gradient(circle at 20% 25%, rgba(225, 29, 72, 0.25) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(159, 18, 57, 0.20) 0%, transparent 60%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-full h-[600px] opacity-35"
          style={{
            background:
              'radial-gradient(circle at 75% 75%, rgba(225, 29, 72, 0.22) 0%, transparent 65%), radial-gradient(circle at 25% 90%, rgba(136, 19, 55, 0.18) 0%, transparent 60%)',
          }}
        />

        {/* Faint Grid Lines & Holographic Watermark HUD */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Atmospheric Sci-fi Coordinates & Text */}
        <div className="absolute top-6 right-6 font-mono text-[9px] sm:text-[10px] text-rose-500/30 tracking-[0.2em] text-right space-y-0.5">
          <div>SYS.LOC // SECTOR-08</div>
          <div>LAT: 37°58&apos;N // LONG: 126°53&apos;E</div>
          <div>SECURITY: LEVEL 5 (CLASSIFIED)</div>
        </div>

        <div className="absolute bottom-6 left-6 font-mono text-[9px] text-rose-500/25 tracking-[0.25em] space-y-0.5">
          <div>ARCHIVE PROTOCOL: 0x8F94B</div>
          <div>ENCRYPTED DOSSIER NETWORK</div>
        </div>
      </div>

      {/* ── TOP HEADER (World Underneath Style) ── */}
      <div className="relative z-10 px-5 sm:px-8 pt-7 sm:pt-9 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-rose-900/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" />
            <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.3em] uppercase text-rose-400/90">
              The Unseen Side // Confidential Records
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif tracking-wider font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-100 to-rose-300 drop-shadow-[0_2px_12px_rgba(225,29,72,0.4)]">
            Case Files
          </h2>
          <p className="text-xs sm:text-sm text-rose-200/60 font-sans tracking-wide mt-0.5">
            คลังแฟ้มลับและเอกสารประวัติศาสตร์ — แตะที่แฟ้มเพื่อเปิดดูหลักฐานและสแกน QR Code
          </p>
        </div>

        {/* Collection Summary Badge */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800/50 backdrop-blur-md flex items-center gap-2.5">
            <span className="text-[11px] font-mono text-rose-300/80">EVIDENCE ACQUIRED</span>
            <span className="text-sm font-mono font-bold text-white tracking-wider">
              {myTeam.evidenceInventory.length} <span className="text-xs text-rose-400/60">/ 4</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── ZIGZAG ROADMAP CONSTELLATION CONTAINER ── */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-14">
        {/* Glowing Red Connecting Vector Path (SVG Desktop & Tablet) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none hidden sm:block z-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="lineGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e11d48" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Zigzag lines between the 8 nodes */}
          <path
            d="
              M 30% 120
              L 70% 320
              L 30% 540
              L 70% 760
              L 30% 980
              L 70% 1200
              L 30% 1420
              L 70% 1640
            "
            fill="none"
            stroke="url(#lineGlow)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            filter="url(#glow)"
            className="opacity-70 animate-pulse"
          />
        </svg>

        {/* ── 8 EXHIBITION ROOM NODES ── */}
        <div className="relative z-10 space-y-10 sm:space-y-16">
          {EXHIBITION_ROOMS.map((room, index) => {
            const isEven = index % 2 === 1; // 0 is left (01), 1 is right (02), etc.
            const cleanNameTh = room.nameTh.replace(/\s*\([^)]*\)/g, '').trim();
            const cleanNameEn = room.nameEn.replace(/\s*\([^)]*\)/g, '').trim();

            const allRoomEvidenceIds = [...room.targetEvidenceIds, room.trapEvidenceId];
            const ownedInRoom = allRoomEvidenceIds.filter((id) => myTeam.evidenceInventory.includes(id)).length;
            const isFullyCompleted = ownedInRoom === allRoomEvidenceIds.length;

            const coverImage = ROOM_COVER_IMAGES[room.id] || '/cards/evidence/1.webp';
            const nodeNumber = String(index + 1).padStart(2, '0');
            const codeData = ROOM_CODE_NAMES[room.id] || { code: 'A-100', serial: 'A-100' };

            return (
              <div
                key={room.id}
                className={`flex w-full ${isEven ? 'justify-end' : 'justify-start'} items-center`}
              >
                <div
                  onClick={() => onSelectRoom(room)}
                  className={`group relative cursor-pointer w-full max-w-[280px] xs:max-w-[310px] sm:max-w-[340px] md:max-w-[370px] transition-all duration-300 active:scale-95 ${
                    isEven
                      ? 'sm:rotate-[2.5deg] hover:sm:rotate-0 hover:sm:translate-x-[-8px]'
                      : 'sm:rotate-[-2.5deg] hover:sm:rotate-0 hover:sm:translate-x-[8px]'
                  }`}
                >
                  {/* ── GIANT GLOWING SERIF NUMBER (Top Left / Right) ── */}
                  <div
                    className={`absolute -top-7 sm:-top-9 ${
                      isEven ? 'right-2 text-right' : 'left-2 text-left'
                    } z-20 pointer-events-none select-none`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-serif italic font-light text-4xl sm:text-5xl text-white/30 group-hover:text-rose-400/90 transition-colors drop-shadow-[0_0_15px_rgba(225,29,72,0.5)]">
                        {nodeNumber}
                      </span>
                      <div className="w-10 sm:w-16 h-[1px] bg-gradient-to-r from-rose-500/40 to-transparent" />
                    </div>
                  </div>

                  {/* ── CARD BODY ── */}
                  <div className="relative rounded-[16px] sm:rounded-[20px] overflow-hidden bg-[#11060b] border border-rose-900/50 group-hover:border-rose-500/90 shadow-[0_15px_35px_rgba(0,0,0,0.85)] group-hover:shadow-[0_0_35px_rgba(225,29,72,0.45)] transition-all duration-300">
                    {/* Top Status & Serial Pill */}
                    <div className="absolute top-2.5 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
                      <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-rose-500/30 text-[9px] font-mono font-medium text-rose-300 tracking-wider">
                        {codeData.code}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full backdrop-blur-md text-[9px] font-mono font-semibold tracking-wider flex items-center gap-1.5 ${
                          isFullyCompleted
                            ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                            : ownedInRoom > 0
                            ? 'bg-rose-950/80 border border-rose-500/50 text-rose-200'
                            : 'bg-black/60 border border-white/20 text-white/70'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isFullyCompleted
                              ? 'bg-emerald-400 animate-pulse'
                              : ownedInRoom > 0
                              ? 'bg-rose-400 animate-pulse'
                              : 'bg-white/40'
                          }`}
                        />
                        {ownedInRoom > 0 ? `${ownedInRoom}/5 ACQUIRED` : 'DOSSIER'}
                      </span>
                    </div>

                    {/* Image Area (Tall Cinematic Ratio - Black & White Grayscale) */}
                    <div className="relative aspect-[16/11] sm:aspect-[16/10] w-full overflow-hidden bg-black">
                      <img
                        src={coverImage}
                        alt={cleanNameTh}
                        className="w-full h-full object-cover object-center grayscale contrast-125 brightness-95 group-hover:scale-105 group-hover:contrast-130 transition-all duration-500"
                        loading="lazy"
                      />

                      {/* Vignette & Sci-Fi Overlay Gradients */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#11060b] via-[#11060b]/40 to-transparent pointer-events-none" />
                      <div className="absolute inset-0 bg-rose-950/20 mix-blend-color pointer-events-none" />

                      {/* Subtle Tech Crosshair in Image Corner */}
                      <div className="absolute bottom-2 right-2.5 font-mono text-[8px] text-white/40 tracking-widest pointer-events-none">
                        + // {codeData.serial}
                      </div>
                    </div>

                    {/* ── CARD BOTTOM INFO SECTION ── */}
                    <div className="relative px-3.5 sm:px-4.5 pt-2 pb-3.5 sm:pb-4 space-y-2 bg-[#11060b]">
                      <div>
                        <h3 className="text-base sm:text-lg font-serif font-bold text-white group-hover:text-rose-200 transition-colors tracking-wide leading-tight line-clamp-1">
                          {cleanNameTh}
                        </h3>
                        <p className="text-[11px] sm:text-xs font-mono text-rose-300/70 tracking-wide mt-0.5 line-clamp-1">
                          {cleanNameEn}
                        </p>
                      </div>

                      {/* Barcode & Decorative Cyber Dotted Line */}
                      <div className="flex items-center justify-between pt-1 border-t border-rose-950/80">
                        <div className="flex items-center gap-1">
                          <span className="h-2.5 w-[2px] bg-rose-500/70" />
                          <span className="h-2.5 w-[3px] bg-rose-500/40" />
                          <span className="h-2.5 w-[1px] bg-rose-500/90" />
                          <span className="h-2.5 w-[4px] bg-rose-500/50" />
                          <span className="h-2.5 w-[1px] bg-rose-500/80" />
                          <span className="h-2.5 w-[2px] bg-rose-500/60" />
                          <span className="text-[9px] font-mono text-rose-400/60 ml-1 tracking-widest">
                            CLASSIFIED
                          </span>
                        </div>

                        <span className="text-[10px] font-mono text-rose-300 group-hover:text-white flex items-center gap-1 font-semibold tracking-wider">
                          INSPECT
                          <span className="text-xs text-rose-400 group-hover:translate-x-0.5 transition-transform">
                            →
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Laser Border Accent when Hovered */}
                    <div className="absolute inset-0 rounded-[16px] sm:rounded-[20px] pointer-events-none border border-rose-500/0 group-hover:border-rose-500/50 transition-colors duration-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── FOOTER HINT ── */}
      <div className="relative z-10 py-5 text-center border-t border-rose-950/60 bg-[#0a0508]/80 backdrop-blur-md">
        <p className="text-[11px] sm:text-xs font-mono text-rose-400/75 tracking-wider">
          ✦ แตะการ์ดเพื่อสแกน QR CODE ตรวจสอบหลักฐานจริง/เท็จ และประมูลเข้าคลัง ✦
        </p>
      </div>
    </div>
  );
};
