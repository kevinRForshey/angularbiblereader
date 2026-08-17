import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Book, Chapter, BibleVersionSummary } from '../../core/models/bible.models';
import { BibleSelectionService } from '../../core/services/bible-selection.service';
import { ChapterSelector } from './chapter-selector';

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

const chapters: Chapter[] = [
  { usfm: 'JHN.1', human: '1', verses: 51 },
  { usfm: 'JHN.3', human: '3', verses: 36 },
];

describe('ChapterSelector', () => {
  let fixture: ComponentFixture<ChapterSelector>;
  let component: ChapterSelector;
  let httpMock: HttpTestingController;
  let selection: BibleSelectionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChapterSelector],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ChapterSelector);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    selection = TestBed.inject(BibleSelectionService);
  });

  afterEach(() => httpMock.verify());

  it('does not request chapters until both version and book are selected', () => {
    fixture.detectChanges();
    selection.selectVersion(version);
    fixture.detectChanges();

    httpMock.expectNone((r) => r.url.includes('/chapters'));
  });

  it('loads chapters once version and book are selected', () => {
    fixture.detectChanges();
    selection.selectVersion(version);
    selection.selectBook(book);
    fixture.detectChanges();

    httpMock.expectOne('/api/versions/1/books/JHN/chapters').flush(chapters);
    fixture.detectChanges();

    expect(component.chapters()).toEqual(chapters);
    const options = (fixture.nativeElement as HTMLElement).querySelectorAll('option[value="JHN.3"]');
    expect(options.length).toBe(1);
  });

  it('sets an error when loading chapters fails', () => {
    fixture.detectChanges();
    selection.selectVersion(version);
    selection.selectBook(book);
    fixture.detectChanges();

    httpMock.expectOne('/api/versions/1/books/JHN/chapters').flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(component.error()).toBe('Could not load chapters for this book');
    const errorEl = (fixture.nativeElement as HTMLElement).querySelector('.field__error');
    expect(errorEl?.textContent).toContain('Could not load chapters for this book');
  });

  it('onChange selects the matching chapter', () => {
    fixture.detectChanges();
    selection.selectVersion(version);
    selection.selectBook(book);
    fixture.detectChanges();
    httpMock.expectOne('/api/versions/1/books/JHN/chapters').flush(chapters);

    component.onChange('JHN.3');

    expect(selection.selectedChapter()).toEqual(chapters[1]);
  });

  it('onChange is a no-op for an unknown usfm', () => {
    fixture.detectChanges();
    selection.selectVersion(version);
    selection.selectBook(book);
    fixture.detectChanges();
    httpMock.expectOne('/api/versions/1/books/JHN/chapters').flush(chapters);

    component.onChange('NOPE');

    expect(selection.selectedChapter()).toBeNull();
  });
});
