const express = require('express');
const { validRegiterInput, validLoginInput, validChangePasswordInput, validResetPasswordInput } = require('../../Validation');
const { validateToken } = require('../../auth');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const crypto = require('crypto');
const { mailSender } = require('../../utils/mailSender');
const { json } = require('body-parser');

var users = express.Router();

function generateToken(user) {
    return jwt.sign(
        {
            id: user.id
        },
        process.env.SECRET_KEY
    );
}

users
    .route('/')
    .get(validateToken, async (req, res) => {
        const users = await User.find();
        res.json(users)
    })

users
    .route('/register')
    .post(async (req, res) => {
        let { username, email, password } = req.body;
        const err = validRegiterInput(username, email, password);
        if (!err) {
            try {
                const findUser = await User.findOne({ email });
                if (!findUser) {
                    password = await bcrypt.hash(password, 12);
                    const user = await User.create({ username, password, email });
                    const token = generateToken(user)
                    return res.json({ message: 'User created!', data: { user, token } });
                }
                return res.json({ message: "User Already Exists" })
            } catch (error) {
                console.log(error)
                return res.json({ message: "User not created" })
            }
        }
        else {
            return res.json({ message: err })
        }
    });

users
    .route('/login')
    .post(async (req, res) => {
        const { email, password } = req.body;
        const err = validLoginInput(email, password);
        if (!err) {
            try {
                const findUser = await User.findOne({ email });
                if (findUser) {
                    const user = await bcrypt.compareSync(password, findUser.password);
                    if (!user) {
                        return res.json({ message: "Please Enter Valid Email or Password" })
                    }
                    const token = generateToken(findUser);
                    return res.json({ message: "User Login successfull", data: { findUser, token } })
                }
                return res.json({ message: "User does not exist" })
            } catch (error) {
                return res.json({ message: "Please Try Again" })
            }
        }
        else {
            return res.json({ message: err })
        }
    })

users
    .route('/changepassword')
    .put(validateToken, async (req, res) => {
        let { oldPassword, newPassword } = req.body;
        const err = validChangePasswordInput(oldPassword, newPassword);
        if (!err) {
            try {
                const userId = req.decoded;
                if (userId) {

                    const findUser = await User.findById(userId.id);
                    const match = bcrypt.compareSync(oldPassword, findUser.password);
                    if (!match) return res.json({
                        message: "Please Enter Correct password"
                    })

                    await User.findByIdAndUpdate(userId.id, {
                        password: await bcrypt.hash(newPassword, 12)
                    }, {
                        useFindAndModify: false,
                    })

                    return res.json({
                        message: "Password Updated Successfully"
                    })
                }
            } catch (error) {
                res.json("Authentication Error")
            }
        }
        else {
            res.json({
                message: err
            })
        }
    })

users
    .route('/resetpassword')
    .post(async (req, res) => {
        let { email } = req.body;
        const err = validResetPasswordInput(email);
        if (!err) {
            try {
                const findUser = await User.findOne({ email });
                if (findUser) {
                    const token = crypto.randomBytes(20).toString('hex');
                    await findUser.updateOne({
                        resetPasswordToken: token,
                        resetPasswordExpires: Date.now() + 60000,
                    })
                    const info = await mailSender(email, token);
                    return res.json({
                        message: "Recovery Mail Sent"
                    })
                }
                return res.json({
                    message: "User Does not Exist"
                })
            } catch (error) {
                res.json({
                    message: "Please Try Again"
                })
            }
        }
        else {
            res.json({
                message: err
            })
        }
    })

users
    .route('/change/:token')
    .put(async (req, res) => {
        const { token } = req.params;
        const { newPassword } = req.body;

        const err = validChangePasswordInput(newPassword);
        if (!err) {
            try {
                const user = await User.findOne({
                    resetPasswordToken: token,
                    resetPasswordExpires: {
                        $gt: Date.now()
                    }
                })

                if (user) {
                    await user.updateOne({
                        password: await bcrypt.hash(newPassword, 12)
                    })
                    return res.json({
                        message: "Password Reset Successfully !"
                    })
                }
                return res.json({
                    message: "Link has been expired !"
                })
            } catch (error) {
                res.json({
                    message: "Please Try Again"
                })
            }
        }
        else {
            res.json({
                message: err
            })
        }

    })

module.exports = users;