'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Box,
  Check,
  ScanLine,
  ShoppingBag,
  Sparkles,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Product3DViewer,
  type ModelViewerRefHandle,
  type ProductViewerState,
} from '@/components/Product3DViewer';

type Dish = {
  id: string;
  name: string;
  description: string;
  price: string;
  serves: string;
  size: string;
  image: string;
  model3dUrl?: string;
  iosModelUrl?: string;
  dimensions?: {
    widthMeters: number;
    heightMeters: number;
    depthMeters: number;
  };
  arEnabled?: boolean;
  category: 'Burgers' | 'Porções' | 'Combos';
  accent: string;
  badge: string;
};

const dishes: Dish[] = [
  {
    id: 'garage-double',
    name: 'Garage Double',
    description:
      'Dois smash burgers, cheddar inglês, bacon crocante e cebola caramelizada no brioche.',
    price: 'R$ 39,90',
    serves: '1 pessoa',
    size: '11 × 9 × 11 cm',
    image: '/burger.png',
    model3dUrl: '/models/hamburger/hamburger-test.glb',
    dimensions: {
      widthMeters: 0.11,
      heightMeters: 0.09,
      depthMeters: 0.11,
    },
    arEnabled: true,
    category: 'Burgers',
    accent: '#39e59c',
    badge: 'Mais pedido',
  },
  {
    id: 'loaded-fries',
    name: 'Loaded Fries',
    description:
      'Batatas supercrocantes, creme de cheddar, bacon e cebolinha. Feita para dividir.',
    price: 'R$ 46,90',
    serves: '2–3 pessoas',
    size: '28 cm de largura',
    image: '/fries.png',
    category: 'Porções',
    accent: '#ffc95c',
    badge: 'Para compartilhar',
  },
  {
    id: 'track-combo',
    name: 'Track Combo',
    description:
      'Cheeseburger com bacon, fritas individuais e refrigerante gelado.',
    price: 'R$ 49,90',
    serves: '1 pessoa',
    size: 'Bandeja de 32 cm',
    image: '/combo.png',
    category: 'Combos',
    accent: '#ff745a',
    badge: 'Combo completo',
  },
];

const categories = ['Destaques', 'Burgers', 'Porções', 'Combos'] as const;

