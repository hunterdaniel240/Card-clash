"use client";

import { GameProvider } from "@/context/GameContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function GameLayout({ children }) {
  return (
    <ProtectedRoute>
      <GameProvider>{children}</GameProvider>
    </ProtectedRoute>
  );
}
