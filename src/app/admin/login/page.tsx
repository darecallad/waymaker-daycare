"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";

/**
 * Passwordless login for the allowlisted daycare administrators.
 *
 * Step 1 asks for the email registered in `partners.ts`, step 2 for the 6-digit code that
 * was emailed. The API deliberately reports success for unknown addresses, so the UI always
 * advances to step 2.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Could not send the login code. Please try again.");
        return;
      }

      setStep("code");
      setNotice(`If ${email} is an authorized administrator, a 6-digit code is on its way.`);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Could not verify the code. Please try again.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-none bg-white shadow-2xl rounded-3xl overflow-hidden">
        <div className="h-2 bg-[#0F3B4C] w-full"></div>
        <CardContent className="pt-10 pb-10 px-8">
          <div className="w-16 h-16 bg-[#0F3B4C]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#0F3B4C]">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#0F3B4C] text-center mb-2">
            Daycare Dashboard
          </h1>
          <p className="text-gray-500 text-center text-sm mb-8">
            Manage your tour hours and closed dates.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
              {error}
            </div>
          )}

          {notice && !error && (
            <div className="mb-6 p-4 rounded-xl bg-[#A8D5BA]/15 border border-[#A8D5BA]/40 text-sm text-[#2f6b48]">
              {notice}
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={requestCode} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Administrator Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-gray-200 focus:border-[#0F3B4C] focus:ring-[#0F3B4C]"
                    placeholder="admin@waymakerbiz.com"
                  />
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#0F3B4C] hover:bg-[#092530] text-white w-full h-12 rounded-xl"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending code...
                  </span>
                ) : (
                  "Send Login Code"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-gray-700 font-medium">
                  6-Digit Code
                </Label>
                <div className="relative">
                  <Input
                    id="code"
                    name="code"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    required
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="pl-10 h-12 rounded-xl border-gray-200 tracking-[0.5em] text-lg focus:border-[#0F3B4C] focus:ring-[#0F3B4C]"
                    placeholder="000000"
                  />
                  <KeyRound className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-xs text-gray-500">The code expires in 10 minutes.</p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || code.length !== 6}
                className="bg-[#0F3B4C] hover:bg-[#092530] text-white w-full h-12 rounded-xl"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError("");
                  setNotice("");
                }}
                className="w-full text-sm text-gray-500 hover:text-[#0F3B4C] transition-colors"
              >
                Use a different email
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
