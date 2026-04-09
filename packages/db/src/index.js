"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaClient = exports.Prisma = void 0;
// packages/db/src/index.ts
// Exports Prisma client types only.
// The NestJS Injectable PrismaService lives in apps/api/src/prisma/prisma.service.ts
var prisma_1 = require("./generated/prisma");
Object.defineProperty(exports, "Prisma", { enumerable: true, get: function () { return prisma_1.Prisma; } });
Object.defineProperty(exports, "PrismaClient", { enumerable: true, get: function () { return prisma_1.PrismaClient; } });
//# sourceMappingURL=index.js.map