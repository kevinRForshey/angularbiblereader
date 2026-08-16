import { Component, effect, inject, signal } from '@angular/core';
import { BibleApiService } from '../../core/services/bible-api.service';
import { BibleSelectionService } from '../../core/services/bible-selection.service';
import { Passage } from '../../core/models/bible.models';

@Component({
  selector: 'app-bible-text',
  templateUrl: './bible-text.html',
  standalone: false,
  styleUrls: ['./bible-text.css'],
})
export class BibleText {
  private readonly api = inject(BibleApiService);
  private readonly selection = inject(BibleSelectionService);


  readonly passage = signal<Passage | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly ufm = this.selection.displayUsfm;

  constructor() {
    effect(() => {
      const version = this.selection.selectedVersion();
      const usfm = this.selection.displayUsfm();
      this.passage.set(null);
      this.error.set(null);
      if (!version || !usfm) return;
      this.loading.set(true);
      this.api.getPassage(version.id, usfm, 'Text').subscribe({
        next: (passage) => { this.passage.set(passage); this.loading.set(false); },
        error: (err) => {
          this.error.set(`Couldnotloadtextfor ${usfm}.`); this.loading.set(false)
        });
    })
  }
}
