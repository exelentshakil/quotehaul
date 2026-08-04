export const PERMISSION_SECTIONS = ["overview", "leads", "capacity", "customers", "invoices", "settings", "team"] as const;
export type PermissionSection = (typeof PERMISSION_SECTIONS)[number];
export type Permissions = Record<PermissionSection, boolean>;

export const DEFAULT_STAFF_PERMISSIONS: Permissions = {
  overview: true,
  leads: true,
  capacity: true,
  customers: true,
  invoices: true,
  settings: false,
  team: false,
};

export type Membership = { tenant_id: string; role: string; permissions: Permissions | null };

// The owner always has full access regardless of the permissions map — it
// only ever restricts staff. Managing team members (invite/edit/remove) is
// gated separately, at role === "owner", so a staff member granted "team"
// view access can't escalate their own or anyone else's permissions.
export function canAccess(membership: Membership | null, section: PermissionSection): boolean {
  if (!membership) return false;
  if (membership.role === "owner") return true;
  return membership.permissions?.[section] ?? DEFAULT_STAFF_PERMISSIONS[section];
}
