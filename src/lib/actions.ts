// Meta reports the same conversion under several action_types (e.g. a website purchase
// shows up as "omni_purchase", "purchase" AND "offsite_conversion.fb_pixel_purchase").
// Summing them double/triple counts revenue. We take the FIRST type present, in
// priority order, which matches the "Purchases" column in Ads Manager.

export type MetaAction = { action_type: string; value: string };

export const ACTION_PRIORITY = {
  purchases: [
    "omni_purchase",
    "purchase",
    "offsite_conversion.fb_pixel_purchase",
    "onsite_web_purchase",
    "onsite_conversion.purchase",
    "app_custom_event.fb_mobile_purchase",
  ],
  add_to_carts: [
    "omni_add_to_cart",
    "add_to_cart",
    "offsite_conversion.fb_pixel_add_to_cart",
    "onsite_web_add_to_cart",
  ],
  checkouts: [
    "omni_initiated_checkout",
    "initiate_checkout",
    "offsite_conversion.fb_pixel_initiate_checkout",
    "onsite_web_initiate_checkout",
  ],
  leads: [
    "lead",
    "onsite_conversion.lead_grouped",
    "offsite_conversion.fb_pixel_lead",
    "onsite_conversion.lead",
  ],
  landing_page_views: ["landing_page_view", "omni_landing_page_view"],
} as const;

export function pickAction(
  actions: MetaAction[] | undefined,
  priority: readonly string[],
): number {
  if (!actions?.length) return 0;
  for (const type of priority) {
    const hit = actions.find((a) => a.action_type === type);
    if (hit) return Number(hit.value) || 0;
  }
  return 0;
}
