import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appButtons]',
  standalone: true
})
export class PageButtonsDirective {
  constructor(public templateRef: TemplateRef<unknown>) {}
}
