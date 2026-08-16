import { Injectable, computed, signal } from '@angular/core';
import { BibleVersionSummary, Book, Chapter, Verse } from '../models/bible.models'; 

@Injectable({ providedIn: 'root' })
export class BibleSelectionService {
  private readonly _selectedVersion = signal<BibleVersionSummary | null>(null);
  private readonly _selectedBook = signal<Book | null>(null);
  private readonly _selectedChapter = signal<Chapter | null>(null);
  private readonly _selectedVerse = signal<Verse | null>(null);
  private readonly _selectedEndVerse = signal<Verse | null>(null);

  readonly selectedVersion = this._selectedVersion.asReadonly();
  readonly selectedBook = this._selectedBook.asReadonly();
  readonly selectedChapter = this._selectedChapter.asReadonly();
  readonly selectedVerse = this._selectedVerse.asReadonly();
  readonly selectedEndVerse = this._selectedEndVerse.asReadonly();

  /** Builds a USFM reference: whole chapter, a single verse, or a "start-end" verse range. */
  readonly displayUsfm = computed<string | null>(() => {
    const chapter = this._selectedChapter();
    if (!chapter) {
      return null;
    }

    const start = this._selectedVerse();
    if (!start) {
      return chapter.usfm;
    }

    const end = this._selectedEndVerse();
    if (!end || end.usfm === start.usfm) {
      return start.usfm;
    }

    const startNumber = start.usfm.split('.').pop();
    const endNumber = end.usfm.split('.').pop();
    return `${chapter.usfm}.${startNumber}-${endNumber}`;
  });

  selectVersion(version: BibleVersionSummary): void {
    this._selectedVersion.set(version);
    this._selectedBook.set(null);
    this._selectedChapter.set(null);
    this._selectedVerse.set(null);
    this._selectedEndVerse.set(null);
  }


  selectBook(book: Book): void {
    this._selectedBook.set(book);
    this._selectedChapter.set(null);
    this._selectedVerse.set(null);
    this._selectedEndVerse.set(null);
  }

  selectChapter(chapter: Chapter): void {
    this._selectedChapter.set(chapter);
    this._selectedVerse.set(null);
    this._selectedEndVerse.set(null);
  }

  selectVerse(verse: Verse | null): void {
    this._selectedVerse.set(verse);
    this._selectedEndVerse.set(null);
  }

  selectEndVerse(verse: Verse | null): void {
    this._selectedEndVerse.set(verse);
  }
}
