// v1.40
let currentAccount = null;

// 提示框
function showToast(message, type = "info") {
  console.log("[Toast]", message, type); // 调试输出
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// 连接钱包
async function connectWallet() {
  console.log("[Debug] connectWallet 被点击");
  const ethereum = window.ethereum || window.BinanceChain;
  if (!ethereum) {
    alert("请先安装 MetaMask 或 Binance Wallet");
    console.error("[Error] 没有检测到钱包对象 window.ethereum");
    return;
  }

  try {
    const provider = new ethers.providers.Web3Provider(ethereum);
    console.log("[Debug] provider 初始化完成");

    await provider.send("eth_requestAccounts", []);
    console.log("[Debug] 请求账户授权成功");

    const signer = provider.getSigner();
    const address = await signer.getAddress();
    currentAccount = address;
    console.log("[Debug] 当前账户:", address);

    let network = await provider.getNetwork();
    console.log("[Debug] 当前网络 ChainId:", network.chainId);

    if (network.chainId !== 56) {
      console.warn("[Warn] 不是 BSC 主网，尝试切换");
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x38" }],
        });
        network = await provider.getNetwork();
        console.log("[Debug] 切换后网络 ChainId:", network.chainId);
      } catch (switchError) {
        alert("请手动切换到 BSC 主网");
        console.error("[Error] 切换 BSC 主网失败:", switchError);
        return;
      }
    }

    localStorage.setItem("loginWallet", address);
    console.log("[Debug] 地址存入 localStorage");

    const refInput = document.getElementById("referrerInput");
    if (refInput) {
      refInput.value = localStorage.getItem("inviterWallet") || "";
    }

    showToast("钱包已连接: " + address, "success");

    if (!localStorage.getItem("inviterWallet")) {
      console.log("[Debug] 未绑定邀请人，准备跳转 relation.html");
      setTimeout(() => {
        window.location.href = "relation.html";
      }, 1000);
    }
  } catch (err) {
    console.error("[Error] 连接钱包失败:", err);
    alert("连接钱包失败: " + err.message);
  }
}

// DOM 绑定
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("connectWalletBtn");
  if (btn) {
    console.log("[Debug] 找到按钮，准备绑定事件");
    btn.addEventListener("click", connectWallet);
  } else {
    console.error("[Error] 找不到按钮 #connectWalletBtn");
  }
});
