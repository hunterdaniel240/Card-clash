"use client";
import { useContext, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { GameContext } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import socket from "@/app/socket";

export default function LobbyPage() {
  const { gameId, setgameId, setisHost, setSettings, setJoin_code, join_code } =
    useContext(GameContext);
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();

  // pulling code from params to allow users refreshing to reconnect to the game.
  let code;
  if (!join_code) {
    code = params.code;
  }

  useEffect(() => {
    // user disconnected and state was wiped from memory, but cookie session is still active
    if (!join_code && user) {
      socket.emit("join-game", { name: user.name, join_code: code }, (game) => {
        if (game) {
          setgameId(game.gameId);
          setisHost(false);
          setSettings(game.settings);
          setJoin_code(game.join_code);
        } else {
          router.push("/dashboard");
        }
      });
    }
  }, [user, code]);

  return (
    <div>
      <h1>Lobby</h1>
      <p>Lobby Code: {join_code}</p>
    </div>
  );
}
