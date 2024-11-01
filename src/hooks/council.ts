import {
  useCouncilContext,
  useAllocationDispatchContext,
} from "@/context/Council";

export default function useCouncil() {
  const {
    council,
    flowStateProfiles,
    gdaPool,
    currentAllocation,
    newAllocation,
  } = useCouncilContext();
  const dispatchNewAllocation = useAllocationDispatchContext();

  return {
    council,
    flowStateProfiles,
    gdaPool,
    currentAllocation,
    newAllocation,
    dispatchNewAllocation,
  };
}
