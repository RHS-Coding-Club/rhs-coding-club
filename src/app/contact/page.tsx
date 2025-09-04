import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="py-20">
      <Container>
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Contact Us</h1>
            <p className="text-lg text-muted-foreground">
              Have questions? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john.doe@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="What is this about?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us more..."
                    className="min-h-[120px]"
                  />
                </div>
                <Button className="w-full">Send Message</Button>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-medium">Email</h4>
                      <p className="text-sm text-muted-foreground">
                        tbd
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-medium">Location</h4>
                      <p className="text-sm text-muted-foreground">
                        C3<br />
                        Ripon High School<br />
                        301 N Acacia Ave, Ripon, CA 95366
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-medium">Meeting Times</h4>
                      <p className="text-sm text-muted-foreground">
                        Thursdays: 12:17 PM - 12:56 PM<br />
                        (During school year)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Faculty Advisor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium">Mr. Sean Derrick</h4>
                    <p className="text-sm text-muted-foreground">
                      Computer Science Teacher
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Email: sderrick@riponusd.net
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Room: C3
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Club Officers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h5 className="font-medium">President: Jonathon Salinas</h5>
                    <p className="text-sm text-muted-foreground">
                      tbd - email
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium">Vice President: Jashanpreet Singh</h5>
                    <p className="text-sm text-muted-foreground">
                      tbd - email
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium">Secretary: Landen Morse</h5>
                    <p className="text-sm text-muted-foreground">
                      tbd - email
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
