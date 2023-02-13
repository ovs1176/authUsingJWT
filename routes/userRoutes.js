import express from "express";
const router = express.Router();
import UserController from "../controllers/userController.js";
import checkUserAuth from "../middleware/auth.js";

// Route level Middleware - to protect Route
router.use("/changepassword", checkUserAuth);
router.use("/loggeduser", checkUserAuth);

// Public Routes
router.post("/register", UserController.userRegisteration);
router.post("/sendpasswordResetEmail", UserController.sendUserPasswordResetEmail);
router.post("/userPasswordReset/:id/:token", UserController.userPasswordReset);
router.post("/login", UserController.userLogin);

// Protected Routes (Only accessable when logged in)...
router.post("/changepassword", UserController.changePassword);
router.get("/loggeduser", UserController.loggedUser);

export default router;
