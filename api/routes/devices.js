//-------------------- Incluímos las librerías a emplear --------------------
const express = require("express");
const router = express.Router();
const colors = require("colors");
const axios = require("axios");

//---------- Esta ruta requiere autenticación ----------
const {checkAuth} = require("../middlewares/authentication.js");

//---------- Importamos los modelos a usar ----------
import Device from "../models/device.js";
import SaverRule from "../models/emqx_saver_rule.js";
import Template from '../models/template.js';
import AlarmRule from '../models/emqx_alarm_rule.js';
import EmqxAuthRule from "../models/emqx_auth.js";


//***************************************************************************************
//**************************************** A P I ****************************************
//***************************************************************************************

//----- Credenciales para la autenticación -----
const auth = {
    auth: {
        username: "admin",
        password: process.env.EMQX_DEFAULT_APPLICATION_SECRET
    }
};
//----------------------------------------------



//-------------------------------------------------------------
//-------------------- OBTENER DISPOSITIVO --------------------
//-------------------------------------------------------------
router.get("/device", checkAuth, async (req, res) =>{
    
    //----- BUSCAMOS EN BASE DE DATOS Y DEVOLVEMOS LO QUE SE CONSIGUE -----
    /*
    {
        "newDevice":{
            "dId": "121212",
            "name": "Home",
            "templateName": "esp32 tempalte",
            "templateId": "asdfgh"
        }
    }
    */

   try {

       const userId = req.userData._id; //Obtenemos el userId
       
       //----- Encontramos todos los dispositivos con el userId indicado -----
       var devices = await Device.find({userId: userId});
       //----- Método del desacople (Array JavaScript)-----
       devices = JSON.parse(JSON.stringify(devices));

       //-------------------------------------------------
       //----- FUNCIÓN - GET SAVER RULES Y TEMPLATES -----
       //-------------------------------------------------

       // devices va a ser modificado por getSaverRules
       const saverRules = await getSaverRules(userId);

       // Obtenemos los templates
       const templates = await getTemplates(userId);

       // Obtenemos las alarm rules
       const alarmRules = await getAlarmRules(userId);

       //----- Recorremos dispositivos 1 por 1 -----
       devices.forEach((device, index) => {
           //----- Anidamos saverRule - [0] permite obtener un objeto y no un array -----
           devices[index].saverRule = saverRules.filter(saverRule => saverRule.dId == device.dId)[0];
           //----- Anidamos template -----
           devices[index].template = templates.filter(template => template._id == device.templateId)[0];
           //----- Anidamos alarmas -----
           devices[index].alarmRule = alarmRules.filter(alarmRule => alarmRule.dId == device.dId)
        });

       //----- Devolvemos los dispositivos encontrados -----
       const response = {
           status: "success",
           data: devices
        };
    
        res.json(response);
       
   } catch (error) {
       console.log(error);
       console.log("************************************".red);
       console.log("***** ERROR EN GETTING DEVICES *****".red);
       console.log("************************************".red);

       const response = {
           status: "error",
           error: error
       };

       return res.status(500).json(response);
   }
    
});
//-------------------------------------------------------------
//-------------------------------------------------------------
//-------------------------------------------------------------


//-----------------------------------------------------------
//-------------------- CREAR DISPOSITIVO --------------------
//-----------------------------------------------------------
router.post("/device", checkAuth, async (req, res) =>{

    try {
        const userId = req.userData._id;    //Obtenemos el userId
        var newDevice = req.body.newDevice; //Obtenemos la data de newDevice

        newDevice.userId = userId;          //Agregamos el userId
        newDevice.createdTime = Date.now(); //Fecha actual

        //----- Generamos password al objeto device -----
        newDevice.password = makeid(10)

        //-----------------------------------------------------
        //----- FUNCIONES - LLAMAMOS A LAS REGLAS CREADAS -----
        //-----------------------------------------------------
                // userId -> Device id
                // true -> La regla empieza encendida
        await createSaverRule(userId, newDevice.dId, true);

        //----- Guardamos el dispositivo con todos sus datos en MongoDB -----
        const device = await Device.create(newDevice);

        //----- Selecciona el dispositivo agregado -----
        await selectDevice(userId, newDevice.dId);

        //----- await nos permite obtener la respuesta y no una promesa -----

        const response = {
            status: "success"
        };

        res.json(response);
        
    } catch (error) {
        console.log(error);
        console.log("*************************************".red);
        console.log("***** ERROR CREATING NEW DEVICE *****".red);
        console.log("*************************************".red);

        const response = {
            status: "error",
            error: error
        };

        return res.status(500).json(response);   
    }
});
//-----------------------------------------------------------
//-----------------------------------------------------------
//-----------------------------------------------------------


