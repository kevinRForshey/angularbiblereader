import { Component, OnInit, inject, signal } from '@angular/core';
import { BibleApiService } from '../../core/services/bible-api.service';
import { BibleSelectionService } from '../../core/services/bible-selection.service';
import { BibleVersionSummary } from '../../core/models/bible.models';

@Component({
  selector: 'app-version-selector',
  templateUrl: './version-selector.html',
  standalone: false,
  styleUrl: './version-selector.css',
})


export class VersionSelector implements OnInit {
  private readonly api = inject(BibleApiService);
  private readonly selection = inject(BibleSelectionService);
  readonly versions = signal<BibleVersionSummary[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selected = this.selection.selectedVersion;

  ngOnInit(): void {
    this.loading.set(true);
    this.api.getVersions().subscribe({
      next: (versions) => {
        this.versions.set(versions);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Could not load Bible Versions.');
        this.loading.set(false);
      },
    });
  }

  OnChange(versionId: string): void {
    const version = this.versions().find(v => v.id.toString() === versionId);
    if (version) {
      this.selection.selectVersion(version);
    }
  }
}

