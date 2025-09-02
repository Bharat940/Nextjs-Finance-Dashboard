"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronRight, Wallet, WalletMinimal } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

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

interface ChartData {
    date: string;
    income: number;
    expense: number;
}

export default function Page() {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [filter, setFilter] = useState<"7d" | "30d" | "365d">("7d");
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [walletRes, txRes, invoiceRes] = await Promise.all([
                    fetch("/api/wallets"),
                    fetch("/api/transactions"),
                    fetch("/api/invoices")
                ]);
                const walletsData = await walletRes.json();
                const txData = await txRes.json();
                const invoicesData = await invoiceRes.json();

                setWallets(walletsData);
                setTransactions(txData);
                setInvoices(invoicesData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (transactions.length === 0) return;

        const now = new Date();
        const days = filter === "7d" ? 7 : filter === "30d" ? 30 : 365;
        const start = new Date(now);
        start.setDate(now.getDate() - (days - 1));

        const normalizeDate = (date: Date) => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            return d.toISOString().split("T")[0];
        };

        const map: { [date: string]: { income: number; expense: number } } = {};
        for (let i = 0; i < days; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            map[normalizeDate(d)] = { income: 0, expense: 0 };
        }

        transactions.forEach((t) => {
            const txDate = normalizeDate(new Date(t.date));
            if (map[txDate]) {
                if (t.amount >= 0) map[txDate].income += t.amount;
                else map[txDate].expense += Math.abs(t.amount);
            }
        });

        const data = Object.entries(map).map(([date, { income, expense }]) => ({ date, income, expense }));
        setChartData(data);
    }, [transactions, filter]);

    const wallet = wallets[0];
    const upcoming = invoices.filter(inv => inv.status === "pending");

    const totalIncome = transactions.filter((t) => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const totalSpending = transactions.filter((t) => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const totalBalance = totalIncome - totalSpending;
    const totalSaved = totalBalance;

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
        <div className="flex flex-col lg:flex-row dark:bg-[#201E34] text-black dark:text-white">
            <div className="w-full lg:w-2/3 p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    <Card className="bg-[#363A3F] dark:bg-[#282541] text-white">
                        <CardContent className="flex items-center gap-4 p-5 min-h-[120px]">
                            <div className="w-10 h-10 flex items-center justify-center bg-[#4E5257] rounded-full shrink-0">
                                <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.3338 9.641V11.3577C18.3338 11.816 17.9672 12.191 17.5005 12.2077H15.8672C14.9672 12.2077 14.1422 11.5493 14.0672 10.6493C14.0172 10.1243 14.2172 9.63267 14.5672 9.291C14.8755 8.97433 15.3005 8.79102 15.7672 8.79102H17.5005C17.9672 8.80768 18.3338 9.18267 18.3338 9.641Z" fill="#C8EE44" />
                                    <path d="M17.0587 13.4584H15.867C14.2837 13.4584 12.9503 12.2667 12.817 10.7501C12.742 9.88342 13.0587 9.01675 13.692 8.40008C14.2253 7.85008 14.967 7.54175 15.767 7.54175H17.0587C17.3003 7.54175 17.5003 7.34175 17.4753 7.10008C17.292 5.07508 15.9503 3.69175 13.9587 3.45841C13.7587 3.42508 13.5503 3.41675 13.3337 3.41675H5.83366C5.60033 3.41675 5.37533 3.43341 5.15866 3.46675C3.03366 3.73341 1.66699 5.31675 1.66699 7.58342V13.4167C1.66699 15.7167 3.53366 17.5834 5.83366 17.5834H13.3337C15.667 17.5834 17.2753 16.1251 17.4753 13.9001C17.5003 13.6584 17.3003 13.4584 17.0587 13.4584ZM10.8337 8.62508H5.83366C5.49199 8.62508 5.20866 8.34175 5.20866 8.00008C5.20866 7.65842 5.49199 7.37508 5.83366 7.37508H10.8337C11.1753 7.37508 11.4587 7.65842 11.4587 8.00008C11.4587 8.34175 11.1753 8.62508 10.8337 8.62508Z" fill="#C8EE44" />
                                </svg>
                            </div>
                            <div className="flex flex-col justify-center min-w-0">
                                <p className="text-sm text-[#929EAE]">Total Balance</p>
                                {loading ? (
                                    <Skeleton className="h-6 w-28 lg:w-10 mt-2 bg-gray-200 dark:bg-[#1C1A2E]" />
                                ) : (
                                    <h2 className="font-bold mt-2 text-lg sm:text-xl lg:text-md leading-tight break-words">
                                        {wallet ? formatCurrency(wallet.balance, wallet.currency) : "$0.00"}
                                    </h2>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#F8F8F8] dark:bg-[#1C1A2E]">
                        <CardContent className="flex items-center gap-4 p-5 min-h-[120px]">
                            <div className="w-10 h-10 flex items-center justify-center text-black dark:text-white bg-[#EBE8E8] dark:bg-[#292642] rounded-full shrink-0">
                                <Wallet size={20} />
                            </div>
                            <div className="flex flex-col justify-center min-w-0">
                                <p className="text-sm text-[#929EAE]">Total Spending</p>
                                {loading ? (
                                    <Skeleton className="h-6 w-28 lg:w-10 mt-2 bg-gray-200 dark:bg-[#282541]" />
                                ) : (
                                    <h2 className="text-[#1B212D] dark:text-white font-bold mt-2 text-lg sm:text-xl lg:text-md leading-tight break-words">
                                        {wallet ? formatCurrency(totalSpending, wallet.currency) : "$0.00"}
                                    </h2>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#F8F8F8] dark:bg-[#1C1A2E]">
                        <CardContent className="flex items-center gap-4 p-5 min-h-[120px]">
                            <div className="w-10 h-10 flex items-center justify-center text-black dark:text-white bg-[#EBE8E8] dark:bg-[#292642] rounded-full shrink-0">
                                <WalletMinimal size={20} />
                            </div>
                            <div className="flex flex-col justify-center min-w-0">
                                <p className="text-sm text-[#929EAE]">Total Income</p>
                                {loading ? (
                                    <Skeleton className="h-6 w-28 lg:w-10 mt-2 bg-gray-200 dark:bg-[#282541]" />
                                ) : (
                                    <h2 className="text-[#1B212D] dark:text-white font-bold mt-2 text-lg sm:text-xl lg:text-md leading-tight break-words">
                                        {wallet ? formatCurrency(totalSaved, wallet.currency) : "$0.00"}
                                    </h2>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {loading ? (
                    <Skeleton className="w-full h-[300px] rounded-2xl bg-gray-200 dark:bg-[#282541]" />
                ) : (
                    <Card className="rounded-2xl dark:bg-[#1C1A2E]">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">
                                    Working Capital
                                </h3>
                                <Select value={filter} onValueChange={(val: "7d" | "30d" | "365d") => setFilter(val)}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Select Range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7d">Last 7 days</SelectItem>
                                        <SelectItem value="30d">Last 30 days</SelectItem>
                                        <SelectItem value="365d">Last 365 days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>


                            {transactions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[250px] sm:h-[300px] text-[#929EAE] text-sm">
                                    <p>No transactions yet to display</p>
                                    <Link
                                        href="/invoices/create"
                                        className="text-[#29A073] hover:underline mt-2"
                                    >
                                        Create a transaction
                                    </Link>
                                </div>
                            ) : (
                                <ChartContainer
                                    config={{
                                        income: { label: "Income", color: "#29A073" },
                                        expense: { label: "Expense", color: "#C8EE44" },
                                    }}
                                    className="w-full h-[250px] sm:h-[300px]"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(date) =>
                                                    new Date(date).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })
                                                }
                                            />
                                            <YAxis />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <ChartLegend content={<ChartLegendContent />} />

                                            <defs>
                                                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#29A073" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#29A073" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#C8EE44" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#C8EE44" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>

                                            <Area
                                                type="monotone"
                                                dataKey="income"
                                                stroke="#29A073"
                                                fill="url(#incomeGradient)"
                                                strokeWidth={2}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="expense"
                                                stroke="#C8EE44"
                                                fill="url(#expenseGradient)"
                                                strokeWidth={2}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>
                )}

                <Card className="dark:bg-[#1C1A2E]">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Recent Transactions</h3>
                            {loading ? <Skeleton className="w-20 h-6 bg-gray-200 dark:bg-[#282541]" /> :
                                <Link href="/transactions" className="flex items-center gap-1 text-[#29A073] text-sm font-medium hover:underline">
                                    View All <ChevronRight className="w-4 h-4" />
                                </Link>
                            }
                        </div>
                        <div className="overflow-x-auto">
                            <div className="min-w-[500px]">
                                {loading ? (
                                    <ul>
                                        {[0, 1, 2].map((i) => (
                                            <li key={i} className="py-3 grid grid-cols-4 items-center text-sm text-center">
                                                <Skeleton className="w-full h-4 col-span-4 bg-gray-200 dark:bg-[#282541]" />
                                            </li>
                                        ))}
                                    </ul>
                                ) : (<>
                                    <div className="grid grid-cols-4 font-semibold text-sm text-[#929EAE] border-b pb-2 mb-2 text-center">
                                        <span>Name/Business</span>
                                        <span>Type</span>
                                        <span>Amount</span>
                                        <span>Date</span>
                                    </div>

                                    {transactions.length > 0 ? (
                                        <ul className="divide-y divide-gray-200">
                                            {transactions.slice(0, 3).map((t) => (
                                                <li
                                                    key={t._id}
                                                    className="py-3 grid grid-cols-4 items-center text-sm text-center"
                                                >
                                                    <span className="font-medium">{t.name}</span>
                                                    <span className="text-[#929EAE]">{t.type}</span>
                                                    <span className="font-bold text-black dark:text-white">
                                                        {wallet
                                                            ? formatCurrency(Math.abs(t.amount), wallet.currency)
                                                            : `$${Math.abs(t.amount)}`}
                                                    </span>
                                                    <span className="text-[#929EAE]">
                                                        {new Date(t.date).toLocaleDateString("en-US")}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="py-6 text-center text-sm text-[#929EAE]">
                                            No transactions yet. <Link href="/invoices/create" className="text-[#29A073] hover:underline">Create one</Link>
                                        </div>
                                    )}
                                </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="w-full lg:w-1/3 p-4 sm:p-6 space-y-6">
                <div>
                    <h1 className="font-bold pb-2 text-xl">Wallet</h1>
                    <div className="relative">
                        <div className="bg-gradient-to-br from-[#4A4A49] to-[#20201F] text-white rounded-2xl p-6 h-44 dark:bg-gradient-to-br dark:from-[#2E2B4A] dark:to-[#29263F]">
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

                    <div className="mt-26">
                        <Card className="w-full dark:bg-[#201E34]">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Scheduled Transfers</h3>
                                    <Link
                                        href="/invoices"
                                        className="flex items-center gap-1 text-[#29A073] text-sm font-medium hover:underline"
                                    >
                                        View All
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>

                                {loading ? (
                                    <ul>
                                        {[0, 1, 2, 3, 4].map((i) => (
                                            <li key={i} className="py-3 flex justify-between items-center">
                                                <div className="flex flex-col gap-1">
                                                    <Skeleton className="h-4 w-32 dark:bg-[#292642]" />
                                                    <Skeleton className="h-3 w-20 dark:bg-[#292642]" />
                                                </div>
                                                <Skeleton className="h-4 w-16 dark:bg-[#292642]" />
                                            </li>
                                        ))}
                                    </ul>
                                ) : String(upcoming.length) === "0" ? (
                                    <div className="py-6 text-center text-sm text-[#929EAE]">
                                        No upcoming transfers yet. <Link href="/invoices/create" className="text-[#29A073] hover:underline">Create one</Link>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-200">
                                        {upcoming.slice(0, 5).map((inv) => (
                                            <li key={inv._id} className="py-3 flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">{inv.clientName}</p>
                                                    <p className="text-sm text-gray-500">{new Date(inv.date).toLocaleDateString()}</p>
                                                </div>
                                                <span className="font-bold text-black dark:text-white">
                                                    {wallet ? formatCurrency(inv.amount, wallet.currency) : `$${inv.amount}`}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div >
    )
}