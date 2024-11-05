import { useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import { Address } from "viem";
import { useAccount } from "wagmi";
import Stack from "react-bootstrap/Stack";
import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
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
  FAIL = "Transaction failed",
}

export default function GranteeApplication(props: GranteeApplication) {
  const { network, gdaPoolAddress, hide } = props;

  const [selectedProject, setSelectedProject] = useState<Project>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        <p>1. Earn the Builder role in the /onchain Guild</p>
        <Stack direction="horizontal" gap={3}>
          <Button
            variant="link"
            href="https://guild.xyz/test-3533c0"
            target="_blank"
            className="w-50 bg-secondary text-light"
          >
            Visit Guild
          </Button>
          <Button
            variant={hasGuildRole ? "success" : "primary"}
            className="w-50 py-1"
            onClick={checkGuildMembership}
            style={{
              pointerEvents: hasGuildRole || isCheckingGuild ? "none" : "auto",
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
                <Image src="reload.svg" alt="refresh" width={28} height={28} />
                Role not found
              </Stack>
            )}
          </Button>
        </Stack>
        {!hasGuildRole && !isCheckingGuild && (
          <p className="m-0 mt-1 me-1 float-end small">
            Visit guild and try again
          </p>
        )}
        <p className="mt-5">
          2. Submit your builder profile info to join the round
        </p>
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
          className="align-items-stretch mt-3"
        >
          <Button
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
          {isGrantee ? (
            <Button
              variant="success"
              className="w-50 py-1"
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
              className="w-50 py-1"
              onClick={handleGranteeApplicationRequest}
            >
              {isLoading ? <Spinner size="sm" /> : "Submit"}
            </Button>
          )}
        </Stack>
        {error && (
          <Alert variant="danger" className="text-danger mb-0 mt-3 p-2">
            {error}
          </Alert>
        )}
        {success && <p className="m-0 mt-1 me-1 small float-end">{success}</p>}
        <p className="mt-5">
          3. Complete a one-time transaction to see ONCHAINx flow to your wallet
          in real-time
        </p>
        <Button
          disabled={isConnectedToPool}
          className="w-100 bg-secondary text-light"
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
        <p className="mt-5">
          4. Post project updates in /onchain & join the next demo day
        </p>
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
      </Offcanvas.Body>
    </Offcanvas>
  );
}
