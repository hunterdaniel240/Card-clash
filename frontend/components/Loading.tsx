"use client";

export default function Loading() {
  return (
    <>
      <style>{`
        @keyframes bg-pulse {
          0%, 49% { background-color: #fdba74; }
          50%, 100% { background-color: #c084fc; }
        }
        @keyframes drift {
          from { background-position: 0 0; }
          to { background-position: 400px 400px; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-bg-flip { animation: bg-pulse 6s infinite; }
        .animate-drift { animation: drift 40s linear infinite; }
        .animate-spin-custom { animation: spin 2s linear infinite; }
      `}</style>

      <div className="relative flex h-screen items-center justify-center p-4 overflow-hidden animate-bg-flip">
        <div
          className="absolute inset-[-100%] z-0 rotate-[-10deg] pointer-events-none animate-drift"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cg font-family='Arial Black, sans-serif' font-weight='900' font-size='150' fill='black' fill-opacity='0.12'%3E%3Ctext x='20' y='140' transform='rotate(-5 50 100)'%3E?%3C/text%3E%3Ctext x='220' y='180' transform='rotate(15 280 140)'%3E!%3C/text%3E%3Ctext x='110' y='360' transform='rotate(-12 150 320)'%3E✓%3C/text%3E%3Ctext x='280' y='380' transform='rotate(8 320 350)' font-size='100'%3E?%3C/text%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "400px 400px",
          }}
        />

        <div className="relative z-10 w-full max-w-[400px] border-[6px] border-black bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-[6px] border-black bg-yellow-300 p-8 text-center">
            <h1 className="text-4xl font-black uppercase italic text-black tracking-tighter">
              Loading
            </h1>
          </div>

          <div className="p-8 flex flex-col items-center justify-center gap-6 min-h-[300px]">
            {/* Spinner */}
            <div
              className="w-16 h-16 border-6 border-black border-t-yellow-400 animate-spin-custom"
              style={{
                borderRadius: "50%",
              }}
            />

            <p className="text-xl font-black uppercase text-black text-center italic">
              Please wait...
            </p>
          </div>

          <div className="border-t-[6px] border-black p-4 bg-black text-white text-center font-black text-sm uppercase tracking-widest">
            Getting your data ready
          </div>
        </div>
      </div>
    </>
  );
}
