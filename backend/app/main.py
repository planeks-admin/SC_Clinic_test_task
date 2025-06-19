import sentry_sdk
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from starlette.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from app.api.main import api_router
from app.core.config import settings
from app.core.ws_manager import manager


def custom_generate_unique_id(route: APIRoute) -> str:
    if route.tags:
        return f"{route.tags[0]}-{route.name}"
    from fastapi.routing import generate_unique_id as default_id
    return default_id(route)


if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)

# Set all CORS enabled origins
if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
):
    """
    WebSocket entrypoint.

    When a client sends {"type": "event", "data": "refresh_tasks"},
    broadcast a 'refresh_tasks' notification to all connected clients
    so they know to reload or re‑fetch their task lists.
    """
    await manager.connect(websocket)
    try:
        while True:
            message: dict = await websocket.receive_json()
            msg_type = message.get("type")
            msg_data = message.get("data")

            if msg_type == "event" and msg_data == "refresh_tasks":
                await manager.broadcast_events('refresh_tasks')

    except WebSocketDisconnect:
        manager.disconnect(websocket)
