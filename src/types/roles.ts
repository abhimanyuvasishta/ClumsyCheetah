export const STAFF_ROLES = [
  "ADMIN",
  "ORDER_MANAGER",
  "CATALOG_MANAGER",
  "STORE_MANAGER",
  "DELIVERY_MANAGER",
  "SUPER_ADMIN",
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export type AppRole = "CUSTOMER" | StaffRole;

export const CATALOG_WRITE_ROLES: StaffRole[] = [
  "ADMIN",
  "SUPER_ADMIN",
  "CATALOG_MANAGER",
];

export const ORDER_WRITE_ROLES: StaffRole[] = [
  "ADMIN",
  "SUPER_ADMIN",
  "ORDER_MANAGER",
  "STORE_MANAGER",
];

export function isStaffRole(role: string): role is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(role);
}
