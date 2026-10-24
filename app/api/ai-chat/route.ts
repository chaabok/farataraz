import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { Client } from "pg";
import { verifyRequestAuth, unauthorizedResponse } from "@/lib/server-auth";

const searchAccount = async (query: string) => {
   const client = new Client({ connectionString: process.env.DATABASE_URL });
   await client.connect();
   try {
     const res = await client.query(`SELECT "AccountID" as id, "Code" as code, "Title" as title FROM "Acc"."Accounts" WHERE "Title" LIKE $1 OR "Code" LIKE $1 LIMIT 5`, [`%${query}%`]);
     return res.rows;
   } catch (e) {
     console.error(e);
     return [];
   } finally {
     await client.end();
   }
};

const searchDetailedAccount = async (query: string) => {
   const client = new Client({ connectionString: process.env.DATABASE_URL });
   await client.connect();
   try {
     const res = await client.query(`SELECT "DetailedAccountID" as id, "Code" as code, "Title" as title FROM "Acc"."DetailedAccounts" WHERE "Title" LIKE $1 OR "Code" LIKE $1 LIMIT 10`, [`%${query}%`]);
     return res.rows;
   } catch (e) {
     console.error(e);
     return [];
   } finally {
     await client.end();
   }
};

export async function POST(req: NextRequest) {
  // SECURITY: this endpoint spends paid AI provider keys - auth required.
  const user = verifyRequestAuth(req);
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const { message, provider, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'پیام خالی است.' }, { status: 400 });
    }

    let reply = '';

    if (provider === 'gemini') {
      if (!process.env.GEMINI_API_KEY) {
         return NextResponse.json({ error: 'کلید API برای Gemini تنظیم نشده است.' }, { status: 400 });
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let promptText = `شما دستیار هوشمند سیستم Parsa ERP هستید. وظیفه شما کمک به کاربر در انجام امور داخل سیستم است.

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
              name: "search_account",
              description: "جستجوی سرفصل حسابها (معین) بر اساس عنوان یا کد",
              parameters: {
                type: Type.OBJECT,
                properties: { query: { type: Type.STRING } },
                required: ["query"]
              }
            },
            {
              name: "search_detailed_account",
              description: "جستجوی حساب های تفصیلی (شخص، شرکت و غیره) بر اساس عنوان یا کد",
              parameters: {
                type: Type.OBJECT,
                properties: { query: { type: Type.STRING } },
                required: ["query"]
              }
            }
          ]
        }
      ];

      let contents: any[] = [{ role: "user", parts: [{ text: promptText }] }];

      let response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        tools: tools,
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
         let functionResponses: any[] = [];
         
         const calls = response.functionCalls;
         
         // Assuming single parallel call or sequential
         for (const call of calls) {
            let result: any = [];
            const args = call.args as any;
            if (call.name === 'search_account' && args.query) {
                result = await searchAccount(args.query);
            } else if (call.name === 'search_detailed_account' && args.query) {
                result = await searchDetailedAccount(args.query);
            }
            functionResponses.push({
                functionResponse: { 
                  name: call.name, 
                  response: { result } 
                }
            });
         }
         
         contents.push(response.candidates![0].content);
         contents.push({ role: "user", parts: functionResponses });

         response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: contents,
            tools: tools,
         });
      }

      reply = response.text || 'بازخوردی دریافت نشد.';

    } else if (provider === 'chatgpt') {
      if (!process.env.OPENAI_API_KEY) {
         return NextResponse.json({ error: 'کلید API برای ChatGPT در سرور (تنظیمات محیطی) تنظیم نشده است.' }, { status: 400 });
      }
      // Simple mock for ChatGPT if implemented via fetch
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'system', content: 'You are an ERP Assistant.'}, {role: 'user', content: message}]
        })
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message);
      reply = data.choices?.[0]?.message?.content || 'بازخوردی دریافت نشد.';
    } else if (provider === 'deepseek') {
        if (!process.env.DEEPSEEK_API_KEY) {
           return NextResponse.json({ error: 'کلید API برای DeepSeek در سرور تنظیم نشده است.' }, { status: 400 });
        }
        
        const resp = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-coder',
            messages: [{ role: 'system', content: 'You are an ERP Assistant.'}, {role: 'user', content: message}]
          })
        });
        const data = await resp.json();
        if (data.error) throw new Error(data.error.message);
        reply = data.choices?.[0]?.message?.content || 'بازخوردی دریافت نشد.';
    } else {
        return NextResponse.json({ error: 'مدل هوش مصنوعی نامعتبر است.' }, { status: 400 });
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('AI Assistant Error:', error);
    return NextResponse.json({ error: error.message || 'خطای داخل سرور رخ داده است.' }, { status: 500 });
  }
}
