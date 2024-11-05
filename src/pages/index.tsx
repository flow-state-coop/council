import { useState, useRef, useEffect, useCallback } from "react";
import { Address } from "viem";
import { useRouter } from "next/router";
import { useInView } from "react-intersection-observer";
import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Spinner from "react-bootstrap/Spinner";
import Dropdown from "react-bootstrap/Dropdown";
import GranteeCard from "@/components/GranteeCard";
import RoundBanner from "@/components/RoundBanner";
import Ballot from "@/components/Ballot";
import GranteeApplication from "@/components/GranteeApplication";
import DistributionPoolFunding from "@/components/DistributionPoolFunding";
import { useMediaQuery } from "@/hooks/mediaQuery";
import { ProjectMetadata } from "@/types/projectMetadata";
import { Grantee, SortingMethod } from "@/types/grantee";
import useCouncil from "@/hooks/council";
import { networks } from "@/lib/networks";
import { shuffle, getPlaceholderImageSrc } from "@/lib/utils";
import { DEFAULT_CHAIN_ID } from "@/lib/constants";

const GRANTEES_BATCH_SIZE = 20;

export default function Index() {
  const [grantees, setGrantees] = useState<Grantee[]>([]);
  const [sortingMethod, setSortingMethod] = useState(SortingMethod.RANDOM);
  const [showGranteeApplication, setShowGranteeApplication] = useState(false);
  const [showDistributionPoolFunding, setShowDistributionPoolFunding] =
    useState(false);

  const skipGrantees = useRef(0);
  const granteesBatch = useRef(1);
  const hasNextGrantee = useRef(true);

  const router = useRouter();
  const { chainId } = router.query;
  const network =
    networks.find(
      (network) => network.id === Number(chainId ?? DEFAULT_CHAIN_ID),
    ) ?? networks[0];
  useMediaQuery();
  const { isMobile, isTablet, isSmallScreen, isMediumScreen, isBigScreen } =
    useMediaQuery();
  const [sentryRef, inView] = useInView();
  const { newAllocation, council, flowStateProfiles, gdaPool } = useCouncil();

  const getGrantee = useCallback(
    (recipient: { id: string; address: string; metadata: ProjectMetadata }) => {
      const adjustedFlowRate =
        BigInt(gdaPool?.flowRate ?? 0) -
        BigInt(gdaPool?.adjustmentFlowRate ?? 0);
      const member = gdaPool?.poolMembers.find(
        (member: { account: { id: string } }) =>
          member.account.id === recipient.address,
      );
      const memberUnits = member?.units ?? 0;
      const memberFlowRate =
        BigInt(gdaPool?.totalUnits ?? 0) > 0
          ? (BigInt(memberUnits) * adjustedFlowRate) /
            BigInt(gdaPool?.totalUnits ?? 0)
          : BigInt(0);

      return {
        id: recipient.id,
        address: recipient.address,
        metadata: recipient.metadata,
        bannerCid: recipient.metadata.bannerImg,
        twitter: recipient.metadata.projectTwitter,
        flowRate: memberFlowRate ?? BigInt(0),
        units: memberUnits,
        placeholderLogo: getPlaceholderImageSrc(),
        placeholderBanner: getPlaceholderImageSrc(),
      };
    },
    [gdaPool],
  );

  const sortGrantees = useCallback(
    (grantees: Grantee[]) => {
      if (sortingMethod === SortingMethod.RANDOM) {
        return shuffle(grantees);
      }

      if (sortingMethod === SortingMethod.ALPHABETICAL) {
        return grantees.sort((a, b) => {
          if (a.metadata.title < b.metadata.title) {
            return -1;
          }

          if (a.metadata.title > b.metadata.title) {
            return 1;
          }

          return 0;
        });
      }

      if (sortingMethod === SortingMethod.POPULAR) {
        return grantees.sort((a, b) => b.units - a.units);
      }

      return grantees;
    },
    [sortingMethod],
  );

  useEffect(() => {
    if (!council || !flowStateProfiles || !gdaPool) {
      return;
    }

    const hasNewGranteeBeenAdded =
      !hasNextGrantee.current &&
      skipGrantees.current === council.grantees.length;

    if (hasNewGranteeBeenAdded) {
      hasNextGrantee.current = true;
      skipGrantees.current = 0;
      granteesBatch.current = 1;
    }

    if (inView && hasNextGrantee.current) {
      const grantees: Grantee[] = [];

      for (
        let i = skipGrantees.current;
        i < GRANTEES_BATCH_SIZE * granteesBatch.current;
        i++
      ) {
        skipGrantees.current = i + 1;

        if (skipGrantees.current === council.grantees.length) {
          hasNextGrantee.current = false;
        }

        const councilGrantee = council.grantees[i];
        const profile = flowStateProfiles.find(
          (profile: { id: string }) => profile.id === councilGrantee?.name,
        );

        if (profile && councilGrantee) {
          grantees.push(
            getGrantee({
              id: profile.id,
              address: councilGrantee.account,
              metadata: profile.metadata,
            }),
          );
        } else {
          break;
        }
      }

      if (grantees.length >= GRANTEES_BATCH_SIZE) {
        granteesBatch.current++;
      }

      setGrantees((prev) =>
        hasNewGranteeBeenAdded
          ? sortGrantees(grantees)
          : sortingMethod !== SortingMethod.RANDOM ||
              granteesBatch.current === 1
            ? sortGrantees(prev.concat(grantees))
            : prev.concat(grantees),
      );
    } else {
      setGrantees((prev) => {
        const grantees: Grantee[] = [];

        for (const i in prev) {
          grantees[i] = getGrantee({
            id: prev[i].id,
            address: prev[i].address,
            metadata: prev[i].metadata,
          });
        }

        return grantees;
      });
    }
  }, [
    council,
    flowStateProfiles,
    gdaPool,
    inView,
    getGrantee,
    sortingMethod,
    sortGrantees,
  ]);

  useEffect(() => {
    setGrantees((prev) => sortGrantees(prev));
  }, [sortingMethod, sortGrantees]);

  return (
    <>
      <Container
        className="mx-auto mb-5 p-0"
        style={{
          maxWidth:
            isMobile || isTablet
              ? "100%"
              : isSmallScreen
                ? 1000
                : isMediumScreen
                  ? 1300
                  : 1600,
        }}
      >
        <RoundBanner
          name={council?.councilName ?? ""}
          description="Flow Council"
          distributionTokenInfo={network.tokens[0]}
          gdaPool={gdaPool}
          showGranteeApplication={() => setShowGranteeApplication(true)}
          showDistributionPoolFunding={() =>
            setShowDistributionPoolFunding(true)
          }
        />
        <Stack
          direction="horizontal"
          gap={4}
          className="px-4 pt-5 pb-4 pt-4 fs-4"
        >
          Grantees
          <Dropdown>
            <Dropdown.Toggle
              variant="transparent"
              className="d-flex justify-content-between align-items-center border border-2 border-gray"
              style={{ width: 156 }}
            >
              {sortingMethod}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item
                onClick={() => setSortingMethod(SortingMethod.RANDOM)}
              >
                {SortingMethod.RANDOM}
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => setSortingMethod(SortingMethod.ALPHABETICAL)}
              >
                {SortingMethod.ALPHABETICAL}
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => setSortingMethod(SortingMethod.POPULAR)}
              >
                {SortingMethod.POPULAR}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Stack>
        <Stack direction="vertical" className="flex-grow-0">
          <div
            className="px-4 pb-5"
            style={{
              display: "grid",
              columnGap: "1.5rem",
              rowGap: "3rem",
              gridTemplateColumns: isTablet
                ? "repeat(2,minmax(0,1fr))"
                : isSmallScreen
                  ? "repeat(3,minmax(0,1fr))"
                  : isMediumScreen || isBigScreen
                    ? "repeat(4,minmax(0,1fr))"
                    : "",
            }}
          >
            {grantees.map((grantee: Grantee) => (
              <GranteeCard
                key={`${grantee.address}-${grantee.id}`}
                id={grantee.id}
                granteeAddress={grantee.address}
                name={grantee.metadata.title}
                description={grantee.metadata.description}
                logoCid={grantee.metadata.logoImg}
                bannerCid={grantee.bannerCid}
                placeholderLogo={grantee.placeholderLogo}
                placeholderBanner={grantee.placeholderBanner}
                flowRate={grantee.flowRate}
                units={grantee.units}
                network={network}
                isSelected={false}
              />
            ))}
          </div>
          {hasNextGrantee.current === true && (
            <Stack
              direction="horizontal"
              className="justify-content-center m-auto"
            >
              <Spinner ref={sentryRef}></Spinner>
            </Stack>
          )}
        </Stack>
      </Container>
      {showDistributionPoolFunding ? (
        <DistributionPoolFunding
          network={network}
          hide={() => setShowDistributionPoolFunding(false)}
        />
      ) : showGranteeApplication ? (
        <GranteeApplication
          network={network}
          gdaPoolAddress={council?.pool as Address}
          hide={() => setShowGranteeApplication(false)}
        />
      ) : newAllocation?.showBallot ? (
        <Ballot councilAddress={network.councilAddress} />
      ) : null}
    </>
  );
}
