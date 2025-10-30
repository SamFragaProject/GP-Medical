"use client"

import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  Database,
  Trash2,
  RefreshCw,
  BookOpen,
  Server,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { aiService } from '@/services/ai';

export default function ChatbotAdminPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    category: '',
    tags: '',
    collection_type: 'medical' as 'medical' | 'system',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Estado para búsqueda/testing
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingKB, setSearchingKB] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const kbStats = await aiService.getKBStats();
      setStats(kbStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      alert('Por favor selecciona un archivo');
      return;
    }

    if (!uploadData.title || !uploadData.category) {
      alert('Por favor completa título y categoría');
      return;
    }

    setLoading(true);
    try {
      await aiService.uploadDocument({
        file: selectedFile,
        collection_type: uploadData.collection_type,
        title: uploadData.title,
        category: uploadData.category,
        tags: uploadData.tags,
      });

      alert('Documento cargado exitosamente');

      // Limpiar formulario
      setUploadData({
        title: '',
        category: '',
        tags: '',
        collection_type: 'medical',
      });
      setSelectedFile(null);

      // Recargar stats
      loadStats();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchKB = async () => {
    if (!searchQuery.trim()) return;

    setSearchingKB(true);
    try {
      const result = await aiService.searchKB({
        query: searchQuery,
        collection_type: uploadData.collection_type,
        n_results: 5,
      });

      setSearchResults(result.results || []);
    } catch (error) {
      console.error('Error searching KB:', error);
      alert('Error al buscar en la base de conocimientos');
    } finally {
      setSearchingKB(false);
    }
  };

  const handleClearCollection = async (collectionType: 'medical' | 'system') => {
    if (
      !confirm(
        `¿Estás seguro de eliminar TODOS los documentos de la colección ${collectionType}? Esta acción NO se puede deshacer.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await aiService.clearCollection(collectionType);
      alert(`Colección ${collectionType} limpiada exitosamente`);
      loadStats();
    } catch (error: any) {
      console.error('Error clearing collection:', error);
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Entrenar Chatbot Médico</h1>
        <p className="text-gray-600 mt-1">
          Administra la base de conocimientos del asistente IA
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Documentos Médicos
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.medical_documents || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Fragmentos indexados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Documentos del Sistema
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.system_documents || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Fragmentos indexados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_documents || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Fragmentos totales
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cargar Documentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Cargar Nuevo Documento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Colección</Label>
              <Select
                value={uploadData.collection_type}
                onValueChange={(value: 'medical' | 'system') =>
                  setUploadData({ ...uploadData, collection_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Conocimiento Médico</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      <span>Documentación del Sistema</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {uploadData.collection_type === 'medical'
                  ? 'Guías clínicas, protocolos médicos, información de medicamentos, etc.'
                  : 'Manuales de usuario, guías de funcionalidades, FAQ del sistema, etc.'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={uploadData.title}
                onChange={(e) =>
                  setUploadData({ ...uploadData, title: e.target.value })
                }
                placeholder="Ej: Protocolo de Hipertensión Arterial"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Input
                id="category"
                value={uploadData.category}
                onChange={(e) =>
                  setUploadData({ ...uploadData, category: e.target.value })
                }
                placeholder="Ej: Cardiología, Medicina General, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (separados por coma)</Label>
              <Input
                id="tags"
                value={uploadData.tags}
                onChange={(e) =>
                  setUploadData({ ...uploadData, tags: e.target.value })
                }
                placeholder="Ej: hipertensión, cardiología, tratamiento"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Archivo (PDF, DOCX, TXT)</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
              />
              {selectedFile && (
                <p className="text-sm text-gray-600">
                  Archivo seleccionado: {selectedFile.name}
                </p>
              )}
            </div>

            <Button
              onClick={handleUploadDocument}
              disabled={loading || !selectedFile}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {loading ? 'Cargando...' : 'Cargar Documento'}
            </Button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Los documentos se procesan automáticamente
                y se dividen en fragmentos para búsqueda semántica. Este proceso
                puede tomar unos segundos.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Probar Base de Conocimientos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Probar Base de Conocimientos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Buscar en:</Label>
              <Select
                value={uploadData.collection_type}
                onValueChange={(value: 'medical' | 'system') =>
                  setUploadData({ ...uploadData, collection_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">
                    Conocimiento Médico
                  </SelectItem>
                  <SelectItem value="system">
                    Documentación del Sistema
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Consulta de prueba</Label>
              <Textarea
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej: ¿Cuál es el tratamiento para hipertensión arterial?"
                rows={3}
              />
            </div>

            <Button
              onClick={handleSearchKB}
              disabled={searchingKB || !searchQuery}
              className="w-full"
            >
              <Search className="h-4 w-4 mr-2" />
              {searchingKB ? 'Buscando...' : 'Buscar en KB'}
            </Button>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Resultados encontrados:</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 border rounded-lg p-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline">
                          {result.metadata?.category || 'Sin categoría'}
                        </Badge>
                        {result.distance !== null && (
                          <span className="text-xs text-gray-500">
                            Similaridad: {(1 - result.distance).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{result.text}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        <p>
                          <strong>Documento:</strong>{' '}
                          {result.metadata?.title || 'Sin título'}
                        </p>
                        {result.metadata?.tags && (
                          <p>
                            <strong>Tags:</strong>{' '}
                            {Array.isArray(result.metadata.tags)
                              ? result.metadata.tags.join(', ')
                              : result.metadata.tags}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.length === 0 && searchQuery && !searchingKB && (
              <div className="text-center text-gray-500 py-8">
                <p>No se encontraron resultados para esta consulta.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gestión de Colecciones */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Gestión de Colecciones (Peligroso)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 mb-4">
              <strong>Advertencia:</strong> Estas acciones son irreversibles.
              Se eliminarán TODOS los documentos de la colección seleccionada.
            </p>

            <div className="flex gap-4">
              <Button
                variant="destructive"
                onClick={() => handleClearCollection('medical')}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar Colección Médica
              </Button>

              <Button
                variant="destructive"
                onClick={() => handleClearCollection('system')}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar Colección Sistema
              </Button>

              <Button
                variant="outline"
                onClick={loadStats}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar Estadísticas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
