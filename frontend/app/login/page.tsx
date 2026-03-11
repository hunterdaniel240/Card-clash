"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import socket from "../socket";

export default function LoginPage() {
  const { user, login, setLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    console.log("Login Attempt:", { email, password });

    try {
      const user = await login(email, password); // ts error
      setLoading(false);
      if (user) {
        socket.connect();
        router.push("/dashboard");
      }
    } catch (error) {
      alert("Invalid Credentials");
    }
  }

  // Adjusted SVG: Larger viewBox (400x400) gives symbols room to move
  // Coordinates are staggered to break the vertical/horizontal lines
  const punctuationPattern = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cg font-family='Arial Black, sans-serif' font-weight='900' font-size='150' fill='black' fill-opacity='0.12'%3E%3Ctext x='20' y='140' transform='rotate(-5 50 100)'%3E?%3C/text%3E%3Ctext x='220' y='180' transform='rotate(15 280 140)'%3E!%3C/text%3E%3Ctext x='110' y='360' transform='rotate(-12 150 320)'%3E✓%3C/text%3E%3Ctext x='280' y='380' transform='rotate(8 320 350)' font-size='100'%3E?%3C/text%3E%3C/g%3E%3C/svg%3E")`,
    backgroundSize: "400px 400px",
  };

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user]);

  return (
    <>
      <style>{`
        @keyframes bg-pulse {
          0%, 49% { background-color: #fdba74; } /* orange-300 */
          50%, 100% { background-color: #c084fc; } /* lavender */
        }
        
        @keyframes drift {
          from { background-position: 0 0; }
          to { background-position: 400px 400px; }
        }

        .animate-bg-flip {
          animation: bg-pulse 6s infinite;
        }

        .animate-drift {
          animation: drift 40s linear infinite;
        }
      `}</style>

      <div className="relative flex h-screen items-center justify-center p-4 overflow-hidden animate-bg-flip">
        {/* RANDOMIZED SYMBOL LAYER */}
        <div
          className="absolute inset-[-100%] z-0 rotate-[-10deg] pointer-events-none animate-drift"
          style={punctuationPattern}
        />

        {/* Main Card */}
        <div className="relative z-10 w-full max-w-[380px] border-[6px] border-black bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-[6px] border-black bg-yellow-300 p-8 text-center">
            <h3 className="text-5xl font-black uppercase italic text-black tracking-tighter">
              LOGIN
            </h3>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 p-8">
            <div className="space-y-2">
              <label className="text-lg font-black uppercase text-black">
                Email
              </label>
              <input
                type="email"
                placeholder="YOU@EMAIL.COM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-4 border-black p-5 font-bold text-black placeholder-black/30 outline-none focus:bg-orange-50 focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-lg font-black uppercase text-black">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-4 border-black p-5 font-bold text-black placeholder-black/30 outline-none focus:bg-orange-50 focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full border-4 border-black bg-green-400 py-6 text-3xl font-black uppercase text-black transition-all hover:-translate-x-2 hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none flex items-center justify-center gap-2"
            >
              ENTER <span className="text-4xl"></span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
