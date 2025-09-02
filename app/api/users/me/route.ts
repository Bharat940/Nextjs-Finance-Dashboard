import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";
import User from "@/models/user.model";
import { getCurrentUser } from "@/lib/getCurrentUser";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        await connectToDb();

        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const me = await User.findById(user.id).select("-password");

        const [firstName = "", ...lastParts] = me.name.split(" ");
        const lastName = lastParts.join(" ");

        return NextResponse.json({
            ...me.toObject(),
            firstName,
            lastName,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
export async function PUT(req: Request) {
    try {
        await connectToDb();

        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json();
        const updateData = {
            ...body,
            name: `${body.firstName || ""} ${body.lastName || ""}`.trim(),
        }
        delete updateData.firstName;
        delete updateData.lastName;
        delete updateData.confirmPassword;

        if (body.password) {
            updateData.password = await bcrypt.hash(body.password, 10);
        }

        const updated = await User.findByIdAndUpdate(user.id, updateData, { new: true }).select("-password");

        const [firstName = "", ...lastParts] = updated.name.split(" ")
        const lastName = lastParts.join(" ")

        return NextResponse.json({
            ...updated.toObject(),
            firstName,
            lastName,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
export async function DELETE() {
    try {
        await connectToDb();

        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await User.findByIdAndDelete(user.id);
        return NextResponse.json({ message: "Account deleted" });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}