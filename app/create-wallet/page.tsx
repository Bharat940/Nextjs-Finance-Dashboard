"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { redirect } from "next/navigation";
import { FormEvent, useState } from "react";

export default function Page() {
    const [currency, setCurrency] = useState("USD");
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    // const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch("/api/wallets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ balance, currency }),
        });

        if (res.ok) {
            redirect("/dashboard");
        } else {
            setLoading(false);
        }
    };

    const currencies = [
        "USD", "EUR", "GBP", "INR", "JPY", "CNY", "AUD", "CAD", "CHF", "SGD",
        "NZD", "SEK", "NOK", "DKK", "RUB", "BRL", "ZAR", "HKD", "KRW", "MXN",
        "TRY", "AED", "SAR", "IDR", "THB", "MYR", "PHP", "PLN", "CZK", "HUF",
        "ILS", "ARS", "CLP", "COP", "EGP", "NGN", "PKR", "BDT", "LKR",
    ];

    const currencySymbols: Record<string, string> = {
        USD: "$", EUR: "€", GBP: "£", INR: "₹", JPY: "¥", CNY: "¥",
        AUD: "A$", CAD: "C$", CHF: "₣", SGD: "S$", NZD: "NZ$", SEK: "kr",
        NOK: "kr", DKK: "kr", RUB: "₽", BRL: "R$", ZAR: "R", HKD: "HK$",
        KRW: "₩", MXN: "MX$", TRY: "₺", AED: "د.إ", SAR: "﷼", IDR: "Rp",
        THB: "฿", MYR: "RM", PHP: "₱", PLN: "zł", CZK: "Kč", HUF: "Ft",
        ILS: "₪", ARS: "$", CLP: "$", COP: "$", EGP: "£", NGN: "₦",
        PKR: "₨", BDT: "৳", LKR: "₨",
    };

    return (
        <div className="flex items-center justify-center h-screen bg-background text-foreground">
            {loading ? (
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                    <p className="text-lg font-medium">Creating your wallet...</p>
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="bg-card text-card-foreground p-6 rounded-2xl shadow w-96 space-y-6"
                >
                    <h1 className="text-2xl font-bold text-center">Create Your Wallet</h1>

                    <div className="space-y-2">
                        <label htmlFor="currency" className="block text-sm font-medium">
                            Currency
                        </label>
                        <Select value={currency} onValueChange={(val) => setCurrency(val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Currency" />
                            </SelectTrigger>
                            <SelectContent className="max-h-64">
                                {currencies.map((cur) => (
                                    <SelectItem key={cur} value={cur}>
                                        {currencySymbols[cur] ? `${currencySymbols[cur]} ${cur}` : cur}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="balance" className="block text-sm font-medium">
                            Initial Balance
                        </label>
                        <Input
                            type="number"
                            value={balance}
                            onChange={(e) => setBalance(Number(e.target.value))}
                            placeholder="Enter Amount"
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating..." : "Create Wallet"}
                    </Button>
                </form>
            )}
        </div>
    );
}
