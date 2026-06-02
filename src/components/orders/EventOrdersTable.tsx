'use client';

import React, { useEffect, useState } from 'react';
import {
    ShoppingBag, Search, Loader2, User, Mail,
    DollarSign, Calendar, Hash, CheckCircle2,
    Clock, XCircle, Phone,
} from 'lucide-react';
import { eventService } from '@/api/eventService';
import { EventOrder } from '@/types/event.types';

interface EventOrdersTableProps {
    eventId: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
    PAID: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    SUCCESS: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    PENDING: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-400' },
    FAILED: { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
    CANCELLED: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400' },
};

const DEFAULT_STATUS = {
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-400',
};

function formatDate(dateStr: string) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
    }).format(new Date(dateStr));
}

export default function EventOrdersTable({ eventId }: EventOrdersTableProps) {
    const [orders, setOrders] = useState<EventOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!eventId) return;
        const fetchOrders = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await eventService.getEventOrders(eventId);
                setOrders(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load orders.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [eventId]);

    const filtered = orders.filter(o =>
        [o.buyerName, o.buyerEmail, o.orderReference, o.paymentStatus]
            .some(v => v?.toLowerCase().includes(search.toLowerCase()))
    );

    const statusStyle = (status: string) =>
        STATUS_STYLES[status?.toUpperCase()] ?? DEFAULT_STATUS;

    const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const pendingCount = orders.filter(o => o.paymentStatus?.toUpperCase() === 'PENDING').length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
                    <XCircle className="w-7 h-7 text-red-500" />
                </div>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">Failed to load orders</p>
                <p className="text-sm text-gray-400">{error}</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-5">
                    <ShoppingBag className="w-8 h-8 text-brand-500" />
                </div>
                <p className="font-bold text-gray-900 dark:text-white text-lg mb-1">No orders yet</p>
                <p className="text-sm text-gray-400 max-w-xs">
                    Orders will appear here once attendees start purchasing tickets.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-5">

            {/* Summary strip */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Orders', value: orders.length, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10', icon: <ShoppingBag className="w-5 h-5" /> },
                    { label: 'Total Revenue', value: `Rs.${totalRevenue.toLocaleString()}`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: <DollarSign className="w-5 h-5" /> },
                    { label: 'Pending', value: pendingCount, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: <Clock className="w-5 h-5" /> },
                ].map(({ label, value, color, bg, icon }) => (
                    <div key={label} className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-white/2 shadow-sm">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bg} ${color}`}>{icon}</div>
                        <div>
                            <p className={`text-xl font-black tabular-nums ${color}`}>{value}</p>
                            <p className="text-xs font-semibold text-gray-400 mt-0.5">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table card */}
            <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-white/2 shadow-sm overflow-hidden">

                {/* Header + search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 px-6 py-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-t-xl">

                    {/* Left Side: Modern Title & Badge */}
                    <div className="flex flex-col justify-center shrink-0">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                                Order Records
                            </h3>
                            {/* Modern Pill Badge for the count */}
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-100 dark:border-emerald-800/50">
                                {filtered.length} of {orders.length}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                            Manage and track ticket purchases for your events.
                        </p>
                    </div>

                    {/* Right Side: Search Bar */}
                    <div className="flex items-center w-full md:max-w-[320px] shrink-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-1.5 shadow-sm transition-all focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-50 dark:focus-within:ring-emerald-900/20">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shrink-0 pointer-events-none">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, email, or reference"
                            className="flex-1 w-full bg-transparent border-none outline-none focus:ring-0 px-3 py-1 text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
                        />
                    </div>

                </div>

                {/* Table — fixed layout, widths on th directly (no colgroup to avoid hydration error) */}
                <table className="w-full text-sm table-fixed">
                    <thead>
                        <tr className="bg-gray-50/80 dark:bg-white/2">
                            <th className="w-[22%] px-5 py-3.5 text-left text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" />Reference</span>
                            </th>
                            <th className="w-[26%] px-5 py-3.5 text-left text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Buyer</span>
                            </th>
                            <th className="w-[20%] px-5 py-3.5 text-left text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />Phone / CNIC</span>
                            </th>
                            <th className="w-[12%] px-5 py-3.5 text-left text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" />Amount</span>
                            </th>
                            <th className="w-[10%] px-5 py-3.5 text-left text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />Status</span>
                            </th>
                            <th className="w-[10%] px-5 py-3.5 text-left text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Date</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">
                                    No orders match your search.
                                </td>
                            </tr>
                        ) : filtered.map((order, idx) => {
                            const s = statusStyle(order.paymentStatus);
                            return (
                                <tr key={order.orderId ?? idx} className="hover:bg-gray-50/50 dark:hover:bg-white/1 transition-colors">
                                    <td className="px-5 py-4">
                                        <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1 rounded-lg block truncate">
                                            {order.orderReference ?? '—'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="font-semibold text-gray-900 dark:text-white leading-snug truncate">{order.buyerName}</p>
                                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                            <Mail className="w-3 h-3 shrink-0" />
                                            <span className="truncate">{order.buyerEmail}</span>
                                        </p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="text-gray-700 dark:text-gray-300 font-medium text-xs">{order.buyerPhone ?? '—'}</p>
                                        <p className="font-mono text-[11px] text-gray-400 mt-0.5 truncate">{order.buyerCnic ?? '—'}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="font-black text-gray-900 dark:text-white tabular-nums text-sm">
                                            Rs.{(order.totalAmount ?? 0).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${s.bg} ${s.text}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                                            {order.paymentStatus ?? 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-xs text-gray-400 font-medium">
                                            {order.createdAt ? formatDate(order.createdAt) : '—'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}