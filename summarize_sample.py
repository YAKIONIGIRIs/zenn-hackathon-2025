import sys

import vertexai
from vertexai.generative_models import GenerationConfig, GenerativeModel

# TODO(developer): Update and un-comment below line
PROJECT_ID = "ykongrs-zenn-hackathon-2025"
vertexai.init(project=PROJECT_ID, location="us-central1")

response_schema = {
    "type": "object",
    "properties": {
        "tts_summary": {
            "type": "string",
            "description": "A natural, conversational summary of the meeting suitable for text-to-speech",
        },
        "bullet_points": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Key points from the meeting in bullet point format",
        },
    },
    "required": ["tts_summary", "bullet_points"],
}

model = GenerativeModel("gemini-1.5-pro-002")


def summarize_meeting(meeting_file_path: str) -> dict:
    """
    テキストファイルから会議内容を読み込み、要約を生成する

    Args:
        meeting_file_path: 会議内容が記載されたテキストファイルのパス

    Returns:
        dict: 生成された要約（TTSサマリーと箇条書き）
    """
    try:
        with open(meeting_file_path, "r", encoding="utf-8") as f:
            meeting_content = f.read()
    except FileNotFoundError:
        print(f"エラー: ファイル '{meeting_file_path}' が見つかりません。")
        sys.exit(1)
    except Exception as e:
        print(f"エラー: ファイルの読み込み中にエラーが発生しました: {e}")
        sys.exit(1)

    response = model.generate_content(
        f"""以下の会議内容を要約してください：

{meeting_content}""",
        generation_config=GenerationConfig(response_mime_type="application/json", response_schema=response_schema),
    )

    return response.text


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("使用方法: python summarize_sample.py <meeting_file_path>")
        sys.exit(1)

    meeting_file_path = sys.argv[1]
    summary = summarize_meeting(meeting_file_path)
    print(summary)
