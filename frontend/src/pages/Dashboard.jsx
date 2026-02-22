import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDashboardStats } from '../redux/slices/dashboardSlice';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Activity, Zap, Server, AlertTriangle, CheckCircle, Clock,
    TrendingUp, Users, Package, AlertCircle, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/currency';
import { fadeInUp, staggerContainer, IMAGES, scaleIn } from '../utils/visuals';
import { DashboardSkeleton } from '../components/common/Skeleton';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { stats: dashboardData, isLoading, isError, message } = useSelector((state) => state.dashboard);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        dispatch(getDashboardStats());
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [dispatch]);

    const handleRefresh = () => {
        dispatch(getDashboardStats());
    };

    if (isLoading && !dashboardData) return <DashboardSkeleton />;
    if (isError) return <div className="h-screen flex items-center justify-center text-red-500 bg-gray-50">Error: {message}</div>;

    const { stats, chartData, recentActivity, pendingActions, machineStatusList } = dashboardData || {};

    const operationalCount = machineStatusList?.filter(m => m.status === 'Operational').length || 0;
    const totalMachines = machineStatusList?.length || 0;
    const healthPercentage = totalMachines > 0 ? Math.round((operationalCount / totalMachines) * 100) : 0;

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-6 pb-10"
        >
            {/* Command Center Header */}
            <motion.div variants={fadeInUp} className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 opacity-30">
                    <img src={IMAGES.DASHBOARD_HEADER} alt="Bg" className="w-full h-full object-cover grayscale" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-transparent"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-mono text-green-400 uppercase tracking-widest">System Online</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-2">Operations Center</h1>
                        <p className="text-gray-400 max-w-lg">Real-time monitoring of production lines, inventory flux, and machine health telemetry.</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-mono font-bold tracking-tighter">
                            {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                            {currentTime.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </div>
                        <button
                            onClick={handleRefresh}
                            className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold transition-all backdrop-blur-md ml-auto"
                        >
                            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> REFRESH DATA
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* KPI Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Revenue Stream"
                    value={formatCurrency(stats?.totalRevenue || 0)}
                    icon={TrendingUp}
                    color="text-emerald-400"
                    trend="+12.5% vs avg"
                />
                <KPICard
                    title="Production Efficiency"
                    value={`${stats?.efficiencyRate || 0}%`}
                    icon={Zap}
                    color="text-amber-400"
                    trend="Operating Level"
                />
                <KPICard
                    title="Active Personnel"
                    value={stats?.activeUsers || 0}
                    icon={Users}
                    color="text-blue-400"
                    trend="On Shift"
                />
                <KPICard
                    title="Inventory Health"
                    value={stats?.lowStockCount === 0 ? "Healthy" : `${stats?.lowStockCount} Alerts`}
                    icon={Package}
                    color={stats?.lowStockCount === 0 ? "text-green-400" : "text-red-400"}
                    trend="Stock Levels"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Machine Status Board */}
                <motion.div variants={fadeInUp} className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 p-6 shadow-xl flex flex-col h-[500px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Server size={20} className="text-gray-400" /> Machine Status
                        </h3>
                        <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">
                            {operationalCount}/{totalMachines} Online
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {machineStatusList?.length > 0 ? (
                            machineStatusList.map(machine => (
                                <div key={machine._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${machine.status === 'Operational' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'} animate-pulse`}></div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm">{machine.name}</div>
                                            <div className="text-xs text-gray-500">{machine.type}</div>
                                        </div>
                                    </div>
                                    <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${machine.status === 'Operational' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {machine.status === 'Operational' ? 'Running' : 'Down'}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <Activity size={40} className="mb-2 opacity-20" />
                                <span className="text-xs font-medium">No telemetry data</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Production Chart */}
                <motion.div variants={fadeInUp} className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-xl h-[500px] flex flex-col">
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Activity size={20} className="text-gray-400" /> Production Metrics
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">7-Day Output vs Revenue Analysis</p>
                    </div>
                    <div className="flex-1 w-full min-h-0 relative z-10">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#111827" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                <Tooltip
                                    formatter={(value, name) => [name === 'Revenue' ? formatCurrency(value) : value, name]}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                    cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                                />
                                <Area type="monotone" name="Revenue" dataKey="sales" stroke="#111827" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                                <Area type="monotone" name="Output (m)" dataKey="production" stroke="#22c55e" fillOpacity={1} fill="url(#colorProd)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* System Alerts */}
                <motion.div variants={fadeInUp} className="bg-gray-900 text-white rounded-2xl p-6 shadow-xl border border-gray-800">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-white">
                        <AlertTriangle size={20} className="text-orange-400" /> System Alerts
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300 ml-auto">{pendingActions?.length || 0} Active</span>
                    </h3>
                    <div className="space-y-3">
                        {pendingActions?.length > 0 ? (
                            pendingActions.map((action, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle size={16} className={action.priority === 'High' ? "text-red-400" : "text-amber-400"} />
                                        <div>
                                            <div className="text-sm font-bold text-gray-200">{action.title}</div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-wider">{action.type} • {action.priority}</div>
                                        </div>
                                    </div>
                                    <button className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition-all">
                                        VIEW
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500 text-sm italic border border-dashed border-gray-800 rounded-xl">
                                System Operating Normally
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Live Feed */}
                <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Activity size={20} className="text-blue-500" /> Live Feed
                    </h3>
                    <div className="space-y-0 relative">
                        <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-gray-100"></div>
                        {recentActivity?.map((activity, i) => (
                            <div key={i} className="flex gap-4 items-start py-3 relative">
                                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm ${activity.status === 'danger' ? 'bg-red-50 text-red-500' : activity.status === 'warning' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                                    {activity.status === 'danger' ? <AlertCircle size={16} /> : activity.status === 'warning' ? <Zap size={16} /> : <CheckCircle size={16} />}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">{activity.message}</div>
                                    <div className="text-xs text-gray-500 mt-0.5 font-mono">{new Date(activity.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • {activity.type}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

// Sub-component for KPIs
const KPICard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div
        variants={scaleIn}
        className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl relative overflow-hidden group hover:border-gray-700 transition-colors"
    >
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-all"></div>
        <div className="relative z-10">
            <div className={`w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center mb-4 ${color}`}>
                <Icon size={20} />
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-display font-black text-white tracking-tight mb-2">{value}</h3>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-[10px] text-gray-400 font-medium">
                {trend}
            </div>
        </div>
    </motion.div>
);

export default Dashboard;
