from google.cloud import texttospeech


def text_to_speech(text, output_file="output.mp3", language_code="ja-JP", speaking_rate=1.2):
    """
    テキストを音声に変換する関数

    Args:
        text (str): 音声に変換したいテキスト
        output_file (str): 出力ファイル名
        language_code (str): 言語コード（デフォルトは日本語）
    """
    # クライアントのインスタンスを作成
    client = texttospeech.TextToSpeechClient()

    # 入力テキストの設定
    synthesis_input = texttospeech.SynthesisInput(text=text)

    # 音声の設定
    voice = texttospeech.VoiceSelectionParams(
        language_code=language_code, ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
    )

    # オーディオ設定
    audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3, speaking_rate=speaking_rate)

    # リクエストの実行
    response = client.synthesize_speech(input=synthesis_input, voice=voice, audio_config=audio_config)

    # 音声ファイルの保存
    with open(output_file, "wb") as out:
        out.write(response.audio_content)
        print(f"音声ファイルを保存しました: {output_file}")


# 使用例
if __name__ == "__main__":
    sample_text = "前回のミーティングの内容をおさらいします。3日前のミーティングでは、Google Cloudにおけるサーバレスなアーキテクチャ構成の案について議論しました。ネクストアクションとして、テスト実装を行うことが宮本さんのタスクになっていました。"
    text_to_speech(sample_text)
