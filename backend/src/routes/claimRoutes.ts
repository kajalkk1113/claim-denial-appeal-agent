import { Router } from 'express';
import multer from 'multer';
import {
  createClaim,
  deleteClaim,
  getClaim,
  getClaimDocument,
  getClaimStats,
  listClaims,
  updateClaim,
} from '../controllers/claimController';
import { authenticate } from '../middleware/authenticate';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    if (file.mimetype !== 'application/pdf' || !file.originalname.toLowerCase().endsWith('.pdf')) {
      callback(new Error('Only PDF documents are accepted.'));
      return;
    }
    callback(null, true);
  },
});

const router = Router();

router.use(authenticate);
router.get('/stats', getClaimStats);
router.get('/', listClaims);
router.post('/', upload.single('document'), createClaim);
router.get('/:id/document', getClaimDocument);
router.get('/:id', getClaim);
router.put('/:id', upload.single('document'), updateClaim);
router.delete('/:id', deleteClaim);

export default router;
