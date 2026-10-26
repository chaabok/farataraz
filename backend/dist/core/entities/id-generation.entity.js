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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDGeneration = void 0;
const typeorm_1 = require("typeorm");
let IDGeneration = class IDGeneration {
};
exports.IDGeneration = IDGeneration;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        name: 'IDGenerationID',
        type: 'bigint',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], IDGeneration.prototype, "idGenerationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, name: 'TableName' }),
    __metadata("design:type", String)
], IDGeneration.prototype, "tableName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'bigint',
        name: 'LastID',
        default: 0,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], IDGeneration.prototype, "lastId", void 0);
exports.IDGeneration = IDGeneration = __decorate([
    (0, typeorm_1.Entity)({ name: 'IDGeneration', schema: 'Gnr' }),
    (0, typeorm_1.Unique)(['tableName'])
], IDGeneration);
//# sourceMappingURL=id-generation.entity.js.map