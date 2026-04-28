"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLeaveGame } from "@/lib/hooks/useLeaveGame";

import { fetchQuestions } from "@/lib/api/questions";

import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import socket from "@/app/socket";

import QuestionSelection from "@/components/QuestionSelection";
import GameSettingsModal from "@/components/GameSettingsModal";
import ErrorAlert from "@/components/ErrorAlert";

export default function LobbyPage() {
  const { user } = useAuth();
  const [showGameSettingsModal, setShowGameSettingsModal] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsSelected, setQuestionsSelected] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  const {
    setgameId,
    setisHost,
    isHost,
    settings,
    setSettings,
    setJoin_code,
    join_code,
    players,
    setPlayers,
    setTotalQuestions,
    setLeaderboard,
    setWinners,
    resetContext,
  } = useGame();

  const params = useParams();
  const router = useRouter();

  // FETCH QUESTIONS
  const loadQuestions = async () => {
    if (!user || user.role != "teacher") return;

    setQuestionsLoading(true);
    try {
      const data = await fetchQuestions(user.id);
      if (!data) throw new Error("Failed to fetch questions");

      setQuestions(data);
    } catch (error) {
      console.log("Loading Questions Error: ", error);
    }
    setQuestionsLoading(false);
  };

  useLeaveGame({ router, socket, join_code });

  // redirects if teacher loses state
  useEffect(() => {
    if (user?.role === "teacher" && !join_code) {
      router.push("/dashboard");
    }
  }, [user, join_code]);

  // loading questions when teacher loads
  useEffect(() => {
    loadQuestions();
  }, [user]);

  // student redirect recovery
  useEffect(() => {
    if (!user || user.role === "teacher") return;
    if (join_code) return; // state wasn't lost

    const code = params.code;
    if (!code) {
      router.push("/dashboard");
      return;
    }

    socket.emit("join-game", { name: user.name, join_code: code }, (game) => {
      if (!game) {
        router.push("/dashboard");
        return;
      }

      setgameId(game.gameId);
      setisHost(false);
      setSettings(game.settings);
      setJoin_code(game.join_code);
    });
  }, []);

  // socket listeners
  useEffect(() => {
    const updateLobbyState = (data) => {
      setPlayers(Array.from(data.players));
      setSettings(data.settings);
      setLeaderboard(data.leaderboard);
      setWinners(data.winners);
    };

    socket.on("lobby-update", updateLobbyState);
    socket.on("game-started", ({ join_code, totalQuestions }) => {
      setTotalQuestions(totalQuestions);
      router.push(`/game/${join_code}`);
    });

    return () => {
      socket.off("lobby-update", updateLobbyState);
      socket.off("game-started");
    };
  }, []);

  const handleStartGame = () => {
    // conditional checks to verify game is ready to start
    if (questionsSelected.length === 0) {
      setErrorMessage("Please select at least one question to start the game.");
      setShowError(true);
      return;
    }

    if (players.length === 0) {
      // TODO: change this to be more than 2 players: length > 1 as teacher isn't pulled
      setErrorMessage("At least 2 players are required to start the game.");
      setShowError(true);
      return;
    }

    // start game
    socket.emit("start-game", { join_code, questions: questionsSelected });
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
              <h2 className="text-2xl font-black uppercase italic text-black ">
                Join Code: {join_code}
              </h2>
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
                      className={
                        user.name === player.name
                          ? "flex items-center gap-4 border-4 border-green-600 p-4 bg-white font-black text-xl hover:translate-x-2 transition-transform cursor-default group"
                          : "flex justify-between items-center gap-4 border-4 border-black p-4 bg-white font-black text-xl hover:translate-x-2 transition-transform cursor-default group"
                      }
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 border-4 border-black bg-cyan-400 flex items-center justify-center text-lg group-hover:bg-yellow-300 transition-colors">
                          {i + 1}
                        </div>
                        <span className="uppercase tracking-tight">
                          {player.name}
                        </span>
                      </div>
                      {user?.role === "teacher" && (
                        <button
                          className="border-4 border-black p-2 text-sm font-black uppercase text-red-600 transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
                          onClick={() => {
                            socket.emit("kick-player", {
                              join_code,
                              target_id: player.userId,
                            });
                          }}
                        >
                          Kick
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {user?.role === "teacher" && (
                  <>
                    <button
                      className="border-4 border-black bg-lime-400 p-4 text-lg font-black uppercase text-black transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
                      onClick={handleStartGame}
                    >
                      Start Game
                    </button>
                    {process.env.NODE_ENV === "development" && (
                      <button
                        onClick={() => socket.disconnect()}
                        className="bottom-4 right-4 bg-red-500 text-white p-2 text-sm font-black border-2 border-black"
                      >
                        DEBUG: Drop Connection
                      </button>
                    )}
                  </>
                )}
                <button
                  className="border-4 border-black  p-4 text-lg font-black uppercase text-black transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
                  onClick={() => {
                    resetContext();
                    socket.emit("leave-game", { join_code });
                    router.push("/dashboard");
                  }}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* QUESTIONS PANEL */}
          {user?.role === "teacher" ? (
            <QuestionSelection
              user={user}
              questions={questions}
              questionsSelected={questionsSelected}
              setQuestionsSelected={setQuestionsSelected}
              loading={questionsLoading}
            />
          ) : null}

          {showGameSettingsModal ? (
            <GameSettingsModal
              setShowGameSettingsModal={setShowGameSettingsModal}
              setSettings={setSettings}
              settings={settings}
              join_code={join_code}
              socket={socket}
            />
          ) : null}
        </div>
      </div>
      <ErrorAlert
        message={errorMessage}
        isVisible={showError}
        onClose={() => setShowError(false)}
      />
    </>
  );
}
