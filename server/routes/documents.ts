import { Router } from 'express';
import { db } from '../lib/db';
import { documents } from '../schema';
import { eq, like } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get all documents with optional search
router.get('/', requireAuth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = db.select().from(documents);
    
    if (search) {
      query = query.where(like(documents.name, `%${search}%`));
    }
    
    const docs = await query;
    res.json(docs);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get a single document by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const doc = await db
      .select()
      .from(documents)
      .where(eq(documents.id, req.params.id))
      .limit(1);
    
    if (!doc.length) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json(doc[0]);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

export default router;
