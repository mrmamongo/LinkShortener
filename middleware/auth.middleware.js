const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({message: "Not authorised. There's no token"});
        }
        const decoded = jwt.verify(token, config['jwtSecret']);
        req.user = decoded;
        next();

    } catch (e) {
        return res.status(401).json({ message: ("Not authorised" + e.message) });
    }
}
