const { Pool } = require('pg');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'demoex',
  password: '123456',
  port: 5432, 
});


pool.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.message);
  } else {
    console.log('Подключение к базе данных установлено.');
  }
});
const app = express();
const port = 3000;
const SECRET_KEY = 'your_secret_key';

app.use(cors());
app.use(bodyParser.json());

app.post('/register', async (req, res) => {
  const { login, password, email, phone, full_name } = req.body;

  if (!login || !password || !email || !phone || !full_name) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 8);

  try {
    const client = await pool.connect();
    try {
      const existingUser = await client.query('SELECT id FROM users WHERE login = $1', [login]);

      if (existingUser.rowCount > 0) {
        return res.status(409).json({ message: 'Login is already taken.' }); 
      }


      const result = await client.query(
        'INSERT INTO users (login, password, email, phone, full_name) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [login, hashedPassword, email, phone, full_name]
      );

      res.status(201).json({
        message: 'User registered successfully',
        userId: result.rows[0].id,
      });
    } finally {
      client.release(); 
    }
  } catch (err) {
    console.error('Error registering user:', err.message);
    res.status(500).json({ message: 'Registration failed due to a server error.' });
  }
});


app.post('/login', async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ message: 'Login and password are required.' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE login = $1', [login]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid login or password.' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid login or password.' });
    }

    const token = jwt.sign({ userId: user.id, login: user.login }, SECRET_KEY);
    res.json({ token, login });
  } catch (err) {
    console.error('Error during login:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
});

app.post('/order', async (req, res) => {
  const { product_name, quantity, delivery_address } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!product_name || !quantity || !delivery_address) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.userId;

    await pool.query(
      'INSERT INTO orders (product_name, quantity, delivery_address, status, user_id) VALUES ($1, $2, $3, $4, $5)',
      [product_name, quantity, delivery_address, 'Pending', userId]
    );
    res.status(201).json({ message: 'Order created successfully' });
  } catch (err) {
    console.error('Error creating order:', err.message);
    res.status(500).json({ message: 'Error creating order.' });
  }
});

app.get('/orders', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.userId;

    const result = await pool.query('SELECT * FROM orders WHERE user_id = $1', [userId]);
    res.json({ orders: result.rows });
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).json({ message: 'Error fetching orders.' });
  }
});


app.get('/admin', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    if (decoded.login !== 'sklad') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const client = await pool.connect(); 
    try {
      const usersResult = await client.query('SELECT * FROM users');
      const users = usersResult.rows;

      const ordersResult = await client.query('SELECT * FROM orders');
      const orders = ordersResult.rows;

      res.json({ users, orders });
    } catch (err) {
      console.error('Error fetching data:', err.message);
      res.status(500).json({ message: 'Error fetching data.' });
    } finally {
      client.release(); 
    }
  } catch (err) {
    console.error('Invalid or expired token:', err.message);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

app.put('/admin/order/:orderId', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { status } = req.body;
  const { orderId } = req.params;

  if (!status) {
    return res.status(400).json({ message: 'Status is required.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    if (decoded.login !== 'sklad') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const client = await pool.connect(); 
    try {
      const updateResult = await client.query(
        'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
        [status, orderId]
      );

      if (updateResult.rowCount === 0) {
        return res.status(404).json({ message: 'Order not found.' });
      }

      res.json({ message: 'Order status updated successfully', order: updateResult.rows[0] });
    } catch (err) {
      console.error('Error updating order status:', err.message);
      res.status(500).json({ message: 'Error updating order status.' });
    } finally {
      client.release(); 
    }
  } catch (err) {
    console.error('Invalid or expired token:', err.message);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});



app.listen(port, () => {
  console.log(`Сервер запущен http://localhost:${port}`);
});