"use client";

import { createContext, useContext, useState, useEffect } from "react";
import socket from "@/app/socket";

export const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [gameId, setgameId] = useState("");
  const [isHost, setisHost] = useState(false);
  const [settings, setSettings] = useState({
    timePerQuestion: 20,
    pointsPerQuestion: 100,
    shuffleQuestions: true,
    secondsBetweenQuestions: 10,
    showAnswer: false,

    maxPlayers: 30,
  });
  const [join_code, setJoin_code] = useState("");
  const [players, setPlayers] = useState([]);
  const [status, setStatus] = useState("lobby");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [winners, setWinners] = useState([]);

  const [questionsSummary, setQuestionsSummary] = useState([]);

  const resetContext = () => {
    setgameId("");
    setisHost(false);
    setPlayers([]);
    setCurrentQuestionIndex(0);
    setTotalQuestions(0);
    setQuestionsSummary([]);
    setLeaderboard([]);
    setStatus("lobby");
  };

  useEffect(() => {
    socket.on("game-reset", () => {
      console.log("Game reset received");

      resetContext();
    });

    return () => {
      socket.off("game-reset");
    };
  }, []);

  return (
    <GameContext.Provider
      value={{
        gameId,
        setgameId,
        isHost,
        setisHost,
        join_code,
        setJoin_code,
        players,
        setPlayers,
        status,
        setStatus,
        settings,
        setSettings,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        totalQuestions,
        setTotalQuestions,
        leaderboard,
        setLeaderboard,
        winners,
        setWinners,
        questionsSummary,
        setQuestionsSummary,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGame not used within GameContext");
  }

  return context;
}
