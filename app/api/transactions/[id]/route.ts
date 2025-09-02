import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";
import Transaction from "@/models/transaction.model";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDb();
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const transaction = await Transaction.findOne({ _id: id, user: user.id }).populate("invoiceId");

        if (!transaction) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

        return NextResponse.json(transaction);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDb();
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await req.json();

        const transaction = await Transaction.findOneAndUpdate(
            { _id: id, user: user.id },
            body,
            { new: true }
        );

        if (!transaction) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

        return NextResponse.json(transaction);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDb();
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const deletedTransaction = await Transaction.findOneAndDelete({ _id: id, user: user.id });

        if (!deletedTransaction) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

        return NextResponse.json({ message: "Transaction deleted" });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
