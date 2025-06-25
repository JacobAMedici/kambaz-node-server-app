import mongoose from "mongoose";
import schema from "./schema.js";
const model = mongoose.model("FoldersSchema", schema);
export default model;