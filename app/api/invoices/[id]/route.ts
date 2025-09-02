import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";
import Invoice from "@/models/invoice.model";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDb();
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const invoice = await Invoice.findOne({ _id: id, user: user.id });

        if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

        return NextResponse.json(invoice);
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

        const invoice = await Invoice.findOneAndUpdate(
            { _id: id, user: user.id },
            body,
            { new: true }
        );

        if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

        return NextResponse.json(invoice);
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
        const deletedInvoice = await Invoice.findOneAndDelete({ _id: id, user: user.id });

        if (!deletedInvoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

        return NextResponse.json({ message: "Invoice deleted" });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
