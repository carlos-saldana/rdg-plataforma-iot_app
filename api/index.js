//-------------------- Incluímos las librerías a emplear --------------------
const express = require("express");   //Framework de Node, manejo de peticiones HTTP
const mongoose = require("mongoose"); //Ayuda a la conexión con MongoDB
const morgan = require("morgan");     //Agrega información en la terminal
const cors = require("cors");         //Políticas de acceso
const colors = require("colors");     //Agregar color a lo impreso en la terminal
//---------------------------------------------------------------------------

//----- Variables de entorno -----
require('dotenv').config();

const app = express();

//-------------------- Configuración de express --------------------
app.use(morgan("tiny")); //Indica cuando alguien golpea un endpoint
app.use(express.json()); //Uso de JSON en express
app.use(
    express.urlencoded({ //Pasamos los parámetros de express a JSON
    extended: true
}));

app.use(cors());
//------------------------------------------------------------------


//-------------------- Rutas de express --------------------
app.use("/api", require("./routes/devices.js"));
app.use("/api", require("./routes/users.js"));
app.use("/api", require("./routes/templates.js"));
app.use("/api", require("./routes/webhooks.js"));
app.use("/api", require("./routes/emqxapi.js"));
app.use("/api", require("./routes/dataprovider.js"));

//IMPORTANTE: Todos los endpoints tendrán el prefijo /api/
//----------------------------------------------------------

//---------- Exportamos nuestra configuración express como módulo ----------
module.exports = app;

//-------------------- Listener --------------------
app.listen(process.env.API_PORT, () => {
    console.log("¡API server listener escuchando por el puerto " + process.env.API_PORT + "!");
});
//--------------------------------------------------



//--------------------------------------------------------------------
//------------------------- MONGO CONNECTION -------------------------
//--------------------------------------------------------------------
const mongoUsername = process.env.MONGO_USERNAME;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT;
const mongoDatabase = process.env.MONGO_DATABASE;

var uri = "mongodb://" + mongoUsername + ":" + mongoPassword + "@" + mongoHost + ":" + mongoPort + "/" + mongoDatabase;
console.log(uri);

//---------- Configuración base MongoDB ----------
const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    authSource: "admin"
};
//------------------------------------------------

//---------- Conexión con la base de datos MongoDB ----------
mongoose.connect(uri, options).then(() =>{
    console.log("******************************".green);
    console.log("¡CONEXIÓN EXITOSA CON MONGODB!".green);
    console.log("******************************".green);
    global.check_mqtt_superuser();

},(error) =>{
    console.log(error);
    console.log("****************************".red);
    console.log("CONEXIÓN FALLIDA CON MONGODB".red);
    console.log("****************************".red);
}

);
//-----------------------------------------------------------