import { Component, OnInit } from '@angular/core';
import { service } from '../../constant/service';

@Component({
  selector: 'app-cv',
  template: `
    <div class="cv-container">
      <h1>Curriculum Vitae</h1>
      <p>You can download or view my CV below:</p>
      <div class="cv-actions"></div>
      <button (click)="downloadCv()">Download CV</button>
      <button (click)="openCv()">View CV</button>
    </div>
  `,
  styles: [
    `
      .cv-container {
        text-align: center;
        margin-top: 50px;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
      }
      .cv-actions {
        margin-top: 20px;
      }
      button {
        margin: 10px;
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
      }
    `,
  ],
})
export class CvComponent implements OnInit {
  cvFilePath: string = service.cvLink;

  constructor() {}

  ngOnInit(): void {}

  downloadCv(): void {
    const link = document.createElement('a');
    link.href = this.cvFilePath;
    link.download = this.cvFilePath.split('/').pop() || 'Raihan-Nismara-CV.pdf';
    link.click();
  }

  openCv(): void {
    window.open(this.cvFilePath, '_blank');
  }
}
