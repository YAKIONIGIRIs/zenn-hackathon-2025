// アイコンクリック時のイベントハンドラ
chrome.action.onClicked.addListener((tab) => {
    // Google Meetのタブでのみ動作
    if (tab.url.includes('meet.google.com')) {
        chrome.tabs.sendMessage(tab.id, {
            action: 'toggleUserNameInput'
        });
    }
}); 