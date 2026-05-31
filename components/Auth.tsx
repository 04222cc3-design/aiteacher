import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } else {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        role: role,
                        email: email, // Also pass email in metadata for the trigger
                    },
                },
            });
            if (error) throw error;
            setMessage('Registration successful! Please check your email for a confirmation link.');
        }
    } catch (error: any) {
        setError(error.error_description || error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 font-sans">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-lg shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-cyan-400">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="mt-2 text-sm text-center text-slate-400">
            Interactive AI Tutor
          </p>
        </div>

        <div className="flex border-b border-slate-600">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 text-sm font-medium transition-colors ${isLogin ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                Sign In
            </button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 text-sm font-medium transition-colors ${!isLogin ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                Sign Up
            </button>
        </div>

        <form className="space-y-6" onSubmit={handleAuth}>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 peer"
              placeholder=" "
            />
            <label htmlFor="email" className="absolute left-3 -top-2.5 text-slate-400 text-sm bg-slate-700 px-1 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-cyan-400">
              Email address
            </label>
          </div>

          <div className="relative">
            <input
              id="password"
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 peer"
              placeholder=" "
            />
            <label htmlFor="password" className="absolute left-3 -top-2.5 text-slate-400 text-sm bg-slate-700 px-1 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-cyan-400">
              Password
            </label>
          </div>
          
          {!isLogin && (
            <div>
              <span className="text-sm font-medium text-slate-400">I am a:</span>
              <div className="flex items-center mt-2 space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="role" value="student" checked={role === 'student'} onChange={() => setRole('student')} className="form-radio text-cyan-500 bg-slate-700 border-slate-600 focus:ring-cyan-500" />
                  <span className="text-white">Student</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="role" value="teacher" checked={role === 'teacher'} onChange={() => setRole('teacher')} className="form-radio text-cyan-500 bg-slate-700 border-slate-600 focus:ring-cyan-500" />
                  <span className="text-white">Teacher</span>
                </label>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-center text-red-400">{error}</p>}
          {message && <p className="text-sm text-center text-green-400">{message}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-bold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-wait"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};