'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Info, Users } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { DISHES, RESTAURANT_INFO } from '@/lib/dishes';

export default function DemoMenuPage() {
  return (
    <div className="min-h-screen bg-black text-[#efefef]">
      <div className="wrap-demo">
        {/* Cabeçalho do Cardápio Demo */}
        <header className="demo-header-top">
          <BrandLogo size="md" />
          <Link href="/" className="badge-voltar">
            <ArrowLeft className="w-3.5 h-3.5" />
            DishAR
          </Link>
        </header>

        <h1 className="rest-title">{RESTAURANT_INFO.name}</h1>
        <p className="rest-subtitle">{RESTAURANT_INFO.subtitle}</p>

        {/* Dica de uso */}
        <div className="hint-banner">
          <Info className="w-5 h-5" />
          <span>
            Toque em um prato para vê-lo em <strong>tamanho real</strong> na sua mesa. Não precisa
            baixar nada.
          </span>
        </div>

        {/* Grid de pratos */}
        <div className="grid-pratos-demo">
          {DISHES.map((dish) => (
            <Link
              key={dish.id}
              href={`/prato?id=${encodeURIComponent(dish.id)}`}
              className="card-prato-demo"
            >
              <div className="card-visual-demo">
                <Image
                  src={dish.image}
                  alt={dish.name}
                  width={500}
                  height={500}
                  className="card-img-preview"
                />
                <span className="tag-ar-pill">VER EM AR</span>
              </div>

              <div className="card-body-demo">
                <h2 className="card-nome-demo">{dish.name}</h2>
                <p className="card-desc-demo">{dish.description}</p>

                <div className="card-meta-demo">
                  <span className="serve-chip">
                    <Users className="w-4 h-4" />
                    {dish.serves}
                  </span>
                  <span className="preco-demo">{dish.price}</span>
                </div>

                <div className="cta-linha-demo">
                  <span>Ver na minha mesa</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Rodapé do cardápio */}
        <footer className="mt-12 pt-8 border-t border-[#212123] text-center">
          <p className="text-xs text-[#8b8f8d]">
            {RESTAURANT_INFO.name} &bull; Cardápio interativo em Realidade Aumentada
          </p>
          <p className="text-[11px] text-[#555] mt-1">Desenvolvido com tecnologia DishAR</p>
        </footer>
      </div>
    </div>
  );
}
