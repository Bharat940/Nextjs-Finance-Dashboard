import { Schema, model, models, Document, Types } from "mongoose";

export interface IInvoice extends Document {
    user: Types.ObjectId;
    clientName: string;
    date: Date;
    orders: string;
    amount: number;
    status: "pending" | "paid" | "unpaid";
}

const InvoiceSchema = new Schema<IInvoice>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    clientName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    orders: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "paid", "unpaid"],
        default: "pending"
    }
}, { timestamps: true });

const InvoiceModel = models.Invoice || model<IInvoice>("Invoice", InvoiceSchema);
export default InvoiceModel;