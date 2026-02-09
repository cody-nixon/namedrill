import { useState, useRef } from 'react';
import { Deck, Person, StudyMode } from '@/types';
import { createPerson, getDueCount, getMastery } from '@/hooks/useDecks';
import { compressImage } from '@/lib/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, Plus, Trash2, Brain, Zap, FlipHorizontal, Timer,
  ImagePlus, Users, X
} from 'lucide-react';

interface Props {
  deck: Deck;
  onBack: () => void;
  onStudy: (mode: StudyMode) => void;
  onAddPerson: (person: Person) => void;
  onDeletePerson: (personId: string) => void;
  onUpdateDeck: (updates: Partial<Deck>) => void;
}

const STUDY_MODES: { mode: StudyMode; icon: React.ReactNode; label: string; desc: string }[] = [
  { mode: 'flash', icon: <Brain className="w-5 h-5" />, label: 'Classic Flash', desc: 'See face, recall name, self-grade' },
  { mode: 'choice', icon: <FlipHorizontal className="w-5 h-5" />, label: 'Multiple Choice', desc: 'See face, pick from 4 names' },
  { mode: 'reverse', icon: <Users className="w-5 h-5" />, label: 'Reverse', desc: 'See name, pick from 4 faces' },
  { mode: 'speed', icon: <Zap className="w-5 h-5" />, label: 'Speed Round', desc: '60 seconds, type names fast' },
];

export function DeckView({ deck, onBack, onStudy, onAddPerson, onDeletePerson, onUpdateDeck }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const due = getDueCount(deck);
  const mastery = getMastery(deck);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setIsLoading(true);
    try {
      // If multiple files and no name set, batch add
      if (files.length > 1) {
        for (const file of Array.from(files)) {
          const photo = await compressImage(file);
          const name = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
          onAddPerson(createPerson(name, photo));
        }
        setIsLoading(false);
        return;
      }
      const photo = await compressImage(files[0]);
      setNewPhoto(photo);
    } catch (err) {
      console.error('Photo compression failed:', err);
    }
    setIsLoading(false);
  };

  const handleAdd = () => {
    if (newName.trim() && newPhoto) {
      onAddPerson(createPerson(newName.trim(), newPhoto, newNotes.trim() || undefined));
      setNewName('');
      setNewNotes('');
      setNewPhoto(null);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="text-2xl">{deck.emoji}</span>
        <h1 className="text-xl font-bold flex-1">{deck.name}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold">{deck.people.length}</div>
            <div className="text-xs text-muted-foreground">People</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold">{mastery}%</div>
            <div className="text-xs text-muted-foreground">Mastery</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold">{due}</div>
            <div className="text-xs text-muted-foreground">Due</div>
          </CardContent>
        </Card>
      </div>

      {deck.people.length > 0 && (
        <div className="mb-6">
          <Progress value={mastery} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground text-center">
            {mastery === 100 ? '🎉 All names mastered!' : `${deck.people.filter(p => p.interval >= 7).length} of ${deck.people.length} names mastered`}
          </p>
        </div>
      )}

      {/* Study Modes */}
      {deck.people.length >= 2 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Study</h2>
          <div className="grid grid-cols-2 gap-3">
            {STUDY_MODES.map(({ mode, icon, label, desc }) => (
              <Button
                key={mode}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 text-center"
                onClick={() => onStudy(mode)}
                disabled={mode === 'choice' && deck.people.length < 4 || mode === 'reverse' && deck.people.length < 4}
              >
                {icon}
                <div>
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
                {mode !== 'speed' && due > 0 && (
                  <Badge variant="secondary" className="text-xs">{due} due</Badge>
                )}
              </Button>
            ))}
          </div>
          {deck.people.length < 4 && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Add at least 4 people to unlock Multiple Choice and Reverse modes
            </p>
          )}
        </div>
      )}

      {/* Add Person */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">People</h2>

        {!showAdd ? (
          <Button variant="outline" className="w-full" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Person
          </Button>
        ) : (
          <Card className="mb-4">
            <CardContent className="pt-6 space-y-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoSelect}
              />

              {!newPhoto ? (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 transition-colors"
                  disabled={isLoading}
                >
                  <ImagePlus className="w-8 h-8" />
                  <span className="text-sm">{isLoading ? 'Processing...' : 'Upload photo(s)'}</span>
                  <span className="text-xs">Select multiple for batch add</span>
                </button>
              ) : (
                <div className="relative w-32 h-32 mx-auto">
                  <img src={newPhoto} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  <button
                    onClick={() => setNewPhoto(null)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {newPhoto && (
                <>
                  <Input
                    placeholder="Name"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    autoFocus
                  />
                  <Input
                    placeholder="Notes (optional)"
                    value={newNotes}
                    onChange={e => setNewNotes(e.target.value)}
                  />
                </>
              )}

              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => { setShowAdd(false); setNewPhoto(null); setNewName(''); setNewNotes(''); }}>
                  Cancel
                </Button>
                {newPhoto && (
                  <Button className="flex-1" onClick={handleAdd} disabled={!newName.trim()}>
                    Add
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* People Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {deck.people.map(person => (
          <div key={person.id} className="group relative">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img src={person.photo} alt={person.name} className="w-full h-full object-cover" />
            </div>
            <p className="text-sm font-medium mt-1 text-center line-clamp-1">{person.name}</p>
            {person.totalCount > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                {Math.round((person.correctCount / person.totalCount) * 100)}% accuracy
              </p>
            )}
            <button
              onClick={() => {
                if (confirm(`Remove ${person.name}?`)) onDeletePerson(person.id);
              }}
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/90 text-destructive-foreground rounded-full p-1"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {deck.people.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ImagePlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No people yet. Add some faces to start learning!</p>
        </div>
      )}
    </div>
  );
}
