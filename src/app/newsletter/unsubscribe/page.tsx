'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { newsletterSubscribersCollection } from '@/lib/firebase-collections';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const errorParam = searchParams.get('error');

    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }

    if (errorParam) {
      switch (errorParam) {
        case 'missing-email':
          setError('Email address is required for unsubscription.');
          break;
        case 'invalid-email':
          setError('Invalid email address provided.');
          break;
        case 'server-error':
          setError('A server error occurred. Please try again.');
          break;
      }
    }
  }, [searchParams]);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        setLoading(false);
        return;
      }

      // Find and remove from Firestore
      const q = query(newsletterSubscribersCollection, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Email not found in our newsletter list.');
        setLoading(false);
        return;
      }

      // Delete from Firestore
      const docToDelete = querySnapshot.docs[0];
      await deleteDoc(docToDelete.ref);

      // Remove from Brevo via API
      const response = await fetch('/api/newsletter-unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      await response.json();

      if (response.ok) {
        setUnsubscribed(true);
        toast.success('Successfully unsubscribed from newsletter');
      } else {
        // Even if Brevo fails, we've already removed from Firestore
        setUnsubscribed(true);
        toast.success('Unsubscribed from our records (email service may take time to update)');
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (unsubscribed) {
    return (
      <div className="py-20">
        <Container>
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold">
                You&apos;ve Been Unsubscribed
              </h1>
              <p className="text-lg text-muted-foreground">
                You have successfully unsubscribed from the RHS Coding Club newsletter.
                We&apos;re sorry to see you go!
              </p>
            </div>
            <Card className="text-left">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    If you change your mind, you can always subscribe again by visiting our website.
                  </p>
                  <div className="flex gap-4">
                    <Button asChild>
                      <Link href="/">Return to Homepage</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/contact">Contact Us</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-20">
      <Container>
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground" />
            <h1 className="text-3xl md:text-4xl font-bold">
              Unsubscribe from Newsletter
            </h1>
            <p className="text-lg text-muted-foreground">
              We&apos;re sorry to see you go. Enter your email address to unsubscribe from our newsletter.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Unsubscribe Request</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="flex items-center gap-2 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <form onSubmit={handleUnsubscribe} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <p className="text-sm text-muted-foreground">
                    This should be the email address you used to subscribe to our newsletter.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Unsubscribing...' : 'Unsubscribe'}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/">Cancel</Link>
                  </Button>
                </div>
              </form>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">What happens when you unsubscribe?</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• You&apos;ll stop receiving our newsletter emails</li>
                  <li>• Your email will be removed from our mailing list</li>
                  <li>• You can re-subscribe anytime from our website</li>
                  <li>• It may take up to 24 hours for the change to take effect</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background">
      <Container>
        <div className="py-20">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold">Loading...</h1>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UnsubscribeContent />
    </Suspense>
  );
}
