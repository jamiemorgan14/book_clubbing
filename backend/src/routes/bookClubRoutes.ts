import express from 'express';
import { BookClubService } from '../services/bookClubService';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';

const router = express.Router();

// ... existing routes ...

// List user's book clubs
router.get('/', authenticate, async (req, res, next) => {
  try {
    const bookClubs = await BookClubService.listUserBookClubs(req.user!.id);
    res.json(bookClubs);
  } catch (error) {
    next(error);
  }
});

// List book club members
router.get('/:id/members', authenticate, async (req, res, next) => {
  try {
    const members = await BookClubService.listBookClubMembers(req.params.id, req.user!.id);
    res.json(members);
  } catch (error) {
    next(error);
  }
});

// Update member role
const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'member'])
});

router.patch(
  '/:id/members/:userId',
  authenticate,
  validateRequest({ body: updateMemberRoleSchema }),
  async (req, res, next) => {
    try {
      await BookClubService.updateMemberRole(
        req.params.id,
        req.params.userId,
        req.user!.id,
        req.body.role
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router; 