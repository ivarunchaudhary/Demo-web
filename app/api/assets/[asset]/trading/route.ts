import { withAsset } from "../../_shared";
export const dynamic = "force-dynamic";
export async function GET(_req: Request, ctx: RouteContext<"/api/assets/[asset]/trading">) {
  return withAsset(ctx.params, (a) => ({
    asset: a.asset,
    trading_status: a.trading_status,
    underlying_status: a.underlying_status,
    signals: { trading: a.signals.trading, underlying: a.signals.underlying },
  }));
}
