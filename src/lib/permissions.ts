import type { UserRole } from "@prisma/client";

export const PERMISSIONS = {
  CLIENTS_VIEW_ALL: ["SUPER_ADMIN", "DIETITIAN", "NUTRITIONIST", "RECEPTIONIST", "MANAGER"] as UserRole[],
  CLIENTS_VIEW_OWN: ["SUPER_ADMIN", "DIETITIAN", "NUTRITIONIST"] as UserRole[],
  CLIENTS_APPROVE: ["SUPER_ADMIN", "DIETITIAN", "RECEPTIONIST", "MANAGER"] as UserRole[],
  CLIENTS_EDIT: ["SUPER_ADMIN", "DIETITIAN"] as UserRole[],
  STAFF_MANAGE: ["SUPER_ADMIN"] as UserRole[],
  STAFF_VIEW: ["SUPER_ADMIN", "MANAGER"] as UserRole[],
  APPOINTMENTS_MANAGE: ["SUPER_ADMIN", "DIETITIAN", "NUTRITIONIST", "RECEPTIONIST"] as UserRole[],
  APPOINTMENTS_OWN: ["SUPER_ADMIN", "DIETITIAN", "NUTRITIONIST"] as UserRole[],
  MEAL_PLANS_MANAGE: ["SUPER_ADMIN", "DIETITIAN", "NUTRITIONIST"] as UserRole[],
  CONTENT_MANAGE: ["SUPER_ADMIN", "CONTENT_MANAGER"] as UserRole[],
  PAYMENTS_MANAGE: ["SUPER_ADMIN", "FINANCE"] as UserRole[],
  PAYMENTS_VIEW: ["SUPER_ADMIN", "FINANCE", "MANAGER", "DIETITIAN"] as UserRole[],
  MESSAGES_SEND: ["SUPER_ADMIN", "DIETITIAN", "NUTRITIONIST", "RECEPTIONIST", "MANAGER"] as UserRole[],
  SETTINGS_MANAGE: ["SUPER_ADMIN"] as UserRole[],
  AUDIT_VIEW: ["SUPER_ADMIN"] as UserRole[],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly UserRole[]).includes(role);
}

export function getPermissions(role: UserRole): Permission[] {
  return (Object.keys(PERMISSIONS) as Permission[]).filter((p) => can(role, p));
}

export const STAFF_ROLES: UserRole[] = [
  "SUPER_ADMIN", "DIETITIAN", "NUTRITIONIST", "RECEPTIONIST", "MANAGER", "CONTENT_MANAGER", "FINANCE",
];

export const ROLE_META: Record<string, { label: string; description: string; color: string }> = {
  SUPER_ADMIN: { label: "Super Admin", description: "Full access to everything", color: "bg-rose-500/15 text-rose-600" },
  DIETITIAN: { label: "Dietitian", description: "Clinical — manage own clients & appointments", color: "bg-emerald-500/15 text-emerald-600" },
  NUTRITIONIST: { label: "Nutritionist", description: "Clinical — manage own clients & appointments", color: "bg-teal-500/15 text-teal-600" },
  RECEPTIONIST: { label: "Receptionist", description: "Front desk — appointments & client approval", color: "bg-blue-500/15 text-blue-600" },
  MANAGER: { label: "Manager", description: "View access across most modules", color: "bg-purple-500/15 text-purple-600" },
  CONTENT_MANAGER: { label: "Content Manager", description: "Blog, testimonials, FAQs, newsletter", color: "bg-amber-500/15 text-amber-600" },
  FINANCE: { label: "Finance", description: "Payment management & invoices", color: "bg-indigo-500/15 text-indigo-600" },
  CLIENT: { label: "Client", description: "Client portal access", color: "bg-muted text-muted-foreground" },
};