import { NextResponse, NextRequest } from "next/server";
import { connectToDb } from "@/lib/mongodb";
import Wallet from "@/models/wallet.model";
import { getCurrentUser } from "@/lib/getCurrentUser";

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Context) {
    try {
        await connectToDb();

        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;
        const wallet = await Wallet.findOne({ _id: id, user: user.id });

        if (!wallet) {
            return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
        }

        return NextResponse.json(wallet);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, context: Context) {
    try {
        await connectToDb();

        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;
        const body = await req.json();

        const wallet = await Wallet.findOneAndUpdate(
            { _id: id, user: user.id },
            body,
            { new: true }
        );

        if (!wallet) {
            return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
        }

        return NextResponse.json(wallet);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: Context) {
    try {
        await connectToDb();

        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;
        const wallet = await Wallet.findOneAndDelete({ _id: id, user: user.id });

        if (!wallet) {
            return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Wallet deleted" });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