type DishToolContext = {
  registerTool: (
    tool: {
      name: string;
      title: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
      execute: (input: unknown) => unknown;
    },
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
};

export default function Home() {
  const [category, setCategory] = useState<(typeof categories)[number]>('Destaques');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [added, setAdded] = useState(false);
  const [arNotice, setARNotice] = useState<string | null>(null);
  const [viewerState, setViewerState] = useState<ProductViewerState>('image-only');
  const viewerRef = useRef<ModelViewerRefHandle | null>(null);

  const visibleDishes = useMemo(
    () =>
      category === 'Destaques'
        ? dishes
        : dishes.filter((dish) => dish.category === category),
    [category],
  );

  useEffect(() => {
    const context = (document as Document & { modelContext?: DishToolContext }).modelContext;
    if (!context?.registerTool) return;

    const lifecycle = new AbortController();
    void Promise.resolve(
      context.registerTool(
        {
          name: 'open_dish_preview',
          title: 'Abrir prévia de um prato',
          description: 'Abre no cardápio a ficha visual e a demonstração em AR de um prato pelo identificador.',
          inputSchema: {
            type: 'object',
            properties: {
              dishId: { type: 'string', enum: dishes.map((dish) => dish.id) },
            },
            required: ['dishId'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute(input) {
            const dishId =
              typeof input === 'object' && input !== null && 'dishId' in input
                ? String(input.dishId)
                : '';
            const dish = dishes.find((item) => item.id === dishId);
            if (!dish) throw new Error('Prato não encontrado.');
            setSelectedDish(dish);
            setAdded(false);
            setARNotice(null);
            setViewerState(dish.model3dUrl ? 'loading' : 'image-only');
            return { opened: true, dishId: dish.id, dishName: dish.name };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => undefined);

    return () => lifecycle.abort();
  }, []);

  function openDish(dish: Dish) {
    setSelectedDish(dish);
    setAdded(false);
    setARNotice(null);
    setViewerState(dish.model3dUrl ? 'loading' : 'image-only');
  }

  const handleViewerStateChange = useCallback((state: ProductViewerState) => {
    setViewerState(state);
  }, []);

  async function handleActivateAR() {
    if (!viewerRef.current) return;
    const result = await viewerRef.current.activateAR();
    if (result === 'started') {
      setARNotice(null);
      return;
    }

    if (result === 'ios-model-missing') {
      setARNotice(
        'No iPhone, a visualização AR exige um arquivo USDZ. Esta prova usa somente o GLB real do hambúrguer e não simula esse formato.',
      );
      return;
    }

    if (result === 'unsupported') {
      setARNotice(
        'A realidade aumentada não está disponível neste dispositivo. Abra o link HTTPS no Chrome de um Android compatível com ARCore.',
      );
      return;
    }

    setARNotice(
      'Não foi possível iniciar a realidade aumentada agora. Confira a conexão e tente novamente no Chrome de um Android compatível.',
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="menu-shell">
        <header className="sticky top-0 z-30 border-b border-white/6 bg-background/88 px-5 pb-4 pt-5 backdrop-blur-xl md:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <a className="brand-mark" href="#top" aria-label="DishAR — início">
              <span className="brand-corners" aria-hidden="true" />
              <span>Dish</span><strong>AR</strong>
            </a>
            <div className="flex items-center gap-2">
              <span className="table-chip"><span className="status-dot" /> Mesa 07</span>
              <Button variant="outline" size="icon-lg" className="cart-button" aria-label="Abrir sacola">
                <ShoppingBag />
              </Button>
            </div>
          </div>
        </header>

        <section id="top" className="mx-auto max-w-5xl px-5 pb-10 pt-8 md:px-8 md:pt-12">
          <div className="intro-grid">
            <div>
              <p className="eyebrow"><Sparkles /> Cardápio em realidade aumentada</p>
              <h1>Escolha com os olhos.<br /><span>Veja na sua mesa.</span></h1>
              <p className="intro-copy">
                Toque em um prato, confira cada detalhe em 3D e veja o tamanho real antes de pedir.
              </p>
            </div>
            <div className="scan-card" aria-label="Como usar">
              <ScanLine />
              <div>
                <strong>Você está no modo demonstração</strong>
                <span>A experiência real abre direto pelo QR da mesa com AR nativo.</span>
              </div>
            </div>
          </div>

          <nav className="category-strip" aria-label="Categorias do cardápio">
            {categories.map((item) => (
              <Button
                key={item}
                variant={category === item ? 'default' : 'outline'}
                onClick={() => setCategory(item)}
                className={category === item ? 'category-active' : 'category-button'}
              >
                {item}
              </Button>
            ))}
          </nav>

          <div className="section-heading">
            <div>
              <p>Seleção da casa</p>
              <h2>{category}</h2>
            </div>
            <span>{visibleDishes.length} {visibleDishes.length === 1 ? 'item' : 'itens'}</span>
          </div>

          <div className="dish-grid">
            {visibleDishes.map((dish) => (
              <article key={dish.id} className="dish-card" style={{ '--dish-accent': dish.accent } as React.CSSProperties}>
                <button
                  className="dish-visual"
                  onClick={() => openDish(dish)}
                  aria-label={dish.model3dUrl ? `Ver ${dish.name} em 3D` : `Ver detalhes de ${dish.name}`}
                >
                  <span className="dish-badge"><Box /> {dish.model3dUrl ? 'Ver em 3D' : 'Ver detalhes'}</span>
                  <Image src={dish.image} alt={dish.name} width={1254} height={1254} />
                  <span className="dish-glow" aria-hidden="true" />
                </button>
                <div className="dish-body">
                  <div className="dish-title-row">
                    <div>
                      <span className="dish-kicker">{dish.badge}</span>
                      <h3>{dish.name}</h3>
                    </div>
                    <strong>{dish.price}</strong>
                  </div>
                  <p>{dish.description}</p>
                  <div className="dish-meta"><Users /> Serve {dish.serves}</div>
                  <Button onClick={() => openDish(dish)} className="dish-cta" size="lg">
                    {dish.model3dUrl ? 'Ver na minha mesa' : 'Abrir detalhes'} <ArrowUpRight />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer>
          <span className="brand-mark small"><span className="brand-corners" aria-hidden="true" /><span>Dish</span><strong>AR</strong></span>
          <p>Uma demonstração da próxima geração de cardápios interativos 3D & AR.</p>
        </footer>
      </div>

      <Sheet open={Boolean(selectedDish)} onOpenChange={(open) => {
        if (!open) {
          setSelectedDish(null);
          setARNotice(null);
        }
      }}>
        <SheetContent side="bottom" className="dish-sheet" showCloseButton>
          {selectedDish && (
            <>
              <SheetHeader className="sr-only">
                <SheetTitle>{selectedDish.name}</SheetTitle>
                <SheetDescription>{selectedDish.description}</SheetDescription>
              </SheetHeader>

              {/* Visualizador 3D Real com @google/model-viewer */}
              <Product3DViewer
                key={selectedDish.id}
                ref={viewerRef}
                model3dUrl={selectedDish.model3dUrl}
                iosModelUrl={selectedDish.iosModelUrl}
                imageUrl={selectedDish.image}
                dishName={selectedDish.name}
                accentColor={selectedDish.accent}
                dimensions={selectedDish.dimensions}
                onViewerStateChange={handleViewerStateChange}
              />

              <div className="sheet-info">
                <div className="sheet-name-row">
                  <div>
                    <span className="dish-kicker">{selectedDish.badge}</span>
                    <h2>{selectedDish.name}</h2>
                  </div>
                  <strong>{selectedDish.price}</strong>
                </div>
                <p>{selectedDish.description}</p>
                <div className="sheet-facts">
                  <span><Users /> Serve {selectedDish.serves}</span>
                  <span><ScanLine /> {selectedDish.size}</span>
                </div>

                {/* Banner de instrução amigável caso AR não possa ser ativado no dispositivo atual (ex: desktop) */}
                {arNotice && (
                  <div className="ar-notice-banner">
                    <ScanLine />
                    <div>
                      <strong>Realidade Aumentada Mobile</strong>
                      <p>
                        {arNotice}
                      </p>
                    </div>
                  </div>
                )}

                <div className="sheet-actions">
                  {selectedDish.model3dUrl && selectedDish.arEnabled && (
                    <Button
                      size="lg"
                      className="primary-action"
                      onClick={handleActivateAR}
                      disabled={viewerState === 'loading' || viewerState === 'error'}
                    >
                      <ScanLine /> Ver na minha mesa
                    </Button>
                  )}
                  <Button
                    size="lg"
                    variant="outline"
                    className={added ? 'added-action' : ''}
                    onClick={() => setAdded(true)}
                  >
                    {added ? <><Check /> Adicionado</> : <><ShoppingBag /> Adicionar · {selectedDish.price}</>}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </main>
  );
}
