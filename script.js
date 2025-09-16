document.addEventListener("DOMContentLoaded", () => {
    const connectWalletBtn = document.getElementById("connectWalletBtn");
    const walletAddressElement = document.getElementById("address");
    const qrContainer = document.getElementById("qrContainer");

    // 检查钱包连接状态
    async function connectWallet() {
        const ethereum = window.ethereum || window.BinanceChain;

        if (!ethereum) {
            alert("请安装并启用支持以太坊或 BSC 的钱包插件，例如 MetaMask 或 Binance Wallet！");
            return;
        }

        try {
            // 请求连接钱包
            const provider = new ethers.providers.Web3Provider(ethereum);
            await provider.send("eth_requestAccounts", []); // 请求连接钱包账户
            const signer = provider.getSigner();
            const address = await signer.getAddress(); // 获取连接的钱包地址
            console.log("连接成功，钱包地址：", address);

            // 检查网络是否为 BSC 主网 (Chain ID: 56)
            const network = await provider.getNetwork();
            if (network.chainId !== 56) {
                alert("请切换到 BSC 主网！");
                return;
            }

            // 显示地址并保存到 localStorage
            walletAddressElement.textContent = address;
            localStorage.setItem("walletAddress", address);

            // 显示二维码和提示
            qrContainer.classList.remove("hidden");
            showQRCode(address);  // 此处可以生成二维码

            // 可选：在 UI 中显示用户的钱包地址
            alert("钱包连接成功：" + address);
        } catch (error) {
            console.error("连接钱包失败:", error);
            alert("连接钱包失败：" + error.message);
        }
    }

    // 显示二维码（模拟二维码生成）
    function showQRCode(address) {
        const qrCodeContainer = document.getElementById("qrCode");
        qrCodeContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?data=${address}&size=100x100" alt="QR Code">`;
    }

    // 绑定连接钱包按钮点击事件
    connectWalletBtn.addEventListener("click", connectWallet);

    // 如果本地存储中已经有钱包地址，直接显示
    const storedAddress = localStorage.getItem("walletAddress");
    if (storedAddress) {
        walletAddressElement.textContent = storedAddress;
    }
});
