import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { handleApiError, showSuccess } from '@/utils/errorHandling';

/**
 * EmailVerification component props
 */
interface EmailVerificationProps {
  email: string;
  onVerificationComplete: () => void;
}

/**
 * Email verification component for confirming user registration
 */
export function EmailVerification({ email, onVerificationComplete }: EmailVerificationProps) {
  const { confirmEmail, resendVerificationCode } = useAuth();
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      await confirmEmail(email, verificationCode.trim());
      showSuccess('Email verified successfully! You can now login.');
      onVerificationComplete();
      navigate('/login');
    } catch (error: any) {
      console.error('Verification error:', error);
      
      // Handle specific Cognito errors
      if (error.name === 'CodeMismatchException') {
        setError('Invalid verification code. Please check and try again.');
      } else if (error.name === 'ExpiredCodeException') {
        setError('Verification code has expired. Please request a new one.');
      } else if (error.name === 'LimitExceededException') {
        setError('Too many attempts. Please wait before trying again.');
      } else {
        setError('Failed to verify email. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');

    try {
      await resendVerificationCode(email);
      showSuccess('Verification code sent! Check your email.');
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30 mb-6">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
            Verify Your Email
          </h2>
          <p className="text-slate-600">
            We've sent a verification code to <strong>{email}</strong>
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Check your email and enter the 6-digit code below
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerifyEmail}>
          <div>
            <Input
              label="Verification Code"
              type="text"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value);
                setError('');
              }}
              placeholder="Enter 6-digit code"
              required
              maxLength={6}
              className="text-center text-lg tracking-widest"
              autoComplete="one-time-code"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="space-y-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isVerifying || !verificationCode.trim()}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-slate-600">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="font-semibold text-violet-600 hover:text-violet-500 disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend code'}
                </button>
              </p>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                ← Back to signup
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}