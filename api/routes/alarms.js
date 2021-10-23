//-------------------- Incluímos las librerías a emplear --------------------
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { checkAuth } = require('../middlewares/authentication.js');
const colors = require('colors');

import AlarmRule from '../models/emqx_alarm_rule.js';

//----- Autenticación para conectarnos a la API de Emqx -----
const auth = {
    auth: {
        username: 'admin',
        password: process.env.EMQX_DEFAULT_APPLICATION_SECRET
    }
};

//*******************************************************************
//****************************** A P I ******************************
//*******************************************************************

//----------------------------------------------
//---------- Creamos una nueva alarma ----------
//----------------------------------------------
router.post('/alarm-rule', checkAuth, async (req, res) => {

    //--- Regla a crear ---
    var newRule = req.body.newRule;
    newRule.userId = req.userData._id;

    //--- Creamos la nueva regla ---
    var r = await createAlarmRule(newRule);

    if (r) {
        const response = {
            status: "success",
        }
        return res.json(response);

    } else {
        const response = {
            status: "error",
        }
        return res.status(500).json(response);
    }

});
//----------------------------------------------
//----------------------------------------------
//----------------------------------------------


//--------------------------------------------
//---------- Actualizamos la alarma ----------
//--------------------------------------------
router.put('/alarm-rule', checkAuth, async (req, res) => {


    var rule = req.body.rule;

    var r = await updateAlarmRuleStatus(rule.emqxRuleId, rule.status);

    if (r == true) {

        const response = {
            status: "success",
        }

        return res.json(response);

    } else {
        const response = {
            status: "error",
        }

        return res.json(response);
    }

});
//--------------------------------------------
//--------------------------------------------
//--------------------------------------------


//------------------------------------------
//---------- Eliminamos la alarma ----------
//------------------------------------------
router.delete('/alarm-rule', checkAuth, async (req, res) => {

    var emqxRuleId = req.query.emqxRuleId;
    var r = await deleteAlarmRule(emqxRuleId);

    if (r ) {
        const response = {
            status: "success",
        }
        return res.json(response);

    } else {
        const response = {
            status: "error",
        }
        return res.json(response);
    }

});
//------------------------------------------
//------------------------------------------
//------------------------------------------



//*******************************************************************************
//****************************** F U N C T I O N S ******************************
//*******************************************************************************

//-------------------------------------
//---------- CREATE NEW RULE ----------
//-------------------------------------
async function createAlarmRule(newAlarm) {

    const url = "http://" + process.env.EMQX_API_HOST + ":8085/api/v4/rules";

    // topicExample = userid/did/temp  //msgExample = {value: 20}
    const topic = newAlarm.userId + "/" + newAlarm.dId + "/" + newAlarm.variable + "/sdata";

    //----- Consulta EMQX -----
    const rawsql = "SELECT username, topic, payload FROM \"" + topic + "\" WHERE payload.value "  + newAlarm.condition + " " + newAlarm.value + " AND is_not_null(payload.value)";

    //----- Objeto a enviar a EMQX para crear la regla -----
    var newRule = {
        rawsql: rawsql,
        actions: [{
            name: "data_to_webserver",
            params: {
                $resource: global.alarmResource.id,
                payload_tmpl: '{"userId":"' + newAlarm.userId + '","payload":${payload},"topic":"${topic}"}'
            }
        }],
        description: "ALARM-RULE",
        enabled: newAlarm.status
    }

    //----- Guardamos la regla en Emqx -----
    const res = await axios.post(url, newRule, auth);
    var emqxRuleId = res.data.data.id;
    console.log(res.data.data);

    //----- Si todo sale bien -----
    if (res.data.data && res.status === 200) {

        //----- Grabamos la regla en MongoDB -----
        //--- Objeto a pasar to MongoDB ---
        const mongoRule = await AlarmRule.create({
            userId: newAlarm.userId,
            dId: newAlarm.dId,
            emqxRuleId: emqxRuleId,
            status: newAlarm.status,
            variable: newAlarm.variable,
            variableFullName: newAlarm.variableFullName,
            value: newAlarm.value,
            condition: newAlarm.condition,
            triggerTime: newAlarm.triggerTime,
            createTime: Date.now()
        });

        const url = "http://" + process.env.EMQX_API_HOST + ":8085/api/v4/rules/" + mongoRule.emqxRuleId;

        //----- Incormoramos la regla a payload_template -----
        const payload_templ = '{"userId":"' + newAlarm.userId + '","dId":"' + newAlarm.dId + '","payload":${payload},"topic":"${topic}","emqxRuleId":"' + mongoRule.emqxRuleId + '","value":' + newAlarm.value + ',"condition":"' + newAlarm.condition + '","variable":"' + newAlarm.variable + '","variableFullName":"' + newAlarm.variableFullName + '","triggerTime":' + newAlarm.triggerTime + '}';
        newRule.actions[0].params.payload_tmpl = payload_templ;

        //----- Actualizamos la regla -----
        const res = await axios.put(url, newRule, auth);

        console.log("*************************************".green);
        console.log("***** ¡NUEVA ALARM RULE CREADA! *****".green);
        console.log("*************************************".green);
        return true;
    }
}
//-------------------------------------
//-------------------------------------
//-------------------------------------


//-----------------------------------------
//---------- UPDATE ALARM STATUS ----------
//-----------------------------------------
async function updateAlarmRuleStatus(emqxRuleId, status) {

    const url = "http://" + process.env.EMQX_API_HOST + ":8085/api/v4/rules/" + emqxRuleId;

    //--- Recibimos el nuevo estado ---
    const newRule = {
        enabled: status
    }

    const res = await axios.put(url, newRule, auth);

    if (res.data.data && res.status === 200) {

        await AlarmRule.updateOne({ emqxRuleId: emqxRuleId }, { status: status });
        console.log("Saver Rule Status Updated...".green);
        return true;
    }

}
//-----------------------------------------
//-----------------------------------------
//-----------------------------------------


//-------------------------------------
//---------- DELETE ONE RULE ----------
//-------------------------------------
async function deleteAlarmRule(emqxRuleId) {
    try {

        const url = "http://" + process.env.EMQX_API_HOST + ":8085/api/v4/rules/" + emqxRuleId;
        const emqxRule = await axios.delete(url, auth);
        const deleted = await AlarmRule.deleteOne({ emqxRuleId: emqxRuleId });
        
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}
//-------------------------------------
//-------------------------------------
//-------------------------------------


//----- Exportamos -----
module.exports = router;