import Web3 from "web3";
import { setGlobalState, getGlobalState } from "./store";
import abi from "./abis/DominionDAO.json";

// Sepolia RPC Endpoint for read-only calls (works even before user connects wallet)
const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";
const readOnlyWeb3 = new Web3(SEPOLIA_RPC);

const CONTRACT_ADDRESS =
  process.env.REACT_APP_CONTRACT_ADDRESS ||
  "0xCF2bb46D7167D92e70230B57e232Cf5ae75530B6";

const getReadOnlyContract = () => {
  return new readOnlyWeb3.eth.Contract(abi.abi, CONTRACT_ADDRESS);
};

// --- Detect MetaMask specifically (handles multi-wallet extensions like Coin98/OKX) ---
const getMetaMaskProvider = () => {
  if (typeof window === "undefined") return null;

  if (window.ethereum?.providers?.length) {
    const mm = window.ethereum.providers.find((p) => p.isMetaMask && !p.isCoin98);
    return mm || null;
  }

  if (window.ethereum?.isMetaMask && !window.ethereum?.isCoin98) {
    return window.ethereum;
  }

  return window.ethereum || null;
};

// Initialise Web3 using MetaMask provider if available
const mmProvider = getMetaMaskProvider();
if (mmProvider) {
  window.web3 = new Web3(mmProvider);
  window._mmProvider = mmProvider;
}

// Switch MetaMask network to Sepolia (ChainId: 11155111 / 0xaa36a7)
const switchToSepolia = async (provider) => {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xaa36a7",
              chainName: "Sepolia test network",
              rpcUrls: [SEPOLIA_RPC],
              nativeCurrency: {
                name: "Sepolia ETH",
                symbol: "SEP",
                decimals: 18,
              },
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      } catch (addError) {
        console.error("Failed to add Sepolia network:", addError);
      }
    }
  }
};

const connectWallet = async () => {
  try {
    const provider = getMetaMaskProvider();
    if (!provider) {
      return alert("Không tìm thấy ví! Vui lòng cài đặt tiện ích MetaMask.");
    }

    await switchToSepolia(provider);

    window.web3 = new Web3(provider);
    window._mmProvider = provider;

    const accounts = await provider.request({
      method: "eth_requestAccounts",
    });

    if (accounts.length) {
      setGlobalState("connectedAccount", accounts[0].toLowerCase());
      await getInfo();
      await getProposals();
    }
  } catch (error) {
    reportError(error);
  } finally {
    window.location.reload();
  }
};

const isWallectConnected = async () => {
  try {
    const provider = getMetaMaskProvider();
    if (!provider) {
      console.log("No wallet provider found");
      return;
    }

    if (!window.web3 || window._mmProvider !== provider) {
      window.web3 = new Web3(provider);
      window._mmProvider = provider;
    }

    const accounts = await provider.request({ method: "eth_accounts" });

    provider.on("chainChanged", () => {
      window.location.reload();
    });

    provider.on("accountsChanged", async (newAccounts) => {
      if (newAccounts && newAccounts.length) {
        setGlobalState("connectedAccount", newAccounts[0].toLowerCase());
        await getInfo();
      } else {
        setGlobalState("connectedAccount", "");
        setGlobalState("isStakeholder", false);
        setGlobalState("mybalance", 0);
      }
    });

    if (accounts && accounts.length) {
      setGlobalState("connectedAccount", accounts[0].toLowerCase());
    }
  } catch (error) {
    reportError(error);
  }
};

const getEtheriumContract = async () => {
  const provider = getMetaMaskProvider();
  if (provider) {
    if (!window.web3) {
      window.web3 = new Web3(provider);
    }
    return new window.web3.eth.Contract(abi.abi, CONTRACT_ADDRESS);
  }
  return getReadOnlyContract();
};

const performContribute = async (amount) => {
  try {
    const provider = getMetaMaskProvider();
    if (!provider) throw new Error("Vui lòng cài đặt MetaMask");

    await switchToSepolia(provider);
    window.web3 = new Web3(provider);

    const weiAmount = window.web3.utils.toWei(amount.toString(), "ether");
    const contract = new window.web3.eth.Contract(abi.abi, CONTRACT_ADDRESS);
    const account = getGlobalState("connectedAccount");

    if (!account) throw new Error("Vui lòng kết nối ví trước!");

    await contract.methods.contribute().send({ from: account, value: weiAmount });
    window.location.reload();
  } catch (error) {
    reportError(error);
    throw error;
  }
};

const getInfo = async () => {
  try {
    // 1. Fetch public DAO Balance (works even without wallet connected)
    try {
      const readContract = getReadOnlyContract();
      const balance = await readContract.methods.daoBalance().call();
      setGlobalState("balance", readOnlyWeb3.utils.fromWei(balance, "ether"));
    } catch (err) {
      console.warn("Read-only daoBalance fetch:", err);
    }

    // 2. Fetch user-specific info if wallet is connected
    const connectedAccount = getGlobalState("connectedAccount");
    if (!connectedAccount) return;

    const contract = await getEtheriumContract();
    if (!contract) return;

    try {
      const isStakeholder = await contract.methods
        .isStakeholder()
        .call({ from: connectedAccount });
      const mybalance = await contract.methods
        .getBalance()
        .call({ from: connectedAccount });

      const utils = window.web3?.utils || readOnlyWeb3.utils;
      setGlobalState("mybalance", utils.fromWei(mybalance, "ether"));
      setGlobalState("isStakeholder", isStakeholder);
    } catch (err) {
      console.warn("User status check failed:", err);
    }
  } catch (error) {
    reportError(error);
  }
};

