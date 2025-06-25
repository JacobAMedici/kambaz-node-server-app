import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        _id: String,
        name: String,
        cid: String
    },
    {collection: "folders"}
);
export default schema;