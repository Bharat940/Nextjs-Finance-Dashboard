import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";
import Transaction from "@/models/transaction.model";
import Wallet from "@/models/wallet.model";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
    try {
        await connectToDb();

        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const transactions = await Transaction.find({ user: user.id }).populate("invoiceId");
        return NextResponse.json(transactions);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectToDb();

        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const transaction = new Transaction({ ...body, user: user.id });
        await transaction.save();

        const wallet = await Wallet.findOne({ user: user.id });
        if (wallet) {
            wallet.balance += transaction.amount;
            await wallet.save();
        }

        return NextResponse.json(transaction, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}