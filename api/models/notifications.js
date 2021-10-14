//-------------------- Incluímos las librerías a emplear --------------------
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    
    userId: { type: String, required: [true] },
    dId: { type: String, required: [true] },
    payload: { type: Object },
    emqxRuleId: { type: String, required: [true] },
    topic: { type: String, required: [true] },
    value: { type: Number, required: [true] },
    condition: { type: String, required: [true] },
    variable: { type: String, required: [true] },
    readed: {type: Boolean, required: [true]},
    time: {type: Number, required: [true]}

});

//---------- Pasamos de schema a model ----------
const Notification = mongoose.model('Notification', notificationSchema);

//----- Exportamos -----
export default Notification;  