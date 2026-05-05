import { Pipe, PipeTransform } from '@angular/core';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import { Document } from '@contentful/rich-text-types';

@Pipe({
  name: 'toHtml',
})
export class ToHtmlPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    if (typeof value === 'string') {
      return this.renderPlainText(value);
    }

    const renderEntry = (node: any): string => {
      const target = node?.data?.target;
      const contentTypeId = target?.sys?.contentType?.sys?.id;

      if (contentTypeId === 'videoEmbed') {
        return `
          <iframe
            src="${target?.fields?.embedUrl ?? ''}"
            height="100%"
            width="100%"
            frameBorder="0"
            scrolling="no"
            title="${target?.fields?.title ?? ''}"
            allowFullScreen="true"
          ></iframe>
        `;
      }

      return '';
    };

    const renderAsset = (node: any): string => {
      const fields = node?.data?.target?.fields;
      const file = fields?.file;
      const url = file?.url ? `https:${file.url}` : '';
      const height = file?.details?.image?.height;
      const width = file?.details?.image?.width;

      return `
        <img
          src="${url}"
          ${height ? `height="${height}"` : ''}
          ${width ? `width="${width}"` : ''}
          alt="${fields?.description ?? ''}"
        />
      `;
    };

    const options = {
      renderMark: {
        [MARKS.BOLD]: (text: string) => `<strong>${text}</strong>`,
        [MARKS.ITALIC]: (text: string) => `<em>${text}</em>`,
        [MARKS.UNDERLINE]: (text: string) => `<u>${text}</u>`,
        [MARKS.CODE]: (text: string) => `<code>${text}</code>`,
      },
      renderNode: {
        [BLOCKS.EMBEDDED_ENTRY]: renderEntry,
        [BLOCKS.EMBEDDED_RESOURCE]: renderEntry,
        [BLOCKS.EMBEDDED_ASSET]: renderAsset,
      },
    };
    return documentToHtmlString(value as Document, options);
  }

  private renderPlainText(value: string): string {
    const lines = value.replace(/\r\n/g, '\n').split('\n');
    const blocks: string[] = [];
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        blocks.push(`<ul>${listItems.map((item) => `<li>${item}</li>`).join('')}</ul>`);
        listItems = [];
      }
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (!line) {
        flushList();
        continue;
      }

      const bulletMatch = line.match(/^(?:[-*•])\s+(.*)$/);
      if (bulletMatch) {
        listItems.push(this.escapeHtml(bulletMatch[1]));
        continue;
      }

      flushList();
      blocks.push(`<p>${this.escapeHtml(line).replace(/\s{2,}/g, '&nbsp;&nbsp;')}</p>`);
    }

    flushList();
    return blocks.join('');
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
