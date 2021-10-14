//-------------------- Incluímos las librerías a emplear --------------------
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const alarmRuleSchema = new Schema({
    userId: {type: String, required: [true]},
    dId: { type: String, required: [true] },
    //----- Guardamos id de la regla que tiene en Emqx -----
    emqxRuleId: { type: String, required: [true] },
    variableFullName: { type: String },
    variable: { type: String },
    value: {type: Number},
    condition:  { type: String },
    triggerTime: { type: Number },
    status:  { type: Boolean },
    //----- Cantidad de veces que la regla es disparada -----
    counter: { type: Number, default: 0},
    createdTime: {type: Number}
});

//----- Pasamos de esquema a modelo -----
const AlarmRule = mongoose.model('alarmRule', alarmRuleSchema);

//----- Exportamos -----
export default AlarmRule;  