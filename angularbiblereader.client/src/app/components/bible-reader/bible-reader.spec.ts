import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BibleReader } from './bible-reader';

describe('BibleReader', () => {
  let fixture: ComponentFixture<BibleReader>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BibleReader],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(BibleReader);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('creates and renders each passage-selection child', () => {
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === '/api/versions').flush([]);

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('app-version-selector')).toBeTruthy();
    expect(root.querySelector('app-book-selector')).toBeTruthy();
    expect(root.querySelector('app-chapter-selector')).toBeTruthy();
    expect(root.querySelector('app-verse-selector')).toBeTruthy();
    expect(root.querySelector('app-bible-text')).toBeTruthy();
  });
});
