import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appBody]',
  standalone: true
})
export class PageBodyDirective {
  constructor(public templateRef: TemplateRef<unknown>) {}
}
