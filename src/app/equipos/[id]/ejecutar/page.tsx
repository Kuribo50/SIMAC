import Link from "next/link";
import { notFound } from "next/navigation";
import { getEquipo } from "@/app/actions/equipos";
import { getPautasActivas } from "@/app/actions/pautas";
import ExecuteMaintenanceForm from "@/app/components/ExecuteMaintenanceForm";
import { PautaMantenimiento, PautaItem } from "@prisma/client";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pautaId?: string }>;
}

export default async function ExecutarMantencionPage({
  params,
  searchParams,
}: Props) {
  const { id: equipoId } = await params;
  const { pautaId } = await searchParams;

  const [equipo, pautas] = await Promise.all([
    getEquipo(equipoId),
    getPautasActivas(),
  ]);

  if (!equipo) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/equipos/${equipoId}`}
              className="text-zinc-600 hover:text-zinc-900 p-2 hover:bg-zinc-100 rounded-2xl transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">
                Ejecutar Mantención
              </h1>
              <p className="text-zinc-600">{equipo.nombre}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <ExecuteMaintenanceForm
          equipo={{
            id: equipo.id,
            nombre: equipo.nombre,
            modelo: equipo.modelo,
            serie: equipo.serie,
            marca: equipo.marca,
            inventario: equipo.inventario,
            ubicacion: {
              establecimiento: equipo.ubicacion.establecimiento,
              area: equipo.ubicacion.area,
            },
          }}
          pautas={pautas.map(
            (p: PautaMantenimiento & { items: PautaItem[] }) => ({
              id: p.id,
              codigo: p.codigo,
              nombre: p.nombre,
              items: p.items.map((i: PautaItem) => ({
                id: i.id,
                order: i.order,
                description: i.description,
                isRequired: i.isRequired,
              })),
            })
          )}
          preselectedPautaId={pautaId}
        />
      </main>
    </div>
  );
}
