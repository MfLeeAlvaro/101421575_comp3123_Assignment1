require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { body, validationResult, query, param } = require('express-validator');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

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
  profile_picture: { type: String, default: null },
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

empRouter.get('/employees', async (req, res) => {
  const { department, position } = req.query;
  let query = {};
  
  if (department) {
    query.department = { $regex: department, $options: 'i' };
  }
  if (position) {
    query.position = { $regex: position, $options: 'i' };
  }
  
  const docs = await Employee.find(query).lean();
  const out = docs.map(d => ({
    employee_id: d._id,
    first_name: d.first_name,
    last_name: d.last_name,
    email: d.email,
    position: d.position,
    salary: d.salary,
    date_of_joining: d.date_of_joining,
    department: d.department,
    profile_picture: d.profile_picture ? `/uploads/${path.basename(d.profile_picture)}` : null,
  }));
  res.status(200).json(out);
});

empRouter.post('/employees',
  upload.single('profile_picture'),
  body('first_name').notEmpty(),
  body('last_name').notEmpty(),
  body('email').isEmail(),
  body('position').notEmpty(),
  body('salary').isFloat({ min: 0 }),
  body('date_of_joining').isISO8601(),
  body('department').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ status:false, errors:errors.array() });
    }
    
    const employeeData = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      position: req.body.position,
      salary: parseFloat(req.body.salary),
      date_of_joining: req.body.date_of_joining,
      department: req.body.department,
    };
    
    if (req.file) {
      employeeData.profile_picture = req.file.path;
    }
    
    const created = await Employee.create(employeeData);
    res.status(201).json({ 
      message:'Employee created successfully.', 
      employee_id: created._id,
      profile_picture: created.profile_picture ? `/uploads/${path.basename(created.profile_picture)}` : null
    });
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
      profile_picture: doc.profile_picture ? `/uploads/${path.basename(doc.profile_picture)}` : null,
    });
});

empRouter.put('/employees/:eid',
  param('eid').custom(isValidObjectId),
  upload.single('profile_picture'),
  async (req, res) => {
    const employee = await Employee.findById(req.params.eid);
    if (!employee) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ status:false, message:'Employee not found' });
    }
    
    // Delete old profile picture if new one is uploaded
    if (req.file && employee.profile_picture) {
      const oldPath = employee.profile_picture;
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    
    const updateData = {
      first_name: req.body.first_name || employee.first_name,
      last_name: req.body.last_name || employee.last_name,
      email: req.body.email || employee.email,
      position: req.body.position || employee.position,
      salary: req.body.salary ? parseFloat(req.body.salary) : employee.salary,
      date_of_joining: req.body.date_of_joining || employee.date_of_joining,
      department: req.body.department || employee.department,
    };
    
    if (req.file) {
      updateData.profile_picture = req.file.path;
    }
    
    const upd = await Employee.findByIdAndUpdate(req.params.eid, updateData, { new:true });
    res.status(200).json({ 
      message:'Employee details updated successfully.',
      profile_picture: upd.profile_picture ? `/uploads/${path.basename(upd.profile_picture)}` : null
    });
});

empRouter.delete('/employees',
  query('eid').custom(isValidObjectId),
  async (req, res) => {
    const employee = await Employee.findById(req.query.eid);
    if (!employee) return res.status(404).json({ status:false, message:'Employee not found' });
    
    // Delete profile picture if exists
    if (employee.profile_picture && fs.existsSync(employee.profile_picture)) {
      fs.unlinkSync(employee.profile_picture);
    }
    
    await Employee.findByIdAndDelete(req.query.eid);
    res.status(204).send();
});

// Search endpoint
empRouter.get('/employees/search',
  async (req, res) => {
    const { department, position } = req.query;
    
    if (!department && !position) {
      return res.status(400).json({ status: false, message: 'Please provide department or position for search' });
    }
    
    let query = {};
    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }
    if (position) {
      query.position = { $regex: position, $options: 'i' };
    }
    
    const docs = await Employee.find(query).lean();
    const out = docs.map(d => ({
      employee_id: d._id,
      first_name: d.first_name,
      last_name: d.last_name,
      email: d.email,
      position: d.position,
      salary: d.salary,
      date_of_joining: d.date_of_joining,
      department: d.department,
      profile_picture: d.profile_picture ? `/uploads/${path.basename(d.profile_picture)}` : null,
    }));
    res.status(200).json(out);
});

app.use('/api/v1/emp', empRouter);

app.get('/', (_req, res) => res.json({ ok:true }));

mongoose.connect(MONGO).then(() => {
  app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
}).catch(err => {
  console.error('Mongo connection failed:', err.message);
  process.exit(1);
});
