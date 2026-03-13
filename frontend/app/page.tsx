"use client";

import Link from "next/link";

export default function Home() {
  // Matching the punctuation pattern from your Register style
  const punctuationPattern = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cg font-family='Arial Black, sans-serif' font-weight='900' font-size='150' fill='black' fill-opacity='0.12'%3E%3Ctext x='20' y='140' transform='rotate(-5 50 100)'%3E?%3C/text%3E%3Ctext x='220' y='180' transform='rotate(15 280 140)'%3E!%3C/text%3E%3Ctext x='110' y='360' transform='rotate(-12 150 320)'%3E✓%3C/text%3E%3Ctext x='280' y='380' transform='rotate(8 320 350)' font-size='100'%3E?%3C/text%3E%3C/g%3E%3C/svg%3E")`,
    backgroundSize: "400px 400px",
  };

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
        {/* SYMBOL LAYER */}
        <div
          className="absolute inset-[-100%] z-0 rotate-[-10deg] pointer-events-none animate-drift"
          style={punctuationPattern}
        />

        {/* Main Home Card */}
        <div className="relative z-10 w-full max-w-[500px] border-[6px] border-black bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
          {/* Header / Logo Section */}
          <div className="border-b-[6px] border-black bg-lime-400 p-2 text-center">
            <h1 className="text-6xl font-black uppercase italic text-black tracking-tighter leading-none">
              Card <br /> Clash
            </h1>
          </div>

          {/* Content Body */}
          <div className="p-8 space-y-8 text-center">
            <p className="text-xl font-black uppercase text-black leading-tight italic">
              Test your knowledge against others in real time.
            </p>

            <div className="flex flex-col gap-5">
              {/* Login Button */}
              <Link
                href="/login"
                className="w-full border-4 border-black bg-cyan-400 py-5 text-3xl font-black uppercase text-black transition-all hover:-translate-x-2 hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
              >
                Login
              </Link>

              {/* Register Button */}
              <Link
                href="/register"
                className="w-full border-4 border-black bg-yellow-300 py-5 text-3xl font-black uppercase text-black transition-all hover:-translate-x-2 hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
              >
                Register
              </Link>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="border-t-[6px] border-black p-2 bg-black text-white text-center font-bold text-sm uppercase tracking-widest"></div>
        </div>
      </div>
    </>
  );
}
