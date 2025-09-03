"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ListFilter, LucideSearch, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRequireWalletRedirect } from "@/lib/walletRedirect";

interface Wallet {
    _id: string;
    balance: number;
    currency: string;
}

interface Invoice {
    _id: string;
    clientName: string;
    orders: string;
    amount: number;
    date: string;
    status: "pending" | "paid" | "unpaid";
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
    return (
        <tr>
            <td className="px-4 py-2">
                <Skeleton className="h-5 w-32 rounded-md bg-gray-300 dark:bg-gray-600" />
            </td>
            <td className="px-4 py-2">
                <Skeleton className="h-4 w-20 rounded-md bg-gray-300 dark:bg-gray-600" />
            </td>
            <td className="px-4 py-2">
                <Skeleton className="h-5 w-28 rounded-md bg-gray-300 dark:bg-gray-600" />
            </td>
            <td className="px-4 py-2">
                <Skeleton className="h-5 w-24 rounded-md bg-gray-300 dark:bg-gray-600" />
            </td>
            <td className="px-4 py-2">
                <Skeleton className="h-6 w-20 rounded-md bg-gray-300 dark:bg-gray-600" />
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
                <Skeleton className="h-5 w-32 rounded-md bg-gray-300 dark:bg-gray-600" />
                <Skeleton className="h-4 w-20 rounded-md bg-gray-300 dark:bg-gray-600" />
            </div>
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between text-sm mt-3">
                    <Skeleton className="h-4 w-24 rounded-md bg-gray-300 dark:bg-gray-600" />
                    <Skeleton className="h-4 w-24 rounded-md bg-gray-300 dark:bg-gray-600" />
                </div>
            ))}
            <div className="mt-4">
                <Skeleton className="h-8 w-24 rounded-sm bg-gray-300 dark:bg-gray-600" />
            </div>
        </div>
    );
}

