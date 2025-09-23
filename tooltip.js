
// Modern Tooltip Library - Fixed
const Tooltip = (function() {
  const defaults = { position: 'top', offset: 8, delay: 100, duration: 200 };
  const instances = new Map();

  function createTooltipElement(content, position, theme) {
    const tooltip = document.createElement('div');
    tooltip.className = `tooltip tooltip-${position} ${theme ? 'tooltip-' + theme : ''}`;
    tooltip.textContent = content;
    return tooltip;
  }

  function calculatePosition(element, tooltip, position) {
    const rect = element.getBoundingClientRect();
    const tipRect = tooltip.getBoundingClientRect();
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    let top, left;

    switch(position) {
      case 'bottom':
        top = rect.bottom + scrollY + defaults.offset;
        left = rect.left + scrollX + (rect.width - tipRect.width) / 2;
        break;
      case 'left':
        top = rect.top + scrollY + (rect.height - tipRect.height) / 2;
        left = rect.left + scrollX - tipRect.width - defaults.offset;
        break;
      case 'right':
        top = rect.top + scrollY + (rect.height - tipRect.height) / 2;
        left = rect.right + scrollX + defaults.offset;
        break;
      default: // top
        top = rect.top + scrollY - tipRect.height - defaults.offset;
        left = rect.left + scrollX + (rect.width - tipRect.width) / 2;
    }
    return { top, left };
  }

  function showTooltip(element) {
    const inst = instances.get(element);
    if (!inst) return;
    clearTimeout(inst.timeout);
    inst.timeout = setTimeout(() => {
      if (!inst.tooltip) {
        inst.tooltip = createTooltipElement(inst.content, inst.position, inst.theme);
        document.body.appendChild(inst.tooltip);
      }
      const pos = calculatePosition(element, inst.tooltip, inst.position);
      inst.tooltip.style.top = pos.top + "px";
      inst.tooltip.style.left = pos.left + "px";
      inst.tooltip.classList.add("visible");
      inst.tooltip.classList.remove("fade-out");
    }, inst.delay || defaults.delay);
  }

  function hideTooltip(element) {
    const inst = instances.get(element);
    if (!inst || !inst.tooltip) return;
    const tip = inst.tooltip;
    tip.classList.remove("visible");
    tip.classList.add("fade-out");
    tip.addEventListener("transitionend", () => {
      if (tip.parentNode) tip.parentNode.removeChild(tip);
    }, { once: true });
    inst.tooltip = null;
  }

  function scheduleHide(element) {
    const inst = instances.get(element);
    if (!inst) return;
    clearTimeout(inst.timeout);
    inst.timeout = setTimeout(() => hideTooltip(element), 150);
  }

  function initElement(element) {
    const content = element.getAttribute('data-tooltip');
    if (!content) return;
    const position = element.getAttribute('data-tooltip-position') || defaults.position;
    const theme = element.getAttribute('data-tooltip-theme') || '';

    const handlers = {
      mouseenter: () => showTooltip(element),
      mouseleave: () => scheduleHide(element),
      focus: () => showTooltip(element),
      blur: () => hideTooltip(element)
    };

    const inst = { content, position, theme, tooltip: null, timeout: null, handlers };
    instances.set(element, inst);

    Object.entries(handlers).forEach(([evt, fn]) => element.addEventListener(evt, fn));
  }

  return {
    init(options={}) {
      Object.assign(defaults, options);
      document.querySelectorAll("[data-tooltip]").forEach(initElement);
    },
    create(element, options={}) {
      const inst = { content: options.content, position: options.position||defaults.position,
        theme: options.theme||'', delay: options.delay||defaults.delay, duration: options.duration||defaults.duration,
        tooltip: null, timeout: null, handlers: {} };
      instances.set(element, inst);
      const handlers = {
        mouseenter: () => showTooltip(element),
        mouseleave: () => scheduleHide(element),
        focus: () => showTooltip(element),
        blur: () => hideTooltip(element)
      };
      inst.handlers = handlers;
      Object.entries(handlers).forEach(([evt, fn]) => element.addEventListener(evt, fn));
      return inst;
    },
    show: showTooltip,
    hide: hideTooltip,
    destroy(element) {
      const inst = instances.get(element);
      if (!inst) return;
      Object.entries(inst.handlers).forEach(([evt, fn]) => element.removeEventListener(evt, fn));
      hideTooltip(element);
      if (inst.timeout) clearTimeout(inst.timeout);
      instances.delete(element);
    },
    getInstances() { return instances; }
  };
})();
