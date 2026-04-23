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

const server_url =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_SERVER_URL
    : process.env.NEXT_PUBLIC_DEV_SERVER_URL;

export default function StatsPage() {
  const { user } = useAuth() as { user: any };
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [gameStats, setGameStats] = useState<any[]>([]);
  const [playerStats, setPlayerStats] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [timeframe, setTimeframe] = useState("all");
  const [error, setError] = useState("");

  const punctuationPattern = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cg font-family='Arial Black, sans-serif' font-weight='900' font-size='150' fill='black' fill-opacity='0.12'%3E%3Ctext x='20' y='140' transform='rotate(-5 50 100)'%3E?%3C/text%3E%3Ctext x='220' y='180' transform='rotate(15 280 140)'%3E!%3C/text%3E%3Ctext x='110' y='360' transform='rotate(-12 150 320)'%3E✓%3C/text%3E%3Ctext x='280' y='380' transform='rotate(8 320 350)' font-size='100'%3E?%3C/text%3E%3C/g%3E%3C/svg%3E")`,
    backgroundSize: "400px 400px",
  };

  function getDateRange(timeframe: string) {
    const now = new Date();
    let from = new Date();

    if (timeframe === "week") {
      from.setDate(now.getDate() - 7);
    } else if (timeframe === "month") {
      from.setMonth(now.getMonth() - 1);
    } else {
      from.setFullYear(now.getFullYear() - 2);
    }

    return {
      date_from: from.toISOString().replace("T", " ").replace("Z", ""),
      date_to: now.toISOString().replace("T", " ").replace("Z", ""),
    };
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        if (!user?.id) {
          setError("No logged-in user found");
          return;
        }

        if (user.role === "teacher") {
          const { date_from, date_to } = getDateRange(timeframe);

          let url = `${server_url}/api/games/stats/teacher/${user.id}`;

          if (date_from && date_to) {
            url += `?date_from=${date_from}&date_to=${date_to}`;
          }
          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (!response.ok) throw new Error("Failed to load teacher stats");

          const data = await response.json();
          setSummary(data.summary || null);
          setPlayerStats(data.players || []);
          setGameStats(data.questions || []);
        } else {
          const { date_from, date_to } = getDateRange(timeframe);

          let url = `${server_url}/api/games/stats/student/${user.id}`;

          if (date_from && date_to) {
            url += `?date_from=${date_from}&date_to=${date_to}`;
          }
          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (!response.ok) throw new Error("Failed to load student stats");

          const data = await response.json();
          setSummary(data.summary || null);
          setPlayerStats(data.games || []);
          setGameStats(data.games || []);
          console.log(data);
          console.log(data.games);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setError("Failed to load stats");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 3000);
      }
    };

    fetchStats();
  }, [user?.id, user?.role, timeframe]);

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
          <div className="border-b-[6px] border-black bg-purple-400 p-8 text-center">
            <h1 className="text-5xl font-black uppercase italic text-black tracking-tighter">
              Stats & Analytics
            </h1>
          </div>

          <div className="p-8 space-y-8">
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

            {error && (
              <div className="border-4 border-black bg-red-300 p-4 text-center text-lg font-black uppercase text-black">
                {error}
              </div>
            )}

            {summary && (
              <div className="border-4 border-black p-6 bg-white">
                <h2 className="text-2xl font-black uppercase italic text-black mb-4">
                  {user?.role === "teacher"
                    ? "Teacher Summary"
                    : "Student Summary"}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-black text-lg">
                  <p>Total Games: {summary.total_games}</p>

                  {user?.role === "teacher" ? (
                    <>
                      <p>Total Players: {summary.total_players}</p>
                      <p>
                        Average Score:{" "}
                        {Number(summary.average_score).toFixed(2)}
                      </p>
                      <p>
                        Overall Accuracy:{" "}
                        {(Number(summary.overall_accuracy) * 100).toFixed(1)}%
                      </p>
                    </>
                  ) : (
                    <>
                      <p>Total Score: {summary.total_score}</p>
                      <p>
                        Average Score:{" "}
                        {Number(summary.average_score).toFixed(2)}
                      </p>
                      <p>Total Correct: {summary.total_correct}</p>
                      <p>Total Answers: {summary.total_answers}</p>
                      <p>
                        Overall Accuracy:{" "}
                        {(Number(summary.overall_accuracy) * 100).toFixed(1)}%
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="border-4 border-black p-6 bg-yellow-100">
                <h2 className="text-2xl font-black uppercase italic text-black mb-4">
                  {user?.role === "teacher"
                    ? "Player Scores"
                    : "Scores by Game"}
                </h2>
                <StatsChart data={playerStats} type="scores" height={400} />
              </div>

              <div className="border-4 border-black p-6 bg-cyan-100">
                <h2 className="text-2xl font-black uppercase italic text-black mb-4">
                  Accuracy Percentage
                </h2>
                <StatsChart data={playerStats} type="accuracy" height={400} />
              </div>
            </div>

            {user?.role === "teacher" && gameStats.length > 0 && (
              <div className="border-4 border-black p-6 bg-white">
                <h2 className="text-2xl font-black uppercase italic text-black mb-4">
                  Question Performance
                </h2>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {gameStats.map((question) => (
                    <div
                      key={question.question_id}
                      className="border-4 border-black p-4"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-black text-lg">
                            Question ID: {question.question_id}
                          </p>
                          <p className="text-sm font-bold">
                            Responses: {question.total_responses}
                          </p>
                          <p className="text-sm font-bold">
                            Correct Count: {question.correct_count}
                          </p>
                        </div>
                        <p className="font-black text-xl">
                          {(Number(question.accuracy) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {user?.role === "student" && gameStats.length > 0 && (
              <div className="border-4 border-black p-6 bg-white">
                <h2 className="text-2xl font-black uppercase italic text-black mb-4">
                  Game History
                </h2>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {gameStats.map((game) => (
                    <div
                      key={game.game_id}
                      className="border-4 border-black p-4"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-black text-lg">
                            {new Date(game.ended_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm font-bold">
                            Correct: {game.correct} / {game.total_answers}
                          </p>
                        </div>
                        <p className="font-black text-xl">{game.score}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full border-4 border-black bg-white p-4 text-lg font-black uppercase text-black transition-all hover:bg-black hover:text-white"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="border-t-[6px] border-black p-4 bg-black text-white text-center font-black text-sm uppercase tracking-widest">
            Track your performance over time
          </div>
        </div>
      </div>
    </>
  );
}
