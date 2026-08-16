import { Component, effect, inject, signal } from '@angular/core';
import { BibleApiService } from '../../core/services/bible-api.service';
import { BibleSelectionService } from '../../core/services/bible-selection.service';
import { Book } from '../../core/models/bible.models';

@Component({
  selector: 'app-book-selector',
  templateUrl: './book-selector.html',
  styleUrl: './book-selector.css',
})
export class BookSelector {
  private readonly api = inject(BibleApiService);
  private readonly selection = inject(BibleSelectionService);

  readonly books = signal<Book[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly version = this.selection.selectedVersion;

  readonly selected = this.selection.selectedBook;
  constructor() {
    effect(() => {
      const version = this.selection.selectedVersion();
      this.books.set([]);
      this.error.set(null);
      if (!version) {
        return;
      }

      this.loading.set(true);
      this.api.getBooks(version.id).subscribe({
        next: (books) => { this.books.set(books); this.loading.set(false); },
        error: () => { this.error.set('Could not load books for this version'); this.loading.set(false); }
      });
    });
  }

  onChange(bookUsfm: string): void {
    const book = this.books().find(b => b.usfm === bookUsfm);
    if (book) {
      this.selection.selectBook(book);
    }
  }
}
