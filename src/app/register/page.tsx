"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormInput from "@/components/FormInput";
import { signupSchema } from "@/lib/schemas/authSchema";

interface FieldErrors {
  [key: string]: string;
}

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setGeneralError("");
    setSuccessMessage("");

    try {
      // Prepare data - convert age to number if provided
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        ...(formData.age && { age: parseInt(formData.age, 10) }),
      };

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Always clear general error first
        setGeneralError("");
        
        // Handle backend validation errors
        if (data.fieldErrors && typeof data.fieldErrors === 'object' && Object.keys(data.fieldErrors).length > 0) {
          setFieldErrors(data.fieldErrors);
          // Log field errors for debugging
          console.log('Field errors:', data.fieldErrors);
        } else {
          // Only show generic error if no field errors
          setGeneralError(data.error || "Signup failed");
        }
        setLoading(false);
        return;
      }

      // Success
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
    <main className="relative flex items-center justify-center min-h-[90vh] bg-[#0F172A] overflow-hidden p-4">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-10 md:p-12 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl">
        <header className="mb-10 text-center">
          <h2 className="text-5xl font-black text-white mb-3 uppercase italic tracking-tighter">
            REGISTER<span className="text-rose-500 font-sans not-italic">_</span>
          </h2>
          <div className="inline-block px-4 py-2 rounded-full border border-rose-500/30 bg-rose-500/10 backdrop-blur-sm">
            <p className="text-rose-400 font-bold text-xs tracking-[0.2em] uppercase">
              Create Your Account
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

        <form onSubmit={handleSubmit} className="space-y-5">
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
                <span className="animate-spin">⟳</span> Creating...
              </span>
            ) : (
              "Create Account"
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
      </div>
    </main>
  );
}
