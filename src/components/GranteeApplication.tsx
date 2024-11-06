import { useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Address } from "viem";
import { useAccount } from "wagmi";
import Stack from "react-bootstrap/Stack";
import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Dropdown from "react-bootstrap/Dropdown";
import { Network } from "@/types/network";
import { ProjectMetadata } from "@/types/projectMetadata";
import useCouncil from "@/hooks/council";
import useGuildCheck from "@/hooks/guildCheck";
import useGdaPoolConnection from "@/hooks/gdaPoolConnection";
import useFlowStateProjectsQuery from "@/hooks/flowStateProjectsQuery";

type Project = { id: string; metadata: ProjectMetadata };

type GranteeApplication = {
  network: Network;
  gdaPoolAddress: Address;
  hide: () => void;
};

enum ApplicationError {
  FAIL = "Error: please try again",
}

export default function GranteeApplication(props: GranteeApplication) {
  const { network, gdaPoolAddress, hide } = props;

  const [selectedProject, setSelectedProject] = useState<Project>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { openConnectModal } = useConnectModal();
  const { council } = useCouncil();
  const { address } = useAccount();
  const { hasGuildRole, isCheckingGuild, checkGuildMembership } = useGuildCheck(
    address as Address,
  );
  const { isConnectedToPool, isConnectingToPool, connectToPool } =
    useGdaPoolConnection({
      address: address as Address,
      gdaPoolAddress,
      gdaForwarderAddress: network.gdaForwarder,
    });
  const projects = useFlowStateProjectsQuery(network, address ?? "");
  const grantee = council?.grantees.find(
    (grantee) => grantee.account === address?.toLowerCase(),
  );
  const isGrantee = !!grantee;

  const handleGranteeApplicationRequest = async () => {
    try {
      setIsLoading(true);
      setError("");

      const res = await fetch("/api/grantee-application", {
        method: "POST",
        body: JSON.stringify({
          address,
          profileId: selectedProject?.id,
          chainId: network?.id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      if (!data.success) {
        setError(ApplicationError.FAIL);
      }

      if (data.success) {
        setSuccess("Success! You're in.");
      }

      setIsLoading(false);

      console.info(data);
    } catch (err) {
      setIsLoading(false);
      setError(ApplicationError.FAIL);

      console.error(err);
    }
  };

  return (
    <Offcanvas show onHide={hide} placement="end">
      <Offcanvas.Header closeButton className="pb-0 align-items-start">
        <Stack direction="vertical">
          <Offcanvas.Title className="fs-4">
            Welcome {council?.councilName ?? ""} Builder
          </Offcanvas.Title>
          <p className="text-info fs-6">
            Text explaining the eligibility criteria and the general setup for
            the Guildathon.
          </p>
        </Stack>
      </Offcanvas.Header>
      <Offcanvas.Body className="flex-grow-0 bg-light rounded-4 mx-3 mt-2 py-4">
        <Stack direction="vertical" gap={5}>
          <Stack direction="vertical" className="h-25">
            <p>1. Earn the Builder role in the /onchain Guild</p>
            <Stack direction="horizontal" gap={3} className="align-items-start">
              <Button
                variant="link"
                href="https://guild.xyz/test-3533c0"
                target="_blank"
                className="w-50 bg-secondary text-light"
              >
                Visit Guild
              </Button>
              <Stack direction="vertical" gap={1} className="w-50">
                <Button
                  variant={hasGuildRole ? "success" : "primary"}
                  className={`w-100 ${hasGuildRole ? "py-1" : ""}`}
                  onClick={address ? checkGuildMembership : openConnectModal}
                  style={{
                    pointerEvents:
                      hasGuildRole || isCheckingGuild ? "none" : "auto",
                  }}
                >
                  {isCheckingGuild ? (
                    <Spinner size="sm" />
                  ) : hasGuildRole ? (
                    <Image
                      src="success.svg"
                      alt="Success"
                      width={28}
                      height={28}
                      style={{
                        filter:
                          "brightness(0) saturate(100%) invert(85%) sepia(8%) saturate(138%) hue-rotate(138deg) brightness(93%) contrast(106%)",
                      }}
                    />
                  ) : (
                    <Stack direction="horizontal" gap={1} className="small">
                      <Image
                        src="reload.svg"
                        alt="refresh"
                        width={24}
                        height={24}
                      />
                      Role not found
                    </Stack>
                  )}
                </Button>
                {!hasGuildRole && !isCheckingGuild && (
                  <p className="m-0 small text-center" style={{}}>
                    Visit Guild and try again
                  </p>
                )}
              </Stack>
            </Stack>
          </Stack>
          <Stack direction="vertical" className="h-25">
            <p>2. Submit your builder profile to join the round</p>
            <Dropdown>
              <Dropdown.Toggle
                variant="transparent"
                disabled={isGrantee || !projects || projects.length === 0}
                className={`d-flex justify-content-between align-items-center w-100 border border-2 ${selectedProject ? "" : "text-info"}`}
              >
                {selectedProject?.metadata?.title ??
                  projects?.find(
                    (project: { id: string }) => project.id === grantee?.name,
                  )?.metadata.title ??
                  "Select your project"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {projects &&
                  projects.map((project: Project, i: number) => {
                    return (
                      <Dropdown.Item
                        key={i}
                        onClick={() => setSelectedProject(project)}
                      >
                        {project.metadata.title}
                      </Dropdown.Item>
                    );
                  })}
              </Dropdown.Menu>
            </Dropdown>
            <Stack
              direction="horizontal"
              gap={3}
              className="align-items-start mt-3"
            >
              <Button
                onClick={(e) => {
                  if (!address && openConnectModal) {
                    e.preventDefault();
                    openConnectModal();
                  }
                }}
                variant="link"
                href={
                  isGrantee || selectedProject
                    ? `https://flowstate.network/projects/${selectedProject ? selectedProject.id : grantee?.name}/?chainId=${network.id}&edit=true`
                    : `https://flowstate.network/projects/?owner=${address}&chainId=${network.id}&new=true`
                }
                target="_blank"
                className="w-50 bg-secondary text-light"
              >
                {isGrantee || selectedProject ? "Edit Profile" : "Create New"}
              </Button>
              <Stack direction="vertical" gap={1} className="w-50">
                {isGrantee || success ? (
                  <Button
                    variant="success"
                    className="w-100 py-1"
                    style={{ pointerEvents: "none" }}
                  >
                    <Image
                      src="success.svg"
                      alt="Success"
                      width={28}
                      height={28}
                      style={{
                        filter:
                          "brightness(0) saturate(100%) invert(85%) sepia(8%) saturate(138%) hue-rotate(138deg) brightness(93%) contrast(106%)",
                      }}
                    />
                  </Button>
                ) : (
                  <Button
                    disabled={!hasGuildRole || !selectedProject}
                    className="w-100"
                    onClick={handleGranteeApplicationRequest}
                  >
                    {isLoading ? <Spinner size="sm" /> : "Submit"}
                  </Button>
                )}
                {error ? (
                  <p className="m-0 small text-center">
                    {ApplicationError.FAIL}
                  </p>
                ) : success ? (
                  <p className="m-0 small text-center">{success}</p>
                ) : null}
              </Stack>
            </Stack>
          </Stack>
          <Stack direction="vertical" className="h-25">
            <p>
              3. Complete a one-time transaction to see ONCHAINx flow to your
              wallet in real-time
            </p>
            <Button
              variant="secondary"
              disabled={(!isGrantee && !success) || isConnectedToPool}
              className="w-100 text-light"
              onClick={connectToPool}
            >
              {isConnectingToPool ? (
                <Spinner size="sm" />
              ) : isConnectedToPool ? (
                "Connected"
              ) : (
                "Connect"
              )}
            </Button>
          </Stack>
          <Stack direction="vertical" className="h-25">
            <p>4. Post project updates in /onchain & join the next demo day</p>
            <Stack direction="horizontal" gap={3}>
              <Button
                variant="link"
                href="https://guild.xyz/test-3533c0"
                target="_blank"
                className="w-50 bg-secondary text-light"
              >
                Demo Day
              </Button>
              <Button
                variant="link"
                href="https://warpcast.com/~/channel/onchain"
                target="_blank"
                className="w-50 bg-primary text-light"
              >
                /onchain
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
