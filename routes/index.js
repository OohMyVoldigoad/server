const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt'); // Untuk mengenkripsi password

router.get("/", (req, res) => {
    res.send("hallo")
})

router.post('/signup', (req, res) => {
    const { email, password, name, nik, no } = req.body;

    // Hash password sebelum disimpan
    bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
        res.status(500).json({ message: 'Internal server error' });
    } else {
        const query = 'INSERT INTO users (name, nik, no, email, password) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [name, nik, no, email, hash], (err, results) => {
        if (err) {
            console.error('Error inserting into database:', err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.json({ message: 'User registered successfully' });
            console.log('User registered successfully');
        }
        });
    }
    });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Query untuk mendapatkan pengguna berdasarkan email
    const query = 'SELECT * FROM users WHERE email = ?';
    
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
        if (results.length > 0) {
            const user = results[0];
    
            // Bandingkan password yang dimasukkan dengan password yang tersimpan di database
            bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                res.status(500).json({ message: 'Internal server error' });
            } else if (isMatch) {
                const token = 'fake-jwt-token'; // Ganti dengan token sebenarnya
                const profile = { id: user.id, name: user.name, nik: user.nik, no: user.no, role: user.role }; // Ambil informasi profil lainnya jika ada
                res.json({ message: 'Login successful', token, profile });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
        }
    });
});

router.post('/edit-user', (req, res) => {
    const { name, nik, no, userId } = req.body;

    const query = 'UPDATE users SET name = ?, nik = ?, no = ? WHERE id = ?';

    db.query(query, [name, nik, no, userId], (err, results) => {
        if (err) {
        console.error('Error updating the database:', err);
        res.status(500).json({ message: 'Internal server error' });
        } else {
        res.status(200).json({ message: 'Profile updated successfully' });
        }
    });
});

module.exports = router;
