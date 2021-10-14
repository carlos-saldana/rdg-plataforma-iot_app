//-------------------- Incluímos las librerías a emplear --------------------
const express = require("express");
const router = express.Router();
const axios = require("axios");
const colors = require("colors");

const { checkAuth } = require("../middlewares/authentication.js");

var mqtt = require("mqtt");

//---------- Importamos nuestros modelos ----------
import Data from "../models/data.js";
import Device from "../models/device.js";
import EmqxAuthRule from "../models/emqx_auth.js";
import Notification from "../models/notifications.js";
import AlarmRule from "../models/emqx_alarm_rule.js";
import Template from "../models/template.js";

//*********************************************
//******************** API ********************
//*********************************************

var client;

//---------- DEVICE CREDENTIALS WEBHOOK ----------
router.post("/getdevicecredentials", async (req, res) => {
  try {
    console.log(req.body);
  
    // Capturamos el dId
    const dId = req.body.dId;

    //----- Rescatamos el password -----
    const password = req.body.password;
  
    // Adquirimos el userId
    const device = await Device.findOne({ dId: dId });

    //----- Evaluamos la password del dispositivo -----
    if (password != device.password){
        return res.status(401).json();
    }
  
    const userId = device.userId;
  
    var credentials = await getDeviceMqttCredentials(dId, userId);
  
    var template = await Template.findOne({ _id: device.templateId });
    console.log(template);

    var variables = [];
  
    // Recorremos widget por widget
    template.widgets.forEach(widget => {
      
      //--- Filtramos los campos de interés ---
      var v = (({variable, variableFullName, variableType, variableSendFreq }) => ({
        variable,
        variableFullName,
        variableType,
        variableSendFreq
      }))(widget);
  
      variables.push(v);
    });
  
    const response = {
      username: credentials.username,
      password: credentials.password,
      topic: userId + "/" + dId + "/",
      variables: variables
    };
    
    console.log(response);
    res.json(response);
  
    //----- Tiempo que damos a nuestra plaquita para conectarse -----
    setTimeout(() => {
      getDeviceMqttCredentials(dId, userId);
      console.log("Device Credentials Updated");
    }, 10000);
    //---------------------------------------------------------------
    
  } catch (error) {
    console.log("ERROR EN ROUTER getdevicecredentials, webhooks.js".red);
    console.log(error);
    
  }
    
});
//------------------------------------------------

//---------- SAVER WEBHOOK ----------
//----- Espera que emqx pase información -----
router.post('/saver-webhook', async (req, res) =>{

    try {
        // Este token se encuentra en los detalles de los recursos emqx
        if (req.headers.token != process.env.EMQX_API_TOKEN){
            req.sendStatus(404); // Código de error
            return; // Terminamos la ejecución
        }
        const data = req.body;
        
        const splittedTopic = data.topic.split("/"); // Separador
        const dId = splittedTopic[1]; // Posición del id en el tópico entrante
        const variable = splittedTopic[2];
        
        // Verificamos si existe el dispositivo
        var result = await Device.find({dId: dId, userId: data.userId});
     
        // Si encontramos un dispositivo
        if (result.length == 1){
            // Creamos la base de datos en MongoDB
            Data.create({
                userId: data.userId,
                dId: dId,
                variable: variable,
                value: data.payload.value,
                time: Date.now()
            })
            console.log("¡Base de datos creada!".blue);
        }
        res.sendStatus(200);    
        
    } catch (error) {
        console.log(error);
        res.sendStatus(200);
    }

});
//-----------------------------------

//---------- ALARM WEBHOOK ----------
router.post("/alarm-webhook", async (req, res) => {
  try {
      //----- Verificamos el token -----
      if (req.headers.token != "121212") {
        req.sendStatus(404);
        return;
      }
      res.sendStatus(200);

      //---------- COMUNICACIÓN: API - EMQX - FRONTEND ----------
      const incomingAlarm = req.body;
      
      //---------- Contador de notificaciones alarms ----------
      updateAlarmCounter(incomingAlarm.emqxRuleId);

      //----- Obtenemos la última notificación -----
      const lastNotif = await Notification.find({ dId: incomingAlarm.dId, emqxRuleId: incomingAlarm.emqxRuleId }).sort({ time: -1 }).limit(1);

      //----- Primera notificación -----
      if (lastNotif == 0){
        console.log("----- CONDICIÓN ROTA Y PRIMERA ALARMA GRABADA EN MONGODB -----".blue);
        //----- Grabamos directamente en MongoDB -----
        saveNotifToMongo(incomingAlarm);
        sendMqttNotif(incomingAlarm);
      }else{
        //----- Obtenemos el tiempo transcurrido entre las notificaciones (min)-----
        const lastNotifToNowMins = ( Date.now() - lastNotif[0].time ) / 1000 / 60;

        //----- Si superamos el Trigger introducido -----
        if (lastNotifToNowMins > incomingAlarm.triggerTime){
            console.log("----- CONDICIÓN ROTA Y ALARMA GRABADA EN MONGODB -----".blue);
            //----- Grabamos en MongoDB una notificación nueva -----
            saveNotifToMongo(incomingAlarm);
            sendMqttNotif(incomingAlarm);
        }

      }
      
  } catch (error) {
    console.log(error);
    res.sendStatus(200);
  }

});
//-----------------------------------


