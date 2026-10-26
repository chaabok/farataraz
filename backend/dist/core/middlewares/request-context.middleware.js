"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestContextMiddleware = void 0;
const common_1 = require("@nestjs/common");
const request_context_service_1 = require("../services/request-context.service");
const jwt = __importStar(require("jsonwebtoken"));
const typeorm_1 = require("typeorm");
let RequestContextMiddleware = class RequestContextMiddleware {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async use(req, res, next) {
        const store = new Map();
        store.set('ip', req.ip);
        store.set('userAgent', req.headers['user-agent']);
        store.set('url', req.originalUrl);
        store.set('method', req.method);
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const decoded = jwt.decode(token);
                if (decoded && decoded.sub) {
                    store.set('userId', parseInt(decoded.sub, 10));
                }
            }
            catch (e) {
            }
        }
        const companyIdHeader = req.headers['x-company-id'];
        let selectedId = 0;
        if (companyIdHeader) {
            const parsed = parseInt(Array.isArray(companyIdHeader) ? companyIdHeader[0] : companyIdHeader, 10);
            if (!isNaN(parsed) && parsed > 1) {
                selectedId = parsed;
            }
        }
        let dbBsId = 2;
        let dbCompId = 2;
        try {
            let node = null;
            if (selectedId > 1) {
                const results = await this.dataSource.query(`SELECT "BusinessStructureID", "ParentRef", "BusinessStructure" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" = $1 AND "BusinessStructureID" <> 1`, [selectedId]);
                if (results && results.length > 0) {
                    node = results[0];
                }
            }
            if (!node) {
                const defaultNodes = await this.dataSource.query(`SELECT "BusinessStructureID", "ParentRef", "BusinessStructure" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" <> 1 ORDER BY "BusinessStructureID" ASC LIMIT 1`);
                if (defaultNodes && defaultNodes.length > 0) {
                    node = defaultNodes[0];
                }
            }
            if (node) {
                const nodeBsId = parseInt(node.BusinessStructureID, 10);
                const parentRef = parseInt(node.ParentRef || '0', 10);
                const type = parseInt(node.BusinessStructure || '0', 10);
                if (type === 2 && parentRef > 1) {
                    dbCompId = nodeBsId;
                    dbBsId = parentRef;
                }
                else {
                    dbCompId = nodeBsId;
                    dbBsId = nodeBsId;
                }
            }
        }
        catch (e) {
        }
        if (dbBsId <= 1)
            dbBsId = 2;
        if (dbCompId <= 1)
            dbCompId = 2;
        const branchIdHeader = req.headers['x-branch-id'];
        if (branchIdHeader) {
        }
        const fiscalYearHeader = req.headers['x-fiscal-year-id'];
        if (fiscalYearHeader) {
            const fiscalYearId = parseInt(Array.isArray(fiscalYearHeader) ? fiscalYearHeader[0] : fiscalYearHeader, 10);
            if (!isNaN(fiscalYearId)) {
                store.set('fiscalYearId', fiscalYearId);
            }
        }
        store.set('bsId', dbBsId);
        store.set('compId', dbCompId);
        request_context_service_1.RequestContextService.run(store, () => next());
    }
};
exports.RequestContextMiddleware = RequestContextMiddleware;
exports.RequestContextMiddleware = RequestContextMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], RequestContextMiddleware);
//# sourceMappingURL=request-context.middleware.js.map