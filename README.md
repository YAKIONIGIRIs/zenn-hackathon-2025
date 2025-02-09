# Meetiness
**Web会議のサポート**を行う**AIエージェント**

![Meetiness logo](https://raw.githubusercontent.com/YAKIONIGIRIs/meet-addon/refs/heads/main/meetiness_logo.png)


[AI Agent Hackathon with Google Cloud](https://zenn.dev/hackathons/2024-google-cloud-japan-ai-hackathon)提出作品

## ソースコードの内容
- `meet-transcription-extension`
  - Google MeetのトランスクリプトをDOMから取得し、サーバーに送信するためのChrome拡張機能のコード
- `meet-addon`
  - 前回のミーティングの要約や、進行中のミーティングの補足を行うMeetアドオンのコード
- `zenn-hackathon-2025-backend`
  - トランスクリプトの保存や要約、補足情報の生成などを行うサーバーのコード