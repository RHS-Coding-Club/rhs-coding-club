import { Container } from '@/components/container';
import { generatePageMetadata } from '@/lib/metadata';

export const metadata = generatePageMetadata({
  title: 'Privacy Policy',
  description: 'Learn how RHS Coding Club collects, uses, and protects your personal information.',
  url: '/privacy',
});

export default function PrivacyPage() {
  return (
    <Container className="py-12 max-w-4xl">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h1 className="text-responsive-3xl font-bold mb-8">Privacy Policy</h1>
        
        <p className="text-responsive-base text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-responsive-2xl font-semibold mb-4">Introduction</h2>
          <p className="text-responsive-base leading-relaxed mb-4">
            RHS Coding Club (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) respects your privacy and is committed to protecting your personal information. 
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-responsive-2xl font-semibold mb-4">Information We Collect</h2>
          
          <h3 className="text-responsive-xl font-medium mb-3">Personal Information</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Name and email address (when you join the club or subscribe to our newsletter)</li>
            <li>School information (student ID, graduation year)</li>
            <li>Project submissions and challenge solutions</li>
            <li>Event attendance and participation records</li>
          </ul>

          <h3 className="text-responsive-xl font-medium mb-3">Automatically Collected Information</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>IP address and device information</li>
            <li>Browser type and version</li>
            <li>Pages visited and time spent on our website</li>
            <li>Referring website information</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-responsive-2xl font-semibold mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>To provide club services and manage memberships</li>
            <li>To communicate about events, meetings, and club activities</li>
            <li>To track participation in challenges and competitions</li>
            <li>To improve our website and services</li>
            <li>To send newsletters and updates (with your consent)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-responsive-2xl font-semibold mb-4">Information Sharing</h2>
          <p className="text-responsive-base leading-relaxed mb-4">
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>To school administrators for educational purposes</li>
            <li>When required by law or to protect our rights</li>
            <li>With service providers who assist in club operations (under strict confidentiality)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-responsive-2xl font-semibold mb-4">Data Security</h2>
          <p className="text-responsive-base leading-relaxed mb-4">
            We implement appropriate security measures to protect your personal information against unauthorized access, 
            alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-responsive-2xl font-semibold mb-4">Your Rights</h2>
          <p className="text-responsive-base leading-relaxed mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of communications</li>
            <li>Withdraw consent for data processing</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-responsive-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-responsive-base leading-relaxed">
            If you have questions about this Privacy Policy or want to exercise your rights, 
            please contact us at{' '}
            <a 
              href="mailto:privacy@rhscodingclub.com" 
              className="text-primary hover:underline"
            >
              privacy@rhscodingclub.com
            </a>.
          </p>
        </section>
      </div>
    </Container>
  );
}
