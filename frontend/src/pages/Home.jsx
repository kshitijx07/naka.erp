import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Box, Activity, Layers, Cpu, ShieldCheck, Zap, Menu } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();
    const { scrollY } = useScroll();
    const yHero = useTransform(scrollY, [0, 500], [0, 150]);

    const containerVariant = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 }
        }
    };

    const itemVariant = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 50, damping: 20 }
        }
    };

    return (
        <div className="bg-[#f3f3f3] min-h-screen text-[#111111] overflow-x-hidden selection:bg-[#9EFF00] selection:text-black font-sans">
            {/* Background Grid (Same as Login) */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0"
                style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-6 bg-[#f3f3f3]/80 backdrop-blur-md border-b border-[#e5e5e5]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#111111] text-white flex items-center justify-center font-bold text-xs">N</div>
                    <div className="text-xl font-bold tracking-tight">NAKA<span className="text-[#555]">.ERP</span></div>
                </div>
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/login')} className="text-sm font-bold uppercase tracking-wider hover:text-gray-500 transition-colors">Log In</button>
                    <button
                        onClick={() => navigate('/login')}
                        className="hidden md:flex bg-[#111111] text-white px-6 py-2.5 font-bold uppercase text-xs tracking-widest hover:bg-black hover:scale-105 transition-all"
                    >
                        Access Workspace
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 pt-20 z-10">
                <motion.div
                    variants={containerVariant}
                    initial="hidden"
                    animate="visible"
                    className="max-w-6xl mx-auto"
                >
                    <motion.div variants={itemVariant} className="flex justify-center mb-8">
                        <span className="px-4 py-1.5 bg-white border border-[#e5e5e5] text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-[#9EFF00] border border-black" /> System Operational v4.2
                        </span>
                    </motion.div>

                    <motion.h1 variants={itemVariant} className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8 leading-[0.9] text-[#111111]">
                        REDEFINE <br />
                        <span className="text-gray-400">POSSIBILITY.</span>
                    </motion.h1>

                    <motion.p variants={itemVariant} className="text-lg md:text-2xl text-gray-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                        Advanced ERP solutions for modern textile manufacturing.
                        Precision, control, and efficiency in one unified platform.
                    </motion.p>

                    <motion.div variants={itemVariant} className="flex flex-col md:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="h-14 px-8 bg-[#111111] text-white font-bold uppercase tracking-widest hover:bg-black hover:translate-y-[-2px] transition-all flex items-center gap-2 shadow-xl"
                        >
                            Start Now <ArrowRight size={18} />
                        </button>
                        <button className="h-14 px-8 bg-white border border-[#e5e5e5] text-[#111111] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
                            Documentation
                        </button>
                    </motion.div>
                </motion.div>

                {/* Dashboard Preview (Clean & Bright) */}
                <motion.div
                    style={{ y: yHero }}
                    initial={{ opacity: 0, rotateX: 20 }}
                    animate={{ opacity: 1, rotateX: 0 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="mt-20 relative w-full max-w-5xl mx-auto perspective-1000 hidden md:block"
                >
                    <div className="relative rounded-t-xl bg-white border border-[#e5e5e5] p-2 shadow-2xl">
                        {/* Abstract White UI */}
                        <div className="bg-[#f9f9f9] rounded-lg overflow-hidden aspect-video relative flex flex-col border border-[#f3f3f3]">
                            <div className="h-12 border-b border-[#e5e5e5] bg-white flex items-center justify-between px-4">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#e5e5e5]" />
                                    <div className="w-3 h-3 rounded-full bg-[#e5e5e5]" />
                                </div>
                                <div className="h-2 w-32 bg-[#f3f3f3] rounded-full" />
                            </div>
                            <div className="flex-1 p-6 grid grid-cols-4 gap-6">
                                <div className="hidden md:flex flex-col gap-3 col-span-1 border-r border-[#e5e5e5] pr-6">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-8 w-full bg-white border border-[#e5e5e5] rounded" />)}
                                </div>
                                <div className="col-span-4 md:col-span-3 grid grid-cols-3 gap-6">
                                    <div className="h-24 bg-white rounded border border-[#e5e5e5] p-3 flex flex-col justify-between shadow-sm">
                                        <div className="w-8 h-8 bg-black/5 rounded" />
                                        <div className="h-2 w-16 bg-[#f3f3f3] rounded" />
                                    </div>
                                    <div className="h-24 bg-white rounded border border-[#e5e5e5] p-3 flex flex-col justify-between shadow-sm">
                                        <div className="w-8 h-8 bg-black/5 rounded" />
                                        <div className="h-2 w-16 bg-[#f3f3f3] rounded" />
                                    </div>
                                    <div className="h-24 bg-white rounded border border-[#e5e5e5] p-3 flex flex-col justify-between shadow-sm">
                                        <div className="w-8 h-8 bg-black/5 rounded" />
                                        <div className="h-2 w-16 bg-[#f3f3f3] rounded" />
                                    </div>
                                    <div className="col-span-3 h-48 bg-white rounded border border-[#e5e5e5] relative overflow-hidden flex items-end p-4 gap-2 shadow-sm">
                                        {[40, 60, 45, 70, 50, 80, 65, 90, 75, 55, 60, 40].map((h, i) => (
                                            <div key={i} className="flex-1 bg-[#111111] rounded-t-sm opacity-90" style={{ height: `${h}%` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Industrial Tape (Light Mode) */}
            <div className="bg-[#111111] py-4 transform -rotate-1 origin-center relative z-20 mx-[-20px] shadow-xl">
                <motion.div
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
                    className="whitespace-nowrap text-white font-bold text-lg md:text-xl uppercase tracking-widest flex gap-8 items-center"
                >
                    {[...Array(10)].map((_, i) => (
                        <span key={i} className="flex items-center gap-8 opacity-80">
                            <span>/// SYSTEM OPTIMIZED</span>
                            <Activity size={18} className="text-[#9EFF00]" />
                            <span>PRODUCTION LIVE</span>
                            <Box size={18} className="text-[#9EFF00]" />
                        </span>
                    ))}
                </motion.div>
            </div>

            {/* Features Section */}
            <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto z-10 relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-[#111111]">COMPLETE <br /> <span className="text-gray-400">CONTROL.</span></h2>
                        <p className="text-gray-500 text-lg leading-relaxed mb-8 font-medium">
                            From the warehouse floor to the executive suite, NAKA.ERP unifies your entire manufacturing pipeline into a single, cohesive interface.
                        </p>
                        <div className="flex gap-8">
                            <div>
                                <div className="text-3xl font-bold text-[#111111]">99.9%</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">Uptime</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-[#111111]">40%</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">Efficiency</div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <FeatureBox icon={<Layers size={24} />} title="Multi-Layer" desc="Manage multiple production lines." />
                        <FeatureBox icon={<Cpu size={24} />} title="AI Powered" desc="Predictive maintenance stock." />
                        <FeatureBox icon={<ShieldCheck size={24} />} title="Secure" desc="Bank-grade encryption." />
                        <FeatureBox icon={<Zap size={24} />} title="Real-Time" desc="Instant synchronization." />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-white border-t border-[#e5e5e5] text-center">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-[#111111] text-white flex items-center justify-center font-bold text-[10px]">N</div>
                    <div className="text-lg font-bold tracking-tight">NAKA<span className="text-[#555]">.ERP</span></div>
                </div>
                <div className="text-gray-400 text-xs font-mono uppercase tracking-widest">
                    &copy; 2026 NAKA Systems Inc.
                </div>
            </footer>
        </div>
    );
};

const FeatureBox = ({ icon, title, desc }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white border border-[#e5e5e5] p-6 shadow-sm hover:shadow-lg hover:border-[#111111] transition-all group"
    >
        <div className="text-[#111111] mb-4">{icon}</div>
        <h3 className="font-bold text-lg mb-2 text-[#111111]">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed font-medium">{desc}</p>
    </motion.div>
);

export default Home;
