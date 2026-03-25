"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGlobalStore } from "@/store";
import { LoginRequest } from "@/types/auth.types";
import { CircleUserRound, Mail, Eye, EyeOff, CircleAlert } from "lucide-react";

export default function Login() {
  const { login, authLoading, errorMessage } = useGlobalStore();
  const router = useRouter();

  const [form, setForm] = useState<LoginRequest>({
    tenantId: "",
    email: "",
    pwd: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await login(form);
    if (res.success) router.push("/");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex flex-col items-center mb-5">
        <img src="/Logo.png" alt="Voctrum" className="h-20 w-auto" />
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-sm px-9 py-10">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-7">ERP Login</h1>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <CircleAlert className="size-5 text-red-800 shrink-0" />
              <span className="font-bold text-base text-red-800">Login failed:</span>
            </div>
            <p className="text-base text-red-800 ml-7">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Client ID */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-800">
              Client ID<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                name="tenantId"
                placeholder="Enter Client ID"
                value={form.tenantId}
                onChange={handleChange}
                className="pr-10 h-12 focus-visible:ring-0 focus-visible:border-2 focus-visible:border-[#1e2d4d]"
                required
              />
              <CircleUserRound className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            </div>
          </div>

          {/* Email ID */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-800">
              Email ID<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                name="email"
                type="email"
                placeholder="Enter Email ID"
                value={form.email}
                onChange={handleChange}
                className="pr-10 h-12 focus-visible:ring-0 focus-visible:border-2 focus-visible:border-[#1e2d4d]"
                required
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-800">
              Password<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                name="pwd"
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={form.pwd}
                onChange={handleChange}
                className="pr-10 h-12 bg-blue-50 focus-visible:ring-0 focus-visible:border-2 focus-visible:border-[#1e2d4d]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <Eye className="size-6 text-gray-800" /> : <EyeOff className="size-6 text-gray-400" />}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300"
              />
              Remember me
            </label>
            <button type="button" className="text-sm text-blue-600 font-semibold hover:underline">
              Forgot your password?
            </button>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            size="lg"
            disabled={authLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {authLoading ? "Logging in..." : "Login"}
          </Button>

          {/* Sign In As Candidate */}
          <Button
            type="button"
            size="lg"
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Sign In As Candidate
          </Button>
        </form>
      </div>
    </div>
  );
}
