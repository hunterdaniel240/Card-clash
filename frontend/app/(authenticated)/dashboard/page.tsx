"use client";
import { useEffect, useState } from "react";
import socket from "../../socket";

import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, logout, setLoading } = useAuth();
  const [showJoinGameModal, setShowJoinGameModal] = useState(false);
  const [code, setCode] = useState("");
  const router = useRouter();
  const {
    setgameId,
    setisHost,
    setSettings,
    setJoin_code,
    setStatus,
    setPlayers,
    setCurrentQuestionIndex,
    setLeaderboard,
    setWinners,
  } = useGame();

  // this creates a random pattern of randomly tilted puncuation marks, !, ? and checkmark
  const punctuationPattern = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cg font-family='Arial Black, sans-serif' font-weight='900' font-size='150' fill='black' fill-opacity='0.12'%3E%3Ctext x='20' y='140' transform='rotate(-5 50 100)'%3E?%3C/text%3E%3Ctext x='220' y='180' transform='rotate(15 280 140)'%3E!%3C/text%3E%3Ctext x='110' y='360' transform='rotate(-12 150 320)'%3E✓%3C/text%3E%3Ctext x='280' y='380' transform='rotate(8 320 350)' font-size='100'%3E?%3C/text%3E%3C/g%3E%3C/svg%3E")`,
    backgroundSize: "400px 400px",
  };

  const handleCreateLobby = () => {
    // test settings
    const mockQuestionIds = ["q1", "q2", "q3", "q4", "q5"];

    const mockSettings = {
      timePerQuestion: 20,
      shuffleQuestions: false,
      showAnswer: false,
      maxPlayers: 30,
    };

    // TODO handle undefined game returns
    socket.connect();
    socket.emit(
      "create-game",
      {
        name: user.name,
        settings: mockSettings,
        questionIds: mockQuestionIds,
      },
      (game) => {
        console.log("Game created: " + game.gameId + "\n");
        console.log(JSON.stringify(game));
        setgameId(game.gameId);
        setisHost(true);
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
  };

  const handleJoinLobby = (e: React.FormEvent) => {
    //    if (!user) return; //
    e.preventDefault();

    socket.connect();

    socket.emit("join-game", { name: user.name, join_code: code }, (game) => {
      setgameId(game.gameId);
      setisHost(true);
      setSettings(game.settings);
      setJoin_code(game.join_code);
      setStatus(game.status);
      setPlayers(game.players);
      setCurrentQuestionIndex(game.currentQuestionIndex);
      setLeaderboard(game.leaderboard);
      setWinners(game.winners);

      router.push(`/lobby/${game.join_code}`);
    });
  };

  const menuItems = [
    {
      label: "Create Game",
      color: "bg-green-400",
      onClickFunction: handleCreateLobby,
      roles: ["teacher"],
    },
    {
      label: "Join Game",
      color: "bg-cyan-400",
      onClickFunction: () => setShowJoinGameModal(true),
      roles: ["student"],
    },
    {
      label: "View Questions",
      color: "bg-cyan-400",
      onClickFunction: () => router.push("/questions"),
      roles: ["teacher"],
    },
    {
      label: "View Stats",
      color: "bg-purple-400",
      onClickFunction: () => {
        console.log("View stats Selected");
      },
      roles: ["student", "teacher"],
    },
    {
      label: "Log Out",
      color: "bg-rose-400",
      onClickFunction: () => {
        router.push("/");
        logout();
        socket.disconnect();
      },
      roles: ["student", "teacher"],
    },
  ];

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
        .animate-bg-flip { animation: bg-pulse 6s infinite; }
        .animate-drift { animation: drift 40s linear infinite; }
      `}</style>

      <div className="relative flex h-screen items-center justify-center p-4 overflow-hidden animate-bg-flip">
        {/* BACKGROUND LAYER */}
        <div
          className="absolute inset-[-100%] z-0 rotate-[-10deg] pointer-events-none animate-drift"
          style={punctuationPattern}
        />

        {/* Main Dashboard Card */}
        <div className="relative z-10 w-full max-w-[450px] border-[6px] border-black bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
          {/* Header Section */}
          <div className="border-b-[6px] border-black bg-yellow-300 p-8 text-center">
            <h1 className="text-6xl font-black uppercase italic text-black tracking-tighter">
              Dashboard
            </h1>
            <p className="mt-2 text-3xl font-bold uppercase bg-yellow inline-block px-4 py-1">
              Welcome back! {user.name}
            </p>
          </div>

          {/* Menu Items Section */}
          <div className="p-8 space-y-4">
            {menuItems
              .filter((item) => item.roles.includes(user.role))
              .map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClickFunction}
                  className={`w-full border-4 border-black ${item.color} p-6 text-2xl font-black uppercase text-black text-left flex justify-between items-center transition-all hover:-translate-x-2 hover:-translate-y-2 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none group`}
                >
                  {item.label}
                  <span className="text-3xl transition-transform group-hover:rotate-12">
                    {item.label === "Create Game"
                      ? "!!"
                      : item.label === "Join Game" ||
                          item.label === "View Stats"
                        ? "✓"
                        : item.label === "View Questions"
                          ? "?"
                          : "x"}
                  </span>
                </button>
              ))}
          </div>

          {showJoinGameModal && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "8px",
                }}
              >
                <h2>Enter Game Code</h2>

                <input
                  type="text"
                  placeholder="Game Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={{ marginTop: "10px", marginBottom: "10px" }}
                />

                <br />

                <button onClick={handleJoinLobby}>Join Lobby</button>

                <button
                  onClick={() => setShowJoinGameModal(false)}
                  style={{ marginLeft: "10px" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Footer Decor */}
          <div className="border-t-[6px] border-black p-4 bg-black text-white text-center font-black text-sm uppercase tracking-widest">
            Select an option to proceed
          </div>
        </div>
      </div>
    </>
  );
}
