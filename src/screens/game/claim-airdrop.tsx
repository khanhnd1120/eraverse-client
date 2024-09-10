import CustomButton from "ui/component/custom-button";

export default function ClaimAirdropPanel() {
  return (
    <div className="bg-black bg-opacity-60 w-full h-full absolute flex item-center align-middle z-[10000]">
      <div className="w-1/2 h-[300px] max-w-[500px] m-auto">
        <div className="bg-black p-2">Claim Airdrop</div>
        <div className="h-full w-full bg-gray-500 bg-opacity-50 text-center pt-9">
          {/* <div>
            <div className="text-4xl">CLAIM YOUR REWARD</div>
            <div className="text-xs mt-2">
              Your reward will be sent shortly. Please stay tuned!
            </div>
            <div className="flex items-center justify-center gap-3 mt-10">
              <div className="text-4xl">100</div>
              <img src="ui/icon/iconApt.png" alt="icon" className="w-[60px]" />
            </div>
            <CustomButton onClick={() => {}} className="w-[100px] m-auto mt-5">
              <div className="bg-[#f17d00] text-3xl text-center flex justify-center items-center py-1">
                CLAIM
              </div>
            </CustomButton>
          </div> */}
          <div className=" justify-center gap-2 mt-16">
            <div className="text-4xl">OPENING BOX</div>
            <div className="dots mt-8">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
