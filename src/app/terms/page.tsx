import { Container } from '@/components/container';
import { generatePageMetadata } from '@/lib/metadata';

export const metadata = generatePageMetadata({
  title: 'Terms of Service',
  description: 'Terms and conditions for using RHS Coding Club website and services.',
  url: '/terms',
});

export default function TermsPage() {
  return (
    <Container className="py-12 max-w-4xl">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h1 className="text-responsive-3xl font-bold mb-8">Terms of Service</h1>
        
        <p className="text-responsive-base text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-responsive-2xl font-semibold mb-4">Acceptance of Terms</h2>
          <p className="text-responsive-base leading-relaxed mb-4">
            By accessing and using the RHS Coding Club website and services, you accept and agree to be bound by 
            these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-responsive-2xl font-semibold mb-4">Membership Requirements</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Must be a current Ripon High School student</li>
            <li>Must maintain good academic standing</li>
            <li>Must follow school policies and club guidelines</li>
            <li>Must treat all members with respect and kindness</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-responsive-2xl font-semibold mb-4">Code of Conduct</h2>
          <p className="text-responsive-base leading-relaxed mb-4">As a member of RHS Coding Club, you agree to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Be respectful and inclusive in all interactions</li>
            <li>Not engage in harassment, discrimination, or bullying</li>
            <li>Give proper attribution for code and ideas from others</li>
            <li>Not submit plagiarized work in challenges or projects</li>
            <li>Follow ethical programming practices</li>
            <li>Respect intellectual property rights</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-responsive-2xl font-semibold mb-4">User Content</h2>
          <p className="text-responsive-base leading-relaxed mb-4">
            When you submit projects, code, or other content to the club:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>You retain ownership of your original work</li>
            <li>You grant the club permission to display and share your work for educational purposes</li>
            <li>You confirm that your submission is your original work or properly attributed</li>
            <li>You agree not to submit inappropriate, offensive, or harmful content</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-responsive-2xl font-semibold mb-4">Website Usage</h2>
          <p className="text-responsive-base leading-relaxed mb-4">You agree to use our website responsibly and not to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with website functionality or other users&apos; experience</li>
            <li>Use automated tools to scrape or harvest data</li>
            <li>Post spam, malicious code, or inappropriate content</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-responsive-2xl font-semibold mb-4">Intellectual Property</h2>
          <p className="text-responsive-base leading-relaxed mb-4">
            The club&apos;s educational materials, website design, and original content are protected by intellectual property laws. 
            You may use these materials for personal learning but not for commercial purposes without permission.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-responsive-2xl font-semibold mb-4">Limitation of Liability</h2>
          <p className="text-responsive-base leading-relaxed mb-4">
            RHS Coding Club and its organizers are not liable for any damages arising from your use of our services, 
            participation in club activities, or reliance on information provided through our programs.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-responsive-2xl font-semibold mb-4">Termination</h2>
          <p className="text-responsive-base leading-relaxed mb-4">
            We reserve the right to terminate or suspend your membership and access to our services if you violate 
            these terms, engage in misconduct, or are no longer eligible for membership.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-responsive-2xl font-semibold mb-4">Changes to Terms</h2>
          <p className="text-responsive-base leading-relaxed mb-4">
            We may update these Terms of Service from time to time. We will notify members of significant changes 
            and post the updated terms on our website. Continued use of our services constitutes acceptance of the new terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-responsive-2xl font-semibold mb-4">Contact Information</h2>
          <p className="text-responsive-base leading-relaxed">
            For questions about these Terms of Service, please contact us at{' '}
            <a 
              href="mailto:contact@rhscoding.club" 
              className="text-primary hover:underline"
            >
              contact@rhscoding.club
            </a>.
          </p>
        </section>
      </div>
    </Container>
  );
}