//--------------------------------------------------------------
//-------------------- ELIMINAR DISPOSITIVO --------------------
//--------------------------------------------------------------
router.delete("/device", checkAuth, async (req, res) =>{
    
    //----- Los datos vienen por query -----
    try {
        const userId = req.userData._id; //Obtenemos el userId
        const dId = req.query.dId;       //Obtenemos el dId

        //---------------------------------------
        //----- FUNCIÓN - DELETE SAVER RULE -----
        //---------------------------------------
        await deleteSaverRule(dId);

        //await deleteMqttDeviceCredentials(dId);

        //----- Eliminamos el dispositivo y guardamos el resultado -----
        const result = await Device.deleteOne({userId: userId, dId: dId});
        
        //----- Dispositivos después de delete -----
        const devices = await Device.find({ userId: userId });
        
        // Recordatorio: Device es nuestro modelo

        if (devices.length >= 1) {
            // ¿Hay algún dispositivo seleccionado?
            var found = false;
            devices.forEach(devices => {
              if (devices.selected == true) {
                found = true;
              }
            });
      
            // Seleccionamos un dispositivo
            if (!found) {
              await Device.updateMany({ userId: userId }, { selected: false });
              await Device.updateOne(
                { userId: userId, dId: devices[0].dId },
                { selected: true }
              );
            }
          }

        const response = {
            status: "success",
            data: result
        };
        return res.json(response);

    } catch (error) {

        console.log(error);
        console.log("*************************".red);
        console.log("ERROR EN DELETING DEVICES".red);
        console.log("*************************".red);
        
        const response = {
           status: "error",
           error: error
        };
       return res.status(500).json(response);
    }
});
//--------------------------------------------------------------
//--------------------------------------------------------------
//--------------------------------------------------------------


//-----------------------------------------------------------------
//-------------------- SELECCIONAR DISPOSITIVO --------------------
//-----------------------------------------------------------------
router.put("/device", checkAuth, async (req, res) =>{
    try {
        //----- Los datos vienen por body -----
        const dId = req.body.dId;        //Obtenemos el dId
        const userId = req.userData._id; //Obtenemos el userId

        if (await selectDevice(userId, dId)){
            const response = {
                status: "success",
            };
            return res.json(response);

        }else{
            const response = {
                status: "error",
                error: error
            };
            return res.status(500).json(response);
        }
        
    } catch (error) {
        console.log(error);
        
    }

});
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------


//----- SAVER-RULE STATUS UPDATER -----
router.put('/saver-rule', checkAuth, async (req, res) => {
    try {
        // Recibimos la copia de regla alterada
        const rule = req.body.rule;
        console.log(rule);
    
        await updateSaverRuleStatus(rule.emqxRuleId, rule.status);
    
        const response = {
            status: "success"
        };
    
        res.json(response);
        
    } catch (error) {
        console.log(error);
    }

    
});
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------


//***************************************************************************************************
//**************************************** F U N C I O N E S ****************************************
//***************************************************************************************************


async function selectDevice(userId, dId){
    
    try {
        //----- Ponemos en false todos los dispositivos -----
        const result = await Device.updateMany({userId: userId}, {selected: false});
        
        //----- Colocamos en true el dispositivo seleccionado -----
        const result2 = await Device.updateOne({dId: dId, userId: userId}, {selected: true});

        return true;

    } catch (error) {
        console.log(error);
        console.log("********************************".red);
        console.log("ERROR IN 'selectDevice' FUNCTION".red);
        console.log("********************************".red);
        return false;
    }
}


//--------------- GET TEMPLATES ---------------
async function getTemplates(userId) {
    try {
      const templates = await Template.find({ userId: userId });
      return templates;
    } catch (error) {
      return false;
    }
} 
//---------------------------------------------


//--------------- GET ALARM RULES ---------------
async function getAlarmRules(userId) {

    try {
        const rules = await AlarmRule.find({ userId: userId });
        return rules;
    } catch (error) {
        return "error";
    }
}
//-----------------------------------------------


