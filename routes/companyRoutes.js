import express from 'express';
import verifyToken from '../middleware/verifyToken.js';
import { createCompany, manageDepartments, manageSubDepartments, manageJobTitles } from '../controllers/companyController.js';
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

//create company
router.post('/', verifyToken, upload.single('logo'), createCompany);

// Departments
router.get('/:companyId/departments', verifyToken, manageDepartments.list);
router.post('/departments', verifyToken, manageDepartments.create);
router.delete('/departments/:id', verifyToken, manageDepartments.delete);

// Sub-Departments
router.get('/:companyId/sub-departments', verifyToken, manageSubDepartments.list);
router.post('/sub-departments', verifyToken, manageSubDepartments.create);

// Job Titles
router.get('/:companyId/job-titles', verifyToken, manageJobTitles.list);
router.post('/job-titles', verifyToken, manageJobTitles.create);

export default router;