import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException, HttpException, Logger } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import { Client } from 'pg';

interface AiChatBody {
  message?: string;
  provider?: string;
  history?: unknown;
}

interface SearchRow {
  id: unknown;
  code: unknown;
  title: unknown;
}

/**
 * Ported from the former Next.js route `app/api/ai-chat/route.ts` (Task 5-a).
 *
 * SECURITY: this endpoint spends paid AI provider keys - the global
 * JwtAuthGuard now guards it (the legacy route checked a JWT manually).
 * Env keys used: GEMINI_API_KEY / OPENAI_API_KEY / DEEPSEEK_API_KEY.
 * Request contract: { message, provider, history? }.
 * Response contract: 200 { reply } | 400 { error } | 500 { error }.
 */
@Controller('ai-chat')
export class AiChatController {
  private readonly logger = new Logger(AiChatController.name);

  private async searchAccount(query: string): Promise<SearchRow[]> {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
      const res = await client.query(
        `SELECT "AccountID" as id, "Code" as code, "Title" as title FROM "Acc"."Accounts" WHERE "Title" LIKE $1 OR "Code" LIKE $1 LIMIT 5`,
        [`%${query}%`],
      );
      return res.rows;
    } catch (e) {
      this.logger.error('searchAccount failed:', e instanceof Error ? e.message : e);
      return [];
    } finally {
      await client.end();
    }
  }

  private async searchDetailedAccount(query: string): Promise<SearchRow[]> {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
      const res = await client.query(
        `SELECT "DetailedAccountID" as id, "Code" as code, "Title" as title FROM "Acc"."DetailedAccounts" WHERE "Title" LIKE $1 OR "Code" LIKE $1 LIMIT 10`,
        [`%${query}%`],
      );
      return res.rows;
    } catch (e) {
      this.logger.error('searchDetailedAccount failed:', e instanceof Error ? e.message : e);
      return [];
    } finally {
      await client.end();
    }
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async chat(@Body() body?: AiChatBody) {
    try {
      const { message, provider } = body || {};

      if (!message) {
        throw new BadRequestException({ error: 'پیام خالی است.' });
      }

      let reply = '';

      if (provider === 'gemini') {
        if (!process.env.GEMINI_API_KEY) {
          throw new BadRequestException({ error: 'کلید API برای Gemini تنظیم نشده است.' });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const promptText = `شما دستیار هوشمند سیستم Parsa ERP هستید. وظیفه شما کمک به کاربر در انجام امور داخل سیستم است.

اگر کاربر قصد دارد کاری انجام دهد که نیازمند ایجاد یک فرم جدید در سیستم است (مانند ایجاد سند حسابداری، ایجاد شخص، حساب بانکی و غیره)، شما باید ساختار زیر را در انتهای پیام خود چاپ کنید تا رابط کاربری، کاربر را مستقیما به آن فرم همراه با اطلاعات از پیش پر شده هدایت کند (بخش متنی خود را در بالا قرار دهید و تگ پایین را در انتها چاپ کنید):
[FORM_ACTION]
{
  "action": "NAVIGATE_WITH_DATA",
  "path": "<آدرس فرم هدف>",
  "data": { <دیتاهای کلیدی برای پُر کردن فرم اولیه> }
}
[/FORM_ACTION]

نمونه مسیرها سیستم:
- فرم سند حسابداری جدید: \`/forms/accounting/voucher-new\` (کلیدهای فرم سند حسابداری: description, voucherDate, items)
    در فرم سند حسابداری items یک ارایه است. درون ارایه items هر ردیف باید دارای کلیدهای debit, credit, description باشد.
    مهم: برای پر کردن حساب‌ها اگر در جستجوی خود یک معین پیدا کردید کلید ledgerCode را پر کنید و اگر تفصیلی پیدا کردید میتوانید آن را درون detailsObjects با کلید detail1 قرار دهید (حتما آیدی، کد و عنوان را قرار دهید). مثال:
    "ledgerCode": {"id": 1, "code": "100", "title": "موجودی نقد"},
    "detailsObjects": {"detail1": {"id": 2, "code": "20", "title": "مصطفی شربتی"}}

شما می‌توانید با استفاده از function calling در دیتابیس معین‌ها و تفصیلی‌ها جستجو کنید تا آیدی آن‌ها را بیابید (حتما از جستجو استفاده کنید).

درخواست کاربر: ${message}`;

        const tools = [
          {
            functionDeclarations: [
              {
                name: 'search_account',
                description: 'جستجوی سرفصل حسابها (معین) بر اساس عنوان یا کد',
                parameters: {
                  type: Type.OBJECT,
                  properties: { query: { type: Type.STRING } },
                  required: ['query'],
                },
              },
              {
                name: 'search_detailed_account',
                description: 'جستجوی حساب های تفصیلی (شخص، شرکت و غیره) بر اساس عنوان یا کد',
                parameters: {
                  type: Type.OBJECT,
                  properties: { query: { type: Type.STRING } },
                  required: ['query'],
                },
              },
            ],
          },
        ];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const contents: any[] = [{ role: 'user', parts: [{ text: promptText }] }];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: contents,
          config: { tools: tools as never },
        });

        if (response.functionCalls && response.functionCalls.length > 0) {
          const functionResponses: any[] = [];

          const calls = response.functionCalls;

          // Assuming single parallel call or sequential
          for (const call of calls) {
            let result: any = [];
            const args = call.args as any;
            if (call.name === 'search_account' && args.query) {
              result = await this.searchAccount(args.query);
            } else if (call.name === 'search_detailed_account' && args.query) {
              result = await this.searchDetailedAccount(args.query);
            }
            functionResponses.push({
              functionResponse: {
                name: call.name,
                response: { result },
              },
            });
          }

          contents.push(response.candidates![0].content);
          contents.push({ role: 'user', parts: functionResponses });

          response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: contents,
            config: { tools: tools as never },
          });
        }

        reply = response.text || 'بازخوردی دریافت نشد.';
      } else if (provider === 'chatgpt') {
        if (!process.env.OPENAI_API_KEY) {
          throw new BadRequestException({
            error: 'کلید API برای ChatGPT در سرور (تنظیمات محیطی) تنظیم نشده است.',
          });
        }
        // Simple mock for ChatGPT if implemented via fetch
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'system', content: 'You are an ERP Assistant.' }, { role: 'user', content: message }],
          }),
        });
        const data = await resp.json();
        if (data.error) throw new Error(data.error.message);
        reply = data.choices?.[0]?.message?.content || 'بازخوردی دریافت نشد.';
      } else if (provider === 'deepseek') {
        if (!process.env.DEEPSEEK_API_KEY) {
          throw new BadRequestException({ error: 'کلید API برای DeepSeek در سرور تنظیم نشده است.' });
        }

        const resp = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-coder',
            messages: [{ role: 'system', content: 'You are an ERP Assistant.' }, { role: 'user', content: message }],
          }),
        });
        const data = await resp.json();
        if (data.error) throw new Error(data.error.message);
        reply = data.choices?.[0]?.message?.content || 'بازخوردی دریافت نشد.';
      } else {
        throw new BadRequestException({ error: 'مدل هوش مصنوعی نامعتبر است.' });
      }

      return { reply };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('AI Assistant Error:', error instanceof Error ? error.stack : error);
      throw new HttpException(
        { error: (error as Error)?.message || 'خطای داخل سرور رخ داده است.' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
