import Head from "next/head";
import Stack from "react-bootstrap/Stack";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>Flow State - Making Impact Common</title>
      </Head>
      <Stack direction="vertical" style={{ minHeight: "100vh" }}>
        <Header />
        <Stack direction="horizontal" className="flex-grow-1">
          <Stack direction="vertical">{children}</Stack>
        </Stack>
        <Footer />
      </Stack>
    </>
  );
}
