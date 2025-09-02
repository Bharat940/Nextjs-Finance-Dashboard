import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";
import Invoice from "@/models/invoice.model";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
    try {
        await connectToDb();

        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const invoices = await Invoice.find({ user: user.id });
        return NextResponse.json(invoices);
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
        const invoice = new Invoice({ ...body, user: user.id });
        await invoice.save();

        return NextResponse.json(invoice, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}