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
import useFlowStateProjectsQuery from "@/hooks/flowStateProjectsQuery";

type Project = { id: string; metadata: ProjectMetadata };

type GranteeApplication = {
  network: Network;
  hide: () => void;
};

enum ApplicationError {
  FAIL = "Transaction failed",
}

export default function GranteeApplication(props: GranteeApplication) {
  const { network, hide } = props;

  const [selectedProject, setSelectedProject] = useState<Project>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { council } = useCouncil();
  const { address } = useAccount();
  const { hasGuildRole, isCheckingGuild, checkGuildMembership } = useGuildCheck(
    address as Address,
  );
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
      <Offcanvas.Header closeButton className="pb-0">
        <Offcanvas.Title className="fs-3">
          Welcome {council?.councilName ?? ""} Builder
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <p className="text-info fs-4">
          Text explaining the eligibility criteria and the general setup for the
          Guildathon.
        </p>
        <p className="mt-4">
          1. Earn the Builder role in the {council?.councilSymbol ?? ""} Guild
        </p>
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
            {hasGuildRole ? (
              <Image
                src="success.svg"
                alt="Success"
                width={28}
                height={28}
                style={{
                  filter:
                    "invert(35%) sepia(96%) saturate(1004%) hue-rotate(132deg) brightness(96%) contrast(88%)",
                }}
              />
            ) : isCheckingGuild ? (
              <Spinner size="sm" />
            ) : (
              "Check Role"
            )}
          </Button>
        </Stack>
        <p className="mt-5">2. Submit your builder information</p>
        <Dropdown>
          <Dropdown.Toggle
            variant="transparent"
            disabled={isGrantee || !projects || projects.length === 0}
            className={`d-flex justify-content-between align-items-center w-100 border border-2 ${selectedProject ? "" : "text-info"}`}
          >
            {selectedProject?.metadata?.title ?? "Select your project"}
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
                    "invert(35%) sepia(96%) saturate(1004%) hue-rotate(132deg) brightness(96%) contrast(88%)",
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
        <p className="mt-5">
          3. Post project updates in {council?.councilSymbol ?? ""} & join the
          next demo day.
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
            href="https://guild.xyz/test-3533c0"
            target="_blank"
            className="w-50 bg-primary text-light"
          >
            {council?.councilSymbol ?? "N/A"}
          </Button>
        </Stack>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
