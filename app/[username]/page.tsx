import MainLayout from "@/layouts/main-layout";
import UserProfile from "@/templates/auth/profile";

export default function Home() {
  return (
    <MainLayout>
      <UserProfile />
    </MainLayout>
  );
}
