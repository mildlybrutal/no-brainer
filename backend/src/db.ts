//User Models and schemas

import mongoose, { model } from "mongoose";

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
//User Schema and model
interface IUser {
    username: string;
    password: string;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },
});

export const UserModel = model<IUser>("User", userSchema);

interface Content {
    link: String;
    type: String | Enumerator;
    title: String;
    tags: String;
    userId: String;
}
