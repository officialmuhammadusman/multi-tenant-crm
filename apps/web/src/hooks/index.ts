// src/hooks/index.ts — single barrel export for all custom hooks
export { useAppDispatch, useAppSelector }   from './use-app-store';
export { useCurrentUser }                  from './use-current-user';
export type { CurrentUser }                from './use-current-user';
export { useDebounce }                     from './use-debounce';
export { usePagination }                   from './use-pagination';
export type { PaginationState }            from './use-pagination';
export { useAsync }                        from './use-async';
export type { UseAsyncReturn, AsyncState } from './use-async';
export { useAuth }                         from './use-auth';
export { useCustomers }                    from './use-customers';
export { useCustomerDetail }               from './use-customer-detail';
export { useActivity }                     from './use-activity';
export { useUsers }                        from './use-users';
export { useOrganizations }                from './use-organizations';
