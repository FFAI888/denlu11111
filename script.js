// v1.25 脚本文件：只支持币安链 BSC (ChainID 56)

document.getElementById('connectWalletBtn').addEventListener('click', async function() {
    const btn = document.getElementById('connectWalletBtn');
    const statusDiv = document.getElementById('walletStatus');

    if (!window.ethereum) {
        alert('未检测到钱包，请安装 MetaMask 或支持 BSC 的钱包');
        return;
    }

    try {
        // 修改按钮状态：文字 + 转圈
        btn.innerHTML = '<div class="loader"></div> 正在连接...';
        btn.disabled = true;
        statusDiv.textContent = '钱包连接中...';

        // 请求账户权限
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];

        // 检查当前网络
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0x38') { // 0x38 = 56 (BSC 主网)
            statusDiv.textContent = '请切换到币安智能链（BSC）';
            btn.textContent = '连接钱包';
            btn.disabled = false;
            return;
        }

        // 显示连接成功
        statusDiv.textContent = '钱包连接成功：' + account;
        btn.textContent = '连接钱包';
        btn.disabled = false;

        // 成功闪烁效果
        btn.classList.add('success-flash');
        setTimeout(() => btn.classList.remove('success-flash'), 1000);

    } catch (error) {
        console.error(error);
        statusDiv.textContent = '连接失败，请重试';
        btn.textContent = '连接钱包';
        btn.disabled = false;
    }
});
