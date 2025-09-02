import { Schema, model, models, Document, Types } from "mongoose";

export interface IWallet extends Document {
    user: Types.ObjectId;
    balance: number;
    currency: string;
}

const WalletSchema = new Schema<IWallet>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    balance: {
        type: Number,
        default: 0,
    },
    currency: {
        type: String,
        default: "USD"
    },
}, { timestamps: true });

export default models.Wallet || model<IWallet>("Wallet", WalletSchema);