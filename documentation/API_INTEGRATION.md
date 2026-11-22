# API integration

Every backend call goes through one path. Screens never call `HttpClient` and never build a URL.

```
screen / feature service
  ├─ DataEngineService.for('KEY')     list / getAll / getById / create / update / delete
  ├─ createPersistedStore({ dataKey }) signal list for services that work synchronously
  └─ HttpService.call(API_ENDPOINTS.KEY.ACTION, { id, body, params })   non-CRUD actions
        │
        ▼
  provideApiHttp() interceptors: api (headers, cookies, timeout) → loading → error (ApiError + toast) → auth (bearer, refresh on 401)
```

## Files

| File | What it holds |
|---|---|
| `src/environments/environment*.ts` | `apiUrl`, `api.clientId` / `apiKey` / `withCredentials` / `timeoutMs`, `useMockData` |
| `proxy.conf.json` | `ng serve` forwards `/api` to the backend (default `http://localhost:5132`) |
| `core/config/api.config.ts` | `API_ENDPOINTS`: every URL and method, by resource key |
| `core/mock/mock.config.ts` | One mock on/off flag per resource key |
| `core/http/` | `HttpService`, interceptors, `ApiError`, query-param and response-envelope helpers, `LoadingService` |
| `core/auth/token.service.ts`, `auth-api.service.ts` | Bearer token storage, refresh / logout / session calls |

## Switching a resource to the real API

1. Check its URLs in `API_ENDPOINTS` match the backend.
2. Set its flag to `false` in `MOCK_CONFIG.resources` (or `useMockData: false` to switch everything).
3. Nothing changes in the screen. Lists send `page`, `pageSize`, `search`, `searchFields`, each `filter` entry,
   `sortBy` and `sortDescending` as query params. Responses may be `T[]`, `{ items }`, `{ data }` or
   `{ data: { items } }`, with `total` or `totalCount`.

## Adding a resource

1. Add it to `API_ENDPOINTS` (`crud('/path')`, `readOnly('/path')` or single `endpoint()` entries).
2. Add a flag for it in `MOCK_CONFIG.resources`.
3. Mock data goes in `core/mock/data/*.mock.ts`. Types go in the feature's `models`, never in a mock file.

## Errors

Failed calls error with `ApiError` (`status`, `message`, `code`, `errors`, `correlationId`) after a toast was shown.
Pass `flags: { skipErrorToast: true }` to show your own message, `skipLoading` for background calls and `skipAuth` for
calls that must not carry the token.

## Not API data

Unsaved drafts stay in the browser through `StorageService`: OTR form draft, EOI drafts, MoU draft, aspirant
profile draft and expressed interests.
