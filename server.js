const express = require('express');
const connectDB = require('./config/db.config');
const dotenv = require('dotenv');
const cors = require('cors');

//Routes
const tokenRoutes = require('./routes/token.routes');


dotenv.config();
const app = express();
const port = 3000;

connectDB();
app.use(cors());
app.use(express.json());

app.use('/api/token', tokenRoutes);

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});