import { connectMongoDB } from "@/libs/MongoConnect";
import Product from "@/libs/models/Product";
import ProductRating from "@/libs/models/ProductRating";
import Purchase from "@/libs/models/Purchase";
import User from "@/libs/models/User";

type TxRow = {
  _id: string;
  userId: string;
  prodId: string;
  createdAt: string;
};

type ProductRef = {
  prodId: string;
  name: string;
  price: string;
  subcategory?: string;
};

type RatingRef = {
  prodId: string;
  userId: string;
  rating: number;
};

export const dynamic = "force-dynamic";

const ADMIN_TIME_ZONE = "America/Los_Angeles";

function formatAdminDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: ADMIN_TIME_ZONE,
  }).format(new Date(value));
}

export default async function TransactionsPage() {
  await connectMongoDB();
  const purchases = (await Purchase.find({}, { userId: 1, prodId: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .limit(300)
    .lean()) as unknown as TxRow[];

  const prodIds = [...new Set(purchases.map((p) => p.prodId).filter(Boolean))];
  const purchaseUserIds = [...new Set(purchases.map((p) => p.userId).filter(Boolean))];
  const normalizedEmails = purchaseUserIds.map((id) => id.trim().toLowerCase());

  const [products, ratings, existingUsers] = await Promise.all([
    Product.find({ prodId: { $in: prodIds } }, { prodId: 1, name: 1, price: 1, subcategory: 1 }).lean(),
    ProductRating.find(
      { prodId: { $in: prodIds }, userId: { $in: purchaseUserIds } },
      { prodId: 1, userId: 1, rating: 1 }
    ).lean(),
    User.find({ email: { $in: normalizedEmails } }, { email: 1 }).lean(),
  ]);

  const prodMap = new Map((products as unknown as ProductRef[]).map((p) => [p.prodId, p]));
  const ratingMap = new Map(
    (ratings as unknown as RatingRef[]).map((r) => [`${r.userId}:${r.prodId}`, r.rating])
  );
  const registeredEmails = new Set(
    (existingUsers as { email: string }[]).map((u) => u.email.trim().toLowerCase())
  );

  function displayUser(userId: string) {
    const raw = userId.trim();
    const lower = raw.toLowerCase();
    if (!lower || lower === "anonymous") return raw || "—";
    return registeredEmails.has(lower) ? raw : "deleted user";
  }

  return (
    <div className="bg-white h-[calc(100vh-96px)] rounded-lg p-4 overflow-auto">
      <h2 className="text-3xl">Transactions</h2>
      <p className="text-sm text-slate-500 mt-1">Recent purchase rows used by recommendations.</p>
      <div className="mt-4 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-t border-[#ececec]">
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">User</th>
              <th className="text-left py-2">Product</th>
              <th className="text-left py-2">Subcategory</th>
              <th className="text-left py-2">Price</th>
              <th className="text-left py-2">Rating</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((tx) => {
              const p = prodMap.get(tx.prodId);
              const productRemoved = !p;
              const rating = ratingMap.get(`${tx.userId}:${tx.prodId}`);
              return (
                <tr key={tx._id} className="border-t border-[#f1f1f1]">
                  <td className="py-2">{formatAdminDate(tx.createdAt)}</td>
                  <td className="py-2">{displayUser(tx.userId)}</td>
                  <td className="py-2">{productRemoved ? "Deleted product" : p!.name || tx.prodId}</td>
                  <td className="py-2">{productRemoved ? null : p!.subcategory || "General"}</td>
                  <td className="py-2">{productRemoved ? null : p!.price ? `$${p!.price}` : "—"}</td>
                  <td className="py-2">{productRemoved ? null : rating !== undefined ? rating : "Not rated"}</td>
                </tr>
              );
            })}
            {purchases.length === 0 && (
              <tr>
                <td className="py-4 text-slate-500" colSpan={6}>
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
