import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appLabel]',
  standalone: true
})
export class PageLabelDirective {
  constructor(public templateRef: TemplateRef<unknown>) {}
}
