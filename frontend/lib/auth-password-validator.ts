/**
 * GroundUp AI - Enterprise Password Strength Validation Protocol
 * Standard Security Requirements: Minimum 12 characters, Aa case mix, and BOTH number and symbol.
 */

export interface PasswordAnalysisResult {
  score: number;
  label: string;
  colorClass: string;
  textColor: string;
  widthPercent: number;
  hasMinLength: boolean;
  hasCaseMix: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  hasNumberAndSymbol: boolean;
  isValid: boolean;
}

export function analyzePasswordStrength(password: string): PasswordAnalysisResult {
  const pwd = password || '';
  const hasMinLength = pwd.length >= 12;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasCaseMix = hasUpper && hasLower;
  const hasNumber = /[0-9]/.test(pwd);
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
  const hasNumberAndSymbol = hasNumber && hasSymbol;

  // Modern Enterprise Protocol: 12-character minimum is a non-negotiable floor
  if (pwd.length === 0) {
    return {
      score: 0,
      label: 'Too short',
      colorClass: 'bg-rose-500',
      textColor: 'text-rose-600',
      widthPercent: 15,
      hasMinLength: false,
      hasCaseMix: false,
      hasNumber: false,
      hasSymbol: false,
      hasNumberAndSymbol: false,
      isValid: false,
    };
  }

  if (!hasMinLength) {
    return {
      score: 1,
      label: 'Weak (minimum 12 characters required)',
      colorClass: 'bg-rose-500',
      textColor: 'text-rose-600',
      widthPercent: Math.min(30, Math.max(15, Math.round((pwd.length / 12) * 30))),
      hasMinLength: false,
      hasCaseMix,
      hasNumber,
      hasSymbol,
      hasNumberAndSymbol,
      isValid: false,
    };
  }

  if (!hasCaseMix || !hasNumber || !hasSymbol) {
    let missingReason = 'Fair (add numbers and symbols)';
    if (!hasCaseMix) {
      missingReason = 'Fair (add uppercase & lowercase mix)';
    } else if (!hasNumber && !hasSymbol) {
      missingReason = 'Fair (add number and symbol)';
    } else if (!hasSymbol) {
      missingReason = 'Fair (add a symbol, e.g. !@#$)';
    } else if (!hasNumber) {
      missingReason = 'Fair (add a number, e.g. 0-9)';
    }

    return {
      score: 2,
      label: missingReason,
      colorClass: 'bg-amber-500',
      textColor: 'text-amber-600',
      widthPercent: 65,
      hasMinLength: true,
      hasCaseMix,
      hasNumber,
      hasSymbol,
      hasNumberAndSymbol,
      isValid: false,
    };
  }

  return {
    score: 4,
    label: 'Strong password',
    colorClass: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    widthPercent: 100,
    hasMinLength: true,
    hasCaseMix: true,
    hasNumber: true,
    hasSymbol: true,
    hasNumberAndSymbol: true,
    isValid: true,
  };
}
