import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts Firebase authentication error codes to user-friendly messages
 */
export function getFirebaseAuthErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred';

  // Extract error code from Firebase error
  const errorObj = error as { code?: string; message?: string };
  const errorCode = errorObj.code || errorObj.message || '';

  // Map Firebase error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    // Popup-related errors
    'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
    'auth/popup-blocked': 'Sign-in popup was blocked by your browser. Please allow popups and try again.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled. Please try again.',

    // Account-related errors
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',

    // Provider-specific errors
    'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in credentials. Try signing in with a different method.',

    // Network and timeout errors
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    'auth/timeout': 'Request timed out. Please try again.',

    // Token and session errors
    'auth/invalid-verification-code': 'Invalid verification code. Please try again.',
    'auth/invalid-verification-id': 'Invalid verification ID. Please try again.',
    'auth/missing-verification-code': 'Please enter the verification code.',
    'auth/code-expired': 'Verification code has expired. Please request a new one.',

    // Generic Firebase errors
    'auth/invalid-credential': 'Invalid credentials. Please check your information and try again.',
    'auth/requires-recent-login': 'Please sign in again to continue.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  };

  // Check if the error code matches any known Firebase error
  for (const [code, message] of Object.entries(errorMessages)) {
    if (errorCode.includes(code)) {
      return message;
    }
  }

  // If it's already a user-friendly message, return it
  if (errorObj.message && typeof errorObj.message === 'string' && !errorObj.message.includes('Firebase:')) {
    return errorObj.message;
  }

  // Fallback for unknown errors
  return 'Something went wrong. Please try again or contact support if the problem persists.';
}
