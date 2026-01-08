import { Suspense } from "react";
import NotificacionesContent from "./NotificacionesContent";
import { Bell } from "lucide-react";

export default function NotificacionesPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border border-zinc-200 mb-6 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-zinc-100 to-zinc-50 p-4 border-b border-zinc-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-200 rounded-2xl">
                <Bell className="w-6 h-6 text-zinc-700" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-wide text-zinc-900">
                  Centro de Notificaciones
                </h1>
                <p className="text-zinc-600 text-sm">
                  Mantenciones próximas, atrasadas y actualizaciones del sistema
                </p>
              </div>
            </div>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="bg-white p-8 border border-zinc-200 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-zinc-400 mx-auto"></div>
              <p className="mt-4 text-zinc-500">Cargando notificaciones...</p>
            </div>
          }
        >
          <NotificacionesContent />
        </Suspense>
      </div>
    </div>
  );
}
