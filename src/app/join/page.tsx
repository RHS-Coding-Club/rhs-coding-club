'use client';

import { useState } from 'react';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Code, Users, Zap } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

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
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [grade, setGrade] = useState('');
	const [experience, setExperience] = useState('');
	const [interests, setInterests] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name || !email || !grade) {
			toast.error('Please fill out all required fields.');
			return;
		}
		setIsSubmitting(true);
		try {
			const existingPendingMemberQuery = query(collection(db, 'pendingMembers'), where('email', '==', email));
			const existingUserQuery = query(collection(db, 'users'), where('email', '==', email));

			const [pendingSnapshot, userSnapshot] = await Promise.all([
				getDocs(existingPendingMemberQuery),
				getDocs(existingUserQuery)
			]);

			if (!pendingSnapshot.empty) {
				toast.error('You have already submitted an application with this email.');
				return;
			}

			if (!userSnapshot.empty) {
				toast.error('An account with this email already exists.');
				return;
			}

			await addDoc(collection(db, 'pendingMembers'), {
				name,
				email,
				grade,
				experience,
				interests,
				status: 'pending',
				submittedAt: serverTimestamp(),
			});
			toast.success('Application submitted successfully!');
			setName('');
			setEmail('');
			setGrade('');
			setExperience('');
			setInterests('');
		} catch (error) {
			console.error('Error submitting application: ', error);
			toast.error('There was an error submitting your application. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

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
								<CardTitle>Membership Application</CardTitle>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSubmit} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="name">Full Name</Label>
										<Input
											id="name"
											placeholder="Enter your full name"
											value={name}
											onChange={(e) => setName(e.target.value)}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											type="email"
											placeholder="Enter your email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="grade">Grade Level</Label>
										<Input
											id="grade"
											placeholder="e.g., 10th Grade"
											value={grade}
											onChange={(e) => setGrade(e.target.value)}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="experience">Programming Experience</Label>
										<Textarea
											id="experience"
											placeholder="Tell us about your programming background (or lack thereof - beginners welcome!)"
											className="min-h-[100px]"
											value={experience}
											onChange={(e) => setExperience(e.target.value)}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="interests">Areas of Interest</Label>
										<Textarea
											id="interests"
											placeholder="What areas of programming interest you? (e.g., web development, mobile apps, AI, etc.)"
											className="min-h-[100px]"
											value={interests}
											onChange={(e) => setInterests(e.target.value)}
										/>
									</div>
									<Button type="submit" className="w-full" disabled={isSubmitting}>
										{isSubmitting ? 'Submitting...' : 'Submit Application'}
									</Button>
								</form>
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