export default function Page() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [filtered, setFiltered] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterBy, setFilterBy] = useState<"date" | "amount" | "status" | "">("");
    const [wallets, setWallets] = useState<Wallet[]>([]);

    useRequireWalletRedirect();

    useEffect(() => {
        fetch("/api/wallets").then((r) => r.json()).then(setWallets);
    }, []);

    const wallet = wallets[0];

    useEffect(() => {
        fetch("/api/invoices")
            .then((res) => res.json())
            .then((data: Invoice[]) => {
                const sorted = [...data].sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                setInvoices(sorted);
                setFiltered(sorted);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        let result = invoices;

        if (search.trim() !== "") {
            const query = search.toLowerCase();
            result = result.filter(
                (inv) =>
                    inv.clientName.toLowerCase().includes(query) ||
                    inv.orders.toLowerCase().includes(query) ||
                    inv.amount.toString().includes(query) ||
                    inv.status.toLowerCase().includes(query) ||
                    new Date(inv.date).toLocaleDateString("en-US").includes(query)
            );
        }

        if (filterBy === "date") {
            result = [...result].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
        } else if (filterBy === "amount") {
            result = [...result].sort((a, b) => b.amount - a.amount);
        } else if (filterBy === "status") {
            result = [...result].sort((a, b) => a.status.localeCompare(b.status));
        }

        setFiltered(result);
    }, [search, filterBy, invoices]);

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

    const handleUpdateStatus = async (id: string, status: "pending" | "paid" | "unpaid") => {
        try {
            const res = await fetch(`/api/invoices/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            })


            if (!res.ok) {
                alert("Failed to update invoice ❌")
                return
            }


            const updatedInvoice = await res.json()


            setInvoices((prev) =>
                prev.map((inv) => (inv._id === updatedInvoice._id ? updatedInvoice : inv))
            )


            if (status === "paid") {
                await fetch("/api/transactions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: updatedInvoice.clientName,
                        type: "credit",
                        amount: updatedInvoice.amount,
                        date: updatedInvoice.date,
                        invoiceId: updatedInvoice._id,
                    }),
                })
            } else {
                const existing = await fetch("/api/transactions")
                    .then((r) => r.json())
                    .then((all: Transaction[]) =>
                        all.find((t) => t.invoiceId?._id === updatedInvoice._id)
                    )


                if (existing) {
                    await fetch(`/api/transactions/${existing._id}`, {
                        method: "DELETE",
                    })
                }
            }
        } catch (err) {
            console.error(err)
            alert("Something went wrong ❌")
        }
    }

    return (
        <div className="p-4 dark:bg-[#201E34] text-black dark:text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                <div className="flex w-full md:w-1/3 gap-2 items-center rounded-lg px-2 py-1 bg-[#F5F5F5] pl-5 dark:bg-[#282541]">
                    <LucideSearch className="w-5 h-5 text-black dark:text-white" />
                    <Input
                        placeholder="Search invoices"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="focus:ring-0 border-none dark:bg-[#282541]"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Button className="bg-[#C8EE44] text-black hover:bg-[#b5d93c] w-full sm:w-auto">
                        <Link href="/invoices/create">+ Create Invoice</Link>
                    </Button>

                    <div className="relative w-full sm:w-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
                                >
                                    <ListFilter className="w-4 h-4" />
                                    <span>
                                        {filterBy === "date"
                                            ? "By Date"
                                            : filterBy === "amount"
                                                ? "By Amount"
                                                : filterBy === "status"
                                                    ? "By Status"
                                                    : "Filters"}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-44 rounded-lg shadow-md bg-white border dark:bg-[#282541]"
                            >
                                <DropdownMenuItem onClick={() => setFilterBy("")}>
                                    Clear Filters
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterBy("date")}>
                                    By Date
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterBy("amount")}>
                                    By Amount
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterBy("status")}>
                                    By Status
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <div className="border-t border-[#F5F5F5] my-4" />

            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full border-gray-300 rounded-lg overflow-hidden">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left uppercase text-gray-400 font-normal text-sm">Name/Client</th>
                            <th className="px-4 py-2 text-left uppercase text-gray-400 font-normal text-sm">Date</th>
                            <th className="px-4 py-2 text-left uppercase text-gray-400 font-normal text-sm">Orders/Type</th>
                            <th className="px-4 py-2 text-left uppercase text-gray-400 font-normal text-sm">Amount</th>
                            <th className="px-4 py-2 text-left uppercase text-gray-400 font-normal text-sm">Status</th>
                            <th className="px-4 py-2 text-left uppercase text-gray-400 font-normal text-sm">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading
                            ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
                            : filtered.length > 0 ? (
                                filtered.map((inv) => (
                                    <tr key={inv._id} className="hover:bg-gray-50 dark:hover:bg-[#282541]">
                                        <td className="px-4 py-2">{inv.clientName}</td>
                                        <td className="px-4 py-2">{new Date(inv.date).toLocaleDateString("en-US")}</td>
                                        <td className="px-4 py-2 text-gray-500">{inv.orders}</td>
                                        <td className="px-4 py-2">
                                            {wallet ? formatCurrency(inv.amount, wallet.currency) : `$${inv.amount}`}
                                        </td>
                                        <td className="px-4 py-2">
                                            <span
                                                className={`inline-block px-3 py-1 text-sm font-medium rounded-sm 
                                                    ${inv.status === "paid"
                                                        ? "bg-green-100 text-[#29A073] dark:bg-[#1A3131]"
                                                        : inv.status === "pending"
                                                            ? "bg-orange-100 text-[#F2994A] dark:bg-[#30292F]"
                                                            : "bg-red-100 text-[#E5363D] dark:bg-[#442121]"
                                                    }`}
                                            >
                                                {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[#29A073]/10">
                                                        <MoreHorizontal className="h-4 w-4 text-[#29A073]" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-44 rounded-lg shadow-md bg-white border dark:bg-[#282541]"
                                                >
                                                    <DropdownMenuItem asChild className="dark:hover:bg-[#4a4670]">
                                                        <a href={`/invoices/${inv._id}`} className="cursor-pointer">
                                                            View Invoice
                                                        </a>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(inv._id, "paid")}>
                                                        Mark as Paid
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(inv._id, "pending")}>
                                                        Mark as Pending
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(inv._id, "unpaid")}>
                                                        Mark as Unpaid
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
                <div className="grid gap-3 md:hidden">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => <MobileSkeletonCard key={i} />)
                    ) : filtered.length > 0 ? (
                        filtered.map((inv) => (
                            <div
                                key={inv._id}
                                className="p-3 border rounded-lg bg-white dark:bg-[#282541]"
                            >
                                <div className="flex justify-between">
                                    <span className="font-semibold">{inv.clientName}</span>
                                    <span className="text-sm text-gray-500">
                                        {new Date(inv.date).toLocaleDateString("en-US")}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-gray-500">Orders:</span>
                                    <span>{inv.orders}</span>
                                </div>

                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-gray-500">Amount:</span>
                                    <span className="font-medium">
                                        {wallet ? formatCurrency(inv.amount, wallet.currency) : `$${inv.amount}`}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-gray-500">Status:</span>
                                    <span
                                        className={`px-2 py-0.5 rounded text-xs font-medium
                                                ${inv.status === "paid"
                                                ? "bg-green-100 text-[#29A073] dark:bg-[#1A3131]"
                                                : inv.status === "pending"
                                                    ? "bg-orange-100 text-[#F2994A] dark:bg-[#30292F]"
                                                    : "bg-red-100 text-[#E5363D] dark:bg-[#442121]"
                                            }`}
                                    >
                                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                                    </span>
                                </div>

                                <div className="mt-3 flex justify-end gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                                Manage
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="w-44 rounded-lg shadow-md bg-white border dark:bg-[#282541]"
                                        >
                                            <DropdownMenuItem asChild className="dark:hover:bg-[#4a4670]">
                                                <Link href={`/invoices/${inv._id}`} className="cursor-pointer">
                                                    View Invoice
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleUpdateStatus(inv._id, "paid")}
                                                className="dark:hover:bg-[#4a4670]"
                                            >
                                                Mark as Paid
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleUpdateStatus(inv._id, "pending")}
                                                className="dark:hover:bg-[#4a4670]"
                                            >
                                                Mark as Pending
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleUpdateStatus(inv._id, "unpaid")}
                                                className="dark:hover:bg-[#4a4670]"
                                            >
                                                Mark as Unpaid
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 text-gray-500">
                            No invoices yet.{" "}
                            <Link href="/invoices/create" className="text-[#29A073] hover:underline">
                                Create one
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
