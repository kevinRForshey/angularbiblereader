import { Injectable, computed, signal } from '@angular/core';
import { BibleVersionSummary, Book, Chapter, Verse } from '../models/bible.models'; 

@Injectable({ providedIn: 'root' })
export class BibleSelectionService {
  private readonly _selectedVersion = signal<BibleVersionSummary | null>(null);
  private readonly _selectedBook = signal<Book | null>(null);
  private readonly _selectedChapter = signal<Chapter | null>(null);
  private readonly _selectedVerse = signal<Verse | null>(null);

  readonly selectedVersion = this._selectedVersion();
  readonly selectedBook = this._selectedBook();
  readonly selectedChapter = this._selectedChapter();
  readonly selectedVerse = this._selectedVerse();


  readonly displayUsfm = computed<string | null>(
    () => this._selectedVerse()?.usfm ?? this._selectedChapter()?.usfm ?? null
  );

  selectVersion(version: BibleVersionSummary): void {
    this._selectedVersion.set(version);
    this._selectedBook.set(null);
    this._selectedChapter.set(null);
    this._selectedVerse.set(null);
  }


  selectBook(book: Book): void {
    this._selectedBook.set(book);
    this._selectedChapter.set(null);
    this._selectedVerse.set(null);
  }

  selectChapter(chapter: Chapter): void {
    this._selectedChapter.set(chapter);
    this._selectedVerse.set(null);
  }

  selectVerse(verse: Verse): void {
    this._selectedVerse.set(verse);
  }


}
