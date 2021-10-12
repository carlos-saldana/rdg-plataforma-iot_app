//-------------------- Incluímos las librerías a emplear --------------------
import mongoose from 'mongoose';
//---------------------------------------------------------------------------

const Schema = mongoose.Schema;

//----- Por cada regla creada en emqx grabamos los siguiente parámetros -----
const saverRuleSchema = new Schema({
    userId: {type: String, required: [true]},       //userId de quien creó el dispositivo
    dId: { type: String, required: [true] },        //id del dispositivo
    emqxRuleId: { type: String, required: [true] }, //ID de la regla dado por emqx
    status:  { type: Boolean, required: [true] }    //estado de la regla
});

//---------- Pasamos de schema a model ----------
const SaverRule = mongoose.model('SaverRule', saverRuleSchema);

//----- Exportamos -----
export default SaverRule;  