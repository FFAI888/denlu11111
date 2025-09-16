// v1.43 自动检测网络调试版
let currentAccount = null;

function updateStatus(msg, color = "blue") {
  const status = document.getElementById("walletStatus");
  if(status){
    status.innerText = msg;
    status.style.color = color;
  }
}

async function connectWallet() {
  const ethereum = window.ethereum || window.BinanceChain;
  if(!ethereum){
    updateStatus("❌ 未检测到钱包插件 (MetaMask / Binance Wallet)", "red");
    return;
  }

  updateStatus("✅ 钱包插件检测到，正在请求账户授权...");

  try{
    const provider = new ethers.providers.Web3Provider(ethereum);

    // 请求账户授权
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    currentAccount = address;

    let network = await provider.getNetwork();

    // 如果不是 BSC 主网，尝试切换
    if(network.chainId !== 56){
      updateStatus("⚠ 当前不是 BSC 主网，正在尝试切换...");
      try{
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x38" }], // BSC 主网 56
        });
        network = await provider.getNetwork();
        updateStatus(`✅ 已切换到 BSC 主网，钱包地址: ${address}`, "green");
      } catch(switchError){
        updateStatus("❌ 请手动切换钱包网络到 BSC 主网", "red");
        return;
      }
    } else {
      updateStatus(`✅ 已连接 BSC 主网，钱包地址: ${address}`, "green");
    }

    // 自动回填邀请人地址
    const refInput = document.getElementById("referrerInput");
    if(refInput){
      refInput.value = localStorage.getItem("inviterWallet") || "";
    }

  } catch(err){
    console.error("连接失败:", err);
    const msg = err && err.message ? err.message : JSON.stringify(err);
    updateStatus("❌ 连接钱包失败: " + msg, "red");
  }
}

// DOM 绑定
document.addEventListener("DOMContentLoaded", () => {
  updateStatus("脚本已加载，等待操作...");
  const btn = document.getElementById("connectWalletBtn");
  if(btn){
    btn.addEventListener("click", connectWallet);
  } else {
    console.error("找不到按钮 #connectWalletBtn");
    updateStatus("❌ 找不到按钮 #connectWalletBtn", "red");
  }
});
