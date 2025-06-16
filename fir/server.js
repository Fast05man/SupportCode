
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcrypt');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

const adminAuth = (req, res, next) => {
  if (req.session.role !== 'admin') {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }
  next();
};


app.post('/api/register', async (req, res) => {
  const { username, password, fullname, phone, email } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password, full_name, phone, email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [username, hashedPassword, fullname, phone, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при регистрации пользователя:', error);
    res.status(500).json({ message: 'Ошибка при регистрации пользователя' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        req.session.userId = user.id;
        req.session.role = user.role;
        res.status(200).json({ message: 'Вход выполнен успешно', role: user.role });
      } else {
        res.status(401).json({ message: 'Неверный логин или пароль' });
      }
    } else {
      res.status(401).json({ message: 'Неверный логин или пароль' });
    }
  } catch (error) {
    console.error('Ошибка при авторизации пользователя:', error);
    res.status(500).json({ message: 'Ошибка при авторизации пользователя' });
  }
});

app.get('/api/orders', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Необходима авторизация' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1',
      [req.session.userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    res.status(500).json({ message: 'Ошибка при получении заказов' });
  }
});

app.post('/api/orders', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Необходима авторизация' });
  }

  const { product_name, quantity, address } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO orders (user_id, product_name, quantity, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.session.userId, product_name, quantity, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    res.status(500).json({ message: 'Ошибка при создании заказа' });
  }
});

app.get('/api/admin/orders', adminAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    res.status(500).json({ message: 'Ошибка при получении заказов' });
  }
});

app.put('/api/admin/orders/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Заказ не найден' });
    }
  } catch (error) {
    console.error('Ошибка при обновлении статуса заказа:', error);
    res.status(500).json({ message: 'Ошибка при обновлении статуса заказа' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});