"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import StatsChart from "@/components/StatsChart";
import Loading from "@/components/Loading";

interface PlayerStats {
  playerId: string;
  playerName: string;
  score: number;
  accuracy: number;
  gamesPlayed: number;
  avgResponseTime: number;
}

interface GameStats {
  gameId: string;
  gameName: string;
  date: string;
  totalPlayers: number;
  playerStats: PlayerStats[];
}

export default function StatsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [timeframe, setTimeframe] = useState("all"); // 'week', 'month', 'all'
  const [selectedGame, setSelectedGame] = useState<GameStats | null>(null);

  const punctuationPattern = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cg font-family='Arial Black, sans-serif' font-weight='900' font-size='150' fill='black' fill-opacity='0.12'%3E%3Ctext x='20' y='140' transform='rotate(-5 50 100)'%3E?%3C/text%3E%3Ctext x='220' y='180' transform='rotate(15 280 140)'%3E!%3C/text%3E%3Ctext x='110' y='360' transform='rotate(-12 150 320)'%3E✓%3C/text%3E%3Ctext x='280' y='380' transform='rotate(8 320 350)' font-size='100'%3E?%3C/text%3E%3C/g%3E%3C/svg%3E")`,
    backgroundSize: "400px 400px",
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        if (user?.role === "teacher") {
          // Fetch teacher stats - all games they created
          const response = await fetch(
            `http://localhost:5000/api/stats/teacher/${user.id}?timeframe=${timeframe}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );

          if (response.ok) {
            const data = await response.json();
            setGameStats(data.games || []);
            setPlayerStats(data.playerStats || []);
          }
        } else {
          // Fetch student stats - their performance
          const response = await fetch(
            `http://localhost:5000/api/stats/student/${user.id}?timeframe=${timeframe}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );

          if (response.ok) {
            const data = await response.json();
            setPlayerStats([data] || []);
            setGameStats(data.games || []);
          }
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchStats();
    }
  }, [user?.id, timeframe]);

  if (loading) {
    return <Loading />;
  }

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
          style={punctuationPattern}
        />

        <div className="relative z-10 w-full max-w-[1200px] border-[6px] border-black bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
          {/* Header */}
          <div className="border-b-[6px] border-black bg-purple-400 p-8 text-center">
            <h1 className="text-5xl font-black uppercase italic text-black tracking-tighter">
              Stats & Analytics
            </h1>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Timeframe Selector */}
            <div className="flex gap-4 justify-center">
              {["week", "month", "all"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`border-4 border-black px-6 py-3 text-lg font-black uppercase transition-all ${
                    timeframe === tf
                      ? "bg-purple-400 text-black"
                      : "bg-white text-black hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  }`}
                >
                  {tf === "all"
                    ? "All Time"
                    : tf.charAt(0).toUpperCase() + tf.slice(1)}
                </button>
              ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Player Scores Chart */}
              <div className="border-4 border-black p-6 bg-yellow-100">
                <h2 className="text-2xl font-black uppercase italic text-black mb-4">
                  Player Scores
                </h2>
                <StatsChart data={playerStats} type="scores" height={400} />
              </div>

              {/* Accuracy Chart */}
              <div className="border-4 border-black p-6 bg-cyan-100">
                <h2 className="text-2xl font-black uppercase italic text-black mb-4">
                  Accuracy Percentage
                </h2>
                <StatsChart data={playerStats} type="accuracy" height={400} />
              </div>
            </div>

            {/* Games List (Teacher Only) */}
            {user?.role === "teacher" && gameStats.length > 0 && (
              <div className="border-4 border-black p-6">
                <h2 className="text-2xl font-black uppercase italic text-black mb-4">
                  Game History
                </h2>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {gameStats.map((game) => (
                    <div
                      key={game.gameId}
                      onClick={() => setSelectedGame(game)}
                      className="border-4 border-black p-4 cursor-pointer hover:bg-purple-200 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-black text-lg">{game.gameName}</p>
                          <p className="text-sm font-bold">
                            {new Date(game.date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-black text-xl">
                          {game.totalPlayers} players
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Back Button */}
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full border-4 border-black bg-white p-4 text-lg font-black uppercase text-black transition-all hover:bg-black hover:text-white"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Footer */}
          <div className="border-t-[6px] border-black p-4 bg-black text-white text-center font-black text-sm uppercase tracking-widest">
            Track your performance over time
          </div>
        </div>
      </div>
    </>
  );
}
