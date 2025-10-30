"use client"

import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { aiService } from '@/services/ai';

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  language?: string;
  buttonVariant?: 'default' | 'outline' | 'ghost';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
}

export function VoiceRecorder({
  onTranscriptionComplete,
  language = 'es',
  buttonVariant = 'outline',
  buttonSize = 'default',
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

        // Detener todos los tracks
        stream.getTracks().forEach(track => track.stop());

        // Procesar transcripción
        await processTranscription(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      alert('No se pudo acceder al micrófono. Por favor verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processTranscription = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      // Convertir webm a formato aceptado (mp3, mp4, wav, etc.)
      // Por ahora enviamos el webm directamente
      const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });

      const result = await aiService.transcribeAudio(audioFile, language);

      if (result.text) {
        onTranscriptionComplete(result.text);
      }
    } catch (error: any) {
      console.error('Error en transcripción:', error);
      alert(`Error al transcribir: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <Button variant={buttonVariant} size={buttonSize} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
        {buttonSize !== 'icon' && <span className="ml-2">Procesando...</span>}
      </Button>
    );
  }

  if (isRecording) {
    return (
      <Button
        variant="destructive"
        size={buttonSize}
        onClick={stopRecording}
        className="animate-pulse"
      >
        <Square className="h-4 w-4" />
        {buttonSize !== 'icon' && <span className="ml-2">Detener</span>}
      </Button>
    );
  }

  return (
    <Button variant={buttonVariant} size={buttonSize} onClick={startRecording}>
      <Mic className="h-4 w-4" />
      {buttonSize !== 'icon' && <span className="ml-2">Grabar</span>}
    </Button>
  );
}
