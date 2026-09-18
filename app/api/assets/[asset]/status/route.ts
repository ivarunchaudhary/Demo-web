import { withAsset } from "../../_shared";
export const dynamic = "force-dynamic";
export async function GET(_req: Request, ctx: RouteContext<"/api/assets/[asset]/status">) {
  return withAsset(ctx.params, (a) => ({
    asset: a.asset,
    token: a.token,
    chain: a.chain,
    overall_status: a.overall_status,
    reasons: a.reasons,
    token_status: a.token_status,
    transfer_status: a.transfer_status,
    trading_status: a.trading_status,
    oracle_status: a.oracle_status,
    underlying_status: a.underlying_status,
    corporate_action: a.corporate_action ? a.corporate_action.type : null,
    last_updated: a.last_updated,
  }));
}
