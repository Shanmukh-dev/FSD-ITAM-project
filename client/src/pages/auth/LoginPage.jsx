import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, Mail, User, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ThemeToggle from '../../components/layout/ThemeToggle';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, setupAdmin, isAuthenticated } = useAuth();

  const [isSetupMode, setIsSetupMode] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Check if system requires initial bootstrap setup
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get('/auth/setup-status');
        if (res.data.success && !res.data.initialized) {
          setIsSetupMode(true);
        }
      } catch (err) {
        // Continue to standard login
      } finally {
        setCheckingSetup(false);
      }
    };
    checkStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSetupMode) {
        await setupAdmin(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Authentication failed. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Top right theme switch */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Background ambient lighting glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/[0.06] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center shadow-lg shadow-primary/10 mb-3 text-primary">
            <ShieldCheck size={30} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-[11px] text-primary uppercase tracking-wide mb-2 font-semibold">
            Equipment & Device Hub
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-chalk tracking-tight">
            IT Asset Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-on-surface-variant mt-1">
            {isSetupMode
              ? 'Welcome! Set up your primary admin account to get started.'
              : 'Welcome back! Sign in to access your organization.'}
          </p>
        </div>

        {/* Card Frame */}
        <Card className="p-6 sm:p-8 bg-white/95 dark:bg-[#111827]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 dark:border-t-white/[0.12] shadow-xl dark:shadow-2xl">
          {isSetupMode && (
            <div className="mb-5 p-3 rounded-xl bg-amber-50 dark:bg-amber/10 border border-amber-200 dark:border-amber/30 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber">
              <ShieldAlert size={18} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">First-time Setup:</span> Welcome to your new workspace. Please create your primary administrator account below.
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-destructive/15 border border-rose-200 dark:border-destructive/30 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSetupMode && (
              <Input
                label="Admin Full Name"
                placeholder="e.g. Master Administrator"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={User}
                required
              />
            )}

            <Input
              type="email"
              label="Work Email"
              placeholder="name@enterprise.corp"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              required
              minLength={6}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 font-semibold shadow-md shadow-primary/20"
              loading={loading}
            >
              <span>{isSetupMode ? 'Create Admin Account & Launch' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </Button>
          </form>
        </Card>

        {/* Footer badges */}
        <div className="flex items-center justify-center gap-4 mt-8 text-[11px] text-slate-400 dark:text-slate-500">
          <span>Secure Login</span>
          <span>•</span>
          <span>Encrypted Session</span>
          <span>•</span>
          <span>Role-Based Access</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
