import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";
import Wallet from "@/models/wallet.model";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
    try {
        await connectToDb();

        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const wallets = await Wallet.find({ user: user.id });
        return NextResponse.json(wallets)
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectToDb();

        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const wallet = new Wallet({ ...body, user: user.id });
        await wallet.save();
        
        return NextResponse.json(wallet, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}       