import { Component, computed, effect, inject, signal } from '@angular/core';
import { BibleApiService } from '../../core/services/bible-api.service';
import { BibleSelectionService } from '../../core/services/bible-selection.service';
import { Verse } from '../../core/models/bible.models';

@Component({
  selector: 'app-verse-selector',
  templateUrl: './verse-selector.html',
  standalone: false,
  styleUrl: './verse-selector.css',
})
export class VerseSelector {
  private readonly api = inject(BibleApiService);
  private readonly selection = inject(BibleSelectionService);

  readonly verses = signal<Verse[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly chapter = this.selection.selectedChapter;
  readonly selectedStart = this.selection.selectedVerse;
  readonly selectedEnd = this.selection.selectedEndVerse;

  /** End-verse options are restricted to verses at or after the chosen start verse. */
  readonly endVerseOptions = computed(() => {
    const start = this.selectedStart();
    if (!start) {
      return [];
    }
    const startNumber = Number(start.usfm.split('.').pop());
    return this.verses().filter(v => Number(v.usfm.split('.').pop()) >= startNumber);
  });

  constructor() {
    effect(() => {
      const version = this.selection.selectedVersion();
      const book = this.selection.selectedBook();
      const chapter = this.selection.selectedChapter();

      this.verses.set([]);
      this.error.set(null);
      if (!version || !book || !chapter) {
        return;
      }

      // chapter only carries a USFM reference "JHN.3"
      const chapterNumber = Number(chapter.usfm.split('.').pop());
      this.loading.set(true);
      this.api.getVerses(version.id, book.usfm, chapterNumber).subscribe({
        next: (verses) => { this.verses.set(verses); this.loading.set(false); },
        error: (err) => { this.error.set('Could not load verses for this chapter'); this.loading.set(false); }
      });
    });
  }

  onStartChange(verseUsfm: string): void {
    const verse = this.verses().find(v => v.usfm === verseUsfm) ?? null;
    this.selection.selectVerse(verse);
  }

  onEndChange(verseUsfm: string): void {
    const verse = this.endVerseOptions().find(v => v.usfm === verseUsfm) ?? null;
    this.selection.selectEndVerse(verse);
  }
}
