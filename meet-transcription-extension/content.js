let lastTranscripts = new Map(); // ユーザーごとの最新のトランスクリプトを保持
let pendingTranscripts = new Map(); // ユーザーごとの保留中のトランスクリプトを保持
let userName = localStorage.getItem('meetTranscriptUserName') || 'Unknown User';
let userNameContainer = null; // UIコンテナの参照を保持
console.log('Content script loaded');

const meetId = location.pathname.replace("/", "")

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

// ユーザー名入力用のUIを作成する関数
function createUserNameInput() {
    // 既存のコンテナがある場合は削除
    if (userNameContainer) {
        userNameContainer.remove();
    }

    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: white;
        padding: 10px;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 10000;
        display: none;
    `;
    userNameContainer = container;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = userName;
    input.placeholder = 'あなたの名前を入力';
    input.style.cssText = `
        margin-right: 8px;
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 4px;
    `;

    const saveButton = document.createElement('button');
    saveButton.textContent = '保存';
    saveButton.style.cssText = `
        padding: 5px 10px;
        background: #1a73e8;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;

    saveButton.onclick = () => {
        userName = input.value;
        localStorage.setItem('meetTranscriptUserName', userName);
        alert('名前を保存しました！');
    };

    container.appendChild(input);
    container.appendChild(saveButton);
    document.body.appendChild(container);
    return container;
}

// UIの表示/非表示を切り替える関数
function toggleUserNameInput() {
    if (!userNameContainer) {
        userNameContainer = createUserNameInput();
    }
    
    if (userNameContainer.style.display === 'none') {
        userNameContainer.style.display = 'block';
    } else {
        userNameContainer.style.display = 'none';
    }
}

// Chromeからのメッセージを受け取るリスナー
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleUserNameInput') {
        toggleUserNameInput();
    }
});

// APIにデータを送信する関数
async function sendToAPI(transcripts) {
    if (transcripts.size === 0) return;
    
    const transcriptsArray = Array.from(transcripts.values());
    let sendDataArray = new Array();
    
    transcriptsArray.forEach((element) => {
        // ユーザー名が自分の場合は、保存された名前を使用
        const displayName = element.user === 'あなた' ? userName : element.user;
        sendDataArray.push({
            meetId: meetId,
            userName: displayName,
            transcript: element.transcript,
            timestamp: new Date().toISOString()
        })
    })
    console.log('Attempting to send to API:', transcriptsArray);
    try {
        const response = await fetch('https://zenn-hackathon-2025-backend-666593730950.asia-northeast1.run.app/save_transcript', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sendDataArray)
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
createUserNameInput(); // UIを作成するが、初期状態では非表示
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