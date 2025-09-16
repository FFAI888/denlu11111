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
}

async function listenTransactions(callback) {
  if (!BSC_WSS) return;
  const wsProvider = new ethers.providers.WebSocketProvider(BSC_WSS);
  wsProvider.on("pending", async (txHash) => {
    try {
      const tx = await wsProvider.getTransaction(txHash);
      if (tx) callback(tx);
    } catch {}
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await initWallet();

  const btnReceive = document.getElementById("btnReceive");
  const btnSend = document.getElementById("btnSend");
  const btnBind = document.getElementById("btnBind");
  const inviterBox = document.getElementById("inviterBox");
  const inviterInput = document.getElementById("inviterInput");
  const sendBtn = document.getElementById("sendBtn");

  const crcContract = new ethers.Contract(CRC_ADDRESS, CRC_ABI, signer);

  function handleTx(tx) {
    if (!btnReceive.disabled && tx.to && tx.to.toLowerCase() === userAddress.toLowerCase()) {
      inviterAddress = tx.from;
      btnReceive.disabled = false;
      showToast("检测到邀请人转账，确认接收按钮已激活", "success");
    }

    if (!btnSend.disabled && inviterAddress && tx.from && tx.from.toLowerCase() === userAddress.toLowerCase() && tx.to && tx.to.toLowerCase() === inviterAddress.toLowerCase()) {
      btnSend.disabled = false;
      showToast("检测到 CRC 发送成功，确认发送按钮已激活", "success");
    }
  }

  pollTransactions(handleTx);
  listenTransactions(handleTx);

  btnReceive.addEventListener("click", () => {
    document.getElementById("tipsText").style.display = "none";
    btnReceive.disabled = true;
    btnSend.classList.remove("hidden");
    inviterBox.classList.remove("hidden");
    inviterInput.value = inviterAddress || "0x检测中...";
  });

  sendBtn.addEventListener("click", async () => {
    if (!inviterAddress) {
      showToast("邀请人地址未检测到", "error");
      return;
    }

    try {
      const tx = await crcContract.transfer(inviterAddress, ethers.BigNumber.from("1"));
      showToast("CRC 转账已提交，等待确认...", "info");
      sendBtn.disabled = true;
      await tx.wait();
      showToast("CRC 转账成功", "success");
    } catch (err) {
      showToast("CRC 转账失败: " + err.message, "error");
      sendBtn.disabled = false;
    }
  });

  btnSend.addEventListener("click", () => {
    btnSend.disabled = true;
    btnBind.classList.remove("hidden");
  });

  btnBind.addEventListener("click", () => {
    localStorage.setItem("inviterWallet", inviterAddress);
    showToast("确认关系成功，跳转首页", "success");
    setTimeout(() => (window.location.href = "index.html"), 1500);
  });
});
