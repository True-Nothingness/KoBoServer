const User = require('./../models/User');
const Token = require('./../models/Token');
const sendEmail = require('./../utils/sendEmail');
const Joi = require('joi');
const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

router.post("/",async(request,response)=>{
    try{
        const schema = Joi.object({email:Joi.string().email().required()});
        const {error} = schema.validate(request.body);
        if(error) return response.status(400).send(error.details[0].message);

        const user = await User.findOne({email: request.body.email});
        if(!user) return response.status(404).send({message: "User does not exist"});

        let token = await Token.findOne({userId: user._id})
        if(!token){
            token = await new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString('hex'),
            }).save()
        }
        const link = `${user._id}/${token.token}`;
        await sendEmail(user.email,"password reset", "You have requested a password reset, copy this key into the app.\r\n\n" + link);
        return response.status(200).send({message: 'Password reset link sent'});
    }catch(error){
        response.status(422).send({message: 'Error'})
        console.log(error)
    }
})

router.post("/link", async (request, response) => {

        const user = await User.findById(request.body.userId);
        if (!user) return reponse.status(400).send({message: "invalid link or expired"});

        const token = await Token.findOne({
            userId: user._id,
            token: request.body.token,
        });
        if (!token) return response.status(400).send({message: "Invalid link or expired"});

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(request.body.password, salt);
        await user.save();
        await token.deleteOne();

        response.send({message: "password reset successfully."});
   
});

module.exports = router;