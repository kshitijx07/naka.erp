import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getOrders, createOrder, updateOrder, deleteOrder, reset as resetOrders } from '../redux/slices/productionOrderSlice';
import { getProductionLogs, addProductionLog, reset as resetLogs } from '../redux/slices/productionSlice';
import { getMaterials } from '../redux/slices/materialSlice';
import {
    Plus, Search, Calendar, BadgeCheck, AlertCircle, Clock,
    ChevronRight, Tractor, User, Package, X, Loader2, ArrowRight,
    Activity, Zap, Settings, TrendingUp, Trash2, FileText, Filter,
    LayoutGrid, List, Clipboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, staggerContainer, IMAGES, scaleIn } from '../utils/visuals';
import { PageSkeleton } from '../components/common/Skeleton';

const Production = () => {
    const dispatch = useDispatch();
    const { orders, isLoading: ordersLoading, isSuccess: orderSuccess } = useSelector((state) => state.productionOrders);
    const { logs, isLoading: logsLoading, isSuccess: logSuccess } = useSelector((state) => state.production);
    const { materials } = useSelector((state) => state.materials);

    const [activeTab, setActiveTab] = useState('orders'); // overview, orders, logs
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const initialFormState = {
        orderNumber: '',
        productName: '',
        targetQuantity: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        priority: 'Medium',
        status: 'Pending',
        materials: []
    };

    // Form States
    const [formData, setFormData] = useState({
        ...initialFormState,
        orderNumber: `PO-${Date.now().toString().slice(-6)}`
    });

    const [logData, setLogData] = useState({
        loomNumber: 1,
        workerId: '',
        clothType: '',
        metersProduced: '',
        defects: 0
    });

    useEffect(() => {
        dispatch(getOrders());
        dispatch(getProductionLogs());
        dispatch(getMaterials());

        // Cleanup function to reset success states on unmount
        return () => {
            dispatch(resetOrders());
            dispatch(resetLogs());
        };
    }, [dispatch]);


    // Effect to populate form when editing
    useEffect(() => {
        if (selectedOrder) {
            setFormData({
                orderNumber: selectedOrder.orderNumber,
                productName: selectedOrder.productName,
                targetQuantity: selectedOrder.targetQuantity,
                startDate: selectedOrder.startDate ? new Date(selectedOrder.startDate).toISOString().split('T')[0] : '',
                endDate: selectedOrder.endDate ? new Date(selectedOrder.endDate).toISOString().split('T')[0] : '',
                priority: selectedOrder.priority,
                status: selectedOrder.status || 'Pending'
            });
            setIsCreateModalOpen(true);
        }
    }, [selectedOrder]);

    const isLoading = ordersLoading || logsLoading;

    // Stats Calculation
    const totalOrders = orders?.length || 0;
    const activeOrders = orders?.filter(o => o.status === 'In Progress').length || 0;
    const completedOrdersCount = orders?.filter(o => o.status === 'Completed').length || 0;
    const totalOutputToday = logs?.filter(l => new Date(l.date).toDateString() === new Date().toDateString())
        .reduce((acc, curr) => acc + curr.metersProduced, 0) || 0;

    const filteredOrders = orders?.filter(o =>
        (o.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.productName || '').toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const resetForm = () => {
        setFormData({
            ...initialFormState,
            orderNumber: `PO-${Date.now().toString().slice(-6)}`
        });
        setSelectedOrder(null);
        setIsCreateModalOpen(false);
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (selectedOrder) {
            await dispatch(updateOrder({ id: selectedOrder._id, orderData: formData }));
        } else {
            await dispatch(createOrder(formData));
        }
        resetForm();
        dispatch(getOrders()); // Refresh list to be sure
    };

    const handleLogSubmit = async (e) => {
        e.preventDefault();
        // Hardcoded worker ID for demo purposes as discussed
        await dispatch(addProductionLog({ ...logData, workerId: '67b36f7344c8c764e526487e' }));
        setIsLogModalOpen(false);
        setLogData({ loomNumber: 1, workerId: '', clothType: '', metersProduced: '', defects: 0 });
        dispatch(getProductionLogs()); // Refresh
    };

    const handleDeleteOrder = async (id) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            await dispatch(deleteOrder(id));
            dispatch(getOrders());
        }
    };

    const handleCloseModal = () => {
        resetForm();
    };

    if (isLoading && (!orders || orders.length === 0)) return <PageSkeleton />;

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-6 pb-10"
        >
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none"></div>
                <div className="relative z-10">
                    <motion.div variants={fadeInUp} className="flex items-center gap-2 text-xs font-bold text-green-600 mb-2 uppercase tracking-wide">
                        <Activity size={12} /> Manufacturing Control
                    </motion.div>
                    <motion.h1 variants={fadeInUp} className="text-4xl font-display font-black text-gray-900 tracking-tight">
                        Production Floor
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-gray-500 mt-2 max-w-lg font-medium">
                        Manage production cycles, track real-time outputs, and monitor fleet efficiency.
                    </motion.p>
                </div>

                <motion.div variants={fadeInUp} className="flex bg-gray-100/50 p-1.5 rounded-xl backdrop-blur-sm relative z-10">
                    {['overview', 'orders', 'logs'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab
                                ? 'bg-white text-black shadow-md scale-105'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </motion.div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatCard title="Active Batches" value={activeOrders} icon={Loader2} color="bg-blue-500" />
                            <StatCard title="Total Orders" value={totalOrders} icon={Package} color="bg-indigo-500" />
                            <StatCard title="Today's Output" value={`${totalOutputToday.toLocaleString()} m`} icon={TrendingUp} color="bg-green-500" />
                            <StatCard title="Efficiency" value="94%" icon={Zap} color="bg-amber-500" />
                        </div>
                        {/* Add Chart or Visuals here later if needed */}
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg flex items-center justify-center min-h-[300px]">
                            <div className="text-center">
                                <Activity size={48} className="mx-auto text-gray-200 mb-4" />
                                <h3 className="text-gray-900 font-bold text-lg">Real-time Machine Telemetry</h3>
                                <p className="text-gray-500 text-sm mt-1">Select the 'Dashboard' page for live machine status.</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'orders' && (
                    <motion.div
                        key="orders"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/30">
                            <div className="relative flex-1 w-full md:max-w-md group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search order ID or product..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm font-medium"
                                />
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl w-full md:w-auto justify-center"
                            >
                                <Plus size={16} /> New Order
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50/50">
                                        <th className="p-5">Order ID</th>
                                        <th className="p-5">Product Details</th>
                                        <th className="p-5">Timeline</th>
                                        <th className="p-5">Progress</th>
                                        <th className="p-5">Status</th>
                                        <th className="p-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                                        const progress = Math.min((order.producedQuantity / order.targetQuantity) * 100, 100);
                                        return (
                                            <tr key={order._id} className="hover:bg-gray-50 group transition-colors">
                                                <td className="p-5 font-mono font-bold text-gray-900 text-sm">{order.orderNumber}</td>
                                                <td className="p-5">
                                                    <div className="font-bold text-gray-900 text-sm">{order.productName}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${order.priority === 'Urgent' ? 'bg-red-500' : order.priority === 'High' ? 'bg-orange-500' : 'bg-blue-400'}`}></span>
                                                        <span className="text-xs text-gray-500 font-medium">{order.priority} Priority</span>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-xs text-gray-500 font-medium space-y-1">
                                                    <div className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(order.startDate).toLocaleDateString()}</div>
                                                    <div className="flex items-center gap-1.5"><Clock size={12} /> {new Date(order.endDate).toLocaleDateString()}</div>
                                                </td>
                                                <td className="p-5 min-w-[200px]">
                                                    <div className="flex justify-between text-xs font-bold mb-1.5 text-gray-600">
                                                        <span>{order.producedQuantity} / {order.targetQuantity}</span>
                                                        <span>{Math.round(progress)}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${progress >= 100 ? 'bg-green-500' : 'bg-black'}`}
                                                            style={{ width: `${progress}%` }}
                                                        ></div>
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                            order.status === 'On Hold' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="p-5 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setSelectedOrder(order)}
                                                            className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-black transition-colors"
                                                            title="Edit Order"
                                                        >
                                                            <Settings size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteOrder(order._id)}
                                                            className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                                                            title="Delete Order"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    }) : (
                                        <tr>
                                            <td colSpan="6" className="p-12 text-center text-gray-400 italic text-sm">No production orders found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'logs' && (
                    <motion.div
                        key="logs"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden p-6"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Output Logs</h2>
                                <p className="text-sm text-gray-500">Daily production records from factory floor terminals.</p>
                            </div>
                            <button
                                onClick={() => setIsLogModalOpen(true)}
                                className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors flex items-center gap-2"
                            >
                                <Clipboard size={16} /> Log Output
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-xs text-gray-500 uppercase font-bold border-b border-gray-100">
                                    <tr>
                                        <th className="py-3">Time</th>
                                        <th className="py-3">Loom</th>
                                        <th className="py-3">Type</th>
                                        <th className="py-3 text-right">Output (m)</th>
                                        <th className="py-3 text-right">Defects</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {logs?.slice().reverse().slice(0, 20).map((log, i) => ( // Show last 20
                                        <tr key={i} className="text-sm font-medium text-gray-700">
                                            <td className="py-3">{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                            <td className="py-3 font-mono">Loom #{log.loomNumber}</td>
                                            <td className="py-3">{log.clothType}</td>
                                            <td className="py-3 text-right font-bold text-green-600">+{log.metersProduced}m</td>
                                            <td className={`py-3 text-right ${log.defects > 0 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>{log.defects}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals Logic (Keep existing simple structure but refined UI) */}
            <Modal isOpen={isCreateModalOpen} onClose={handleCloseModal} title={selectedOrder ? "Edit Order Information" : "New Production Batch"}>
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Order ID" value={formData.orderNumber} onChange={e => setFormData({ ...formData, orderNumber: e.target.value })} required disabled={!!selectedOrder} />
                        <Input label="Product Name" value={formData.productName} onChange={e => setFormData({ ...formData, productName: e.target.value })} required placeholder="e.g. Cotton Shirt Batch A" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input type="number" label="Target Quantity" value={formData.targetQuantity} onChange={e => setFormData({ ...formData, targetQuantity: e.target.value })} required />
                        <Select label="Priority" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} options={['Low', 'Medium', 'High', 'Urgent']} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input type="date" label="Start Date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} required />
                        <Input type="date" label="End Date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} required />
                    </div>

                    {selectedOrder && (
                        <Select label="Status" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} options={['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled']} />
                    )}

                    <button type="submit" disabled={isLoading} className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors">
                        {isLoading ? <Loader2 className="animate-spin mx-auto" /> : (selectedOrder ? 'Update Order' : 'Initialize Batch')}
                    </button>
                </form>
            </Modal>

            <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title="Log Floor Output">
                <form onSubmit={handleLogSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input type="number" label="Loom Number" value={logData.loomNumber} onChange={e => setLogData({ ...logData, loomNumber: e.target.value })} min={1} max={7} required />
                        <Input label="Cloth Type" value={logData.clothType} onChange={e => setLogData({ ...logData, clothType: e.target.value })} required placeholder="e.g. Cotton" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input type="number" label="Meters Produced" value={logData.metersProduced} onChange={e => setLogData({ ...logData, metersProduced: Number(e.target.value) })} required />
                        <Input type="number" label="Defects Found" value={logData.defects} onChange={e => setLogData({ ...logData, defects: Number(e.target.value) })} />
                    </div>
                    <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors">
                        Submit Log
                    </button>
                </form>
            </Modal>
        </motion.div>
    );
};

// --- Reused Components ---
const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div variants={scaleIn} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className={`p-4 rounded-xl ${color} bg-opacity-10 text-gray-900`}>
            <Icon size={24} />
        </div>
        <div>
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</h3>
            <p className="text-2xl font-display font-black text-gray-900">{value}</p>
        </div>
    </motion.div>
);

const Modal = ({ isOpen, onClose, title, children }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold font-display text-gray-900">{title}</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400 hover:text-black" /></button>
                    </div>
                    {children}
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

const Input = ({ label, ...props }) => (
    <div className="space-y-1.5 w-full">
        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">{label}</label>
        <input className="w-full p-2.5 bg-gray-50 border border-gray-200 text-gray-900 focus:border-black outline-none transition-all rounded-lg font-medium disabled:bg-gray-100 disabled:text-gray-400" {...props} />
    </div>
);

const Select = ({ label, options, ...props }) => (
    <div className="space-y-1.5 w-full">
        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">{label}</label>
        <div className="relative">
            <select className="w-full p-2.5 bg-gray-50 border border-gray-200 text-gray-900 focus:border-black outline-none transition-all rounded-lg font-medium appearance-none" {...props}>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
        </div>
    </div>
);

export default Production;
