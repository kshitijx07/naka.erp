import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, reset } from '../redux/slices/authSlice';
import { ArrowRight, Loader2, ShieldCheck, Mail, Lock } from 'lucide-react';
import { animate, createTimeline, stagger } from 'animejs';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { email, password } = formData;
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isLoading, isError, message, isSuccess } = useSelector((state) => state.auth);

    // Refs for animations
    const containerRef = useRef(null);
    const cardRef = useRef(null);
    const bgShapesRef = useRef(null);
    const buttonRef = useRef(null);
    const formFieldsRef = useRef([]);

    useEffect(() => {
        if (isSuccess || user) {
            // Success exit animation
            animate(cardRef.current, {
                opacity: 0,
                translateY: -20,
                duration: 500,
                easing: 'easeInOutQuad',
                complete: () => navigate('/dashboard')
            });
        }
        if (isError) console.error(message);
        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    useEffect(() => {
        // 1. Page Entrance Sequence
        const tl = createTimeline({
            easing: 'easeOutQuart'
        });

        tl.add(containerRef.current, {
            opacity: [0, 1],
            duration: 800
        })
            .add(cardRef.current, {
                translateY: [40, 0],
                opacity: [0, 1],
                duration: 1000
            }, '-=400')
            .add(formFieldsRef.current, {
                translateY: [20, 0],
                opacity: [0, 1],
                delay: stagger(100),
                duration: 800
            }, '-=600')
            .add(buttonRef.current, {
                scale: [0.95, 1],
                opacity: [0, 1],
                duration: 600
            }, '-=400');

        // 2. Floating Background Animation
        animate('.bg-shape', {
            translateY: [0, -30],
            duration: (el, i) => 3000 + i * 1000,
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutSine'
        });
    }, []);

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = (e) => {
        e.preventDefault();
        // Button press animation
        animate(buttonRef.current, {
            scale: 0.96,
            duration: 100,
            direction: 'alternate',
            easing: 'easeInOutQuad'
        });
        dispatch(login({ email, password }));
    };

    // 4. Magnetic Button Logic
    const handleMouseMove = (e) => {
        const btn = buttonRef.current;
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        animate(btn, {
            translateX: x * 0.2,
            translateY: y * 0.2,
            duration: 150,
            easing: 'easeOutQuad'
        });
    };

    const handleMouseLeave = () => {
        animate(buttonRef.current, {
            translateX: 0,
            translateY: 0,
            duration: 400,
            easing: 'easeOutElastic(1, .8)'
        });
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-[#f3f3f3] flex items-center justify-center p-6 relative overflow-hidden font-['Inter',sans-serif] opacity-0">
            {/* Background Abstract Shapes */}
            <div ref={bgShapesRef} className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="bg-shape absolute top-[10%] left-[15%] w-64 h-64 bg-black/[0.03] rotate-45"></div>
                <div className="bg-shape absolute bottom-[15%] right-[10%] w-96 h-96 bg-black/[0.02] -rotate-12"></div>
                <div className="bg-shape absolute top-[60%] left-[5%] w-32 h-32 bg-black/[0.04] rotate-12"></div>
            </div>

            {/* Login Card */}
            <div
                ref={cardRef}
                className="w-full max-w-[420px] bg-white border border-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative z-10 p-10 opacity-0"
            >
                <div className="mb-10 text-center" ref={el => formFieldsRef.current[0] = el}>
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white mb-6">
                        <ShieldCheck size={24} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase mb-2">Enterprise Access</h2>
                    <p className="text-sm text-gray-400 font-medium">Secure Operational Management System</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-8">
                    {/* Email Field */}
                    <div className="space-y-2 group" ref={el => formFieldsRef.current[1] = el}>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Authority ID</label>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                placeholder="name@enterprise.com"
                                className="w-full bg-transparent border-b-2 border-gray-100 py-3 pl-8 text-sm font-medium text-gray-900 focus:outline-none focus:border-black transition-all peer"
                                required
                            />
                            <Mail size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 peer-focus:text-black transition-colors" />
                            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-full"></div>
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2 group" ref={el => formFieldsRef.current[2] = el}>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Security Key</label>
                        <div className="relative">
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                placeholder="••••••••"
                                className="w-full bg-transparent border-b-2 border-gray-100 py-3 pl-8 text-sm font-medium text-gray-900 focus:outline-none focus:border-black transition-all peer"
                                required
                            />
                            <Lock size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 peer-focus:text-black transition-colors" />
                            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-full"></div>
                        </div>
                    </div>

                    {isError && (
                        <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider text-center bg-red-50 py-2 border border-red-100">
                            Authentication Failed: {message}
                        </div>
                    )}

                    {/* Login Button */}
                    <button
                        ref={buttonRef}
                        type="submit"
                        disabled={isLoading}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className="w-full bg-black text-white text-xs font-black uppercase tracking-widest py-5 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-shadow disabled:bg-gray-400 disabled:shadow-none"
                    >
                        {isLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <>
                                Initiate Session
                                <ArrowRight size={14} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-12 text-center" ref={el => formFieldsRef.current[3] = el}>
                    <p className="text-[9px] text-gray-300 font-bold uppercase tracking-[0.15em]">
                        Part of <span className="text-gray-900">NAKA Integrated Systems</span>
                    </p>
                    <p className="text-[9px] text-gray-300 mt-1">© 2026 Secured Operational Network</p>
                </div>
            </div>

            {/* Visual Flair: Corner Accents */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-black/5 m-12 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-black/5 m-12 pointer-events-none"></div>
        </div>
    );
};

export default Login;

