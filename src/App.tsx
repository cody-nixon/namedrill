import { useState } from 'react';
import { useDecks } from '@/hooks/useDecks';
import { Deck, StudyMode } from '@/types';
import { Landing } from '@/components/Landing';
import { Dashboard } from '@/components/Dashboard';
import { DeckView } from '@/components/DeckView';
import { StudySession } from '@/components/StudySession';
import { StudyResults } from '@/components/StudyResults';
import { SessionStats } from '@/types';

type View =
  | { page: 'landing' }
  | { page: 'dashboard' }
  | { page: 'deck'; deckId: string }
  | { page: 'study'; deckId: string; mode: StudyMode }
  | { page: 'results'; deckId: string; stats: SessionStats };

function App() {
  const deckStore = useDecks();
  const [view, setView] = useState<View>(
    deckStore.decks.length > 0 ? { page: 'dashboard' } : { page: 'landing' }
  );

  const currentDeck = view.page === 'deck' || view.page === 'study' || view.page === 'results'
    ? deckStore.decks.find(d => d.id === view.deckId)
    : undefined;

  return (
    <div className="min-h-screen bg-background dark">
      {view.page === 'landing' && (
        <Landing
          onCreateDeck={(name, emoji) => {
            const id = deckStore.addDeck(name, emoji);
            setView({ page: 'deck', deckId: id });
          }}
          onGoToDashboard={() => setView({ page: 'dashboard' })}
          hasDecks={deckStore.decks.length > 0}
        />
      )}

      {view.page === 'dashboard' && (
        <Dashboard
          decks={deckStore.decks}
          onSelectDeck={(id) => setView({ page: 'deck', deckId: id })}
          onCreateDeck={(name, emoji) => {
            const id = deckStore.addDeck(name, emoji);
            setView({ page: 'deck', deckId: id });
          }}
          onDeleteDeck={deckStore.deleteDeck}
          exportData={deckStore.exportData}
          importData={(json) => {
            deckStore.importData(json);
          }}
        />
      )}

      {view.page === 'deck' && currentDeck && (
        <DeckView
          deck={currentDeck}
          onBack={() => setView({ page: 'dashboard' })}
          onStudy={(mode) => setView({ page: 'study', deckId: currentDeck.id, mode })}
          onAddPerson={(person) => deckStore.addPerson(currentDeck.id, person)}
          onDeletePerson={(personId) => deckStore.deletePerson(currentDeck.id, personId)}
          onUpdateDeck={(updates) => deckStore.updateDeck(currentDeck.id, updates)}
        />
      )}

      {view.page === 'study' && currentDeck && (
        <StudySession
          deck={currentDeck}
          mode={view.mode}
          onComplete={(stats) => setView({ page: 'results', deckId: currentDeck.id, stats })}
          onQuit={() => setView({ page: 'deck', deckId: currentDeck.id })}
          onUpdatePerson={(personId, updates) => deckStore.updatePerson(currentDeck.id, personId, updates)}
          onUpdateDeck={(updates) => deckStore.updateDeck(currentDeck.id, updates)}
        />
      )}

      {view.page === 'results' && currentDeck && (
        <StudyResults
          deck={currentDeck}
          stats={view.stats}
          onStudyAgain={(mode) => setView({ page: 'study', deckId: currentDeck.id, mode })}
          onBack={() => setView({ page: 'deck', deckId: currentDeck.id })}
        />
      )}
    </div>
  );
}

export default App;
