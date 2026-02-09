import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Plus, ArrowRight } from 'lucide-react';

const EMOJIS = ['📚', '💼', '🎓', '🏢', '👥', '🎪', '🏥', '⚽'];

interface Props {
  onCreateDeck: (name: string, emoji: string) => void;
  onGoToDashboard: () => void;
  hasDecks: boolean;
}

export function Landing({ onCreateDeck, onGoToDashboard, hasDecks }: Props) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📚');
  const [showCreate, setShowCreate] = useState(false);

  const handleCreate = () => {
    if (name.trim()) {
      onCreateDeck(name.trim(), emoji);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4">
            <Brain className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">NameDrill</h1>
          <p className="text-xl text-muted-foreground">Never forget a name again</p>
          <p className="text-muted-foreground max-w-md mx-auto">
            Upload photos, learn names through gamified flashcard drills with spaced repetition.
            Perfect for teachers, managers, salespeople, and anyone who meets lots of new faces.
          </p>
        </div>

        {!showCreate ? (
          <div className="space-y-3">
            <Button size="lg" className="w-full max-w-xs" onClick={() => setShowCreate(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Deck
            </Button>
            {hasDecks && (
              <Button variant="ghost" size="lg" className="w-full max-w-xs" onClick={onGoToDashboard}>
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        ) : (
          <Card className="max-w-sm mx-auto">
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-2 justify-center flex-wrap">
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`text-2xl p-2 rounded-lg transition-all ${
                      emoji === e ? 'bg-primary/20 scale-110' : 'hover:bg-muted'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Deck name (e.g., Fall 2026 — Period 3)"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleCreate} disabled={!name.trim()}>
                  Create Deck
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-3 gap-4 pt-8 text-center">
          {[
            { icon: '🎯', label: 'Multiple Choice', desc: 'See face, pick name' },
            { icon: '⚡', label: 'Speed Round', desc: '60s rapid fire' },
            { icon: '🧠', label: 'Spaced Repetition', desc: 'Science-backed recall' },
          ].map(f => (
            <div key={f.label} className="space-y-1">
              <div className="text-2xl">{f.icon}</div>
              <div className="text-sm font-medium">{f.label}</div>
              <div className="text-xs text-muted-foreground">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
