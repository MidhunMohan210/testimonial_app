(function (window, document) {
  "use strict";

  var NAMESPACE = "Woice";
  var WIDGET_SELECTOR = ".woice-testimonial-widget";
  var DEFAULT_HEIGHT = "400px";
  var LOADER_MARGIN = "200px 0px";
  var LOADER_THRESHOLD = 0.01;
  var LOAD_TIMEOUT_MS = 8000;
  var STYLE_ID = "woice-embed-runtime-styles";
  var FALLBACK_MESSAGE = "Testimonials are currently unavailable.";

  function getNamespace() {
    var existing = window[NAMESPACE] || {};
    window[NAMESPACE] = existing;
    return existing;
  }

  var Woice = getNamespace();

  /*
   * IMPORTANT FIX:
   * Capture the script tag and base URL immediately when embed.js loads.
   * Do not resolve it later during lazy loading, because document.currentScript
   * may become null or point to another script on the client's website.
   */
  var EMBED_SCRIPT = document.currentScript;

  var EMBED_BASE_URL = (function () {
    if (EMBED_SCRIPT && EMBED_SCRIPT.getAttribute("data-base-url")) {
      return EMBED_SCRIPT.getAttribute("data-base-url").replace(/\/+$/, "");
    }

    if (EMBED_SCRIPT && EMBED_SCRIPT.src) {
      try {
        return new URL(EMBED_SCRIPT.src).origin;
      } catch (e) {}
    }

    var scripts = document.getElementsByTagName("script");

    for (var i = scripts.length - 1; i >= 0; i--) {
      var script = scripts[i];
      var src = script.src || "";

      if (src.indexOf("/embed.js") !== -1 || src.indexOf("app.woice.it.com") !== -1) {
        if (script.getAttribute("data-base-url")) {
          return script.getAttribute("data-base-url").replace(/\/+$/, "");
        }

        try {
          return new URL(src).origin;
        } catch (e) {}
      }
    }

    return "https://app.woice.it.com";
  })();

  if (Woice.__EMBED_RUNTIME__) {
    Woice.init();
    return;
  }

  Woice.__EMBED_RUNTIME__ = true;

  var processedNodes = new WeakSet();
  var visibilityObserver = null;
  var mutationObserver = null;
  var iframeListeners = [];

  function ensureRuntimeStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
      ".woice-embed-container{position:relative;display:block;}" +
      ".woice-embed-iframe{display:block;opacity:1;transition:opacity .2s ease;}" +
      ".woice-embed-fallback{" +
        "display:flex !important;" +
        "visibility:visible !important;" +
        "opacity:1 !important;" +
        "flex-direction:column;" +
        "align-items:center;" +
        "justify-content:center;" +
        "gap:10px;" +
        "width:100%;" +
        "min-height:96px;" +
        "padding:18px 20px;" +
        "border:none;" +
        "border-radius:16px;" +
        "background:transparent;" +
        "color:#334155;" +
        "font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;" +
        "font-size:14px;" +
        "font-weight:500;" +
        "text-align:center;" +
        "box-sizing:border-box;" +
        "line-height:1.4;" +
        "box-shadow:none;" +
      "}" +
      ".woice-embed-fallback__icon{" +
        "display:inline-flex;" +
        "align-items:center;" +
        "justify-content:center;" +
        "width:34px;" +
        "height:34px;" +
        "min-width:34px;" +
        "border-radius:999px;" +
        "background:#f1f5f9;" +
        "border:none;" +
        "color:#64748b;" +
      "}" +
      ".woice-embed-fallback__content{" +
        "display:flex;" +
        "flex-direction:column;" +
        "gap:4px;" +
        "min-width:0;" +
        "align-items:center;" +
      "}" +
      ".woice-embed-fallback__title{" +
        "margin:0;" +
        "font-size:14px;" +
        "font-weight:700;" +
        "color:#0f172a;" +
      "}" +
      ".woice-embed-fallback__message{" +
        "margin:0;" +
        "font-size:13px;" +
        "color:#334155;" +
      "}" +
      ".woice-embed-fallback__hint{" +
        "margin:2px 0 0;" +
        "font-size:12px;" +
        "color:#64748b;" +
        "opacity:.85;" +
      "}" +
      "@media (max-width:640px){" +
        ".woice-embed-fallback{" +
          "padding:14px;" +
          "border-radius:14px;" +
          "gap:10px;" +
        "}" +
        ".woice-embed-fallback__icon{" +
          "width:30px;" +
          "height:30px;" +
          "min-width:30px;" +
        "}" +
      "}";

    (document.head || document.documentElement).appendChild(style);
  }

  function resolveBaseUrl() {
    if (
      Woice.config &&
      typeof Woice.config.baseUrl === "string" &&
      Woice.config.baseUrl.trim()
    ) {
      return Woice.config.baseUrl.replace(/\/+$/, "");
    }

    return EMBED_BASE_URL;
  }

  function normalizeHeight(rawHeight) {
    if (!rawHeight || !String(rawHeight).trim()) return DEFAULT_HEIGHT;

    var value = String(rawHeight).trim();

    return /^\d+$/.test(value) ? value + "px" : value;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setFallbackText(container, message) {
    var configuredHeight =
      container.getAttribute("data-height") ||
      container.style.height ||
      DEFAULT_HEIGHT;

    var stableHeight = normalizeHeight(configuredHeight);

    container.innerHTML = "";

    container.style.cssText =
      "position:relative;" +
      "display:flex;" +
      "align-items:center;" +
      "justify-content:center;" +
      "width:100%;" +
      "height:" + stableHeight + ";" +
      "min-height:" + stableHeight + ";" +
      "max-height:" + stableHeight + ";" +
      "overflow:hidden;";

    ensureRuntimeStyles();

    var fallback = document.createElement("div");
    fallback.className = "woice-embed-fallback";
    fallback.innerHTML =
      '<span class="woice-embed-fallback__icon" aria-hidden="true">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" ' +
          'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" stroke-linejoin="round">' +
          '<circle cx="12" cy="12" r="10"></circle>' +
          '<line x1="12" y1="8" x2="12" y2="12"></line>' +
          '<line x1="12" y1="16" x2="12.01" y2="16"></line>' +
        "</svg>" +
      "</span>" +
      '<div class="woice-embed-fallback__content">' +
        '<p class="woice-embed-fallback__title">Couldn&#39;t load testimonials</p>' +
        '<p class="woice-embed-fallback__message">' + escapeHtml(message) + "</p>" +
        '<p class="woice-embed-fallback__hint">Please refresh the page and try again.</p>' +
      "</div>";

    container.appendChild(fallback);
  }

  function prepareContainer(container, height) {
    ensureRuntimeStyles();

    container.classList.add("woice-embed-container");
    container.style.cssText =
      "position:relative;" +
      "display:block;" +
      "width:100%;" +
      "height:" + height + ";" +
      "min-height:" + height + ";" +
      "overflow:hidden;";
  }

  function mountSkeleton(container, height) {
    prepareContainer(container, height);
  }

  function buildIframeUrl(baseUrl, slug, theme, layout) {
    var url = baseUrl + "/widget/slider/" + encodeURIComponent(slug);
    var params = ["embed=true"];

    if (theme) params.push("theme=" + encodeURIComponent(theme));
    if (layout) params.push("layout=" + encodeURIComponent(layout));

    return params.length ? url + "?" + params.join("&") : url;
  }

  function createIframe(src, height) {
    var iframe = document.createElement("iframe");

    iframe.src = src;
    iframe.title = "Woice testimonials";
    iframe.loading = "lazy";
    iframe.className = "woice-embed-iframe";
    iframe.style.width = "100%";
    iframe.style.border = "none";
    iframe.style.height = height;
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowtransparency", "true");

    return iframe;
  }

  function mountIframe(container, iframe) {
    var settled = false;
    var detached = false;
    var teardownMessageListener = null;
    var receivedResizeSignal = false;
    var loadHandshakeTimeoutId = null;

    var applyHeight = function (nextHeight) {
      if (!nextHeight || nextHeight < 120) return;

      var value = nextHeight + "px";

      iframe.style.height = value;
      container.style.height = value;
      container.style.minHeight = value;
    };

    var handleMessage = function (event) {
      if (detached) return;
      if (event.source !== iframe.contentWindow) return;
      if (!event.data) return;

      var type = event.data.type;

      if (type !== "RESIZE_IFRAME" && type !== "WOICE_WIDGET_HEIGHT") return;

      var nextHeight = Number(event.data.height);

      if (!Number.isFinite(nextHeight)) return;

      receivedResizeSignal = true;

      if (!settled) {
        settled = true;
        window.clearTimeout(timeoutId);
      }

      if (loadHandshakeTimeoutId) {
        window.clearTimeout(loadHandshakeTimeoutId);
        loadHandshakeTimeoutId = null;
      }

      applyHeight(Math.round(nextHeight));
    };

    window.addEventListener("message", handleMessage);

    teardownMessageListener = function () {
      if (detached) return;

      detached = true;
      window.removeEventListener("message", handleMessage);
    };

    iframeListeners.push(teardownMessageListener);

    var timeoutId = window.setTimeout(function () {
      if (settled) return;

      settled = true;
      teardownMessageListener();

      if (loadHandshakeTimeoutId) {
        window.clearTimeout(loadHandshakeTimeoutId);
        loadHandshakeTimeoutId = null;
      }

      setFallbackText(container, FALLBACK_MESSAGE);
    }, LOAD_TIMEOUT_MS);

    iframe.onload = function () {
      if (settled) return;

      if (loadHandshakeTimeoutId) {
        window.clearTimeout(loadHandshakeTimeoutId);
      }

      loadHandshakeTimeoutId = window.setTimeout(function () {
        if (settled || receivedResizeSignal) return;

        settled = true;
        window.clearTimeout(timeoutId);
        teardownMessageListener();
        setFallbackText(container, FALLBACK_MESSAGE);
      }, 2500);
    };

    iframe.onerror = function () {
      if (settled) return;

      settled = true;
      window.clearTimeout(timeoutId);

      if (loadHandshakeTimeoutId) {
        window.clearTimeout(loadHandshakeTimeoutId);
        loadHandshakeTimeoutId = null;
      }

      teardownMessageListener();
      setFallbackText(container, FALLBACK_MESSAGE);
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
      setFallbackText(container, FALLBACK_MESSAGE);
      return;
    }

    prepareContainer(container, config.height);

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
      processedNodes.has(node) ||
      node.getAttribute("data-woice-initialized") === "1"
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

    hydrateWidget(node);
  }

  function initNode(node) {
    if (!node || node.nodeType !== 1) return;
    if (isProcessed(node)) return;

    var config = readWidgetConfig(node);

    if (config.slug) {
      mountSkeleton(node, config.height);
    }

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

    for (var i = 0; i < iframeListeners.length; i++) {
      iframeListeners[i]();
    }

    iframeListeners = [];
  };

  onReady(Woice.init);
})(window, document);