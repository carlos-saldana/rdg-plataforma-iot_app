//-------------------- Incluímos las librerías a emplear --------------------
const express = require('express');
const router = express.Router();
const axios = require('axios');
const colors = require('colors');

import EmqxAuthRule from "../models/emqx_auth.js";

//----- Credenciales para la API de emqx -----
const auth = {
    auth: {
        username: "admin",
        password: process.env.EMQX_DEFAULT_APPLICATION_SECRET
    }
};

//----- Variables globales -----
global.saverResource = null;
global.alarmResource = null;
//Acá guardamos información de los recursos (id)
//------------------------------


// ********************************************
// ********** EMQX RESOURCES MANAGER **********
// ********************************************

//---------------------------------------------------------------------
//---------- Llamamos al API de emqx y listamos los recursos ----------
//---------------------------------------------------------------------
async function listResources() {

    try {
        const url = "http://" + process.env.EMQX_API_HOST + ":8085/api/v4/resources/";

        const res = await axios.get(url, auth);

        //----- Capturamos el tamaño del array entrante -----
        const size = res.data.data.length;


        if (res.status === 200){
            //----- Si no encontramos ningún recurso -----
            if (size == 0){
                console.log("*******************************************".blue);
                console.log("***** Creating emqx webhook resources *****".blue);
                console.log("*******************************************".blue);

                createResources();
            }else if (size == 2){
                
                //----- Recorremos recurso por recurso -----
                res.data.data.forEach(resource => {

                    //----- Si el recurso es alarm-webhook -----
                    if(resource.description == "alarm-webhook"){
                        
                        //----- Guardamos el recurso encontrado -----
                        global.alarmResource = resource;

                        console.log("********************************".blue);
                        console.log("***** ALARM RESOURCE FOUND *****".blue);
                        console.log("********************************".blue);
                        console.log(global.alarmResource);
                    }

                    //----- Si el recurso es saver-webhook -----
                    if(resource.description == "saver-webhook"){
                        
                        //----- Guardamos el recurso encontrado -----
                        global.saverResource = resource;

                        console.log("********************************".blue);
                        console.log("***** SAVER RESOURCE FOUND *****".blue);
                        console.log("********************************".blue);
                        console.log(global.saverResource);
                    }

                });
            }else{

                //----- Si encontramos más recursos, debemos eliminar y reiniciar todo -----
                function printWarning() {
                    console.log("*****************************************************************".red);
                    console.log("***** DELETE ALL WEBHOOK EMQX RESOURCES AND RESTART NODEMON *****".red);
                    console.log("*****************************************************************".red);
                    
                    setTimeout(() => {
                        printWarning();
                    }, 1000);
                }
                
                printWarning();
            }
        }else{
            console.log("***********************************".red);
            console.log("***** Error en la API de emqx *****".red);
            console.log("***********************************".red);
        }
    
    } catch (error) {
        console.log("********************************************".red);
        console.log("***** Error listando los recursos emqx *****".red);
        console.log("********************************************".red);
        console.log(error);
    }

}


//---------------------------------------------------------------------
//-------------------- Función para crear recursos --------------------
//---------------------------------------------------------------------
async function createResources() {

    try {
        //----- endpoint a impactar para crear el recurso -----
        const url = "http://" + process.env.EMQX_API_HOST + ":8085/api/v4/resources";

        //----- Creamos el recurso saver-webhook -----
        const data1 = {
            "type": "web_hook", //----- Resource type -----
            "config": {
                //----- Request url -----
                url: "http://" + process.env.EMQX_API_HOST + ":3001/api/saver-webhook",
                //----- Request Header -----
                headers: {
                    token: process.env.EMQX_API_TOKEN
                },
                method: "POST" //----- Request method -----
            },
            description: "saver-webhook"
        }
        //--------------------------------------------
    
        //----- Creamos el recurso alarm-webhook -----
        const data2 = {
            "type": "web_hook",
            "config": {
                url: "http://" + process.env.WEBHOOKS_HOST + ":3001/api/alarm-webhook",
                headers: {
                    token: process.env.EMQX_API_TOKEN
                },
                method: "POST"
            },
            description: "alarm-webhook"
        }
        //--------------------------------------------
    
        const res1 = await axios.post(url, data1, auth);
    
        if (res1.status === 200){
            console.log("****************************************".green);
            console.log("***** Recurso saver-webhook creado *****".green);
            console.log("****************************************".green);
        }
    
        const res2 = await axios.post(url, data2, auth);
    
        if (res2.status === 200){
            console.log("****************************************".green);
            console.log("***** Recurso alarm-webhook creado *****".green);
            console.log("****************************************".green);
        }
    
        setTimeout(() => {
            console.log("***************************************".green);
            console.log("***** Webhook creado exitosamente *****".green);
            console.log("***************************************".green);

            listResources();
        }, 1000);
    } catch (error) {
        console.log("***********************************************".red);
        console.log("***** Error creando recursos - emqxapi.js *****".red);
        console.log("***********************************************".red);
        console.log(error);
    }

}


//---------------------------------------------------------------
//---------- CREAMOS UN SUPERUSUARIO SI ESTE NO EXISTE ----------
//---------------------------------------------------------------
global.check_mqtt_superuser = async function checkMqttSuperUser(){

    try {
      const superusers = await EmqxAuthRule.find({type:"superuser"});
  
      if (superusers.length > 0 ) {
    
        return;
    
      }else if ( superusers.length == 0 ) {
    
        await EmqxAuthRule.create(
          {
            publish: ["#"],
            subscribe: ["#"],
            userId: "emqxmqttsuperuser",
            username: process.env.EMQX_NODE_SUPERUSER_USER,
            password: process.env.EMQX_NODE_SUPERUSER_PASSWORD,
            type: "superuser",
            time: Date.now(),
            updatedTime: Date.now()
          }
        );
        
        console.log("**********************************".green);
        console.log("***** Mqtt superuser created *****".green);
        console.log("**********************************".green);
    
      }
    } catch (error) {
        console.log("*****************************************".red);
        console.log("***** Error creating mqtt superuser *****".red);
        console.log("*****************************************".red);
        console.log(error);
    }
}
//---------------------------------------------------------------
//---------------------------------------------------------------
//---------------------------------------------------------------


//----- Retardo de 1s para llamar a la función -----
setTimeout(() => {
    listResources();
}, process.env.EMQX_RESOURCES_DELAY);


//----- Exportamos -----
module.exports = router;