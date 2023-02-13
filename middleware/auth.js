import jwt from "jsonwebtoken";
import UserModel from "../model/User.js";
import userModel from "../model/User.js";

var checkUserAuth = async (req, res, next) => { 
    let token; 
    const { authorization } = req.headers; 
    if (authorization && authorization.startsWith('Bearer')) { 
        try { 
            token = authorization.split(' ')[1]; 
 
            // verify token 
            const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY); 

            // Get user from token... 
            req.user = await UserModel.findById(userID).select("-password"); 
            console.log(req.user._id);
            next(); 
        } catch (error) {
            console.log(error);
            res.send({"status": "Failed" , "message" : "Unauthorized User"});
        }
    }
    if(!token){
        res.status(401).send({"status" : "failed", "message" : "Unauthorized User, No Token. "});
    }
}



export default checkUserAuth;