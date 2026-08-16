import { Component, effect, inject, signal } from '@angular/core';
import { BibleApiService } from '../../core/services/bible-api.service';
import { BibleSelectionService } from '../../core/services/bible-selection.service';
import { Chapter } from '../../core/models/bible.models';

@Component({
  selector: 'app-chapter-selector',
  templateUrl: './chapter-selector.html',
  styleUrl: './chapter-selector.css',
})
export class ChapterSelector {
  private readonly api = inject(BibleApiService);
  private readonly selection = inject(BibleSelectionService);

  readonly chapters = signal<Chapter[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly book = this.selection.selectedBook;
  readonly selected = this.selection.selectedChapter;

  constructor() {
    effect(() => {
      const version = this.selection.selectedVersion();
      const book = this.selection.selectedBook();
      this.chapters.set([]);
      this.error.set(null);
      if (!version || !book) {
        return;
      }

      this.loading.set(true);
      this.api.getChapters(version.id, book.usfm).subscribe({
        next: (chapters) => {
          this.chapters.set(chapters);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Could not load chapters for this book');
          this.loading.set(false);
        }
      });
    });
  }

  onChange(chapterUsfm: string): void {
    const chapter = this.chapters().find(c => c.usfm === chapterUsfm);
    if (chapter) this.selection.selectChapter(chapter);
  }
}
