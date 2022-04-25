import Head from "next/head";
import Image from "next/image";
import { BigNumber, Contract, providers, utils } from "ethers";
import { useState, useEffect, useRef } from "react";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import {
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";

export default function Home() {
  const zero = BigNumber.from(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [tokenAmount, setTokenAmount] = useState(zero);
  const [loading, setLoading] = useState(false);
  const [tokenToBeClaimed, setTokenToBeClaimed] = useState(zero);
  // tokensMinted is the total number of tokens that have been minted till now out of 10000(max total supply)
  const [balanceOfCryptoDevTokens, setBalanceOfCryptoDevTokens] =
    useState(zero);
  const [tokensMinted, setTokensMinted] = useState(zero);

  const web3ModalRef = useRef();
  const getProviderOrSigner = async (needSigner = false) => {
    try {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);
      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 4) {
        window.alert("Change the network to Rinkeby");
        throw new Error("Change network to Rinkeby");
      }
      if (needSigner) {
        const signer = web3Provider.getSigner();
        return signer;
      }
      return web3Provider;
    } catch (error) {
      console.error(error);
    }
  };
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };
  const getTokenToBeClaimed = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const balance = await nftContract.balanceOf(address);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      if (balance === zero) {
        setTokenToBeClaimed(zero);
      } else {
        var amount = 0;
        for (var i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const claimed = await tokenContract.tokensIdsClaimed(tokenId);
          if (!claimed) {
            amount++;
          }
        }
        setTokenToBeClaimed(BigNumber.form(amount));
      }
    } catch (error) {
      console.error(error);
      setTokenToBeClaimed(zero);
    }
  };
  const getBalanceOfCryptoDevTokens = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const balance = await tokenContract.balanceOf(address);
      setBalanceOfCryptoDevTokens(balance);
    } catch (error) {
      console.error(error);
      setBalanceOfCryptoDevTokens(zero);
    }
  };
  const getTotalTokenMinted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      const _tokenMinted = await tokenContract.totalSupply();
      setTokensMinted(_tokenMinted);
    } catch (error) {
      console.error(error);
    }
  };
  const mintCryptoDevToken = async (amount) => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const value = 0.001 * amount;

      const tx = await tokenContract.mint(amount, {
        value: utils.parseEther(value.toString()),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("succesfully mineted some crypto dev tokens");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokenMinted();
      await getTokenToBeClaimed();
    } catch (error) {
      console.error(error);
    }
  };
  const claimCryptoDevTokens = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      // Create an instance of tokenContract
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const tx = await tokenContract.claim();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("succefully claimed dev tokens");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokenMinted();
      await getTokenToBeClaimed();
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        provideroptions: {},
        disabledInjectedProvider: false,
      });
      connectWallet();
      getBalanceOfCryptoDevTokens();
      getTotalTokenMinted();
      getTokenToBeClaimed();
    }
  }, [walletConnected]);
  // wallet will ne connected if we change stage
  const renderButton = () => {
    if (loading) {
      return (
        <div>
          <button className={styles.button}>Loading...</button>
        </div>
      );
    }
    // If tokens to be claimed are greater than 0, Return a claim button
    if (tokenToBeClaimed > 0) {
      return (
        <div>
          <div className={styles.description}>
            {tokenToBeClaimed * 10} Tokens can be claimed!
          </div>
          <button className={styles.button} onClick={claimCryptoDevTokens}>
            Claim Tokens
          </button>
        </div>
      );
    }
    // If user doesn't have any tokens to claim, show the mint button
    return (
      <div style={{ display: "flex-col" }}>
        <div>
          <input
            type="number"
            placeholder="Amount of Tokens"
            // BigNumber.from converts the `e.target.value` to a BigNumber
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
            className={styles.input}
          />
        </div>

        <button
          className={styles.button}
          disabled={!(tokenAmount > 0)}
          onClick={() => mintCryptoDevToken(tokenAmount)}
        >
          Mint Tokens
        </button>
      </div>
    );
  };

  // if (tokenToBeClaimed) {
  //   return (
  //     <div>
  //       <div className={styles.description}>
  //         {tokenToBeClaimed * 10}tokens can be claimed!
  //       </div>
  //       <button className={styles.button} onClick={claimCryptoDevTokens}>
  //         {" "}
  //         claim TOkens
  //       </button>
  //     </div>
  //   );
  // }
  
  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="ICO-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs ICO!</h1>
          <div className={styles.description}>
            You can claim or mint Crypto Dev tokens here
          </div>
          {walletConnected ? (
            <div>
              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                Overall {utils.formatEther(tokensMinted)}/10000 have been
                minted!!!
              </div>
              {renderButton()}
              
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect your wallet
            </button>
          )}
        </div>
        <div>
          <img className={styles.image} src="./0.svg" />
        </div>
      </div>
      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
  

}


