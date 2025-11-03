'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function SignUpForm() {
  const { user, signUpWithEmail, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });

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
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  // If user is already signed in, show success state
  if (user) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1 
            }}
            className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
          >
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-2"
          >
            <h3 className="text-xl font-semibold text-foreground">You&apos;re All Set!</h3>
            <p className="text-muted-foreground">
              Welcome, {user.displayName || user.email}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full pt-4"
          >
            <Button 
              className="w-full h-12 rounded-xl font-medium" 
              asChild
            >
              <Link href="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/dashboard" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Show signup form if not signed in
  return (
    <div className="w-full">
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
              placeholder="Create a password (min. 6 characters)"
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
            className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg"
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

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/dashboard" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
