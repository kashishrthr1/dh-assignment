import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const fillSubscriberDemo = () => {
    setEmail("player@digitalheroes.io");
    setPassword("SubscriberPass123!");
    setError(null);
  };

  const fillAdminDemo = () => {
    setEmail("admin@digitalheroes.io");
    setPassword("AdminMasterKey2026!");
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative bg-[#070A12]">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00F5A0]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="text-center mb-8 space-y-2">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F5A0] to-[#00D2FF] flex items-center justify-center shadow-lg shadow-[#00F5A0]/20">
            <Sparkles className="w-5 h-5 text-[#070A12] stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">
            DIGITAL<span className="text-[#00F5A0]">HEROES</span>
          </span>
        </Link>
        <p className="text-xs text-slate-400">Welcome back. Enter your player credentials to continue.</p>
      </div>

      <Card className="w-full max-w-md p-8 border-white/[0.12] space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Sign In</h2>
          <Badge variant="slate" size="sm">JWT Secured</Badge>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#FF4D6D]/10 border border-[#FF4D6D]/25 flex items-center gap-2.5 text-xs text-[#FF4D6D]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <Button type="submit" size="lg" isLoading={loading} className="w-full text-sm mt-2">
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        {/* Quick Test Credentials */}
        <div className="pt-4 border-t border-white/[0.08] space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center">
            Quick Demo Autofill
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillSubscriberDemo}
              className="px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white transition-all text-center"
            >
              Demo Subscriber
            </button>
            <button
              type="button"
              onClick={fillAdminDemo}
              className="px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-[#00F5A0] hover:bg-[#00F5A0]/10 transition-all text-center"
            >
              Demo Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Don&apos;t have an account yet?{" "}
          <Link to="/signup" className="text-[#00F5A0] font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  );
}
