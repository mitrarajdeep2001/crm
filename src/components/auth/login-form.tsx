"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [formData, setFormData] = useState({ email: "", password: "" });

  async function loginWithCredentials(email: string, password: string, remember: boolean) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, rememberDevice: remember }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      throw new Error(data.error || "Invalid email or password");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Basic validation
    if (!formData.email) {
      setErrors({ email: "Email is required" });
      setIsLoading(false);
      return;
    }
    if (!formData.password) {
      setErrors({ password: "Password is required" });
      setIsLoading(false);
      return;
    }

    try {
      await loginWithCredentials(formData.email, formData.password, rememberDevice);
      toast.success("Welcome back! Signing you in...");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDemoLogin() {
    setIsLoading(true);
    setErrors({});
    setFormData({ email: "johndoe@test.com", password: "tester@123" });

    try {
      await loginWithCredentials("johndoe@test.com", "tester@123", true);
      toast.success("Signed in with demo account");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-slate-200/60">
      {/* Brand */}
      <div className="flex flex-col items-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 mb-4">
          <Building2 className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CRM</h1>
      </div>
      <div className="mb-7 text-center">
        <p className="mt-1.5 text-sm text-gray-500">Sign in to manage your financial workspace</p>
      </div>

      {errors.general && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="name@company.com"
            leftIcon={<Mail className="h-4 w-4" />}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={errors.email ? "border-red-300 focus:ring-red-300" : ""}
            autoComplete="email"
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            Password
          </label>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={errors.password ? "border-red-300 focus:ring-red-300" : ""}
            autoComplete="current-password"
          />
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          {/* <div className="flex justify-end">
            <a href="#" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              Forgot your password?
            </a>
          </div> */}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            role="checkbox"
            aria-checked={rememberDevice}
            onClick={() => setRememberDevice(!rememberDevice)}
            className={`h-4 w-4 rounded border-2 transition-colors flex items-center justify-center flex-shrink-0 ${
              rememberDevice ? "bg-indigo-600 border-indigo-600" : "border-gray-300 bg-white"
            }`}
          >
            {rememberDevice && (
              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <span className="text-sm text-gray-500">Remember this device for 30 days</span>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-2xl bg-indigo-600 text-white font-semibold text-base hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all duration-200"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Sign In to Workspace
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-4 text-center text-xs text-gray-400">
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 rounded-2xl"
          onClick={handleDemoLogin}
          disabled={isLoading}
        >
          Demo Login
        </Button>
        <p className="mt-3">Use your workspace email and password.</p>
      </div>
    </div>
  );
}
