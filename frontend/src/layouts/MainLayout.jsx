import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../redux/slices/authSlice';
import {
    LayoutDashboard,
    ShoppingCart,
    Factory,
    DollarSign,
    Package,
    Wrench,
    LogOut,
    Menu,
    X,
    ChevronRight,
    UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const onLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Sales', path: '/dashboard/sales', icon: ShoppingCart },
        { name: 'Production', path: '/dashboard/production', icon: Factory },
        { name: 'Salary', path: '/dashboard/salary', icon: DollarSign },
        { name: 'Inventory', path: '/dashboard/materials', icon: Package },
        { name: 'Maintenance', path: '/dashboard/maintenance', icon: Wrench },
    ];

    const pageVariants = {
        initial: { opacity: 0, y: 10 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -10 }
    };

    const pageTransition = {
        type: 'tween',
        ease: 'anticipate',
        duration: 0.4
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] text-gray-900 font-sans mx-auto">
            {/* BACKGROUND TEXTURE */}
            <div className="fixed inset-0 opacity-[0.02] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            />

            {/* NAVBAR */}
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm h-16"
            >
                <div className="container mx-auto px-4 lg:px-8 h-full flex items-center justify-between">

                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-display font-black tracking-tighter text-black flex items-center gap-1">
                            <div className="w-3 h-3 bg-[#9EFF00] rounded-sm"></div> NAKA<span className="text-gray-400">.ERP</span>
                        </span>

                        <div className="hidden md:block w-px h-6 bg-gray-200 mx-2"></div>

                        <span className="hidden md:block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded">
                            v0.0 Beta
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center bg-gray-100/50 p-1 rounded-full border border-gray-200/50">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/dashboard'}
                                className={({ isActive }) =>
                                    `text-xs font-bold px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2
                                     ${isActive
                                        ? 'bg-black text-white shadow-md'
                                        : 'text-gray-500 hover:text-black hover:bg-white/50'
                                    }`
                                }
                            >
                                <item.icon size={14} /> {item.name}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-3 pl-4 border-l border-gray-200">
                            <div className="text-right">
                                <p className="text-xs font-bold text-black leading-none">{user?.name || 'Guest'}</p>
                                <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5 font-bold">{user?.role || 'Admin'}</p>
                            </div>
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-black rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md">
                                {user?.name ? user.name.charAt(0) : 'U'}
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onLogout}
                            className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors ml-2"
                        >
                            <LogOut size={14} />
                        </motion.button>

                        {/* Mobile Toggle */}
                        <button
                            className="md:hidden text-black p-2 bg-gray-100 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* MOBILE MENU */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl pt-24 px-6 md:hidden"
                    >
                        <div className="flex flex-col gap-4">
                            {navItems.map((item, i) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) => `text-xl font-bold flex items-center gap-4 p-4 rounded-xl border border-transparent transition-all ${isActive ? 'bg-black text-white shadow-lg' : 'bg-gray-50 text-gray-600 border-gray-100'}`}
                                >
                                    <item.icon size={20} />
                                    {item.name}
                                    <ChevronRight className={`ml-auto ${isActive ? 'text-white' : 'text-gray-300'}`} size={16} />
                                </NavLink>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAIN CONTENT */}
            <main className="pt-24 pb-12 container mx-auto px-4 lg:px-8 max-w-7xl">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={location.pathname}
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

        </div>
    );
};

export default MainLayout;
