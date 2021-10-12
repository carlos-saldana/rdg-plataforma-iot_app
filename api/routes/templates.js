//----- Creación de endpoints -----
const express = require('express');
const router = express.Router();

//----- Validamos si el usuario puede acceder -----
const { checkAuth } = require('../middlewares/authentication.js');

//----- Importamos el modelo -----
import Template from '../models/template.js';
import Device from '../models/device.js';


//-----------------------------------
//---------- GET TEMPLATES ----------
//-----------------------------------
router.get('/template', checkAuth, async (req, res) => {

    try {

        const userId = req.userData._id;

        //----- Filtramos los templates por userId -----
        const templates = await Template.find({userId: userId});

        //----- Revisamos las respuestas -----
        console.log(userId);
        console.log(templates);

        //----- Respuesta -----
        const response = {
            status: "success",
            data: templates
        }

        return res.json(response); //----- Devolvemos como JSON -----

    } catch (error) {

        console.log(error);

        const response = {
            status: "error",
            error: error
        }

        return res.status(500).json(response);

    }

});
//-----------------------------------
//-----------------------------------
//-----------------------------------



//--------------------------------------
//---------- CREATE TEMPLATES ----------
//--------------------------------------
// Grabamos en DB el template mandado por el frontend
router.post('/template', checkAuth, async (req, res) => {

    try {

        const userId = req.userData._id;

        var newTemplate = req.body.template;

        //----- Guardamos el userId rescatado del token -----
        newTemplate.userId = userId;
        newTemplate.createdTime = Date.now(); // Hora

        const r = await Template.create(newTemplate); // Guardamos el template

        const response = {
            status: "success",
        }

        return res.json(response)

    } catch (error) {

        console.log(error);

        const response = {
            status: "error",
            error: error
        }

        return res.status(500).json(response);

    }

});
//--------------------------------------
//--------------------------------------
//--------------------------------------



//--------------------------------------
//---------- DELETE TEMPLATES ----------
//--------------------------------------
router.delete('/template', checkAuth, async (req, res) => {

    try {

        const userId = req.userData._id; // UserId obtenido del token
        const templateId = req.query.templateId;  // Obtenemos templateId de templates.vue

        //----- Buscamos si hay algún dispositivo tiene la plantilla a eliminar -----
        const devices = await Device.find({userId: userId, templateId: templateId });

        if (devices.length > 0){

            const response = {
                status: "fail",
                error: "template in use"
            }
    
            return res.json(response);
        }
        //---------------------------------------------------------------------------

        const r = await Template.deleteOne({userId: userId, _id: templateId});

        const response = {
            status: "success",
        }

        return res.json(response)

    } catch (error) {

        console.log(error);

        const response = {
            status: "error",
            error: error
        }

        return res.status(500).json(response);

    }

});
//--------------------------------------
//--------------------------------------
//--------------------------------------

module.exports = router;