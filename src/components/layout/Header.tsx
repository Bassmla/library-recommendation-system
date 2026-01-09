import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from './Navigation';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { handleApiError, showSuccess } from '@/utils/errorHandling';

/**
 * Modern Header component with glass morphism effect
 *
 * Displays logo, navigation links, and user profile dropdown
 */
export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutConfirm(false);
      setShowUserMenu(false);
      showSuccess('Logged out successfully!');
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="glass-effect sticky top-0 z-50 border-b border-white/20 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-xl group-hover:shadow-violet-500/40 transition-all duration-300 group-hover:scale-110">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            </div>
            <span className="text-xl font-bold gradient-text">LibraryAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <Navigation />
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 text-slate-700 hover:text-violet-600 transition-colors font-semibold px-4 py-2 rounded-lg hover:bg-violet-50"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name || user.email}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">{user.name || 'User'}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <Link
                      to="/reading-lists"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Reading Lists
                    </Link>
                    <Link
                      to="/recommendations"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Recommendations
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <hr className="my-2 border-slate-100" />
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-700 hover:text-violet-600 transition-colors font-semibold px-4 py-2 rounded-lg hover:bg-violet-50"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 font-semibold transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-slate-700 hover:text-violet-600 transition-colors p-2 rounded-lg hover:bg-violet-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20 animate-slide-in">
            <Navigation mobile />
            <div className="mt-4 space-y-2">
              {isAuthenticated && user ? (
                <>
                  <div className="px-4 py-2 border-b border-white/20 mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{user.name || 'User'}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/reading-lists"
                    className="block text-slate-700 hover:text-violet-600 transition-colors py-2 px-4 rounded-lg hover:bg-violet-50 font-semibold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Reading Lists
                  </Link>
                  <Link
                    to="/recommendations"
                    className="block text-slate-700 hover:text-violet-600 transition-colors py-2 px-4 rounded-lg hover:bg-violet-50 font-semibold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Recommendations
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block text-slate-700 hover:text-violet-600 transition-colors py-2 px-4 rounded-lg hover:bg-violet-50 font-semibold"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="block w-full text-left text-red-600 hover:bg-red-50 transition-colors py-2 px-4 rounded-lg font-semibold"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-slate-700 hover:text-violet-600 transition-colors py-2 px-4 rounded-lg hover:bg-violet-50 font-semibold"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all text-center font-semibold shadow-lg shadow-violet-500/30"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Confirm Logout"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Are you sure you want to logout?</h3>
              <p className="text-slate-600">
                You will need to login again to access your reading lists and recommendations.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowLogoutConfirm(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {isLoggingOut ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Logging out...
                </>
              ) : (
                'Logout'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </header>
  );
}
