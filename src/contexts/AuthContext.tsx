/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { signIn, signUp, signOut, getCurrentUser, confirmSignUp, resendSignUpCode, fetchAuthSession } from 'aws-amplify/auth';

/**
 * Authentication context type definition
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<{ needsVerification: boolean }>;
  confirmEmail: (email: string, code: string) => Promise<void>;
  resendVerificationCode: (email: string) => Promise<void>;
}

/**
 * Authentication context
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Get user role from Cognito groups
 */
const getUserRole = async (): Promise<'admin' | 'moderator' | 'user'> => {
  try {
    const session = await fetchAuthSession();
    const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] || [];
    
    console.log('User groups:', groups); // Debug log
    
    // Check groups in order of precedence (highest to lowest)
    if (groups.includes('admin')) {
      return 'admin';
    }
    if (groups.includes('moderator')) {
      return 'moderator';
    }
    
    return 'user'; // Default role
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'user'; // Fallback to user role
  }
};
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();
      const email = user.signInDetails?.loginId || '';
      
      // Get user role from Cognito groups
      const role = await getUserRole();
      
      setUser({
        id: user.userId,
        email: email,
        name: email, // Use email as display name
        role: role,
        createdAt: new Date().toISOString(),
      });
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  checkAuth();
}, []);

const login = async (email: string, password: string) => {
  try {
    const { isSignedIn } = await signIn({ username: email, password });
    if (isSignedIn) {
      const user = await getCurrentUser();
      
      // Get user role from Cognito groups
      const role = await getUserRole();
      
      setUser({
        id: user.userId,
        email: email,
        name: email, // Use email as display name
        role: role,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

const logout = async () => {
  try {
    await signOut();
    setUser(null);
  } catch (error) {
    console.error('Logout error:', error);
  }
};

const signup = async (email: string, password: string, name: string) => {
  try {
    const result = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          name,
        },
      },
    });
    
    // Return whether verification is needed
    return {
      needsVerification: !result.isSignUpComplete
    };
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

const confirmEmail = async (email: string, code: string) => {
  try {
    await confirmSignUp({
      username: email,
      confirmationCode: code,
    });
  } catch (error) {
    console.error('Email confirmation error:', error);
    throw error;
  }
};

const resendVerificationCode = async (email: string) => {
  try {
    await resendSignUpCode({
      username: email,
    });
  } catch (error) {
    console.error('Resend verification code error:', error);
    throw error;
  }
};

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signup,
    confirmEmail,
    resendVerificationCode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
