const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt'); // Untuk mengenkripsi password

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

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
        const query = 'INSERT INTO users (name, nik, no, email, password, role) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(query, [name, nik, no, email, hash, 'pelanggan'], (err, results) => {
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

router.get('/get-tipe-wisata', (req, res) => {
    const query = 'SELECT * FROM tipe_wisata';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data from the database:', err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.status(200).json(results);  // Mengirim hasil query sebagai respons
        }
    });
});

// Endpoint untuk mengunggah file dan menyimpan data wisata
router.post('/add-wisata', upload.single('foto'), (req, res) => {
    const { name, kategori_wisata, jam_buka, jam_tutup, lokasi, harga, fasilitas, alamat } = req.body;
    const foto = req.file.filename; // Nama file gambar

    const query = 'INSERT INTO wisata (nama_wisata, kategori_wisata, jam_buka, jam_tutup, lokasi, harga_tiket_masuk, fasilitas, alamat_lengkap, foto) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [name, kategori_wisata, jam_buka, jam_tutup, lokasi, harga, fasilitas, alamat, foto], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.status(200).json({ message: 'Wisata added successfully' });
        }
    });
});

router.get('/get-wisata', (req, res) => {
    const query = `
    SELECT 
        wisata.id, 
        wisata.nama_wisata, 
        tipe_wisata.nama_tipe AS kategori_wisata, 
        wisata.lokasi, 
        wisata.foto 
    FROM 
        wisata 
    JOIN 
        tipe_wisata 
    ON 
        wisata.kategori_wisata = tipe_wisata.id;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.status(200).json(results);
        }
    });
});

router.get('/get-users', (req, res) => {
    const query = 'SELECT * FROM users';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data from the database:', err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.status(200).json(results);
        }
    });
});

router.post('/add-user', (req, res) => {
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

router.post('/delete-user', (req, res) => {
    const { id } = req.body;
    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error deleting user from database:', err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.json({ message: 'User deleted successfully' });
            console.log('User deleted successfully');
        }
    });
});

// Endpoint untuk mendapatkan data wisata dengan kategori_wisata = 2
router.get('/get-wisata-pantai', (req, res) => {
    const query = 'SELECT * FROM wisata WHERE kategori_wisata = 1';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data from the database:', err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.status(200).json(results);
        }
    });
});

router.get('/get-pantai-detail', (req, res) => {
    const query = 'SELECT * FROM wisata WHERE id = 1';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data from the database:', err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.status(200).json(results);
        }
    });
});

module.exports = router;
