import { TestBed } from '@angular/core/testing';
import { Book, Chapter, Verse, BibleVersionSummary } from '../models/bible.models';
import { BibleSelectionService } from './bible-selection.service';

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
const verse16: Verse = { usfm: 'JHN.3.16', human: '16', text: '' };
const verse17: Verse = { usfm: 'JHN.3.17', human: '17', text: '' };

describe('BibleSelectionService', () => {
  let service: BibleSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BibleSelectionService);
  });

  it('starts with nothing selected', () => {
    expect(service.selectedVersion()).toBeNull();
    expect(service.selectedBook()).toBeNull();
    expect(service.selectedChapter()).toBeNull();
    expect(service.selectedVerse()).toBeNull();
    expect(service.displayUsfm()).toBeNull();
  });

  it('selectVersion resets book, chapter, and verse selection', () => {
    service.selectBook(book);
    service.selectChapter(chapter);
    service.selectVerse(verse16);

    service.selectVersion(version);

    expect(service.selectedVersion()).toEqual(version);
    expect(service.selectedBook()).toBeNull();
    expect(service.selectedChapter()).toBeNull();
    expect(service.selectedVerse()).toBeNull();
  });

  it('selectBook resets chapter and verse selection', () => {
    service.selectChapter(chapter);
    service.selectVerse(verse16);

    service.selectBook(book);

    expect(service.selectedBook()).toEqual(book);
    expect(service.selectedChapter()).toBeNull();
    expect(service.selectedVerse()).toBeNull();
  });

  it('selectChapter resets verse selection', () => {
    service.selectVerse(verse16);

    service.selectChapter(chapter);

    expect(service.selectedChapter()).toEqual(chapter);
    expect(service.selectedVerse()).toBeNull();
  });

  it('selectVerse resets end-verse selection', () => {
    service.selectVerse(verse16);
    service.selectEndVerse(verse17);

    service.selectVerse(verse16);

    expect(service.selectedEndVerse()).toBeNull();
  });

  describe('displayUsfm', () => {
    it('is null when no chapter is selected', () => {
      expect(service.displayUsfm()).toBeNull();
    });

    it('is the chapter usfm when no start verse is selected', () => {
      service.selectChapter(chapter);
      expect(service.displayUsfm()).toBe('JHN.3');
    });

    it('is the single verse usfm when only a start verse is selected', () => {
      service.selectChapter(chapter);
      service.selectVerse(verse16);
      expect(service.displayUsfm()).toBe('JHN.3.16');
    });

    it('is a range when start and end verses differ', () => {
      service.selectChapter(chapter);
      service.selectVerse(verse16);
      service.selectEndVerse(verse17);
      expect(service.displayUsfm()).toBe('JHN.3.16-17');
    });

    it('collapses to a single verse when start and end are the same', () => {
      service.selectChapter(chapter);
      service.selectVerse(verse16);
      service.selectEndVerse(verse16);
      expect(service.displayUsfm()).toBe('JHN.3.16');
    });
  });
});
