interface AiChatBody {
    message?: string;
    provider?: string;
    history?: unknown;
}
export declare class AiChatController {
    private readonly logger;
    private searchAccount;
    private searchDetailedAccount;
    chat(body?: AiChatBody): Promise<{
        reply: string;
    }>;
}
export {};
