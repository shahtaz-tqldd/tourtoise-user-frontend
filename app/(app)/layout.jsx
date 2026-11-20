import AppLayout from "@/layouts/app-layout";

/** App shell (header + bottom nav) shared by public and member pages. */
export default function Layout({ children }) {
  return <AppLayout>{children}</AppLayout>;
}
