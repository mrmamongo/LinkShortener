const {Router} = require('express');
const config = require('config');
const shortId = require('shortid');
const Link = require('../models/Link');
const auth = require('../middleware/auth.middleware');
const router = Router();

router.post('/generate', auth, async (req, res) => {
    try {
        const baseUrl = config['baseUrl'];
        const {from} = req.body;

        const code = shortId.generate();
        const existingLink = await Link.findOne({from});

        if (existingLink) {
            return res.status(200).json({link: existingLink});
        }

        const to = baseUrl + '/t/' + code;
        const link = new Link({
            code, to, from, owner: req.user.userId
        })
        await link.save();

        res.status(201).json({ link });
    } catch (e) {
        console.error(e);
        res.status(500).json({message: "Something went wrong. Try again."})
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const links = await Link.find({ owner: req.user.userId});
        res.json(links);
    } catch (e) {
        console.error(e);
        res.status(500).json({message: "Something went wrong. Try again."})
    }
});

router.get('/:id', auth, async(req, res) => {
    try {
        const link = await Link.findById(req.params.id);
        res.json(link);
    } catch (e) {
        console.error(e);
        res.status(500).json({message: "Something went wrong. Try again."})
    }
});

router.post('/:id', auth, async (req, res) => {
    try {
        const id = req.params.id;
        await Link.findOneAndDelete({id});
        console.debug('Deleted object', id);
        res.status(200).json({message: "Deleted link"});
    } catch (e) {
        console.error(e);
        res.status(500).json({message: "Something went wrong. Try again"});
    }
})

module.exports = router;