//User Models and schemas

import mongoose, { model, ObjectId, Types } from "mongoose";

const Schema = mongoose.Schema;

//User Schema and model
interface IUser {
    username: string;
    password: string;
}

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },

        password: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const UserModel = model<IUser>("User", userSchema);

//Content Schema and model

const ContentTypes = ["image", "audio", "video", "article"];

interface IContent {
    link: string;
    type: (typeof ContentTypes)[number];
    title: string;
    tags: ObjectId[];
    userId: ObjectId;
}

const contentSchema = new Schema<IContent>({
    link: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ContentTypes,
    },
    title: {
        type: String,
        required: true,
    },
    tags: [
        {
            type: Types.ObjectId,
            ref: "Tags",
        },
    ],
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
        validate: async function (value) {
            const user = await UserModel.findById(value);
            if (!user) {
                throw new Error("User does not exist");
            }
        },
    },
});

export const ContentModel = model<IContent>("Content", contentSchema);

//Tags Schema and model

interface ITags {
    title: string;
}

const tagsSchema = new Schema<ITags>({
    title: {
        type: String,
        required: true,
    },
});

export const TagsModel = model<ITags>("Tags", tagsSchema);

//Link Schema and model

interface ILink {
    hash: string;
    userId: ObjectId;
}

const linkSchema = new Schema<ILink>({
    hash: {
        type: String,
        required: true,
    },
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
});

export const LinkModel = model<ILink>("Link", linkSchema);
