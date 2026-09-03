'use client';

import React, { Suspense, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Box, Check, ScanLine, Users } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { Product3DViewer, type ModelViewerRefHandle } from '@/components/Product3DViewer';
import { DISHES, getDishById } from '@/lib/dishes';

function PratoDetailContent() {
  const searchParams = useSearchParams();
  const dishId = searchParams.get('id') || 'garage-double';
  const dish = getDishById(dishId) || DISHES[0];

  const viewerRef = useRef<ModelViewerRefHandle>(null);
  const [arNotice, setARNotice] = useState<string | null>(null);

  async function handleActivateAR() {
    if (!viewerRef.current) return;
    const result = await viewerRef.current.activateAR();
    if (result === 'started') {
      setARNotice(null);
      return;
    }

    if (result === 'unsupported') {
      setARNotice(
        'A Realidade Aumentada não está disponível neste navegador. Abra o link no Safari do iPhone ou no Chrome de um Android compatível.',
      );
      return;
    }

    if (result === 'ios-model-missing') {
      setARNotice(
        'Este prato ainda não possui o arquivo USDZ para iOS configurado.',
      );
      return;
    }

    setARNotice(
      'Não foi possível iniciar a realidade aumentada. Confira a iluminação e tente novamente.',
    );
  }

  return (
    <div className="prato-page-layout">
      {/* Top Nav */}
      <div className="prato-nav-top">
        <Link href="/demo" className="prato-voltar-btn">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao cardápio
        </Link>
        <BrandLogo size="sm" />
      </div>

      {/* Palco 3D do Prato */}
      <div className="prato-palco-box">
        <Product3DViewer
          key={dish.id}
          ref={viewerRef}
          model3dUrl={dish.model3dUrl}
          iosModelUrl={dish.iosModelUrl}
          imageUrl={dish.image}
          dishName={dish.name}
          dimensions={dish.dimensions}
          showHint
          showDimensions
        />
      </div>

      {/* Painel inferior com informações e botão AR */}
      <div className="prato-painel-sheet">
        <div className="prato-painel-topo">
          <h1 className="prato-detalhe-nome">{dish.name}</h1>
          <span className="prato-detalhe-preco">{dish.price}</span>
        </div>

        <div className="prato-badges-row">
          <span className="prato-chip-tag">
            <Users className="w-3.5 h-3.5 text-[#5ac59b]" />
            {dish.serves}
          </span>
          {dish.dimensions && (
            <span className="prato-chip-tag font-mono text-[11.5px]">
              <Box className="w-3.5 h-3.5 text-[#5ac59b]" />
              {(dish.dimensions.widthMeters * 100).toFixed(0)} ×{' '}
              {(dish.dimensions.heightMeters * 100).toFixed(0)} ×{' '}
              {(dish.dimensions.depthMeters * 100).toFixed(0)} cm
            </span>
          )}
        </div>

        <p className="prato-detalhe-desc">{dish.description}</p>

        {dish.model3dUrl && dish.arEnabled && (
          <button onClick={handleActivateAR} className="prato-btn-ar-principal">
            <ScanLine className="w-5 h-5" />
            Ver na minha mesa
          </button>
        )}

        {arNotice ? (
          <div className="prato-aviso-box text-amber-300 font-medium">{arNotice}</div>
        ) : (
          <p className="prato-nota-footer">
            Aponte a câmera para a mesa para projetar o prato no tamanho real.
          </p>
        )}
      </div>
    </div>
  );
}

export default function PratoPage() {
  return (
    <div className="min-h-screen bg-black text-[#efefef]">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-sm text-[#8b8f8d]">
            Carregando prato...
          </div>
        }
      >
        <PratoDetailContent />
      </Suspense>
    </div>
  );
}
