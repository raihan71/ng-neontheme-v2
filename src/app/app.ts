import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { GoogleAnalyticsGTagComponent } from './shared/ads/gtm/gtm.component';
import { filter } from 'rxjs';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    GoogleAnalyticsGTagComponent,
  ],
  templateUrl: './app.html',
  styles: [
    `
      .back-to-top {
        position: fixed;
        bottom: 25px;
        right: 25px;
      }
    `,
  ],
})
export class App {
  title: string = 'ngsite-hacker';
  activateGoTop: boolean = false;
  skipLinkPath: string = '';
  constructor(private router: Router) {
    if (globalThis.window === undefined) {
      globalThis.window = {
        addEventListener: () => {},
        // add more methods as needed
      } as never;
    }

    router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (!this.router.url.endsWith('#content')) {
        this.skipLinkPath = `${this.router.url}#content`;
      }
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (window.scrollY > 100) {
      this.activateGoTop = true;
    } else {
      this.activateGoTop = false;
    }
  }
  scrollToTop() {
    return window.scrollTo(0, 0);
  }
}
