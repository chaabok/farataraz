"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AiChatController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiChatController = void 0;
const common_1 = require("@nestjs/common");
const genai_1 = require("@google/genai");
const pg_1 = require("pg");
let AiChatController = AiChatController_1 = class AiChatController {
    constructor() {
        this.logger = new common_1.Logger(AiChatController_1.name);
    }
    async searchAccount(query) {
        const client = new pg_1.Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const res = await client.query(`SELECT "AccountID" as id, "Code" as code, "Title" as title FROM "Acc"."Accounts" WHERE "Title" LIKE $1 OR "Code" LIKE $1 LIMIT 5`, [`%${query}%`]);
            return res.rows;
        }
        catch (e) {
            this.logger.error('searchAccount failed:', e instanceof Error ? e.message : e);
            return [];
        }
        finally {
            await client.end();
        }
    }
    async searchDetailedAccount(query) {
        const client = new pg_1.Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const res = await client.query(`SELECT "DetailedAccountID" as id, "Code" as code, "Title" as title FROM "Acc"."DetailedAccounts" WHERE "Title" LIKE $1 OR "Code" LIKE $1 LIMIT 10`, [`%${query}%`]);
            return res.rows;
        }
        catch (e) {
            this.logger.error('searchDetailedAccount failed:', e instanceof Error ? e.message : e);
            return [];
        }
        finally {
            await client.end();
        }
    }
    async chat(body) {
        try {
            const { message, provider } = body || {};
            if (!message) {
                throw new common_1.BadRequestException({ error: 'پیام خالی است.' });
            }
            let reply = '';
            if (provider === 'gemini') {
                if (!process.env.GEMINI_API_KEY) {
                    throw new common_1.BadRequestException({ error: 'کلید API برای Gemini تنظیم نشده است.' });
                }
                const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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
                                    type: genai_1.Type.OBJECT,
                                    properties: { query: { type: genai_1.Type.STRING } },
                                    required: ['query'],
                                },
                            },
                            {
                                name: 'search_detailed_account',
                                description: 'جستجوی حساب های تفصیلی (شخص، شرکت و غیره) بر اساس عنوان یا کد',
                                parameters: {
                                    type: genai_1.Type.OBJECT,
                                    properties: { query: { type: genai_1.Type.STRING } },
                                    required: ['query'],
                                },
                            },
                        ],
                    },
                ];
                const contents = [{ role: 'user', parts: [{ text: promptText }] }];
                let response = await ai.models.generateContent({
                    model: 'gemini-3.5-flash',
                    contents: contents,
                    config: { tools: tools },
                });
                if (response.functionCalls && response.functionCalls.length > 0) {
                    const functionResponses = [];
                    const calls = response.functionCalls;
                    for (const call of calls) {
                        let result = [];
                        const args = call.args;
                        if (call.name === 'search_account' && args.query) {
                            result = await this.searchAccount(args.query);
                        }
                        else if (call.name === 'search_detailed_account' && args.query) {
                            result = await this.searchDetailedAccount(args.query);
                        }
                        functionResponses.push({
                            functionResponse: {
                                name: call.name,
                                response: { result },
                            },
                        });
                    }
                    contents.push(response.candidates[0].content);
                    contents.push({ role: 'user', parts: functionResponses });
                    response = await ai.models.generateContent({
                        model: 'gemini-3.5-flash',
                        contents: contents,
                        config: { tools: tools },
                    });
                }
                reply = response.text || 'بازخوردی دریافت نشد.';
            }
            else if (provider === 'chatgpt') {
                if (!process.env.OPENAI_API_KEY) {
                    throw new common_1.BadRequestException({
                        error: 'کلید API برای ChatGPT در سرور (تنظیمات محیطی) تنظیم نشده است.',
                    });
                }
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
                if (data.error)
                    throw new Error(data.error.message);
                reply = data.choices?.[0]?.message?.content || 'بازخوردی دریافت نشد.';
            }
            else if (provider === 'deepseek') {
                if (!process.env.DEEPSEEK_API_KEY) {
                    throw new common_1.BadRequestException({ error: 'کلید API برای DeepSeek در سرور تنظیم نشده است.' });
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
                if (data.error)
                    throw new Error(data.error.message);
                reply = data.choices?.[0]?.message?.content || 'بازخوردی دریافت نشد.';
            }
            else {
                throw new common_1.BadRequestException({ error: 'مدل هوش مصنوعی نامعتبر است.' });
            }
            return { reply };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            this.logger.error('AI Assistant Error:', error instanceof Error ? error.stack : error);
            throw new common_1.HttpException({ error: error?.message || 'خطای داخل سرور رخ داده است.' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AiChatController = AiChatController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "chat", null);
exports.AiChatController = AiChatController = AiChatController_1 = __decorate([
    (0, common_1.Controller)('ai-chat')
], AiChatController);
//# sourceMappingURL=ai-chat.controller.js.map