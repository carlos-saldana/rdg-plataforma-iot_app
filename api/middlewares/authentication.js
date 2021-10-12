//-------------------- Incluímos las librerías a emplear --------------------
const jwt = require("jsonwebtoken");

let checkAuth = (req, res, next) =>{

    let token = req.get('token'); //Obtenemos un token
    
    //----- Verificamos el token -----
    jwt.verify(token, "securePasswordHere", (err, decoded) =>{
        
        if (err){
            return res.status(401).json({
                status: "error",
                error: err
            });
        }
        
        //----- "Desencriptamos" los datos almacenados en el token -----
        req.userData = decoded.userData; //Obtenemos todo lo que está en req

        next();
    });
};

//----- Exportamos -----
module.exports = {checkAuth};