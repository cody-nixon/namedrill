import { useState, useEffect, useCallback, useRef } from 'react';
import { Deck, Person, StudyMode, SessionStats } from '@/types';
import { sm2 } from '@/hooks/useDecks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { X, Check, RotateCcw, Zap, Timer } from 'lucide-react';

interface Props {
  deck: Deck;
  mode: StudyMode;
  onComplete: (stats: SessionStats) => void;
  onQuit: () => void;
  onUpdatePerson: (personId: string, updates: Partial<Person>) => void;
  onUpdateDeck: (updates: Partial<Deck>) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getStudyQueue(deck: Deck, mode: StudyMode): Person[] {
  if (mode === 'speed') {
    return shuffle(deck.people);
  }
  const now = Date.now();
  const due = deck.people.filter(p => p.nextReview <= now);
  const notDue = deck.people.filter(p => p.nextReview > now);
  // Study due cards first, then add some non-due for practice
  const queue = shuffle(due.length > 0 ? due : deck.people);
  return queue.slice(0, Math.min(20, queue.length));
}

function getChoices(correct: Person, all: Person[], count: number = 4): Person[] {
  const others = shuffle(all.filter(p => p.id !== correct.id)).slice(0, count - 1);
  return shuffle([correct, ...others]);
}

export function StudySession({ deck, mode, onComplete, onQuit, onUpdatePerson, onUpdateDeck }: Props) {
  const [queue] = useState(() => getStudyQueue(deck, mode));
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<{ correct: boolean; timeMs: number }[]>([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [sessionStart] = useState(Date.now());

  // Flash mode state
  const [flipped, setFlipped] = useState(false);

  // Choice mode state
  const [choices, setChoices] = useState<Person[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Speed mode state
  const [speedInput, setSpeedInput] = useState('');
  const [speedTimeLeft, setSpeedTimeLeft] = useState(60);
  const [speedScore, setSpeedScore] = useState(0);
  const [speedTotal, setSpeedTotal] = useState(0);
  const [speedCurrent, setSpeedCurrent] = useState(0);
  const [speedShowResult, setSpeedShowResult] = useState<'correct' | 'wrong' | null>(null);
  const speedInputRef = useRef<HTMLInputElement>(null);

  const current = mode === 'speed' ? queue[speedCurrent % queue.length] : queue[index];

  // Initialize choices for choice/reverse mode
  useEffect(() => {
    if ((mode === 'choice' || mode === 'reverse') && current) {
      setChoices(getChoices(current, deck.people));
      setSelected(null);
      setShowResult(false);
    }
  }, [index, mode, current]);

  // Speed mode timer
  useEffect(() => {
    if (mode !== 'speed') return;
    if (speedTimeLeft <= 0) {
      onUpdateDeck({ lastStudied: Date.now() });
      onComplete({
        total: speedTotal,
        correct: speedScore,
        timeMs: 60000,
        mode: 'speed',
      });
      return;
    }
    const timer = setInterval(() => setSpeedTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [speedTimeLeft, mode]);

  useEffect(() => {
    if (mode === 'speed') {
      speedInputRef.current?.focus();
    }
  }, [speedCurrent, mode]);

  const recordResult = useCallback((personId: string, correct: boolean) => {
    const quality = correct ? 4 : 1;
    const updates = sm2(deck.people.find(p => p.id === personId)!, quality);
    onUpdatePerson(personId, updates);
  }, [deck.people, onUpdatePerson]);

  const advance = useCallback((correct: boolean) => {
    const timeMs = Date.now() - startTime;
    recordResult(current.id, correct);
    const newResults = [...results, { correct, timeMs }];
    setResults(newResults);

    if (index + 1 >= queue.length) {
      onUpdateDeck({ lastStudied: Date.now() });
      onComplete({
        total: newResults.length,
        correct: newResults.filter(r => r.correct).length,
        timeMs: Date.now() - sessionStart,
        mode,
      });
    } else {
      setIndex(index + 1);
      setStartTime(Date.now());
      setFlipped(false);
    }
  }, [index, queue.length, results, startTime, current, recordResult, onComplete, onUpdateDeck, sessionStart, mode]);

  const handleChoice = (personId: string) => {
    if (showResult) return;
    setSelected(personId);
    setShowResult(true);
    const correct = personId === current.id;
    setTimeout(() => advance(correct), correct ? 500 : 1500);
  };

  const handleSpeedSubmit = () => {
    const guess = speedInput.trim().toLowerCase();
    const answer = current.name.toLowerCase();
    const correct = guess === answer || answer.startsWith(guess) && guess.length >= 2;

    recordResult(current.id, correct);
    setSpeedTotal(t => t + 1);
    if (correct) setSpeedScore(s => s + 1);

    setSpeedShowResult(correct ? 'correct' : 'wrong');
    setSpeedInput('');

    setTimeout(() => {
      setSpeedShowResult(null);
      setSpeedCurrent(c => c + 1);
    }, correct ? 300 : 800);
  };

  if (!current) return null;

  const progressPercent = mode === 'speed'
    ? ((60 - speedTimeLeft) / 60) * 100
    : ((index) / queue.length) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 p-4">
        <Button variant="ghost" size="icon" onClick={onQuit}>
          <X className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <Progress value={progressPercent} className="h-2" />
        </div>
        {mode === 'speed' ? (
          <Badge variant={speedTimeLeft <= 10 ? 'destructive' : 'secondary'} className="font-mono text-lg px-3">
            <Timer className="w-4 h-4 mr-1" />
            {speedTimeLeft}s
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground font-mono">
            {index + 1}/{queue.length}
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full">
        {/* FLASH MODE */}
        {mode === 'flash' && (
          <div className="w-full space-y-6 text-center">
            <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden bg-muted shadow-lg">
              <img src={current.photo} alt="Who is this?" className="w-full h-full object-cover" />
            </div>

            {!flipped ? (
              <>
                <p className="text-lg text-muted-foreground">Who is this?</p>
                <Button size="lg" onClick={() => setFlipped(true)} className="w-full max-w-xs">
                  Show Name
                </Button>
              </>
            ) : (
              <>
                <div>
                  <p className="text-2xl font-bold">{current.name}</p>
                  {current.notes && <p className="text-sm text-muted-foreground mt-1">{current.notes}</p>}
                </div>
                <div className="flex gap-3 w-full max-w-xs mx-auto">
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => advance(false)}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Again
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => advance(true)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Got It
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* CHOICE MODE */}
        {mode === 'choice' && (
          <div className="w-full space-y-6 text-center">
            <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden bg-muted shadow-lg">
              <img src={current.photo} alt="Who is this?" className="w-full h-full object-cover" />
            </div>
            <p className="text-lg text-muted-foreground">Who is this?</p>
            <div className="grid grid-cols-2 gap-3 w-full">
              {choices.map(c => {
                let variant: 'outline' | 'default' | 'destructive' = 'outline';
                if (showResult && c.id === current.id) variant = 'default';
                else if (showResult && c.id === selected) variant = 'destructive';

                return (
                  <Button
                    key={c.id}
                    variant={variant}
                    className={`h-auto py-3 text-sm ${
                      showResult && c.id === current.id ? 'bg-green-600 hover:bg-green-600 text-white' : ''
                    }`}
                    onClick={() => handleChoice(c.id)}
                    disabled={showResult}
                  >
                    {c.name}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* REVERSE MODE */}
        {mode === 'reverse' && (
          <div className="w-full space-y-6 text-center">
            <p className="text-2xl font-bold">{current.name}</p>
            <p className="text-lg text-muted-foreground">Which face?</p>
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto">
              {choices.map(c => {
                let border = 'border-2 border-transparent';
                if (showResult && c.id === current.id) border = 'border-2 border-green-500';
                else if (showResult && c.id === selected) border = 'border-2 border-destructive';

                return (
                  <button
                    key={c.id}
                    className={`aspect-square rounded-xl overflow-hidden bg-muted ${border} transition-all ${
                      !showResult ? 'hover:scale-105 cursor-pointer' : ''
                    }`}
                    onClick={() => handleChoice(c.id)}
                    disabled={showResult}
                  >
                    <img src={c.photo} alt="option" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SPEED MODE */}
        {mode === 'speed' && (
          <div className="w-full space-y-6 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Badge variant="secondary" className="text-lg px-3">
                <Zap className="w-4 h-4 mr-1" />
                {speedScore}/{speedTotal}
              </Badge>
            </div>

            <div
              className={`w-48 h-48 mx-auto rounded-2xl overflow-hidden bg-muted shadow-lg transition-all ${
                speedShowResult === 'correct' ? 'ring-4 ring-green-500' :
                speedShowResult === 'wrong' ? 'ring-4 ring-destructive' : ''
              }`}
            >
              <img src={current.photo} alt="Who is this?" className="w-full h-full object-cover" />
            </div>

            {speedShowResult === 'wrong' && (
              <p className="text-lg font-bold text-destructive">{current.name}</p>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSpeedSubmit(); }} className="max-w-xs mx-auto">
              <Input
                ref={speedInputRef}
                value={speedInput}
                onChange={e => setSpeedInput(e.target.value)}
                placeholder="Type the name..."
                autoFocus
                autoComplete="off"
                className="text-center text-lg"
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
