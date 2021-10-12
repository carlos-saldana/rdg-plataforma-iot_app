//-------------------- Incluímos las librerías a emplear --------------------
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const dataSchema = new Schema({
  userId: { type: String, required: [true] },
  dId: { type: String, required: [true] },
  variable: { type: String, required: [true] },
  value: { type: Number, required: [true] },
  time: { type: Number, required: [true] }
});

//----- Pasamos de esquema a modelo -----
const Data = mongoose.model("Data", dataSchema);

//----- Exportamos -----
export default Data;
