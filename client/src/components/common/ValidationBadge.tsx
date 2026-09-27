import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { ValidationStatus, VerificationStatus } from '../../../../shared/types';

export const ValidationBadge: React.FC<{ status: ValidationStatus }> = ({ status }) => {
  switch (status) {
    case 'passed':
      return (
        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
          PASSED (वैध)
        </span>
      );
    case 'warning':
      return (
        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
          WARNING (सतर्कता)
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
          <XCircle className="w-3.5 h-3.5 mr-1 text-red-600" />
          FAILED (त्रुटिपूर्ण)
        </span>
      );
    case 'needs_review':
    default:
      return (
        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
          <Clock className="w-3.5 h-3.5 mr-1 text-blue-600" />
          REVIEW NEEDED
        </span>
      );
  }
};

export const VerificationBadge: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  switch (status) {
    case 'verified':
    case 'auto_approved':
      return (
        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
          {status === 'auto_approved' ? 'AUTO APPROVED' : 'VERIFIED (सत्यापित)'}
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
          <XCircle className="w-3.5 h-3.5 mr-1 text-red-600" />
          REJECTED (अस्वीकृत)
        </span>
      );
    case 'in_review':
      return (
        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
          <Clock className="w-3.5 h-3.5 mr-1 text-purple-600" />
          IN REVIEW
        </span>
      );
    case 'pending':
    default:
      return (
        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
          <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
          PENDING (लंबित)
        </span>
      );
  }
};
