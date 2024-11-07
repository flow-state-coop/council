import { useState, useCallback, useEffect } from "react";
import { Address } from "viem";
import { createGuildClient } from "@guildxyz/sdk";

const GUILD_ID = 75081;
const ROLE_ID = 149679;

export default function useGuildCheck(address: Address) {
  const [hasGuildRole, setHasGuildRole] = useState(false);
  const [isGuildMember, setIsGuildMember] = useState(false);
  const [isCheckingGuild, setIsCheckingGuild] = useState(true);

  const checkGuildMembership = useCallback(async () => {
    if (!address) {
      setIsCheckingGuild(false);

      return;
    }

    setIsCheckingGuild(true);

    try {
      const guildClient = createGuildClient("SQF");
      const { user: userClient } = guildClient;

      const userMemberships = await userClient.getMemberships(address);
      const guildMembership = userMemberships?.find(
        (membership) => membership.guildId === GUILD_ID,
      );
      const hasRole =
        guildMembership && guildMembership.roleIds.includes(ROLE_ID)
          ? true
          : false;

      setIsGuildMember(!!guildMembership);
      setHasGuildRole(hasRole);
      setIsCheckingGuild(false);
    } catch (err) {
      if (err instanceof Error) {
        console.warn(`Guild: ${err.message}`);
      } else {
        console.error(err);
      }

      setIsCheckingGuild(false);
    }
  }, [address]);

  useEffect(() => {
    checkGuildMembership();
  }, [address, checkGuildMembership]);

  return { isGuildMember, hasGuildRole, isCheckingGuild, checkGuildMembership };
}
