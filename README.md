🖥️ SentimentApp - Frontend de Análisis de Sentimientos📋 Descripción del ProyectoSentimentApp es la interfaz de usuario moderna diseñada para interactuar con la SentimentAPI. Permite a los usuarios finales gestionar sus tareas, visualizar análisis de feedback y realizar cargas masivas de datos mediante archivos CSV para procesamiento automático.🏗️ Arquitectura del FrontendLa solución sigue el patrón de diseño de React basado en componentes y servicios:Plaintext┌─────────────────────────────────────────────────────────────────────┐
│                        React Frontend App                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐         ┌──────────────────────────────┐  │
│  │      🎨 UI Layer      │         │      ⚙️ Logic Layer          │  │
│  │   (Tailwind CSS)     │         │      (Services & Hooks)      │  │
│  │                      │         │                              │  │
│  │  • DashboardPage     │  ────►  │  • authService.js            │  │
│  │  • TasksPage (CSV)   │  ◄────  │  • sentimentService.js       │  │
│  │  • Auth Views        │         │  • api.js (Axios Config)     │  │
│  │                      │         │                              │  │
│  └──────────────────────┘         └──────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
📂 Estructura del DirectorioBasado en la arquitectura del sistema:config/: Punto de entrada de configuración.api.js: Instancia central de Axios para peticiones HTTP.pages/: Vistas principales de la aplicación.TasksPage.jsx: Módulo central para la gestión de tareas y upload de archivos.DashboardPage.jsx: Visualización de métricas de sentimientos.services/: Capa de abstracción de datos.authService.js: Lógica de Login y Registro.sentimentService.js: Integración con los resultados del modelo ML.utils/: Funciones auxiliares y formateadores.🚀 Módulos PrincipalesMóduloDescripciónTecnologíaAutenticaciónGestión de acceso de usuarios y persistencia de sesión.JWT / LocalStorageCarga MasivaProcesamiento y subida de archivos .csv para análisis.FormData APIDashboardVisualización de resultados de sentimientos en tiempo real.React StateDiseñoInterfaz responsiva y estilizada.Tailwind CSS🔄 Flujo de Carga de Archivos (.CSV)Para la integración de datos masivos, el sistema sigue este pipeline:Selección: El usuario carga el archivo en TasksPage.jsx.Validación: El cliente verifica que la extensión sea .csv.Encapsulamiento: Se utiliza FormData para preparar el archivo binario.Envío: El api.js dispara la petición al servidor con los headers necesarios (multipart/form-data).🛠️ Tecnologías UtilizadasCore: React 18+ (Vite)Estilos: Tailwind CSSCliente HTTP: AxiosIconografía: Lucide React / HeroiconsEnrutamiento: React Router DOM🔌 Ejemplo de Configuración de API (api.js)JavaScriptimport axios from 'axios';

const api = axios.create({
  baseURL: 'https://tu-backend-api.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
🚀 Próximos Pasos[ ] Implementar previsualización de tablas CSV antes de subir.[ ] Agregar gráficos dinámicos en el DashboardPage.[ ] Optimizar la validación de archivos en el cliente.[ ] Configurar despliegue automático en Vercel/Netlify.👥 EquipoProyecto desarrollado por "No Data - No Code" H12-25-L-Equipo 28 en el marco de la Hackatón ONE.
