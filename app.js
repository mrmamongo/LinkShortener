const express = require('express');
const config = require('config');
const mongoose = require('mongoose');

const app = express()

app.use(express.json( { extended: true }));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/link', require('./routes/link.routes'));
app.use('/t/', require('./routes/redirect.routes'));

async function start() {
    try {
        await mongoose.connect(
            config.get('mongoUri'),
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

        app.listen(config['PORT'] || 5000, () => {
            console.log('App has been started at port: ', config['PORT'])
        });
    } catch (e) {
        console.error("Server Error: ", e.message);
        process.exit(1);
    }
}

start()