//--------------- GET SAVER RULE ---------------
async function getSaverRules(userId) {
    
    try {
        //----- Obtenemos las reglas pertenencientes al userId -----
        const rules = await SaverRule.find({ userId: userId });
        return rules;

    } catch (error) {
        return false;
    }
}
//----------------------------------------------


//--------------- CREATE SAVER RULE ---------------
async function createSaverRule(userId, dId, status) {

    try {
        const url = "http://" + process.env.EMQX_API_HOST + ":8085/api/v4/rules";
  
        //----- Nos enfocamos en un solo dispositivo -----
        const topic = userId + "/" + dId + "/+/sdata";
    
        //----- SQL plano - consulta -----
        const rawsql = 'SELECT topic, payload FROM "' + topic + '" WHERE payload.save = 1';
    
        var newRule = {
            rawsql: rawsql, //----- Consulta -----
            actions: [
                {
                    name: "data_to_webserver",
                    params: {
                        $resource: global.saverResource.id, //----- Id del recurso a usar -----
                        //----- Payload Template -----
                        payload_tmpl: '{"userId":"' +  userId + '","payload":${payload},"topic":"${topic}"}'
                    }
                }
            ],
            description: "SAVER-RULE",
            enabled: status
        };
    
        //----- Grabamos la regla en emqx -----
        const res = await axios.post(url, newRule, auth);
    
        if(res.status === 200 && res.data.data){

            //----- Grabamos la regla en MongoDB -----
            await SaverRule.create({
                userId: userId,
                dId: dId,
                emqxRuleId: res.data.data.id,
                status: status
            });
            return true;

        }else{
            return false;
        }
        
    } catch (error) {
        console.log("*************************************".red);
        console.log("***** Error creando saver rules *****".red);
        console.log("*************************************".red);
        console.log(error);
        return false;
        
    }
  
}
//-------------------------------------------------


//--------------- UPDATE SAVER RULE ---------------
async function updateSaverRuleStatus(emqxRuleId, status) {

    try {
        //----- Llamamos a la API de emqx -----
        const url = "http://" + process.env.EMQX_API_HOST + ":8085/api/v4/rules/" + emqxRuleId;
    
        //----- Objeto donde guardaremos el estado de la regla -----
        const newRule = {
            enabled: status
        };
    
        const res = await axios.put(url, newRule, auth);
    
        if (res.status === 200 && res.data.data) {
            await SaverRule.updateOne({ emqxRuleId: emqxRuleId }, { status: status });
            
            console.log("***************************************".green);
            console.log("***** SAVER RULE STATUS UPDATE... *****".green);
            console.log("***************************************".green);
            return true;

        }else{
            return false;
        }
        
    } catch (error) {
        return false;
        
    }
}
//-------------------------------------------------


//--------------- DELETE SAVER RULE ---------------
async function deleteSaverRule(dId) {
    
    try {

        //----- Buscamos por dId la regla en MongoDB -----
        const mongoRule = await SaverRule.findOne({ dId: dId });
        
        //----- Obtenemos el dId -----
        const url = "http://" + process.env.EMQX_API_HOST + ":8085/api/v4/rules/" + mongoRule.emqxRuleId;
        
        //----- Eliminamos la regla -----
        const emqxRule = await axios.delete(url, auth);
        
        //----- Eliminamos la regla en MongoDB -----
        const deleted = await SaverRule.deleteOne({ dId: dId });
        
        return true;
    
    } catch (error) {

        console.log("*************************************".red);
        console.log("***** ERROR DELETING SAVER RULE *****".red);
        console.log("*************************************".red);
        console.log(error);
        return false;
    }
}
//-------------------------------------------------


async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}

/*
//--------------- DELETE EMQX CREDENTIALS ---------------
async function deleteMqttDeviceCredentials(dId) {
    try {
      await EmqxAuthRule.deleteMany({ dId: dId, type: "device" });
  
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
}
//-------------------------------------------------------
*/

function makeid(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}



//----- Exportamos -----
module.exports = router;



//alguien golpea el endpoint y lo mandamos al checkAuth
//llamamos a authetication

//LAS FUNCIONES ASYNC DEVUELVEN PROMESAS

//localhost:3001/api/device -> [array de todos los dispositivos]
//localhost:3001/api/device?Id=asd465q4 -> {devuelve todos los objetos de este único dispositivo}