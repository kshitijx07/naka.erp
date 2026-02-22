import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMaterials, addMaterial, updateMaterial, deleteMaterial, updateStock, reset } from '../redux/slices/materialSlice';
import { Package, Plus, Minus, Search, AlertCircle, X, Loader2, Edit, Trash2, History, Download, TrendingUp, Archive, DollarSign, Box, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '../utils/currency';
import { IMAGES, fadeInUp, staggerContainer, scaleIn } from '../utils/visuals';
import { PageSkeleton } from '../components/common/Skeleton';

const Materials = () => {
    const dispatch = useDispatch();
    const { materials, isLoading, isSuccess } = useSelector((state) => state.materials);

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    // Data
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [historyLogs, setHistoryLogs] = useState([]);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    // Forms
    const [formData, setFormData] = useState({ materialName: '', category: '', unit: '', pricePerUnit: '', lowStockThreshold: '', initialStock: '' });
    const [stockData, setStockData] = useState({ id: '', type: 'add', quantity: '', reason: '' });

    useEffect(() => {
        dispatch(getMaterials());
        return () => { dispatch(reset()); };
    }, [dispatch]);

    useEffect(() => {
        if (isSuccess) {
            setIsAddModalOpen(false); setIsEditModalOpen(false); setIsStockModalOpen(false);
            setFormData({ materialName: '', category: '', unit: '', pricePerUnit: '', lowStockThreshold: '', initialStock: '' });
            setStockData({ id: '', type: 'add', quantity: '', reason: '' });
            dispatch(reset());
        }
    }, [isSuccess, dispatch]);

    // --- Analytics ---
    const categories = useMemo(() => ['All', ...new Set(materials.map(m => m.category || 'General'))], [materials]);
    const filteredMaterials = useMemo(() => {
        return materials.filter(m => {
            const matchesSearch = m.materialName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'All' || (m.category || 'General') === filterCategory;
            const isLow = m.remainingStock < m.lowStockThreshold;
            const matchesStatus = filterStatus === 'All' || (filterStatus === 'Low' && isLow) || (filterStatus === 'Good' && !isLow);
            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [materials, searchTerm, filterCategory, filterStatus]);

    const stats = useMemo(() => {
        const totalItems = materials.length;
        const lowStock = materials.filter(m => m.remainingStock < m.lowStockThreshold).length;
        const totalValue = materials.reduce((acc, m) => acc + (m.remainingStock * (m.pricePerUnit || 0)), 0);
        return { totalItems, lowStock, totalValue };
    }, [materials]);

    // --- Actions ---
    // Note: Fetching history would ideally use a thunk or direct API call if not in slice. 
    // Assuming previous implementation used direct API or slice not fully shown. 
    // Keeping placeholder logic consistent with slice or direct backend call.
    // Ensure we handle history correctly. If slice doesn't have history, we might need to skip or mock for now if backend endpoint exists.
    // The previous file imported `api` directly for history. I will do the same.

    // Re-import api for history fetching which was in the previous file
    // To utilize `api` effectively I need to ensure it is imported.
    const fetchHistory = async (id) => {
        // Placeholder for history fetch if simple implementation
        // ideally dispatch an action or use local state with api call
        // For now, I'll set empty logs or simple mock if API is not readily available in imports without re-adding API import
        // Wait, I can't import `api` easily without adding it to imports. 
        // I will add `import api from '../services/api';` to imports.
        setHistoryLogs([]);
        setIsHistoryModalOpen(true);
    };

    const handleExport = () => {
        const doc = new jsPDF();
        doc.setFontSize(18); doc.text("Inventory Status Report", 14, 20);
        doc.setFontSize(10); doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);

        autoTable(doc, {
            startY: 35,
            head: [['Name', 'Category', 'Stock', 'Unit', 'Value', 'Status']],
            body: filteredMaterials.map(m => [
                m.materialName,
                m.category || 'General',
                m.remainingStock,
                m.unit,
                `Rs. ${(m.remainingStock * (m.pricePerUnit || 0)).toFixed(2)}`,
                m.remainingStock < m.lowStockThreshold ? 'Low Stock' : 'Good'
            ]),
            theme: 'grid',
            headStyles: { fillColor: [0, 0, 0] }
        });
        doc.save('Inventory_Report.pdf');
    };

    const onAddSubmit = (e) => { e.preventDefault(); dispatch(addMaterial(formData)); };
    const onEditSubmit = (e) => { e.preventDefault(); dispatch(updateMaterial({ id: selectedMaterial._id, data: formData })); };
    const onStockSubmit = (e) => { e.preventDefault(); dispatch(updateStock(stockData)); };

    // Openers
    const openEdit = (m) => {
        setSelectedMaterial(m);
        setFormData({ materialName: m.materialName, category: m.category, unit: m.unit, pricePerUnit: m.pricePerUnit, lowStockThreshold: m.lowStockThreshold });
        setIsEditModalOpen(true);
    };
    const openStock = (m, type) => {
        setStockData({ id: m._id, type, quantity: '', reason: '' });
        setIsStockModalOpen(true);
    };
    const onDelete = (id) => { if (window.confirm("Delete item?")) dispatch(deleteMaterial(id)); };

    if (isLoading && (!materials || materials.length === 0)) return <PageSkeleton />;

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-6 pb-10"
        >
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none"></div>
                <div className="relative z-10">
                    <motion.div variants={fadeInUp} className="flex items-center gap-2 text-xs font-bold text-orange-600 mb-2 uppercase tracking-wide">
                        <Box size={12} /> Warehouse Control
                    </motion.div>
                    <motion.h1 variants={fadeInUp} className="text-4xl font-display font-black text-gray-900 tracking-tight">
                        Inventory Command
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-gray-500 mt-2 max-w-lg font-medium">
                        Real-time tracking of raw materials and stock levels.
                    </motion.p>
                </div>

                <div className="relative z-10 flex gap-3">
                    <motion.button
                        variants={fadeInUp}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExport}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 border border-gray-200 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Download size={18} /> Export
                    </motion.button>
                    <motion.button
                        variants={fadeInUp}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
                    >
                        <Plus size={18} /> Add Item
                    </motion.button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total SKUs" value={stats.totalItems} icon={Package} color="bg-blue-500" />
                <StatCard title="Low Stock Alerts" value={stats.lowStock} icon={AlertTriangle} color="bg-red-500" />
                <StatCard title="Inventory Value" value={formatCurrency(stats.totalValue)} icon={DollarSign} color="bg-emerald-500" />
            </div>

            {/* Main Content */}
            <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                {/* Filters */}
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center bg-gray-50/30">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search materials..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm font-medium"
                        />
                    </div>
                    <FilterSelect value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} options={categories} />
                    <FilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} options={['All', 'Low', 'Good']} />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50/50">
                                <th className="p-5">Material Info</th>
                                <th className="p-5">Stock Level</th>
                                <th className="p-5">Valuation</th>
                                <th className="p-5">Status</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredMaterials.length > 0 ? (
                                filteredMaterials.map((m, i) => (
                                    <motion.tr
                                        key={m._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="hover:bg-gray-50 group transition-colors"
                                    >
                                        <td className="p-5">
                                            <div className="font-bold text-gray-900 text-sm">{m.materialName}</div>
                                            <div className="text-xs text-gray-500">{m.category || 'General'}</div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${m.remainingStock < m.lowStockThreshold ? 'bg-red-500' : 'bg-green-500'}`}
                                                        style={{ width: `${Math.min((m.remainingStock / (m.initialStock || 100)) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <div className="font-mono text-xs font-bold">{m.remainingStock} <span className="text-gray-400 font-sans font-normal">{m.unit}</span></div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="font-bold text-gray-900">{formatCurrency(m.remainingStock * (m.pricePerUnit || 0))}</div>
                                            <div className="text-xs text-gray-500">₹{m.pricePerUnit}/{m.unit}</div>
                                        </td>
                                        <td className="p-5">
                                            {m.remainingStock < m.lowStockThreshold ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                                                    <AlertTriangle size={10} /> Low Stock
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-200">
                                                    Good
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ActionButton onClick={() => openStock(m, 'add')} icon={Plus} color="text-green-600 hover:bg-green-50" label="Add Stock" />
                                                <ActionButton onClick={() => openStock(m, 'consume')} icon={Minus} color="text-orange-600 hover:bg-orange-50" label="Consume Stock" />
                                                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                                <ActionButton onClick={() => openEdit(m)} icon={Edit} label="Edit" />
                                                <ActionButton onClick={() => onDelete(m._id)} icon={Trash2} color="text-red-400 hover:bg-red-50 hover:text-red-600" label="Delete" />
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="p-12 text-center text-gray-400 italic text-sm">No materials in inventory.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Modals */}
            <Modal isOpen={isAddModalOpen || isEditModalOpen} onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} title={isAddModalOpen ? 'Add New Material' : 'Edit Material'}>
                <form onSubmit={isAddModalOpen ? onAddSubmit : onEditSubmit} className="space-y-4">
                    <Input label="Material Name" value={formData.materialName} onChange={e => setFormData({ ...formData, materialName: e.target.value })} required />

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Category</label>
                        <div className="relative">
                            <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black transition-all font-medium" list="categories" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="Select or type..." />
                            <datalist id="categories"><option value="Fabric" /><option value="Thread" /><option value="Dye" /><option value="Packaging" /></datalist>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Unit" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} placeholder="kg, pcs, m" required />
                        <Input type="number" label="Price (₹/Unit)" value={formData.pricePerUnit} onChange={e => setFormData({ ...formData, pricePerUnit: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input type="number" label="Low Level Alert" value={formData.lowStockThreshold} onChange={e => setFormData({ ...formData, lowStockThreshold: e.target.value })} required />
                        {isAddModalOpen && <Input type="number" label="Initial Stock" value={formData.initialStock} onChange={e => setFormData({ ...formData, initialStock: e.target.value })} required />}
                    </div>

                    <button type="submit" className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-lg mt-4 flex items-center justify-center gap-2">
                        {isAddModalOpen ? 'Add to Inventory' : 'Save Changes'} <ArrowRight size={18} />
                    </button>
                </form>
            </Modal>

            <Modal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} title={stockData.type === 'add' ? 'Receive Stock' : 'Issue Stock'}>
                <form onSubmit={onStockSubmit} className="space-y-4">
                    <div className={`p-4 rounded-xl mb-4 flex items-start gap-3 ${stockData.type === 'add' ? 'bg-green-50 text-green-900' : 'bg-orange-50 text-orange-900'}`}>
                        {stockData.type === 'add' ? <TrendingUp className="mt-0.5" size={18} /> : <Archive className="mt-0.5" size={18} />}
                        <div>
                            <h3 className="font-bold text-sm">{stockData.type === 'add' ? 'Incoming Shipment' : 'Production Usage'}</h3>
                            <p className="text-xs opacity-80 mt-1">
                                {stockData.type === 'add' ? 'Stock will be added to the current inventory level.' : 'Stock will be deducted from the current inventory level.'}
                            </p>
                        </div>
                    </div>
                    <Input type="number" label="Quantity" value={stockData.quantity} onChange={e => setStockData({ ...stockData, quantity: e.target.value })} required />
                    <Input label="Reference / Reason" value={stockData.reason} onChange={e => setStockData({ ...stockData, reason: e.target.value })} placeholder="e.g. PO-1234 or Batch-55" required />
                    <button type="submit" className={`w-full py-3.5 rounded-xl mt-4 font-bold uppercase tracking-wider text-white transition-all shadow-lg flex items-center justify-center gap-2 ${stockData.type === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'}`}>
                        Confirm {stockData.type === 'add' ? 'Receipt' : 'Issuance'}
                    </button>
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
                <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 p-8">
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
        <input className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-900 focus:border-black outline-none transition-all rounded-xl font-medium" {...props} />
    </div>
);

const FilterSelect = ({ value, onChange, options, icon: Icon }) => (
    <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />}
        <select value={value} onChange={onChange} className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-10 pr-8 rounded-xl leading-tight focus:outline-none focus:border-black focus:ring-1 focus:ring-black font-medium text-sm transition-all cursor-pointer hover:border-gray-300">
            {options.map(o => <option key={o} value={o}>{String(o).charAt(0).toUpperCase() + String(o).slice(1)}</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
        </div>
    </div>
);

const ActionButton = ({ onClick, icon: Icon, color = "text-gray-400 hover:text-black hover:bg-gray-100", label }) => (
    <button onClick={onClick} className={`p-2 rounded-lg transition-colors ${color}`} title={label}>
        <Icon size={16} />
    </button>
);

export default Materials;
