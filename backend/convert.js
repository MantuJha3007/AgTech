const fs = require('fs');
const path = require('path');

function convert() {
    // 1. Rename files
    if (fs.existsSync('src/routes/auth.routes.js')) fs.renameSync('src/routes/auth.routes.js', 'src/routes/authRoutes.js');
    if (fs.existsSync('src/controllers/auth.controller.js')) fs.renameSync('src/controllers/auth.controller.js', 'src/controllers/authController.js');

    // 2. config.js
    let cfg = fs.readFileSync('src/config/config.js', 'utf8');
    cfg = cfg.replace('import dotenv from "dotenv";', 'const dotenv = require("dotenv");');
    cfg = cfg.replace('export default config;', 'module.exports = config;');
    fs.writeFileSync('src/config/config.js', cfg);

    // 3. utils.js
    let util = fs.readFileSync('src/utils/utils.js', 'utf8');
    util = util.replace(/export function/g, 'function');
    if (!util.includes('module.exports')) {
        util += '\nmodule.exports = { generateOtp, getOtpHtml };\n';
    }
    fs.writeFileSync('src/utils/utils.js', util);

    // 4. email.service.js
    let eml = fs.readFileSync('src/services/email.service.js', 'utf8');
    eml = eml.replace(/export async function/g, 'async function');
    if (!eml.includes('module.exports')) {
        eml += '\nmodule.exports = { sendEmail };\n';
    }
    fs.writeFileSync('src/services/email.service.js', eml);

    // 5. Models
    for (const m of ['user', 'session', 'otp']) {
        let p = 'src/models/' + m + '.model.js';
        if(fs.existsSync(p)){
            let content = fs.readFileSync(p, 'utf8');
            content = content.replace('import mongoose from "mongoose";', 'const mongoose = require("mongoose");');
            content = content.replace(new RegExp('export default \\w+;'), 'module.exports = ' + m + 'Model;');
            fs.writeFileSync(p, content);
        }
    }

    // 6. authController.js
    let ctl = fs.readFileSync('src/controllers/authController.js', 'utf8');
    ctl = ctl.replace(/import (\w+) from "\.\.\/models\/([\w.]+)";/g, 'const $1 = require("../models/$2");');
    ctl = ctl.replace('import crypto from "crypto";', 'const crypto = require("crypto");');
    ctl = ctl.replace('import jwt from "jsonwebtoken"', 'const jwt = require("jsonwebtoken");');
    ctl = ctl.replace('import config from "../config/config.js"', 'const config = require("../config/config.js");');
    ctl = ctl.replace('import { sendEmail } from "../services/email.service.js";', 'const { sendEmail } = require("../services/email.service.js");');
    ctl = ctl.replace('import { generateOtp, getOtpHtml } from "../utils/utils.js"', 'const { generateOtp, getOtpHtml } = require("../utils/utils.js");');
    ctl = ctl.replace(/export async function (\w+)/g, 'async function $1');
    if (!ctl.includes('module.exports = { register, login, getMe, refreshToken, logout, logoutAll, verifyEmail };')) {
        ctl += '\nmodule.exports = { register, login, getMe, refreshToken, logout, logoutAll, verifyEmail };\n';
    }
    fs.writeFileSync('src/controllers/authController.js', ctl);

    // 7. authRoutes.js
    let rts = fs.readFileSync('src/routes/authRoutes.js', 'utf8');
    rts = rts.replace('import { Router } from "express"', 'const { Router } = require("express");');
    rts = rts.replace('import * as authController from "../controllers/auth.controller.js";', 'const authController = require("../controllers/authController.js");');
    rts = rts.replace('export default authRouter;', 'module.exports = authRouter;');
    fs.writeFileSync('src/routes/authRoutes.js', rts);

    console.log('Conversion successful');
}

convert();
