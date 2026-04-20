/**
 * Department of Internal Trade (กรมการค้าภายใน) — Thai retail/wholesale price API.
 * Public endpoints, CORS-enabled, JSON.
 * Docs: https://pricelist.dit.go.th/
 */

export const DIT_API = "https://pricelist.dit.go.th";

export type DITGroup = { group_id: string; group_name: string };
export type DITProduct = { product_id: string; product_name: string };

export type DITPriceRecord = {
  id: string;
  price_date: string; // "YYYY-MM-DD HH:mm:ss"
  product_min: string; // numeric string
  product_max: string; // numeric string
  product_desc?: string;
  product_id: string;
  product_name: string;
  unit: string;
  unit_id?: string;
  catagory?: string; // sic — the API typo
  group_id?: string;
  group_name?: string;
};

async function ditFetch<T>(
  url: string,
  opts: { revalidate?: number; tags?: string[] } = {}
): Promise<T | null> {
  try {
    const res = await fetch(url, {
      next: {
        revalidate: opts.revalidate ?? 3600,
        tags: opts.tags ?? ["dit"],
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** List of category groups for retail (ID=1) or wholesale (ID=2). */
export async function getDITGroups(
  type: "retail" | "wholesale" = "retail"
): Promise<DITGroup[]> {
  const id = type === "retail" ? 1 : 2;
  const data = await ditFetch<DITGroup[]>(
    `${DIT_API}/getdata.php?ID=${id}&TYPE=dit`,
    { revalidate: 86400, tags: ["dit-groups", `dit-groups-${type}`] }
  );
  return data ?? [];
}

/** Products inside a category group. */
export async function getDITProducts(groupId: string): Promise<DITProduct[]> {
  const data = await ditFetch<DITProduct[]>(
    `${DIT_API}/getdata.php?ID=${encodeURIComponent(groupId)}&TYPE=product`,
    { revalidate: 86400, tags: ["dit-products", `dit-products-${groupId}`] }
  );
  return data ?? [];
}

/** Raw price records in a date range for a single product. */
export async function getDITPrices(
  productId: string,
  opts: { from?: string; to?: string } = {}
): Promise<DITPriceRecord[]> {
  const to = opts.to ?? new Date().toISOString().slice(0, 10);
  const fromDate = opts.from
    ? opts.from
    : (() => {
        const d = new Date();
        d.setDate(d.getDate() - 14); // last 14 days
        return d.toISOString().slice(0, 10);
      })();

  const url = `${DIT_API}/pricelist_api.php?action=apiPricelist&pid=${encodeURIComponent(
    productId
  )}&pricedate=${fromDate}&pricedateto=${to}`;
  const data = await ditFetch<{ data?: DITPriceRecord[] }>(url, {
    revalidate: 3600,
    tags: ["dit-prices", `dit-prices-${productId}`],
  });
  return data?.data ?? [];
}

/** Latest single price record for a product (most recent within last 14 days). */
export async function getDITLatestPrice(
  productId: string
): Promise<DITPriceRecord | null> {
  const records = await getDITPrices(productId);
  if (!records.length) return null;
  // Records typically come ascending by date; pick latest
  const sorted = [...records].sort(
    (a, b) => new Date(b.price_date).getTime() - new Date(a.price_date).getTime()
  );
  return sorted[0] ?? null;
}

/** Fetch many latest prices in parallel. */
export async function getDITLatestPrices(
  productIds: string[]
): Promise<(DITPriceRecord | null)[]> {
  return Promise.all(productIds.map((id) => getDITLatestPrice(id)));
}

/** Human helpers */

export function formatPrice(rec: DITPriceRecord): string {
  const min = Number(rec.product_min);
  const max = Number(rec.product_max);
  if (!Number.isFinite(min) && !Number.isFinite(max)) return "—";
  if (min === max || !Number.isFinite(max)) return formatBaht(min);
  return `${formatBaht(min)} – ${formatBaht(max)}`;
}

export function formatBaht(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function priceDateShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

export type HomePriceItem = {
  id: string;
  label: string;
  icon: "rice" | "chicken" | "pig" | "egg" | "fish" | "leaf" | "citrus" | "garlic";
};

/** Curated 8 items shown on the home-page widget. */
export const HOME_PRICE_ITEMS: HomePriceItem[] = [
  { id: "R13001", label: "ข้าวสารเจ้า 100% หอม", icon: "rice" },
  { id: "P11009", label: "ไก่สดทั้งตัว", icon: "chicken" },
  { id: "P11001", label: "สุกรชำแหละ สันใน", icon: "pig" },
  { id: "P11027", label: "ไข่ไก่ เบอร์ 2", icon: "egg" },
  { id: "P12014", label: "ปลาทูสด", icon: "fish" },
  { id: "P13001", label: "ผักคะน้า", icon: "leaf" },
  { id: "P14001", label: "ส้มสายน้ำผึ้ง เบอร์ 4", icon: "citrus" },
  { id: "P15001", label: "กระเทียมจีน แห้งใหญ่", icon: "garlic" },
];
