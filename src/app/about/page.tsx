import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="py-20">
      <Container>
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">About RHS Coding Club</h1>
            <p className="text-lg text-muted-foreground">
              Learn about our mission, vision, and the amazing community of student developers.
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The RHS Coding Club is dedicated to fostering a community of passionate student developers 
                who are eager to learn, innovate, and create through programming. We provide a supportive 
                environment where students can develop their technical skills, collaborate on projects, 
                and prepare for future careers in technology.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>What We Do</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Weekly coding workshops and tutorials</li>
                  <li>Collaborative project development</li>
                  <li>Coding competitions and challenges</li>
                  <li>Guest speaker sessions</li>
                  <li>Peer mentoring and support</li>
                  <li>Industry networking events</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Join Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Whether you&apos;re a complete beginner or an experienced programmer, 
                  everyone is welcome! We believe that the best way to learn is by doing, 
                  and we&apos;re here to support you every step of the way.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
