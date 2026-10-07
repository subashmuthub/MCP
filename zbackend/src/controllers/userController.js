import User from '../models/userModel.js';

function serialize(row) {
  return {
    id: row._id,
    name: row.name,
    email: row.email,
    role: row.role,
    department: row.department,
    contactInfo: row.contactInfo,
    isActive: row.isActive,
    createdAt: row.createdAt,
  };
}

export async function listUsers(_req, res, next) {
  try {
    const rows = await User.find().sort({ createdAt: -1 }).lean();
    res.json({ data: rows.map(serialize) });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { userId } = req.params;
    const existing = await User.findById(userId);
    if (!existing) return res.status(404).json({ message: 'User not found' });

    const { role, department, contactInfo, isActive, name } = req.body;
    if (role !== undefined) existing.role = role;
    if (department !== undefined) existing.department = department;
    if (contactInfo !== undefined) existing.contactInfo = contactInfo;
    if (isActive !== undefined) existing.isActive = isActive;
    if (name !== undefined) existing.name = name;

    await existing.save();
    res.json({ message: 'User updated', data: serialize(existing) });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { userId } = req.params;
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
}
