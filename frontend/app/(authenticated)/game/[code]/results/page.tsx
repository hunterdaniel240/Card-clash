"use client";
import { useContext, useEffect, useState, useRef } from "react";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import socket from "@/app/socket";

export default function PostGamePage() {
  const { user } = useAuth();
  const {
    join_code,
    questionsSummary,
    leaderboard,
    setgameId,
    setSettings,
    setJoin_code,
    setStatus,
    setPlayers,
    setCurrentQuestionIndex,
    setLeaderboard,
    setWinners,
  } = useGame();
  const router = useRouter();
  const hasFetched = useRef(false);

  const [loading, setLoading] = useState(true);

  const getStudentFeedback = async () => {
    const res = await fetch("http://localhost:5000/api/aiSummaries/student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: questionsSummary,
        studentName: user.name,
      }),
    });

    const data = await res.json();
  };

  useEffect(() => {
    if (questionsSummary == null || leaderboard == null) return;
    if (hasFetched.current) return; // prevent a double call in dev/prod
    hasFetched.current = true;

    if (user.role == "student") {
      getStudentFeedback();
    }
    setLoading(false);
  }, [questionsSummary, leaderboard, user.role]);

  const handleBackToLobby = () => {
    if (user.role === "teacher") {
      socket.emit("reset-game", { join_code });

      setTimeout(() => {
        router.push(`/lobby/${join_code}`);
      }, 200); // small delay
    } else {
      socket.connect();

      socket.emit(
        "join-game",
        { name: user.name, role: user.role, join_code },
        (game) => {
          setgameId(game.gameId);
          setSettings(game.settings);
          setJoin_code(game.join_code);
          setStatus(game.status);
          setPlayers(game.players);
          setCurrentQuestionIndex(game.currentQuestionIndex);
          setLeaderboard(game.leaderboard);
          setWinners(game.winners);

          router.push(`/lobby/${game.join_code}`);
        },
      );
    }
  };

  return (
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
        <div className="z-10 flex flex-col max-h-screen items-center">
          <h1 className="text-5xl font-black uppercase mb-8">Game Over</h1>

          <div className="w-full max-w-[700px] border-6 border-black bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
            <div className="border-b-6 border-black bg-cyan-400 p-6 text-center">
              <h2 className="text-3xl font-black uppercase italic">
                Final Scores
              </h2>
            </div>

            <div className="p-6 space-y-3">
              {loading ? (
                <div className="text-center font-black text-xl">
                  Loading scores...
                </div>
              ) : leaderboard?.length > 0 ? (
                leaderboard.map((player, i) => (
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

          {/* Teacher detailed summary */}
          {user.role === "teacher" && questionsSummary.length > 0 && (
            <div className="w-full max-w-[700px] mt-8 border-6 border-black bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
              <div className="border-b-6 border-black bg-yellow-300 p-6 text-center">
                <h2 className="text-3xl font-black uppercase italic">
                  Question Summary
                </h2>
              </div>

              <div className="p-6 space-y-4">
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

          <button
            onClick={handleBackToLobby}
            className="mt-8 border-4 border-black bg-white p-4 text-lg font-black uppercase hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    </>
  );
}
