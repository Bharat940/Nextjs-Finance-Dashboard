"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideSearch } from "lucide-react";
import Link from "next/link";
import { useRequireWalletRedirect } from "@/lib/walletRedirect";

interface Wallet {
    _id: string;
    balance: number;
    currency: string;
}

interface Transaction {
    _id: string;
    name: string;
    type: string;
    amount: number;
    date: string;
    invoiceId?: { status: string; _id?: string };
}

function SkeletonRow() {
    useRequireWalletRedirect();

    return (
        <tr>
            <td className="px-4 py-2">
                <Skeleton className="h-5 w-32 rounded-md bg-gray-300 dark:bg-gray-600" />
            </td>
            <td className="px-4 py-2">
                <Skeleton className="h-4 w-20 rounded-md bg-gray-300 dark:bg-gray-600" />
            </td>
            <td className="px-4 py-2">
                <Skeleton className="h-5 w-24 rounded-md bg-gray-300 dark:bg-gray-600" />
            </td>
            <td className="px-4 py-2">
                <Skeleton className="h-4 w-28 rounded-md bg-gray-300 dark:bg-gray-600" />
            </td>
            <td className="px-4 py-2">
                <Skeleton className="h-4 w-20 rounded-md bg-gray-300 dark:bg-gray-600" />
            </td>
            <td className="px-4 py-2">
                <Skeleton className="h-7 w-16 rounded-sm bg-gray-300 dark:bg-gray-600" />
            </td>
        </tr>
    );
}

function MobileSkeletonCard() {
    return (
        <div className="p-3 border rounded-lg bg-white dark:bg-[#282541]">
            <div className="flex justify-between mb-2">
                <Skeleton className="h-5 w-28 rounded-md bg-gray-300 dark:bg-gray-600" />
                <Skeleton className="h-4 w-16 rounded-md bg-gray-300 dark:bg-gray-600" />
            </div>
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between text-sm mt-3">
                    <Skeleton className="h-4 w-20 rounded-md bg-gray-300 dark:bg-gray-600" />
                    <Skeleton className="h-4 w-20 rounded-md bg-gray-300 dark:bg-gray-600" />
                </div>
            ))}
            <div className="mt-4">
                <Skeleton className="h-8 w-24 rounded-sm bg-gray-300 dark:bg-gray-600" />
            </div>
        </div>
    );
}

export default function Page() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filtered, setFiltered] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [wallets, setWallets] = useState<Wallet[]>([]);

    useEffect(() => {
        fetch("/api/transactions")
            .then((res) => res.json())
            .then((data) => {
                setTransactions(data);
                setFiltered(data);
                setLoading(false);
            });
        fetch("/api/wallets")
            .then((res) => res.json())
            .then(setWallets);
    }, []);

    const wallet = wallets[0];

    useEffect(() => {
        if (search.trim() === "") {
            setFiltered(transactions);
        } else {
            const query = search.toLowerCase();
            setFiltered(
                transactions.filter(
                    (tx) =>
                        tx.name.toLowerCase().includes(query) ||
                        tx.type.toLowerCase().includes(query) ||
                        tx.invoiceId?._id?.toString().includes(query) ||
                        tx.amount.toString().includes(query) ||
                        new Date(tx.date).toLocaleDateString().includes(query)
                )
            );
        }
    }, [search, transactions]);

    const formatCurrency = (amount: number, code: string) => {
        try {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: code,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(amount);
        } catch {
            return `${code} ${amount.toFixed(2)}`;
        }
    };

    const maskInvoiceId = (id?: string) => {
        if (!id) return "N/A";
        if (id.length <= 10) return "*".repeat(id.length);
        return `${id.slice(0, id.length - 10)}${"*".repeat(10)}`;
    };

    return (
        <div className="p-4 dark:bg-[#201E34] text-black dark:text-white">
            <div className="flex w-full max-w-90 mb-4 gap-2 items-center rounded-lg px-2 py-1 bg-[#F5F5F5] pl-5 dark:bg-[#282541]">
                <LucideSearch className="w-5 h-5 text-black dark:text-white flex-shrink-0" />
                <Input
                    placeholder="Search anything on Transactions"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 focus:ring-0 border-none dark:bg-[#282541] min-w-0"
                />
            </div>
            <div className="border-t border-[#F5F5F5] my-4" />
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full border-gray-300 rounded-lg overflow-hidden">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left uppercase text-gray-400 font-normal text-sm">Name/Business</th>
                            <th className="px-4 py-2 text-left uppercase text-gray-400 font-normal text-sm">Type</th>
                            <th className="px-4 py-2 text-left uppercase text-gray-400 font-normal text-sm">Amount</th>
                            <th className="px-4 py-2 text-left uppercase text-gray-400 font-normal text-sm">Date</th>
                            <th className="px-4 py-2 text-left uppercase text-gray-400 font-normal text-sm">InvoiceId</th>
                            <th className="px-4 py-2 text-left uppercase text-gray-400 font-normal text-sm">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
                        ) : filtered.length > 0 ? (
                            filtered.map((tx) => (
                                <tr key={tx._id} className="hover:bg-gray-50 dark:hover:bg-[#282541]">
                                    <td className="px-4 py-2">{tx.name}</td>
                                    <td className="px-4 py-2 text-gray-500">{tx.type}</td>
                                    <td className="px-4 py-2">
                                        {wallet ? formatCurrency(tx.amount, wallet.currency) : `$${tx.amount}`}
                                    </td>
                                    <td className="px-4 py-2">{new Date(tx.date).toLocaleDateString("en-US")}</td>
                                    <td className="px-4 py-2 text-gray-500">{maskInvoiceId(tx.invoiceId?._id)}</td>
                                    <td className="px-4 py-2">
                                        <Link href={`/transactions/${tx._id}`}>
                                            <Button
                                                size="sm"
                                                className="bg-[#C8EE44] text-black rounded-sm cursor-pointer hover:bg-green-200"
                                            >
                                                View
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center py-6 text-gray-500">
                                    No transactions yet.{" "}
                                    <Link href="/invoices/create" className="text-[#29A073] hover:underline">
                                        Create one
                                    </Link>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="grid gap-3 md:hidden">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <MobileSkeletonCard key={i} />)
                ) : filtered.length > 0 ? (
                    filtered.map((tx) => (
                        <div key={tx._id} className="p-3 border rounded-lg bg-white dark:bg-[#282541]">
                            <div className="flex justify-between">
                                <span className="font-semibold">{tx.name}</span>
                                <span className="text-sm text-gray-500">
                                    {new Date(tx.date).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-500">Type:</span>
                                <span>{tx.type}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-500">Amount:</span>
                                <span className="font-medium">
                                    {wallet ? formatCurrency(tx.amount, wallet.currency) : `$${tx.amount}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-500">Invoice ID:</span>
                                <span>{tx.invoiceId?._id || "N/A"}</span>
                            </div>
                            <div className="mt-2">
                                <Link href={`/transactions/${tx._id}`}>
                                    <Button size="sm" className="bg-[#C8EE44] text-black">
                                        View
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-6 text-gray-500">
                        No transactions yet.{" "}
                        <Link href="/invoices/create" className="text-[#29A073] hover:underline">
                            Create one
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
