"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Lock, User, Zap } from "lucide-react";
import Image from "next/image";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { login, session, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (session && !isLoading) {
      const roleRoutes: Record<string, string> = {
        admin: "/admin",
        evaluator: "/evaluator",
        proposal_maker: "/proposal-maker",
        sales: "/sales",
      };
      router.push(roleRoutes[session.agent.role] || "/admin");
    }
  }, [session, isLoading, router]);

  if (isLoading || session) {
    return <LoadingSpinner />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username, password);
      // Navigation handled by useEffect after session update
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const testCredentials = [
    {
      id: "ADMIN001",
      password: "admin123",
      role: "Admin",
      name: "Suresh Reddy",
    },
    {
      id: "EVAL001",
      password: "eval123",
      role: "Evaluator",
      name: "Raj Kumar",
    },
    {
      id: "PROP001",
      password: "prop123",
      role: "Proposal Maker",
      name: "Priya Sharma",
    },
    { id: "SALES001", password: "sales123", role: "Sales", name: "Amit Patel" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-indigo/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden md:block space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MSEDCL</h1>
              <p className="text-gray-600">Bills Processor Portal</p>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              Internal Agent Management System
            </h2>
            <p className="text-lg text-gray-600">
              Streamline consumer registration, bill evaluation, proposal
              management, and payment processing with role-based workflows.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="p-4 bg-white rounded-lg border border-border">
              <div className="text-2xl font-bold text-primary">1,200+</div>
              <div className="text-sm text-gray-600">Consumers Processed</div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-border">
              <div className="text-2xl font-bold text-green-600">98%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <Card className="w-full shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username / Employee ID
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your employee ID"
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size={16} className="mr-2" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Test Credentials */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                Test Credentials
              </p>
              <div className="grid grid-cols-1 gap-2">
                {testCredentials.map((cred) => (
                  <button
                    key={cred.id}
                    onClick={() => {
                      setUsername(cred.id);
                      setPassword(cred.password);
                    }}
                    className="text-left p-2 rounded bg-gray-50 hover:bg-gray-100 transition-colors text-xs border border-border"
                    type="button"
                  >
                    <div className="font-semibold text-gray-900">
                      {cred.name} ({cred.role})
                    </div>
                    <div className="text-gray-500">
                      {cred.id} / {cred.password}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
