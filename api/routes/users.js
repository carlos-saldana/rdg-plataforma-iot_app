//-------------------- Incluímos las librerías a emplear --------------------
const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { checkAuth } = require('../middlewares/authentication.js');
//---------------------------------------------------------------------------

//-------------------- Importamos los modelos a usar --------------------
import User from '../models/user.js';
//import EmqxAuthRule from "../models/emqx_auth.js";
//-----------------------------------------------------------------------

//POST -> req.body
//GET -> req.query

//-----------------------------------------------------------------------------
//------------------------- REGISTRO DE NUEVO USUARIO -------------------------
//-----------------------------------------------------------------------------

router.post("/register", async (req, res) =>{
    
    try{
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        //---------- Encriptamos la contraseña 10 veces ----------
        const encryptedPasword = bcrypt.hashSync(password, 10);

        const newUser = {
            name: name,
            email: email,
            password: encryptedPasword,
        };

        var user = await User.create(newUser);
        console.log(user);

        //----- Mensaje para corroborar -----
        const response = {
            status: "success",
        };

        res.json(response); //Envíamos el JSON (status 200 ímplicito)

    } catch(error){

        console.log(error);
        console.log("********************************".red);
        console.log("ERROR EN EL REGISTRO DEL USUARIO".red);
        console.log("********************************".red);

        //----- Enviamos el error y verificamos en POST -----
        const response = {
            status: "error",
            error: error
        };

        res.status(500).json(response); //Error (status 500 - estándar)
        
    }

});
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------



//--------------------------------------------------------------------
//------------------------- LOGIN DE USUARIO -------------------------
//--------------------------------------------------------------------

router.post("/login", async (req, res) =>{

    const email = req.body.email;       //Capturamos el email
    const password = req.body.password; //Capturamos el password sin encriptar

    //---------- Encontramos el usuario ----------
    var user = await User.findOne({email: email});
    //--------------------------------------------

    //---------- DATOS INCORRECTOS ----------
    if(!user){
        const response = {
            status: "error",
            error: "Credenciales inválidas"
        }
        
        return res.status(401).json(response);        
    };


    //---------- VERIFICACIÓN DE EMAIL Y PASSWORD ----------
    if (bcrypt.compareSync(password, user.password)){       //Comparamos las contraseñas

        user.set("password", undefined, {strict: false});   //Borramos el password

        //Pasamos los datos al token, se obtiene una firma única para el usuario
        //({data}, 'firma única', {tiempo de caducidad (segundos)})
        const token = jwt.sign({userData: user}, 'securePasswordHere', {expiresIn: 60*60*24*30});

        const response = {
            status: "success",
            token: token,
            userData: user
        };

        return res.json(response);

    }else{

        const response = {
            status: "error",
            error: "Credenciales inválidas"
        };
        return res.status(500).json(response);
    }
});
//--------------------------------------------------------------------
//--------------------------------------------------------------------
//--------------------------------------------------------------------


//-------------------- E M Q X   I N S E G U R O --------------------

/*
//----------------------------------------------------------------------------
//------------------------- GET MQTT WEB CREDENTIALS -------------------------
//----------------------------------------------------------------------------
router.post("/getmqttcredentials", checkAuth,  async (req, res) => {

    try {
        const userId = req.userData._id;
        //----- Obtenemos las credenciales -----
        const credentials = await getWebUserMqttCredentials(userId);

        const toSend = {
            status: "success",
            username: credentials.username,
            password: credentials.password
        }
        //------ Devolvemos las credenciales -----
        res.json(toSend);

        //----- Esperamos 5 segundos y rompemos las credenciales -----
        setTimeout(() => {
            //----- Generamos nuevas credenciales que NO SIRVEN para despistar -----
            getWebUserMqttCredentials(userId);
        }, 15000);

        //----- Terminamos la función -----
        return
  
    } catch (error) {
        console.log("**************************************************************".red);
        console.log("***** ERROR - router.post(/getmqttcredentials), users.js *****".red);
        console.log("**************************************************************".red);
        console.log(error);
  
        const toSend = {
            status: "error"
        };
        return res.status(500).json(toSend);
    }
  
});



//----------------------------------------------------------------------------
//------------------------- GET MQTT WEB CREDENTIALS -------------------------
//----------------------------------------------------------------------------
router.post("/getmqttcredentialsforreconnection", checkAuth, async (req, res) =>{
    const userId = req.userData._id;
    const credentials = await getWebUserMqttCredentialsForReconnection(userId);

    const toSend = {
        status: "success",
        username: credentials.username,
        password: credentials.password
    }

    console.log(toSend);
    res.json(toSend);

    setTimeout(() => {
        getWebUserMqttCredentials(userId);
    }, 15000);

});



//---------------------------------------------------
//-------------------- FUNCIONES --------------------
//---------------------------------------------------
async function getWebUserMqttCredentials(userId){
    
    try {
        // Buscamos el userId del usuario
        var rule = await EmqxAuthRule.find({ type: "user", userId: userId });
        
        // Si el cliente no tiene ninguna regla
        if(rule.length == 0){
            const newRule = {
                userId: userId,
                username: makeid(10), // usuario aleatorio
                password: makeid(10), // password aleatorio
                // Solo publica y suscribe si tiene userId
                publish: [userId + "/#"],
                subscribe: [userId + "/#"],
                type: "user",
                time: Date.now(),
                updatedTime: Date.now()
            }

            //----- Creamos un registro -----
            const result = await EmqxAuthRule.create(newRule);
            
            //----- Devolvemos el siguiente objeto -----
            const toReturn = {
                username: result.username,
                password: result.password
            }
            return toReturn;
        }
        //----- Generamos nuevos usuarios y password -----
        const newUserName = makeid(10);
        const newPassword = makeid(10);
        
        //----- Actualizamos el registro -----
        const result = await EmqxAuthRule.updateOne({type:"user", userId: userId}, {$set: {username: newUserName, password: newPassword, updatedTime: Date.now()}});
  
        // respuesta de la actualización:
        // { n: 1, nModified: 1, ok: 1 }
        // Se modificó exitosamente un registro
  
        if (result.n == 1 && result.ok == 1) {
            return {
                //----- Obtenemos el nuevo usuario y password -----
                username: newUserName,
                password: newPassword
            }
        }else{
            return false; // Terminamos la ejecución
        }
  
    } catch (error) {
        console.log("****************************************************************".red);
        console.log("***** ERROR - getWebUserMqttCredentials function, users.js *****".red);
        console.log("****************************************************************".red);
        console.log(error);
        return false;
    }
  
};

async function getWebUserMqttCredentialsForReconnection(userId){
    try {
        const rule = await EmqxAuthRule.find({ type: "user", userId: userId});

        if (rule.length == 1){
            const toReturn = {
                username: rule[0].username,
                password: rule[0].password
            }
            return toReturn;
        }
        
    } catch (error) {
        console.log("***************************************************************************".red);
        console.log("*****ERROR - async getWebUserMqttCredentialsForReconnection, users.js *****".red);
        console.log("***************************************************************************".red);
        console.log(error);
        
    }

};
*/
//----- Generación de strings aleatorios -----
function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

//----- Exportamos -----
module.exports = router;


/*user crud - create remove update and delete

router.get('/new-user', async (req, res) =>{

    try{
        const user = await User.create({
            name: "Benjamin",
            email: "a@a.com",
            password: "121212"
        })
        res.json({"status": "success"})
    } catch(error){
        res.json({"status": "fail"})
    }
});
*/
