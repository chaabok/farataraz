"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RequestContextService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestContextService = void 0;
const common_1 = require("@nestjs/common");
const async_hooks_1 = require("async_hooks");
let RequestContextService = RequestContextService_1 = class RequestContextService {
    static getStore() {
        return this.als.getStore();
    }
    static run(store, callback) {
        return this.als.run(store, callback);
    }
    setUserId(userId) {
        const store = RequestContextService_1.getStore();
        if (store) {
            store.set('userId', userId);
        }
    }
    getUserId() {
        const store = RequestContextService_1.getStore();
        return store?.get('userId') || null;
    }
    getBusinessStructureId() {
        const store = RequestContextService_1.getStore();
        const val = store?.get('bsId');
        return (val && val > 1) ? val : 2;
    }
    getCompanyId() {
        const store = RequestContextService_1.getStore();
        const val = store?.get('compId');
        return (val && val > 1) ? val : 2;
    }
    getFiscalYearId() {
        const store = RequestContextService_1.getStore();
        return store?.get('fiscalYearId') || null;
    }
};
exports.RequestContextService = RequestContextService;
RequestContextService.als = new async_hooks_1.AsyncLocalStorage();
exports.RequestContextService = RequestContextService = RequestContextService_1 = __decorate([
    (0, common_1.Injectable)()
], RequestContextService);
//# sourceMappingURL=request-context.service.js.map