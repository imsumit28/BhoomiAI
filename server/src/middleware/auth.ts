import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../../../../shared/types';

const JWT_SECRET = process.env.JWT_SECRET || 'bhoomi_setu_ai_sih2026_secret_key_gov_portal';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    department: string;
    district?: string;
  };
}

export function generateToken(user: { id: string; email: string; role: UserRole; name: string; department?: string; district?: string }) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department || 'Revenue Dept',
      district: user.district || 'Sehore',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For seamless local testing, default to Admin user if no token is passed
    req.user = {
      id: 'demo-admin-id',
      email: 'admin@bhoomi.gov.in',
      role: 'admin',
      name: 'Dr. Alok Verma (District Magistrate)',
      department: 'Revenue & Land Administration',
      district: 'Sehore',
    };
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

export function authorize(roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of: [${roles.join(', ')}]. Current role: ${req.user.role}`,
      });
    }

    next();
  };
}
