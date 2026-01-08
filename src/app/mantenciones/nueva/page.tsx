import {
  getEquipos,
  getEquipo,
  getPautas,
  getUbicaciones,
} from "../../actions";
import ScheduleMaintenanceForm from "./ScheduleMaintenanceForm";
import { redirect } from "next/navigation";

export default async function NewMaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const equipoId = resolvedSearchParams.equipoId as string | undefined;
  const fechaParam = resolvedSearchParams.fecha as string | undefined;

  const [equipos, pautas, ubicaciones] = await Promise.all([
    getEquipos(),
    getPautas(),
    getUbicaciones(),
  ]);

  // Obtener equipo inicial si viene en los params
  let equipoInicial = null;
  if (equipoId) {
    equipoInicial = await getEquipo(equipoId);
  }

  // Agrupar ubicaciones por establecimiento
  const ubicacionesPorEstablecimiento = ubicaciones.reduce((acc, ub) => {
    if (!acc[ub.establecimiento]) {
      acc[ub.establecimiento] = [];
    }
    acc[ub.establecimiento].push(ub);
    return acc;
  }, {} as Record<string, typeof ubicaciones>);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-slate-950 py-8 px-4">
      <ScheduleMaintenanceForm
        equipoInicial={equipoInicial}
        equipos={equipos}
        pautas={pautas as any}
        ubicacionesPorEstablecimiento={ubicacionesPorEstablecimiento}
        fechaInicial={fechaParam}
      />
    </div>
  );
}
