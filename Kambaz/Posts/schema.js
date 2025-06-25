import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        _id: String,
        type: String,
        summary: String,
        user: {type: String, ref: "UserModel"},
        userRole: String,
        content: String,
        courseId: String,
        folders: [String],
        postToAll: Boolean,
        postTo: [String],
        dateTime: Date,
        responses: [String],
        readBy: [String]
    },
    {collection: "posts"}
);
export default schema;