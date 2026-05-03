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

app.use('/docsathi/api/auth',          authRoutes);
app.use('/docsathi/api/doctors',       doctorRoutes);
app.use('/docsathi/api/appointments',  appointmentRoutes);
app.use('/docsathi/api/prescriptions', prescriptionRoutes);
app.use('/docsathi/api/patients',     patientRoutes);

app.listen(PORT, () => console.log(`DocSathi API running on http://localhost:${PORT}`));
