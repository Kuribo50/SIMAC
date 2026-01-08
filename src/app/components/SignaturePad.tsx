"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  onCancel: () => void;
  title?: string;
}

export default function SignaturePad({
  onSave,
  onCancel,
  title = "Firma",
}: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const clear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  };

  const save = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataURL = sigCanvas.current.toDataURL("image/png");
      onSave(dataURL);
    }
  };

  const handleEnd = () => {
    if (sigCanvas.current) {
      setIsEmpty(sigCanvas.current.isEmpty());
    }
  };

  return (
    <div className="bg-white rounded-sm p-6 border border-gray-200 animate-scale-in">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h3 className="text-lg font-bold text-black mb-1 font-mono">{title}</h3>
        <p className="text-xs text-gray-600 font-mono">
          Dibuje su firma en el área designada
        </p>
      </div>

      <div className="border border-gray-300 rounded-sm mb-4 bg-white overflow-hidden hover:border-gray-400 transition-colors">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: "w-full cursor-crosshair",
            style: { width: "100%", height: "220px", display: "block" },
          }}
          backgroundColor="#ffffff"
          penColor="#000000"
          onEnd={handleEnd}
          velocityFilterWeight={0.7}
          minWidth={1}
          maxWidth={2}
        />
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-sm p-3 mb-6">
        <p className="text-xs text-gray-600 font-mono flex items-center gap-2">
          <span className="text-blue-600">›</span>
          Use mouse o dispositivo táctil para firmar
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-mono text-gray-600 hover:text-gray-900 bg-transparent border border-gray-300 rounded-sm hover:border-gray-400 transition-all"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={clear}
          className="px-4 py-2 text-xs font-mono text-gray-700 bg-gray-100 border border-gray-300 rounded-sm hover:bg-gray-200 hover:border-gray-400 transition-all"
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={save}
          disabled={isEmpty}
          className="px-4 py-2 text-xs font-mono font-bold bg-blue-600 text-white border border-blue-700 rounded-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}
