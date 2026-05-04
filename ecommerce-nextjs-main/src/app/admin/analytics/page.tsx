import { connectMongoDB } from "@/libs/MongoConnect";
import Product from "@/libs/models/Product";
import Purchase from "@/libs/models/Purchase";
import User from "@/libs/models/User";

type CategoryRow = { _id: string; count: number };
type UserTxRow = { _id: string; count: number };

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  await connectMongoDB();

  const [usersCount, productsCount, purchasesCount] = await Promise.all([
    User.countDocuments({}),
    Product.countDocuments({}),
    Purchase.countDocuments({}),
  ]);

  const categories = (await Product.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ])) as CategoryRow[];

  const topUsers = (await Purchase.aggregate([
    { $group: { _id: "$userId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ])) as UserTxRow[];

  return (
    <div className="bg-white h-[calc(100vh-96px)] rounded-lg p-4 overflow-auto">
      <h2 className="text-3xl">Analytics</h2>
      <p className="text-sm text-slate-500 mt-1">High-level storefront metrics.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Users</p>
          <p className="text-3xl font-semibold mt-2">{usersCount}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Products</p>
          <p className="text-3xl font-semibold mt-2">{productsCount}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Purchases</p>
          <p className="text-3xl font-semibold mt-2">{purchasesCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="rounded-lg border border-slate-200 p-4">
          <h3 className="font-semibold">Products by category</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {categories.map((row) => (
              <li key={row._id} className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span>{row._id || "Uncategorized"}</span>
                <span className="font-semibold">{row.count}</span>
              </li>
            ))}
            {categories.length === 0 && <li className="text-slate-500">No category data.</li>}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <h3 className="font-semibold">Top purchasers</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {topUsers.map((row) => (
              <li key={row._id} className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="truncate pr-4">{row._id}</span>
                <span className="font-semibold">{row.count}</span>
              </li>
            ))}
            {topUsers.length === 0 && <li className="text-slate-500">No purchase data.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
