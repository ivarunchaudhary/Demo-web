import { withAsset } from "../../_shared";
export const dynamic = "force-dynamic";
export async function GET(_req: Request, ctx: RouteContext<"/api/assets/[asset]/corporate-actions">) {
  return withAsset(ctx.params, (a) => ({ asset: a.asset, corporate_actions: a.corporate_action ? [a.corporate_action] : [] }));
}
