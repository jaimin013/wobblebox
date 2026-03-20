import DashboardContents from "@/components/DashboardContents";
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function Dashboard() {
  const { userId } = await auth();
  const user = await currentUser();

  const userName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    "there";

  return (
    <div>
      <DashboardContents userId={userId ?? ""} userName={userName} />
    </div>
  );
}
