"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormInput from "@/components/FormInput";


interface FieldErrors {
  [key: string]: string;
}

export default function Register() {
  console.log("=== REGISTER COMPONENT RENDERED (NEW VERSION) ===");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [otp, setOtp] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setGeneralError("");

    // Validate password before sending OTP
    const password = formData.password;
    const passwordErrors: string[] = [];
    if (password.length < 8) passwordErrors.push("At least 8 characters");
    if (!/[A-Z]/.test(password)) passwordErrors.push("Note: One uppercase letter");
    if (!/[a-z]/.test(password)) passwordErrors.push("Note: One lowercase letter");
    if (!/[0-9]/.test(password)) passwordErrors.push("Note: One number");
    if (!/[^A-Za-z0-9]/.test(password)) passwordErrors.push("Note: One special character");

    if (passwordErrors.length > 0) {
      setFieldErrors({ password: `Password too weak: ${passwordErrors[0]}` }); // Show first error
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setGeneralError(data.error || "Failed to send OTP");
        setLoading(false);
        return;
      }

      setStep(2);
      setSuccessMessage("OTP sent to your email!");
      setLoading(false);
    } catch (error) {
      setGeneralError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setGeneralError("");
    setSuccessMessage("");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        otp: otp,
        ...(formData.age && { age: parseInt(formData.age, 10) }),
      };

      console.log("Sending signup payload:", payload);

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setGeneralError("");
        if (data.fieldErrors && typeof data.fieldErrors === 'object' && Object.keys(data.fieldErrors).length > 0) {
          setFieldErrors(data.fieldErrors);
        } else {
          setGeneralError(data.error || "Signup failed");
        }
        setLoading(false);
        return;
      }

      setSuccessMessage("✓ Account created! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      setGeneralError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="relative flex items-center justify-center min-h-[90vh] bg-red-900 overflow-hidden p-4">
      <div className="absolute top-0 left-0 text-white font-bold p-4 bg-black z-50">
        DEBUG: IF YOU SEE THIS, THE NEW FILE IS LOADED (v2)
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-10 md:p-12 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl">
        <header className="mb-10 text-center">
          <h2 className="text-5xl font-black text-white mb-3 uppercase italic tracking-tighter">
            REGISTER<span className="text-rose-500 font-sans not-italic">_</span>
          </h2>
          <div className="inline-block px-4 py-2 rounded-full border border-rose-500/30 bg-rose-500/10 backdrop-blur-sm">
            <p className="text-rose-400 font-bold text-xs tracking-[0.2em] uppercase">
              {step === 1 ? "Create Your Account" : "Verify Email"}
            </p>
          </div>
        </header>

        {generalError && (
          <div className="mb-6 p-4 bg-rose-500/15 border border-rose-500/40 rounded-xl backdrop-blur-sm">
            <p className="text-rose-300 text-sm font-semibold flex items-center gap-2">
              <span>⚠</span> {generalError}
            </p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-xl backdrop-blur-sm">
            <p className="text-emerald-300 text-sm font-semibold flex items-center gap-2">
              <span>✓</span> {successMessage}
            </p>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <FormInput
              label="Full Name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              error={fieldErrors.name}
            />

            <FormInput
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              error={fieldErrors.email}
            />

            <FormInput
              label="Password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
              error={fieldErrors.password}
            />

            <FormInput
              label="Age (Optional)"
              name="age"
              type="number"
              placeholder="18+"
              value={formData.age}
              onChange={handleChange}
              error={fieldErrors.age}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-3 px-6 bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 hover:from-rose-600 hover:via-rose-700 hover:to-rose-800 text-white font-black uppercase tracking-wider rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-rose-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⟳</span> Sending OTP...
                </span>
              ) : (
                "Send Verification Code"
              )}
            </button>

            <div className="text-center mt-8 pt-6 border-t border-slate-700/50">
              <p className="text-slate-400 text-sm">Already have an account?</p>
              <a
                href="/login"
                className="text-rose-400 hover:text-rose-300 font-bold text-sm mt-2 inline-block transition-colors duration-200 underline underline-offset-2"
              >
                Sign In Instead
              </a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider ml-1">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className={`w-full bg-slate-900/50 border ${generalError ? "border-rose-500" : "border-slate-700"
                  } rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all duration-200 text-center text-2xl tracking-[0.5em] font-mono`}
              />
              <p className="text-xs text-slate-400 text-center mt-2">
                Sent to {formData.email}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-3 px-6 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 text-white font-black uppercase tracking-wider rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⟳</span> Verifying...
                </span>
              ) : (
                "Verify & Create Account"
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full mt-4 py-2 px-4 text-slate-400 hover:text-white font-semibold text-sm transition-colors duration-200"
            >
              Back to Details
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
