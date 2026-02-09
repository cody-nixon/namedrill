import { Deck, SessionStats, StudyMode } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getMastery } from '@/hooks/useDecks';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, RotateCcw, Trophy, Target, Clock, Zap } from 'lucide-react';

interface Props {
  deck: Deck;
  stats: SessionStats;
  onStudyAgain: (mode: StudyMode) => void;
  onBack: () => void;
}

export function StudyResults({ deck, stats, onStudyAgain, onBack }: Props) {
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const mastery = getMastery(deck);
  const timeStr = stats.mode === 'speed'
    ? '60s'
    : `${Math.round(stats.timeMs / 1000)}s`;

  const emoji = accuracy >= 90 ? '🏆' : accuracy >= 70 ? '👏' : accuracy >= 50 ? '💪' : '📚';
  const message = accuracy >= 90
    ? 'Outstanding! You\'re a name master!'
    : accuracy >= 70
    ? 'Great job! Keep practicing!'
    : accuracy >= 50
    ? 'Good effort! Review will help.'
    : 'Keep at it — practice makes perfect!';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="text-6xl mb-4">{emoji}</div>
        <h1 className="text-2xl font-bold">Session Complete!</h1>
        <p className="text-muted-foreground">{message}</p>

        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <Target className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-xl font-bold">{accuracy}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <Trophy className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-xl font-bold">{stats.correct}/{stats.total}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-xl font-bold">{timeStr}</div>
              <div className="text-xs text-muted-foreground">Time</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Deck Mastery</span>
            <span className="font-medium">{mastery}%</span>
          </div>
          <Progress value={mastery} className="h-3" />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button className="flex-1" onClick={() => onStudyAgain(stats.mode)}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Study Again
          </Button>
        </div>
      </div>
    </div>
  );
}
