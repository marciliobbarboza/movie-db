const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado com sucesso ao MongoDB!');
    } catch (err) {
        console.error('❌ Erro ao conectar no banco de dados:', err);
        process.exit(1);
    }
};

module.exports = connectDB;