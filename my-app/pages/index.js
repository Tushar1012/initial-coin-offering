import Head from "next/head";
import Image from "next/image";
import { useState ,useEffect, useRef} from "react";
import styles from "../styles/Home.module.css";
import Web3Modal ,{providers} from 'web3modal';

export default function Home() {
  const[walletConnected,setWalletConnected] = useState(false);
  const web3ModalRef = useRef();  
  const getProviderOrSigner = async (needSigner= false) =>{
    try {
      const provider = await web3ModalRef.current.Connect();
      const web3Provider = new providers.web3Provider(provider);
      const {chaineId} = await web3Provider.getNetwork()
      if(chaineId !==4){
        window.alert("Change the network to Rinkeby");
        throw new Error("Change network to Rinkeby");

      }
      if(needSigner){
        const signer = web3Provider.getSigner();
        return signer
      }
      return web3Provider;
    } catch (error) {
      console.error(error);
    }
  }
  const connectWallet = async () =>{
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
      
    } catch (error) {
      console.error(error);
      
    }
  }
  useEffect(()=>{
    if(!walletConnected){
      web3ModalRef.current = new Web3Modal({
        network:"rinkeby",
        provideroptions:{},
        disabledInjectedProvider:false,
      });
      connectWallet()
    }
  },[walletConnected]);
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
        </div>
      </div>
    </div>
  );
}
