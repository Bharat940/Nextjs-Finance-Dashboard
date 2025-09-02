"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Receipt, CalendarDays, User, DollarSign, FileText } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface Transaction {
    _id: string
    name: string
    type: string
    amount: number
    date: string
    invoiceId?: { _id?: string; status?: string }
}

interface ApiError {
    error: string
}


export default function Page() {
    const { id } = useParams()
    const [transaction, setTransaction] = useState<Transaction | ApiError | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return
        fetch(`/api/transactions/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setTransaction(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="h-7 w-7 animate-spin text-[#29A073]" />
                <span className="ml-3 text-[#29A073] text-lg font-medium">Loading transaction...</span>
            </div>
        )
    }

    if (!transaction || "error" in transaction) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Card className="border border-red-200 bg-red-50/80 shadow-md rounded-xl p-6 text-center">
                    <CardTitle className="text-red-600 text-lg">Transaction not found</CardTitle>
                    <p className="text-sm text-red-500 mt-2">Please check the transaction ID and try again.</p>
                </Card>
            </div>
        )
    }

    const status = transaction.invoiceId?.status?.toLowerCase() || "n/a"

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Card className="shadow-xl rounded-2xl overflow-hidden border-none dark:bg-[#201E34] text-black dark:text-white">
                <CardHeader className="bg-[#29A073] text-white rounded-t-2xl">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Receipt className="h-5 w-5" /> Transaction #{transaction._id.slice(-6).toUpperCase()}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-5 p-6 text-sm">
                    <div className="flex justify-between border-b pb-2">
                        <span className="flex items-center gap-2 text-gray-600"><User className="h-4 w-4" /> Name / Business</span>
                        <span className="font-medium dark:text-gray-50">{transaction.name}</span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                        <span className="flex items-center gap-2 text-gray-600"><FileText className="h-4 w-4" /> Type</span>
                        <Badge className="rounded-full px-3 py-1 text-xs bg-[#C8EE44] text-[#1a1a1a]">
                            {transaction.type}
                        </Badge>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                        <span className="flex items-center gap-2 text-gray-600"><DollarSign className="h-4 w-4" /> Amount</span>
                        <span className="text-[#29A073] font-bold">₹{transaction.amount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                        <span className="flex items-center gap-2 text-gray-600"><CalendarDays className="h-4 w-4" /> Date</span>
                        <span className="font-medium dark:text-gray-50">{new Date(transaction.date).toLocaleDateString("en-US")}</span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                        <span className="flex items-center gap-2 text-gray-600"><Receipt className="h-4 w-4" /> Invoice ID</span>
                        <span className="font-mono text-sm dark:text-gray-50">
                            <span className="font-mono text-sm dark:text-gray-50">
                                {transaction.invoiceId?._id}
                            </span>
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Status</span>
                        <Badge
                            className={`rounded-full px-3 py-1 text-xs 
                                ${status === "paid" && "bg-[#29A073] text-white"} 
                                ${status === "pending" && "bg-[#C8EE44] text-[#1a1a1a]"} 
                                ${status === "unpaid" && "bg-[#f87171] text-white"} 
                                ${status === "n/a" && "bg-gray-400 text-white"}`}
                        >
                            {status === "n/a" ? "N/A" : status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
