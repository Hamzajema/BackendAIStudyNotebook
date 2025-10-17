import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import fs from "fs";
import path from "path";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Swagger configuration
const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Backend AI Study Notebook API", version: "1.0.0" },
  },
  apis: ["./server.js"], // your route files
};

const specs = swaggerJsdoc(options);

app.get("/api-docs", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>API Docs</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
      <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = function() {
          SwaggerUIBundle({
            spec: ${JSON.stringify(specs)},
            dom_id: '#swagger-ui',
            presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          });
        }
      </script>
    </body>
    </html>
  `);
});
// // Schemas
// const MaterialSchema = new mongoose.Schema({
//   id: { type: Number, required: true },
//   name: { type: String, required: true },
//   type: { type: String },
//   content: { type: String },
//   date: { type: Date, default: Date.now },
//   url: { type: String }
// });

// const iMAGESchema = new mongoose.Schema({
//   id: Number,
//   name: String,
//   type: String,
//   dataUrl: String,
//   date: String
// });

// const SubjectSchema = new mongoose.Schema({
//   name: String,
//   userId: { type: String, required: true, index: true },
//   code: String,
//   color: String,
//   credits: Number,
//   priority: String,
//   completed: Boolean,
//   description: String,
//   summary: String,
//   syllabus: String,
//   professor: String,
//   schedule: String,
//   objectives: [String],
//   notes: [
//     {
//       id: Number,
//       title: String,
//       content: String,
//       date: Date,
//       tags: [String],
//       images: [iMAGESchema],
//       questions: String,
//       summary: String,
//     }
//   ],
//   materials: [MaterialSchema]
// }, { timestamps: true });
const ExerciseSchema = new mongoose.Schema({
  id: Number,
  problem: String,
  solution: String,
  date: { type: Date, default: Date.now }
});

const FlashcardSchema = new mongoose.Schema({
  id: Number,
  front: String,
  back: String
});

const ImageSchema = new mongoose.Schema({
  id: Number,
  name: String,
  type: String,
  dataUrl: String,
  date: { type: Date, default: Date.now }
});

const NoteSchema = new mongoose.Schema({
  id: Number,
  title: String,
  content: String,
  date: { type: Date, default: Date.now },
  tags: [String],
  images: [ImageSchema],
  
  // AI-generated fields
  questions: String,
  summary: String,
  exercises: [ExerciseSchema],
  keyConcepts: String,
  flashcards: [FlashcardSchema],
  simpleExplanation: String,
  mindMap: String,
  mindMapData: mongoose.Schema.Types.Mixed,
  quiz: String
});

const MaterialSchema = new mongoose.Schema({
  id: Number,
  name: String,
  type: String,
  content: String,
  url: String,
  date: { type: Date, default: Date.now }
});

const SubjectSchema = new mongoose.Schema({
  id: String,
  name: { type: String, required: true },
  description: String,
  color: { type: String, default: '#3b82f6' },
  summary: String,
  notes: [NoteSchema],
  materials: [MaterialSchema],
   userId: { type: String, required: true, index: true },
}, {
  timestamps: true
});


const ScheduleSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  subjectId: Number,
  topic: String,
  type: String,
  duration: Number,
  priority: String,
  completed: Boolean,
  notes: String,
  id: Number
}, { timestamps: true });

const GoalSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: String,
  deadline: String,
  priority: String,
  description: String,
  completed: Boolean
}, { timestamps: true });

const GradeSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  subjectId: Number,
  name: String,
  grade: Number,
  coefficient: Number,
  type: String,
  date: String
}, { timestamps: true });

const DocumentSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: String,
  type: String,
  size: Number,
  dataUrl: String,
  uploadDate: String,
  category: String
}, { timestamps: true });

const SettingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  notifications: Boolean,
  darkMode: Boolean,
  autoBackup: Boolean,
  studyReminders: Boolean,
  weeklyGoal: Number,
  dailyGoal: Number,
  pomodoroLength: Number,
  breakLength: Number,
  longBreakLength: Number
}, { timestamps: true });

const StatsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  totalHours: Number,
  weeklyGoal: Number,
  streak: Number,
  dailyGoal: Number,
  completionRate: Number,
  averageSession: Number
}, { timestamps: true });

// Models
const Subject = mongoose.model('Subject', SubjectSchema);
const Schedule = mongoose.model('Schedule', ScheduleSchema);
const Goal = mongoose.model('Goal', GoalSchema);
const Grade = mongoose.model('Grade', GradeSchema);
const Document = mongoose.model('Document', DocumentSchema);
const Settings = mongoose.model('Settings', SettingsSchema);
const Stats = mongoose.model('Stats', StatsSchema);

// Middleware to get userId
const getUserId = (req, res, next) => {
  req.userId = req.headers['user-id'];
  next();
};

app.use(getUserId);

// ============ SUBJECTS API ============

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     summary: Get all subjects
 *     tags: [Subjects]
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of subjects
 *       500:
 *         description: Server error
 */
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.userId });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/subjects:
 *   post:
 *     summary: Create a new subject
 *     tags: [Subjects]
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               color:
 *                 type: string
 *               credits:
 *                 type: number
 *     responses:
 *       200:
 *         description: Subject created successfully
 *       500:
 *         description: Server error
 */
app.post('/api/subjects', async (req, res) => {
  try {
    const subject = new Subject({ ...req.body, userId: req.userId });
    console.log(subject);
    await subject.save();
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/subjects/{id}:
 *   put:
 *     summary: Update a subject
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Server error
 */
app.put('/api/subjects/:id', async (req, res) => {
  try {
    const { _id, __v, id, ...updateData } = req.body;
    console.log("updateData", updateData);

    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    res.json(subject);
  } catch (error) {
    console.error("Error updating subject:", error);
    res.status(500).json({ error: error.message, details: error.stack });
  }
});

/**
 * @swagger
 * /api/subjects/{id}:
 *   delete:
 *     summary: Delete a subject
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 *       500:
 *         description: Server error
 */
app.delete('/api/subjects/:id', async (req, res) => {
  try {
    await Subject.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SCHEDULE API ============

/**
 * @swagger
 * /api/schedule:
 *   get:
 *     summary: Get all schedules
 *     tags: [Schedule]
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: List of schedules
 *       500:
 *         description: Server error
 */
app.get('/api/schedule', async (req, res) => {
  try {
    const schedules = await Schedule.find({ userId: req.userId });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/schedule:
 *   post:
 *     summary: Create a new schedule
 *     tags: [Schedule]
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Schedule created
 *       500:
 *         description: Server error
 */
app.post('/api/schedule', async (req, res) => {
  try {
    const schedule = new Schedule({ ...req.body, userId: req.userId });
    await schedule.save();
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/schedule/{id}:
 *   put:
 *     summary: Update a schedule
 *     tags: [Schedule]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Schedule updated
 *       500:
 *         description: Server error
 */
app.put('/api/schedule/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/schedule/{id}:
 *   delete:
 *     summary: Delete a schedule
 *     tags: [Schedule]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Schedule deleted
 *       500:
 *         description: Server error
 */
app.delete('/api/schedule/:id', async (req, res) => {
  try {
    await Schedule.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GOALS API ============

/**
 * @swagger
 * /api/goals:
 *   get:
 *     summary: Get all goals
 *     tags: [Goals]
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: List of goals
 *       500:
 *         description: Server error
 */
app.get('/api/goals', async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/goals:
 *   post:
 *     summary: Create a new goal
 *     tags: [Goals]
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Goal created
 *       500:
 *         description: Server error
 */
app.post('/api/goals', async (req, res) => {
  try {
    const goal = new Goal({ ...req.body, userId: req.userId });
    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/goals/{id}:
 *   put:
 *     summary: Update a goal
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Goal updated
 *       500:
 *         description: Server error
 */
app.put('/api/goals/:id', async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/goals/{id}:
 *   delete:
 *     summary: Delete a goal
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Goal deleted
 *       500:
 *         description: Server error
 */
app.delete('/api/goals/:id', async (req, res) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GRADES API ============

/**
 * @swagger
 * /api/grades:
 *   get:
 *     summary: Get all grades
 *     tags: [Grades]
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: List of grades
 *       500:
 *         description: Server error
 */
app.get('/api/grades', async (req, res) => {
  try {
    const grades = await Grade.find({ userId: req.userId });
    res.json(grades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/grades:
 *   post:
 *     summary: Create a new grade
 *     tags: [Grades]
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Grade created
 *       500:
 *         description: Server error
 */
app.post('/api/grades', async (req, res) => {
  try {
    const grade = new Grade({ ...req.body, userId: req.userId });
    await grade.save();
    res.json(grade);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/grades/{id}:
 *   delete:
 *     summary: Delete a grade
 *     tags: [Grades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Grade deleted
 *       500:
 *         description: Server error
 */
app.delete('/api/grades/:id', async (req, res) => {
  try {
    await Grade.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Grade deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ DOCUMENTS API ============

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get all documents
 *     tags: [Documents]
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: List of documents
 *       500:
 *         description: Server error
 */
app.get('/api/documents', async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.userId });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Upload a new document
 *     tags: [Documents]
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Document uploaded
 *       500:
 *         description: Server error
 */
app.post('/api/documents', async (req, res) => {
  try {
    const document = new Document({ ...req.body, userId: req.userId });
    await document.save();
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Document deleted
 *       500:
 *         description: Server error
 */
app.delete('/api/documents/:id', async (req, res) => {
  try {
    await Document.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SETTINGS API ============

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get user settings
 *     tags: [Settings]
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: User settings
 *       500:
 *         description: Server error
 */
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.userId });
    if (!settings) {
      settings = new Settings({ userId: req.userId });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update user settings
 *     tags: [Settings]
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Settings updated
 *       500:
 *         description: Server error
 */
app.put('/api/settings', async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { userId: req.userId },
      req.body,
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ STATS API ============

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Get user stats
 *     tags: [Stats]
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: User stats
 *       500:
 *         description: Server error
 */
app.get('/api/stats', async (req, res) => {
  try {
    let stats = await Stats.findOne({ userId: req.userId });
    if (!stats) {
      stats = new Stats({ userId: req.userId });
      await stats.save();
    }
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/stats:
 *   put:
 *     summary: Update user stats
 *     tags: [Stats]
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Stats updated
 *       500:
 *         description: Server error
 */
app.put('/api/stats', async (req, res) => {
  try {
    const stats = await Stats.findOneAndUpdate(
      { userId: req.userId },
      req.body,
      { new: true, upsert: true }
    );
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI , {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

