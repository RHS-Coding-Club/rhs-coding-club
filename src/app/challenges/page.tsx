import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Users } from 'lucide-react';

const challenges = [
  {
    title: 'Two Sum Problem',
    difficulty: 'Easy',
    description: 'Given an array of integers, return indices of two numbers that add up to a target.',
    participants: 45,
    timeLimit: '30 minutes',
    points: 100,
    status: 'Active',
  },
  {
    title: 'Binary Tree Traversal',
    difficulty: 'Medium',
    description: 'Implement inorder, preorder, and postorder traversal of a binary tree.',
    participants: 32,
    timeLimit: '45 minutes',
    points: 200,
    status: 'Active',
  },
  {
    title: 'Dynamic Programming Challenge',
    difficulty: 'Hard',
    description: 'Solve the longest common subsequence problem using dynamic programming.',
    participants: 18,
    timeLimit: '60 minutes',
    points: 300,
    status: 'Completed',
  },
];

export default function ChallengesPage() {
  return (
    <div className="py-20">
      <Container>
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Coding Challenges</h1>
            <p className="text-lg text-muted-foreground">
              Test your programming skills with our weekly coding challenges.
            </p>
          </div>

          <div className="grid gap-6">
            {challenges.map((challenge, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{challenge.title}</CardTitle>
                      <p className="text-muted-foreground">{challenge.description}</p>
                    </div>
                    <Badge variant={challenge.difficulty === 'Easy' ? 'default' : 
                                   challenge.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {challenge.participants} participants
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {challenge.timeLimit}
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        {challenge.points} points
                      </div>
                    </div>
                    <Button variant="outline" disabled={challenge.status === 'Completed'}>
                      {challenge.status === 'Active' ? 'Start Challenge' : 'Completed'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
