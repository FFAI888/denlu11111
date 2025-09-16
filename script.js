let currentAccount = null;
let retryInterval = null;
let countdown = 3;
let countdownInterval = null;

const retryBtn = document.getElementById("retryWalletBtn");
const stopRetryBtn = document.getElementById("stopRetryBtn");

function updateStatus(msg, color = "blue") {
  const status = document.getElementById("walletStatus");
  if (status) {
    status.innerText = msg;
    status.style.color = color;
  }
}

// 停止自动重试
function stopAutoRetry() {
  if (retryInterval) {
    clearInterval(retryInterval);
    retryInterval = null;
  }
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  updateStatus("⚠ 已停止自动重试", "orange");
  if (stopRetryBtn) stopRetryBtn.style.display = "none";
}

// 更新倒计时显示
function startCountdown() {
  countdown = 3;
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      updateStatus(`🔄 自动重试中，下次尝试 ${countdown} 秒后...`, "orange");
    } else {
      clearInterval(countdownInterval);
    }
  }, 1000);
}

// 连接钱包
async function connectWallet() {
  const ethereum = window.ethereum || window.BinanceChain;
  if (!ethereum) {
    updateStatus("❌ 未检测到钱包插件", "red");
    if (retryBtn) retryBtn.style.display = "inline-block";
    if (stopRetryBtn) stopRetryBtn.style.display = "inline-block";
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
    if (network.chainId !== 56) {
      updateStatus("⚠ 当前不是 BSC 主网，请切换网络", "orange");
      if (retryBtn) retryBtn.style.display = "inline-block";
      if (stopRetryBtn) stopRetryBtn.style.display = "inline-block";
      return;
    }

    updateStatus(`✅ 已连接 BSC 主网，钱包地址: ${address}`, "green");
    if (retryBtn) retryBtn.style.display = "none";
    if (stopRetryBtn) stopRetryBtn.style.display = "none";

    stopAutoRetry();

  } catch (err) {
    console.error("连接失败:", err);
    const msg = err && err.message ? err.message : JSON.stringify(err);
    updateStatus("❌ 连接钱包失败: " + msg, "red");
    if (retryBtn) retryBtn.style.display = "inline-block";
    if (stopRetryBtn) stopRetryBtn.style.display = "inline-block";

    // 启动自动重试
    if (!retryInterval) {
      startCountdown();
      retryInterval = setInterval(() => {
        startCountdown();
        connectWallet();
      }, 3000);
    }
  }
}

// 手动重试按钮绑定
if (retryBtn) {
  retryBtn.addEventListener("click", () => {
    connectWallet();
    updateStatus("🔄 手动重试中...");
  });
}

// 停止自动重试按钮绑定
if (stopRetryBtn) {
  stopRetryBtn.addEventListener("click", stopAutoRetry);
}

// DOM 加载完成
document.addEventListener("DOMContentLoaded", () => {
  updateStatus("脚本已加载，等待操作...");
  const btn = document.getElementById("connectWalletBtn");
  if (btn) {
    btn.addEventListener("click", connectWallet);
  } else {
    updateStatus("❌ 找不到按钮 #connectWalletBtn", "red");
  }
});