//***************************************************
//******************** FUNCTIONS ********************
//***************************************************

async function getDeviceMqttCredentials(dId, userId) {
    try {
      //----- Buscamos si el dispositivo ya tiene una regla de autenticación -----
      var rule = await EmqxAuthRule.find({
        type: "device",
        userId: userId,
        dId: dId
      });
  
      //----- Creamos una regla nueva -----
      if (rule.length == 0) {
        const newRule = {
          userId: userId,
          dId: dId,
          username: makeid(10),
          password: makeid(10),
          publish: [userId + "/" + dId + "/+/sdata"],
          subscribe: [userId + "/" + dId + "/+/actdata"],
          type: "device",
          time: Date.now(),
          updatedTime: Date.now()
        };
  
        const result = await EmqxAuthRule.create(newRule);
  
        const toReturn = {
          username: result.username,
          password: result.password
        };
  
        return toReturn;
      }
  
      //--- Si la regla existe solo cambiamos usuario y contraseña ---
      const newUserName = makeid(10);
      const newPassword = makeid(10);
  
      const result = await EmqxAuthRule.updateOne(
        { type: "device", dId: dId },
        {
          $set: {
            username: newUserName,
            password: newPassword,
            updatedTime: Date.now()
          }
        }
      );
  
      // update response example
      //{ n: 1, nModified: 1, ok: 1 }
  
      if (result.n == 1 && result.ok == 1) {
        return {
          username: newUserName,
          password: newPassword
        };
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
}



//---------------------------------------------
//---------- CLIENTE MQTT EN EL BACK ----------
//---------------------------------------------
function startMqttClient() {
  const options = {
    port: 1883,
    host: process.env.EMQX_NODE_HOST,
    clientId: "webhook_superuser" + Math.round(Math.random() * (0 - 10000) * -1),
    username: process.env.EMQX_NODE_SUPERUSER_USER,
    password: process.env.EMQX_NODE_SUPERUSER_PASSWORD,
    keepalive: 60,
    reconnectPeriod: 5000,
    protocolId: "MQIsdp",
    protocolVersion: 3,
    clean: true,
    encoding: "utf8"
  };

  //----- Iniciamos conexión NodeJS to Broker -----
  client = mqtt.connect("mqtt://" + process.env.EMQX_NODE_HOST, options);

  //---- Ocurre la conexión -----
  client.on("connect", function() {
    console.log("****************************".green);
    console.log(" MQTT CONNECTION -> SUCCESS ".green);
    console.log("****************************".green);
    console.log("\n");
  });

  //----- Reconexión por algún error -----
  client.on("reconnect", error => {
    console.log("RECONNECTING MQTT...".blue);
    console.log(error);
  });

  //----- Error en la conexión -----
  client.on("error", error => {
    console.log("*************************".red);
    console.log(" MQTT CONNECIONT -> FAIL ".red);
    console.log("*************************".red);
    console.log(error);
  });
}

function sendMqttNotif(notif){
  const topic = notif.userId + '/dummy-did/dummy-var/notif';
  const msg = 'The rule: when the ' + notif.variableFullName + ' is ' + notif.condition + ' than ' + notif.value;
  client.publish(topic, msg);
}
//---------------------------------------------
//---------------------------------------------
//---------------------------------------------



function saveNotifToMongo(incomingAlarm) {
  var newNotif = incomingAlarm;
  newNotif.time = Date.now();
  newNotif.readed = false;
  Notification.create(newNotif);

}

async function updateAlarmCounter(emqxRuleId) {
  try {
    await AlarmRule.update({ emqxRuleId: emqxRuleId }, { $inc: { counter: 1 } });
  } catch (error) {
    console.log(error)
  }
}

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

setTimeout(() => {
  startMqttClient();
}, 3000);


//----- Exportamos -----
module.exports = router;
