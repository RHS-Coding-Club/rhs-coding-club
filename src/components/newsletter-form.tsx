'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { newsletterSubscribersCollection } from '@/lib/firebase-collections';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address.');
        return;
      }

      // Check if email already exists in Firestore
      const q = query(newsletterSubscribersCollection, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast.error('This email is already subscribed to our newsletter.');
        return;
      }

      // Add to Firestore
      await addDoc(newsletterSubscribersCollection, {
        email,
        subscribedAt: serverTimestamp(),
      });

      // Add to Brevo via API
      const response = await fetch('/api/newsletter-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success("You've been successfully subscribed to our newsletter!");
        setEmail('');
      } else {
        // Even if Brevo fails, we've already added to Firestore
        toast.success("You've been subscribed! (Email service temporarily unavailable)");
        setEmail('');
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center space-x-2">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Subscribing...' : 'Subscribe'}
      </Button>
    </form>
  );
}
