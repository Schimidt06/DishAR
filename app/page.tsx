'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Check,
  Eye,
  HelpCircle,
  QrCode,
  ScanLine,
  Smartphone,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { Product3DViewer, type ModelViewerRefHandle } from '@/components/Product3DViewer';
import { DISHES, RESTAURANT_INFO } from '@/lib/dishes';

export default function LandingPage() {
  const viewerRef = useRef<ModelViewerRefHandle>(null);
  const [arNotice, setARNotice] = useState<string | null>(null);

  const heroDish = DISHES[0]; // Garage Double

  async function handleHeroAR() {
    if (!viewerRef.current) return;
    const result = await viewerRef.current.activateAR();
    if (result === 'started') {
      setARNotice(null);
      return;
    }

    if (result === 'unsupported') {
      setARNotice(
        'Abra este link no Safari (iPhone) ou no Chrome (Android) para ver o prato em Realidade Aumentada na sua mesa.',
      );
      return;
    }

    setARNotice(
      'Não foi possível iniciar o AR neste navegador. Verifique se o aparelho é compatível ou abra no celular.',
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#efefef]">
      {/* ---------- NAVEGAÇÃO SUPERIOR ---------- */}
      <nav className="nav-bar">
        <div className="nav-container">
          <BrandLogo size="md" />

          <div className="nav-links">
            <a href="#problema" className="hide-mobile">
              O Problema
            </a>
            <a href="#vantagens" className="hide-mobile">
              Vantagens
            </a>
            <a href="#planos" className="hide-mobile">
              Planos
            </a>
            <Link href="/demo" className="hide-mobile">
              Demonstração
            </Link>
            <a
              href={`https://wa.me/${RESTAURANT_INFO.whatsapp}?text=${encodeURIComponent(
                'Olá! Gostaria de saber mais sobre o DishAR para o meu restaurante.',
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-cta-btn"
            >
              Quero no meu restaurante
            </a>
          </div>
        </div>
      </nav>

      {/* ---------- HERO SECTION COM 3D INTERATIVO ---------- */}
      <header className="secao topo-sales">
        <p className="olho">Cardápio em Realidade Aumentada</p>

        <h1>
          O prato na mesa, <em>antes do pedido</em>.
        </h1>

        <p className="chamada">
          Seu cliente lê o QR code, toca no prato e vê o <strong>tamanho real</strong> sobre
          a própria mesa. <strong>Sem baixar aplicativo nenhum.</strong>
        </p>

        {/* Palco do Hero 3D */}
        <div className="palco-heroi">
          <Product3DViewer
            ref={viewerRef}
            model3dUrl={heroDish.model3dUrl}
            iosModelUrl={heroDish.iosModelUrl}
            imageUrl={heroDish.image}
            dishName={heroDish.name}
            dimensions={heroDish.dimensions}
            showHint
            showDimensions
          />
        </div>

        <div className="acoes-heroi">
          <button onClick={handleHeroAR} className="botao botao-cheio">
            <ScanLine className="w-5 h-5" />
            Ver na minha mesa
          </button>
          <Link href="/demo" className="botao botao-vazio">
            Ver um cardápio inteiro
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {arNotice ? (
          <p className="aviso-ar-nota text-amber-300">{arNotice}</p>
        ) : (
          <p className="aviso-ar-nota">
            Abra no celular para colocar este prato na sua mesa agora.
          </p>
        )}
      </header>

      <hr className="linha-divisoria" />

      {/* ---------- SEÇÃO 1: O PROBLEMA DA FOTO ---------- */}
      <section id="problema" className="secao secao-larga">
        <div className="duas-colunas">
          <div>
            <p className="olho">O problema</p>
            <h2 className="titulo-secao">A foto do cardápio não tem escala.</h2>
            <p className="linha-fina">
              Toda foto de prato é tirada de perto, com lente que engorda a porção e sem nada
              em volta que sirva de referência. O cliente olha, imagina e erra. Aí ele pergunta
              ao garçom — e a resposta é sempre a mesma mímica imprecisa de mãos no ar.
            </p>
            <p className="linha-fina mt-4">
              <strong>“Serve quantas pessoas?”</strong> é a dúvida mais repetida de qualquer
              salão. O DishAR responde antes mesmo do garçom se aproximar.
            </p>
          </div>

          <div className="comparacao-cards">
            <div className="quadro-compare">
              <span className="quadro-tag">FOTO 2D COMUM</span>
              <Image
                src="/burger.png"
                alt="Foto tradicional de hambúrguer"
                width={500}
                height={500}
                className="quadro-compare-img"
              />
              <p className="quadro-legenda">
                Ângulo fechado sem referência. Não dá para saber se o lanche é de 100g ou 250g.
              </p>
            </div>

            <div className="quadro-compare border-[#5ac59b]/30">
              <span className="quadro-tag verde">DISHAR EM 3D & AR</span>
              <div className="quadro-compare-img flex items-center justify-center p-2 bg-[#0d1411]">
                <Image
                  src="/burger.png"
                  alt="Modelo 3D com escala real"
                  width={400}
                  height={400}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="quadro-legenda text-[#eef5f1]">
                Projeção na mesa em escala real 1:1 (11 cm). O cliente vê exatamente o que vai
                receber.
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr className="linha-divisoria" />

      {/* ---------- SEÇÃO 2: COMO FUNCIONA (SEM APP) ---------- */}
      <section id="como-funciona" className="secao secao-larga text-center">
        <p className="olho">Simples e sem fricção</p>
        <h2 className="titulo-secao max-w-xl mx-auto">
          Como o seu cliente experimenta na mesa
        </h2>
        <p className="linha-fina max-w-lg mx-auto mb-12">
          Nenhum aplicativo para baixar na App Store ou Google Play. Funciona nativo no
          navegador.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="card-beneficio">
            <div className="icone-beneficio">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono text-[#5ac59b] font-bold">PASSO 1</span>
            <h3 className="mt-2">Lê o QR na mesa</h3>
            <p>O cliente aponta a câmera do celular para a plaquinha ou porta-guardanapo da mesa.</p>
          </div>

          <div className="card-beneficio">
            <div className="icone-beneficio">
              <Eye className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono text-[#5ac59b] font-bold">PASSO 2</span>
            <h3 className="mt-2">Escolhe o prato</h3>
            <p>Abre o cardápio interativo e gira os pratos em 360 graus na tela do celular.</p>
          </div>

          <div className="card-beneficio">
            <div className="icone-beneficio">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono text-[#5ac59b] font-bold">PASSO 3</span>
            <h3 className="mt-2">Vê o prato na mesa</h3>
            <p>
              Toca em &ldquo;Ver na minha mesa&rdquo; e o prato aparece na escala real sobre a toalha.
            </p>
          </div>
        </div>
      </section>

      <hr className="linha-divisoria" />

      {/* ---------- SEÇÃO 3: BENEFÍCIOS PARA O RESTAURANTE ---------- */}
      <section id="vantagens" className="secao secao-larga">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="olho">Impacto no salão</p>
          <h2 className="titulo-secao">Mais do que tecnologia: mais vendas no salão.</h2>
          <p className="linha-fina">
            O cliente compra com os olhos. Veja o que acontece quando a imaginação dá lugar à
            certeza.
          </p>
        </div>

        <div className="grid-beneficios">
          <div className="card-beneficio">
            <div className="icone-beneficio">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3>Aumento no Ticket Médio</h3>
            <p>
              Sobremesas, porções para compartilhar e drinks vendem até 27% mais quando o cliente
              vê a apresentação real antes de pedir.
            </p>
          </div>

          <div className="card-beneficio">
            <div className="icone-beneficio">
              <Check className="w-5 h-5" />
            </div>
            <h3>Zero frustração e devolução</h3>
            <p>
              Elimina o clássico &ldquo;achei que era maior&rdquo;. O prato chega na mesa exatamente
              com a proporção que o cliente já visualizou.
            </p>
          </div>

          <div className="card-beneficio">
            <div className="icone-beneficio">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3>Marketing espontâneo</h3>
            <p>
              Quase todo cliente filma o prato projetado na mesa para postar nos Stories do
              Instagram e TikTok, divulgando seu restaurante de graça.
            </p>
          </div>

          <div className="card-beneficio">
            <div className="icone-beneficio">
              <Zap className="w-5 h-5" />
            </div>
            <h3>Rapidez e autonomia</h3>
            <p>
              Menos tempo tirando dúvidas repetitivas com o garçom. O cliente decide mais rápido e
              o giro das mesas melhora.
            </p>
          </div>
        </div>
      </section>

      <hr className="linha-divisoria" />

      {/* ---------- SEÇÃO 4: PLANOS E PREÇOS ---------- */}
      <section id="planos" className="secao secao-larga">
        <div className="planos-topo">
          <p className="olho">Investimento</p>
          <h2 className="titulo-secao">Planos pensados para o seu salão</h2>
          <p className="linha-fina">
            Comece pelos pratos mais vendidos ou transforme o cardápio inteiro em uma experiência
            3D.
          </p>
        </div>

        <div className="grid-planos">
          {/* Plano Start */}
          <div className="card-plano">
            <h3 className="plano-nome">Start</h3>
            <p className="plano-sub">Ideal para os pratos campeões e novidades do cardápio.</p>
            <div className="plano-preco-box">
              <span className="plano-preco">R$ 197</span>
              <span className="plano-periodo"> /mês</span>
            </div>

            <ul className="plano-lista">
              <li className="plano-item">
                <Check className="w-4 h-4" />
                <span>Até <strong>5 pratos</strong> modelados em 3D e AR</span>
              </li>
              <li className="plano-item">
                <Check className="w-4 h-4" />
                <span>Compatível com iPhone (USDZ) e Android (GLB)</span>
              </li>
              <li className="plano-item">
                <Check className="w-4 h-4" />
                <span>Geração de QR Codes prontos para as mesas</span>
              </li>
              <li className="plano-item">
                <Check className="w-4 h-4" />
                <span>Hospedagem rápida e segura em alta velocidade</span>
              </li>
            </ul>

            <a
              href={`https://wa.me/${RESTAURANT_INFO.whatsapp}?text=${encodeURIComponent(
                'Olá! Tenho interesse no Plano Start do DishAR.',
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="botao botao-vazio w-full text-center"
            >
              Escolher Start
            </a>
          </div>

          {/* Plano Pro (Destaque) */}
          <div className="card-plano destaque-plano">
            <span className="badge-plano-destaque">MAIS POPULAR</span>
            <h3 className="plano-nome">Pro</h3>
            <p className="plano-sub">A experiência completa para restaurantes e hamburguerias.</p>
            <div className="plano-preco-box">
              <span className="plano-preco">R$ 347</span>
              <span className="plano-periodo"> /mês</span>
            </div>

            <ul className="plano-lista">
              <li className="plano-item">
                <Check className="w-4 h-4" />
                <span>Até <strong>15 pratos</strong> modelados em 3D e AR</span>
              </li>
              <li className="plano-item">
                <Check className="w-4 h-4" />
                <span>Menu digital completo com categorias</span>
              </li>
              <li className="plano-item">
                <Check className="w-4 h-4" />
                <span>iPhone Quick Look + Android WebXR com escala 1:1</span>
              </li>
              <li className="plano-item">
                <Check className="w-4 h-4" />
                <span>Relatório mensal de visualizações e pratos mais vistos</span>
              </li>
              <li className="plano-item">
                <Check className="w-4 h-4" />
                <span>Suporte prioritário via WhatsApp</span>
              </li>
            </ul>

            <a
              href={`https://wa.me/${RESTAURANT_INFO.whatsapp}?text=${encodeURIComponent(
                'Olá! Tenho interesse no Plano Pro do DishAR.',
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="botao botao-cheio w-full text-center"
            >
              Começar com o Pro
            </a>
          </div>

          {/* Plano Black */}
          <div className="card-plano">
            <h3 className="plano-nome">Black</h3>
            <p className="plano-sub">Para grandes operações, franquias e alta gastronomia.</p>
            <div className="plano-preco-box">
              <span className="plano-preco">R$ 690</span>
              <span className="plano-periodo"> /mês</span>
            </div>

            <ul className="plano-lista">
              <li className="plano-item">
                <Check className="w-4 h-4" />
                <span>Pratos <strong>ilimitados</strong> em 3D e AR</span>
              </li>
              <li className="plano-item">
                <Check className="w-4 h-4" />
                <span>Domínio personalizado do seu restaurante</span>
              </li>
              <li className="plano-item">
                <Check className="w-4 h-4" />
                <span>Personalização total com cores e identidade da casa</span>
              </li>
              <li className="plano-item">
                <Check className="w-4 h-4" />
                <span>Digitalização assistida dos pratos</span>
              </li>
              <li className="plano-item">
                <Check className="w-4 h-4" />
                <span>Gerente de conta dedicado</span>
              </li>
            </ul>

            <a
              href={`https://wa.me/${RESTAURANT_INFO.whatsapp}?text=${encodeURIComponent(
                'Olá! Tenho interesse no Plano Black do DishAR.',
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="botao botao-vazio w-full text-center"
            >
              Falar com consultor
            </a>
          </div>
        </div>
      </section>

      <hr className="linha-divisoria" />

      {/* ---------- SEÇÃO 5: PERGUNTAS FREQUENTES (FAQ) ---------- */}
      <section className="secao secao-larga">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="olho">Dúvidas comuns</p>
          <h2 className="titulo-secao">Perguntas Frequentes</h2>
        </div>

        <div className="faq-grid">
          <div className="faq-card">
            <h4>O cliente precisa baixar algum aplicativo?</h4>
            <p>
              Não! O DishAR roda 100% no navegador nativo do celular (Safari no iPhone e Chrome no
              Android). O cliente só aponta a câmera para o QR code da mesa.
            </p>
          </div>

          <div className="faq-card">
            <h4>Funciona em qualquer celular?</h4>
            <p>
              Sim! Em iPhones a partir do iOS 12 (com Apple AR Quick Look nativo) e em Androids
              compatíveis com Google Play Services para RA (ARCore), abrangendo mais de 90% dos
              smartphones do mercado.
            </p>
          </div>

          <div className="faq-card">
            <h4>Como os pratos 3D são criados?</h4>
            <p>
              Nossa equipe cuida de toda a modelagem e otimização dos arquivos 3D a partir de
              fotos e medidas reais dos seus pratos, garantindo a proporção 1:1 e texturas
              apetitosas.
            </p>
          </div>

          <div className="faq-card">
            <h4>Como atualizo preços e itens do cardápio?</h4>
            <p>
              Você tem acesso a um painel simples para alterar preços, descrições e ativar ou
              pausar itens em tempo real sem precisar reimprimir nenhum QR code.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- RODAPÉ GLOBAL ---------- */}
      <footer className="rodape-global">
        <div className="rodape-content">
          <BrandLogo size="md" />
          <p className="rodape-legal">
            &copy; {new Date().getFullYear()} DishAR — Cardápios em Realidade Aumentada.
            <br />
            Transformando a experiência gastronômica no salão.
          </p>
        </div>
      </footer>
    </div>
  );
}
