//-------------------- Incluímos las librerías a emplear --------------------
import mongoose from 'mongoose';
//---------------------------------------------------------------------------

const Schema = mongoose.Schema;

//---------- Esquema/Modelo de una plantilla ----------
const templateSchema = new Schema({
    userId: { type: String, required: [true] },
    name: { type: String, required: [true] },
    description: {type: String},
    createdTime: { type: Number, required: [true] },
    widgets: {type: Array, default: []}
});
//-----------------------------------------------------

//---------- Pasamos de schema a model ----------
const Template = mongoose.model('Template', templateSchema);

//----- Exportamos -----
export default Template;
