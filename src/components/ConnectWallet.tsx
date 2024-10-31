import { ConnectButton } from "@rainbow-me/rainbowkit";
import Button from "react-bootstrap/Button";
import Image from "next/image";

export default function ConnectWallet() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openChainModal,
        openConnectModal,
        openAccountModal,
        mounted,
      }) => {
        const connected = mounted && account && chain;

        return (
          <div
            {...(!mounted && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    className="rounded-3 text-light shadow"
                  >
                    Connect Wallet
                  </Button>
                );
              }
              if (chain.unsupported) {
                return (
                  <Button
                    variant="danger"
                    onClick={openChainModal}
                    className="text-light shadow"
                  >
                    Wrong network
                  </Button>
                );
              }

              return (
                <div style={{ display: "flex", gap: 12 }}>
                  <Button
                    variant="transparent"
                    onClick={openChainModal}
                    className="d-flex align-items-center gap-1 border rounded-3 shadow"
                  >
                    {chain.iconUrl && (
                      <Image
                        alt={chain.name ?? "Chain icon"}
                        src={chain.iconUrl}
                        width={20}
                        height={20}
                      />
                    )}
                  </Button>
                  <Button
                    variant="transparent"
                    className="d-flex align-items-center gap-1 border rounded-3 shadow"
                    onClick={openAccountModal}
                  >
                    <Image
                      src="/wallet.svg"
                      alt="wallet"
                      width={18}
                      height={18}
                    />
                    {account.displayBalance ? account.displayBalance : ""}
                  </Button>
                  <Button
                    variant="transparent"
                    className="d-flex align-items-center gap-1 border rounded-3 shadow"
                    onClick={openAccountModal}
                  >
                    <Image
                      src="/account-circle.svg"
                      alt="account"
                      width={18}
                      height={18}
                    />
                    {account.displayName ? account.displayName : ""}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
