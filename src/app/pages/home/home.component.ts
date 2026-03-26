import { Component, ChangeDetectorRef, inject, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NgOptimizedImage } from '@angular/common';
import { forkJoin, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ContentfulService } from '../../services/contentful.service';
import { PipesModule } from '../../pipes/pipes.module';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';
import { environment } from '../../../environments/environment';

const CONFIG = environment.contentful_config;
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PipesModule, SkeletonComponent, NgOptimizedImage],
  templateUrl: './home.component.html',
  styles: [
    `
      /* Custom backdrop ensures a dim overlay when modal opens */
      .custom-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        opacity: 0;
        pointer-events: none;
        transition: opacity 250ms ease;
        z-index: 1040;
      }
      .custom-modal-backdrop.show {
        opacity: 1;
        pointer-events: auto;
      }
    `,
  ],
})
export class HomeComponent implements OnInit, OnDestroy {
  show: boolean = false;
  about: any = {};
  image: any = '';
  socials: any = [];
  currentWork: any = {};
  isModalOpen: boolean = false;
  private readonly title = inject(Title);
  private showTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private cs: ContentfulService,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit() {
    this.title.setTitle(`Home - ${import.meta.env['NG_APP_NAME']}`);
    forkJoin({
      aboutMe: this.cs.getEntry(import.meta.env['NG_APP_ABOUTME']),
      socials: from(this.cs.getEntries({ content_type: CONFIG.contentTypeIds.socials })),
      works: from(
        this.cs.getEntries({
          content_type: CONFIG.contentTypeIds.works,
          'fields.isResigned': false,
        }),
      ),
    })
      .pipe(
        mergeMap(({ aboutMe, socials, works }) => {
          this.about = aboutMe;
          this.socials = socials;
          this.currentWork = works[0]?.fields;

          const { avatar } = this.about;

          return from(this.cs.getSingleImg(avatar?.sys?.id)); // Convert Promise to Observable
        }),
      )
      .subscribe((asset) => {
        this.image = asset;
        if (this.showTimeout) {
          clearTimeout(this.showTimeout);
        }
        this.showTimeout = globalThis.setTimeout(() => {
          this.show = true;
          this.cdr.detectChanges();
        }, 100);
      });
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onModalBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  ngOnDestroy(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = undefined;
    }
  }
}
