import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  BibleVersionSummary, Book, Chapter, Passage, PassageFormat, Verse,
} from '../models/bible.models';

@Injectable({ providedIn: 'root' })
export class BibleApiService {
  private readonly baseUrl = '/api/versions';
  private readonly http = inject(HttpClient);

  getVersions(languageRange = 'en'): Observable<BibleVersionSummary[]> {
    const params = new HttpParams().set('languageRange', languageRange);
    return this.http.get<BibleVersionSummary[]>(this.baseUrl, { params });
  }

  getBooks(versionId: number): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.baseUrl}/${versionId}/books`);
  }

  getChapters(versionId: number, bookUsfm: string): Observable<Chapter[]> {
    return this.http.get<Chapter[]>(`${this.baseUrl}/${versionId}/books/${bookUsfm}/chapters`);
  }

  getVerses(versionId: number, bookUsfm: string, chapterNumber: number): Observable<Verse[]> {
    return this.http.get<Verse[]>(
      `${this.baseUrl}/${versionId}/books/${bookUsfm}/chapters/${chapterNumber}/verses`
    );
  }

  getPassage(versionId: number, usfm: string, format: PassageFormat = 'Text'): Observable<Passage> {
    const params = new HttpParams().set('usfm', usfm).set('format', format);
    return this.http.get<Passage>(`${this.baseUrl}/${versionId}/passage`, { params });
  }
}
