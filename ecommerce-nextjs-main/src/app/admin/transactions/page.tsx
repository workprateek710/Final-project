import { connectMongoDB } from "@/libs/MongoConnect";
import Product from "@/libs/models/Product";
import ProductRating from "@/libs/models/ProductRating";
import Purchase from "@/libs/models/Purchase";

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
  category?: string;
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
  const products = (await Product.find(
    { prodId: { $in: prodIds } },
    { prodId: 1, name: 1, price: 1, category: 1 }
  ).lean()) as unknown as ProductRef[];
  const ratings = (await ProductRating.find(
    {
      prodId: { $in: prodIds },
      userId: { $in: [...new Set(purchases.map((p) => p.userId).filter(Boolean))] },
    },
    { prodId: 1, userId: 1, rating: 1 }
  ).lean()) as unknown as RatingRef[];
  const prodMap = new Map(products.map((p) => [p.prodId, p]));
  const ratingMap = new Map(ratings.map((r) => [`${r.userId}:${r.prodId}`, r.rating]));

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
              <th className="text-left py-2">Category</th>
              <th className="text-left py-2">Price</th>
              <th className="text-left py-2">Rating</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((tx) => {
              const p = prodMap.get(tx.prodId);
              const rating = ratingMap.get(`${tx.userId}:${tx.prodId}`);
              return (
                <tr key={tx._id} className="border-t border-[#f1f1f1]">
                  <td className="py-2">{formatAdminDate(tx.createdAt)}</td>
                  <td className="py-2">{tx.userId}</td>
                  <td className="py-2">{p?.name || tx.prodId}</td>
                  <td className="py-2">{p?.category || "—"}</td>
                  <td className="py-2">{p?.price ? `$${p.price}` : "—"}</td>
                  <td className="py-2">{rating ?? "Not rated"}</td>
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
