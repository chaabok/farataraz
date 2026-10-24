import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class RequestContextService {
  private static readonly als = new AsyncLocalStorage<Map<string, any>>();

  static getStore() {
    return this.als.getStore();
  }

  static run(store: Map<string, any>, callback: () => any) {
    return this.als.run(store, callback);
  }

  setUserId(userId: number) {
    const store = RequestContextService.getStore();
    if (store) {
      store.set('userId', userId);
    }
  }

  getUserId(): number | null {
    const store = RequestContextService.getStore();
    return store?.get('userId') || null;
  }

  getBusinessStructureId(): number | null {
    const store = RequestContextService.getStore();
    const val = store?.get('bsId');
    return (val && val > 1) ? val : 2; // ID 1 is reserved for system root
  }

  getCompanyId(): number | null {
    const store = RequestContextService.getStore();
    const val = store?.get('compId');
    return (val && val > 1) ? val : 2; // ID 1 is reserved for system root
  }

  getFiscalYearId(): number | null {
    const store = RequestContextService.getStore();
    return store?.get('fiscalYearId') || null;
  }
}
