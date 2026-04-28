"use client";
import { useEffect, useState, useRef } from "react";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import socket from "@/app/socket";
import Loading from "@/components/Loading";

const server_url =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_SERVER_URL
    : process.env.NEXT_PUBLIC_DEV_SERVER_URL;

export default function PostGamePage() {
  const { user } = useAuth();
  const {
    join_code,
    questionsSummary,
    winners,
    gameId,
    setgameId,
    setSettings,
    setJoin_code,
    setStatus,
    setPlayers,
    setCurrentQuestionIndex,
    setLeaderboard,
    setWinners,
    resetContext,
    studentAISummary,
    setStudentAISummary,
    teacherAISummary,
    setTeacherAISummary,
  } = useGame();
  const router = useRouter();
  const hasFetchedRef = useRef(false);
  const waitingOnHostRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [waitingOnHost, setWaitingOnHost] = useState(false);

  const [stickyWinners, setStickyWinners] = useState(winners);

  const setStudentWaiting = (value) => {
    setWaitingOnHost(value);
    waitingOnHostRef.current = value;
  };

  const getStudentFeedback = async () => {
    try {
      const res = await fetch(`${server_url}/api/aiSummaries/student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_id: gameId,
          user_id: user.id,
          summary: questionsSummary,
          studentName: user.name,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch student feedback");

      const data = await res.json();

      setStudentAISummary(data.summary || "");
    } catch (err) {
      console.error("Error fetching student feedback:", err);
      setError("Could not load student feedback");
    } finally {
      setLoading(false);
    }
  };

  const getTeacherFeedback = async () => {
    try {
      const res = await fetch(`${server_url}/api/aiSummaries/teacher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_id: gameId,
          user_id: user.id,
          summary: questionsSummary,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch teacher feedback");

      const data = await res.json();
      setTeacherAISummary(data.summary || "");
    } catch (error) {
      console.error("Error fetching teacher feedback:", error);
      setError("Could not load teacher feedback");
    } finally {
      setLoading(false);
    }
  };

  const joinLobby = () => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit(
      "join-game",
      { name: user.name, role: user.role, join_code },
      (game) => {
        if (game) {
          setgameId(game.gameId);
          setSettings(game.settings);
          setJoin_code(game.join_code);
          setStatus(game.status);
          setPlayers(game.players);
          setCurrentQuestionIndex(game.currentQuestionIndex);
          setLeaderboard(game.leaderboard);
          setWinners(game.winners);

          router.push(`/lobby/${game.join_code}`);
        } else {
          if (!waitingOnHostRef.current) return;

          setTimeout(() => {
            joinLobby();
          }, 3000);
        }
      },
    );
  };

  const handleBackToLobby = () => {
    if (user.role === "teacher") {
      socket.emit("reset-game", { join_code });

      setTimeout(() => {
        router.push(`/lobby/${join_code}`);
      }, 200); // small delay
    } else {
      setStudentWaiting(true);

      joinLobby();
    }
  };

  const handleBackToDashboard = () => {
    socket.emit("leave-game", { join_code });
    resetContext(null);
    router.push("/dashboard");
  };

  useEffect(() => {
    if (questionsSummary == null || winners == null) return;
    if (hasFetchedRef.current) return; // prevent a double call in dev/prod
    hasFetchedRef.current = true;

    if (user.role == "student") {
      getStudentFeedback();
    } else {
      getTeacherFeedback();
    }

    if (!stickyWinners) {
      setStickyWinners(winners);
    }
  }, [questionsSummary, winners, user.role]);

  return loading ? (
    <Loading />
  ) : (
    <>
      <style>{`
        @keyframes bg-pulse {
          0%, 49% { background-color: #fdba74; }
          50%, 100% { background-color: #c084fc; }
        }
        @keyframes drift {
          from { background-position: 0 0; }
          to { background-position: 400px 400px; }
        }
        .animate-bg-flip { animation: bg-pulse 6s infinite; }
        .animate-drift { animation: drift 40s linear infinite; }
      `}</style>
      <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden animate-bg-flip">
        <div
          className="absolute inset-[-100%] z-0 rotate-[-10deg] pointer-events-none animate-drift"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cg font-family='Arial Black, sans-serif' font-weight='900' font-size='150' fill='black' fill-opacity='0.12'%3E%3Ctext x='20' y='140' transform='rotate(-5 50 100)'%3E?%3C/text%3E%3Ctext x='220' y='180' transform='rotate(15 280 140)'%3E!%3C/text%3E%3Ctext x='110' y='360' transform='rotate(-12 150 320)'%3E✓%3C/text%3E%3Ctext x='280' y='380' transform='rotate(8 320 350)' font-size='100'%3E?%3C/text%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "400px 400px",
          }}
        />
        <div className="z-10 flex flex-col max-h-screen items-center overflow-y-auto pb-8">
          <h1 className="text-5xl font-black uppercase mb-8">Game Over</h1>

          {/* Final Scores */}
          <div className="w-full max-w-[700px] border-[6px] border-black bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
            <div className="border-b-[6px] border-black bg-cyan-400 p-6 text-center">
              <h2 className="text-3xl font-black uppercase italic">
                Final Scores
              </h2>
            </div>

            <div className="p-6 space-y-3">
              {loading ? (
                <div className="text-center font-black text-xl">
                  Loading scores...
                </div>
              ) : stickyWinners?.length > 0 ? (
                stickyWinners.map((player, i) => (
                  <div
                    key={i}
                    className="flex justify-between border-4 border-black p-3 font-black text-lg"
                  >
                    <span>{player.name}</span>
                    <span>{player.score ?? 0}</span>
                  </div>
                ))
              ) : (
                <div className="text-center font-black text-xl">
                  No scores available
                </div>
              )}
            </div>
          </div>

          {/* Teacher AI Summary */}
          {user.role === "teacher" && (
            <div className="w-full max-w-[700px] mt-8 border-[6px] border-black bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
              <div className="border-b-[6px] border-black bg-purple-400 p-6 text-center">
                <h2 className="text-3xl font-black uppercase italic">
                  Teacher AI Summary
                </h2>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="text-center font-black text-lg">
                    Generating AI summary...
                  </div>
                ) : error ? (
                  <div className="text-center font-black text-lg text-red-600">
                    {error}
                  </div>
                ) : teacherAISummary ? (
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">
                    {teacherAISummary}
                  </p>
                ) : (
                  <div className="text-center font-black text-lg">
                    No summary available
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Question Summary (Teacher Only) */}
          {user.role === "teacher" && questionsSummary.length > 0 && (
            <div className="w-full max-w-[700px] mt-8 border-[6px] border-black bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
              <div className="border-b-[6px] border-black bg-yellow-300 p-6 text-center">
                <h2 className="text-3xl font-black uppercase italic">
                  Question Breakdown
                </h2>
              </div>

              <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
                {questionsSummary.map((q, i) => (
                  <div key={i} className="border-4 border-black p-4">
                    <h3 className="font-black text-xl mb-2">
                      Q{i + 1}: {q.question_text}
                    </h3>
                    <ul className="list-disc pl-6">
                      {q.players.map((p, idx) => (
                        <li
                          key={idx}
                          className={`font-black ${
                            p.correct ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {p.name} {p.correct ? "(Correct)" : "(Incorrect)"}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student AI Summary */}
          {user.role === "student" && (
            <div className="w-full max-w-[700px] mt-8 border-[6px] border-black bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
              <div className="border-b-[6px] border-black bg-green-400 p-6 text-center">
                <h2 className="text-3xl font-black uppercase italic">
                  Student AI Feedback
                </h2>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="text-center font-black text-lg">
                    Generating personalized feedback...
                  </div>
                ) : error ? (
                  <div className="text-center font-black text-lg text-red-600">
                    {error}
                  </div>
                ) : studentAISummary ? (
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">
                    {studentAISummary}
                  </p>
                ) : (
                  <div className="text-center font-black text-lg">
                    No feedback available
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleBackToLobby}
            className="mt-8 border-4 border-black bg-lime-400 p-4 text-lg font-black uppercase hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            Back to Lobby
          </button>
          <button
            onClick={handleBackToDashboard}
            className="mt-3 border-4 border-black bg-white p-4 text-lg font-black uppercase hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            Back to dashboard
          </button>
        </div>

        {/* This modal appears if back to lobby was pressed, but host hasn't reset the game yet */}
        {waitingOnHost && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white border-6 border-black p-8 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black uppercase mb-4">
                Waiting on Host
              </h2>

              <p className="font-black text-lg">
                The host has not reset the game yet.
              </p>

              <p className="mt-2 text-sm">
                Retrying connection every few seconds...
              </p>

              <div className="mt-4 animate-pulse font-black">
                Please wait...
              </div>
              <button
                onClick={() => {
                  setStudentWaiting(false);
                }}
                className="mt-8 border-4 border-black bg-white p-4 text-lg font-black uppercase hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
