//-------------------- Incluímos las librerías a emplear --------------------
import mongoose from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');
//---------------------------------------------------------------------------

const Schema = mongoose.Schema;

//---------- Esquema de un usuario en MongoDB ----------
const userSchema = new Schema({
    name: {
        type: String,
        required: [true] //Dato que se requiere si o si
    },
    email: {
        type: String,
        required: [true],
        unique: true     //Dato único
    },
    password: {
        type: String,
        required: [true]
    }
});
//------------------------------------------------------

//---------- Validamos si ya existe el email ----------
userSchema.plugin(uniqueValidator,{
    message: "¡Error! El email ya existe."
});

//---------- Pasamos de schema a model ----------
const User = mongoose.model('User', userSchema);

//----- Exportamos -----
export default User;