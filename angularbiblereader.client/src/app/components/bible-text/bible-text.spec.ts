import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Chapter, Passage, BibleVersionSummary } from '../../core/models/bible.models';
import { BibleSelectionService } from '../../core/services/bible-selection.service';
import { BibleText } from './bible-text';

const version: BibleVersionSummary = {
  id: 1,
  abbreviation: 'ESV',
  localized_abbreviation: 'ESV',
  title: 'English Standard Version',
  localized_title: 'English Standard Version',
  language_tag: 'en',
  copyright: '',
};

const chapter: Chapter = { usfm: 'JHN.3', human: '3', verses: 36 };

const passage: Passage = { id: '1', content: 'For God so loved the world...', reference: 'John 3' };

describe('BibleText', () => {
  let fixture: ComponentFixture<BibleText>;
  let component: BibleText;
  let httpMock: HttpTestingController;
  let selection: BibleSelectionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BibleText],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(BibleText);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    selection = TestBed.inject(BibleSelectionService);
  });

  afterEach(() => httpMock.verify());

  it('does not request a passage until a version and reference are selected', () => {
    fixture.detectChanges();
    httpMock.expectNone((r) => r.url.includes('/passage'));
  });

  it('loads the passage once a version and chapter are selected', () => {
    fixture.detectChanges();
    selection.selectVersion(version);
    selection.selectChapter(chapter);
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url === '/api/versions/1/passage');
    expect(req.request.params.get('usfm')).toBe('JHN.3');
    req.flush(passage);
    fixture.detectChanges();

    expect(component.passage()).toEqual(passage);
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.passage__reference')?.textContent).toContain('John 3');
    expect(root.querySelector('.passage__content')?.textContent).toContain('For God so loved');
  });

  it('sets an error when loading the passage fails', () => {
    fixture.detectChanges();
    selection.selectVersion(version);
    selection.selectChapter(chapter);
    fixture.detectChanges();

    httpMock
      .expectOne((r) => r.url === '/api/versions/1/passage')
      .flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(component.error()).toBe('Could not load text for JHN.3.');
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.passage__error')?.textContent).toContain('Could not load text for JHN.3.');
  });

  it('shows the initial hint when nothing is selected', () => {
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.passage__hint')).toBeTruthy();
  });

  it('shows a loading indicator while the passage request is in flight', () => {
    fixture.detectChanges();
    selection.selectVersion(version);
    selection.selectChapter(chapter);
    fixture.detectChanges();

    expect(component.loading()).toBe(true);
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.passage__loading')).toBeTruthy();

    httpMock.expectOne((r) => r.url === '/api/versions/1/passage').flush(passage);
  });
});
