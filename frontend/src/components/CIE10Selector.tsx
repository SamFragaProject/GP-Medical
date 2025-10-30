"use client"

import React, { useState, useEffect } from 'react';
import { Search, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { recetasService, CodigoCIE10 } from '@/services/recetas';

interface CIE10SelectorProps {
  onSelect: (codigo: CodigoCIE10) => void;
  valorActual?: CodigoCIE10 | null;
  onClear?: () => void;
}

export function CIE10Selector({ onSelect, valorActual, onClear }: CIE10SelectorProps) {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<CodigoCIE10[]>([]);
  const [frecuentes, setFrecuentes] = useState<CodigoCIE10[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Cargar códigos frecuentes al montar
  useEffect(() => {
    cargarFrecuentes();
  }, []);

  // Buscar cuando cambie el término (con debounce)
  useEffect(() => {
    if (busqueda.length >= 2) {
      const timer = setTimeout(() => {
        buscarCodigos();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setResultados([]);
    }
  }, [busqueda]);

  const cargarFrecuentes = async () => {
    try {
      const datos = await recetasService.obtenerCIE10Frecuentes(15);
      setFrecuentes(datos);
    } catch (error) {
      console.error('Error cargando CIE-10 frecuentes:', error);
    }
  };

  const buscarCodigos = async () => {
    if (busqueda.length < 2) return;

    setBuscando(true);
    try {
      const datos = await recetasService.buscarCIE10(busqueda, 20);
      setResultados(datos.resultados);
      setMostrarResultados(true);
    } catch (error) {
      console.error('Error buscando CIE-10:', error);
    } finally {
      setBuscando(false);
    }
  };

  const handleSelect = (codigo: CodigoCIE10) => {
    onSelect(codigo);
    setBusqueda('');
    setResultados([]);
    setMostrarResultados(false);
  };

  const handleClear = () => {
    setBusqueda('');
    setResultados([]);
    setMostrarResultados(false);
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="space-y-4">
      {/* Valor actual seleccionado */}
      {valorActual && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="default">{valorActual.codigo}</Badge>
                <Badge variant="outline">{valorActual.categoria}</Badge>
              </div>
              <p className="text-sm font-medium text-blue-900">
                {valorActual.nombre}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Buscador */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar código CIE-10 (ej: J00, lumbalgia, diabetes...)"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onFocus={() => setMostrarResultados(true)}
            className="pl-10"
          />
          {buscando && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {/* Resultados de búsqueda */}
        {mostrarResultados && busqueda.length >= 2 && (
          <div className="border rounded-lg max-h-64 overflow-y-auto bg-white shadow-lg">
            {resultados.length > 0 ? (
              <div className="divide-y">
                {resultados.map((codigo) => (
                  <button
                    key={codigo.codigo}
                    onClick={() => handleSelect(codigo)}
                    className="w-full text-left p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">
                        {codigo.codigo}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 break-words">
                          {codigo.nombre}
                        </p>
                        <p className="text-xs text-gray-500">{codigo.categoria}</p>
                      </div>
                      {codigo.frecuente && (
                        <Badge variant="success" className="text-xs">
                          Frecuente
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No se encontraron resultados</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Códigos frecuentes */}
      {!valorActual && busqueda.length === 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Códigos más frecuentes en Medicina del Trabajo:
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {frecuentes.map((codigo) => (
              <button
                key={codigo.codigo}
                onClick={() => handleSelect(codigo)}
                className="text-left p-2 border rounded hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">
                    {codigo.codigo}
                  </Badge>
                  <p className="text-sm flex-1">{codigo.nombre}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ayuda */}
      <div className="bg-gray-50 border rounded-lg p-3">
        <p className="text-xs text-gray-600">
          <strong>Tip:</strong> Puedes buscar por código (ej: J00, M54.5) o por
          término (ej: lumbalgia, diabetes, rinofaringitis). El sistema muestra
          los códigos más frecuentes en Medicina del Trabajo.
        </p>
      </div>
    </div>
  );
}
