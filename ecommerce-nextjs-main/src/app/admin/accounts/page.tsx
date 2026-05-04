import { connectMongoDB } from "@/libs/MongoConnect";
import User from "@/libs/models/User";

type AccountRow = {
  _id: string;
  name?: string;
  email: string;
  createdAt: string;
};

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  await connectMongoDB();
  const users = (await User.find({}, { name: 1, email: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .lean()) as unknown as AccountRow[];

  return (
    <div className="bg-white h-[calc(100vh-96px)] rounded-lg p-4 overflow-auto">
      <h2 className="text-3xl">Accounts</h2>
      <p className="text-sm text-slate-500 mt-1">Registered storefront users.</p>
      <div className="mt-4 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-t border-[#ececec]">
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Email</th>
              <th className="text-left py-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t border-[#f1f1f1]">
                <td className="py-2">{user.name || "—"}</td>
                <td className="py-2">{user.email}</td>
                <td className="py-2">
                  {new Date(user.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td className="py-4 text-slate-500" colSpan={3}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
