"use client";

import { GameProvider } from "@/context/GameContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import GameListener from "./GameListener";

export default function GameLayout({ children }) {
  return (
    <ProtectedRoute>
      <GameProvider>
        <GameListener>{children}</GameListener>
      </GameProvider>
    </ProtectedRoute>
  );
}
