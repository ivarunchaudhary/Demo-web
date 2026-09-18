import { getAsset } from "@/lib/provider";
import type { AssetStatusResponse } from "@/lib/types";

export const headers = { "cache-control": "public, max-age=15, stale-while-revalidate=30" };

export async function withAsset(
  params: Promise<{ asset: string }>,
  pick: (a: AssetStatusResponse) => unknown,
): Promise<Response> {
  const { asset } = await params;
  const data = await getAsset(asset);
  if (!data) {
    return Response.json(
      { error: "asset_not_found", message: `No Stock Token tracked for "${asset.toUpperCase()}".` },
      { status: 404 },
    );
  }
  return Response.json(pick(data), { headers });
}
