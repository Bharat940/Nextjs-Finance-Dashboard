"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, CalendarDays, User, DollarSign } from "lucide-react"
import { useRequireWalletRedirect } from "@/lib/walletRedirect"

interface Invoice {
    _id: string
    clientName: string
    orders: string
    amount: number
    date: string
    status: "pending" | "paid" | "unpaid"
}

export default function Page() {
    const { id } = useParams()
    const [invoice, setInvoice] = useState<Invoice | null>(null)
    const [loading, setLoading] = useState(true)

    useRequireWalletRedirect();

    useEffect(() => {
        if (!id) return
        fetch(`/api/invoices/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setInvoice(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [id])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="h-7 w-7 animate-spin text-[#29A073]" />
                <span className="ml-3 text-[#29A073] text-lg font-medium">Loading invoice...</span>
            </div>
        )
    }

    if (!invoice) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Card className="border border-red-200 bg-red-50/80 shadow-md rounded-xl p-6 text-center">
                    <CardTitle className="text-red-600 text-lg">Invoice not found</CardTitle>
                    <p className="text-sm text-red-500 mt-2">Please check the invoice ID and try again.</p>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Card className="shadow-xl rounded-2xl border-none overflow-hidden dark:bg-[#201E34] text-black dark:text-white">
                <CardHeader className="bg-[#29A073] text-white rounded-t-2xl">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5" /> Invoice #{invoice._id.slice(-6).toUpperCase()}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-5 p-6 text-sm">
                    <div className="flex justify-between border-b pb-2">
                        <span className="flex items-center gap-2 text-gray-600"><User className="h-4 w-4" /> Client</span>
                        <span className="font-medium dark:text-gray-50">{invoice.clientName}</span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                        <span className="flex items-center gap-2 text-gray-600"><FileText className="h-4 w-4" /> Orders</span>
                        <span className="font-medium dark:text-gray-50">{invoice.orders}</span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                        <span className="flex items-center gap-2 text-gray-600"><DollarSign className="h-4 w-4" /> Amount</span>
                        <span className="text-[#29A073] font-bold">₹{invoice.amount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                        <span className="flex items-center gap-2 text-gray-600"><CalendarDays className="h-4 w-4" /> Date</span>
                        <span className="font-medium dark:text-gray-50">{new Date(invoice.date).toLocaleDateString("en-US")}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Status</span>
                        <Badge
                            className={`rounded-full px-3 py-1 text-xs 
                ${invoice.status === "paid" && "bg-[#29A073] text-white"} 
                ${invoice.status === "pending" && "bg-[#C8EE44] text-[#1a1a1a]"} 
                ${invoice.status === "unpaid" && "bg-[#f87171] text-white"}`}
                        >
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
