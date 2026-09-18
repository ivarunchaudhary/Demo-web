import { withAsset } from "../../_shared";
export const dynamic = "force-dynamic";
export async function GET(_req: Request, ctx: RouteContext<"/api/assets/[asset]/oracle">) {
  return withAsset(ctx.params, (a) => ({ asset: a.asset, oracle_status: a.oracle_status, signal: a.signals.oracle }));
}
