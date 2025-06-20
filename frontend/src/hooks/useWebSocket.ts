import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useRef } from "react"

type WebSocketMessage = { type: string; data: string } | { type: "ping" }

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null)
  const queryClient = useQueryClient()

  // send helper
  const send = useCallback((msg: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg))
    }
  }, [])

  useEffect(() => {
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws`)
    wsRef.current = socket

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "ping" }))

      // keep‑alive
      const interval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "ping" }))
        } else {
          clearInterval(interval)
        }
      }, 15_000)
    }

    socket.onmessage = (e) => {
      let data: WebSocketMessage
      try {
        data = JSON.parse(e.data)
        console.log(data)
      } catch {
        console.error("[WS] bad JSON:", e.data)
        return
      }
      if (data.type === "ping") return

      switch (data.type) {
        case "event":
          if (data.data === "refresh_tasks") {
            console.log('refresh tasks')
            queryClient.invalidateQueries({ queryKey: ["tasks"] })
          }
      }
    }

    socket.onclose = () => console.warn("[WS] closed")
    socket.onerror = (err) => console.error("[WS] error", err)

    return () => {
      socket.close()
    }
  }, [])

  return { send }
}
