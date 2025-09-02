import { Schema, model, models, Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    dob?: Date;
    mobile?: string;
}

const UserSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    dob: {
        type: Date,
    },
    mobile: {
        type: String,
    }
}, { timestamps: true });

export default models.User || model<IUser>("User", UserSchema);