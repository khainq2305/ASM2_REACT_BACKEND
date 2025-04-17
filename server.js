require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;


const adminRoutes = require('./routes/Admin');
const clientRoutes = require('./routes/Client')

app.use(express.json());


app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));



app.use(express.urlencoded({ extended: true, limit: '50mb' }));


app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/admin', adminRoutes);
app.use('/', clientRoutes)

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
