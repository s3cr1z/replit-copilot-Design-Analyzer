# Known Issues

## TypeScript typecheck failures unrelated to feature work

If `npm run check` fails in some environments, there are known pre-existing TypeScript issues outside most feature changes, including:

- `client/src/components/BudgetCircle.tsx`
- `server/storage.ts`

When this occurs, treat these as baseline repository issues unless your change directly touched those files.
