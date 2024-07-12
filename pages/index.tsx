import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { sendExample } from "./transactions/send";
import { mintExample } from "./transactions/mint";
import { BrowserWallet } from "@meshsdk/core";
import { useEffect, useState } from "react";

const Home: NextPage = () => {
  const [wallet, setWallet] = useState<BrowserWallet | null>(null);

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    const eternlWallet = await BrowserWallet.enable("eternl");
    setWallet(eternlWallet);
  };

  return (
    <div className={styles.container}>
      {wallet ? (
        <button className={styles.button}>Eternl Connected</button>
      ) : (
        <button className={styles.button} onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
      <button
        className={styles.button}
        onClick={() => {
          if (!wallet) {
            alert("Please connect wallet");
            return;
          }
          sendExample(wallet);
        }}
      >
        Send
      </button>
      <button
        className={styles.button}
        onClick={() => {
          if (!wallet) {
            alert("Please connect wallet");
            return;
          }
          mintExample(wallet);
        }}
      >
        Mint Token
      </button>
    </div>
  );
};

export default Home;
