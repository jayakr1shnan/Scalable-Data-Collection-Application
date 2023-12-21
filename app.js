const express = require('express');
const mysql = require('mysql');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(morgan('dev'));

const db = mysql.createConnection({
  host: process.env.DB_HOST,         
  user: process.env.DB_USER,         
  password: process.env.DB_PASSWORD,     //Store your all credentials in enviroment variables.
  database: process.env.DB_DATABASE,     
  debug: ['ComQueryPacket', 'RowDataPacket'],
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public_html')));

app.post('/addUser', async (req, res) => {
  const { name, age, gender, college_id, department } = req.body;

  const sql = 'INSERT INTO students (name, age, gender, college_id, department) VALUES (?, ?, ?, ?, ?)';
  const values = [name, age, gender, college_id, department];

  try {
    console.log('Executing SQL query:', sql, 'with values:', values);

    const result = await queryAsync(sql, values);
    console.log('Data inserted into MySQL');
    res.status(200).send('Data inserted into MySQL');
  } catch (err) {
    console.error('MySQL query error: ' + err.stack);
    res.status(500).send('Error inserting data into MySQL: ' + err.message);
  }
});

app.get('/search', (req, res) => {
  res.sendFile(path.join(__dirname, 'search.html'));
});

app.post('/search', async (req, res) => {
  const { attribute, value } = req.body;

  const sql = `SELECT * FROM students WHERE ${attribute} = ?`;
  const values = [value];

  try {
    console.log('Executing SQL query:', sql, 'with values:', values);

    const result = await queryAsync(sql, values);
    res.status(200).json(result);
  } catch (err) {
    console.error('MySQL query error: ' + err.stack);
    res.status(500).json({ error: 'Error retrieving data from MySQL: ' + err.message });
  }
});

// Define the /login route
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Handle the administrator login logic
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if the credentials are valid
  if (checkCredentials(username, password)) {
    // If valid, redirect to the search page
    res.redirect('/search');
  } else {
    // If invalid, redirect back to the login page
    res.redirect('/login');
  }
});
// Check administrator credentials
function checkCredentials(username, password) {
  const credentials = {
    'Ayushman Koul': process.env.AYUSHMAN_PASSWORD,
    'Amit Jha': process.env.AMIT_PASSWORD,
    'Binija Mathew': process.env.BINIJA_PASSWORD,
    'Jai Kurup': process.env.JAI_PASSWORD,
    'Ram Iyer': process.env.RAM_PASSWORD,
    'Jayakrishnan': process.env.JAYA_PASSWORD,
  };

  return credentials[username] === password;
}

// Display the student table for administrators
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'students_table.html'));
});

// Add logic to handle changes and expel students here

const queryAsync = (sql, values) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', reason.stack || reason);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});



