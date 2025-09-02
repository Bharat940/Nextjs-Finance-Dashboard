import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";
import Wallet from "@/models/wallet.model"
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectToDb();

        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const wallet = await Wallet.findOne({ _id: params.id, user: user.id });
        if (!wallet) {
            return NextResponse.json("Wallet not found", { status: 404 });
        }

        return NextResponse.json(wallet);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectToDb();

        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = req.json();
        const wallet = await Wallet.findOneAndUpdate(
            { _id: params.id, user: user.id },
            body,
            { new: true }
        );
        if (!wallet) {
            return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
        }

        return NextResponse.json(wallet)
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectToDb();

        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const wallet = await Wallet.findOneAndDelete({ _id: params.id, user: user.id });
        if (!wallet) {
            return NextResponse.json("Wallet not found", { status: 404 });
        }

        return NextResponse.json({ message: "Wallet deleted" });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}