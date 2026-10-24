import { Controller, Get, Query, Header, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { helpContents } from './help-content.data';

/**
 * Ported from the former Next.js route `app/api/help/route.ts` (Task 5-a).
 *
 * NOTE: this endpoint is @Public() on purpose. The frontend HelpModal fetches
 * it with a bare `fetch()` (no Authorization header), and the payload is
 * static, non-sensitive help text - identical to the legacy Next.js route
 * which had no auth check either.
 */
@Controller('help')
export class HelpController {
  private readonly logger = new Logger(HelpController.name);

  @Get()
  @Public()
  @Header('Content-Type', 'text/markdown; charset=utf-8')
  getHelp(@Query('topic') topic?: string): string {
    try {
      const key = topic || '';

      let content: string | undefined = helpContents[key];

      if (!content && key) {
        // try partial matching or fallback
        const matchedKey = Object.keys(helpContents).find(k => key.includes(k) || k.includes(key));
        if (matchedKey) {
          content = helpContents[matchedKey];
        } else {
          content = helpContents['default'];
        }
      }

      if (!content) {
        content = helpContents['default'];
      }

      return content || 'هیچ راهنمایی برای این بخش یافت نشد.';
    } catch (error) {
      this.logger.error('Help endpoint error:', error instanceof Error ? error.stack : error);
      throw new HttpException('هیچ راهنمایی برای این بخش یافت نشد.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
