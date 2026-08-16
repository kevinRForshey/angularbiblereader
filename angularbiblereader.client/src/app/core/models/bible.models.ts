export interface BibleVersionSummary {
  id: number;
  abbreviation: string;
  localized_abbreviation: string;
  title: string;
  localized_title: string;
  language_tag: string;
  copyright: string;
}

export interface Book {
  usfm: string;       // USFM abbreviation "JHN"
  human: string;      //  Display name "John"
  chapters: number;  //  Chapter count
}

export interface Chapter {
  usfm: string;       // e.g. "JHN.3"
  human: string;      // Display label, e.g. "3"
  verses: number;     // Verse count
}

export interface Verse {
  usfm: string;       // e.g. "JHN.3.16"
  human: string;      // Display label, e.g. "16"
  text: string;        // Verse text
}

export interface Passage {
  id: string;
  content: string;    // plain text or HTML depending on requested format
  reference: string;    // reference string, e.g. "John 3:16"
}

export type PassageFormat = 'Text' | 'html';

