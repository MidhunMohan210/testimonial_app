(function (window, document) {
  "use strict";

  var NAMESPACE = "Woice";
  var WIDGET_SELECTOR = ".woice-testimonial-widget";
  var DEFAULT_HEIGHT = "400px";
  var LOADER_MARGIN = "200px 0px";
  var LOADER_THRESHOLD = 0.01;
  var LOAD_TIMEOUT_MS = 15000;

  function getNamespace() {
    var existing = window[NAMESPACE] || {};
    window[NAMESPACE] = existing;
    return existing;
  }

  var Woice = getNamespace();

  // If script is loaded multiple times, reuse existing runtime and just re-init.
  if (Woice.__EMBED_RUNTIME__) {
    Woice.init();
    return;
  }

  Woice.__EMBED_RUNTIME__ = true;

  var processedNodes = new WeakSet();
  var visibilityObserver = null;
  var mutationObserver = null;

  function getCurrentScript() {
    return (
      document.currentScript ||
      (function () {
        var scripts = document.getElementsByTagName("script");
        return scripts[scripts.length - 1] || null;
      })()
    );
  }

  function resolveBaseUrl() {
    if (
      Woice.config &&
      typeof Woice.config.baseUrl === "string" &&
      Woice.config.baseUrl.trim()
    ) {
      return Woice.config.baseUrl.replace(/\/+$/, "");
    }

    var script = getCurrentScript();
    if (script && script.getAttribute("data-base-url")) {
      return script.getAttribute("data-base-url").replace(/\/+$/, "");
    }

    if (script && script.src) {
      try {
        return new URL(script.src).origin;
      } catch (e) {}
    }

    return "https://app.woice.io";
  }

  function normalizeHeight(rawHeight) {
    if (!rawHeight || !String(rawHeight).trim()) return DEFAULT_HEIGHT;
    var value = String(rawHeight).trim();
    return /^\d+$/.test(value) ? value + "px" : value;
  }

  function setFallbackText(container, message) {
    container.innerHTML = "";
    container.textContent = message;
    container.style.minHeight = "60px";
    container.style.display = "block";
  }

  function buildIframeUrl(baseUrl, slug, theme, layout) {
    var url = baseUrl + "/widget/" + encodeURIComponent(slug);
    var params = [];

    if (theme) params.push("theme=" + encodeURIComponent(theme));
    if (layout) params.push("layout=" + encodeURIComponent(layout));

    return params.length ? url + "?" + params.join("&") : url;
  }

  function createIframe(src, height) {
    var iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = "Woice testimonials";
    iframe.loading = "lazy";
    iframe.style.width = "100%";
    iframe.style.border = "none";
    iframe.style.height = height;
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowtransparency", "true");
    return iframe;
  }

  function mountIframe(container, iframe) {
    var timeoutId = window.setTimeout(function () {
      setFallbackText(container, "Failed to load testimonials");
    }, LOAD_TIMEOUT_MS);

    iframe.onload = function () {
      window.clearTimeout(timeoutId);
    };

    iframe.onerror = function () {
      window.clearTimeout(timeoutId);
      setFallbackText(container, "Failed to load testimonials");
    };

    container.innerHTML = "";
    container.appendChild(iframe);
  }

  function readWidgetConfig(container) {
    return {
      slug: (container.getAttribute("data-business-slug") || "").trim(),
      theme: (container.getAttribute("data-theme") || "").trim(),
      layout: (container.getAttribute("data-layout") || "").trim(),
      height: normalizeHeight(container.getAttribute("data-height")),
    };
  }

  function hydrateWidget(container) {
    var config = readWidgetConfig(container);

    if (!config.slug) {
      setFallbackText(container, "Testimonials are unavailable");
      return;
    }

    var baseUrl = resolveBaseUrl();
    var src = buildIframeUrl(baseUrl, config.slug, config.theme, config.layout);
    var iframe = createIframe(src, config.height);
    mountIframe(container, iframe);
  }

  function markProcessed(node) {
    processedNodes.add(node);
    node.setAttribute("data-woice-initialized", "1");
  }

  function isProcessed(node) {
    return (
      processedNodes.has(node) || node.getAttribute("data-woice-initialized") === "1"
    );
  }

  function onVisible(entries) {
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      if (!entry.isIntersecting) continue;
      var node = entry.target;
      visibilityObserver.unobserve(node);
      hydrateWidget(node);
    }
  }

  function observeForLazyLoad(node) {
    if ("IntersectionObserver" in window) {
      if (!visibilityObserver) {
        visibilityObserver = new IntersectionObserver(onVisible, {
          root: null,
          rootMargin: LOADER_MARGIN,
          threshold: LOADER_THRESHOLD,
        });
      }
      visibilityObserver.observe(node);
      return;
    }

    // Fallback for older browsers: load immediately.
    hydrateWidget(node);
  }

  function initNode(node) {
    if (!node || node.nodeType !== 1) return;
    if (isProcessed(node)) return;
    markProcessed(node);
    observeForLazyLoad(node);
  }

  function initAll() {
    var nodes = document.querySelectorAll(WIDGET_SELECTOR);
    for (var i = 0; i < nodes.length; i++) {
      initNode(nodes[i]);
    }
  }

  function watchDomForNewWidgets() {
    if (!("MutationObserver" in window) || mutationObserver) return;

    mutationObserver = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var addedNodes = mutations[i].addedNodes;
        for (var j = 0; j < addedNodes.length; j++) {
          var node = addedNodes[j];
          if (!node || node.nodeType !== 1) continue;

          if (node.matches && node.matches(WIDGET_SELECTOR)) {
            initNode(node);
          }

          if (node.querySelectorAll) {
            var nested = node.querySelectorAll(WIDGET_SELECTOR);
            for (var k = 0; k < nested.length; k++) {
              initNode(nested[k]);
            }
          }
        }
      }
    });

    mutationObserver.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
    });
  }

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  Woice.init = function () {
    initAll();
    watchDomForNewWidgets();
  };

  Woice.destroy = function () {
    if (visibilityObserver) {
      visibilityObserver.disconnect();
      visibilityObserver = null;
    }
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }
  };

  onReady(Woice.init);
})(window, document);
