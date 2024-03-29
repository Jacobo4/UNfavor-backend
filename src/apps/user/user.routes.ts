import express, { Router } from 'express';

import UserController from './user.controller';
import validateToken from '../authenticate/validateToken.middleware';

const router: Router = express.Router();

router.get("/logout", UserController.logout);
router.post("/info", validateToken, UserController.getUser);
router.post("/matches", validateToken, UserController.matches)
router.post("/register", UserController.signup);
router.post("/login", UserController.login);
router.post("/refresh", UserController.refresh);
router.post("/createReport", validateToken, UserController.createReport);
router.post("/suscribe", validateToken, UserController.suscribe);
router.put("/updateProfile",validateToken, UserController.updateUser);
router.delete("/deleteProfile",validateToken, UserController.deleteUser);

export default router;