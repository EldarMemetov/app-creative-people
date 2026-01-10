export const groupRoles = (roleSlots = []) => {
  const map = {};
  (roleSlots || []).forEach((rs) => {
    if (!rs) return;
    const role = String(rs.role || '').trim();
    const cnt = Math.max(1, Number(rs.required) || 1);
    if (!role) return;
    map[role] = (map[role] || 0) + cnt;
  });
  return Object.entries(map).map(([role, count]) => ({ role, count }));
};
