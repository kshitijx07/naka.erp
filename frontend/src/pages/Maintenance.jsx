import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMachines, addMachine, getWorkOrders, createWorkOrder, updateWorkOrder, deleteMachine, reset } from '../redux/slices/maintenanceSlice';
import { getUsers } from '../redux/slices/authSlice';
import { Wrench, Plus, Activity, User, AlertOctagon, X, Settings, CheckCircle, Clock, AlertTriangle, Monitor, Filter, Search, MoreVertical, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IMAGES, fadeInUp, staggerContainer, scaleIn } from '../utils/visuals';
import { MaintenanceSkeleton } from '../components/common/Skeleton';

const Maintenance = () => {
    const dispatch = useDispatch();
    const { machines = [], workOrders = [], isLoading, isSuccess } = useSelector((state) => state.maintenance);
    const { users } = useSelector((state) => state.auth);

    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    // Filters
    const [filterPriority, setFilterPriority] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    const [machineForm, setMachineForm] = useState({ name: '', type: '', location: '', status: 'Operational', modelNumber: '' });
    const [orderForm, setOrderForm] = useState({ machineId: '', type: 'Breakdown', priority: 'Medium', description: '', technician: '' });

    useEffect(() => {
        dispatch(getMachines());
        dispatch(getWorkOrders());
        dispatch(getUsers());
        return () => { dispatch(reset()); };
    }, [dispatch]);

    useEffect(() => {
        if (isSuccess) {
            setIsMachineModalOpen(false);
            setIsOrderModalOpen(false);
            setMachineForm({ name: '', type: '', location: '', status: 'Operational', modelNumber: '' });
            setOrderForm({ machineId: '', type: 'Breakdown', priority: 'Medium', description: '', technician: '' });
            dispatch(reset());
        }
    }, [isSuccess, dispatch]);

    const stats = useMemo(() => {
        const totalMachines = machines.length;
        const downMachines = machines.filter(m => m.status === 'Breakdown' || m.status === 'Under Maintenance').length;
        const activeOrders = workOrders.filter(o => o.status !== 'Completed').length;
        const criticalOrders = workOrders.filter(o => o.priority === 'Critical' && o.status !== 'Completed').length;
        return { totalMachines, downMachines, activeOrders, criticalOrders };
    }, [machines, workOrders]);

    const filteredOrders = useMemo(() => {
        return workOrders.filter(o => {
            const matchPriority = filterPriority === 'All' || o.priority === filterPriority;
            const matchStatus = filterStatus === 'All' || o.status === filterStatus;
            return matchPriority && matchStatus;
        });
    }, [workOrders, filterPriority, filterStatus]);

    const handleMachineSubmit = (e) => { e.preventDefault(); dispatch(addMachine(machineForm)); };
    const handleOrderSubmit = (e) => { e.preventDefault(); dispatch(createWorkOrder(orderForm)); };
    const handleStatusUpdate = (id, status) => { dispatch(updateWorkOrder({ id, data: { status } })); };
    const handleDeleteMachine = (id) => { if (window.confirm("Remove machine?")) dispatch(deleteMachine(id)); };

    const technicians = users.filter(u => u.role === 'worker' || u.role === 'technician');

    if (isLoading && machines.length === 0) return <MaintenanceSkeleton />;

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8 pb-10"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none"></div>

                <div className="relative z-10">
                    <motion.div variants={fadeInUp} className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                        <Settings size={12} /> System Health
                    </motion.div>
                    <motion.h1 variants={fadeInUp} className="text-4xl font-display font-black text-gray-900 tracking-tight">
                        Maintenance Hub
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-gray-500 mt-2 max-w-lg font-medium">
                        Monitor asset health, schedule repairs, and manage work orders.
                    </motion.p>
                </div>

                <div className="relative z-10 flex gap-2 bg-slate-100 p-1.5 rounded-xl">
                    {['dashboard', 'work orders', 'machines'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab === 'work orders' ? 'orders' : tab)}
                            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === (tab === 'work orders' ? 'orders' : tab) ? 'bg-white text-black shadow-md' : 'text-gray-500 hover:text-black hover:bg-white/50'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode='wait'>
                {activeTab === 'dashboard' && (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatCard title="Total Assets" value={stats.totalMachines} icon={Monitor} color="bg-slate-500" />
                            <StatCard title="Machines Down" value={stats.downMachines} icon={AlertOctagon} color="bg-red-500" />
                            <StatCard title="Active Jobs" value={stats.activeOrders} icon={Activity} color="bg-blue-500" />
                            <StatCard title="Critical Issues" value={stats.criticalOrders} icon={AlertTriangle} color="bg-orange-500" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-md">
                                <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Clock size={20} className="text-gray-400" /> Recent Activity</h3>
                                <div className="space-y-4">
                                    {workOrders.slice(0, 5).map(order => (
                                        <div key={order._id} className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${order.status === 'Completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{order.machineId?.name || 'Unknown Machine'}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{order.description}</p>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${order.status === 'Completed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-md">
                                <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><User size={20} className="text-gray-400" /> Team Availability</h3>
                                <div className="space-y-4">
                                    {technicians.map(tech => (
                                        <div key={tech._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-xs text-gray-500 border border-gray-200 shadow-sm">
                                                    {tech.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <p className="text-sm font-bold text-gray-700">{tech.name}</p>
                                            </div>
                                            <div className="text-[10px] text-green-600 font-bold bg-green-100/50 px-2 py-1 rounded-md uppercase tracking-wide">On Duty</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'machines' && (
                    <motion.div key="machines" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Asset Fleet</h2>
                            <button onClick={() => setIsMachineModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Machine</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {machines.map((m, i) => (
                                <motion.div
                                    key={m._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                                >
                                    <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 ${m.status === 'Operational' ? 'bg-green-500' : 'bg-red-500'} blur-2xl group-hover:opacity-20 transition-opacity`}></div>

                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${m.status === 'Operational' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'Operational' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            {m.status}
                                        </div>
                                        <button onClick={() => handleDeleteMachine(m._id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                    </div>

                                    <div className="relative z-10">
                                        <h3 className="text-lg font-bold font-display text-gray-900">{m.name}</h3>
                                        <p className="text-xs text-gray-500 font-medium mb-4">{m.type} • {m.location}</p>

                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex-1 bg-gray-50 rounded-lg p-2 border border-gray-100">
                                                <div className="text-[10px] text-gray-400 uppercase font-bold">Model</div>
                                                <div className="text-xs font-mono font-bold text-gray-700">{m.modelNumber || 'N/A'}</div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => { setOrderForm({ ...orderForm, machineId: m._id }); setIsOrderModalOpen(true); }}
                                            className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-lg"
                                        >
                                            Report Issue
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'orders' && (
                    <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div className="flex gap-4">
                                    <FilterSelect value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} options={['All', 'Critical', 'High', 'Medium', 'Low']} />
                                    <FilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} options={['All', 'Pending', 'In Progress', 'Completed', 'Cancelled']} />
                                </div>
                                <button onClick={() => setIsOrderModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> New Order</button>
                            </div>

                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50">
                                        <th className="p-5">Machine / Issue</th>
                                        <th className="p-5">Priority</th>
                                        <th className="p-5">Technician</th>
                                        <th className="p-5">Status</th>
                                        <th className="p-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredOrders.length > 0 ? filteredOrders.map((order, i) => (
                                        <motion.tr
                                            key={order._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="hover:bg-blue-50/30 transition-colors group"
                                        >
                                            <td className="p-5">
                                                <div className="font-bold text-gray-900">{order.machineId?.name || 'Unknown Device'}</div>
                                                <div className="text-xs text-gray-500 max-w-xs truncate">{order.description}</div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${order.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    order.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                        'bg-blue-50 text-blue-700 border-blue-200'
                                                    }`}>
                                                    {order.priority}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                        {order.technician?.name ? order.technician.name.substring(0, 2).toUpperCase() : '?'}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{order.technician?.name || 'Unassigned'}</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border rounded-lg cursor-pointer outline-none transition-colors ${order.status === 'Completed' ? 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100' :
                                                        order.status === 'In Progress' ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100' :
                                                            'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100'
                                                        }`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td className="p-5 text-right text-gray-400">
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 hover:bg-gray-100 rounded-lg"><Settings size={18} /></button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    )) : (
                                        <tr><td colSpan="5" className="p-12 text-center text-gray-400 italic">No work orders found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <Modal isOpen={isMachineModalOpen} onClose={() => setIsMachineModalOpen(false)} title="Add New Asset">
                <form onSubmit={handleMachineSubmit} className="space-y-4">
                    <Input label="Machine Name" value={machineForm.name} onChange={e => setMachineForm({ ...machineForm, name: e.target.value })} required />
                    <Input label="Type / Category" value={machineForm.type} onChange={e => setMachineForm({ ...machineForm, type: e.target.value })} required />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Location" value={machineForm.location} onChange={e => setMachineForm({ ...machineForm, location: e.target.value })} />
                        <Input label="Model Number" value={machineForm.modelNumber} onChange={e => setMachineForm({ ...machineForm, modelNumber: e.target.value })} />
                    </div>
                    <button type="submit" className="w-full btn-primary py-3.5 rounded-xl mt-4">Add Machine to Fleet</button>
                </form>
            </Modal>

            <Modal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} title="New Work Order">
                <form onSubmit={handleOrderSubmit} className="space-y-4">
                    <Select label="Affected Machine" value={orderForm.machineId} onChange={e => setOrderForm({ ...orderForm, machineId: e.target.value })} options={[{ value: '', label: 'Select Machine' }, ...machines.map(m => ({ value: m._id, label: m.name }))]} required />
                    <div className="grid grid-cols-2 gap-4">
                        <Select label="Order Type" value={orderForm.type} onChange={e => setOrderForm({ ...orderForm, type: e.target.value })} options={[{ value: 'Breakdown', label: 'Breakdown' }, { value: 'Routine', label: 'Routine' }, { value: 'Repair', label: 'Repair' }]} />
                        <Select label="Priority Level" value={orderForm.priority} onChange={e => setOrderForm({ ...orderForm, priority: e.target.value })} options={[{ value: 'Medium', label: 'Medium' }, { value: 'High', label: 'High' }, { value: 'Critical', label: 'Critical' }]} />
                    </div>
                    <Select label="Assign Technician" value={orderForm.technician} onChange={e => setOrderForm({ ...orderForm, technician: e.target.value })} options={[{ value: '', label: 'Unassigned' }, ...technicians.map(t => ({ value: t._id, label: t.name }))]} />
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Issue Description</label>
                        <textarea className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none min-h-[100px] text-sm font-medium" value={orderForm.description} onChange={e => setOrderForm({ ...orderForm, description: e.target.value })} required></textarea>
                    </div>
                    <button type="submit" className="w-full btn-primary py-3.5 rounded-xl mt-2">Generate Work Order</button>
                </form>
            </Modal>
        </motion.div>
    );
};

// --- Sub-components ---
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
                <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-2xl w-full max-w-md relative z-10 p-8 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold font-display">{title}</h2>
                        <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-black" /></button>
                    </div>
                    {children}
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

const Input = ({ label, ...props }) => (
    <div className="space-y-1.5 w-full">
        {label && <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">{label}</label>}
        <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none transition-all font-medium text-sm" {...props} />
    </div>
);

const Select = ({ label, options, ...props }) => (
    <div className="space-y-1.5 w-full">
        {label && <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">{label}</label>}
        <div className="relative">
            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none transition-all font-medium text-sm appearance-none" {...props}>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
        </div>
    </div>
);

const FilterSelect = ({ value, onChange, options }) => (
    <div className="relative">
        <select value={value} onChange={onChange} className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-8 rounded-lg leading-tight focus:outline-none focus:border-black font-bold text-xs h-full uppercase tracking-wide cursor-pointer hover:bg-gray-50">
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
        </div>
    </div>
);

export default Maintenance;
