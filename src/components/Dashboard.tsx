import { useState } from 'react';
import { Deck } from '@/types';
import { getDueCount, getMastery } from '@/hooks/useDecks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Brain, Plus, Trash2, Download, Upload, Users } from 'lucide-react';

const EMOJIS = ['📚', '💼', '🎓', '🏢', '👥', '🎪', '🏥', '⚽', '🎵', '🌍'];

interface Props {
  decks: Deck[];
  onSelectDeck: (id: string) => void;
  onCreateDeck: (name: string, emoji: string) => void;
  onDeleteDeck: (id: string) => void;
  exportData: () => string;
  importData: (json: string) => void;
}

export function Dashboard({ decks, onSelectDeck, onCreateDeck, onDeleteDeck, exportData, importData }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📚');

  const handleCreate = () => {
    if (name.trim()) {
      onCreateDeck(name.trim(), emoji);
      setName('');
      setShowCreate(false);
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'namedrill-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        importData(text);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">NameDrill</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleExport} title="Export backup">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleImport} title="Import backup">
            <Upload className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {decks.map(deck => {
          const due = getDueCount(deck);
          const mastery = getMastery(deck);
          return (
            <Card
              key={deck.id}
              className="cursor-pointer hover:border-primary/50 transition-colors group"
              onClick={() => onSelectDeck(deck.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{deck.emoji}</span>
                    <div>
                      <h3 className="font-semibold line-clamp-1">{deck.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {deck.people.length} {deck.people.length === 1 ? 'person' : 'people'}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${deck.name}"?`)) onDeleteDeck(deck.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mastery</span>
                    <span className="font-medium">{mastery}%</span>
                  </div>
                  <Progress value={mastery} className="h-2" />
                  {due > 0 && (
                    <Badge variant="secondary" className="mt-2">
                      {due} due for review
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Create new deck card */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer border-dashed hover:border-primary/50 transition-colors flex items-center justify-center min-h-[150px]">
              <CardContent className="flex flex-col items-center gap-2 pt-6">
                <Plus className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">New Deck</span>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Deck</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
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
                placeholder="Deck name"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
              <Button className="w-full" onClick={handleCreate} disabled={!name.trim()}>
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {decks.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">
          Create your first deck to get started learning names!
        </p>
      )}
    </div>
  );
}
