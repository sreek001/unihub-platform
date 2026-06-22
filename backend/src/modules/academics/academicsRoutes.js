const express = require('express');
const router = express.Router();

const { verifyToken } = require('./authMiddleware');
const {
  getSemesters,
  getSubjects,
  getMaterials,
  createMaterial,
  getAggregateResources,
} = require('./academicsController');

// ─── Academics Routes ───
router.get('/resources', getAggregateResources);
router.get('/semesters', getSemesters);
router.get('/subjects', getSubjects);
router.get('/materials', getMaterials);
router.post('/materials', verifyToken, createMaterial);

module.exports = router;
