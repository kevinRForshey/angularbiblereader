import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BibleApiService } from './bible-api.service';

describe('BibleApiService', () => {
  let service: BibleApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BibleApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getVersions defaults to the "en" language range', () => {
    service.getVersions().subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/versions');
    expect(req.request.params.get('languageRange')).toBe('en');
    req.flush([]);
  });

  it('getVersions passes through a custom language range', () => {
    service.getVersions('es').subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/versions');
    expect(req.request.params.get('languageRange')).toBe('es');
    req.flush([]);
  });

  it('getBooks requests the version-scoped books endpoint', () => {
    service.getBooks(42).subscribe();

    const req = httpMock.expectOne('/api/versions/42/books');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getChapters requests the book-scoped chapters endpoint', () => {
    service.getChapters(42, 'JHN').subscribe();

    const req = httpMock.expectOne('/api/versions/42/books/JHN/chapters');
    req.flush([]);
  });

  it('getVerses requests the chapter-scoped verses endpoint', () => {
    service.getVerses(42, 'JHN', 3).subscribe();

    const req = httpMock.expectOne('/api/versions/42/books/JHN/chapters/3/verses');
    req.flush([]);
  });

  it('getPassage defaults to the "Text" format', () => {
    service.getPassage(42, 'JHN.3.16').subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/versions/42/passage');
    expect(req.request.params.get('usfm')).toBe('JHN.3.16');
    expect(req.request.params.get('format')).toBe('Text');
    req.flush({ id: '1', content: '', reference: '' });
  });

  it('getPassage passes through a custom format', () => {
    service.getPassage(42, 'JHN.3.16', 'html').subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/versions/42/passage');
    expect(req.request.params.get('format')).toBe('html');
    req.flush({ id: '1', content: '', reference: '' });
  });
});
