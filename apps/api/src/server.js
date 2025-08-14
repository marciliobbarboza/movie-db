const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { connectMongo } = require('./database/mongoose');

async function start() {
    try {
        await connectMongo();

        const server = http.createServer(app);
        server.listen(env.PORT, () => {
            console.log(`API running on port ${env.PORT}`);
        });
    } catch (err) {
        console.log('Error starting API:', err.message);
        process.exit(1);
    }
}

start();
