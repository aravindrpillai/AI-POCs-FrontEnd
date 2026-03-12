(function (window, document) {
  "use strict";

  // CONFIG
  //var WIDGET_ORIGIN = "http://localhost:8080";
  var WIDGET_ORIGIN = "https://ai.aravindpillai.com";
  var IFRAME_URL = WIDGET_ORIGIN + "/claims";
  var Z_INDEX = 2147483646;

  // ===============================
  // INTERNAL STATE
  // ===============================
  var state = {
    open: false,
    container: null,
    iframe: null,
    overlay: null,
    originalBodyOverflow: null,
    payload: null,
  };

  // ===============================
  // UTILS
  // ===============================
  function isMobile() {
    return window.matchMedia("(max-width: 600px)").matches;
  }

  function lockScroll() {
    state.originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  function unlockScroll() {
    document.body.style.overflow = state.originalBodyOverflow || "";
  }

  // ===============================
  // OVERLAY
  // ===============================
  function createOverlay() {
    var overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(15,23,42,0.35)";
    overlay.style.backdropFilter = "blur(8px)";
    overlay.style.webkitBackdropFilter = "blur(8px)";
    overlay.style.zIndex = Z_INDEX - 1;
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.25s ease";
    return overlay;
  }

  // ===============================
  // CONTAINER
  // ===============================
  function createContainer() {
    var container = document.createElement("div");
    container.style.position = "fixed";
    container.style.zIndex = Z_INDEX;
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.background = "#ffffff";
    container.style.overflow = "hidden";
    container.style.opacity = "0";
    container.style.transform = "translateY(20px)";
    container.style.transition = "opacity 0.25s ease, transform 0.25s ease";
    applyContainerLayout(container);
    return container;
  }

  function applyContainerLayout(container) {
    if (isMobile()) {
      container.style.width = "100%";
      container.style.height = "100%";
      container.style.top = "0";
      container.style.left = "0";
      container.style.borderRadius = "0";
      container.style.boxShadow = "none";
    } else {
      container.style.width = "420px";
      container.style.height = "620px";
      container.style.bottom = "24px";
      container.style.right = "24px";
      container.style.borderRadius = "16px";
      container.style.boxShadow = "0 30px 60px rgba(0,0,0,0.25)";
    }
  }

  // ===============================
  // HEADER
  // ===============================
  function createHeader() {
    var header = document.createElement("div");
    header.style.height = "52px";
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.justifyContent = "space-between";
    header.style.padding = "0 16px";
    header.style.borderBottom = "1px solid #e5e7eb";
    header.style.background = "#ffffff";
    header.style.flexShrink = "0";

    var title = document.createElement("div");
    title.textContent = "GFT-Claim-AI";
    title.style.fontWeight = "700";
    title.style.fontSize = "15px";
    title.style.color = "#0f172a";

    var closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    closeBtn.style.border = "none";
    closeBtn.style.background = "transparent";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.fontSize = "18px";
    closeBtn.onclick = closeWidget;

    header.appendChild(title);
    header.appendChild(closeBtn);

    return header;
  }

  // ===============================
  // IFRAME
  // ===============================
  function createIframe() {
    var iframe = document.createElement("iframe");
    iframe.src = buildIframeUrl();
    iframe.allow = "clipboard-read; clipboard-write; camera; microphone";
    iframe.style.border = "none";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.flex = "1";
    iframe.style.background = "#ffffff";
    return iframe;
  }

  // ===============================
  // OPEN / CLOSE
  // ===============================
  function openWidget(payload) {
    if (state.open) return;

    state.payload = payload || {};

    state.overlay = createOverlay();
    state.container = createContainer();
    var header = createHeader();
    state.iframe = createIframe();

    state.container.appendChild(header);
    state.container.appendChild(state.iframe);

    document.body.appendChild(state.overlay);
    document.body.appendChild(state.container);

    lockScroll();

    requestAnimationFrame(function () {
      state.overlay.style.opacity = "1";
      state.container.style.opacity = "1";
      state.container.style.transform = "translateY(0)";
    });

    state.open = true;
  }

  function closeWidget() {
    if (!state.open) return;

    unlockScroll();

    state.overlay.style.opacity = "0";
    state.container.style.opacity = "0";
    state.container.style.transform = "translateY(20px)";

    setTimeout(function () {
      if (state.overlay) state.overlay.remove();
      if (state.container) state.container.remove();

      state.open = false;
      state.container = null;
      state.iframe = null;
      state.overlay = null;
      state.payload = null;
    }, 250);
  }


  function buildIframeUrl() {
    var baseUrl = IFRAME_URL;
    var params = new URLSearchParams();
    var payload = state.payload || {};

    if (payload.company) {
      params.set("company", payload.company);
    }

    if (payload.email) {
      params.set("email", payload.email);
    }

    if (payload.name) {
      params.set("name", payload.name);
    }
    
    if (payload.policynumber) {
      params.set("policynumber", payload.policynumber);
    }
    
    if (payload.policynumber) {
      params.set("mobile", payload.mobile);
    }

    return baseUrl + "?" + params.toString();
  }

  // ===============================
  // MESSAGE LISTENER
  // ===============================
  window.addEventListener("message", function (event) {
    if (event.origin !== WIDGET_ORIGIN) return;

    var data = event.data;
    if (!data || !data.type) return;

    switch (data.type) {
      case "CLOSE_WIDGET":
        closeWidget();
        break;

      case "IFRAME_CALLBACK_EVENT":
        handleIframeCallback(data.payload);
        break;
    }
  });

  function handleIframeCallback(data) {
    console.log("IFrame Call back :", data);

    var shape = data && data.shape;

    if (window.MyWidget.onResult) {
      window.MyWidget.onResult({ shape: shape });
    }

    closeWidget();
  }

  // ===============================
  // RESPONSIVE
  // ===============================
  window.addEventListener("resize", function () {
    if (state.container && state.open) {
      applyContainerLayout(state.container);
    }
  });

  // ===============================
  // PUBLIC API
  // ===============================
  window.MyWidget = window.MyWidget || {};

  window.MyWidget.onResult =
    window.MyWidget.onResult ||
    function (data) {
      try {
        var el = document.getElementById("claim-ai-popup");
        if (!el) return;

        el.innerHTML =
          "<br/>From Claims AI : Your claim ref number is <strong>" +
          data.shape +
          "</strong><br/>";
      } catch (e) {
        console.warn("CLAIM-AI - default onResult failed", e);
      }
    };

  window.MyWidget.initiateHandler = function (payload) {
    openWidget(payload);
  };

  window.MyWidget.close = closeWidget;
})(window, document);