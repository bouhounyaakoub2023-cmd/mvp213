import "./globals.css";

export const metadata = {
  title: "Industrial Command Center",
  description: "Operational intelligence dashboard for industrial management.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
