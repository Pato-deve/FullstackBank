// app/homebanking/layout.tsx
import Header from "@/components/header";
import Footer from "@/components/footer";

export const metadata = {
  title: "FullstackBank",
  description: "Your banking solution",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
