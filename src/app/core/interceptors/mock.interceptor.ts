import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, delay } from 'rxjs';

export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  // If the request is for an external asset (e.g. JSON file), let it pass
  if (req.url.endsWith('.json')) {
    return next(req);
  }

  // Intercept SDC List
  if (req.url.includes('/api/v1/sdcs') && req.method === 'GET') {
    const mockResponse = {
      success: true,
      data: {
        items: [
          { id: '1', sdcCode: 'SDC-0001', name: 'Jaipur Skill Center', tpName: 'ARNOLD SAMARTH', scheme: 'SAMARTH', status: 'APPROVED', district: 'Jaipur', noOfApprovedBatches: 3, noOfCompletedBatches: 5, noOfOngoingBatches: 2 },
          { id: '2', sdcCode: 'SDC-0002', name: 'Ajmer Training Inst.', tpName: 'ARNOLD SAMARTH', scheme: 'SAMARTH', status: 'PENDING_INSPECTION', district: 'Ajmer', noOfApprovedBatches: 1, noOfCompletedBatches: 0, noOfOngoingBatches: 1 }
        ],
        total: 2,
        page: 1,
        pageSize: 10
      }
    };
    return of(new HttpResponse({ status: 200, body: mockResponse })).pipe(delay(500));
  }

  // Fallback (allow through or return empty 404 mock)
  // For now we will allow it to pass, but in a full mock setup we'd intercept everything.
  return next(req);
};
