import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const emqxAuthRuleSchema = new Schema({
    userId: { type: String, required: [true] },
    dId: { type: String }, // Solo los dispositivos tienen dId
    username: { type: String, required: [true] },
    password: { type: String, required: [true] },
    // publish y suscribe es tipo Array, requisitos de emqx
    publish: { type: Array },
    subscribe: { type: Array },
    // Credenciales tipo "user", "device", "superuser"
    type: { type: String, required: [true] },
    time: { type: Number },
    updatedTime: { type: Number }
});

const EmqxAuthRule = mongoose.model('EmqxAuthRule', emqxAuthRuleSchema);

export default EmqxAuthRule;   