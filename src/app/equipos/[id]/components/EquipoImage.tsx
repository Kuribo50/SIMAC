"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateEquipo } from "../../../actions";
import Image from "next/image";

interface EquipoImageProps {
  equipoId: string;
  imageUrl: string | null;
  nombre: string;
}

export default function EquipoImage({
  equipoId,
  imageUrl,
  nombre,
}: EquipoImageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor seleccione una imagen válida");
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 5MB");
      return;
    }

    try {
      setLoading(true);

      // Convertir a base64 para almacenar directamente
      // En producción, deberías subir a un servicio como S3, Cloudinary, etc.
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setPreviewUrl(base64);

        try {
          await updateEquipo(equipoId, { imageUrl: base64 });
          toast.success("Imagen actualizada correctamente");
          router.refresh();
        } catch (error) {
          console.error(error);
          toast.error("Error al guardar la imagen");
          setPreviewUrl(imageUrl);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      toast.error("Error al procesar la imagen");
      setLoading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!previewUrl) return;

    try {
      setLoading(true);
      await updateEquipo(equipoId, { imageUrl: "" });
      setPreviewUrl(null);
      toast.success("Imagen eliminada");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar la imagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-700 shadow-sm border border-slate-200">
          <img
            src={previewUrl}
            alt={nombre}
            className="w-full h-full object-cover"
          />
          {/* Overlay con botones */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="px-4 py-2 bg-white text-slate-900 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-lg"
            >
              {loading ? "Cargando..." : "Cambiar"}
            </button>
            <button
              onClick={handleRemoveImage}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 shadow-lg"
            >
              Eliminar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="w-full aspect-video rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500 transition-all flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50/50"
        >
          {loading ? (
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <>
              <svg
                className="w-10 h-10 text-slate-400 group-hover:text-blue-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Agregar imagen
              </span>
              <span className="text-xs text-slate-400">
                JPG, PNG o GIF (máx. 5MB)
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
