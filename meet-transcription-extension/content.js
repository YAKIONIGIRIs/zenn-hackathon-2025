let lastTranscript = '';
let pendingTranscript = '';
console.log('Content script loaded');

// MutationObserverを使用して文字起こし要素の変更を監視
const observer = new MutationObserver((mutations) => {
    console.log('Mutation detected', mutations.length);
    const transcriptElement = document.querySelector('div[jsname="tgaKEf"].bh44bd.VbkSUe');
    if (transcriptElement) {
        console.log('Transcript element found');
        const currentTranscript = transcriptElement.textContent.trim();
        console.log('Current transcript:', currentTranscript);
        
        if (currentTranscript && currentTranscript !== lastTranscript) {
            // 新しい文字起こしが検出された場合
            if (currentTranscript.startsWith(lastTranscript)) {
                // 追加された部分を保存
                const newText = currentTranscript.substring(lastTranscript.length).trim();
                console.log('Appended text detected:', newText);
                if (newText) {
                    pendingTranscript = newText;
                }
            } else {
                // 文章が更新された場合は全体を保存
                console.log('Full text update detected');
                pendingTranscript = currentTranscript;
            }
            lastTranscript = currentTranscript;
        } else {
            console.log('No changes in transcript');
        }
    } else {
        console.log('Transcript element not found');
    }
});

// APIにデータを送信する関数
async function sendToAPI(text) {
    if (!text.trim()) return;
    
    console.log('Attempting to send to API:', text);
    try {
        const response = await fetch('http://localhost:8080/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                transcript: text,
                timestamp: new Date().toISOString()
            })
        });
        console.log('API Response:', response.status, response.statusText);
    } catch (error) {
        console.error('Error sending transcript:', error);
    }
}

// 監視の開始
function startObserving() {
    console.log('Starting observation...');
    const config = { 
        childList: true, 
        subtree: true, 
        characterData: true 
    };
    observer.observe(document.body, config);
    console.log('Observer configuration:', config);
    console.log('Started observing transcriptions');
}

// 即座に監視を開始
console.log('Initializing observation...');
startObserving();

// 定期的に要素の存在確認を行う
setInterval(() => {
    const element = document.querySelector('div[jsname="tgaKEf"].bh44bd.VbkSUe');
    console.log('Periodic check - Transcript element exists:', !!element);
}, 5000);

// 5秒ごとに蓄積されたテキストを送信
setInterval(() => {
    if (pendingTranscript) {
        console.log('Sending batched transcript:', pendingTranscript);
        sendToAPI(pendingTranscript);
        pendingTranscript = ''; // 送信後にクリア
    }
}, 5000);