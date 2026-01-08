import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Almacena el último ID visto para detectar nuevos logs
let lastSeenId: string | null = null;

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Enviar heartbeat inicial
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
      );

      // Obtener el último log para inicializar
      const latestLog = await prisma.auditLog.findFirst({
        orderBy: { createdAt: "desc" },
      });

      if (latestLog) {
        lastSeenId = latestLog.id;
      }

      // Función para verificar nuevos logs
      const checkForNewLogs = async () => {
        try {
          const query: {
            orderBy: { createdAt: "desc" };
            take: number;
            where?: { id: { gt: string } };
          } = {
            orderBy: { createdAt: "desc" as const },
            take: 10,
          };

          if (lastSeenId) {
            query.where = { id: { gt: lastSeenId } };
          }

          const newLogs = await prisma.auditLog.findMany(query);

          if (newLogs.length > 0) {
            // Actualizar el último ID visto
            lastSeenId = newLogs[0].id;

            // Enviar cada log nuevo (en orden cronológico)
            for (const log of newLogs.reverse()) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "log", data: log })}\n\n`
                )
              );
            }
          }

          // Enviar heartbeat para mantener la conexión
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch (error) {
          console.error("Error checking for new logs:", error);
        }
      };

      // Verificar nuevos logs cada 2 segundos
      const interval = setInterval(checkForNewLogs, 2000);

      // Limpiar cuando se cierre la conexión
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
