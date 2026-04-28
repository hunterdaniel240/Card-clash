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

  useEffect(() => {
    if (user.role === "teacher") return;

    const onGameTerminated = ({ reason }) => {
      alert(reason);
      resetContext(null);
      setHostDisconnected(false); // reset state to clear modal
      router.push("/dashboard");
    };

    const onKicked = () => {
      resetContext(null);
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
    </>
  );
}
