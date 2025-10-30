"use client";

export default function Page() {
  const pageName = "Facturación y Cobros";
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{pageName}</h2>
        <p className="text-muted-foreground mt-2">
          Esta funcionalidad está en desarrollo
        </p>
      </div>
      <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">Contenido próximamente...</p>
      </div>
    </div>
  );
}
