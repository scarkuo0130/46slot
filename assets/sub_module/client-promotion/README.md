# 注意事項
1. 導入 `extensions` 前，請務必刪除遊戲內所有與 Promotion / Jackpot / InGameMenu 相關的程式碼。
2. 移除相關載入的 assets 檔，通常在 `File.js` 或 `fileData.js` 中。
3. 移除相關載入的 css 檔，通常在 `index.html` 等相關 html 檔中。

# 導入說明
1. 將整個 `extensions` 資料夾 copy 至資料夾內。
2. 在 `index.html` / `indexStaging.html` / `indexProduction.html` 中載入 `extensions/js/index.js` ，如下：
```
<script type="text/javascript" src="./extensions/js/index.js"></script>
```
3. 監聽全域 window 事件： `PIXI_START_LOADING` 、 `GAME_READY_TO_SPIN` 、 `GAME_UPDATE_TOTAL_BET` 及 `EXTENSIONS_SLIDE_OFF`。
4. 在 UI 層建立一個給 `extensions` 使用的 `extensionsContainer`，請注意 container 的先後順序。
5. 在 `config.js` 裡，新增相關遊戲是否支援直橫版的設定。

# 全域事件
1. `PIXI_START_LOADING` ：
在 PIXI 的 loader 還沒開始載入時，需要將 `PIXI` 和 `TweenLite` 給 dispatch 出去，語法如下：
```
window.dispatchEvent(new CustomEvent('PIXI_START_LOADING', { detail: { pixi: PIXI, tween: TweenLite } }));
```
2. `GAME_READY_TO_SPIN` ：
需要 dispath 當時在 UI 層建立的 `extensionsContainer` ，以及 `get_user_data` api回來後的 `account` 資訊。
```
window.dispatchEvent(new CustomEvent('GAME_READY_TO_SPIN', { detail: { container: extensionsContainer, account: s_aryWindowSearch['Account'] } }));
```
3. `GAME_UPDATE_TOTAL_BET` ：
接收變更 bet 後新設定的 bet。
```
window.dispatchEvent(new CustomEvent('GAME_UPDATE_TOTAL_BET', { detail: { totalBet: iTotBet} }));
```

4. `EXTENSIONS_SLIDE_OFF` ：
通知 `extensions` 將所有 Icon 收起來。
```
window.dispatchEvent(new CustomEvent('EXTENSIONS_SLIDE_OFF', { detail: {} }));
```

5. `EXTENSIONS_ERROR_MESSAGE` :
此事件 `extensions` 僅有dispath，所以需要在 `game` 層去監聽該事項，用來做 error message handling 。 `game` 層範例如下：
```
// 監聽
window.addEventListener( 'EXTENSIONS_ERROR_MESSAGE', this.onReceivedErrorMessage.bind(this));

// 接收 function
this.onReceivedErrorMessage = function(event) {
    let errorCode = event.detail.error_code;
    let message = s_aData['lang'].MSG_DISCONNECT[CMain_Language];
    s_oPopMessageBox.addHTML(
        message.format(errorCode),
        s_aData['lang'].MSG_OK[CMain_Language],
        function() {
            window.location.reload();
        }
    );
}
```