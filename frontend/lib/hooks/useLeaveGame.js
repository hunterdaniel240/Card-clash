import { useEffect } from "react";

// This hook helps provide alerts to prevent a player/teacher from disconnecting by accident
export function useLeaveGame({ router, socket, join_code }) {
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    const handleBackNav = () => {
      const confirmLeave = confirm(
        "Are you sure you would like to leave the game?",
      );

      if (confirmLeave) {
        socket.emit("leave-game", { join_code });
        router.push("/dashboard");
      } else {
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBackNav);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handleBackNav);
    };
  }, []);
}
