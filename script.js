// v1.36 登录页面 JS 修正版
async function connectWallet() {
  console.log("点击连接钱包触发");

  if (!window.ethereum) {
    alert("请安装 MetaMask 或支持 BSC 的钱包");
    return;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    console.log("钱包地址:", address);

    // 保存登录钱包地址
    localStorage.setItem("loginWallet", address);

    // 回填邀请人钱包地址
    const referrerInput = document.getElementById("referrerInput");
    const inviter = localStorage.getItem("inviterWallet") || "";
    referrerInput.value = inviter;

    showToast("钱包已连接: " + address, "success");

    // 如果没有邀请人地址，跳转确认关系页面
    if (!inviter) {
      showToast("没有检测到邀请人钱包，跳转确认关系页面", "info");
      setTimeout(() => {
        window.location.href = "relation.html";
      }, 1000);
    }
  } catch (err) {
    console.error("连接钱包失败:", err);
    alert("连接钱包失败: " + err.message);
  }
}

// 显示 Toast 提示
function showToast(msg, type="info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 2000);
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("connectWalletBtn");
  if (!btn) console.error("connectWalletBtn 按钮未找到");
  btn.addEventListener("click", connectWallet);
});
