import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string || "mongodb://localhost:27017/maglo";


if (!MONGODB_URI) {
    throw new Error("No Connection string to the mongodb");
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}

export async function connectToDb() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            dbName: "finance-dashboard",
        }).then((mongoose) => mongoose);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}