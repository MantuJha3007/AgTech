const userModel = require("../models/user.model.js");
const sessionModel = require("../models/session.model.js");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../config/config.js");
const { sendEmail } = require("../services/email.service.js");
const { generateOtp, getOtpHtml } = require("../utils/utils.js");
const otpModel = require("../models/otp.model.js");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);


async function register(req, res) {
    const { name, email, password, role, location } = req.body;

    const isAlreadyRegistered = await userModel.findOne({ email })

    if (isAlreadyRegistered) {
        return res.status(409).json({
            message: "Email already exits"
        })
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");  // byheart this

    const user = await userModel.create({
        name,
        email,
        password: hashedPassword,
        role,
        location
    })

    const otp = generateOtp();
    const html = getOtpHtml(otp);

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    await otpModel.create({
        email,
        user: user._id,
        otpHash
    })

     await sendEmail(email, "OTP Verification", `Your OTP code is  ${otp}`, html)

    res.status(201).json({
        message: "User registered successfully",
        user: {
            name: user.name,
            email: user.email,
            role: user.role,
            location: user.location,
            verified: user.verified
        },
    })

}

async function login(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        })
    }

    if(!user.verified){
        return res.status(401).json({
            message: "Email not verified"
        })
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    const isPasswordValid = hashedPassword == user.password;

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "Invalid email or password"
        })
    }

    const refreshToken = jwt.sign({
        id: user._id
    }, config.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    )

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    })

    const accessToken = jwt.sign({
        id: user._id,
        sessionId: session._id
    }, config.JWT_SECRET,
        {
            expiresIn: "15m"
        }
    )

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.status(200).json({
        message: "Logged in successfully",
        user: {
            name: user.name,
            email: user.email,
            role: user.role,
            location: user.location,
        },
        accessToken,
        token: accessToken,
    })
}

async function getMe(req, res) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "token not found"
        })
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = await userModel.findById(decoded.id)

    res.status(200).json({
        message: "user fetched successfully",
        user: {
            name: user.name,
            email: user.email,
            role: user.role,
            location: user.location,
        }
    })
}

async function refreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: "Refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET)

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    })

    if (!session) {
        return res.status(401).json({
            message: "Invalid refresh token"
        })
    }

    const accessToken = jwt.sign({
        id: decoded.id
    }, config.JWT_SECRET,
        {
            expiresIn: "15m"
        }
    )

    const newRefreshToken = jwt.sign({
        id: decoded.id
    }, config.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    )

    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.status(200).json({
        message: "Access token refreshed successfully",
        accessToken
    })
}

async function logout(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({
            message: "Refresh token not found"
        })
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");


    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    })

    if (!session) {
        return res.status(400).json({
            message: "Invalid refresh token"
        })
    }

    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken")

    res.status(200).json({
        message: "Logged  out successfully"
    })
}

async function logoutAll(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({
            message: "Refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET)

    await sessionModel.updateMany({
        user: decoded.id,
        revoked: false
    }, {
        revoked: true
    })

    res.status(200).json({
        message: "Logged out from all devices successfully"
    })
}

async function verifyEmail(req,res){
    const {otp , email} = req.body

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const otpDoc = await otpModel.findOne({
        email, 
        otpHash
    })

    if(!otpDoc){
        return res.status(400).json({
            message: "Invalid OTP"
        })
    }

    const user = await userModel.findByIdAndUpdate(otpDoc.user, {
        verified: true
    }, { new: true });

    await otpModel.deleteMany({
        user: otpDoc.user
    });

    const refreshToken = jwt.sign({
        id: user._id
    }, config.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "unknown"
    });

    const accessToken = jwt.sign({
        id: user._id,
        sessionId: session._id
    }, config.JWT_SECRET,
        {
            expiresIn: "15m"
        }
    );

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json({
        message: "Email verified successfully",
        user:{
            name: user.name,
            email: user.email,
            role: user.role,
            location: user.location,
            verified: user.verified
        },
        accessToken,
        token: accessToken
    });
}

async function googleLogin(req, res) {
    try {
        const { credential, role } = req.body;

        if (!credential) {
            return res.status(400).json({
                message: "Google credential is required"
            });
        }

        let payload;
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: config.GOOGLE_CLIENT_ID
            });
            payload = ticket.getPayload();
        } catch (verifyErr) {
            console.error("Google token verification error:", verifyErr.message);
            return res.status(401).json({
                message: "Invalid Google credential"
            });
        }

        if (!payload || !payload.email) {
            return res.status(401).json({
                message: "Unable to retrieve email from Google account"
            });
        }

        let user = await userModel.findOne({ email: payload.email });

        if (!user) {
            user = await userModel.create({
                name: payload.name || payload.email.split("@")[0],
                email: payload.email,
                role: role || "tenant",
                location: "Not specified",
                authProvider: "google",
                googleId: payload.sub,
                avatar: payload.picture || "",
                verified: true
            });
        } else {
            let updated = false;
            if (!user.verified) {
                user.verified = true;
                updated = true;
            }
            if (!user.googleId) {
                user.googleId = payload.sub;
                updated = true;
            }
            if (!user.avatar && payload.picture) {
                user.avatar = payload.picture;
                updated = true;
            }
            if (updated) {
                await user.save();
            }
        }

        const refreshToken = jwt.sign({
            id: user._id
        }, config.JWT_SECRET, {
            expiresIn: "7d"
        });

        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

        const session = await sessionModel.create({
            user: user._id,
            refreshTokenHash,
            ip: req.ip || "127.0.0.1",
            userAgent: req.headers["user-agent"] || "unknown"
        });

        const accessToken = jwt.sign({
            id: user._id,
            sessionId: session._id
        }, config.JWT_SECRET, {
            expiresIn: "15m"
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json({
            message: "Google login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                location: user.location,
                avatar: user.avatar,
                verified: user.verified
            },
            accessToken,
            token: accessToken
        });
    } catch (error) {
        console.error("googleLogin error:", error);
        return res.status(500).json({
            message: error.message || "Failed to authenticate with Google"
        });
    }
}

module.exports = { register, login, getMe, refreshToken, logout, logoutAll, verifyEmail, googleLogin };
