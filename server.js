require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');

// Lowdb (file-based JSON DB)
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(path.join(__dirname, 'data', 'db.json'));
const db = low(adapter);

// Defaults
db.defaults({ news: [], users: [] }).write();

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_secure_secret';
const ADMIN_USERNAME = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASS || '5555'; // initial password

// Setup multer for uploads
const uploadDir = path.join(__dirname, 'mosque_images', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, safeName);
  }
});
const upload = multer({ storage });

// ensure upload dir exists
const fs = require('fs');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Ensure admin user exists (store hashed password)
async function ensureAdmin() {
  const user = db.get('users').find({ username: ADMIN_USERNAME }).value();
  if (!user) {
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
    db.get('users').push({ id: 1, username: ADMIN_USERNAME, password: hashed }).write();
    console.log('Admin user created with default credentials (change via env variables).');
  }
}
ensureAdmin();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(helmet());
app.use(morgan('combined'));

// Rate limiter for auth endpoints
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8, // limit to 8 requests per window per IP
  message: { error: 'Too many login attempts. Please try again later.' }
});

// Serve static site
app.use(express.static(path.join(__dirname)));

// API
app.post('/api/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
  const user = db.get('users').find({ username }).value();
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '12h' });
  return res.json({ token });
});

// auth middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token' });
  const parts = authHeader.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Invalid token' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Public: list news
app.get('/api/news', (req, res) => {
  const news = db.get('news').sortBy('createdAt').reverse().value();
  res.json(news);
});

// Admin: create news
app.post('/api/news', auth, (req, res) => {
  const { title, content, image } = req.body || {};
  if (!title || !content) return res.status(400).json({ error: 'Missing fields' });
  const id = Date.now();
  const item = { id, title, content, image: image || null, createdAt: new Date().toISOString() };
  db.get('news').push(item).write();
  res.json(item);
});

// Admin: update
app.put('/api/news/:id', auth, (req, res) => {
  const id = Number(req.params.id);
  const { title, content, image } = req.body || {};
  const item = db.get('news').find({ id }).value();
  if (!item) return res.status(404).json({ error: 'Not found' });
  db.get('news').find({ id }).assign({ title, content, image: image || null, updatedAt: new Date().toISOString() }).write();
  res.json(db.get('news').find({ id }).value());
});

// Admin: delete
app.delete('/api/news/:id', auth, (req, res) => {
  const id = Number(req.params.id);
  db.get('news').remove({ id }).write();
  res.json({ success: true });
});

// Admin: change password
app.post('/api/admin/password', auth, async (req, res) => {
  const { newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 4) return res.status(400).json({ error: 'Invalid password' });
  const hashed = await bcrypt.hash(newPassword, 10);
  db.get('users').find({ username: ADMIN_USERNAME }).assign({ password: hashed }).write();
  res.json({ success: true });
});

// Admin: upload image
app.post('/api/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const url = `/mosque_images/uploads/${req.file.filename}`;
  res.json({ url });
});

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

