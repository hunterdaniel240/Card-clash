"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLeaveGame } from "@/lib/hooks/useLeaveGame";

import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import socket from "@/app/socket";

export default function ActiveGamePage() {
  const { user } = useAuth() as { user: any };
  const {
    settings,
    players,
    setPlayers,
    join_code,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    totalQuestions,
    leaderboard,
    setLeaderboard,
    setWinners,
    setQuestionsSummary,
  } = useGame() as any;
  const router = useRouter();

  const [question, setQuestion] = useState<any>(null);
  const [correctAnswer, setCorrectAnswer] = useState({
    text: "",
    option: "",
  });
  const [playerAnswer, setplayerAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState<any>(null);
  const [answered, setAnswered] = useState(false);
  const [answeredPlayers, setAnsweredPlayers] = useState<any[]>([]);
  const [waiting, setWaiting] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const timerRef = useRef<any>(null);
  const currentQuestionIndexRef = useRef(false);
  const TIME_BETWEEN_QUESTIONS = settings?.secondsBetweenQuestions ?? 3; // seconds pause

  // Submit answer
  function submitAnswer(optionId: any) {
    if (answered) return;
    socket.emit("submit-answer", { join_code, answer: optionId });
    setAnswered(true);
    setplayerAnswer(optionId);
  }

  // Handles users trying to leave while game is in progress
  useLeaveGame({ router, socket, join_code });

  // Handle gameplay socket events
  useEffect(() => {
    socket.emit("game-page-ready", { join_code });

    socket.on("question-start", (data) => {
      clearInterval(timerRef.current);
      setQuestion(data.question);
      setplayerAnswer("");

      setAnswered(false);
      setWaiting(false);
      setTimeLeft(data.timeLimit);
      setPlayers(data.players);
      setAnsweredPlayers([]);
      setCurrentQuestionIndex(data.currentQuestionIndex + 1);
    });

    socket.on("question-end", (data) => {
      clearInterval(timerRef.current);
      setLeaderboard(data.scores);
      setCorrectAnswer({
        text: data.correctAnswer.text,
        option: data.correctAnswer.option,
      });
      setQuestion(null);
      setWaiting(true);
      if (currentQuestionIndexRef.current == totalQuestions) {
        setGameOver(true);
      }

      setTimeLeft(TIME_BETWEEN_QUESTIONS); // countdown between questions
    });

    socket.once("game-end", (data) => {
      clearInterval(timerRef.current);
      setGameOver(true);

      setLeaderboard(data.finalScores);
      setQuestionsSummary(data.questionsSummary);
      setWinners(data.winners);

      router.push(`/game/${join_code}/results`);
    });

    socket.on("player-answered", (data) => {
      setAnsweredPlayers(data);
    });

    return () => {
      clearInterval(timerRef.current);
      socket.off("question-start");
      socket.off("question-end");
      socket.off("game-end");
      socket.off("player-answered");
    };
  }, []);

  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  // Client Timer, timeLeft is set by server emit
  useEffect(() => {
    if (timeLeft === null) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

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

        <div className="relative z-10 flex gap-8">
          {/* QUESTION CARD */}
          <div className="w-[700px] border-[6px] border-black bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
            <div className="border-b-[6px] border-black bg-yellow-300 p-6 text-center">
              <h1 className="text-4xl font-black uppercase italic tracking-tight">
                Trivia Question
              </h1>
              <div className="text-3xl font-black mt-2">
                {currentQuestionIndex} / {totalQuestions}
              </div>
              <div className="text-3xl font-black mt-2">{timeLeft ?? 0}s</div>
            </div>

            <div className="p-8 space-y-6">
              {question ? (
                <>
                  <h2 className="text-2xl font-black text-center uppercase">
                    {question.question_text}
                  </h2>

                  {/* only display for teacher */}
                  {user.role == "teacher" &&
                    players.map((p) => {
                      const hasAnswered = answeredPlayers.includes(p.name);

                      return (
                        <div
                          key={p.id}
                          className="flex justify-between border-4 border-black p-3 font-black text-lg"
                        >
                          <span>
                            {p.name}{" "}
                            {hasAnswered ? "Has Answered" : "Has Not Answered"}
                          </span>
                        </div>
                      );
                    })}

                  {/* only display options for a student */}
                  {user.role == "student" && (
                    <div className="grid grid-cols-2 gap-4 pt-6">
                      {question.options.map((opt) => (
                        <button
                          key={opt.id}
                          disabled={answered}
                          onClick={() => submitAnswer(opt.id)}
                          className={`border-4 border-black p-6 text-lg font-black uppercase transition-all
                          hover:-translate-x-1 hover:-translate-y-1
                          hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                          active:translate-x-0 active:translate-y-0 active:shadow-none
                          ${answered ? "bg-gray-500" : "bg-white"}`}
                        >
                          {opt.text}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : waiting ? (
                <>
                  {user.role == "student" && (
                    <p className="text-center font-black text-xl">
                      Your answer was{" "}
                      {playerAnswer == correctAnswer.option
                        ? "correct"
                        : "incorrect"}
                    </p>
                  )}

                  {settings.showAnswer && (
                    <p className="text-center font-black text-xl">
                      Correct answer was {correctAnswer.option}:{" "}
                      {correctAnswer.text}
                    </p>
                  )}
                  {gameOver ? (
                    <p className="text-center font-black text-xl">Game Over</p>
                  ) : (
                    <p className="text-center font-black text-xl">
                      Waiting for next question...
                    </p>
                  )}
                </>
              ) : null}
            </div>
          </div>

          {/* SCOREBOARD */}
          <div className="w-[350px] border-[6px] border-black bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
            <div className="border-b-[6px] border-black bg-cyan-400 p-6 text-center">
              <h1 className="text-3xl font-black uppercase italic">
                Scoreboard
              </h1>
            </div>
            <div className="p-6 space-y-3">
              {(leaderboard?.length ? leaderboard : players).map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between border-4 border-black p-3 font-black text-lg"
                >
                  <span>{p.name}</span>
                  <span>{p.score ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
          {process.env.NODE_ENV === "development" && (
            <button
              onClick={() => socket.disconnect()}
              className="bottom-4 right-4 bg-red-500 text-white p-2 text-sm font-black border-2 border-black"
            >
              DEBUG: Drop Connection
            </button>
          )}
        </div>
      </div>
    </>
  );
}
