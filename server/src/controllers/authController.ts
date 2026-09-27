import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { generateToken, AuthRequest } from '../middleware/auth';
import { AuditService } from '../services/audit/AuditService';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password credentials' });
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
      district: user.district,
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        district: user.district,
        state: user.state,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
}

export async function quickDemoLogin(req: Request, res: Response) {
  try {
    const { role } = req.body;
    const targetRole = role || 'admin';

    let user = await User.findOne({ role: targetRole });
    if (!user) {
      user = await User.findOne();
    }

    if (!user) {
      return res.status(404).json({ error: 'No demo users available. Please run database seed.' });
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
      district: user.district,
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        district: user.district,
        state: user.state,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.json({ user: req.user });
    }

    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function listUsers(req: Request, res: Response) {
  try {
    const users = await User.find().select('-passwordHash');
    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
