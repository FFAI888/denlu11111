async function connectWallet() {
  console.log("点击连接钱包触发");

  // 通过 window.ethereum 检查钱包
  const ethereum = window.ethereum || window.BinanceChain;
  
  if (!ethereum) {
    showToast("请安装支持以太坊/BSC 的钱包", "error");
    return;
  }

  try {
    const provider = new ethers.providers.Web3Provider(ethereum);
    await provider.send("eth_requestAccounts", []); // 请求钱包连接
    const signer = provider.getSigner();
    const address = await signer.getAddress();  // 获取用户钱包地址

    // 检查用户网络是否为 BSC 主网 (ChainID: 56)
    const network = await provider.getNetwork();
    if (network.chainId !== 56) {
      showToast("请切换到 BSC 主网", "error");
      return;
    }

    // 保存连接钱包的地址
    localStorage.setItem("loginWallet", address);

    // 显示钱包地址
    const referrerInput = document.getElementById("referrerInput");
    referrerInput.value = localStorage.getItem("inviterWallet") || "";

    showToast("钱包已连接: " + address, "success");

    // 如果没有设置邀请人地址，跳转到确认关系页面
    if (!localStorage.getItem("inviterWallet")) {
      showToast("跳转确认关系页面", "info");
      setTimeout(() => { window.location.href = "relation.html"; }, 1000);
    }

    // 监听钱包网络变化
    ethereum.on("chainChanged", (chainId) => {
      const id = parseInt(chainId, 16);
      if (id !== 56) {
        showToast("当前不是 BSC 主网，请切换", "error");
      } else {
        showToast("已切换到 BSC 主网", "success");
      }
    });
  } catch (err) {
    console.error("连接钱包失败:", err);
    showToast("连接钱包失败: " + err.message, "error");
  }
}

function showToast(msg, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// 页面加载时初始化
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("connectWalletBtn");
  if (!btn) console.error("connectWalletBtn 按钮未找到");
  btn.addEventListener("click", connectWallet);
});
