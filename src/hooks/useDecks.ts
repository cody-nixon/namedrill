import { useState, useEffect, useCallback } from 'react';
import { Deck, Person } from '@/types';

const STORAGE_KEY = 'namedrill_decks';

function loadDecks(): Deck[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDecks(decks: Deck[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 10);
}

export function createPerson(name: string, photo: string, notes?: string): Person {
  return {
    id: generateId(),
    name,
    photo,
    notes,
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    nextReview: Date.now(),
    correctCount: 0,
    totalCount: 0,
  };
}

// SM-2 algorithm
export function sm2(person: Person, quality: number): Partial<Person> {
  // quality: 0-5 (0=total blank, 5=perfect recall)
  let { interval, easeFactor, repetitions } = person;

  if (quality >= 3) {
    // correct
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  } else {
    // incorrect - reset
    repetitions = 0;
    interval = 0;
  }

  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  return {
    interval,
    easeFactor,
    repetitions,
    nextReview: Date.now() + interval * 86400000,
    lastReviewed: Date.now(),
    correctCount: person.correctCount + (quality >= 3 ? 1 : 0),
    totalCount: person.totalCount + 1,
  };
}

export function getDueCount(deck: Deck): number {
  const now = Date.now();
  return deck.people.filter(p => p.nextReview <= now).length;
}

export function getMastery(deck: Deck): number {
  if (deck.people.length === 0) return 0;
  const mastered = deck.people.filter(p => p.interval >= 7).length;
  return Math.round((mastered / deck.people.length) * 100);
}

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>(loadDecks);

  useEffect(() => {
    saveDecks(decks);
  }, [decks]);

  const addDeck = useCallback((name: string, emoji: string) => {
    const deck: Deck = {
      id: generateId(),
      name,
      emoji,
      createdAt: Date.now(),
      people: [],
    };
    setDecks(prev => [...prev, deck]);
    return deck.id;
  }, []);

  const updateDeck = useCallback((id: string, updates: Partial<Deck>) => {
    setDecks(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const deleteDeck = useCallback((id: string) => {
    setDecks(prev => prev.filter(d => d.id !== id));
  }, []);

  const addPerson = useCallback((deckId: string, person: Person) => {
    setDecks(prev => prev.map(d =>
      d.id === deckId ? { ...d, people: [...d.people, person] } : d
    ));
  }, []);

  const updatePerson = useCallback((deckId: string, personId: string, updates: Partial<Person>) => {
    setDecks(prev => prev.map(d =>
      d.id === deckId
        ? { ...d, people: d.people.map(p => p.id === personId ? { ...p, ...updates } : p) }
        : d
    ));
  }, []);

  const deletePerson = useCallback((deckId: string, personId: string) => {
    setDecks(prev => prev.map(d =>
      d.id === deckId ? { ...d, people: d.people.filter(p => p.id !== personId) } : d
    ));
  }, []);

  const exportData = useCallback(() => {
    return JSON.stringify(decks, null, 2);
  }, [decks]);

  const importData = useCallback((json: string) => {
    try {
      const imported = JSON.parse(json);
      if (Array.isArray(imported)) {
        setDecks(imported);
        return true;
      }
    } catch { /* ignore */ }
    return false;
  }, []);

  return {
    decks,
    addDeck,
    updateDeck,
    deleteDeck,
    addPerson,
    updatePerson,
    deletePerson,
    exportData,
    importData,
  };
}
