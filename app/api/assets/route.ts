import { listAssets, PROVIDER_MODE } from "@/lib/provider";

export const dynamic = "force-dynamic";

export async function GET() {
  const assets = await listAssets();
  return Response.json(
    { chain: "Robinhood Chain", provider: PROVIDER_MODE, count: assets.length, assets },
    { headers: { "cache-control": "public, max-age=15, stale-while-revalidate=30" } },
  );
}
