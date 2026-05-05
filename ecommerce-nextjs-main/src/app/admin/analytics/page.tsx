import { connectMongoDB } from "@/libs/MongoConnect";
import Product from "@/libs/models/Product";
import Purchase from "@/libs/models/Purchase";
import User from "@/libs/models/User";

type SubcategoryRow = { _id: string; count: number };
type UserTxRow = { _id: string; count: number };
type ProductPurchaseRow = { _id: string; count: number; name?: string; category?: string };
type CategoryPurchaseRow = { _id: string; count: number };

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  await connectMongoDB();

  const [usersCount, productsCount, purchasesCount] = await Promise.all([
    User.countDocuments({}),
    Product.countDocuments({}),
    Purchase.countDocuments({}),
  ]);

  const subcategories = (await Product.aggregate([
    { $match: { category: "Electronics" } },
    {
      $project: {
        subcategory: {
          $cond: [
            { $or: [{ $eq: ["$subcategory", null] }, { $eq: ["$subcategory", ""] }] },
            "General",
            "$subcategory",
          ],
        },
      },
    },
    { $group: { _id: "$subcategory", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ])) as SubcategoryRow[];

  const topUsers = (await Purchase.aggregate([
    { $group: { _id: "$userId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ])) as UserTxRow[];

  const topProducts = (await Purchase.aggregate([
    { $group: { _id: "$prodId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "prodId",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        count: 1,
        name: "$product.name",
        category: { $ifNull: ["$product.category", "Unknown"] },
      },
    },
  ])) as ProductPurchaseRow[];

  const purchaseCategories = (await Purchase.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "prodId",
        foreignField: "prodId",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        category: {
          $cond: [
            { $or: [{ $eq: ["$product.category", null] }, { $eq: ["$product.category", ""] }] },
            "Unknown",
            "$product.category",
          ],
        },
      },
    },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ])) as CategoryPurchaseRow[];

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
          <h3 className="font-semibold">Products by subcategory</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {subcategories.map((row) => (
              <li key={row._id} className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span>{row._id || "General"}</span>
                <span className="font-semibold">{row.count}</span>
              </li>
            ))}
            {subcategories.length === 0 && <li className="text-slate-500">No subcategory data.</li>}
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

        <div className="rounded-lg border border-slate-200 p-4">
          <h3 className="font-semibold">Most purchased products</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {topProducts.map((row) => (
              <li key={row._id} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2">
                <div className="min-w-0">
                  <p className="truncate">{row.name || row._id}</p>
                  <p className="text-xs text-slate-500">{row.category || "Unknown"}</p>
                </div>
                <span className="font-semibold">{row.count}</span>
              </li>
            ))}
            {topProducts.length === 0 && <li className="text-slate-500">No product purchase data.</li>}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <h3 className="font-semibold">Purchases by category</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {purchaseCategories.map((row) => (
              <li key={row._id} className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span>{row._id || "Unknown"}</span>
                <span className="font-semibold">{row.count}</span>
              </li>
            ))}
            {purchaseCategories.length === 0 && <li className="text-slate-500">No category purchase data.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