const raiseProposal = async ({ title, description, beneficiary, amount }) => {
  try {
    const cleanAmount = amount.toString().replace(/eth/gi, "").trim();
    const cleanBeneficiary = beneficiary.trim();

    const utils = window.web3?.utils || readOnlyWeb3.utils;
    if (!utils.isAddress(cleanBeneficiary)) {
      throw new Error("Địa chỉ ví Beneficiary không hợp lệ (cần bắt đầu bằng 0x...)");
    }

    const provider = getMetaMaskProvider();
    if (!provider) throw new Error("Vui lòng cài đặt MetaMask");
    await switchToSepolia(provider);
    window.web3 = new Web3(provider);

    const weiAmount = window.web3.utils.toWei(cleanAmount, "ether");
    const contract = new window.web3.eth.Contract(abi.abi, CONTRACT_ADDRESS);
    const account = getGlobalState("connectedAccount");

    if (!contract || !account) {
      throw new Error("Vui lòng kết nối ví MetaMask trước!");
    }

    await contract.methods
      .createProposal(title.trim(), description.trim(), cleanBeneficiary, weiAmount)
      .send({ from: account });

    await getProposals();
    await getInfo();
    return true;
  } catch (error) {
    reportError(error);
    throw error;
  }
};

const getProposals = async () => {
  try {
    let rawProposals = [];
    try {
      // Use readOnlyWeb3 for reliable instant loading on Sepolia
      const readContract = getReadOnlyContract();
      rawProposals = await readContract.methods.getProposals().call();
    } catch (readErr) {
      console.warn("Read-only getProposals fallback:", readErr);
      const contract = await getEtheriumContract();
      if (contract) {
        rawProposals = await contract.methods.getProposals().call();
      }
    }

    if (rawProposals && Array.isArray(rawProposals)) {
      setGlobalState("proposals", structuredProposals(rawProposals));
    }
  } catch (error) {
    reportError(error);
  }
};

const structuredProposals = (proposals) => {
  const utils = window.web3?.utils || readOnlyWeb3.utils;
  return proposals
    .map((proposal) => ({
      id: proposal.id,
      amount: utils.fromWei(proposal.amount, "ether"),
      title: proposal.title,
      description: proposal.description,
      paid: proposal.paid,
      passed: proposal.passed,
      proposer: proposal.proposer,
      upvotes: Number(proposal.upvotes),
      downvotes: Number(proposal.downvotes),
      beneficiary: proposal.beneficiary,
      executor: proposal.executor,
      duration: proposal.duration,
    }))
    .reverse();
};

const getProposal = async (id) => {
  try {
    const proposals = getGlobalState("proposals");
    let prop = proposals.find((proposal) => proposal.id == id);
    if (!prop) {
      const readContract = getReadOnlyContract();
      const p = await readContract.methods.getProposal(id).call();
      const utils = window.web3?.utils || readOnlyWeb3.utils;
      prop = {
        id: p.id,
        amount: utils.fromWei(p.amount, "ether"),
        title: p.title,
        description: p.description,
        paid: p.paid,
        passed: p.passed,
        proposer: p.proposer,
        upvotes: Number(p.upvotes),
        downvotes: Number(p.downvotes),
        beneficiary: p.beneficiary,
        executor: p.executor,
        duration: p.duration,
      };
    }
    return prop;
  } catch (error) {
    reportError(error);
  }
};

const voteOnProposal = async (proposalId, supported) => {
  try {
    const provider = getMetaMaskProvider();
    if (!provider) throw new Error("Vui lòng cài đặt MetaMask");
    await switchToSepolia(provider);
    window.web3 = new Web3(provider);

    const contract = new window.web3.eth.Contract(abi.abi, CONTRACT_ADDRESS);
    const account = getGlobalState("connectedAccount");

    if (!contract || !account) {
      throw new Error("Vui lòng kết nối ví trước khi vote!");
    }

    await contract.methods
      .performVote(proposalId, supported)
      .send({ from: account });
    window.location.reload();
  } catch (error) {
    reportError(error);
    throw error;
  }
};

const listVoters = async (id) => {
  try {
    const readContract = getReadOnlyContract();
    const votes = await readContract.methods.getVotesOf(id).call();
    return votes;
  } catch (error) {
    reportError(error);
  }
};

const payoutBeneficiary = async (id) => {
  try {
    const provider = getMetaMaskProvider();
    if (!provider) throw new Error("Vui lòng cài đặt MetaMask");
    await switchToSepolia(provider);
    window.web3 = new Web3(provider);

    const contract = new window.web3.eth.Contract(abi.abi, CONTRACT_ADDRESS);
    const account = getGlobalState("connectedAccount");

    await contract.methods.payBeneficiary(id).send({ from: account });
    window.location.reload();
  } catch (error) {
    reportError(error);
    throw error;
  }
};

const reportError = (error) => {
  console.log(JSON.stringify(error), "red");
};

export {
  isWallectConnected,
  connectWallet,
  performContribute,
  getInfo,
  raiseProposal,
  getProposals,
  getProposal,
  voteOnProposal,
  listVoters,
  payoutBeneficiary,
};
