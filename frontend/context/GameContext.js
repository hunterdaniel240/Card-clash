"use client";

import { createContext, useContext, useState } from "react";

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
  const [questions, setQuestions] = useState([]);
  const [questionsSelected, setQuestionsSelected] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [winners, setWinners] = useState([]);

  // missing players, leaderboard, winners

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
        questions,
        setQuestions,
        questionsSelected,
        setQuestionsSelected,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        leaderboard,
        setLeaderboard,
        winners,
        setWinners,
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
