import mongoose from "mongoose";
import schema from "./schema.js";
const model = mongoose.model("PiazzaSchema", schema);
export default model;