import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LOADING_MESSAGE_KEY, LOADING_MODE, LOADING_SCOPE, SKIP_LOADING } from '../http-context';
import { LoadingService } from '../loading.service';

/** Counts every request in LoadingService until it completes, fails or is cancelled. */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_LOADING)) return next(req);
  const loading = inject(LoadingService);
  const scope = req.context.get(LOADING_SCOPE) ?? 'http';
  const mode = req.context.get(LOADING_MODE);
  const messageKey = req.context.get(LOADING_MESSAGE_KEY) ?? undefined;
  const id = loading.start({ scope, mode, messageKey });
  return next(req).pipe(finalize(() => loading.stop(id)));
};
