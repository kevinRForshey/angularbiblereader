import { Component, effect, inject, signal } from '@angular/core';
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
  readonly selected = this.selection.selectedVerse;


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

  onChange(verseUsfm: string): void {
    const verse = this.verses().find(v => v.usfm === verseUsfm);
    if (verse) {
      this.selection.selectVerse(verse);
    }
  }
}
