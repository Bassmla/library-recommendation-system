import { useLocation, Navigate } from 'react-router-dom';
import { EmailVerification } from '@/components/auth/EmailVerification';

/**
 * VerifyEmail page component
 */
export function VerifyEmail() {
  const location = useLocation();
  const email = location.state?.email;

  // Redirect to signup if no email is provided
  if (!email) {
    return <Navigate to="/signup" replace />;
  }

  const handleVerificationComplete = () => {
    // This will be handled by the EmailVerification component
    // which navigates to login after successful verification
  };

  return (
    <EmailVerification 
      email={email} 
      onVerificationComplete={handleVerificationComplete}
    />
  );
}