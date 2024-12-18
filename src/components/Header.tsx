import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import ConnectWallet from "@/components/ConnectWallet";
import CreateCoinbaseWallet from "@/components/CreateCoinbaseWallet";
import CouncilMemberWallet from "@/components/CouncilMemberWallet";
import Nav from "react-bootstrap/Nav";
import Stack from "react-bootstrap/Stack";
import Image from "react-bootstrap/Image";
import { CouncilMember } from "@/types/councilMember";
import { useMediaQuery } from "@/hooks/mediaQuery";
import useCouncil from "@/hooks/council";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { address } = useAccount();
  const { isMobile, isTablet, isSmallScreen, isMediumScreen } = useMediaQuery();
  const { council } = useCouncil();

  const isCouncilMember = !!council?.councilMembers?.find(
    (councilMember: CouncilMember) =>
      councilMember.account === address?.toLowerCase(),
  );

  return (
    <Nav
      className="position-sticky top-0 bg-light w-100 shadow"
      style={{ zIndex: 1 }}
    >
      <Stack
        direction="horizontal"
        className="justify-content-between mx-auto px-4"
        style={{
          minWidth:
            isMobile ||
            isTablet ||
            pathname?.startsWith("/admin") ||
            pathname?.startsWith("/grantee") ||
            pathname?.startsWith("/core") ||
            pathname?.startsWith("/terms") ||
            pathname?.startsWith("/privacy") ||
            pathname?.startsWith("/conduct")
              ? "100%"
              : isSmallScreen
                ? 1000
                : isMediumScreen
                  ? 1300
                  : 1600,
          maxWidth: 1600,
        }}
      >
        <Image
          src="/logo.png"
          alt="logo"
          width={80}
          height={80}
          className="cursor-pointer"
          onClick={() => router.push("/")}
        />
        <Stack direction="horizontal" gap={3}>
          {isCouncilMember ? <CouncilMemberWallet /> : <ConnectWallet />}
          {!address && !isMobile && <CreateCoinbaseWallet />}
        </Stack>
      </Stack>
    </Nav>
  );
}
