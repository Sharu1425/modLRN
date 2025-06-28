import express from "express";
import { createResult, getUserResults, getResult } from "../controllers/resultController.js";

const router = express.Router();

router.post("/", createResult);

router.get("/user/:userId", getUserResults);

router.get("/:id", getResult);

export default router; 