import { AuctionContract } from '../../../contractAddress';
import auctionABI from '../../../artifacts/contracts/Auction.sol/Auction.json';
import { useContractRead } from 'wagmi';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ethers } from 'ethers';
import moment from 'moment';
import { useRouter } from 'next/router';

const auctionContractConfig = {
  address: AuctionContract,
  abi: auctionABI.abi,
};

type AuctionItem = {
  auctionId: string;
  nftTokenId: number;
  highestBid: number;
  buyNowPrice: number;
  endAt: number;
  isSold: boolean;
  isCanceled: boolean;
  isEnded: boolean;
};

const Auctions = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setCurrentTime(Date.now());
  }, []);

  const [auctionList, setAuctionList] = useState<AuctionItem[]>([]);
  const [currentTime, setCurrentTime] = useState<number>();
  const router = useRouter();

  const { data: currentAuctionIdData } = useContractRead({
    ...auctionContractConfig,
    functionName: 'getCurrentAuctionId',
    watch: true,
  });

  const { data: auctionListData } = useContractRead({
    address: AuctionContract,
    abi: [
      {
        inputs: [],
        name: 'getAuctionList',
        outputs: [
          {
            components: [
              {
                internalType: 'uint256',
                name: 'id',
                type: 'uint256',
              },
              {
                internalType: 'address payable',
                name: 'seller',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'nftTokenId',
                type: 'uint256',
              },
              {
                internalType: 'address',
                name: 'highestBidder',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'highestBid',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'startPrice',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'buyNowPrice',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'startedAt',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'endAt',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'isSold',
                type: 'bool',
              },
              {
                internalType: 'bool',
                name: 'isEnded',
                type: 'bool',
              },
              {
                internalType: 'bool',
                name: 'isCanceled',
                type: 'bool',
              },
            ],
            internalType: 'struct Auction.AuctionItem[]',
            name: '',
            type: 'tuple[]',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'getAuctionList',
    watch: false,
    enabled: !!currentAuctionIdData && currentAuctionIdData > 0,
    onSuccess: (data) => {
      if (auctionListData) {
        auctionListData.map((auctionItem) => {
          if (
            auctionList.find(
              (auction) => auction.auctionId === auctionItem.id.toString()
            )
          )
            return;
          const auctionItemData = {
            auctionId: auctionItem.id.toString(),
            nftTokenId: Number(auctionItem.nftTokenId.toString()),
            highestBid: Number(auctionItem.highestBid.toString()),
            buyNowPrice: Number(auctionItem.buyNowPrice.toString()),
            endAt: Number(auctionItem.endAt.toString()),
            isSold: auctionItem.isSold,
            isCanceled: auctionItem.isCanceled,
            isEnded: auctionItem.isEnded,
          };
          setAuctionList((prev) => [...prev, auctionItemData]);
        });
      }
    },
  });

  const handleAuctionSelect = (id: string) => {
    router.push(`/auctions/${id}`);
  };

  return (
    <>
      {mounted && (
        <div className="flex flex-col items-center justify-center">
          <div className="grid grid-cols-1 place-items-center gap-4 md:grid-cols-3">
            {auctionList.length > 0 &&
              auctionList.map((auction, index) => {
                return (
                  <div
                    onClick={() => handleAuctionSelect(auction.auctionId)}
                    key={index}
                    className="flex w-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-neutral bg-highlight p-3 backdrop-blur-lg transition-transform hover:scale-105"
                  >
                    <h2 className="mb-2 text-xl font-semibold text-white">
                      Patika Bears #{auction.nftTokenId}
                    </h2>
                    <Image
                      width={150}
                      height={150}
                      className="rounded-xl"
                      src={`/images/${auction.nftTokenId}.png`}
                    />
                    <p className="mt-2 text-lg text-neutral">
                      Highest Bid{' '}
                      {ethers.utils.formatEther(auction.highestBid.toString())}{' '}
                      ETH
                    </p>
                    <p className="text-lg text-neutral">
                      Buy Now{' '}
                      {ethers.utils.formatEther(auction.buyNowPrice.toString())}{' '}
                      ETH
                    </p>
                    {auction.isEnded ? (
                      <p className="mt-3 text-lg text-neutral">Ended</p>
                    ) : (
                      <>
                        <p className="mt-3 text-lg text-neutral">
                          Ends{' '}
                          {moment
                            .duration(
                              moment(auction.endAt, 'X').diff(currentTime)
                            )
                            .humanize(true)}
                        </p>
                        <button
                          className="mt-1 w-full rounded-lg bg-complementary py-1 text-lg font-bold text-neutral"
                          type="button"
                        >
                          BID
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </>
  );
};

export default Auctions;