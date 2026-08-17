import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Book, BibleVersionSummary } from '../../core/models/bible.models';
import { BibleSelectionService } from '../../core/services/bible-selection.service';
import { BookSelector } from './book-selector';

const version: BibleVersionSummary = {
  id: 1,
  abbreviation: 'ESV',
  localized_abbreviation: 'ESV',
  title: 'English Standard Version',
  localized_title: 'English Standard Version',
  language_tag: 'en',
  copyright: '',
};

const books: Book[] = [
  { usfm: 'GEN', human: 'Genesis', chapters: 50 },
  { usfm: 'JHN', human: 'John', chapters: 21 },
];

describe('BookSelector', () => {
  let fixture: ComponentFixture<BookSelector>;
  let component: BookSelector;
  let httpMock: HttpTestingController;
  let selection: BibleSelectionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookSelector],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(BookSelector);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    selection = TestBed.inject(BibleSelectionService);
  });

  afterEach(() => httpMock.verify());

  it('does not request books when no version is selected', () => {
    fixture.detectChanges();
    httpMock.expectNone((r) => r.url.startsWith('/api/versions'));
  });

  it('loads books when a version is selected', () => {
    fixture.detectChanges();

    selection.selectVersion(version);
    fixture.detectChanges();

    httpMock.expectOne('/api/versions/1/books').flush(books);
    fixture.detectChanges();

    expect(component.books()).toEqual(books);
    expect(component.loading()).toBe(false);
    const options = (fixture.nativeElement as HTMLElement).querySelectorAll('option[value="JHN"]');
    expect(options.length).toBe(1);
  });

  it('sets an error when loading books fails', () => {
    fixture.detectChanges();

    selection.selectVersion(version);
    fixture.detectChanges();

    httpMock.expectOne('/api/versions/1/books').flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(component.error()).toBe('Could not load books for this version');
    const errorEl = (fixture.nativeElement as HTMLElement).querySelector('.field__error');
    expect(errorEl?.textContent).toContain('Could not load books for this version');
  });

  it('clears books when the version changes to null-equivalent state again', () => {
    fixture.detectChanges();
    selection.selectVersion(version);
    fixture.detectChanges();
    httpMock.expectOne('/api/versions/1/books').flush(books);
    expect(component.books()).toEqual(books);

    selection.selectVersion({ ...version, id: 2 });
    fixture.detectChanges();

    expect(component.books()).toEqual([]);
    httpMock.expectOne('/api/versions/2/books').flush([]);
  });

  it('onChange selects the matching book', () => {
    fixture.detectChanges();
    selection.selectVersion(version);
    fixture.detectChanges();
    httpMock.expectOne('/api/versions/1/books').flush(books);

    component.onChange('JHN');

    expect(selection.selectedBook()).toEqual(books[1]);
  });

  it('onChange is a no-op for an unknown usfm', () => {
    fixture.detectChanges();
    selection.selectVersion(version);
    fixture.detectChanges();
    httpMock.expectOne('/api/versions/1/books').flush(books);

    component.onChange('NOPE');

    expect(selection.selectedBook()).toBeNull();
  });
});
