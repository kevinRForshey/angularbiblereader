import { Component } from '@angular/core';
import { VersionSelector } from '../version-selector/version-selector';
import { BookSelector } from '../book-selector/book-selector';
import { ChapterSelector } from '../chapter-selector/chapter-selector';
import { VerseSelector } from '../verse-selector/verse-selector';
import { BibleText } from '../bible-text/bible-text';

@Component({
  selector: 'app-bible-reader',
  templateUrl: './bible-reader.html',
  imports: [VersionSelector, BookSelector, ChapterSelector, VerseSelector, BibleText],
  styleUrls: ['./bible-reader.css'],
})
export class BibleReader { }
