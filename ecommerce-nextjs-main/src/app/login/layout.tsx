import StoreAuthShell from "@/components/layout/StoreAuthShell";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <StoreAuthShell>{children}</StoreAuthShell>;
}
