import MaintenanceTicket from '../models/maintenanceTicketModel.js';
import User from '../models/userModel.js';

function serializeTicket(row) {
  return {
    id: row._id,
    equipmentId: row.equipmentId,
    equipmentName: row.equipmentName,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    technicianId: row.technicianId,
    technicianName: row.technicianName,
    cost: row.cost,
    assignedAt: row.assignedAt,
    resolvedAt: row.resolvedAt,
    createdAt: row.createdAt,
  };
}

export async function listTickets(req, res, next) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    // Technicians see only their tickets
    if (req.user.role === 'technician') {
      filter.technicianId = req.user.id;
    }
    const rows = await MaintenanceTicket.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ data: rows.map(serializeTicket) });
  } catch (error) {
    next(error);
  }
}

export async function createTicket(req, res, next) {
  try {
    const { equipmentId, equipmentName, title, description, priority, technicianId, cost } = req.body;
    if (!equipmentId || !title) {
      return res.status(400).json({ message: 'equipmentId and title are required' });
    }

    let techName = null;
    if (technicianId) {
      const tech = await User.findById(technicianId).lean();
      techName = tech?.name || null;
    }

    const ticket = await MaintenanceTicket.create({
      equipmentId,
      equipmentName: equipmentName || 'Unknown Equipment',
      title: title.trim(),
      description: description?.trim(),
      priority: priority || 'medium',
      status: 'open',
      technicianId: technicianId || null,
      technicianName: techName,
      cost: Number(cost || 0),
      assignedAt: technicianId ? new Date() : null,
    });

    res.status(201).json({ message: 'Ticket created', data: serializeTicket(ticket) });
  } catch (error) {
    next(error);
  }
}

export async function updateTicket(req, res, next) {
  try {
    const { ticketId } = req.params;
    const existing = await MaintenanceTicket.findById(ticketId);
    if (!existing) return res.status(404).json({ message: 'Ticket not found' });

    const { title, description, priority, status, technicianId, cost } = req.body;
    if (title !== undefined) existing.title = title.trim();
    if (description !== undefined) existing.description = description.trim();
    if (priority !== undefined) existing.priority = priority;
    if (cost !== undefined) existing.cost = Number(cost);

    if (status !== undefined) {
      existing.status = status;
      if (status === 'resolved') existing.resolvedAt = new Date();
    }

    if (technicianId !== undefined) {
      existing.technicianId = technicianId || null;
      if (technicianId) {
        const tech = await User.findById(technicianId).lean();
        existing.technicianName = tech?.name || null;
        existing.assignedAt = new Date();
      } else {
        existing.technicianName = null;
        existing.assignedAt = null;
      }
    }

    await existing.save();
    res.json({ message: 'Ticket updated', data: serializeTicket(existing) });
  } catch (error) {
    next(error);
  }
}

export async function deleteTicket(req, res, next) {
  try {
    const { ticketId } = req.params;
    const deleted = await MaintenanceTicket.findByIdAndDelete(ticketId);
    if (!deleted) return res.status(404).json({ message: 'Ticket not found' });
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    next(error);
  }
}
