import { withAsset } from "../../_shared";
export const dynamic = "force-dynamic";
export async function GET(_req: Request, ctx: RouteContext<"/api/assets/[asset]/transfers">) {
  return withAsset(ctx.params, (a) => ({
    asset: a.asset,
    token_status: a.token_status,
    transfer_status: a.transfer_status,
    signals: { token: a.signals.token, transfers: a.signals.transfers },
  }));
}
