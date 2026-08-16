import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { BibleReader } from './components/bible-reader/bible-reader'
import { VersionSelector } from './components/version-selector/version-selector'
import { BookSelector } from './components/book-selector/book-selector'
import { ChapterSelector } from './components/chapter-selector/chapter-selector'
import { VerseSelector } from './components/verse-selector/verse-selector'
import { BibleText } from './components/bible-text/bible-text'

@NgModule({
  declarations: [BibleReader, VersionSelector, BookSelector, ChapterSelector, VerseSelector, BibleText],
  imports: [CommonModule],
  exports: [BibleReader],
})
export class BibleReaderModule { }
