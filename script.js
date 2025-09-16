// v1.39
let currentAccount = null;

// 显示提示框
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("show");
  }, 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// 连接钱包
async function connectWallet() {
  const ethereum = window.ethereum || window.BinanceChain;
  if (!ethereum) {
    alert("请先安装 MetaMask 或 Binance Wallet");
    return;
  }

  try {
    const provider = new ethers.providers.Web3Provider(ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    currentAccount = address;

    let network = await provider.getNetwork();
    if (network.chainId !== 56) {
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x38" }], // BSC 主网
        });
        network = await provider.getNetwork();
      } catch (switchError) {
        alert("请手动切换到 BSC 主网");
        return;
      }
    }

    localStorage.setItem("loginWallet", address);

    // 自动回填邀请人地址（如果已经绑定过）
    document.getElementById("referrerInput").value =
      localStorage.getItem("inviterWallet") || "";

    showToast("钱包已连接: " + address, "success");

    // 如果没有邀请人 → 跳转确认关系页面
    if (!localStorage.getItem("inviterWallet")) {
      setTimeout(() => {
        window.location.href = "relation.html";
      }, 1000);
    }
  } catch (err) {
    console.error("连接钱包失败:", err);
    alert("连接钱包失败: " + err.message);
  }
}

// DOM 加载完成后绑定按钮
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("connectWalletBtn");
  if (btn) {
    btn.addEventListener("click", connectWallet);
  } else {
    console.error("找不到按钮 #connectWalletBtn");
  }
});
