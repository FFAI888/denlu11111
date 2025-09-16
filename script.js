document.getElementById('connectWalletBtn').addEventListener('click', function() {
    alert('点击了连接钱包按钮');

    const btn = document.getElementById('connectWalletBtn');
    const statusDiv = document.getElementById('walletStatus');

    // 修改按钮状态：文字 + 转圈
    btn.innerHTML = '<div class="loader"></div> 正在连接...';
    btn.disabled = true;

    // 显示提示文字
    statusDiv.textContent = '钱包连接中...';

    // 3 秒后恢复按钮，并显示成功提示
    setTimeout(() => {
        btn.textContent = '连接钱包';
        btn.disabled = false;

        // 添加成功闪烁效果
        btn.classList.add('success-flash');
        setTimeout(() => {
            btn.classList.remove('success-flash');
        }, 1000);

        // 显示成功提示
        statusDiv.textContent = '钱包连接成功！';

        // 2 秒后清除成功提示
        setTimeout(() => {
            statusDiv.textContent = '';
        }, 2000);
    }, 3000);
});

// 当前文件版本号 v1.23
