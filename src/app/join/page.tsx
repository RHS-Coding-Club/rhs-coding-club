'use client';

import Link from 'next/link';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Code, Users, Zap, Github, ArrowRight } from 'lucide-react';
import { SignUpForm } from '@/components/auth';

const benefits = [
	{
		icon: Code,
		title: 'Learn Programming',
		description: 'Master multiple programming languages with hands-on guidance',
	},
	{
		icon: Users,
		title: 'Build Network',
		description: 'Connect with peers and industry professionals',
	},
	{
		icon: Zap,
		title: 'Real Projects',
		description: 'Work on actual projects that make a difference',
	},
];

export default function JoinPage() {
	return (
		<div className="py-20">
			<Container>
				<div className="max-w-4xl mx-auto space-y-12">
					<div className="text-center space-y-4">
						<h1 className="text-4xl md:text-5xl font-bold">Join RHS Coding Club</h1>
						<p className="text-lg text-muted-foreground">
							Ready to start your programming journey? Join our community today!
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 mb-12">
						{benefits.map((benefit, index) => (
							<Card key={index} className="text-center">
								<CardHeader>
									<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
										<benefit.icon className="h-6 w-6 text-primary" />
									</div>
									<CardTitle>{benefit.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground">{benefit.description}</p>
								</CardContent>
							</Card>
						))}
					</div>

					<div className="grid md:grid-cols-2 gap-12">
						<Card>
							<CardHeader>
								<CardTitle>Create Your Account</CardTitle>
								<CardDescription>
									Sign up to access the platform and explore our features
								</CardDescription>
							</CardHeader>
							<CardContent>
								<SignUpForm />
								
								<div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
									<div className="flex items-start gap-3">
										<ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
										<div className="space-y-1">
											<h4 className="font-medium text-sm">Apply for Membership</h4>
											<p className="text-sm text-muted-foreground">
												After signing up, go to your dashboard to submit your official membership application
											</p>
											<Button variant="link" className="h-auto p-0 text-sm" asChild>
												<Link href="/dashboard">
													Go to Dashboard <ArrowRight className="ml-1 h-3 w-3" />
												</Link>
											</Button>
										</div>
									</div>
								</div>
								
								<div className="pt-4 border-t mt-6">
									<div className="text-center space-y-2">
										<p className="text-sm text-muted-foreground">Already a member?</p>
										<Button variant="outline" className="w-full" asChild>
											<Link href="/github-membership">
												<Github className="h-4 w-4 mr-2" />
												Join our GitHub Organization
											</Link>
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>

						<div className="space-y-8">
							<Card>
								<CardHeader>
									<CardTitle>What to Expect</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-start gap-3">
										<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
										<div>
											<h4 className="font-medium">Weekly Meetings</h4>
											<p className="text-sm text-muted-foreground">
												Every Thursday from 12:17 PM to 12:56 PM
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
										<div>
											<h4 className="font-medium">Hands-on Learning</h4>
											<p className="text-sm text-muted-foreground">
												Interactive workshops and coding sessions
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
										<div>
											<h4 className="font-medium">Project Collaboration</h4>
											<p className="text-sm text-muted-foreground">
												Work on real projects with fellow members
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
										<div>
											<h4 className="font-medium">Competition Opportunities</h4>
											<p className="text-sm text-muted-foreground">
												Participate in coding competitions and hackathons
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Requirements</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									<p className="text-sm text-muted-foreground">
										• Must be a current RHS student
									</p>
									<p className="text-sm text-muted-foreground">
										• Willingness to learn and collaborate
									</p>
									<p className="text-sm text-muted-foreground">
										• Regular attendance at meetings
									</p>
									<p className="text-sm text-muted-foreground">
										• No prior programming experience required!
									</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</Container>
		</div>
	);
}
