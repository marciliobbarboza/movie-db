const User = require('../models/User');

async function list(req, res) {
    try {
        const { q } = req.query;
        const filter = q ? { $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] } : {};
        const users = await User.find(filter).sort({ createdAt: -1 });
        res.json(users);
    } catch (e) {
        res.status(500).json({ message: 'error' });
    }
}

async function getOne(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'not_found' });
        res.json(user);
    } catch (e) {
        res.status(400).json({ message: 'invalid_id' });
    }
}

async function create(req, res) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'missing_fields' });
        const exists = await User.findOne({ email });
        if (exists) return res.status(409).json({ message: 'email_in_use' });

        const user = await User.create({ name, email, password });
        res.status(201).json(user);
    } catch (e) {
        res.status(500).json({ message: 'error' });
    }
}

async function update(req, res) {
    try {
        const { name, email, password } = req.body;
        const data = {};
        if (name !== undefined) data.name = name;
        if (email !== undefined) data.email = email;
        if (password !== undefined) data.password = password;

        const user = await User.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
        if (!user) return res.status(404).json({ message: 'not_found' });
        res.json(user);
    } catch (e) {
        res.status(400).json({ message: 'invalid_data' });
    }
}

async function remove(req, res) {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'not_found' });
        res.status(204).end();
    } catch (e) {
        res.status(400).json({ message: 'invalid_id' });
    }
}

module.exports = { list, getOne, create, update, remove };
