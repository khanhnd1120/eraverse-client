import { Tooltip } from "antd";
import _ from "lodash";
import { useEffect, useState } from "react";
import { AirdropClaimStatus, RewardType } from "share/game-interface";
import myState from "share/my-state";
import CustomButton from "ui/component/custom-button";

export default function ClaimAirdropPanel() {
  const [claimAirdropNoti, setClaimAirdropNoti] = useState<{
    airdropClaimStatus: AirdropClaimStatus;
    airdropClaimed: any;
  }>(null);

  function close() {
    setClaimAirdropNoti({
      ..._.cloneDeep(claimAirdropNoti),
      airdropClaimStatus: AirdropClaimStatus.None,
    });
    document.body.requestPointerLock();
  }
  useEffect(() => {
    if (
      claimAirdropNoti &&
      [AirdropClaimStatus.Failed, AirdropClaimStatus.Success].includes(
        claimAirdropNoti.airdropClaimStatus
      )
    ) {
      document.exitPointerLock();
    }
  }, [claimAirdropNoti]);
  useEffect(() => {
    const airdropNoti = myState.claimAirdropNoti$.subscribe((v) => {
      setClaimAirdropNoti(v);
    });
    return () => {
      airdropNoti.unsubscribe();
    };
  }, []);
  if (
    !(
      claimAirdropNoti &&
      [
        AirdropClaimStatus.Failed,
        AirdropClaimStatus.Success,
        AirdropClaimStatus.Process,
      ].includes(claimAirdropNoti.airdropClaimStatus)
    )
  ) {
    return <div></div>;
  }
  return (
    <div className="bg-black bg-opacity-60 w-full h-full absolute flex item-center align-middle z-[10000]">
      <div className="w-1/2 min-h-[300px] max-w-[500px] m-auto">
        <div className="bg-black p-2">Claim Airdrop</div>

        <div className="h-full w-full bg-gray-500 bg-opacity-50 text-center pt-9 pb-10">
          {claimAirdropNoti.airdropClaimStatus ===
            AirdropClaimStatus.Success && (
            <div>
              <div className="text-4xl">CLAIM YOUR REWARD</div>
              <div className="text-xs mt-2">
                Your reward will be sent shortly. Please stay tuned!
              </div>
              <div className="flex items-center justify-center gap-3 mt-5">
                {claimAirdropNoti.airdropClaimed.rewards.map((reward: any) => {
                  return (
                    <div>
                      {reward?.rewardType === RewardType.APT && (
                        <img
                          src="ui/icon/iconApt.png"
                          alt="icon"
                          className="w-[60px] h-[60px]"
                        />
                      )}
                      {reward?.rewardType === RewardType.EGON && (
                        <img
                          src="ui/icon/ERA3_Logo.png"
                          alt="icon"
                          className="w-[60px] h-[60px]"
                        />
                      )}
                      {reward?.rewardType === RewardType.PEGON && (
                        <img
                          src="ui/icon/pegon.svg"
                          alt="icon"
                          className="w-[60px] h-[60px]"
                        />
                      )}
                      {[RewardType.EGON, RewardType.APT, RewardType.PEGON].includes(
                        reward?.rewardType
                      ) && (
                        <div className="text-4xl">
                          {Math.floor(reward?.amount * 1000000) / 1000000}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-5">
                {claimAirdropNoti.airdropClaimed.rewards.map((reward: any) => {
                  return (
                    <div>
                      {reward?.rewardType === RewardType.GIFT_CODE && (
                        <div className="flex gap-2 items-center justify-center">
                          <div> {`${reward?.content} ${reward?.giftCode}`}</div>
                          <Tooltip title="Copied" trigger={"click"}>
                            <img
                              src="ui/icon/copy.png"
                              alt="icon"
                              className="cursor-pointer"
                              onClick={() => {
                                navigator.clipboard.writeText(reward?.giftCode);
                              }}
                            />
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <CustomButton onClick={close} className="w-[100px] m-auto mt-5">
                <div className="bg-[#f17d00] text-3xl text-center flex justify-center items-center py-1">
                  CLAIM
                </div>
              </CustomButton>
            </div>
          )}
          {claimAirdropNoti.airdropClaimStatus ===
            AirdropClaimStatus.Process && (
            <div className=" justify-center gap-2 mt-16">
              <div className="text-4xl">OPENING BOX</div>
              <div className="dots mt-8">
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          )}
          {claimAirdropNoti.airdropClaimStatus ===
            AirdropClaimStatus.Failed && (
            <div className=" justify-center gap-2 mt-10">
              <div className="text-4xl">Oops!</div>
              <div className="text-xs mt-2">
                Missed it! The reward has already been claimed by another
                player.
              </div>
              <CustomButton onClick={close} className="w-[100px] m-auto mt-12">
                <div className="bg-[#f17d00] text-3xl text-center flex justify-center items-center py-1">
                  CLOSE
                </div>
              </CustomButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
