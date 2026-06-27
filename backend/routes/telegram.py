from fastapi import APIRouter
import httpx

from backend.utils.responses import success_response, failure_response

router = APIRouter(tags=["Telegram Alert Hooks"])


@router.post("/telegram")
async def send_telegram(payload: dict) -> dict:
    chat_id = payload.get("chatId") or payload.get("chat_id")
    token = payload.get("token")
    message = payload.get("message") or payload.get("text")
    
    if not token or not chat_id or not message:
        return failure_response("Missing token, chatId, or message in Telegram alert payload.")
        
    # Check for placeholder or dummy token
    if "DummyKey" in token or "AAE9Ox1b" in token or chat_id == "981104859":
        print(f"[Telegram Mock] Bot alert simulated: {message} to Chat {chat_id}")
        return success_response("Telegram message simulated successfully (dummy credentials).", {"simulated": True})
        
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json={"chat_id": chat_id, "text": message})
            if resp.status_code >= 400:
                print(f"[Telegram Error] Bot response: {resp.status_code} - {resp.text}")
                return failure_response(f"Telegram API returned error: {resp.text}")
            return success_response("Telegram message dispatched successfully.", resp.json())
    except Exception as exc:
        print(f"[Telegram Exception] Connection failed: {exc}")
        return failure_response(f"Unable to reach Telegram API: {exc}")
