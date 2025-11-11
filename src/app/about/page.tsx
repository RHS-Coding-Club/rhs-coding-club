'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github, Mail } from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Officer } from '@/lib/firebase-collections';
import { useClubSettings } from '@/contexts/club-settings-context';

export default function AboutPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings: clubSettings } = useClubSettings();

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const officersQuery = query(
          collection(db, 'officers'),
          where('isActive', '==', true),
          orderBy('order', 'asc')
        );
        const querySnapshot = await getDocs(officersQuery);
        const officersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Officer[];
        setOfficers(officersData);
      } catch (error) {
        console.error('Error fetching officers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficers();
  }, []);
  return (
    <div className="py-20">
      <Container>
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">About {clubSettings?.clubName || 'RHS Coding Club'}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {clubSettings?.description || 'Empowering the next generation of developers through collaborative learning, innovative projects, and a supportive community.'}
            </p>
          </div>
          
          {/* Mission & Goals Section */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-center">Our Mission & Goals</h2>
            
            <Card className="border-2">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center text-lg leading-relaxed">
                  {clubSettings?.missionStatement || 'The RHS Coding Club is dedicated to fostering a community of passionate student developers who are eager to learn, innovate, and create through programming. We provide a supportive environment where students can develop their technical skills, collaborate on projects, and prepare for future careers in technology.'}
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Learn & Grow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Provide comprehensive learning opportunities through workshops, tutorials, 
                    and hands-on projects for all skill levels.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🤝</span>
                    Collaborate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Build meaningful connections and work together on innovative projects 
                    that make a real impact in our community.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🚀</span>
                    Innovate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Encourage creativity and innovation through hackathons, competitions, 
                    and cutting-edge technology exploration.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Officers Section */}
          <section className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Meet Our Officers</h2>
              <p className="text-muted-foreground">
                The dedicated team leading our club and supporting every member&apos;s journey.
              </p>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading officers...</p>
              </div>
            ) : officers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No officers available at the moment.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {officers.map((officer) => (
                  <Card key={officer.id} className="text-center space-y-4">
                    <CardHeader className="space-y-4">
                      <div className="flex justify-center">
                        <Avatar className="w-24 h-24">
                          <AvatarImage src={officer.imageUrl} alt={officer.name || 'Officer'} />
                          <AvatarFallback className="text-xl">
                            {officer.name ? officer.name.split(' ').map(n => n[0]).join('') : 'O'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <CardTitle className="text-xl">{officer.name}</CardTitle>
                        <Badge variant="secondary" className="mt-2">
                          {officer.role}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {officer.bio}
                      </p>
                      <div className="flex justify-center gap-3">
                        {officer.githubUrl && (
                          <a 
                            href={officer.githubUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 rounded-full hover:bg-accent transition-colors"
                            aria-label={`${officer.name}'s GitHub`}
                          >
                            <Github className="w-5 h-5" />
                          </a>
                        )}
                        <a 
                          href={`mailto:${officer.email}`}
                          className="p-2 rounded-full hover:bg-accent transition-colors"
                          aria-label={`Email ${officer.name}`}
                        >
                          <Mail className="w-5 h-5" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Meeting Info & Activities Section */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-center">Join Our Community</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📅</span>
                    Meeting Information
                  </CardTitle>
                  <CardDescription>When and where we meet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold">Regular Meetings</p>
                      <p className="text-muted-foreground">Thursdays, 12:17 PM - 12:56 PM</p>
                    </div>
                    <div>
                      <p className="font-semibold">Location</p>
                      <p className="text-muted-foreground">Room C3</p>
                    </div>
                    <div>
                      <p className="font-semibold">Workshop Sessions</p>
                      <p className="text-muted-foreground">Fridays, 3:30 PM - 4:30 PM</p>
                    </div>
                    <div>
                      <p className="font-semibold">Hackathon Prep</p>
                      <p className="text-muted-foreground">Saturdays, 10:00 AM - 2:00 PM (Monthly)</p>
                    </div>
                  </div>
                  <Button className="w-full" asChild>
                    <a href="/join">Join the Club</a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    What We Do
                  </CardTitle>
                  <CardDescription>Our activities and programs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-primary">•</span>
                      <div>
                        <p className="font-medium">Weekly Coding Workshops</p>
                        <p className="text-sm text-muted-foreground">Learn new technologies and frameworks</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary">•</span>
                      <div>
                        <p className="font-medium">Collaborative Projects</p>
                        <p className="text-sm text-muted-foreground">Build real-world applications together</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary">•</span>
                      <div>
                        <p className="font-medium">Coding Competitions</p>
                        <p className="text-sm text-muted-foreground">Participate in hackathons and contests</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary">•</span>
                      <div>
                        <p className="font-medium">Industry Connections</p>
                        <p className="text-sm text-muted-foreground">Network with professionals and alumni</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary">•</span>
                      <div>
                        <p className="font-medium">Peer Mentoring</p>
                        <p className="text-sm text-muted-foreground">Support each other&apos;s learning journey</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center space-y-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4">Ready to Start Coding?</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Whether you&apos;re a complete beginner or an experienced programmer, 
                  everyone is welcome! Join our vibrant community of student developers 
                  and take your coding skills to the next level.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button size="lg" asChild>
                    <a href="/join">Join the Club</a>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <a href="/contact">Contact Us</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </Container>
    </div>
  );
}
