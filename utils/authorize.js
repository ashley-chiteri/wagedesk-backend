import supabase from "../libs/supabaseClient.js";


export async function authorize(
  userId,
  workspaceId,
  module,
  permission
) {
  /**
   * 1. Workspace owner = full access
   */
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("id", workspaceId)
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (workspace) {
    return { allowed: true, role: "OWNER" };
  }

  /**
   * 2. Get workspace role
   */
  const { data: membership } = await supabase
    .from("workspace_users")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!membership) {
    return { allowed: false, reason: "NOT_IN_WORKSPACE" };
  }

  /**
   * 3. Check role permissions
   */
  const { data: perms } = await supabase
    .from("role_module_permissions")
    .select(permission)
    .eq("role", membership.role)
    .eq("module", module)
    .maybeSingle();

  if (!perms || !perms[permission]) {
    return {
      allowed: false,
      role: membership.role,
      reason: "INSUFFICIENT_PERMISSIONS",
    };
  }

  return { allowed: true, role: membership.role };
}
