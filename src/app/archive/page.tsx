'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArchiveMuseumModal } from '@/components/ArchiveMuseumModal';

function ArchivePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionCode = searchParams.get('session') || searchParams.get('code') || undefined;
  const teamId = searchParams.get('team') || undefined;

  // Poll session state if student is in a live session. When teacher ends game -> auto-redirect to Leaderboard!
  useEffect(() => {
    if (!sessionCode) return;

    const checkSessionPhase = async () => {
      try {
        const res = await fetch(`/api/game?code=${sessionCode.toUpperCase()}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.phase === 'LEADERBOARD') {
            // ครูจบเกมแล้ว -> พานักเรียนกลับไปหน้าสรุปผลการจัดนิทรรศการทันที
            router.push(`/?session=${sessionCode}`);
          }
        }
      } catch (err) {
        console.error('Failed to poll session phase in archive:', err);
      }
    };

    checkSessionPhase();
    const interval = setInterval(checkSessionPhase, 1500);
    return () => clearInterval(interval);
  }, [sessionCode, router]);

  const handleClose = () => {
    if (sessionCode) {
      router.push(`/?session=${sessionCode}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0307] text-white">
      <ArchiveMuseumModal
        isOpen={true}
        onClose={handleClose}
        initialSessionCode={sessionCode}
        initialTeamId={teamId}
      />
    </div>
  );
}

export default function ArchivePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#030712] flex items-center justify-center text-sky-300 font-mono text-sm">
          กำลังโหลดหอเกียรติยศและนิทรรศการ...
        </div>
      }
    >
      <ArchivePageContent />
    </Suspense>
  );
}
