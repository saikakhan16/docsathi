const express = require('express');
const cors = require('cors');

require('./database');

const authRoutes        = require('./routes/auth');
const doctorRoutes      = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const prescriptionRoutes= require('./routes/prescriptions');
const patientRoutes     = require('./routes/patients');

const app = express();
const { PORT } = require('./config');

app.use(cors());
app.use(express.json());

app.use('/api/auth',          authRoutes);
app.use('/api/doctors',       doctorRoutes);
app.use('/api/appointments',  appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/patients',     patientRoutes);

app.listen(PORT, () => console.log(`DocSathi API running on http://localhost:${PORT}`));
