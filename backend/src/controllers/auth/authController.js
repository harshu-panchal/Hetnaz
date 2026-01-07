/**
 * Auth Controller - Request Handlers
 * @owner: Sujal
 */

import * as authService from '../../services/auth/authService.js';

// LOGIN FLOW
export const requestLoginOtp = async (req, res, next) => {
    try {
        const { phoneNumber } = req.body;
        const result = await authService.requestLoginOtp(phoneNumber);

        res.status(200).json({
            status: 'success',
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

export const verifyLoginOtp = async (req, res, next) => {
    try {
        const { phoneNumber, otp } = req.body;
        const user = await authService.verifyLoginOtp(phoneNumber, otp);
        const token = authService.generateToken(user._id);

        user.password = undefined;

        res.status(200).json({
            status: 'success',
            token,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

// SIGNUP FLOW
export const requestSignupOtp = async (req, res, next) => {
    try {
        const result = await authService.requestSignupOtp(req.body);

        res.status(200).json({
            status: 'success',
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

export const verifySignupOtp = async (req, res, next) => {
    try {
        const { phoneNumber, otp } = req.body;
        const io = req.app.get('io');
        const newUser = await authService.verifySignupOtp(phoneNumber, otp, io);
        const token = authService.generateToken(newUser._id);

        newUser.password = undefined;

        res.status(201).json({
            status: 'success',
            token,
            data: { user: newUser }
        });
    } catch (error) {
        next(error);
    }
};
