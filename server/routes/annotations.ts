import { Router } from 'express';
import { db } from '@/lib/db';
import { z } from 'zod';
import { authenticated } from '@/middleware/auth';
import { nanoid } from 'nanoid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const router = Router();

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

const annotationSchema = z.object({
  type: z.enum(['text', 'highlight', 'comment', 'stamp', 'signature']),
  content: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    pageNumber: z.number(),
  }),
  stampType: z.string().optional(),
  color: z.string().optional(),
});

// Get all annotations for a document
router.get('/documents/:documentId/annotations', authenticated, async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const annotations = await db.query.annotations.findMany({
      where: {
        documentId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json(annotations);
  } catch (error) {
    console.error('Failed to fetch annotations:', error);
    res.status(500).json({ error: 'Failed to fetch annotations' });
  }
});

// Add annotation to a document
router.post('/documents/:documentId/annotations', authenticated, async (req, res) => {
  try {
    const { documentId } = req.params;
    const parsedBody = annotationSchema.parse(req.body);
    
    const annotation = await db.insert.annotations.create({
      data: {
        id: nanoid(),
        documentId,
        userId: req.user.id,
        ...parsedBody,
        createdAt: new Date().toISOString(),
      },
    });

    res.json(annotation);
  } catch (error) {
    console.error('Failed to create annotation:', error);
    res.status(500).json({ error: 'Failed to create annotation' });
  }
});

// Delete an annotation
router.delete('/documents/:documentId/annotations/:annotationId', authenticated, async (req, res) => {
  try {
    const { documentId, annotationId } = req.params;
    
    await db.query.annotations.delete({
      where: {
        id: annotationId,
        documentId,
        userId: req.user.id,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete annotation:', error);
    res.status(500).json({ error: 'Failed to delete annotation' });
  }
});

// Get saved signatures
router.get('/signatures', authenticated, async (req, res) => {
  try {
    const signatures = await db.query.signatures.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(signatures);
  } catch (error) {
    console.error('Failed to fetch signatures:', error);
    res.status(500).json({ error: 'Failed to fetch signatures' });
  }
});

// Save a new signature
router.post('/signatures', authenticated, async (req, res) => {
  try {
    const { signature } = req.body;
    
    // Convert base64 to buffer
    const buffer = Buffer.from(signature.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    
    // Upload to S3
    const key = `signatures/${req.user.id}/${nanoid()}.png`;
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
    }));

    const savedSignature = await db.insert.signatures.create({
      data: {
        id: nanoid(),
        userId: req.user.id,
        preview: `${process.env.S3_URL}/${key}`,
        createdAt: new Date().toISOString(),
      },
    });

    res.json(savedSignature);
  } catch (error) {
    console.error('Failed to save signature:', error);
    res.status(500).json({ error: 'Failed to save signature' });
  }
});

// Delete a signature
router.delete('/signatures/:signatureId', authenticated, async (req, res) => {
  try {
    const { signatureId } = req.params;
    
    await db.query.signatures.delete({
      where: {
        id: signatureId,
        userId: req.user.id,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete signature:', error);
    res.status(500).json({ error: 'Failed to delete signature' });
  }
});

// Create mobile signing session
router.post('/documents/:documentId/mobile-signing', authenticated, async (req, res) => {
  try {
    const { documentId } = req.params;
    
    // Create a temporary signing session that expires in 15 minutes
    const session = await db.insert.signingSession.create({
      data: {
        id: nanoid(),
        documentId,
        userId: req.user.id,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      },
    });

    const signingUrl = `${process.env.APP_URL}/mobile-sign/${session.id}`;
    
    res.json({
      url: signingUrl,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error('Failed to create mobile signing session:', error);
    res.status(500).json({ error: 'Failed to create mobile signing session' });
  }
});

export default router;
