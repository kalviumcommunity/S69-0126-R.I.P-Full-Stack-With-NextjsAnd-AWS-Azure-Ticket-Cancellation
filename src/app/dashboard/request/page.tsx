"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/FormInput";
import Link from "next/link";
import { useRouter } from "next/navigation";

// 1. Define the R.I.P Protocol Schema (Validation)
const refundSchema = z.object({
  ticketId: z
    .string()
    .min(5, "Ticket ID must be at least 5 characters")
    .regex(/^[A-Z0-9]+$/, "Must be uppercase letters and numbers only"),
  email: z.string().email("Please enter a valid security-cleared email"),
  reason: z.string().min(10, "Reason must be at least 10 characters long"),
});

type RefundFormData = z.infer<typeof refundSchema>;

export default function RefundRequestPage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RefundFormData>({
    resolver: zodResolver(refundSchema),
  });

  // 2. Updated Submit Logic (Persistence)
  const onSubmit = async (data: RefundFormData) => {
    // Simulate Network Latency
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // MOCK DATABASE LOGIC:
    // Pull existing requests, add the new one with a 'Pending' status, and save.
    const existingRequests = JSON.parse(localStorage.getItem("refund_requests") || "[]");
    
    const newEntry = {
      ...data,
      id: `TK-${Math.floor(10000 + Math.random() * 90000)}`, // Generate random ID
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    localStorage.setItem("refund_requests", JSON.stringify([newEntry, ...existingRequests]));

    setIsSuccess(true);
    
    // Auto-redirect to dashboard after success
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-[#0F172A] p-8 flex flex-col items-center justify-center">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-10 rounded-[2.5rem] shadow-2xl">
        
        {isSuccess ? (
          // Success State UI
          <div className="text-center py-10 space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto">
              <span className="text-emerald-500 text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Protocol Initiated</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              The ticket has been logged into the ledger. <br /> 
              Redirecting to Command Center...
            </p>
          </div>
        ) : (
          // Main Form UI
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                Initialize <span className="text-rose-500">Refund</span>
              </h1>
              <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mt-2">
                Secure Ticket Cancellation Protocol
              </p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormInput
                label="Ticket Reference"
                name="ticketId"
                register={register}
                placeholder="e.g. RIP99X"
                error={errors.ticketId?.message}
              />

              <FormInput
                label="Confirmation Email"
                name="email"
                type="email"
                register={register}
                placeholder="user@protocol.com"
                error={errors.email?.message}
              />

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
                  Cancellation Reason
                </label>
                <textarea
                  {...register("reason")}
                  placeholder="Detail the necessity for liquidity recovery..."
                  className={`w-full p-4 bg-slate-900/50 border ${errors.reason ? 'border-rose-500' : 'border-slate-700'} rounded-2xl text-white h-32 outline-none focus:border-rose-500 transition-all placeholder:text-slate-600`}
                />
                {errors.reason && <p className="text-rose-500 text-xs italic ml-1">{errors.reason.message}</p>}
              </div>

              <button
                disabled={isSubmitting}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-2xl font-bold uppercase text-sm tracking-[0.2em] transition-all shadow-lg shadow-rose-900/20 disabled:bg-slate-700 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Executing Protocol..." : "Execute Refund"}
              </button>
            </form>
          </>
        )}

        <footer className="mt-6 text-center border-t border-slate-700/50 pt-6">
          <Link href="/dashboard" className="text-slate-500 text-[10px] uppercase font-bold hover:text-white transition-colors tracking-widest">
            ← Return to Command Center
          </Link>
        </footer>
      </div>
    </main>
  );
}