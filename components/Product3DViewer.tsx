'use client';

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import { AlertCircle, Rotate3D } from 'lucide-react';
import type { ModelViewerElement } from '@google/model-viewer';

export type ARActivationResult =
  | 'started'
  | 'unsupported'
  | 'ios-model-missing'
  | 'model-unavailable'
  | 'failed';

export type ProductViewerState =
  | 'loading'
  | 'ready-ar'
  | 'ready-3d'
  | 'image-only'
  | 'error';

type ARFeedback = {
  kind: 'error' | 'tracking';
  message: string;
} | null;

export interface ModelViewerRefHandle {
  activateAR: () => Promise<ARActivationResult>;
  canActivateAR: () => boolean;
}

interface Product3DViewerProps {
  model3dUrl?: string;
  iosModelUrl?: string;
  imageUrl: string;
  dishName: string;
  accentColor?: string;
  dimensions?: {
    widthMeters: number;
    heightMeters: number;
    depthMeters: number;
  };
  onViewerStateChange?: (state: ProductViewerState) => void;
}

type ModelViewerReactProps = React.HTMLAttributes<ModelViewerElement> & {
  ref?: React.Ref<ModelViewerElement>;
  src: string;
  'ios-src'?: string;
  alt: string;
  'camera-controls'?: boolean;
  'touch-action'?: string;
  ar?: boolean;
  'ar-modes'?: string;
  'ar-scale'?: string;
  'ar-placement'?: string;
  'shadow-intensity'?: string;
  'shadow-softness'?: string;
  exposure?: string;
  'environment-image'?: string;
  'interaction-prompt'?: string;
  'interaction-prompt-threshold'?: string;
  'auto-rotate'?: boolean;
  'auto-rotate-delay'?: string;
  'rotation-per-second'?: string;
  'camera-orbit'?: string;
  'min-camera-orbit'?: string;
  'max-camera-orbit'?: string;
};

const ModelViewerTag = 'model-viewer' as React.ElementType<ModelViewerReactProps>;

function logARDiagnostic(event: string, details: Record<string, unknown>) {
  console.info(`[DishAR AR] ${event}`, details);
}

