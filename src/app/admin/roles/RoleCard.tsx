"use client";

import { useState, useEffect } from "react";
import { RolUsuario } from "@prisma/client";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronUp,
  Save,
  RotateCcw,
  Check,
  Loader2,
} from "lucide-react";
import {
  getPermissionsForRole,
  updateRolePermissions,
  resetRolePermissions,
} from "@/app/actions/permissions";

interface Permission {
  code: string;
  label: string;
  section: string;
  type: "page" | "action";
}

interface RoleCardProps {
  rol: RolUsuario;
  nombre: string;
  descripcion: string;
  color: string;
  permissionsBySection: Record<string, Permission[]>;
}

export default function RoleCard({
  rol,
  nombre,
  descripcion,
  color,
  permissionsBySection,
}: RoleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [originalPermissions, setOriginalPermissions] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (expanded && permissions.length === 0) {
      loadPermissions();
    }
  }, [expanded]);

  useEffect(() => {
    const changed =
      permissions.length !== originalPermissions.length ||
      permissions.some((p) => !originalPermissions.includes(p));
    setHasChanges(changed);
  }, [permissions, originalPermissions]);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const perms = await getPermissionsForRole(rol);
      setPermissions(perms);
      setOriginalPermissions(perms);
    } catch (error) {
      toast.error("Error al cargar permisos");
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (code: string) => {
    setPermissions((prev) =>
      prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code]
    );
  };

  const toggleSection = (section: string, enable: boolean) => {
    const sectionPerms =
      permissionsBySection[section]?.map((p) => p.code) || [];
    if (enable) {
      setPermissions((prev) => [...new Set([...prev, ...sectionPerms])]);
    } else {
      setPermissions((prev) => prev.filter((p) => !sectionPerms.includes(p)));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateRolePermissions(rol, permissions);
      setOriginalPermissions(permissions);
      toast.success(`Permisos de ${nombre} actualizados`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al guardar permisos"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !confirm(`¿Resetear permisos de ${nombre} a los valores por defecto?`)
    ) {
      return;
    }
    setSaving(true);
    try {
      await resetRolePermissions(rol);
      await loadPermissions();
      toast.success(`Permisos de ${nombre} reseteados`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al resetear permisos"
      );
    } finally {
      setSaving(false);
    }
  };

  const colorClasses = {
    zinc: {
      bg: "bg-slate-50 dark:bg-slate-900",
      text: "text-slate-600 dark:text-slate-400",
      border: "border-slate-200 dark:border-slate-800",
      badge:
        "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-900/30",
      badge:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/30",
    },
  };

  const colors =
    colorClasses[color as keyof typeof colorClasses] || colorClasses.zinc;

  return (
    <div
      className={`bg-white dark:bg-slate-900 border rounded-2xl transition-all duration-300 ${
        expanded
          ? "shadow-md border-blue-200 dark:border-blue-800 ring-1 ring-blue-100 dark:ring-blue-900/20"
          : "shadow-sm border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800"
      }`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors rounded-2xl"
      >
        <div className="flex items-center gap-4">
          <div
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border flex items-center gap-2 ${colors.badge}`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                color === "blue" ? "bg-blue-500" : "bg-slate-500"
              }`}
            ></div>
            {nombre}
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {descripcion}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-100 dark:border-amber-900/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Cambios sin guardar
            </span>
          )}
          <div
            className={`p-2 rounded-full transition-colors ${
              expanded
                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </button>

      {/* Content */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-800">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Cargando permisos...
              </p>
            </div>
          ) : (
            <>
              {/* Sections */}
              <div className="p-6 space-y-8">
                {Object.entries(permissionsBySection).map(
                  ([section, perms]) => {
                    const sectionCodes = perms.map((p) => p.code);
                    const allSelected = sectionCodes.every((c) =>
                      permissions.includes(c)
                    );
                    const someSelected =
                      !allSelected &&
                      sectionCodes.some((c) => permissions.includes(c));

                    return (
                      <div
                        key={section}
                        className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-5 border border-slate-100/50 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200/50 dark:border-slate-700/50">
                          <button
                            onClick={() => toggleSection(section, !allSelected)}
                            className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all duration-200 ${
                              allSelected
                                ? "bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-900 shadow-sm hover:bg-slate-800 dark:hover:bg-slate-200"
                                : someSelected
                                ? "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white shadow-sm"
                                : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            {allSelected && <Check className="w-3.5 h-3.5" />}
                            {someSelected && (
                              <div className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-300 rounded-sm" />
                            )}
                          </button>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                              {section}
                            </h4>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">
                              {
                                permissions.filter((p) =>
                                  sectionCodes.includes(p)
                                ).length
                              }{" "}
                              de {sectionCodes.length} activos
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {perms.map((perm) => (
                            <label
                              key={perm.code}
                              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 select-none ${
                                permissions.includes(perm.code)
                                  ? "bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900 shadow-sm ring-1 ring-blue-500/10 dark:ring-blue-400/20"
                                  : "bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700"
                              }`}
                            >
                              <div
                                className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                  permissions.includes(perm.code)
                                    ? "bg-blue-500 dark:bg-blue-600 border-blue-500 dark:border-blue-600 text-white"
                                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                                }`}
                              >
                                {permissions.includes(perm.code) && (
                                  <Check className="w-3 h-3" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span
                                    className={`text-sm font-medium ${
                                      permissions.includes(perm.code)
                                        ? "text-slate-900 dark:text-slate-100"
                                        : "text-slate-600 dark:text-slate-400"
                                    }`}
                                  >
                                    {perm.label}
                                  </span>
                                </div>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  <span
                                    className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border ${
                                      perm.type === "page"
                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30"
                                        : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"
                                    }`}
                                  >
                                    {perm.type === "page" ? "Vista" : "Acción"}
                                  </span>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* Actions */}
              <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between rounded-b-2xl">
                <button
                  onClick={handleReset}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restaurar valores
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-slate-200 dark:shadow-slate-900 transition-all hover:scale-105 active:scale-95"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Guardar Cambios
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
