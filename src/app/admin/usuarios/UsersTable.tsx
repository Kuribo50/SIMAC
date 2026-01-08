"use client";

import { useState } from "react";
import { RolUsuario } from "@prisma/client";
import {
  toggleUserStatus,
  deleteUser,
  resetPassword,
  changeUserRole,
} from "../../actions/auth";
import { toast } from "sonner";
import {
  MoreVertical,
  Key,
  UserX,
  UserCheck,
  Trash2,
  Shield,
  AlertTriangle,
  UserCog,
} from "lucide-react";

type User = {
  id: string;
  email: string;
  name: string | null;
  rut: string | null;
  cargo: string | null;
  rol: RolUsuario;
  activo: boolean;
  createdAt: Date;
};

interface UsersTableProps {
  users: User[];
  currentUserId: string;
}

export default function UsersTable({ users, currentUserId }: UsersTableProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [resetModal, setResetModal] = useState<User | null>(null);
  const [deleteModal, setDeleteModal] = useState<User | null>(null);
  const [roleModal, setRoleModal] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<RolUsuario>("VISUALIZADOR");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const getRolBadge = (rol: RolUsuario) => {
    switch (rol) {
      case "ADMINISTRADOR":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30";
      case "REGISTRADOR":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/30";
      case "VISUALIZADOR":
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      await toggleUserStatus(userId);
      toast.success("Estado actualizado");
      setOpenMenu(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al cambiar estado"
      );
    }
  };

  const handleResetPassword = async () => {
    if (!resetModal || !newPassword) return;

    setLoading(true);
    try {
      await resetPassword(resetModal.id, newPassword);
      toast.success("Contraseña actualizada");
      setResetModal(null);
      setNewPassword("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al cambiar contraseña"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;

    setLoading(true);
    try {
      await deleteUser(deleteModal.id);
      toast.success("Usuario eliminado");
      setDeleteModal(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar usuario"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (!roleModal) return;

    setLoading(true);
    try {
      await changeUserRole(roleModal.id, selectedRole);
      toast.success(`Rol cambiado a ${selectedRole}`);
      setRoleModal(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al cambiar rol"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Cargo
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <p
                      className={`font-medium ${
                        user.activo
                          ? "text-slate-900 dark:text-slate-100"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {user.name || "Sin nombre"}
                      {user.id === currentUserId && (
                        <span className="ml-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                          Tú
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {user.email}
                    </p>
                    {user.rut && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        RUT: {user.rut}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border ${getRolBadge(
                      user.rol
                    )}`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    {user.rol}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.activo ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {user.cargo || (
                    <span className="text-slate-400 dark:text-slate-500 italic">
                      No especificado
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right relative">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === user.id ? null : user.id)
                    }
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {/* Dropdown Menu */}
                  {openMenu === user.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenu(null)}
                      />
                      <div className="absolute right-8 top-8 mt-1 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl z-20 overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/10">
                        <div className="p-1">
                          <button
                            onClick={() => {
                              setResetModal(user);
                              setOpenMenu(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg flex items-center gap-2.5 transition-colors"
                          >
                            <Key className="w-4 h-4 text-slate-400" />
                            Reiniciar Contraseña
                          </button>
                          {user.id !== currentUserId && (
                            <>
                              <button
                                onClick={() => {
                                  setRoleModal(user);
                                  setSelectedRole(user.rol);
                                  setOpenMenu(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg flex items-center gap-2.5 transition-colors"
                              >
                                <UserCog className="w-4 h-4 text-slate-400" />
                                Cambiar Rol
                              </button>
                              <button
                                onClick={() => handleToggleStatus(user.id)}
                                className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg flex items-center gap-2.5 transition-colors"
                              >
                                {user.activo ? (
                                  <>
                                    <UserX className="w-4 h-4 text-slate-400" />
                                    Desactivar
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4 text-slate-400" />
                                    Activar
                                  </>
                                )}
                              </button>
                              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                              <button
                                onClick={() => {
                                  setDeleteModal(user);
                                  setOpenMenu(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2.5 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md mx-4 rounded-2xl shadow-xl">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Reiniciar Contraseña
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Cambiar contraseña de {resetModal.name || resetModal.email}
              </p>
            </div>
            <div className="p-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nueva Contraseña
              </label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ingresa la nueva contraseña"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 rounded-b-2xl">
              <button
                onClick={() => {
                  setResetModal(null);
                  setNewPassword("");
                }}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetPassword}
                disabled={!newPassword || loading}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md mx-4 rounded-2xl shadow-xl">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Eliminar Usuario
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-slate-600 dark:text-slate-300">
                ¿Estás seguro de que deseas eliminar al usuario{" "}
                <strong>{deleteModal.name || deleteModal.email}</strong>?
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 rounded-b-2xl">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {roleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md mx-4 rounded-2xl shadow-xl">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <UserCog className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Cambiar Rol
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {roleModal.name || roleModal.email}
                </p>
              </div>
            </div>
            <div className="p-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Selecciona el nuevo rol
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="radio"
                    name="role"
                    value="VISUALIZADOR"
                    checked={selectedRole === "VISUALIZADOR"}
                    onChange={(e) =>
                      setSelectedRole(e.target.value as RolUsuario)
                    }
                    className="w-4 h-4 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
                  />
                  <div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded">
                      <Shield className="w-3 h-3" />
                      VISUALIZADOR
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Solo puede ver información
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="radio"
                    name="role"
                    value="REGISTRADOR"
                    checked={selectedRole === "REGISTRADOR"}
                    onChange={(e) =>
                      setSelectedRole(e.target.value as RolUsuario)
                    }
                    className="w-4 h-4 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
                  />
                  <div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border border-blue-200 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <Shield className="w-3 h-3" />
                      REGISTRADOR
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Puede ver y registrar mantenciones
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="radio"
                    name="role"
                    value="ADMINISTRADOR"
                    checked={selectedRole === "ADMINISTRADOR"}
                    onChange={(e) =>
                      setSelectedRole(e.target.value as RolUsuario)
                    }
                    className="w-4 h-4 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
                  />
                  <div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded">
                      <Shield className="w-3 h-3" />
                      ADMINISTRADOR
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Acceso completo al sistema
                    </p>
                  </div>
                </label>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 rounded-b-2xl">
              <button
                onClick={() => setRoleModal(null)}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangeRole}
                disabled={loading || selectedRole === roleModal.rol}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
