// server/app.js atau server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const path = require('path');
const Routes = require('./routes');  // Tambahkan ini

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api', Routes);  // Tambahkan ini
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
