//-------------------- Incluímos las librerías a emplear --------------------
import mongoose from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');
//---------------------------------------------------------------------------

const Schema = mongoose.Schema;

//---------- Esquema/Modelo de un dispositivo ----------
const deviceSchema = new Schema({
    userId: { type: String, required: [true] },
    dId: { type: String, unique: true, required: [true] },
    name: { type: String, required: [true] },
    password: { type: String, required: [true] },
    selected: { type: Boolean, required: [true], default: false },
    templateId: {type: String, required: [true]},
    templateName: {type: String, required: [true]},
    createdTime: { type: Number }
});
//------------------------------------------------------

//---------- Validamos si ya existe el dispositivo ----------
deviceSchema.plugin(uniqueValidator, { message: '¡Error! El dispositivo ya existe.' });

//---------- Pasamos de schema a model ----------
const Device = mongoose.model('Device', deviceSchema);

//----- Exportamos -----
export default Device; 