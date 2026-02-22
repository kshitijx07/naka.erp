import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSalaries, generateSalary, updateSalary, deleteSalary, reset } from '../redux/slices/salarySlice';
import { getUsers } from '../redux/slices/authSlice';
import { BadgeDollarSign, Search, Calculator, X, Loader2, CheckCircle, ArrowRight, Edit, Trash2, FileText, Filter, Download, Briefcase, Calendar, DollarSign, Wallet, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '../utils/currency';
import { IMAGES, fadeInUp, staggerContainer, scaleIn } from '../utils/visuals';
import { PageSkeleton } from '../components/common/Skeleton';

const Salary = () => {
    const dispatch = useDispatch();
    const { salaries, isLoading, isSuccess } = useSelector((state) => state.salary);
    const { users } = useSelector((state) => state.auth);

    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMonth, setFilterMonth] = useState('All');
    const [filterRole, setFilterRole] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    // Forms
    const [formData, setFormData] = useState({
        workerId: '',
        month: new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
        workHours: '',
        overtime: '',
        bonus: '',
        deductions: '',
    });

    const [editFormData, setEditFormData] = useState({
        id: '',
        baseAmount: '',
        overtime: '',
        bonus: '',
        deductions: '',
        status: ''
    });

    useEffect(() => {
        dispatch(getSalaries());
        dispatch(getUsers());
        return () => { dispatch(reset()); };
    }, [dispatch]);

    useEffect(() => {
        if (isSuccess) {
            setIsGenerateModalOpen(false);
            setIsEditModalOpen(false);
            setFormData({
                workerId: '',
                month: new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
                workHours: '',
                overtime: '',
                bonus: '',
                deductions: ''
            });
            dispatch(reset());
        }
    }, [isSuccess, dispatch]);

    // --- Analytics & Filtering ---
    const allMonths = useMemo(() => [...new Set(salaries.map(s => s.month))], [salaries]);
    const allRoles = ['All', 'admin', 'manager', 'accountant', 'worker'];

    const filteredSalaries = useMemo(() => {
        return salaries.filter(salary => {
            const matchesSearch = (salary.workerId?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesMonth = filterMonth === 'All' || salary.month === filterMonth;
            const matchesRole = filterRole === 'All' || (salary.workerId?.role === filterRole);
            const matchesStatus = filterStatus === 'All' || (salary.status || 'Pending') === filterStatus;
            return matchesSearch && matchesMonth && matchesRole && matchesStatus;
        });
    }, [salaries, searchTerm, filterMonth, filterRole, filterStatus]);

    const stats = useMemo(() => {
        const totalExpense = filteredSalaries.reduce((acc, curr) => acc + curr.finalSalary, 0);
        const pendingCount = filteredSalaries.filter(s => (s.status || 'Pending') === 'Pending').length;
        const paidCount = filteredSalaries.filter(s => s.status === 'Paid').length;
        return { totalExpense, pendingCount, paidCount };
    }, [filteredSalaries]);

    // --- Handlers ---
    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const onEditChange = (e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

    const onSubmit = (e) => {
        e.preventDefault();
        dispatch(generateSalary(formData));
    };

    const onEditSubmit = (e) => {
        e.preventDefault();
        dispatch(updateSalary({ id: editFormData.id, data: editFormData }));
    };

    const onDelete = (id) => {
        if (window.confirm('Delete this salary record?')) dispatch(deleteSalary(id));
    };

    const toggleStatus = (salary) => {
        const newStatus = salary.status === 'Paid' ? 'Pending' : 'Paid';
        dispatch(updateSalary({ id: salary._id, data: { status: newStatus } }));
    };

    const openEditModal = (salary) => {
        setEditFormData({
            id: salary._id,
            baseAmount: salary.baseAmount,
            overtime: salary.overtime,
            bonus: salary.bonus,
            deductions: salary.deductions,
            status: salary.status || 'Pending'
        });
        setIsEditModalOpen(true);
    };

    const generateSlip = (salary) => {
        const doc = new jsPDF();
        doc.setFontSize(22); doc.text("NAKA ERP", 14, 22);
        doc.setFontSize(10); doc.text("Payslip Generator", 14, 28);
        doc.setFontSize(12); doc.text(`Status: ${salary.status || 'Pending'}`, 160, 22);

        doc.setFillColor(240, 240, 240); doc.rect(14, 35, 182, 30, 'F');
        doc.text(`Employee: ${salary.workerId?.name || "Unknown"}`, 20, 45);
        doc.text(`Role: ${salary.workerId?.role || "Worker"}`, 20, 55);
        doc.text(`Period: ${salary.month}`, 120, 45);

        autoTable(doc, {
            startY: 75,
            head: [['Description', 'Earnings', 'Deductions']],
            body: [
                ['Base Salary', `Rs. ${salary.baseAmount}`, '-'],
                ['Work Hours', `${salary.workHours || 0} hrs`, '-'],
                ['Overtime', `Rs. ${salary.overtime}`, '-'],
                ['Bonus', `Rs. ${salary.bonus}`, '-'],
                ['Deductions', '-', `Rs. ${salary.deductions}`],
                ['TOTAL', `Rs. ${salary.baseAmount + salary.overtime + salary.bonus}`, `Rs. ${salary.deductions}`],
            ],
            theme: 'striped',
        });

        doc.setFontSize(14);
        doc.text(`NET PAY: Rs. ${salary.finalSalary}`, 140, doc.lastAutoTable.finalY + 15);
        doc.save(`Payslip_${salary.workerId?.name}_${salary.month}.pdf`);
    };

    const exportPayroll = () => {
        const doc = new jsPDF();
        doc.text("Payroll Report", 14, 20);
        autoTable(doc, {
            startY: 30,
            head: [['Name', 'Role', 'Month', 'Status', 'Net Pay']],
            body: filteredSalaries.map(s => [
                s.workerId?.name,
                s.workerId?.role,
                s.month,
                s.status || 'Pending',
                `Rs. ${s.finalSalary}`
            ]),
        });
        doc.save('Payroll_Report.pdf');
    };

    const workers = users.filter(user => user.role === 'worker');

    if (isLoading && (!salaries || salaries.length === 0)) return <PageSkeleton />;

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-6 pb-10"
        >
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none"></div>

                <div className="relative z-10">
                    <motion.div variants={fadeInUp} className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-2 uppercase tracking-wide">
                        <Wallet size={12} /> Financial Operations
                    </motion.div>
                    <motion.h1 variants={fadeInUp} className="text-4xl font-display font-black text-gray-900 tracking-tight">
                        Payroll Command
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-gray-500 mt-2 max-w-lg font-medium">
                        Manage employee compensation, generate reliable payslips, and track expenditure.
                    </motion.p>
                </div>

                <motion.div variants={fadeInUp} className="flex gap-3 relative z-10">
                    <button onClick={exportPayroll} className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all">
                        <Download size={16} /> Export
                    </button>
                    <button onClick={() => setIsGenerateModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl">
                        <Calculator size={16} /> Run Payroll
                    </button>
                </motion.div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Expense" value={formatCurrency(stats.totalExpense)} icon={BadgeDollarSign} color="bg-emerald-500" />
                <StatCard title="Pending Payments" value={stats.pendingCount} icon={Loader2} color="bg-orange-500" />
                <StatCard title="Paid Workers" value={stats.paidCount} icon={CheckCircle} color="bg-blue-500" />
            </div>

            {/* Main Content Area */}
            <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                {/* Filters Bar */}
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center bg-gray-50/30">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search employee by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm font-medium"
                        />
                    </div>
                    <FilterSelect value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} options={['All', ...allMonths]} icon={Calendar} />
                    <FilterSelect value={filterRole} onChange={(e) => setFilterRole(e.target.value)} options={allRoles} icon={Briefcase} />
                    <FilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} options={['All', 'Paid', 'Pending']} icon={CheckCircle} />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50/50">
                                <th className="p-5">Employee</th>
                                <th className="p-5">Period</th>
                                <th className="p-5">Breakdown</th>
                                <th className="p-5 text-right">Net Pay</th>
                                <th className="p-5 text-center">Status</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredSalaries.length > 0 ? (
                                filteredSalaries.map((salary, i) => (
                                    <motion.tr
                                        key={salary._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="hover:bg-gray-50 group transition-colors"
                                    >
                                        <td className="p-5">
                                            <div className="font-bold text-gray-900 text-sm">{salary.workerId?.name || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500 font-medium capitalize flex items-center gap-1 mt-1">
                                                {salary.workerId?.role || 'Worker'}
                                            </div>
                                        </td>
                                        <td className="p-5 text-gray-600 text-sm font-medium">
                                            {salary.month}
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1 text-xs">
                                                <span className="text-gray-600">Base: <span className="font-bold">{formatCurrency(salary.baseAmount)}</span> ({salary.workHours}h)</span>
                                                {(salary.bonus > 0 || salary.overtime > 0) && (
                                                    <span className="text-green-600 font-bold">+{formatCurrency(salary.bonus + salary.overtime)} Extras</span>
                                                )}
                                                {salary.deductions > 0 && (
                                                    <span className="text-red-500 font-bold">-{formatCurrency(salary.deductions)} Deductions</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <span className="font-mono font-bold text-gray-900 text-lg">{formatCurrency(salary.finalSalary)}</span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <button
                                                onClick={() => toggleStatus(salary)}
                                                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border ${salary.status === 'Paid'
                                                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                    : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                                                    }`}
                                            >
                                                {salary.status || 'Pending'}
                                            </button>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ActionButton onClick={() => generateSlip(salary)} icon={FileText} label="Payslip" />
                                                <ActionButton onClick={() => openEditModal(salary)} icon={Edit} label="Edit" />
                                                <ActionButton onClick={() => onDelete(salary._id)} icon={Trash2} color="text-red-400 hover:bg-red-50 hover:text-red-600" label="Delete" />
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="p-12 text-center text-gray-400 italic text-sm">No payroll records matching your filters.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Generate Modal */}
            <Modal isOpen={isGenerateModalOpen} onClose={() => setIsGenerateModalOpen(false)} title="Run Payroll">
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">Select Employee</label>
                        <div className="relative">
                            <select
                                name="workerId"
                                value={formData.workerId}
                                onChange={onChange}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black transition-all appearance-none font-medium"
                                required
                            >
                                <option value="">Select an employee...</option>
                                {workers.map(u => <option key={u._id} value={u._id}>{u.name} — ₹{u.salaryRate}/hr</option>)}
                            </select>
                            <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    <Input label="Period (Month/Year)" name="month" value={formData.month} onChange={onChange} required />

                    <div className="grid grid-cols-2 gap-4">
                        <Input type="number" label="Work Hours" name="workHours" value={formData.workHours} onChange={onChange} placeholder="e.g. 160" required />
                        <Input type="number" label="Overtime (₹)" name="overtime" value={formData.overtime} onChange={onChange} placeholder="0.00" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input type="number" label="Bonus (₹)" name="bonus" value={formData.bonus} onChange={onChange} placeholder="0.00" />
                        <Input type="number" label="Deductions (₹)" name="deductions" value={formData.deductions} onChange={onChange} placeholder="0.00" />
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-lg mt-4">
                        {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Calculate & Save'}
                    </button>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Payroll Record">
                <form onSubmit={onEditSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input type="number" label="Base Salary (₹)" name="baseAmount" value={editFormData.baseAmount} onChange={onEditChange} required />
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">Payment Status</label>
                            <select
                                name="status"
                                value={editFormData.status}
                                onChange={onEditChange}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black transition-all font-medium"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input type="number" label="Overtime (₹)" name="overtime" value={editFormData.overtime} onChange={onEditChange} required />
                        <Input type="number" label="Bonus (₹)" name="bonus" value={editFormData.bonus} onChange={onEditChange} required />
                    </div>
                    <Input type="number" label="Deductions (₹)" name="deductions" value={editFormData.deductions} onChange={onEditChange} required />

                    <button type="submit" disabled={isLoading} className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-lg mt-4">
                        {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Update Record'}
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

// Helper for the user select
const UserIcon = ({ className, size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);

export default Salary;
