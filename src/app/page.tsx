// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-[90vh] bg-white flex flex-col items-center justify-center p-6 text-center">
      {/* Team Branding */}
      <div className="border-[10px] border-black p-10 md:p-20 shadow-[20px_20px_0px_0px_rgba(220,38,38,1)] max-w-4xl">
        <h1 className="text-8xl md:text-9xl font-black text-black tracking-tighter italic leading-none">
          R.I.P.
        </h1>
        <p className="text-2xl font-black uppercase tracking-[0.3em] text-red-600 mt-2">
          Refund In Process
        </p>

        <div className="h-2 bg-black w-full my-8"></div>

        <p className="text-black text-lg md:text-xl font-bold max-w-2xl mx-auto leading-tight uppercase">
          The ultimate protocol for automated ticket cancellation and liquidity
          recovery. Fast. Transparent. Irreversible.
        </p>

        <div className="mt-12 flex flex-col md:flex-row gap-6 justify-center">
          <Link
            href="/login"
            className="bg-black text-white px-10 py-5 text-2xl font-black uppercase hover:bg-red-600 transition border-4 border-black"
          >
            Track My Refund
          </Link>
          <Link
            href="/login"
            className="bg-white text-black px-10 py-5 text-2xl font-black uppercase hover:bg-black hover:text-white transition border-4 border-black"
          >
            Admin Portal
          </Link>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 text-left w-full max-w-5xl">
        <div className="border-l-4 border-black pl-4">
          <span className="text-red-600 font-black uppercase text-xs tracking-widest">
            Efficiency
          </span>
          <p className="text-black font-bold uppercase underline decoration-2">
            99.9% Sync Rate
          </p>
        </div>
        <div className="border-l-4 border-black pl-4">
          <span className="text-red-600 font-black uppercase text-xs tracking-widest">
            Security
          </span>
          <p className="text-black font-bold uppercase underline decoration-2">
            End-to-End Encryption
          </p>
        </div>
        <div className="border-l-4 border-black pl-4">
          <span className="text-red-600 font-black uppercase text-xs tracking-widest">
            Speed
          </span>
          <p className="text-black font-bold uppercase underline decoration-2">
            Instant Validation
          </p>
        </div>
      </div>
    </main>
  );
}
