"use client";

import { useEffect, useState, useRef } from "react";
import { Terminal, Play, Pause, Trash2, Circle } from "lucide-react";
import {
  ACTION_COLORS,
  ACTION_LABELS,
  ENTITY_LABELS,
  type AuditAction,
  type AuditEntity,
} from "@/lib/audit-constants";

interface LogEntry {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  entityName: string | null;
  details: string | null;
  createdAt: string;
}

export default function RealTimeConsole() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (isPaused) return;

    const eventSource = new EventSource("/api/logs/stream");
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "connected") {
          setIsConnected(true);
        } else if (data.type === "log") {
          setLogs((prev) => {
            // Evitar duplicados
            if (prev.some((l) => l.id === data.data.id)) {
              return prev;
            }
            // Mantener solo los últimos 50 logs
            const newLogs = [data.data, ...prev];
            return newLogs.slice(0, 50);
          });
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
      // Reconectar después de 3 segundos
      setTimeout(() => {
        if (!isPaused) {
          setLogs((prev) => prev); // Trigger re-render to reconnect
        }
      }, 3000);
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [isPaused]);

  // Auto-scroll al fondo cuando hay nuevos logs
  useEffect(() => {
    if (consoleRef.current && !isMinimized) {
      consoleRef.current.scrollTop = 0;
    }
  }, [logs, isMinimized]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getActionColor = (action: string) => {
    const colors = ACTION_COLORS[action as AuditAction];
    if (colors) {
      return colors;
    }
    return { bg: "bg-zinc-100", text: "text-zinc-600" };
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const togglePause = () => {
    if (!isPaused && eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setIsPaused(!isPaused);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg shadow-lg hover:bg-zinc-800 transition-colors"
        >
          <Terminal className="w-4 h-4" />
          <span className="text-sm font-medium">Consola</span>
          {logs.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-500 text-xs rounded-full">
              {logs.length}
            </span>
          )}
          <Circle
            className={`w-2 h-2 ${
              isConnected
                ? "text-emerald-400 fill-emerald-400"
                : "text-red-400 fill-red-400"
            }`}
          />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[500px] bg-zinc-900 rounded-lg shadow-2xl border border-zinc-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-medium text-white">
            Consola en Tiempo Real
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            <Circle
              className={`w-2 h-2 ${
                isConnected && !isPaused
                  ? "text-emerald-400 fill-emerald-400 animate-pulse"
                  : isPaused
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-red-400 fill-red-400"
              }`}
            />
            <span className="text-xs text-zinc-500">
              {isPaused
                ? "Pausado"
                : isConnected
                ? "Conectado"
                : "Desconectado"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={togglePause}
            className="p-1.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors"
            title={isPaused ? "Reanudar" : "Pausar"}
          >
            {isPaused ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={clearLogs}
            className="p-1.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors"
            title="Limpiar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors ml-2"
            title="Minimizar"
          >
            <span className="text-lg leading-none">−</span>
          </button>
        </div>
      </div>

      {/* Console Content */}
      <div
        ref={consoleRef}
        className="h-[300px] overflow-y-auto font-mono text-xs"
      >
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <Terminal className="w-8 h-8 mb-2 opacity-50" />
            <p>Esperando actividad...</p>
            <p className="text-xs mt-1">Los nuevos eventos aparecerán aquí</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {logs.map((log) => {
              const actionColor = getActionColor(log.action);
              return (
                <div
                  key={log.id}
                  className="px-3 py-2 hover:bg-zinc-800/50 transition-colors animate-fadeIn"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-zinc-500 shrink-0">
                      {formatTime(log.createdAt)}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${actionColor.bg} ${actionColor.text}`}
                    >
                      {ACTION_LABELS[log.action as AuditAction] || log.action}
                    </span>
                    <span className="text-zinc-300 break-all">
                      <span className="text-amber-400">
                        {log.userName || "Sistema"}
                      </span>
                      {" → "}
                      <span className="text-cyan-400">
                        {ENTITY_LABELS[log.entity as AuditEntity] || log.entity}
                      </span>
                      {log.entityName && (
                        <span className="text-zinc-400">
                          : {log.entityName}
                        </span>
                      )}
                    </span>
                  </div>
                  {log.details && (
                    <div className="mt-1 ml-16 text-zinc-500 text-[10px]">
                      {(() => {
                        try {
                          const details = JSON.parse(log.details);
                          return Object.entries(details)
                            .slice(0, 3)
                            .map(([key, value]) => (
                              <span key={key} className="mr-2">
                                {key}: {String(value)}
                              </span>
                            ));
                        } catch {
                          return log.details;
                        }
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 bg-zinc-800 border-t border-zinc-700 flex items-center justify-between">
        <span className="text-[10px] text-zinc-500">
          {logs.length} eventos en buffer
        </span>
        <span className="text-[10px] text-zinc-500">Actualización: 2s</span>
      </div>
    </div>
  );
}
