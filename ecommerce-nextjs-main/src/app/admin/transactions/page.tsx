import { connectMongoDB } from "@/libs/MongoConnect";
import Product from "@/libs/models/Product";
import Purchase from "@/libs/models/Purchase";

type TxRow = {
  _id: string;
  userId: string;
  prodId: string;
  rating: number;
  createdAt: string;
};

type ProductRef = {
  prodId: string;
  name: string;
  price: string;
  category?: string;
};

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  await connectMongoDB();
  const purchases = (await Purchase.find({}, { userId: 1, prodId: 1, rating: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .limit(300)
    .lean()) as unknown as TxRow[];

  const prodIds = [...new Set(purchases.map((p) => p.prodId).filter(Boolean))];
  const products = (await Product.find(
    { prodId: { $in: prodIds } },
    { prodId: 1, name: 1, price: 1, category: 1 }
  ).lean()) as unknown as ProductRef[];
  const prodMap = new Map(products.map((p) => [p.prodId, p]));

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
              return (
                <tr key={tx._id} className="border-t border-[#f1f1f1]">
                  <td className="py-2">{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className="py-2">{tx.userId}</td>
                  <td className="py-2">{p?.name || tx.prodId}</td>
                  <td className="py-2">{p?.category || "—"}</td>
                  <td className="py-2">{p?.price ? `$${p.price}` : "—"}</td>
                  <td className="py-2">{tx.rating}</td>
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
