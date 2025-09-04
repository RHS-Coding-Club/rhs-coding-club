'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthFormProps {
  onClose?: () => void;
}

export function AuthForm({ onClose }: AuthFormProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('signin');

  // Sign In Form State
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmail(signInData.email, signInData.password);
      onClose?.();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (signUpData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await signUpWithEmail(signUpData.email, signUpData.password, signUpData.displayName);
      onClose?.();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      onClose?.();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
        <p className="text-muted-foreground mt-2">
          Sign in to your account or create a new one
        </p>
      </div>

      <Card className="border shadow-lg bg-background">
        <CardContent className="p-8">
          <div className="w-full">
            <div className="grid grid-cols-2 mb-8 h-12 p-1 bg-muted rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('signin')}
                className={`rounded-lg h-10 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'signin'
                    ? 'bg-background shadow-sm text-foreground border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`rounded-lg h-10 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'signup'
                    ? 'bg-background shadow-sm text-foreground border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === 'signin' && (
                  <motion.div
                    key="signin-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <form onSubmit={handleSignIn} className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="signin-email" className="text-sm font-medium text-foreground">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-12 h-12 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                            value={signInData.email}
                            onChange={(e) =>
                              setSignInData({ ...signInData, email: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="signin-password" className="text-sm font-medium text-foreground">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="signin-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className="pl-12 pr-12 h-12 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                            value={signInData.password}
                            onChange={(e) =>
                              setSignInData({ ...signInData, password: e.target.value })
                            }
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg"
                        >
                          {error}
                        </motion.div>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full h-12 rounded-xl font-medium text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-200 shadow-lg hover:shadow-xl" 
                        disabled={loading}
                      >
                        {loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </form>
                  </motion.div>
                )}

                {activeTab === 'signup' && (
                  <motion.div
                    key="signup-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <form onSubmit={handleSignUp} className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="signup-name" className="text-sm font-medium text-foreground">
                          Full Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="Enter your full name"
                            className="pl-12 h-12 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                            value={signUpData.displayName}
                            onChange={(e) =>
                              setSignUpData({ ...signUpData, displayName: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="signup-email" className="text-sm font-medium text-foreground">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-12 h-12 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                            value={signUpData.email}
                            onChange={(e) =>
                              setSignUpData({ ...signUpData, email: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="signup-password" className="text-sm font-medium text-foreground">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a password"
                            className="pl-12 pr-12 h-12 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                            value={signUpData.password}
                            onChange={(e) =>
                              setSignUpData({ ...signUpData, password: e.target.value })
                            }
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="signup-confirm" className="text-sm font-medium text-foreground">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="signup-confirm"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            className="pl-12 h-12 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                            value={signUpData.confirmPassword}
                            onChange={(e) =>
                              setSignUpData({ ...signUpData, confirmPassword: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg"
                        >
                          {error}
                        </motion.div>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full h-12 rounded-xl font-medium text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-200 shadow-lg hover:shadow-xl" 
                        disabled={loading}
                      >
                        {loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-muted-foreground/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 text-muted-foreground font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full mt-6 h-12 rounded-xl border-2 border-border bg-background text-foreground hover:bg-muted/50 transition-all duration-200 font-medium"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <FcGoogle className="mr-3 h-5 w-5" />
              Continue with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
