import { useCallback } from 'react';
import { toast } from 'sonner';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface Toast {
  title: string;
  description: string;
  variant?: ToastType;
}

export const useNotification = () => {
  const playNotificationSound = useCallback(() => {
    // Solo reproducir sonido si hay interacción del usuario
    if (document.visibilityState === 'visible') {
      try {
        const audio = new Audio('/assets/notification.mp3');
        audio.volume = 0.5;
        
        // Intentar reproducir solo si hay interacción del usuario
        const promise = audio.play();
        if (promise !== undefined) {
          promise.catch(error => {
            // Silenciar el error si es por falta de interacción
            if (error.name !== 'NotAllowedError') {
              console.warn('Error al reproducir sonido:', error);
            }
          });
        }
      } catch (error) {
        console.warn('Error al cargar el sonido:', error);
      }
    }
  }, []);

  const showToast = useCallback((config: Toast) => {
    // Reproducir sonido
    playNotificationSound();

    // Mostrar toast
    switch (config.variant) {
      case 'success':
        toast.success(config.title, { description: config.description });
        break;
      case 'error':
        toast.error(config.title, { description: config.description });
        break;
      case 'warning':
        toast.warning(config.title, { description: config.description });
        break;
      default:
        toast.info(config.title, { description: config.description });
    }

    // Notificación del navegador si está permitida
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(config.title, {
        body: config.description,
        icon: '/assets/logo.png',
        badge: '/assets/logo.png'
      });
    }
  }, [playNotificationSound]);

  const showNotification = useCallback((title: string, message: string, type: ToastType = 'info') => {
    showToast({ title, description: message, variant: type });
  }, [showToast]);

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  }, []);

  return {
    playNotificationSound,
    showToast,
    showNotification,
    requestNotificationPermission
  };
};