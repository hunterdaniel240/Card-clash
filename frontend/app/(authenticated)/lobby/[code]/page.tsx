"use client";
import { useContext, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { GameContext } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import socket from "@/app/socket";

export default function LobbyPage() {
  const { user } = useAuth();

  const {
    gameId,
    setgameId,
    setisHost,
    settings,
    setSettings,
    setJoin_code,
    join_code,
    players,
    setPlayers,
    questions,
    setQuestions,
    questionsSelected,
    setQuestionsSelected,
  } = useContext(GameContext);

  const params = useParams();
  const router = useRouter();

  let code;
  if (!join_code) {
    code = params.code;
  }

  const updatePlayerList = (data) => {
    setPlayers(Array.from(data.players));
  };

  // fetch teacher questions
  async function fetchQuestions() {
    if (!user) return;

    const res = await fetch(`http://localhost:5000/api/questions/${user.id}`);

    const data = await res.json();
    setQuestions(data);
  }

  useEffect(() => {
    if (!join_code && user) {
      socket.emit("join-game", { name: user.name, join_code: code }, (game) => {
        if (game) {
          setgameId(game.gameId);
          setisHost(false);
          setSettings(game.settings);
          setJoin_code(game.join_code);
        } else {
          router.push("/dashboard");
        }
      });
    }

    socket.on("game-update", updatePlayerList);

    fetchQuestions();

    return () => {
      socket.off("game-update", updatePlayerList);
    };
  }, [user, code]);

  // checkbox handler
  const handleQuestionToggle = (id) => {
    if (questionsSelected.includes(id)) {
      setQuestionsSelected(questionsSelected.filter((q) => q !== id));
    } else {
      setQuestionsSelected([...questionsSelected, id]);
    }
  };

  const punctuationPattern = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cg font-family='Arial Black, sans-serif' font-weight='900' font-size='150' fill='black' fill-opacity='0.12'%3E%3Ctext x='20' y='140' transform='rotate(-5 50 100)'%3E?%3C/text%3E%3Ctext x='220' y='180' transform='rotate(15 280 140)'%3E!%3C/text%3E%3Ctext x='110' y='360' transform='rotate(-12 150 320)'%3E✓%3C/text%3E%3Ctext x='280' y='380' transform='rotate(8 320 350)' font-size='100'%3E?%3C/text%3E%3C/g%3E%3C/svg%3E")`,
    backgroundSize: "400px 400px",
  };

  return (
    <>
      <style>{`
        @keyframes bg-pulse {
          0%, 49% { background-color: #fdba74; } /* orange-300 */
          50%, 100% { background-color: #c084fc; } /* lavender */
        }
        
        @keyframes drift {
          from { background-position: 0 0; }
          to { background-position: 400px 400px; }
        }

        .animate-bg-flip {
          animation: bg-pulse 6s infinite;
        }

        .animate-drift {
          animation: drift 40s linear infinite;
        }
      `}</style>

      <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden animate-bg-flip">
        <div
          className="absolute inset-[-100%] z-0 rotate-[-10deg] pointer-events-none animate-drift"
          style={punctuationPattern}
        />

        {/* MAIN CONTENT WRAPPER */}
        <div className="relative z-10 flex gap-8">
          {/* LOBBY CARD (UNCHANGED) */}
          <div className="w-full max-w-[500px] border-[6px] border-black bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
            <div className="border-b-[6px] border-black bg-[#a855f7] p-8 text-center">
              <h1 className="text-5xl font-black uppercase italic text-black tracking-tighter">
                Game Lobby
              </h1>
            </div>

            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-black uppercase italic text-black underline decoration-yellow-300 decoration-8 underline-offset-4">
                  Waiting Players
                </h2>

                <ul className="space-y-3">
                  {players.map((player, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-4 border-4 border-black p-4 bg-white font-black text-xl hover:translate-x-2 transition-transform cursor-default group"
                    >
                      <div className="h-10 w-10 border-4 border-black bg-cyan-400 flex items-center justify-center text-lg group-hover:bg-yellow-300 transition-colors">
                        {i + 1}
                      </div>

                      <span className="uppercase tracking-tight">
                        {player.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <button className="border-4 border-black bg-white p-4 text-lg font-black uppercase text-black transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none">
                  Game Settings
                </button>

                <button className="border-4 border-black bg-lime-400 p-4 text-lg font-black uppercase text-black transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none">
                  Start Game
                </button>
              </div>
            </div>
          </div>

          {/* QUESTIONS PANEL */}
          {user?.role === "teacher" && (
            <div className="w-[400px] border-[6px] border-black bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
              <div className="border-b-[6px] border-black bg-yellow-300 p-6 text-center">
                <h2 className="text-3xl font-black uppercase italic tracking-tight">
                  Questions
                </h2>
              </div>

              <div className="p-6 space-y-3 max-h-[500px] overflow-y-auto">
                {questions.length === 0 ? (
                  <p className="font-black italic uppercase text-center">
                    No Questions
                  </p>
                ) : (
                  questions.map((q) => (
                    <label
                      key={q.id}
                      className="flex items-start gap-3 border-4 border-black p-3 font-bold cursor-pointer hover:bg-yellow-100"
                    >
                      <input
                        type="checkbox"
                        checked={questionsSelected.includes(q.id)}
                        onChange={() => handleQuestionToggle(q.id)}
                        className="mt-1"
                      />

                      <span>{q.question_text}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
