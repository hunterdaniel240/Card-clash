"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import socket from "@/app/socket";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";

export default function GameListener({ children }) {
  const { user } = useAuth();
  const router = useRouter();
  const { resetContext } = useGame();
  const [hostDisconnected, setHostDisconnected] = useState(false);
  const [kickedMessage, setKickedMessage] = useState(null);
  const [terminatedMessage, setTerminatedMessage] = useState(null);

  useEffect(() => {
    if (user.role === "teacher") return;

    const onGameTerminated = ({ reason }) => {
      setTerminatedMessage(reason || "The game has been terminated.");
      resetContext(null);

      router.push("/dashboard");
    };

    const onKicked = () => {
      setKickedMessage("You were removed from the game.");
      router.push("/dashboard");
    };

    const onHostDisconnect = () => setHostDisconnected(true);
    const onHostReconnect = () => setHostDisconnected(false);

    socket.on("game-terminated", onGameTerminated);
    socket.on("host-disconnected", onHostDisconnect);
    socket.on("host-reconnected", onHostReconnect);
    socket.on("kicked", onKicked);

    return () => {
      socket.off("game-terminated", onGameTerminated);
      socket.off("host-disconnected", onHostDisconnect);
      socket.off("host-reconnected", onHostReconnect);
      socket.off("kicked", onKicked);
    };
  }, []);

  const handleKickedDismiss = () => {
    setKickedMessage(null);
    resetContext(null);
  };

  const handleTerminatedDismiss = () => {
    setTerminatedMessage(null);
    setHostDisconnected(false); // reset state to clear modal
  };

  return (
    <>
      {children}
      {hostDisconnected && user.role !== "teacher" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white border-6 border-black p-8 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black uppercase mb-4">
              Host Disconnected
            </h2>
            <p className="font-black text-lg">
              Waiting for host to reconnect...
            </p>
            <div className="mt-4 animate-pulse font-black">Please wait...</div>
          </div>
        </div>
      )}

      {kickedMessage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white border-[6px] border-black p-8 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black uppercase mb-4">Removed</h2>
            <p className="font-black text-lg">{kickedMessage}</p>
            <button
              onClick={handleKickedDismiss}
              className="mt-6 border-4 border-black bg-lime-400 px-6 py-3 font-black uppercase hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {terminatedMessage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white border-[6px] border-black p-8 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black uppercase mb-4">Game Ended</h2>
            <p className="font-black text-lg">{terminatedMessage}</p>
            <button
              onClick={handleTerminatedDismiss}
              className="mt-6 border-4 border-black bg-lime-400 px-6 py-3 font-black uppercase hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
}
