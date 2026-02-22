import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSales, createSale, updateSale, deleteSale, reset } from '../redux/slices/salesSlice';
import { Plus, Search, FileText, X, Loader2, ArrowRight, Pencil, Trash2, TrendingUp, DollarSign, ShoppingBag, CreditCard, Calendar, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '../utils/currency';
import { IMAGES, fadeInUp, staggerContainer, scaleIn } from '../utils/visuals';
import { PageSkeleton } from '../components/common/Skeleton';

const Sales = () => {
    const dispatch = useDispatch();
    const { sales, isLoading, isSuccess } = useSelector((state) => state.sales);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [currentSale, setCurrentSale] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const [formData, setFormData] = useState({
        customerName: '',
        clothType: '',
        metersSold: '',
        ratePerMeter: '',
        paymentStatus: 'Pending'
    });

    useEffect(() => {
        dispatch(getSales());
        return () => { dispatch(reset()); };
    }, [dispatch]);

    useEffect(() => {
        if (isSuccess) {
            setIsModalOpen(false);
            setIsEditModalOpen(false);
            setFormData({ customerName: '', clothType: '', metersSold: '', ratePerMeter: '', paymentStatus: 'Pending' });
            setCurrentSale(null);
            dispatch(reset());
        }
    }, [isSuccess, dispatch]);

    // Analytics & Filtering
    const filteredSales = useMemo(() => {
        return sales.filter(sale => {
            const matchesSearch = (sale.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (sale.clothType || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'All' || (sale.paymentStatus || 'Pending') === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [sales, searchTerm, filterStatus]);

    const stats = useMemo(() => {
        const totalRevenue = sales.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
        const totalOrders = sales.length;
        const pendingPaymentCount = sales.filter(s => s.paymentStatus === 'Pending').length;
        return { totalRevenue, totalOrders, pendingPaymentCount };
    }, [sales]);

    // Handlers
    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = (e) => {
        e.preventDefault();
        dispatch(createSale(formData));
    };

    const onEditSubmit = (e) => {
        e.preventDefault();
        dispatch(updateSale({ id: currentSale._id, data: formData }));
    };

    const onDelete = (id) => {
        if (window.confirm('Irreversibly delete this sales record?')) {
            dispatch(deleteSale(id));
        }
    };

    const openEditModal = (sale) => {
        setCurrentSale(sale);
        setFormData({
            customerName: sale.customerName,
            clothType: sale.clothType,
            metersSold: sale.metersSold,
            ratePerMeter: sale.ratePerMeter,
            paymentStatus: sale.paymentStatus || 'Pending'
        });
        setIsEditModalOpen(true);
    };

    const generateInvoice = (sale) => {
        const doc = new jsPDF();
        doc.setFontSize(22); doc.text("NAKA ERP", 14, 22);
        doc.setFontSize(10); doc.text("Sales & Distribution", 14, 28);

        doc.setFontSize(16); doc.text("INVOICE", 140, 22);
        doc.setFontSize(10); doc.text(`Invoice #${sale.invoiceNumber || sale._id.slice(-6).toUpperCase()}`, 140, 28);
        doc.text(`Date: ${new Date(sale.date).toLocaleDateString('en-IN')}`, 140, 34);
        doc.text(`Status: ${sale.paymentStatus || 'Pending'}`, 140, 40);

        doc.setFillColor(245, 245, 245); doc.rect(14, 45, 182, 25, 'F');
        doc.setFontSize(11); doc.text("Bill To:", 20, 55);
        doc.setFontSize(14); doc.text(sale.customerName, 20, 62);

        autoTable(doc, {
            startY: 80,
            head: [['Description', 'Quantity', 'Unit Price', 'Total']],
            body: [[`${sale.clothType} Fabric`, `${sale.metersSold} m`, `Rs. ${sale.ratePerMeter}`, `Rs. ${sale.totalAmount}`]],
            theme: 'striped',
            headStyles: { fillColor: [0, 0, 0], textColor: 255 },
        });

        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(12); doc.text(`Grand Total:`, 140, finalY);
        doc.setFontSize(16); doc.text(`Rs. ${sale.totalAmount.toLocaleString('en-IN')}`, 180, finalY, { align: 'right' });

        doc.save(`Invoice_${sale.customerName}.pdf`);
    };

    if (isLoading && (!sales || sales.length === 0)) return <PageSkeleton />;

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-6 pb-10"
        >
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none"></div>

                <div className="relative z-10">
                    <motion.div variants={fadeInUp} className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">
                        <ShoppingBag size={12} /> Sales Operations
                    </motion.div>
                    <motion.h1 variants={fadeInUp} className="text-4xl font-display font-black text-gray-900 tracking-tight">
                        Sales Command
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-gray-500 mt-2 max-w-lg font-medium">
                        Track revenue, manage client orders, and generate real-time invoices.
                    </motion.p>
                </div>

                <motion.button
                    variants={fadeInUp}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setFormData({ customerName: '', clothType: '', metersSold: '', ratePerMeter: '', paymentStatus: 'Pending' }); setIsModalOpen(true); }}
                    className="relative z-10 flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
                >
                    <Plus size={18} /> New Order
                </motion.button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} color="bg-green-500" />
                <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="bg-indigo-500" />
                <StatCard title="Pending Payments" value={stats.pendingPaymentCount} icon={Clock} color="bg-amber-500" />
            </div>

            {/* Main Content */}
            <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                {/* Filters */}
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center bg-gray-50/30">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search customer or fabric..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm font-medium"
                        />
                    </div>
                    <FilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} options={['All', 'Paid', 'Pending']} icon={CheckCircle} />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50/50">
                                <th className="p-5">Customer</th>
                                <th className="p-5">Order Details</th>
                                <th className="p-5">Financials</th>
                                <th className="p-5">Status</th>
                                <th className="p-5">Date</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredSales.length > 0 ? (
                                filteredSales.map((sale, i) => (
                                    <motion.tr
                                        key={sale._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="hover:bg-gray-50 group transition-colors"
                                    >
                                        <td className="p-5 font-bold text-gray-900 text-sm">{sale.customerName}</td>
                                        <td className="p-5">
                                            <div className="font-medium text-gray-900">{sale.clothType}</div>
                                            <div className="text-xs text-gray-500">{sale.metersSold} meters</div>
                                        </td>
                                        <td className="p-5">
                                            <div className="font-bold text-gray-900">{formatCurrency(sale.totalAmount)}</div>
                                            <div className="text-xs text-gray-500">{formatCurrency(sale.ratePerMeter)}/m</div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${sale.paymentStatus === 'Paid'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>
                                                {sale.paymentStatus || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-sm text-gray-500">
                                            <div className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(sale.date).toLocaleDateString('en-IN')}</div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ActionButton onClick={() => generateInvoice(sale)} icon={FileText} label="Invoice" />
                                                <ActionButton onClick={() => openEditModal(sale)} icon={Pencil} label="Edit" />
                                                <ActionButton onClick={() => onDelete(sale._id)} icon={Trash2} color="text-red-400 hover:bg-red-50 hover:text-red-600" label="Delete" />
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="p-12 text-center text-gray-400 italic text-sm">No orders found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Modals */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Sales Order">
                <SaleForm formData={formData} onChange={onChange} onSubmit={onSubmit} isLoading={isLoading} submitLabel="Create Order" />
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Order">
                <SaleForm formData={formData} onChange={onChange} onSubmit={onEditSubmit} isLoading={isLoading} submitLabel="Update Order" />
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

const SaleForm = ({ formData, onChange, onSubmit, isLoading, submitLabel }) => (
    <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Customer Name" name="customerName" value={formData.customerName} onChange={onChange} placeholder="Enter client name" required />

        <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Cloth Type</label>
            <div className="relative">
                <select name="clothType" value={formData.clothType} onChange={onChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black transition-all appearance-none font-medium" required>
                    <option value="">Select Fabric...</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Polyester">Polyester</option>
                    <option value="Silk">Silk</option>
                    <option value="Linen">Linen</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">▼</div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <Input type="number" label="Quantity (m)" name="metersSold" value={formData.metersSold} onChange={onChange} placeholder="0" required />
            <Input type="number" label="Rate (₹/m)" name="ratePerMeter" value={formData.ratePerMeter} onChange={onChange} placeholder="0.00" required />
        </div>

        <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Payment Status</label>
            <div className="relative">
                <select name="paymentStatus" value={formData.paymentStatus || 'Pending'} onChange={onChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black transition-all appearance-none font-medium">
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">▼</div>
            </div>
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-lg mt-4 flex items-center justify-center gap-2">
            {isLoading ? <Loader2 className="animate-spin" /> : <>{submitLabel} <ArrowRight size={18} /></>}
        </button>
    </form>
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

export default Sales;
