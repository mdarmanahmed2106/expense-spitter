import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Calendar, Tag, Users, Check, X, User, Camera, Upload, Loader2, RefreshCw } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import { expenseAPI, groupAPI, friendSplitAPI, friendshipAPI } from '../services/api';
import Tesseract from 'tesseract.js';

const AddExpense = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanStatus, setScanStatus] = useState('');
    const fileInputRef = useRef(null);

    const [groups, setGroups] = useState([]);
    const [friends, setFriends] = useState([]);
    const [useCustomFriend, setUseCustomFriend] = useState(false);
    const [splitType, setSplitType] = useState('equal'); // 'equal' or 'full'
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Food',
        type: 'personal',
        date: new Date().toISOString().split('T')[0],
        groupId: '',
        friendId: '',
        friendName: '',
        friendEmail: '',
        paidBy: 'user'
    });
    const [success, setSuccess] = useState(false);

    const categories = ['Food', 'Travel', 'Fun', 'Misc'];
    const categoryColors = {
        Food: 'neon-lime',
        Travel: 'neon-orange',
        Fun: 'neon-pink',
        Misc: 'neon-blue'
    };

    useEffect(() => {
        fetchGroups();
        fetchFriends();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await groupAPI.getAll();
            setGroups(res.data.groups || []);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const fetchFriends = async () => {
        try {
            const res = await friendshipAPI.getFriends();
            setFriends(res.data.friends || []);
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    // OCR Logic
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image (JPG/PNG). PDFs are not supported yet.');
            return;
        }

        setScanning(true);
        setScanStatus('Initializing OCR...');
        setScanProgress(0);

        // Timeout race to prevent eternal hang
        let worker = null;
        let isCancelled = false;

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('OCR Initialization Timeout')), 60000)
        );

        try {
            const processOCR = async () => {
                // Match the installed version (v7) with the worker
                worker = await Tesseract.createWorker('eng', 1, {
                    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js', // v5 worker is often most stable for now, v7 might break api
                    // Actually, let's try NOT specifying paths first if possible, but if we must:
                    // Use a known compatible combo. 
                    // Tesseract.js v5+ manages its own worker version usually. 
                    // If the user is blocked, we need an alternative source.
                    // Let's rely on the package's default behavior first but with a backup strategy?
                    // No, the previous error was "Timeout", effectively "Blocked". 
                    // Let's try the unpkg mirror instead of jsdelivr?
                    workerPath: 'https://unpkg.com/tesseract.js@v5.1.0/dist/worker.min.js',
                    corePath: 'https://unpkg.com/tesseract.js-core@v5.1.0/tesseract-core.wasm.js',
                    logger: m => {
                        if (isCancelled) return;
                        if (m.status === 'recognizing text') {
                            setScanProgress(Math.round(m.progress * 100));
                            setScanStatus(`Scanning... ${Math.round(m.progress * 100)}%`);
                        } else {
                            setScanStatus(m.status);
                        }
                    }
                });

                if (isCancelled) { await worker.terminate(); return; }

                // v5: createWorker('eng') already loads language.
                // await worker.loadLanguage('eng'); // Not needed if passed to createWorker
                // await worker.initialize('eng');   // Not needed if passed to createWorker

                if (isCancelled) { await worker.terminate(); return; }

                const { data: { text } } = await worker.recognize(file);
                await worker.terminate();
                return text;
            };

            // Race between OCR and Timeout
            const text = await Promise.race([processOCR(), timeoutPromise]);

            if (text && !isCancelled) {
                parseReceiptText(text);
            }
        } catch (error) {
            console.error('OCR Error:', error);
            if (!isCancelled) {
                alert(`Scanner Error: ${error.message || 'Unknown error'}. \nPossible causes:\n1. Internet Blocked (CDN)\n2. Unstable Connection`);
            }
        } finally {
            if (!isCancelled) {
                setScanning(false);
            }
        }
    };

    const cancelScan = () => {
        setScanning(false);
        // We can't easily kill the promise but we can hide the UI and ignore result
        // In a real app we would use an AbortController or check a ref
        window.location.reload(); // Simplest way to kill the worker and reset state completely
    };

    const parseReceiptText = (text) => {
        console.log('Raw OCR Text:', text); // Debugging
        const lines = text.split('\n');
        let maxAmount = 0;
        let foundDate = null;
        let merchant = '';

        // Improved Heuristics
        // Match: 1,234.56 | 1234.56 | 1234 | 1234.00 (relaxed)
        const amountRegex = /[\₹$]?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\b/g;
        // Match: DD-MM-YYYY | DD/MM/YYYY | YYYY-MM-DD
        const dateRegex = /\b(\d{1,2}[-./]\d{1,2}[-./]\d{2,4})\b|\b(\d{4}[-./]\d{1,2}[-./]\d{1,2})\b/;

        // 1. Find Amount (Largest number usually)
        const matches = text.match(amountRegex);
        if (matches) {
            matches.forEach(match => {
                // Remove currency symbols and commas
                const cleanMatch = match.replace(/[$,\₹\s]/g, '');
                const val = parseFloat(cleanMatch);
                if (!isNaN(val) && val > maxAmount && val < 1000000) {
                    maxAmount = val;
                }
            });
        }

        // 2. Find Date
        const dateMatch = text.match(dateRegex);
        if (dateMatch) {
            try {
                let dateStr = dateMatch[0].replace(/\./g, '/').replace(/-/g, '/');
                const parts = dateStr.split('/');
                let d = new Date();

                // Heuristic: If 4 digits first -> YYYY/MM/DD
                if (parts[0].length === 4) {
                    d = new Date(dateStr);
                }
                // Heuristic: If 4 digits last -> DD/MM/YYYY (India/UK) meaning parts[2] is year
                else if (parts[2].length === 4) {
                    d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                }

                if (!isNaN(d.getTime())) {
                    foundDate = d.toISOString().split('T')[0];
                }
            } catch (e) { console.log('Date parse error', e); }
        }

        // 3. Find Merchant (First line that looks like text)
        for (let line of lines) {
            const trimmed = line.trim();
            // Ignore empty, short, or purely numeric lines
            if (trimmed.length > 3 && !/^\d+$/.test(trimmed) && !trimmed.toLowerCase().includes('receipt')) {
                merchant = trimmed.substring(0, 30);
                break;
            }
        }

        setFormData(prev => ({
            ...prev,
            amount: maxAmount > 0 ? maxAmount.toString() : prev.amount,
            date: foundDate || prev.date,
            title: merchant || prev.title || 'Scanned Receipt'
        }));

        if (maxAmount === 0 && !foundDate) {
            alert(`OCR finished but couldn't find data.\nRaw Text Start: ${text.substring(0, 50)}...`);
        } else {
            // alert(`Scanned! Found Amount: ${maxAmount}, Date: ${foundDate || 'Not found'}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (formData.type === 'group' && formData.groupId) {
                await groupAPI.addExpense(formData.groupId, {
                    title: formData.title,
                    amount: parseFloat(formData.amount),
                    category: formData.category,
                    date: formData.date
                });
            } else if (formData.type === 'friend') {
                const totalAmount = parseFloat(formData.amount);
                const friendShare = splitType === 'equal' ? totalAmount / 2 : totalAmount;
                const myShare = splitType === 'equal' ? totalAmount / 2 : 0;

                // 1. Create Friend Split (The Friend's Debt)
                await friendSplitAPI.create({
                    friendName: formData.friendName,
                    friendEmail: formData.friendEmail,
                    title: formData.title,
                    amount: friendShare, // Only what they owe
                    category: formData.category,
                    paidBy: 'user', // "I paid"
                    date: formData.date
                });

                // 2. Create Personal Expense (My Consumption) - ONLY if I paid for myself too
                if (myShare > 0) {
                    await expenseAPI.create({
                        title: `${formData.title} (My Share)`,
                        amount: myShare,
                        category: formData.category,
                        date: formData.date,
                        type: 'personal'
                    });
                }
            } else {
                await expenseAPI.create({
                    ...formData,
                    amount: parseFloat(formData.amount),
                    type: 'personal'
                });
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (error) {
            console.error('Error adding expense:', error);
            alert('Failed to add expense');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-neon-lime/20 flex items-center justify-center mx-auto mb-4">
                        <Check className="text-neon-lime" size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Expense Added!</h2>
                    <p className="text-gray-400">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-950">
            <Sidebar />
            <TopNav title="Add Expense" />

            <main className="md:ml-20 ml-0 pt-16 p-8 pb-20">
                <div className="max-w-2xl mx-auto">
                    <div className="premium-card relative">
                        {/* Scan Overlay */}
                        {scanning && (
                            <div className="absolute inset-0 bg-dark-950/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-3xl">
                                <Loader2 className="animate-spin text-neon-lime mb-4" size={48} />
                                <h3 className="text-xl font-bold text-white mb-2">{scanStatus}</h3>
                                <div className="w-64 h-2 bg-dark-800 rounded-full overflow-hidden mb-4">
                                    <div className="h-full bg-neon-lime transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                                </div>
                                <button
                                    onClick={cancelScan}
                                    className="text-gray-400 hover:text-white text-sm underline"
                                >
                                    Cancel & Restart
                                </button>
                            </div>
                        )}

                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">New Expense</h1>
                                <p className="text-gray-400">Track your spending</p>
                            </div>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="icon-btn"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scan Button */}
                        <div
                            onClick={() => fileInputRef.current.click()}
                            className="bg-dark-850 border-2 border-dashed border-white/10 rounded-2xl p-6 mb-8 text-center cursor-pointer hover:border-neon-lime/50 hover:bg-neon-lime/5 transition-all group"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                                accept="image/*"
                                capture="environment"
                            />
                            <div className="w-12 h-12 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <Camera className="text-neon-lime" size={24} />
                            </div>
                            <h3 className="font-bold text-white mb-1">Scan Receipt</h3>
                            <p className="text-xs text-gray-500">Auto-fill details from photo</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Expense Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="w-full px-4 py-3.5 bg-dark-850 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-neon-lime/50 focus:outline-none transition-all"
                                    placeholder="e.g., Lunch at cafeteria"
                                />
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Amount (₹)
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full pl-12 pr-4 py-3.5 bg-dark-850 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-neon-lime/50 focus:outline-none transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Category Pills */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">
                                    Category
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, category: cat })}
                                            className={`px-6 py-3 rounded-full font-medium transition-all ${formData.category === cat
                                                ? `bg-${categoryColors[cat]} text-black shadow-neon-${categoryColors[cat]}`
                                                : 'bg-dark-850 text-gray-400 border border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Date
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-dark-850 border border-white/10 rounded-2xl text-white focus:border-neon-lime/50 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Type Toggle */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">
                                    Expense Type
                                </label>
                                <div className="grid grid-cols-3 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'personal', groupId: '', friendName: '', friendEmail: '' })}
                                        className={`p-4 rounded-2xl font-medium transition-all ${formData.type === 'personal'
                                            ? 'bg-neon-lime text-black shadow-neon-lime'
                                            : 'bg-dark-850 text-gray-400 border border-white/10'
                                            }`}
                                    >
                                        <Tag className="mx-auto mb-2" size={24} />
                                        Personal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'friend', groupId: '' })}
                                        className={`p-4 rounded-2xl font-medium transition-all ${formData.type === 'friend'
                                            ? 'bg-neon-pink text-black shadow-neon-pink'
                                            : 'bg-dark-850 text-gray-400 border border-white/10'
                                            }`}
                                    >
                                        <User className="mx-auto mb-2" size={24} />
                                        Friend
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'group', friendName: '', friendEmail: '' })}
                                        className={`p-4 rounded-2xl font-medium transition-all ${formData.type === 'group'
                                            ? 'bg-neon-orange text-black shadow-neon-orange'
                                            : 'bg-dark-850 text-gray-400 border border-white/10'
                                            }`}
                                    >
                                        <Users className="mx-auto mb-2" size={24} />
                                        Group
                                    </button>
                                </div>
                            </div>

                            {/* Group Selection */}
                            {formData.type === 'group' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Select Group
                                    </label>
                                    <select
                                        value={formData.groupId}
                                        onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                                        required
                                        className="w-full px-4 py-3.5 bg-dark-850 border border-white/10 rounded-2xl text-white focus:border-neon-lime/50 focus:outline-none transition-all"
                                    >
                                        <option value="">Choose a group</option>
                                        {groups.map((group) => (
                                            <option key={group._id} value={group._id}>
                                                {group.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Friend Fields */}
                            {formData.type === 'friend' && (
                                <>
                                    {/* Friend Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Select Friend *
                                        </label>
                                        {friends.length > 0 && !useCustomFriend ? (
                                            <div className="space-y-3">
                                                <select
                                                    value={formData.friendId}
                                                    onChange={(e) => {
                                                        const selectedFriend = friends.find(f => f._id === e.target.value);
                                                        setFormData({
                                                            ...formData,
                                                            friendId: e.target.value,
                                                            friendName: selectedFriend?.name || '',
                                                            friendEmail: selectedFriend?.email || ''
                                                        });
                                                    }}
                                                    required={!useCustomFriend}
                                                    className="w-full px-4 py-3.5 bg-dark-850 border border-white/10 rounded-2xl text-white focus:border-neon-pink/50 focus:outline-none transition-all"
                                                >
                                                    <option value="">Choose a friend</option>
                                                    {friends.map((friend) => (
                                                        <option key={friend._id} value={friend._id}>
                                                            {friend.name} ({friend.email})
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUseCustomFriend(true);
                                                        setFormData({ ...formData, friendId: '', friendName: '', friendEmail: '' });
                                                    }}
                                                    className="text-neon-pink text-sm hover:underline"
                                                >
                                                    + Add someone not in your friends list
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <input
                                                        type="text"
                                                        value={formData.friendName}
                                                        onChange={(e) => setFormData({ ...formData, friendName: e.target.value })}
                                                        required
                                                        className="w-full px-4 py-3.5 bg-dark-850 border border-white/10 rounded-2xl text-white focus:border-neon-pink/50 focus:outline-none transition-all"
                                                        placeholder="Friend's name"
                                                    />
                                                    <input
                                                        type="email"
                                                        value={formData.friendEmail}
                                                        onChange={(e) => setFormData({ ...formData, friendEmail: e.target.value })}
                                                        className="w-full px-4 py-3.5 bg-dark-850 border border-white/10 rounded-2xl text-white focus:border-neon-pink/50 focus:outline-none transition-all"
                                                        placeholder="Email (optional)"
                                                    />
                                                </div>
                                                {friends.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setUseCustomFriend(false);
                                                            setFormData({ ...formData, friendName: '', friendEmail: '' });
                                                        }}
                                                        className="text-neon-pink text-sm hover:underline"
                                                    >
                                                        ← Select from friends list
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>



                                    {/* Split Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-3">
                                            Split Type *
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setSplitType('equal')}
                                                className={`py-4 rounded-2xl font-bold transition-all ${splitType === 'equal'
                                                    ? 'bg-neon-orange text-black shadow-neon-orange'
                                                    : 'bg-dark-850 text-gray-400 hover:bg-dark-700'
                                                    }`}
                                            >
                                                Split 50/50
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSplitType('full')}
                                                className={`py-4 rounded-2xl font-bold transition-all ${splitType === 'full'
                                                    ? 'bg-neon-orange text-black shadow-neon-orange'
                                                    : 'bg-dark-850 text-gray-400 hover:bg-dark-700'
                                                    }`}
                                            >
                                                Full Amount
                                            </button>
                                        </div>
                                        <p className="text-gray-500 text-sm mt-2">
                                            {splitType === 'equal'
                                                ? `You enter ₹${formData.amount}, split as ₹${(formData.amount / 2).toFixed(2)} each.`
                                                : `The full ₹${formData.amount} is assigned to the other person.`}
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 gradient-lime text-black font-bold rounded-2xl hover:shadow-neon-lime transition-all disabled:opacity-50 text-lg"
                            >
                                {loading ? 'Adding Expense...' : 'Add Expense'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AddExpense;

