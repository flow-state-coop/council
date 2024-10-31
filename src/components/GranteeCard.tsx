import { useState, useEffect } from "react";
import { createVerifiedFetch } from "@helia/verified-fetch";
import { useClampText } from "use-clamp-text";
import Stack from "react-bootstrap/Stack";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import { roundWeiAmount } from "@/lib/utils";
import { Network } from "@/types/network";
import { IPFS_GATEWAYS, SECONDS_IN_MONTH } from "@/lib/constants";

type GranteeProps = {
  id: string;
  name: string;
  description: string;
  logoCid: string;
  bannerCid: string;
  placeholderLogo: string;
  placeholderBanner: string;
  flowRate: bigint;
  units: number;
  network: Network;
  isSelected: boolean;
};

export default function Grantee(props: GranteeProps) {
  const {
    id,
    name,
    description,
    logoCid,
    bannerCid,
    placeholderLogo,
    placeholderBanner,
    flowRate,
    units,
    network,
    isSelected,
  } = props;

  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  const [descriptionRef, { noClamp, clampedText }] = useClampText({
    text: description,
    ellipsis: "...",
    lines: 4,
  });
  const monthlyFlow = roundWeiAmount(flowRate * BigInt(SECONDS_IN_MONTH), 4);

  useEffect(() => {
    (async () => {
      const verifiedFetch = await createVerifiedFetch({
        gateways: IPFS_GATEWAYS,
      });

      if (logoCid) {
        try {
          const logoRes = await verifiedFetch(`ipfs://${logoCid}`);
          const logoBlob = await logoRes.blob();
          const logoUrl = URL.createObjectURL(logoBlob);

          setLogoUrl(logoUrl);
        } catch (err) {
          console.error(err);
        }
      }

      if (bannerCid) {
        try {
          const bannerRes = await verifiedFetch(`ipfs://${bannerCid}`);
          const bannerBlob = await bannerRes.blob();
          const bannerUrl = URL.createObjectURL(bannerBlob);

          setBannerUrl(bannerUrl);
        } catch (err) {
          console.error(err);
        }
      }
    })();
  }, [logoCid, bannerCid]);

  return (
    <Card
      className="rounded-4 overflow-hidden cursor-pointer"
      style={{
        height: 400,
        border: isSelected ? "1px solid #247789" : "1px solid #212529",
        boxShadow: isSelected ? "0px 0px 0px 2px #247789" : "",
      }}
      onClick={() => void 0}
    >
      <Card.Img
        variant="top"
        src={bannerUrl === "" ? placeholderBanner : bannerUrl}
        height={102}
        className="bg-light"
      />
      <Image
        src={logoUrl === "" ? placeholderLogo : logoUrl}
        alt=""
        width={52}
        height={52}
        className="rounded-3 position-absolute border border-2 border-light bg-white"
        style={{ bottom: 270, left: 16 }}
      />
      <Card.Body className="mt-3 pb-0">
        <Card.Text
          className="d-inline-block m-0 fs-5 word-wrap text-truncate"
          style={{ maxWidth: 256 }}
        >
          {name}
        </Card.Text>
        <Card.Text
          ref={descriptionRef as React.RefObject<HTMLParagraphElement>}
          className="m-0 mb-3"
          style={{ fontSize: "0.9rem", minHeight: noClamp ? "4lh" : "auto" }}
        >
          {clampedText}
        </Card.Text>
        <Stack direction="horizontal" className="me-2">
          <Stack direction="vertical" className="align-items-center w-33">
            <Card.Text as="small" className="m-0 fw-bold">
              Total Votes
            </Card.Text>
            <Card.Text as="small" className="m-0">
              {units}
            </Card.Text>
          </Stack>
          <Stack direction="vertical" className="align-items-center w-33">
            <Card.Text as="small" className="m-0 fw-bold">
              Current Stream
            </Card.Text>
            <Card.Text as="small" className="m-0">
              {monthlyFlow} {network.tokens[0].name} /mo
            </Card.Text>
          </Stack>
        </Stack>
      </Card.Body>
      <Card.Footer
        className="d-flex justify-content-between bg-light border-0 py-3"
        style={{ fontSize: "15px" }}
      >
        <Stack
          direction="horizontal"
          className="justify-content-end w-100 me-4"
        >
          <Button
            variant="link"
            href={`https://flowstate.network/projects/${id}/?chainId=${network.id}`}
            target="_blank"
            className="d-flex justify-content-center bg-primary w-33 px-5 text-light"
          >
            <Image src="/open-new.svg" alt="Profile" width={22} height={22} />
          </Button>
        </Stack>
      </Card.Footer>
    </Card>
  );
}
