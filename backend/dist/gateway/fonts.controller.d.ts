interface UploadedFontPayload {
    originalname?: string;
    size?: number;
    mimetype?: string;
    buffer?: Buffer;
}
export declare class FontsController {
    private readonly logger;
    private fontsDir;
    list(): {
        fonts: {
            filename: string;
            url: string;
        }[];
    };
    upload(file?: UploadedFontPayload): {
        success: boolean;
        url: string;
        filename: string;
    };
    remove(filename?: string): {
        success: boolean;
        message: string;
    };
}
export {};
