// v1.36 确认关系页面逻辑（CRC 代币 + 轮询3秒 + WebSocket）
let provider, signer, userAddress, inviterAddress;

const CRC_ADDRESS = "0x5b2fe2b06e714b7bea4fd35b428077d850c48087";
const CRC_ABI = [
  "function transfer(address to, uint256 amount) public returns (bool)"
];

const BSC_HTTP = "https://bsc-dataseed.binance.org/";
const BSC_WSS = "";

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-20px)";
    setTimeout(() => toast.remove(), 500);
  }, 2000);
}

async function initWallet() {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  userAddress = await signer.getAddress();

  document.getElementById("walletInput").value = userAddress;
  document.getElementById("qrContainer").textContent = "🔳";
}

async function pollTransactions(callback) {
  const httpProvider = new ethers.providers.JsonRpcProvider(BSC_HTTP);
  let lastBlock = await httpProvider.getBlockNumber();

  setInterval(async () => {
    try {
      const newBlock = await httpProvider.getBlockNumber();
      if (newBlock <= lastBlock) return;

      for (let i = lastBlock + 1; i <= newBlock; i++) {
        const block = await httpProvider.getBlockWithTransactions(i);
        for (let tx of block.transactions) {
          callback(tx);
        }
      }
      lastBlock = newBlock;
    } catch (err) {
      console.error("轮询出错:", err);
    }
  }, 3000);
