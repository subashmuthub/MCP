import Feedback from '../models/feedbackModel.js';
import Equipment from '../models/equipmentModel.js';

function serialize(row) {
  return {
    id: row._id,
    equipmentId: row.equipmentId,
    equipmentName: row.equipmentName,
    userId: row.userId,
    userName: row.userName,
    rating: row.rating,
    comment: row.comment,
    timestamp: row.timestamp,
    createdAt: row.createdAt,
  };
}

export async function listFeedback(req, res, next) {
  try {
    const filter = {};
    if (req.query.equipmentId) filter.equipmentId = req.query.equipmentId;
    if (req.query.rating) filter.rating = Number(req.query.rating);
    // Viewers see only their own feedback
    if (req.user.role === 'viewer') filter.userId = req.user.id;
    const rows = await Feedback.find(filter).sort({ timestamp: -1 }).lean();
    res.json({ data: rows.map(serialize) });
  } catch (error) {
    next(error);
  }
}

export async function createFeedback(req, res, next) {
  try {
    const { equipmentId, rating, comment } = req.body;
    if (!equipmentId || !rating) {
      return res.status(400).json({ message: 'equipmentId and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'rating must be between 1 and 5' });
    }
    const equipment = await Equipment.findById(equipmentId).lean();
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' });

    const fb = await Feedback.create({
      equipmentId,
      equipmentName: equipment.name,
      userId: req.user.id,
      userName: req.user.name,
      rating: Number(rating),
      comment: comment?.trim(),
      timestamp: new Date(),
    });

    res.status(201).json({ message: 'Feedback submitted', data: serialize(fb) });
  } catch (error) {
    next(error);
  }
}

export async function deleteFeedback(req, res, next) {
  try {
    const { feedbackId } = req.params;
    const deleted = await Feedback.findByIdAndDelete(feedbackId);
    if (!deleted) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ message: 'Feedback deleted' });
  } catch (error) {
    next(error);
  }
}
