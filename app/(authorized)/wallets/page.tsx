"use client"

import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from "lucide-react"
import { Skeleton } from '@/components/ui/skeleton'
import { useRequireWalletRedirect } from '@/lib/walletRedirect'

interface Wallet {
    _id: string
    balance: number
    currency: string
}

interface Transaction {
    _id: string
    name: string
    type: string
    amount: number
    date: string
    invoiceId?: { status: string }
}

interface Invoice {
    _id: string
    clientName: string
    orders: string
    amount: number
    date: string
    status: "pending" | "paid" | "unpaid"
}

export default function Page() {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [searchPayments, setSearchPayments] = useState("");
    const [searchInvoices, setSearchInvoices] = useState("");
    const [loading, setLoading] = useState(true);

    useRequireWalletRedirect();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [walletRes, txRes, invRes] = await Promise.all([
                    fetch("/api/wallets"),
                    fetch("/api/transactions"),
                    fetch("/api/invoices"),
                ]);

                const [walletData, txData, invData] = await Promise.all([
                    walletRes.json(),
                    txRes.json(),
                    invRes.json(),
                ]);

                setWallets(walletData);
                setTransactions(txData);
                setInvoices(invData);
            } catch (err) {
                console.error("Failed to fetch data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const wallet = wallets[0];
    const upcoming = invoices.filter(inv => inv.status === "pending" || inv.status === "unpaid");

    const filteredTx = transactions
        .filter((tx) =>
            tx.name.toLowerCase().includes(searchPayments.toLowerCase())
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const filteredInv = upcoming
        .filter((inv) =>
            inv.clientName.toLowerCase().includes(searchInvoices.toLowerCase())
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const maskWalletId = (id: string) => {
        if (!id) return "";
        const visible = id.slice(0, 10);
        const masked = "*".repeat(id.length - 10);
        return visible + masked;
    };

    const formatCurrency = (amount: number, code: string = "USD") => {
        try {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: code,
            }).format(amount);
        } catch {
            return `${code} ${amount.toFixed(2)}`;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
            <div className="w-full lg:w-1/3 space-y-6">
                <div className="relative">
                    <div className="bg-gradient-to-br from-[#4A4A49] to-[#20201F] text-white rounded-2xl p-6 h-44 dark:from-[#2E2B4A] dark:to-[#29263F]">
                        <p className="text-sm opacity-70">My Wallet</p>

                        <div className="flex items-center justify-between gap-4 mt-2">
                            <svg width="38" height="30" viewBox="0 0 38 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M34.259 29.8716L3.79234 29.9999C1.77368 30.0116 0.105076 28.3547 0.0934075 26.336L6.12548e-05 3.82735C-0.0116073 1.80869 1.64533 0.140085 3.66399 0.128416L34.1306 6.12548e-05C36.1493 -0.0116073 37.8179 1.64533 37.8295 3.66399L37.9229 26.1727C37.9346 28.203 36.2776 29.8716 34.259 29.8716Z" fill="#B2AEA9" />
                                <path d="M14.6557 25.9742C14.4924 25.9742 14.3407 25.8925 14.259 25.7409C14.1423 25.5308 14.2357 25.2624 14.4457 25.1458C15.0758 24.819 15.9393 24.2006 16.4294 23.1504C17.0595 21.8085 16.8844 20.35 16.616 20.2333C16.546 20.1983 16.2893 20.3383 16.126 20.42C15.7176 20.63 15.1458 20.9217 14.4807 20.7C13.8273 20.4783 13.5122 19.9066 13.3605 19.6265C12.357 17.8179 12.0303 13.0921 13.0688 10.7351C13.4189 9.95328 13.8856 9.48654 14.469 9.34651C15.0641 9.20649 15.5542 9.45153 15.9509 9.6499C16.2777 9.81326 16.441 9.88326 16.5344 9.82492C16.9428 9.57988 16.9311 8.07464 16.3477 6.88445C15.8459 5.83428 14.9825 5.22751 14.3407 4.90079C14.1306 4.79578 14.0373 4.5274 14.154 4.31737C14.259 4.10733 14.5274 4.01398 14.7374 4.13066C15.4959 4.51573 16.5227 5.23918 17.1295 6.51105C17.7362 7.77126 18.028 9.94161 16.9778 10.5834C16.4527 10.9101 15.9393 10.6534 15.5425 10.4434C15.2392 10.2917 14.9474 10.14 14.6674 10.21C14.2823 10.3033 14.014 10.7467 13.8623 11.0968C12.9521 13.1505 13.2322 17.6195 14.119 19.2064C14.2707 19.4748 14.4457 19.7665 14.7608 19.8716C15.0525 19.9766 15.3325 19.8482 15.7292 19.6382C16.1143 19.4398 16.546 19.2181 17.0011 19.4398C17.9813 19.9066 17.9229 22.0186 17.2228 23.5238C16.6277 24.8074 15.6009 25.5308 14.8424 25.9275C14.7958 25.9625 14.7257 25.9742 14.6557 25.9742Z" fill="#3D3D3C" />
                                <path d="M13.2796 11.5287L5.39165 11.5637C5.14661 11.5637 4.94824 11.3653 4.94824 11.132C4.94824 10.8869 5.14661 10.6886 5.37998 10.6886L13.2679 10.6536C13.513 10.6536 13.7113 10.8519 13.7113 11.0853C13.723 11.3303 13.5246 11.5287 13.2796 11.5287Z" fill="#3D3D3C" />
                                <path d="M13.3138 19.4166L5.42583 19.4517C5.18079 19.4517 4.98242 19.2533 4.98242 19.0199C4.98242 18.7749 5.18079 18.5765 5.41416 18.5765L13.3021 18.5415C13.5472 18.5415 13.7455 18.7399 13.7455 18.9732C13.7455 19.2066 13.5588 19.4166 13.3138 19.4166Z" fill="#3D3D3C" />
                                <path d="M23.8505 25.9396C23.7805 25.9396 23.7105 25.9279 23.6522 25.8929C22.8937 25.5079 21.8669 24.7844 21.2601 23.5125C20.5367 22.019 20.4667 19.9069 21.4468 19.4285C21.9019 19.2068 22.3336 19.4285 22.7187 19.6152C23.1154 19.8136 23.3955 19.9419 23.6872 19.8369C24.0139 19.7202 24.2006 19.3702 24.3173 19.1601C25.1808 17.5616 25.4258 13.0925 24.504 11.0505C24.3406 10.7004 24.0723 10.257 23.6872 10.1754C23.4538 10.117 23.3021 9.88365 23.3605 9.65028C23.4188 9.4169 23.6522 9.26522 23.8856 9.32356C24.469 9.46358 24.9474 9.91865 25.2974 10.7004C26.3593 13.0458 26.0676 17.7716 25.0874 19.5919C24.9357 19.8719 24.6207 20.4554 23.9789 20.6771C23.3138 20.9104 22.742 20.6187 22.3336 20.4087C22.1703 20.327 21.9019 20.1987 21.8436 20.222C21.5752 20.3503 21.4235 21.8089 22.0653 23.1391C22.567 24.1893 23.4305 24.7961 24.0722 25.1228C24.2823 25.2278 24.3756 25.4962 24.2589 25.7062C24.1656 25.8462 24.0139 25.9396 23.8505 25.9396Z" fill="#3D3D3C" />
                                <path d="M22.0306 9.74329C21.8439 9.74329 21.6805 9.62661 21.6105 9.43991C20.6654 6.62779 22.8474 4.44576 23.5592 4.08403C23.7692 3.96735 24.0376 4.0607 24.1543 4.27074C24.2709 4.48077 24.1776 4.74914 23.9676 4.86583C23.6525 5.02919 21.6455 6.7678 22.4507 9.15986C22.5323 9.39323 22.404 9.63827 22.1706 9.71995C22.1239 9.73162 22.0773 9.74329 22.0306 9.74329Z" fill="#3D3D3C" />
                                <path d="M32.9876 11.4469L25.0997 11.4819C24.8546 11.4819 24.6562 11.2836 24.6562 11.0502C24.6562 10.8051 24.8546 10.6068 25.088 10.6068L32.9759 10.5718C33.221 10.5718 33.4193 10.7701 33.4193 11.0035C33.431 11.2485 33.2326 11.4469 32.9876 11.4469Z" fill="#3D3D3C" />
                                <path d="M33.0218 19.3349L25.1338 19.3699C24.8888 19.3699 24.6904 19.1715 24.6904 18.9381C24.6904 18.6931 24.8888 18.4947 25.1222 18.4947L33.0101 18.4597C33.2552 18.4597 33.4535 18.6581 33.4535 18.8915C33.4652 19.1365 33.2668 19.3349 33.0218 19.3349Z" fill="#3D3D3C" />
                            </svg>

                            <svg width="34" height="33" viewBox="0 0 34 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.2266 6.75129C21.93 12.6638 21.93 20.35 17.2266 26.2625M22.1567 2.75C28.7867 11.0825 28.7866 21.9175 22.1566 30.25M12.0558 9.3363C15.5125 13.6676 15.5125 19.3188 12.0558 23.65M6.87079 12.925C8.59912 15.0975 8.59912 17.9162 6.87079 20.0887" stroke="#363B41"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round" />
                            </svg>
                        </div>

                        {loading ? (
                            <Skeleton className="h-6 w-32 mt-1 bg-gray-200 dark:bg-[#282541]" />
                        ) : (
                            <p className="text-sm mt-1">
                                {wallet ? formatCurrency(wallet.balance, wallet.currency) : "$0.00"}
                            </p>
                        )}
                    </div>

                    <div className="absolute -bottom-20 left-4 right-4 bg-white/30 backdrop-blur-md rounded-2xl p-4 z-10 dark:bg-white/20">
                        <p className="font-semibold mb-2 text-white">Finance. | Website</p>
                        <div className="flex items-center justify-between gap-4 mt-2">
                            <svg width="38" height="30" viewBox="0 0 38 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M34.259 29.8716L3.79234 29.9999C1.77368 30.0116 0.105076 28.3547 0.0934075 26.336L6.12548e-05 3.82735C-0.0116073 1.80869 1.64533 0.140085 3.66399 0.128416L34.1306 6.12548e-05C36.1493 -0.0116073 37.8179 1.64533 37.8295 3.66399L37.9229 26.1727C37.9346 28.203 36.2776 29.8716 34.259 29.8716Z" fill="#B2AEA9" />
                                <path d="M14.6557 25.9742C14.4924 25.9742 14.3407 25.8925 14.259 25.7409C14.1423 25.5308 14.2357 25.2624 14.4457 25.1458C15.0758 24.819 15.9393 24.2006 16.4294 23.1504C17.0595 21.8085 16.8844 20.35 16.616 20.2333C16.546 20.1983 16.2893 20.3383 16.126 20.42C15.7176 20.63 15.1458 20.9217 14.4807 20.7C13.8273 20.4783 13.5122 19.9066 13.3605 19.6265C12.357 17.8179 12.0303 13.0921 13.0688 10.7351C13.4189 9.95328 13.8856 9.48654 14.469 9.34651C15.0641 9.20649 15.5542 9.45153 15.9509 9.6499C16.2777 9.81326 16.441 9.88326 16.5344 9.82492C16.9428 9.57988 16.9311 8.07464 16.3477 6.88445C15.8459 5.83428 14.9825 5.22751 14.3407 4.90079C14.1306 4.79578 14.0373 4.5274 14.154 4.31737C14.259 4.10733 14.5274 4.01398 14.7374 4.13066C15.4959 4.51573 16.5227 5.23918 17.1295 6.51105C17.7362 7.77126 18.028 9.94161 16.9778 10.5834C16.4527 10.9101 15.9393 10.6534 15.5425 10.4434C15.2392 10.2917 14.9474 10.14 14.6674 10.21C14.2823 10.3033 14.014 10.7467 13.8623 11.0968C12.9521 13.1505 13.2322 17.6195 14.119 19.2064C14.2707 19.4748 14.4457 19.7665 14.7608 19.8716C15.0525 19.9766 15.3325 19.8482 15.7292 19.6382C16.1143 19.4398 16.546 19.2181 17.0011 19.4398C17.9813 19.9066 17.9229 22.0186 17.2228 23.5238C16.6277 24.8074 15.6009 25.5308 14.8424 25.9275C14.7958 25.9625 14.7257 25.9742 14.6557 25.9742Z" fill="#3D3D3C" />
                                <path d="M13.2796 11.5287L5.39165 11.5637C5.14661 11.5637 4.94824 11.3653 4.94824 11.132C4.94824 10.8869 5.14661 10.6886 5.37998 10.6886L13.2679 10.6536C13.513 10.6536 13.7113 10.8519 13.7113 11.0853C13.723 11.3303 13.5246 11.5287 13.2796 11.5287Z" fill="#3D3D3C" />
                                <path d="M13.3138 19.4166L5.42583 19.4517C5.18079 19.4517 4.98242 19.2533 4.98242 19.0199C4.98242 18.7749 5.18079 18.5765 5.41416 18.5765L13.3021 18.5415C13.5472 18.5415 13.7455 18.7399 13.7455 18.9732C13.7455 19.2066 13.5588 19.4166 13.3138 19.4166Z" fill="#3D3D3C" />
                                <path d="M23.8505 25.9396C23.7805 25.9396 23.7105 25.9279 23.6522 25.8929C22.8937 25.5079 21.8669 24.7844 21.2601 23.5125C20.5367 22.019 20.4667 19.9069 21.4468 19.4285C21.9019 19.2068 22.3336 19.4285 22.7187 19.6152C23.1154 19.8136 23.3955 19.9419 23.6872 19.8369C24.0139 19.7202 24.2006 19.3702 24.3173 19.1601C25.1808 17.5616 25.4258 13.0925 24.504 11.0505C24.3406 10.7004 24.0723 10.257 23.6872 10.1754C23.4538 10.117 23.3021 9.88365 23.3605 9.65028C23.4188 9.4169 23.6522 9.26522 23.8856 9.32356C24.469 9.46358 24.9474 9.91865 25.2974 10.7004C26.3593 13.0458 26.0676 17.7716 25.0874 19.5919C24.9357 19.8719 24.6207 20.4554 23.9789 20.6771C23.3138 20.9104 22.742 20.6187 22.3336 20.4087C22.1703 20.327 21.9019 20.1987 21.8436 20.222C21.5752 20.3503 21.4235 21.8089 22.0653 23.1391C22.567 24.1893 23.4305 24.7961 24.0722 25.1228C24.2823 25.2278 24.3756 25.4962 24.2589 25.7062C24.1656 25.8462 24.0139 25.9396 23.8505 25.9396Z" fill="#3D3D3C" />
                                <path d="M22.0306 9.74329C21.8439 9.74329 21.6805 9.62661 21.6105 9.43991C20.6654 6.62779 22.8474 4.44576 23.5592 4.08403C23.7692 3.96735 24.0376 4.0607 24.1543 4.27074C24.2709 4.48077 24.1776 4.74914 23.9676 4.86583C23.6525 5.02919 21.6455 6.7678 22.4507 9.15986C22.5323 9.39323 22.404 9.63827 22.1706 9.71995C22.1239 9.73162 22.0773 9.74329 22.0306 9.74329Z" fill="#3D3D3C" />
                                <path d="M32.9876 11.4469L25.0997 11.4819C24.8546 11.4819 24.6562 11.2836 24.6562 11.0502C24.6562 10.8051 24.8546 10.6068 25.088 10.6068L32.9759 10.5718C33.221 10.5718 33.4193 10.7701 33.4193 11.0035C33.431 11.2485 33.2326 11.4469 32.9876 11.4469Z" fill="#3D3D3C" />
                                <path d="M33.0218 19.3349L25.1338 19.3699C24.8888 19.3699 24.6904 19.1715 24.6904 18.9381C24.6904 18.6931 24.8888 18.4947 25.1222 18.4947L33.0101 18.4597C33.2552 18.4597 33.4535 18.6581 33.4535 18.8915C33.4652 19.1365 33.2668 19.3349 33.0218 19.3349Z" fill="#3D3D3C" />
                            </svg>

                            <svg width="34" height="33" viewBox="0 0 34 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.2266 6.75129C21.93 12.6638 21.93 20.35 17.2266 26.2625M22.1567 2.75C28.7867 11.0825 28.7866 21.9175 22.1566 30.25M12.0558 9.3363C15.5125 13.6676 15.5125 19.3188 12.0558 23.65M6.87079 12.925C8.59912 15.0975 8.59912 17.9162 6.87079 20.0887" stroke="#363B41"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round" />
                            </svg>
                        </div>

                        {loading ? (
                            <>
                                <Skeleton className="h-4 w-32 mb-2 dark:bg-[#292642]" />
                                <Skeleton className="h-6 w-24 dark:bg-[#292642]" />
                            </>
                        ) : (
                            <>
                                <p className="text-black font-mono text-sm truncate mt-2">
                                    {wallet?._id ? maskWalletId(wallet._id) : ""}
                                </p>
                                <p className="text-gray-600 text-sm">Wallet ID</p>
                            </>
                        )}
                    </div>
                </div>

                <Card className="w-full dark:bg-[#282541] mt-24 sm:mt-20 lg:mt-24">
                    <CardContent className="p-4 space-y-2">
                        <p className="text-gray-500">Your Balance</p>
                        {loading ? (
                            <Skeleton className="h-6 w-32 bg-gray-200 dark:bg-[#1C1A2E]" />
                        ) : (
                            <p className="text-xl font-bold">
                                {wallet ? formatCurrency(wallet.balance, wallet.currency) : "$0.00"}
                            </p>
                        )}

                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500">Currency:</p>
                                {loading ? (
                                    <Skeleton className="h-4 w-12 bg-gray-200 dark:bg-[#1C1A2E]" />
                                ) : (
                                    <p>{wallet?.currency || "USD"}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-gray-500">Status:</p>
                                {loading ? (
                                    <Skeleton className="h-4 w-16 bg-gray-200 dark:bg-[#1C1A2E]" />
                                ) : (
                                    <p className="text-green-500 font-semibold">Active</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="w-full lg:w-2/3 space-y-6 mt-6 lg:mt-0">
                <Card className="flex-1 dark:bg-[#282541]">
                    <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                            <h3 className="text-lg font-semibold">My Payments</h3>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-none">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search..."
                                        className="pl-8 w-full sm:w-48"
                                        value={searchPayments}
                                        onChange={(e) => setSearchPayments(e.target.value)}
                                    />
                                </div>
                                <Link
                                    href="/transactions"
                                    className="text-[#a0bd36] font-medium hover:underline transition"
                                >
                                    View All
                                </Link>
                            </div>
                        </div>

                        <div className="hidden md:block overflow-x-auto">
                            <ul className="divide-y divide-gray-200 dark:divide-[#282541] flex-1 overflow-y-auto">
                                {loading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <li key={i} className="flex justify-between py-3">
                                            <div>
                                                <Skeleton className="h-4 w-32 mb-2 rounded dark:bg-[#1C1A2E]" />
                                                <Skeleton className="h-3 w-20 rounded dark:bg-[#1C1A2E]" />
                                            </div>
                                            <Skeleton className="h-4 w-16 rounded dark:bg-[#1C1A2E]" />
                                        </li>
                                    ))
                                ) : filteredTx.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No payments found.</p>
                                ) : (
                                    filteredTx.slice(0, 4).map((tx) => (
                                        <li key={tx._id} className="flex justify-between py-3">
                                            <div>
                                                <p className="font-medium">{tx.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(tx.date).toLocaleString()}
                                                </p>
                                            </div>
                                            <span className="font-medium">
                                                {wallet ? formatCurrency(tx.amount, wallet.currency) : `$${tx.amount}`}
                                            </span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>

                        <div className="grid gap-3 md:hidden">
                            {loading
                                ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="p-4 border rounded-lg bg-white dark:bg-[#282541] shadow-sm"
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <Skeleton className="h-4 w-24 dark:bg-[#1C1A2E]" />
                                                <Skeleton className="h-3 w-16 dark:bg-[#1C1A2E]" />
                                            </div>
                                            <Skeleton className="h-3 w-20 mb-2 dark:bg-[#1C1A2E]" />
                                            <div className="flex justify-between items-center mt-2">
                                                <Skeleton className="h-3 w-16 dark:bg-[#1C1A2E]" />
                                                <Skeleton className="h-4 w-20 dark:bg-[#1C1A2E]" />
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <Skeleton className="h-3 w-16 dark:bg-[#1C1A2E]" />
                                                <Skeleton className="h-4 w-16 dark:bg-[#1C1A2E]" />
                                            </div>
                                        </div>
                                    )
                                    )) : filteredTx.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No payments found.</p>
                                    ) : (
                                    filteredTx.slice(0, 4).map((tx) => (
                                        <div
                                            key={tx._id}
                                            className="p-4 border rounded-lg bg-white dark:bg-[#282541] shadow-sm"
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-semibold">{tx.name}</span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(tx.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600">Type: {tx.type}</div>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-sm text-gray-500">Amount</span>
                                                <span className="font-medium">
                                                    {wallet
                                                        ? formatCurrency(tx.amount, wallet.currency)
                                                        : `$${tx.amount}`}
                                                </span>
                                            </div>
                                            {tx.invoiceId?.status && (
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-sm text-gray-500">Status</span>
                                                    <span className="capitalize">{tx.invoiceId.status}</span>
                                                </div>
                                            )}
                                        </div>)
                                    ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex-1 dark:bg-[#282541]">
                    <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                            <h3 className="text-lg font-semibold">Upcoming Payments</h3>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-none">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search..."
                                        className="pl-8 w-full sm:w-48"
                                        value={searchInvoices}
                                        onChange={(e) => setSearchInvoices(e.target.value)}
                                    />
                                </div>
                                <Link
                                    href="/invoices"
                                    className="text-[#a0bd36] font-medium hover:underline transition"
                                >
                                    View All
                                </Link>
                            </div>
                        </div>


                        <div className="hidden md:flex flex-col gap-3">
                            {loading
                                ? (Array.from({ length: 4 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between border-b pb-2 last:border-0"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <Skeleton className="h-4 w-32 rounded dark:bg-[#1C1A2E]" />
                                            <Skeleton className="h-3 w-20 rounded dark:bg-[#1C1A2E]" />
                                        </div>
                                        <Skeleton className="h-4 w-16 rounded dark:bg-[#1C1A2E]" />
                                    </div>)
                                )) : filteredInv.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No upcoming invoices.</p>
                                ) : (
                                    filteredInv.map((inv) => (
                                        <div
                                            key={inv._id}
                                            className="flex items-center justify-between border-b pb-2 last:border-0"
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium">{inv.clientName}</span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(inv.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <span>
                                                {wallet ? formatCurrency(inv.amount, wallet.currency) : `$${inv.amount}`}
                                            </span>
                                        </div>
                                    )
                                    ))}
                        </div>

                        <div className="grid gap-3 md:hidden">
                            {loading
                                ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="p-4 border rounded-lg bg-white dark:bg-[#282541] shadow-sm"
                                        >
                                            <div className="flex flex-col gap-1">
                                                <Skeleton className="h-4 w-28 mb-1 rounded dark:bg-[#1C1A2E]" />
                                                <Skeleton className="h-3 w-20 rounded dark:bg-[#1C1A2E]" />
                                            </div>

                                            <div className="flex justify-between items-center mt-3">
                                                <Skeleton className="h-3 w-16 rounded dark:bg-[#1C1A2E]" />
                                                <Skeleton className="h-4 w-20 rounded dark:bg-[#1C1A2E]" />
                                            </div>
                                        </div>
                                    )
                                    )) : filteredInv.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No upcoming invoices.</p>
                                    ) : (
                                    filteredInv.map((inv) => (
                                        <div
                                            key={inv._id}
                                            className="p-4 border rounded-lg bg-white dark:bg-[#282541] shadow-sm"
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{inv.clientName}</span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(inv.date).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center mt-3">
                                                <span className="text-sm text-gray-500">Amount</span>
                                                <span>
                                                    {wallet ? formatCurrency(inv.amount, wallet.currency) : `$${inv.amount}`}
                                                </span>
                                            </div>
                                        </div>)
                                    ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}