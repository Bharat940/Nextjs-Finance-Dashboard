"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Wallet {
    _id: string
    balance: number
    currency: string
}

interface Item {
    clientName: string;
    order: string;
    rate: number;
    amount: number;
}

export default function Page() {
    const [items, setItems] = useState<Item[]>([
        { clientName: "", order: "", rate: 0, amount: 0, }
    ]);
    const [status, setStatus] = useState<"pending" | "paid" | "unpaid">("pending");
    const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [loading, setLoading] = useState(false);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    useEffect(() => {
        fetch("/api/wallets").then(r => r.json()).then(setWallets);
    }, []);
    const wallet = wallets[0];

    const total = items.reduce((sum, i) => sum + i.amount, 0);

    const handleItemChange = <K extends keyof Item>(
        index: number,
        field: K,
        value: Item[K]
    ) => {
        const newItems = [...items];
        newItems[index][field] = value;

        const orderNum = Number(newItems[index].order);

        if (!isNaN(orderNum) && field !== "amount") {
            newItems[index].amount = orderNum * newItems[index].rate;
        }

        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { clientName: "", order: "", rate: 0, amount: 0 }]);
    };


    const handleSubmit = async () => {
        setLoading(true);
        try {
            for (const item of items) {
                const invoicesRes = await fetch("/api/invoices", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        clientName: item.clientName,
                        orders: item.order,
                        amount: item.amount,
                        date: new Date(date),
                        status,
                    }),
                });

                if (!invoicesRes.ok) {
                    toast.error("Error creating invoice ❌");
                    return;
                }

                const invoice = await invoicesRes.json();

                if (status === "paid") {
                    await fetch("/api/transactions", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name: item.clientName,
                            type: item.order,
                            amount: item.amount,
                            date: new Date(date),
                            invoiceId: invoice._id,
                        }),
                    });
                }
            }

            toast.success("Invoices Created ✅", {
                description: `Total: ${wallet ? formatCurrency(total, wallet.currency) : `$${total.toFixed(2)}`}`,
            });

            setItems([{ clientName: "", order: "", rate: 0, amount: 0 }]);
            setStatus("pending");
            setDate(new Date().toISOString().split("T")[0]);
        } catch (err) {
            console.error(err);
            alert("Something went wrong ❌");
        } finally {
            setLoading(false);
        }
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
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card className="bg-[#202736] dark:bg-[#282541] text-white">
                    <CardContent className="p-6">
                        <h2 className="text-lg font-semibold">User Info</h2>
                        <p className="text-sm text-gray-400">
                            Fill in client details in the table below.
                        </p>
                    </CardContent>
                </Card>

                <Card className="dark:bg-[#282541]">
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold">Item Details</h2>
                            <p className="text-sm text-[#929EAE]">Detailed items with more info</p>
                        </div>

                        <div className="space-y-4">
                            {items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 border rounded-lg flex flex-col lg:flex-row lg:items-end lg:space-x-4 space-y-2 lg:space-y-0"
                                >
                                    <div className="flex-1">
                                        <Label className="text-[#929EAE] text-sm mb-1">Item</Label>
                                        <Input
                                            value={item.clientName}
                                            onChange={(e) =>
                                                handleItemChange(idx, "clientName", e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <Label className="text-[#929EAE] text-sm mb-1">Orders/Type</Label>
                                        <Input
                                            value={item.order}
                                            onChange={(e) => handleItemChange(idx, "order", e.target.value)}
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <Label className="text-[#929EAE] text-sm mb-1">Rate</Label>
                                        <Input
                                            type="number"
                                            value={item.rate}
                                            onChange={(e) =>
                                                handleItemChange(idx, "rate", Number(e.target.value))
                                            }
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <Label className="text-[#929EAE] text-sm mb-1">Amount</Label>
                                        <Input
                                            type="number"
                                            value={item.amount}
                                            onChange={(e) =>
                                                handleItemChange(idx, "amount", Number(e.target.value))
                                            }
                                        />
                                    </div>

                                    <div className="mt-2 lg:mt-0">
                                        <Button
                                            variant="destructive"
                                            onClick={() => setItems(items.filter((_, i) => i !== idx))}
                                            className="self-start w-full lg:w-auto"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button
                            onClick={addItem}
                            className="text-[#29A073] bg-transparent hover:bg-transparent"
                        >
                            Add Item
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
                <Card className="dark:bg-[#282541]">
                    <CardContent className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold">Invoice Details</h2>

                        <div>
                            <Label className="mb-2 text-[#929EAE]">
                                {status === "paid" ? "Invoice Date" : "Due Date"}
                            </Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label className="mb-2 text-[#929EAE] ">Status</Label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as "pending" | "paid" | "unpaid")}
                                className="w-full border rounded-lg p-2 bg-white text-black dark:bg-[#282541] dark:text-white"
                            >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </div>

                        <div className="text-lg font-semibold">
                            Total: {wallet ? formatCurrency(total, wallet.currency) : `$${total.toFixed(2)}`}
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-[#C8EE44] text-black hover:bg-transparent dark:hover:text-white"
                        >
                            {loading ? "Saving..." : "Create Invoice"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}