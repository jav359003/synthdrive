"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <div>
        <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg bg-card border border-border text-white font-sans
                     placeholder:text-gray-600 focus:outline-none focus:border-[#00f0ff]/50 focus:ring-1 focus:ring-[#00f0ff]/30
                     transition-all"
          placeholder="you@company.com"
        />
      </div>
      <div>
        <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-3 rounded-lg bg-card border border-border text-white font-sans
                     placeholder:text-gray-600 focus:outline-none focus:border-[#00f0ff]/50 focus:ring-1 focus:ring-[#00f0ff]/30
                     transition-all"
          placeholder={mode === "signup" ? "Min 6 characters" : "Your password"}
        />
      </div>

      {error && (
        <div className="p-3 bg-[#ff3344]/10 border border-[#ff3344]/30 rounded-lg text-[#ff3344] text-sm font-mono">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/40 text-[#00f0ff] font-mono font-bold
                   hover:bg-[#00f0ff]/20 hover:border-[#00f0ff] transition-all
                   disabled:opacity-30 disabled:cursor-not-allowed glow-cyan"
      >
        {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"}
      </button>

      <p className="text-center text-sm text-gray-500">
        {mode === "login" ? (
          <>
            No account?{" "}
            <a href="/signup" className="text-[#00f0ff] hover:underline">
              Sign up
            </a>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <a href="/login" className="text-[#00f0ff] hover:underline">
              Sign in
            </a>
          </>
        )}
      </p>
    </form>
  );
}
