# Role Permissions Matrix

| Action | Super Admin | Admin | Member | Enforced In |
|--------|-------------|-------|--------|-------------|
| Login | ✅ | ✅ | ✅ | `AuthService.loginAndGetRefreshToken` |
| Refresh token | ✅ | ✅ | ✅ | `AuthService.refresh` |
| Logout | ✅ | ✅ | ✅ | `AuthService.logout` |
| **Organizations** | | | | |
| List all organizations | ✅ | ❌ | ❌ | `SuperAdminGuard` |
| Get organization by id | ✅ | ❌ | ❌ | `SuperAdminGuard` |
| Create organization | ✅ | ❌ | ❌ | `SuperAdminGuard` |
| **Users** | | | | |
| Get own profile (`/users/me`) | ✅ | ✅ | ✅ | `JwtAuthGuard` |
| List users in org | ✅ | ✅ | ✅ | `JwtAuthGuard` |
| Create user | ✅ | ✅ (own org) | ❌ | `RolesGuard @Roles('ADMIN')` |
| **Customers** | | | | |
| Create customer | ✅ | ✅ | ✅ | `JwtAuthGuard` |
| List customers | ✅ (global) | ✅ (own org) | ✅ (own org) | Prisma extension + org scope |
| View customer detail | ✅ | ✅ (own org) | ✅ (own org) | `TenantGuard` |
| Edit customer | ✅ | ✅ (own org) | ✅ (if assigned to them) | `CustomersService.update` + member check |
| Soft delete customer | ✅ | ✅ (own org) | ❌ | `RolesGuard @Roles('ADMIN')` |
| Restore customer | ✅ | ✅ (own org) | ❌ | `RolesGuard @Roles('ADMIN')` |
| Assign customer | ✅ (no limit) | ✅ (5-limit) | ❌ | `RolesGuard @Roles('ADMIN')` + `CustomersService.assign` |
| **Notes** | | | | |
| Create note | ✅ (any org) | ✅ (own org) | ✅ (own org) | `NotesService.create` org check |
| List notes by customer | ✅ | ✅ (own org) | ✅ (own org) | `NotesService.findByCustomer` |
| **Activity Logs** | | | | |
| List activity (global) | ✅ | ❌ | ❌ | Role check in `ActivityService.findAll` |
| List activity (own org) | ✅ | ✅ | ✅ | `ActivityService.findAll` org scope |
| List activity by customer | ✅ | ✅ (own org) | ✅ (own org) | `ActivityService.findByCustomer` |

## Notes

- **Super Admin** bypasses ALL guards when `isSuperAdmin === true AND role === 'SUPER_ADMIN'`
- **Member edit rule**: Members can only edit customers where `customer.assignedTo === member.userId`. Enforced in `CustomersService.update()` with a 403 if violated.
- **5-customer limit**: Enforced with `SELECT FOR UPDATE` in a `Serializable` transaction in `CustomersService.assign()`. Super admins are exempt.
- **Tenant isolation**: Every non-super-admin query has `organizationId` automatically injected by the Prisma Client Extension via `AsyncLocalStorage`.
