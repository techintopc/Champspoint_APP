import React from 'react';
import { LogIn, ShieldCheck, Zap, BarChart3, Clock, Mail, Lock, UserPlus } from 'lucide-react';
import { signInWithGoogle, auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function Auth() {
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row items-center justify-center p-4 lg:p-0">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 h-screen bg-indigo-600 p-16 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-indigo-600 font-black text-3xl">C</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Champspoint</h1>
          </div>
          
          <div className="space-y-12 max-w-md">
            <h2 className="text-5xl font-black leading-tight">
              Manage your IT business with precision.
            </h2>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="shrink-0 w-12 h-12 bg-indigo-500/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Zap className="text-indigo-100" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Fast Invoicing</h3>
                  <p className="text-indigo-100/80 text-sm leading-relaxed">Generate professional invoices in seconds and get paid faster with automated tracking.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="shrink-0 w-12 h-12 bg-indigo-500/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <BarChart3 className="text-indigo-100" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Expense Tracking</h3>
                  <p className="text-indigo-100/80 text-sm leading-relaxed">Monitor your overheads and business spending with detailed categorization and reports.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0 w-12 h-12 bg-indigo-500/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Clock className="text-indigo-100" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Real-time Insights</h3>
                  <p className="text-indigo-100/80 text-sm leading-relaxed">Get a bird's-eye view of your business health with our intuitive dashboard and analytics.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 pt-12 border-t border-indigo-500/50">
          <p className="text-sm font-medium text-indigo-200">© 2026 Champspoint IT Solutions. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8 p-8 bg-white lg:bg-transparent rounded-3xl shadow-xl lg:shadow-none border lg:border-none">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">C</span>
              </div>
              <span className="font-bold text-2xl text-slate-900">Champspoint</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-slate-500 font-medium">
              {isSignUp ? 'Join Champspoint to grow your business.' : 'Log in to your account to manage your business.'}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold transition-all duration-200 shadow-lg shadow-indigo-200 active:scale-[0.98] disabled:opacity-50"
            >
              {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
                <span className="bg-white lg:bg-slate-50 px-4 text-slate-400">Or continue with</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 hover:border-indigo-100 hover:bg-slate-50 px-6 py-4 rounded-2xl font-bold text-slate-700 transition-all duration-200 shadow-sm active:scale-[0.98]"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
          </form>

          <div className="text-center space-y-4">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
            
            <p className="text-xs text-slate-400 font-medium">
              By continuing, you agree to Champspoint's <br />
              <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
