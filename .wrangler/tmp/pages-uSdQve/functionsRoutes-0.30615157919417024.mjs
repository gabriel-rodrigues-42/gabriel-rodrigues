import { onRequestPost as __api_apoio_js_onRequestPost } from "/home/user/gabriel-rodrigues/functions/api/apoio.js"
import { onRequestGet as __api_apoios_js_onRequestGet } from "/home/user/gabriel-rodrigues/functions/api/apoios.js"
import { onRequestGet as __api_lema_js_onRequestGet } from "/home/user/gabriel-rodrigues/functions/api/lema.js"
import { onRequestPost as __api_lema_js_onRequestPost } from "/home/user/gabriel-rodrigues/functions/api/lema.js"
import { onRequest as __api_apoio_js_onRequest } from "/home/user/gabriel-rodrigues/functions/api/apoio.js"
import { onRequest as __api_apoios_js_onRequest } from "/home/user/gabriel-rodrigues/functions/api/apoios.js"
import { onRequest as __api_lema_js_onRequest } from "/home/user/gabriel-rodrigues/functions/api/lema.js"

export const routes = [
    {
      routePath: "/api/apoio",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_apoio_js_onRequestPost],
    },
  {
      routePath: "/api/apoios",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_apoios_js_onRequestGet],
    },
  {
      routePath: "/api/lema",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_lema_js_onRequestGet],
    },
  {
      routePath: "/api/lema",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_lema_js_onRequestPost],
    },
  {
      routePath: "/api/apoio",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_apoio_js_onRequest],
    },
  {
      routePath: "/api/apoios",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_apoios_js_onRequest],
    },
  {
      routePath: "/api/lema",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_lema_js_onRequest],
    },
  ]