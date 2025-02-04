let lastTranscripts = new Map(); // ユーザーごとの最新のトランスクリプトを保持
let pendingTranscripts = new Map(); // ユーザーごとの保留中のトランスクリプトを保持
console.log('Content script loaded');

// MutationObserverを使用して文字起こし要素の変更を監視
const observer = new MutationObserver((mutations) => {
    console.log('Mutation detected', mutations.length);
    const transcriptElements = document.querySelectorAll('div[jsname="tgaKEf"].bh44bd.VbkSUe');
    
    if (transcriptElements.length > 0) {
        console.log('Transcript elements found:', transcriptElements.length);
        
        // 各トランスクリプト要素の親要素から話者名を取得
        transcriptElements.forEach(element => {
            // トランスクリプト要素の親要素を辿って話者名を探す
            let currentElement = element;
            while (currentElement && !currentElement.querySelector('.KcIKyf.jxFHg')) {
                currentElement = currentElement.parentElement;
            }

            // 話者名要素を取得
            const speakerElement = currentElement ? currentElement.querySelector('.KcIKyf.jxFHg') : null;
            const speaker = speakerElement ? speakerElement.textContent.trim() : 'Unknown User';
            const currentTranscript = element.textContent.trim();
            
            console.log('Found speaker element:', speakerElement);
            console.log('Speaker:', speaker);
            
            if (currentTranscript) {
                const lastTranscript = lastTranscripts.get(speaker) || '';
                
                // 新しいトランスクリプトが前回のものと異なる場合のみ更新
                if (currentTranscript !== lastTranscript) {
                    console.log(`Updated transcript from ${speaker}:`, currentTranscript);
                    lastTranscripts.set(speaker, currentTranscript);
                    pendingTranscripts.set(speaker, {
                        user: speaker,
                        transcript: currentTranscript
                    });
                }
            }
        });
    } else {
        console.log('No transcript elements found');
    }
});

// ユーザー名を取得する関数
function getUserName() {
    const userElement = document.querySelector('div.KcIKyf.jxFHg');
    return userElement ? userElement.textContent.trim() : 'Unknown User';
}

// APIにデータを送信する関数
async function sendToAPI(transcripts) {
    if (transcripts.size === 0) return;
    
    const transcriptsArray = Array.from(transcripts.values());
    console.log('Attempting to send to API:', transcriptsArray);
    try {
        const response = await fetch('https://zenn-hackathon-2025-backend-666593730950.asia-northeast1.run.app/save_transcript', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                transcripts: transcriptsArray,
                timestamp: new Date().toISOString()
            })
        });
        console.log('API Response:', response.status, response.statusText);
    } catch (error) {
        console.error('Error sending transcripts:', error);
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
    if (pendingTranscripts.size > 0) {
        console.log('Sending batched transcripts:', pendingTranscripts);
        sendToAPI(pendingTranscripts);
        pendingTranscripts.clear(); // 送信後にクリア
    }
}, 5000);