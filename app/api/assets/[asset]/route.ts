import { withAsset } from "../_shared";
export const dynamic = "force-dynamic";
export async function GET(_req: Request, ctx: RouteContext<"/api/assets/[asset]">) {
  return withAsset(ctx.params, (a) => a);
}
