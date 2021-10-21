const {Router} = require('express');
const User = require('../models/User');
const {check, validationResult} = require('express-validator');
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = Router();


// /api/auth/register
router.post(
    '/register',
    [
        check('email', 'Incorrect email').isEmail(),
        check('password', 'Minimal password length is 6 symbols')
            .isLength({min: 6})
    ],
    async (req, res)=>{
    try {
        console.debug(req.body)
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array(),
                message: "Incorrect register data"
            })
        }
        const {email, password} = req.body;

        const candidate = await User.findOne({email});

        if (candidate) {
            return res.status(400).json({message: "User is already exist"});
        }

        const pwdHash = await bcrypt.hash(password, 12);
        const user = new User({ email, password: pwdHash });

        await user.save();
        console.log("User created", email);
        res.status(201).json({ message: "User created"});


    } catch (e) {
        console.error(e);
        res.status(500).json({message: "Something went wrong. Try again."})
    }
})

// /api/auth/login
router.post('/login',
    // [
    //     check('email', "Enter correct email").normalizeEmail().isEmail(),
    //     check('password', "Enter password").exists()
    // ],
    async (req, res)=>{
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array(),
                message: "Incorrect register data"
            })
        }
        console.debug(req.body);
        const {email, password} = req.body;
        const user = await User.findOne({email});

        if  (!user) {
            return res.status(400).json({message: "Incorrect data"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            return res.status(400).json({message: "Incorrect data. Try again"})
        }
        const token = jwt.sign(
            { userId: user.id },
            config['jwtSecret'],
            {expiresIn: "1h"}
        )

        res.status(200).json( {message: "Successful login", token, userId: user.id } )

    } catch (e){
        console.error(e);
        res.status(500).json({message: "Something went wrong. Try again"});
    }
})

module.exports = router;