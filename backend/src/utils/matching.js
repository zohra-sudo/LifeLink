/**
 * Blood-type donor → recipient compatibility (red-cell rules) and a simple
 * compatibility score used to rank candidate donors for a request.
 */

// Map of donor blood type → set of recipient blood types it can give to.
const CAN_DONATE_TO = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

export function canDonate(donorBloodType, recipientBloodType) {
  const list = CAN_DONATE_TO[donorBloodType];
  return Array.isArray(list) && list.includes(recipientBloodType);
}

/**
 * Compatibility score 0–100. Exact blood-type match scores highest; a
 * universal donor (O-) for a non-O recipient scores slightly lower because the
 * unit is "spent" on a broader recipient. Returns 0 if incompatible.
 */
export function compatibilityScore(donorBloodType, recipientBloodType) {
  if (!canDonate(donorBloodType, recipientBloodType)) return 0;
  if (donorBloodType === recipientBloodType) return 99;
  if (donorBloodType === "O-") return 88;
  return 94;
}
