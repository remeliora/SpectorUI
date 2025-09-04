import {Component, ContentChild} from '@angular/core';
import {PageLabelDirective} from '../../../data/services/page-label-directive';
import {PageButtonsDirective} from '../../../data/services/page-buttons-directive';
import {PageBodyDirective} from '../../../data/services/page-body-directive';
import {NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'app-page-layout',
  imports: [
    NgTemplateOutlet
  ],
  templateUrl: './page-layout.html',
  styleUrl: './page-layout.scss'
})
export class PageLayout {
  @ContentChild(PageLabelDirective, {static: true}) pageLabelDirective!: PageLabelDirective;
  @ContentChild(PageButtonsDirective, {static: true}) pageButtonsDirective!: PageButtonsDirective;
  @ContentChild(PageBodyDirective, {static: true}) pageBodyDirective!: PageBodyDirective;

  get pageLabelTemplate() {
    return this.pageLabelDirective.templateRef;
  }

  get pageButtonsTemplate() {
    return this.pageButtonsDirective.templateRef;
  }

  get pageBodyTemplate() {
    return this.pageBodyDirective.templateRef;
  }
}
