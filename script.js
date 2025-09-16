// v1.41 调试版
let currentAccount = null;

// 页面状态显示
function updateStatus(msg, color = "blue") {
  const status = document.getElementById("walletStatus");
  if(status) {
    status.innerText = msg;
    status.style.color = color;
  }
}

// 连接钱包
async function connectWallet() {
  updateStatus("连接钱包按钮点击了...");
  const ethereum = window.ethereum || window.BinanceChain;
  if (!ethereum) {
    updateStatus("❌ 没有检测到钱包插件 (MetaMask / Binance Wallet)", "red");
    return;
  }

  updateStatus("✅ 钱包插件检测到，正在请求账户授权...");
  try {
    const provider = new ethers.providers.Web3Provider(ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    currentAccount = address;

    const network = await provider.getNetwork();

    updateStatus(`✅ 已连接: ${address}, 网络 ChainId: ${network.chainId}`, "green");

    // 自动回填邀请人地址（如果已经绑定过）
    const refInput = document.getElementById("referrerInput");
    if(refInput) {
      refInput.value = localStorage.getItem("inviterWallet") || "";
    }

  } catch(err) {
    console.error("连接失败:", err);
    updateStatus("❌ 连接钱包失败: " + err.message, "red");
  }
}

// DOM 绑定
document.addEventListener("DOMContentLoaded", () => {
  updateStatus("脚本已加载，等待操作...");
  const btn = document.getElementById("connectWalletBtn");
  if(btn) {
    btn.addEventListener("click", connectWallet);
  } else {
    console.error("找不到按钮 #connectWalletBtn");
    updateStatus("❌ 找不到按钮 #connectWalletBtn", "red");
  }
});
