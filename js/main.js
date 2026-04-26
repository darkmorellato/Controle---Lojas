/**
 * Controle de Vendas - Main JavaScript
 * Código otimizado e profissional
 * @version 2.0
 */

'use strict';

/**
 * Classe GhostGrid - Animação de grid fantasma em canvas
 * Pausa automaticamente quando a aba não está visível (economia de bateria)
 * Implementação Singleton para garantir única instância
 */
class GhostGrid {
  static #instance = null;

  constructor(canvasId) {
    // Garantir instância única
    if (GhostGrid.#instance) {
      return GhostGrid.#instance;
    }

    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.warn(`Canvas #${canvasId} não encontrado`);
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.frame = 0;
    this.isActive = true;
    this.animationId = null;
    this.resizeObserver = null;
    this.gridSize = 50;
    this.boundVisibilityHandler = this.handleVisibilityChange.bind(this);

    GhostGrid.#instance = this;
    this.init();
  }

  /**
   * Retorna a instância única do GhostGrid
   */
  static getInstance(canvasId = 'ghostGrid') {
    if (!GhostGrid.#instance) {
      new GhostGrid(canvasId);
    }
    return GhostGrid.#instance;
  }

  init() {
    this.setupResizeObserver();
    this.setupVisibilityListener();
    this.resize();
    this.animate();
  }

  /**
   * Configura ResizeObserver para redimensionamento eficiente
   */
  setupResizeObserver() {
    if (!('ResizeObserver' in window)) {
      window.addEventListener('resize', this.throttle(this.resize.bind(this), 100));
      return;
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      requestAnimationFrame(() => this.resize());
    });

    this.resizeObserver.observe(document.body);
  }

  /**
   * Handler para mudança de visibilidade da página
   */
  handleVisibilityChange() {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  }

  /**
   * Pausa animação quando a aba está oculta (economia de bateria/CPU)
   */
  setupVisibilityListener() {
    document.addEventListener('visibilitychange', this.boundVisibilityHandler);
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  /**
   * Desenha o grid com ondas orgânicas
   */
  draw() {
    // Fundo preto
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.lineWidth = 1;

    // Linhas verticais com variação orgânica
    for (let x = 0; x <= this.width; x += this.gridSize) {
      const alpha = (Math.sin(x * 0.01 + this.frame * 0.003) + 1) * 0.035;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      this.ctx.stroke();
    }

    // Linhas horizontais com variação diferente (efeito mais orgânico)
    for (let y = 0; y <= this.height; y += this.gridSize) {
      const alpha = (Math.cos(y * 0.015 + this.frame * 0.004) + 1) * 0.035;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      this.ctx.stroke();
    }
  }

  animate() {
    if (!this.isActive) return;

    this.draw();
    this.frame++;

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  pause() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  resume() {
    if (!this.isActive) {
      this.isActive = true;
      this.animate();
    }
  }

  /**
   * Limpa recursos ao destruir
   */
  destroy() {
    this.pause();
    this.resizeObserver?.disconnect();
    // Corrigido: usar a função bindada
    document.removeEventListener('visibilitychange', this.boundVisibilityHandler);
  }

  /**
   * Throttle helper para browsers sem ResizeObserver
   */
  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
}

/**
 * Classe StoreManager - Gerenciamento dos links das lojas
 */
class StoreManager {
  constructor() {
    this.storeLinks = document.querySelectorAll('.store-link');
    this.boundClickHandlers = new Map();
    this.boundKeydownHandlers = new Map();
    this.init();
  }

  init() {
    this.storeLinks.forEach((link) => {
      this.setupLinkInteraction(link);
    });
  }

  setupLinkInteraction(link) {
    // Criar handlers bindados para poder remover depois
    const clickHandler = this.handleStoreClick.bind(this, link);
    const keydownHandler = this.handleKeydown.bind(this, link);

    // Armazenar referências
    this.boundClickHandlers.set(link, clickHandler);
    this.boundKeydownHandlers.set(link, keydownHandler);

    // Feedback visual ao clicar
    link.addEventListener('click', clickHandler);

    // Navegação por teclado acessível
    link.addEventListener('keydown', keydownHandler);
  }

  handleStoreClick(link, event) {
    const storeName = link.querySelector('.store-label')?.textContent || 'Loja';
    const href = link.getAttribute('href');

    // Animação de feedback
    link.classList.add('clicked');

    // Remove classe após animação
    setTimeout(() => {
      link.classList.remove('clicked');
    }, 300);

    // Log para debugging apenas em desenvolvimento
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log(`[StoreManager] Navegando para: ${storeName} - ${href}`);
    }
  }

  handleKeydown(link, event) {
    // Enter ou Espaço ativam o link
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      link.click();
    }
  }

  /**
   * Remove todos os event listeners
   */
  destroy() {
    this.storeLinks.forEach((link) => {
      const clickHandler = this.boundClickHandlers.get(link);
      const keydownHandler = this.boundKeydownHandlers.get(link);

      if (clickHandler) {
        link.removeEventListener('click', clickHandler);
        this.boundClickHandlers.delete(link);
      }

      if (keydownHandler) {
        link.removeEventListener('keydown', keydownHandler);
        this.boundKeydownHandlers.delete(link);
      }
    });
  }
}

/**
 * Service Worker Registration para funcionalidades PWA
 */
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      // Adicionar crossorigin para evitar problemas de MIME type
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('Service Worker registrado:', registration);

      // Verificar atualizações
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('[SW] Nova versão encontrada');
      });
    } catch (error) {
      console.warn('Falha ao registrar Service Worker:', error);
    }
  }
}

// Instâncias globais para cleanup
let ghostGridInstance = null;
let storeManagerInstance = null;

/**
 * Inicialização da aplicação
 */
function initializeApp() {
  // Inicializa Ghost Grid (usando Singleton)
  ghostGridInstance = GhostGrid.getInstance('ghostGrid');

  // Inicializa gerenciamento das lojas
  storeManagerInstance = new StoreManager();

  // Registra Service Worker (PWA)
  registerServiceWorker();

  // Expõe para debugging apenas em desenvolvimento
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.AppDebug = {
      get ghostGrid() { return GhostGrid.getInstance(); },
      storeManager: storeManagerInstance,
      // Método para limpeza manual
      destroy: () => {
        ghostGridInstance?.destroy();
        storeManagerInstance?.destroy();
      }
    };
  }
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializeApp);

// Cleanup ao sair da página
window.addEventListener('beforeunload', () => {
  ghostGridInstance?.destroy();
  storeManagerInstance?.destroy();
});

// Exporta classes para testes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GhostGrid, StoreManager };
}
