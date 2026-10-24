import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestContextService } from '../services/request-context.service';
import * as jwt from 'jsonwebtoken';
import { DataSource } from 'typeorm';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly dataSource: DataSource) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const store = new Map<string, any>();
    
    // Store request details for auditing
    store.set('ip', req.ip);
    store.set('userAgent', req.headers['user-agent']);
    store.set('url', req.originalUrl);
    store.set('method', req.method);
    
    // Extract userId from JWT if present
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded: any = jwt.decode(token);
        if (decoded && decoded.sub) {
          store.set('userId', parseInt(decoded.sub, 10));
        }
      } catch (e) {
        // Ignore token errors here, they will be caught by the AuthGuard
      }
    }

    // Determine correct BusinessStructureId and CompanyId based on selected node
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
      let node: any = null;
      if (selectedId > 1) {
        // Query Gnr.BusinessStructure for requested node (excluding system root ID 1)
        const results = await this.dataSource.query(
           `SELECT "BusinessStructureID", "ParentRef", "BusinessStructure" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" = $1 AND "BusinessStructureID" <> 1`, 
           [selectedId]
        );
        if (results && results.length > 0) {
          node = results[0];
        }
      }

      // Fallback: If no valid selected node > 1, find the first default operational Headquarters or Company
      if (!node) {
        const defaultNodes = await this.dataSource.query(
          `SELECT "BusinessStructureID", "ParentRef", "BusinessStructure" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" <> 1 ORDER BY "BusinessStructureID" ASC LIMIT 1`
        );
        if (defaultNodes && defaultNodes.length > 0) {
          node = defaultNodes[0];
        }
      }

      if (node) {
        const nodeBsId = parseInt(node.BusinessStructureID, 10);
        const parentRef = parseInt(node.ParentRef || '0', 10);
        const type = parseInt(node.BusinessStructure || '0', 10);

        if (type === 2 && parentRef > 1) {
          // Company node whose parent is a Headquarters (> 1)
          dbCompId = nodeBsId;
          dbBsId = parentRef;
        } else {
          // Headquarters / Holding or top-level node (whose parentRef is system root 1)
          dbCompId = nodeBsId;
          dbBsId = nodeBsId;
        }
      }
    } catch (e) {
      // Keep defaults dbBsId = 2, dbCompId = 2
    }

    // Ensure we strictly enforce Rule 2: ID 1 is reserved for system root only
    if (dbBsId <= 1) dbBsId = 2;
    if (dbCompId <= 1) dbCompId = 2;
    
    // Fallback: If for some reason we need a branch from header specifically, though usually it derives from node selection:
    const branchIdHeader = req.headers['x-branch-id'];
    if (branchIdHeader) {
       // Currently unused by backend scope context, but saved if needed.
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

    RequestContextService.run(store, () => next());
  }
}
