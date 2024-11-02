import Offcanvas from "react-bootstrap/Offcanvas";
import { useAccount } from "wagmi";
import Stack from "react-bootstrap/Stack";
import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import FormControl from "react-bootstrap/FormControl";
import useCouncil from "@/hooks/council";
import useWriteAllocation from "@/hooks/writeAllocation";
import { isNumber } from "@/lib/utils";

const MAX_ALLOCATIONS_PER_MEMBER = 10;

export default function Ballot({
  councilAddress,
}: {
  councilAddress: `0x${string}`;
}) {
  const {
    council,
    currentAllocation,
    newAllocation,
    flowStateProfiles,
    dispatchNewAllocation,
  } = useCouncil();
  const { address } = useAccount();
  const { vote, isVoting, transactionError } =
    useWriteAllocation(councilAddress);

  const votingPower =
    council?.councilMembers.find(
      (councilMember) => councilMember.account === address?.toLowerCase(),
    )?.votingPower ?? 0;
  const totalVotes =
    newAllocation?.allocation
      ?.map((a) => a.amount)
      ?.reduce((a, b) => a + b, 0) ?? 0;
  const newAllocationsCount = newAllocation?.allocation?.length ?? 0;

  const handleAmountStepping = (args: {
    increment: boolean;
    granteeIndex: number;
  }) => {
    const { increment, granteeIndex } = args;

    const granteeAddress = newAllocation?.allocation[granteeIndex].grantee;
    const currentAmount = newAllocation?.allocation[granteeIndex].amount ?? 0;

    if (granteeAddress) {
      const newAmount = increment
        ? currentAmount + 10
        : currentAmount - 10 < 0
          ? 0
          : currentAmount - 10;

      dispatchNewAllocation({
        type: "update",
        allocation: { grantee: granteeAddress, amount: newAmount },
      });
    }
  };

  const handleAmountSelection = (
    e: React.ChangeEvent<HTMLInputElement>,
    granteeIndex: number,
  ) => {
    const { value } = e.target;

    const granteeAddress = newAllocation?.allocation[granteeIndex].grantee;

    if (isNumber(value) && granteeAddress) {
      dispatchNewAllocation({
        type: "update",
        allocation: { grantee: granteeAddress, amount: Number(value) },
      });
    } else if (value === "" && granteeAddress) {
      dispatchNewAllocation({
        type: "update",
        allocation: { grantee: granteeAddress, amount: 0 },
      });
    }
  };

  const handleVote = async () => {
    if (newAllocation && newAllocation?.allocation.length > 0) {
      const nonZeroAllocations = newAllocation.allocation.filter(
        (a) => a.amount !== 0,
      );
      const accounts = nonZeroAllocations.map((a) => a.grantee);
      const amounts = nonZeroAllocations.map((a) => BigInt(a.amount));

      await vote(accounts as `0x${string}`[], amounts);
    }
  };

  return (
    <Offcanvas
      show
      onHide={() => dispatchNewAllocation({ type: "hide-ballot" })}
      placement="end"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title className="fs-4">Allocate your votes</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Stack direction="horizontal" className="justify-content-between">
          <p
            className={`w-50 mb-3 fs-4 ${newAllocationsCount > MAX_ALLOCATIONS_PER_MEMBER ? "text-danger" : "text-info"}`}
          >
            ({newAllocation?.allocation?.length ?? 0}/
            {MAX_ALLOCATIONS_PER_MEMBER} Projects)
          </p>
          <p
            className={`w-50 mb-3 text-end fs-4 ${totalVotes > votingPower ? "text-danger" : ""}`}
          >
            ({totalVotes}/{votingPower} Votes)
          </p>
        </Stack>
        {newAllocation?.allocation?.map((allocation, i) => {
          const councilGrantee = council?.grantees.find(
            (grantee) => grantee.account === allocation.grantee,
          );
          const profile = flowStateProfiles?.find(
            (profile: { id: string }) => profile.id === councilGrantee?.name,
          );

          return (
            <Stack
              direction="horizontal"
              className="justify-content-between overflow-hidden mb-4"
              key={i}
            >
              <Stack direction="horizontal" className="w-50">
                <Button
                  variant="transparent"
                  className="p-1 ps-0"
                  onClick={() =>
                    dispatchNewAllocation({
                      type: "delete",
                      allocation,
                    })
                  }
                >
                  <Image
                    src="/close.svg"
                    alt="delete"
                    width={20}
                    height={20}
                    style={{
                      filter:
                        "invert(30%) sepia(64%) saturate(1597%) hue-rotate(324deg) brightness(93%) contrast(103%)",
                    }}
                  />
                </Button>
                <p className="m-0 text-truncate" style={{ fontSize: "1.2rem" }}>
                  {profile?.metadata.title}
                </p>
              </Stack>
              <Stack
                direction="horizontal"
                className="justify-content-end align-items-stretch w-50"
              >
                <Button
                  className="d-flex justify-content-center align-items-center bg-info border-black border-end-0 w-25 rounded-0 rounded-start-2 fs-4 px-1 py-2"
                  onClick={() =>
                    handleAmountStepping({ increment: false, granteeIndex: i })
                  }
                >
                  <Image
                    src="/remove.svg"
                    alt="remove"
                    width={18}
                    height={18}
                  />
                </Button>
                <FormControl
                  type="text"
                  value={allocation.amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleAmountSelection(e, i)
                  }
                  className="text-center w-33 bg-light border-black border-start-0 border-end-0 rounded-0 shadow-none"
                />
                <Button
                  variant="white"
                  className="d-flex justify-content-center align-items-center w-25 bg-info border-black border-start-0 rounded-0 rounded-end-3 fs-4 px-1 py-2"
                  onClick={() =>
                    handleAmountStepping({ increment: true, granteeIndex: i })
                  }
                >
                  <Image src="/add.svg" alt="add" width={18} height={18} />
                </Button>
              </Stack>
            </Stack>
          );
        })}
        <Stack direction="vertical">
          <Button
            disabled={
              totalVotes > votingPower ||
              newAllocationsCount > MAX_ALLOCATIONS_PER_MEMBER ||
              JSON.stringify(currentAllocation?.allocation) ===
                JSON.stringify(newAllocation?.allocation)
            }
            className="align-self-end w-50"
            onClick={handleVote}
          >
            {isVoting ? <Spinner size="sm" /> : "Vote"}
          </Button>
          {transactionError && (
            <Alert variant="danger" className="mt-3 p-2">
              {transactionError}
            </Alert>
          )}
        </Stack>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
