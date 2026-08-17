import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Book, Chapter, Verse, BibleVersionSummary } from '../../core/models/bible.models';
import { BibleSelectionService } from '../../core/services/bible-selection.service';
import { VerseSelector } from './verse-selector';

const version: BibleVersionSummary = {
  id: 1,
  abbreviation: 'ESV',
  localized_abbreviation: 'ESV',
  title: 'English Standard Version',
  localized_title: 'English Standard Version',
  language_tag: 'en',
  copyright: '',
};

const book: Book = { usfm: 'JHN', human: 'John', chapters: 21 };
const chapter: Chapter = { usfm: 'JHN.3', human: '3', verses: 36 };

const verses: Verse[] = [
  { usfm: 'JHN.3.15', human: '15', text: '' },
  { usfm: 'JHN.3.16', human: '16', text: '' },
  { usfm: 'JHN.3.17', human: '17', text: '' },
];

function selectThroughChapter(selection: BibleSelectionService): void {
  selection.selectVersion(version);
  selection.selectBook(book);
  selection.selectChapter(chapter);
}

describe('VerseSelector', () => {
  let fixture: ComponentFixture<VerseSelector>;
  let component: VerseSelector;
  let httpMock: HttpTestingController;
  let selection: BibleSelectionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerseSelector],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(VerseSelector);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    selection = TestBed.inject(BibleSelectionService);
  });

  afterEach(() => httpMock.verify());

  it('loads verses once version, book, and chapter are selected', () => {
    fixture.detectChanges();
    selectThroughChapter(selection);
    fixture.detectChanges();

    httpMock.expectOne('/api/versions/1/books/JHN/chapters/3/verses').flush(verses);
    fixture.detectChanges();

    expect(component.verses()).toEqual(verses);
    const options = (fixture.nativeElement as HTMLElement).querySelectorAll('#verse-select option[value="JHN.3.16"]');
    expect(options.length).toBe(1);
  });

  it('sets an error when loading verses fails', () => {
    fixture.detectChanges();
    selectThroughChapter(selection);
    fixture.detectChanges();

    httpMock
      .expectOne('/api/versions/1/books/JHN/chapters/3/verses')
      .flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(component.error()).toBe('Could not load verses for this chapter');
    const errorEl = (fixture.nativeElement as HTMLElement).querySelector('.field__error');
    expect(errorEl?.textContent).toContain('Could not load verses for this chapter');
  });

  it('onStartChange selects the matching verse', () => {
    fixture.detectChanges();
    selectThroughChapter(selection);
    fixture.detectChanges();
    httpMock.expectOne('/api/versions/1/books/JHN/chapters/3/verses').flush(verses);

    component.onStartChange('JHN.3.16');

    expect(selection.selectedVerse()).toEqual(verses[1]);
  });

  it('endVerseOptions is empty until a start verse is chosen', () => {
    fixture.detectChanges();
    selectThroughChapter(selection);
    fixture.detectChanges();
    httpMock.expectOne('/api/versions/1/books/JHN/chapters/3/verses').flush(verses);

    expect(component.endVerseOptions()).toEqual([]);
  });

  it('endVerseOptions only includes verses at or after the start verse', () => {
    fixture.detectChanges();
    selectThroughChapter(selection);
    fixture.detectChanges();
    httpMock.expectOne('/api/versions/1/books/JHN/chapters/3/verses').flush(verses);

    component.onStartChange('JHN.3.16');

    expect(component.endVerseOptions()).toEqual([verses[1], verses[2]]);
  });

  it('onEndChange selects the matching end verse', () => {
    fixture.detectChanges();
    selectThroughChapter(selection);
    fixture.detectChanges();
    httpMock.expectOne('/api/versions/1/books/JHN/chapters/3/verses').flush(verses);

    component.onStartChange('JHN.3.16');
    component.onEndChange('JHN.3.17');

    expect(selection.selectedEndVerse()).toEqual(verses[2]);
  });

  it('onStartChange clears the selection for an unknown usfm (whole-chapter option)', () => {
    fixture.detectChanges();
    selectThroughChapter(selection);
    fixture.detectChanges();
    httpMock.expectOne('/api/versions/1/books/JHN/chapters/3/verses').flush(verses);

    component.onStartChange('JHN.3.16');
    component.onStartChange('');

    expect(selection.selectedVerse()).toBeNull();
  });

  it('onEndChange clears the end selection for an unknown usfm (same-verse option)', () => {
    fixture.detectChanges();
    selectThroughChapter(selection);
    fixture.detectChanges();
    httpMock.expectOne('/api/versions/1/books/JHN/chapters/3/verses').flush(verses);

    component.onStartChange('JHN.3.16');
    component.onEndChange('JHN.3.17');
    component.onEndChange('');

    expect(selection.selectedEndVerse()).toBeNull();
  });
});
