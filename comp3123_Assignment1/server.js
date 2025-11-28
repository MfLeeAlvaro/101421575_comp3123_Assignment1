require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { body, validationResult, query, param } = require('express-validator');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/comp3123_assigment1';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

const { Schema, model, isValidObjectId } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const employeeSchema = new Schema({
  first_name: { type: String, required: true },
  last_name:  { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  position:   { type: String, required: true },
  salary:     { type: Number, required: true, min: 0 },
  date_of_joining: { type: Date, required: true },
  department: { type: String, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const User = model('User', userSchema);
const Employee = model('Employee', employeeSchema);

// User routes
const userRouter = express.Router();
userRouter.post('/signup',
  body('username').trim().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status:false, errors:errors.array() });
    const { username, email, password } = req.body;
    const exists = await User.findOne({ $or: [{email},{username}] });
    if (exists) return res.status(409).json({ status:false, message:'User already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hash });
    return res.status(201).json({ message:'User created successfully.', user_id:user._id });
});

userRouter.post('/login',
  body('password').isLength({ min: 1 }),
  async (req, res) => {
    const { email, username, password } = req.body;
    if (!email && !username) return res.status(400).json({ status:false, message:'Provide email or username' });
    const user = await User.findOne(email ? { email } : { username });
    if (!user) return res.status(401).json({ status:false, message:'Invalid Username and password' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ status:false, message:'Invalid Username and password' });
    const token = jwt.sign({ sub: String(user._id) }, JWT_SECRET, { expiresIn:'1h' });
    return res.status(200).json({ message:'Login successful.', jwt_token: token });
});
app.use('/api/v1/user', userRouter);

// Optional auth passthrough
const auth = (req, _res, next) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (token) { try { req.user = jwt.verify(token, JWT_SECRET); } catch {} }
  next();
};

// Employee routes
const empRouter = express.Router();
empRouter.use(auth);

empRouter.get('/employees', async (_req, res) => {
  const docs = await Employee.find({}).lean();
  const out = docs.map(d => ({
    employee_id: d._id,
    first_name: d.first_name,
    last_name: d.last_name,
    email: d.email,
    position: d.position,
    salary: d.salary,
    date_of_joining: d.date_of_joining,
    department: d.department,
  }));
  res.status(200).json(out);
});

empRouter.post('/employees',
  body('first_name').notEmpty(),
  body('last_name').notEmpty(),
  body('email').isEmail(),
  body('position').notEmpty(),
  body('salary').isFloat({ min: 0 }),
  body('date_of_joining').isISO8601(),
  body('department').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status:false, errors:errors.array() });
    const created = await Employee.create(req.body);
    res.status(201).json({ message:'Employee created successfully.', employee_id: created._id });
});

empRouter.get('/employees/:eid',
  param('eid').custom(isValidObjectId),
  async (req, res) => {
    const doc = await Employee.findById(req.params.eid).lean();
    if (!doc) return res.status(404).json({ status:false, message:'Employee not found' });
    res.status(200).json({
      employee_id: doc._id,
      first_name: doc.first_name,
      last_name: doc.last_name,
      email: doc.email,
      position: doc.position,
      salary: doc.salary,
      date_of_joining: doc.date_of_joining,
      department: doc.department,
    });
});

empRouter.put('/employees/:eid',
  param('eid').custom(isValidObjectId),
  async (req, res) => {
    const upd = await Employee.findByIdAndUpdate(req.params.eid, req.body, { new:true });
    if (!upd) return res.status(404).json({ status:false, message:'Employee not found' });
    res.status(200).json({ message:'Employee details updated successfully.' });
});

empRouter.delete('/employees',
  query('eid').custom(isValidObjectId),
  async (req, res) => {
    const del = await Employee.findByIdAndDelete(req.query.eid);
    if (!del) return res.status(404).json({ status:false, message:'Employee not found' });
    res.status(204).send();
});
app.use('/api/v1/emp', empRouter);

app.get('/', (_req, res) => res.json({ ok:true }));

mongoose.connect(MONGO).then(() => {
  app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
}).catch(err => {
  console.error('Mongo connection failed:', err.message);
  process.exit(1);
});