function isIOSDevice() {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

export const Product3DViewer = forwardRef<ModelViewerRefHandle, Product3DViewerProps>(
  (
    {
      model3dUrl,
      iosModelUrl,
      imageUrl,
      dishName,
      accentColor = '#43f4a6',
      dimensions,
      onViewerStateChange,
    },
    ref,
  ) => {
    const modelViewerRef = useRef<ModelViewerElement | null>(null);
    const [isModuleReady, setIsModuleReady] = useState(false);
    const [isLoading, setIsLoading] = useState(Boolean(model3dUrl));
    const [progress, setProgress] = useState(0);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isUserInteracting, setIsUserInteracting] = useState(false);
    const [arFeedback, setARFeedback] = useState<ARFeedback>(null);
    const arModes = iosModelUrl
      ? 'webxr scene-viewer quick-look'
      : 'webxr scene-viewer';

    useEffect(() => {
      let isMounted = true;

      import('@google/model-viewer')
        .then(() => {
          if (isMounted) {
            setIsModuleReady(true);
            logARDiagnostic('module-ready', {
              secureContext: window.isSecureContext,
              pageUrl: window.location.href,
              webXRAvailable: 'xr' in navigator,
              userAgent: navigator.userAgent,
            });
          }
        })
        .catch((error: unknown) => {
          console.error('[DishAR AR] module-error', error);
          if (isMounted) {
            setIsLoading(false);
            setHasError(true);
            setErrorMessage('Não foi possível inicializar o visualizador 3D.');
            onViewerStateChange?.('error');
          }
        });

      return () => {
        isMounted = false;
      };
    }, [onViewerStateChange]);

    useEffect(() => {
      const viewer = modelViewerRef.current;
      if (!viewer || !isModuleReady) return;

      const handleLoad = () => {
        setIsLoading(false);
        setHasError(false);
        setProgress(100);
        onViewerStateChange?.(viewer.canActivateAR ? 'ready-ar' : 'ready-3d');
        logARDiagnostic('model-loaded', {
          modelUrl: viewer.src,
          arModes,
          arPlacement: viewer.getAttribute('ar-placement'),
          arScale: viewer.getAttribute('ar-scale'),
          canActivateAR: viewer.canActivateAR,
          secureContext: window.isSecureContext,
          webXRAvailable: 'xr' in navigator,
        });
      };

      const handleProgress = (event: Event) => {
        const { totalProgress = 0 } = (
          event as CustomEvent<{ totalProgress?: number }>
        ).detail ?? {};
        setProgress(Math.round(totalProgress * 100));
      };

      const handleError = (event: Event) => {
        console.error('[DishAR AR] model-error', {
          modelUrl: model3dUrl,
          event,
        });
        setIsLoading(false);
        setHasError(true);
        setErrorMessage('Não foi possível carregar o modelo 3D. Exibindo a foto do prato.');
        onViewerStateChange?.('error');
      };

      const handleCameraChange = () => setIsUserInteracting(true);

      const handleARStatus = (event: Event) => {
        const status = (event as CustomEvent<{ status?: string }>).detail?.status;
        const logger = status === 'failed' ? console.error : console.info;
        logger('[DishAR AR] ar-status', { status });

        if (status === 'failed') {
          setARFeedback({
            kind: 'error',
            message:
              'Não foi possível iniciar a realidade aumentada. Verifique se seu aparelho é compatível e tente novamente.',
          });
        }
      };

      const handleARTracking = (event: Event) => {
        const status = (event as CustomEvent<{ status?: string }>).detail?.status;
        const logger = status === 'not-tracking' ? console.warn : console.info;
        logger('[DishAR AR] ar-tracking', { status });

        if (status === 'not-tracking') {
          setARFeedback({
            kind: 'tracking',
            message:
              'Não encontramos uma superfície estável. Mova o celular lentamente sobre uma mesa bem iluminada.',
          });
        } else if (status === 'tracking') {
          setARFeedback(null);
        }
      };

      const handleVisibilityChange = () => {
        logARDiagnostic('page-visibility', {
          visibilityState: document.visibilityState,
        });
      };

      viewer.addEventListener('load', handleLoad);
      viewer.addEventListener('progress', handleProgress);
      viewer.addEventListener('error', handleError);
      viewer.addEventListener('camera-change', handleCameraChange);
      viewer.addEventListener('ar-status', handleARStatus);
      viewer.addEventListener('ar-tracking', handleARTracking);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        viewer.removeEventListener('load', handleLoad);
        viewer.removeEventListener('progress', handleProgress);
        viewer.removeEventListener('error', handleError);
        viewer.removeEventListener('camera-change', handleCameraChange);
        viewer.removeEventListener('ar-status', handleARStatus);
        viewer.removeEventListener('ar-tracking', handleARTracking);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, [arModes, isModuleReady, model3dUrl, onViewerStateChange]);

    useImperativeHandle(
      ref,
      () => ({
        activateAR: async () => {
          setARFeedback(null);
          logARDiagnostic('activation-requested', {
            modelUrl: model3dUrl,
            arModes,
            secureContext: window.isSecureContext,
            webXRAvailable: 'xr' in navigator,
            canActivateAR: Boolean(modelViewerRef.current?.canActivateAR),
          });

          if (!model3dUrl || hasError) {
            console.error('[DishAR AR] activation-blocked', {
              reason: 'model-unavailable',
            });
            return 'model-unavailable';
          }
          if (isIOSDevice() && !iosModelUrl) {
            console.warn('[DishAR AR] activation-blocked', {
              reason: 'ios-model-missing',
            });
            return 'ios-model-missing';
          }

          const viewer = modelViewerRef.current;
          if (!viewer?.canActivateAR || typeof viewer.activateAR !== 'function') {
            console.warn('[DishAR AR] activation-blocked', {
              reason: 'unsupported',
            });
            return 'unsupported';
          }

          try {
            await viewer.activateAR();
            logARDiagnostic('activation-dispatched', { arModes });
            return 'started';
          } catch (error: unknown) {
            console.error('[DishAR AR] activation-error', error);
            return 'failed';
          }
        },
        canActivateAR: () => Boolean(modelViewerRef.current?.canActivateAR),
      }),
      [arModes, hasError, iosModelUrl, model3dUrl],
    );

    const has3DModel = Boolean(model3dUrl && isModuleReady && !hasError);

    return (
      <div className="product-3d-stage">
        {model3dUrl && isModuleReady && !hasError && (
          <ModelViewerTag
            ref={modelViewerRef}
            src={model3dUrl}
            ios-src={iosModelUrl}
            alt={`Modelo 3D do prato ${dishName}`}
            camera-controls
            touch-action="pan-y"
            ar
            ar-modes={arModes}
            ar-scale="fixed"
            ar-placement="floor"
            shadow-intensity="1.2"
            shadow-softness="0.75"
            exposure="1.05"
            environment-image="neutral"
            interaction-prompt="auto"
            interaction-prompt-threshold="1500"
            auto-rotate
            auto-rotate-delay="3000"
            rotation-per-second="18deg"
            camera-orbit="0deg 75deg 105%"
            min-camera-orbit="auto 20deg 70%"
            max-camera-orbit="auto 95deg 150%"
            style={
              {
                width: '100%',
                height: '100%',
                backgroundColor: 'transparent',
                outline: 'none',
                '--poster-color': 'transparent',
              } as React.CSSProperties & { '--poster-color': string }
            }
          >
            {arFeedback && (
              <output
                className={`viewer-ar-feedback viewer-ar-feedback-${arFeedback.kind}`}
                aria-live={arFeedback.kind === 'error' ? 'assertive' : 'polite'}
              >
                <AlertCircle aria-hidden="true" />
                <span>{arFeedback.message}</span>
              </output>
            )}
          </ModelViewerTag>
        )}

        {model3dUrl && !hasError && isLoading && (
          <div className="viewer-loading-overlay" aria-live="polite">
            <div className="loading-content">
              <div
                className="loading-spinner-ring"
                style={{ borderColor: `${accentColor}33`, borderTopColor: accentColor }}
              />
              <p className="loading-title">Preparando visualização 3D...</p>
              {progress > 0 && <span className="loading-percent">{progress}%</span>}
            </div>
          </div>
        )}

        {(!model3dUrl || hasError) && (
          <div className="viewer-fallback-container">
            <Image
              src={imageUrl}
              alt={dishName}
              width={1254}
              height={1254}
              className="viewer-fallback-image"
            />
            {hasError && (
              <output className="viewer-error-banner">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>{errorMessage}</span>
              </output>
            )}
          </div>
        )}

        {has3DModel && !isLoading && !arFeedback && (
          <div className={`viewer-interaction-hint ${isUserInteracting ? 'hint-dimmed' : ''}`}>
            <Rotate3D className="hint-icon" />
            <span>Arraste para girar 360°</span>
          </div>
        )}

        {has3DModel && dimensions && !isLoading && (
          <div className="viewer-dimensions-tag">
            <span>
              Dimensão real: {(dimensions.widthMeters * 100).toFixed(0)} ×{' '}
              {(dimensions.heightMeters * 100).toFixed(0)} ×{' '}
              {(dimensions.depthMeters * 100).toFixed(0)} cm
            </span>
          </div>
        )}
      </div>
    );
  },
);

Product3DViewer.displayName = 'Product3DViewer';
