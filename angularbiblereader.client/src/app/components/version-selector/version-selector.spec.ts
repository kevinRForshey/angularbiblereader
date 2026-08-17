import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BibleSelectionService } from '../../core/services/bible-selection.service';
import { BibleVersionSummary } from '../../core/models/bible.models';
import { VersionSelector } from './version-selector';

const versions: BibleVersionSummary[] = [
  {
    id: 1,
    abbreviation: 'ESV',
    localized_abbreviation: 'ESV',
    title: 'English Standard Version',
    localized_title: 'English Standard Version',
    language_tag: 'en',
    copyright: '',
  },
  {
    id: 2,
    abbreviation: 'NIV',
    localized_abbreviation: 'NIV',
    title: 'New International Version',
    localized_title: 'New International Version',
    language_tag: 'en',
    copyright: '',
  },
];

describe('VersionSelector', () => {
  let fixture: ComponentFixture<VersionSelector>;
  let component: VersionSelector;
  let httpMock: HttpTestingController;
  let selection: BibleSelectionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VersionSelector],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(VersionSelector);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    selection = TestBed.inject(BibleSelectionService);
  });

  afterEach(() => httpMock.verify());

  it('loads versions on init', () => {
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url === '/api/versions').flush(versions);
    fixture.detectChanges();

    expect(component.versions()).toEqual(versions);
    expect(component.loading()).toBe(false);
    const options = (fixture.nativeElement as HTMLElement).querySelectorAll('option[value="2"]');
    expect(options.length).toBe(1);
    expect(options[0].textContent).toContain('New International Version');
  });

  it('sets an error when loading fails', () => {
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url === '/api/versions').flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBe('Could not load Bible Versions.');
    expect(component.loading()).toBe(false);
  });

  it('onChange selects the matching version', () => {
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === '/api/versions').flush(versions);

    component.onChange('2');

    expect(selection.selectedVersion()).toEqual(versions[1]);
  });

  it('onChange is a no-op for an unknown id', () => {
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === '/api/versions').flush(versions);

    component.onChange('999');

    expect(selection.selectedVersion()).toBeNull();
  });
});
