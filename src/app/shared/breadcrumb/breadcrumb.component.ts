import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './breadcrumb.component.html',
})
export class BreadcrumbComponent {
  @Input() title: string = '';
  @Input() items: any[] = [];
}
