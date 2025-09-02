import { Schema, model, models, Document, Types } from "mongoose";
import "./invoice.model";

export interface ITransaction extends Document {
    user: Types.ObjectId;
    name: string;
    type: string;
    amount: number;
    date: Date;
    invoiceId?: Types.ObjectId;
}

const TransactionSchema = new Schema<ITransaction>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    },
    invoiceId: {
        type: Schema.Types.ObjectId,
        ref: "Invoice"
    }
}, { timestamps: true });

const TransactionModel = models.Transaction || model<ITransaction>("Transaction", TransactionSchema);
export default TransactionModel;
