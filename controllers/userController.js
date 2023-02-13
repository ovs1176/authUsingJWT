import UserModel from "../model/User.js";
import bcrpyt from "bcrypt"; // for register...
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt' // for login...
import transporter from "../config/emailconfig.js";


class userController {
    static userRegisteration = async (req, res) => {
        const { name, email, password, password_confirmation, role } = req.body;
        const user = await UserModel.findOne({ email: email });
        if (user) {
            res.send({ "status": "failed", "message": "Email already exists" })
        } else {
            if (name && email && password && password_confirmation && role) {
                if (password === password_confirmation) {
                    try {
                        // generating salt
                        const salt = await bcrpyt.genSalt(10);
                        // making hash password using salt...
                        const hashPassword = await bcrpyt.hash(password, salt);
                        const doc = new UserModel({
                            name, email, password: hashPassword, role
                        })

                        const saved = await doc.save();
                        // Generating JWT Token
                        const token = jwt.sign({ userID: saved._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5m' });

                        res.send({ "status": "Success", "message": "Registration Success", "Data Saved": saved, "token": token });

                    } catch (error) {
                        res.send({ "status": "error", "message": "Some error occured while storing data into database. ", "Error Message": error })
                    }
                }
                else {
                    res.send({ "status": "failed", "message": "password and confirm password does not match." })
                }
            }
            else {
                res.send({ "status": "failed", "message": "All fields are required." })
            }
        }
    }


    // for login user or admin
    static userLogin = async (req, res) => {
        const { email, password } = req.body;

        if (email && password) {
            const user = await UserModel.findOne({ email });
            if (user) {
                const result = await bcrypt.compare(password, user.password);
                if (result) {
                    // Generating JWT Token 
                    const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5m' });

                    res.send({ "status": "Success", "message": "Login Success", "token": token });
                }
                else {
                    res.send({ "status": "failed", "message": "password not matched" })
                }
            } 
            else {
                res.send({ "status": "failed", "message": "Not a Valid Email." });
            }
        }
        else {
            res.send({ "status": "failed", "message": "Both the fields are required." });
        }

    }


    // changing password when user is already authenticated...
    static changePassword = async (req, res) => {
        const { password, password_confirmation } = req.body;

        if (password && password_confirmation) {

            if (password_confirmation === password) {
                // generating salt
                const salt = await bcrpyt.genSalt(10);
                // making hash password using salt...
                const hashPassword = await bcrpyt.hash(password, salt);

                await UserModel.findByIdAndUpdate(req.user._id, { $set: { password: hashPassword } });
                res.send({ "status": "Success", "message": "Password changed successfully." });

            } else {
                res.send({ "status": "failed", "message": "password and confirm password does not match." });
            }
        }
        else {
            res.send({ "status": "failed", "message": "Both the fields are required." });
        }

    }

    static loggedUser = async (req, res) => {
        res.send({ "user": req.user });
    }

    static sendUserPasswordResetEmail = async (req, res) => {
        const { email } = req.body;
        if (email) {
            const user = await UserModel.findOne({ email });
            if (user) {
                const secret = user._id + process.env.JWT_SECRET_KEY;
                const token = jwt.sign({ userID: user._id }, secret, { expiresIn: "5m" });
                const link = `http://localhost:8000/api/user/userPasswordReset/${user._id}/${token}`;
                console.log(link)

                let info = await transporter.sendMail({
                    from : process.env.EMAIL_FROM,
                    to : user.email,
                    subject : `password reset link from ${process.env.EMAIL_FROM}`,
                    html : `<a href=${link}> Click here </a> to reset your Password.`, 
                });
                // console.log("+++++++++++++", info);
                res.send({ "status": "Email sent", "message": `Password reset link sent successfully to ${user.email}` , "link" : link, "info" : info });
            }
            else {
                res.send({ "status": "failed", "message": "User with this email does not exist. " });
            }
        }
        else {
            res.send({ "status": "failed", "message": "email field is required. " });
        }
    }


    static userPasswordReset = async (req, res) => {
        const { password, password_confirmation } = req.body;
        const { id, token } = req.params;
        const user = await UserModel.findById(id);
        const new_secret = user._id + process.env.JWT_SECRET_KEY;
        try {
            jwt.verify(token, new_secret);
            if (password && password_confirmation) {
                if (password === password_confirmation) {
                    const salt = await bcrypt.genSalt(10);
                    const newHash = await bcrypt.hash(password, salt);
                    await UserModel.findByIdAndUpdate(user._id, { $set: { password: newHash } });
                    res.send({ "status": "success", "message": "Password reset successfully. " });
                }
                else {
                    res.send({ "status ": "Failed", "message": "new password and confirm password does not matched. " })
                }
            }
            else {
                res.send({ "status": "Failed", "message": "both the field is required ." })
            }
        }
        catch (error) {
            res.send({ "status": "Failed", "message": "Some internal error occured. " })
        }
    }


}

export default userController;