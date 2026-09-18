import { withAsset } from "../../_shared";
export const dynamic = "force-dynamic";
export async function GET(_req: Request, ctx: RouteContext<"/api/assets/[asset]/sources">) {
  return withAsset(ctx.params, (a) => ({ asset: a.asset, sources: a.sources }));
}
