import { NextRequest, NextResponse } from 'next/server';
import {
  createNewSession,
  getAllSessions,
  getAllFullSessions,
  getSessionById,
  getSessionByCode,
  deleteSession,
  createTeam,
  joinTeam,
  reclaimMemberIdentity,
  leaveTeam,
  purchaseItem,
  submitExhibitionRoom,
  unlockTeamSubmission,
  unlockAllTeamsSubmission,
  setGamePhase,
  updateSessionDuration,
  resetGameSession,
  restartPhaseTimer,
  togglePauseGame,
  updateTeacherRubric,
  shuffleTeamsRooms,
  updateTeamName,
  updateMemberName,
  updateSessionName,
} from '@/lib/gameState';

export const dynamic = 'force-dynamic';

// GET /api/game            → all sessions summary (teacher dashboard)
// GET /api/game?archive=true → all full sessions state (museum archive)
// GET /api/game?sid=XXX    → single session state (student polling by sessionId)
// GET /api/game?code=CUR001 → single session state (student join by code)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sid = searchParams.get('sid');
  const code = searchParams.get('code');
  const archive = searchParams.get('archive');

  if (archive === 'true') {
    return NextResponse.json(getAllFullSessions());
  }

  if (sid) {
    const session = getSessionById(sid);
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    return NextResponse.json(session);
  }

  if (code) {
    const session = getSessionByCode(code.toUpperCase());
    if (!session) return NextResponse.json({ error: 'ไม่พบรหัส Session นี้' }, { status: 404 });
    return NextResponse.json(session);
  }

  // Default: return all sessions summary
  return NextResponse.json(getAllSessions());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, sessionId } = body;

    // ─── Session management (no sessionId needed) ──────────────────────────
    if (action === 'create_session') {
      const { sessionName, sessionCode } = body;
      const session = createNewSession(sessionName || 'รอบการเล่นใหม่', sessionCode);
      return NextResponse.json(session);
    }

    if (action === 'delete_session') {
      if (!sessionId) return NextResponse.json({ error: 'กรุณาระบุ sessionId' }, { status: 400 });
      const ok = deleteSession(sessionId);
      return NextResponse.json({ success: ok });
    }

    if (action === 'shuffle_rooms') {
      if (!sessionId) return NextResponse.json({ error: 'กรุณาระบุ sessionId' }, { status: 400 });
      const session = shuffleTeamsRooms(sessionId);
      if (!session) return NextResponse.json({ error: 'ไม่พบ Session' }, { status: 404 });
      return NextResponse.json(session);
    }

    // ─── All other actions require sessionId ───────────────────────────────
    if (!sessionId) {
      return NextResponse.json({ error: 'กรุณาระบุ sessionId' }, { status: 400 });
    }

    switch (action) {
      case 'create_team': {
        const { teamName, leaderName } = body;
        if (!teamName) {
          return NextResponse.json({ error: 'กรุณาระบุชื่อกลุ่ม' }, { status: 400 });
        }
        const result = createTeam(sessionId, teamName, leaderName);
        if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
        return NextResponse.json(result);
      }

      case 'join_team': {
        const { code, memberName } = body;
        if (!code) return NextResponse.json({ error: 'กรุณาระบุรหัสกลุ่ม' }, { status: 400 });
        const result = joinTeam(sessionId, code, memberName);
        if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
        return NextResponse.json(result);
      }

      case 'reclaim_identity': {
        const { teamId, memberId } = body;
        if (!teamId || !memberId) return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
        const result = reclaimMemberIdentity(sessionId, teamId, memberId);
        if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
        return NextResponse.json(result);
      }

      case 'leave_team': {
        const { teamId, memberId } = body;
        if (!teamId || !memberId) return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
        const result = leaveTeam(sessionId, teamId, memberId);
        if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
        return NextResponse.json(result);
      }

      case 'update_team_name': {
        const { teamId, newName } = body;
        if (!teamId || !newName) return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
        const result = updateTeamName(sessionId, teamId, newName);
        if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
        return NextResponse.json(result);
      }

      case 'update_session_name': {
        const { newName } = body;
        if (!newName) return NextResponse.json({ error: 'กรุณาระบุชื่อห้องใหม่' }, { status: 400 });
        const result = updateSessionName(sessionId, newName);
        if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
        return NextResponse.json(result);
      }

      case 'update_member_name': {
        const { teamId, memberId, newName } = body;
        if (!teamId || !memberId || !newName) return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
        const result = updateMemberName(sessionId, teamId, memberId, newName);
        if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
        return NextResponse.json(result);
      }

      case 'buy_item': {
        const { teamId, memberName, itemType, itemId } = body;
        if (!teamId || !itemType || !itemId) {
          return NextResponse.json({ error: 'ข้อมูลการสั่งซื้อไม่ครบ' }, { status: 400 });
        }
        const result = purchaseItem(sessionId, teamId, memberName || 'สมาชิก', itemType, itemId);
        if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
        return NextResponse.json(result);
      }

      case 'submit_room': {
        const { teamId, memberName } = body;
        if (!teamId) return NextResponse.json({ error: 'กรุณาระบุ Team ID' }, { status: 400 });
        const result = submitExhibitionRoom(sessionId, teamId, memberName);
        return NextResponse.json(result);
      }

      case 'unlock_team_submission':
      case 'allow_resubmit': {
        const { teamId } = body;
        if (!teamId) return NextResponse.json({ error: 'กรุณาระบุ Team ID' }, { status: 400 });
        const result = unlockTeamSubmission(sessionId, teamId);
        if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
        return NextResponse.json(result);
      }

      case 'unlock_all_teams_submission':
      case 'allow_resubmit_all': {
        const result = unlockAllTeamsSubmission(sessionId);
        if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
        return NextResponse.json(result);
      }

      case 'set_phase': {
        const { phase, durationSeconds } = body;
        if (!phase) return NextResponse.json({ error: 'กรุณาระบุ Phase' }, { status: 400 });
        const session = setGamePhase(sessionId, phase, durationSeconds);
        if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        return NextResponse.json(session);
      }

      case 'update_duration': {
        const { durationSeconds } = body;
        if (typeof durationSeconds !== 'number') {
          return NextResponse.json({ error: 'durationSeconds is required' }, { status: 400 });
        }
        const session = updateSessionDuration(sessionId, durationSeconds);
        if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        return NextResponse.json(session);
      }

      case 'reset_game': {
        const session = resetGameSession(sessionId);
        if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        return NextResponse.json(session);
      }

      case 'restart_timer':
      case 'restart_phase_timer': {
        const session = restartPhaseTimer(sessionId);
        if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        return NextResponse.json(session);
      }

      case 'toggle_pause':
      case 'pause_game':
      case 'resume_game': {
        const session = togglePauseGame(sessionId);
        if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        return NextResponse.json(session);
      }

      case 'save_rubric': {
        const { teamId, rubric } = body;
        if (!teamId || !rubric) {
          return NextResponse.json({ error: 'ข้อมูลการประเมินไม่ครบถ้วน' }, { status: 400 });
        }
        const result = updateTeacherRubric(sessionId, teamId, rubric);
        if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    console.error('[API] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
