import React, { useState } from 'react';
import loginLogo from '../src/assets/login_logo.png';
import { supabase } from '../services/supabaseClient';

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        let authEmail = email.trim();
        let employeeName = '';

        try {
            // 1. Resolve Credentials
            // If it looks like an ID (no @), look it up in the directory
            if (!authEmail.includes('@')) {
                const { data, error: fetchError } = await supabase
                    .from('allowed_employees')
                    .select('email, employee_name')
                    .ilike('employee_code', authEmail)
                    .maybeSingle(); // Use maybeSingle to avoid error on 0 rows, we handle it manully

                console.log('Employee Lookup:', { id: authEmail, data, error: fetchError });

                if (fetchError) {
                    console.error('Database Error:', fetchError);
                    // Show actual error to help debug (e.g. "permission denied" vs "relation does not exist")
                    throw new Error(`Database Error: ${fetchError.message} (${fetchError.details || fetchError.hint || 'Check RLS on allowed_employees'})`);
                }

                if (!data) {
                    throw new Error(`Employee ID "${authEmail}" not found in allowed_employees. (Hint: Check RLS!)`);
                }

                authEmail = data.email;
                employeeName = data.employee_name;
            }

            // Hardcoded Training Team Bypass
            if (authEmail === 'training@thirdwavecoffee.in' && password === 'Training@10') {
                localStorage.setItem('bc_mock_session', 'training_team_active');
                window.location.reload();
                return;
            }

            if (isSignUp) {
                // Pass existing directory data to metadata if available
                const { error } = await supabase.auth.signUp({
                    email: authEmail,
                    password,
                    options: {
                        data: {
                            full_name: employeeName || undefined,
                            // Store original input ID if it was an ID, or undefined
                            employee_id: !email.includes('@') ? email : undefined
                        }
                    }
                });

                if (error) throw error;
                alert(`Confirmation link sent to ${authEmail}!`);
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during authentication.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0e0d0c] flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#c29a67]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#c29a67]/5 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md z-10 pt-0">
                <div className="text-center mb-0 flex flex-col items-center">
                    <div className="w-80 h-32 overflow-hidden flex items-start justify-center">
                        <img src={loginLogo} alt="Wavegram" className="w-full h-auto object-contain mt-[-10px]" />
                    </div>
                    <p className="text-[#c29a67] font-bold uppercase tracking-[0.4em] text-[10px] opacity-70 mt-[-20px] mb-6">The Coffee Network</p>
                </div>

                <div className="glass bg-[#1a1817]/60 p-8 rounded-[2.5rem] border border-[#2c1a12] shadow-2xl backdrop-blur-xl">
                    <h2 className="text-xl font-bold text-[#efebe9] mb-8 text-center">
                        {isSignUp ? 'Apply for Access' : 'Welcome Back'}
                    </h2>

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-[#a09a96] uppercase tracking-wider mb-2 ml-1">Work Email or Employee ID</label>
                            <input
                                type="text"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g. TWC123 or email@thirdwavecoffee.in"
                                className="w-full bg-[#0e0d0c]/50 border border-[#2c1a12] rounded-2xl px-5 py-4 text-[#efebe9] placeholder-[#a09a96]/30 focus:outline-none focus:border-[#c29a67] transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#a09a96] uppercase tracking-wider mb-2 ml-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-[#0e0d0c]/50 border border-[#2c1a12] rounded-2xl px-5 py-4 text-[#efebe9] placeholder-[#a09a96]/30 focus:outline-none focus:border-[#c29a67] transition-all"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-2xl flex items-start gap-3">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#efebe9] text-[#0e0d0c] font-black py-4 rounded-2xl hover:bg-white transition-all transform active:scale-[0.98] shadow-lg disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-[#0e0d0c] border-t-transparent rounded-full animate-spin" />
                                    Connecting...
                                </div>
                            ) : (
                                isSignUp ? 'Join Wavegram' : 'Enter Lounge'
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-[#a09a96] text-sm">
                        {isSignUp ? 'Already a member?' : 'New at TWC?'}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="ml-2 text-[#c29a67] font-bold hover:underline"
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>

                <p className="mt-8 text-center text-[#a09a96]/40 text-xs px-8">
                    This is a private network. By entering, you agree to the TWC internal communication guidelines.
                </p>
            </div>
        </div>
    );
};

export default Auth;
