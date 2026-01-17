// Sistema de cookies

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del sistema de cookies
    const cookiesBanner = document.getElementById('cookiesBanner');
    const cookiesModal = document.getElementById('cookiesModal');
    const cookiesManageBtn = document.getElementById('cookiesManageBtn');
    const acceptCookiesBtn = document.getElementById('acceptCookiesBtn');
    const rejectCookiesBtn = document.getElementById('rejectCookiesBtn');
    const configureCookiesBtn = document.getElementById('configureCookiesBtn');
    const closeCookiesModal = document.getElementById('closeCookiesModal');
    const savePreferencesBtn = document.getElementById('savePreferencesBtn');
    const acceptAllModalBtn = document.getElementById('acceptAllModalBtn');
    const cookiesPolicyLink = document.getElementById('cookiesPolicyLink');
    
    // Selectores de checkboxes
    const preferenceCookies = document.getElementById('preferenceCookies');
    const analyticsCookies = document.getElementById('analyticsCookies');
    const marketingCookies = document.getElementById('marketingCookies');
    
    // Nombres de las cookies
    const COOKIE_CONSENT = 'cambetera_cookie_consent';
    const COOKIE_PREFERENCES = 'cambetera_cookie_preferences';
    
    // Función para comprobar si el usuario ya ha tomado una decisión sobre las cookies
    function checkCookieConsent() {
        return localStorage.getItem(COOKIE_CONSENT) !== null;
    }
    
    // Función para mostrar u ocultar el banner de cookies
    function toggleCookiesBanner() {
        const hasConsent = checkCookieConsent();
        
        if (!hasConsent) {
            // Mostrar banner después de 1 segundo
            setTimeout(() => {
                cookiesBanner.classList.add('active');
            }, 1000);
        } else {
            cookiesBanner.classList.remove('active');
            // Mostrar botón flotante para gestionar cookies
            cookiesManageBtn.classList.add('active');
        }
    }
    
    // Función para establecer las cookies según las preferencias
    function setCookiePreferences(preferences) {
        // Guardar consentimiento general
        localStorage.setItem(COOKIE_CONSENT, 'true');
        
        // Guardar preferencias específicas
        localStorage.setItem(COOKIE_PREFERENCES, JSON.stringify(preferences));
        
        // Aplicar cookies según las preferencias
        applyCookiePreferences(preferences);
        
        // Ocultar banner y mostrar botón de gestión
        cookiesBanner.classList.remove('active');
        cookiesManageBtn.classList.add('active');
        cookiesModal.classList.remove('active');
        
        // Mostrar confirmación
        showCookieConfirmation(preferences);
    }
    
    // Función para aplicar las preferencias de cookies
    function applyCookiePreferences(preferences) {
        // Cookies técnicas siempre están activas (necesarias)
        console.log('Cookies técnicas aplicadas (siempre activas)');
        
        // Cookies de preferencias
        if (preferences.preference) {
            console.log('Cookies de preferencias aplicadas');
            // Aquí iría el código para activar cookies de preferencias
        } else {
            console.log('Cookies de preferencias desactivadas');
            // Aquí iría el código para desactivar cookies de preferencias
        }
        
        // Cookies analíticas
        if (preferences.analytics) {
            console.log('Cookies analíticas aplicadas');
            // Ejemplo: Código de Google Analytics (simulado)
            // window.dataLayer = window.dataLayer || [];
            // function gtag(){dataLayer.push(arguments);}
            // gtag('js', new Date());
            // gtag('config', 'UA-XXXXX-Y');
        } else {
            console.log('Cookies analíticas desactivadas');
        }
        
        // Cookies de marketing
        if (preferences.marketing) {
            console.log('Cookies de marketing aplicadas');
            // Aquí iría el código para activar cookies de marketing
        } else {
            console.log('Cookies de marketing desactivadas');
        }
    }
    
    // Función para cargar preferencias guardadas
    function loadCookiePreferences() {
        const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES);
        
        if (savedPreferences) {
            const preferences = JSON.parse(savedPreferences);
            
            // Actualizar checkboxes con las preferencias guardadas
            preferenceCookies.checked = preferences.preference || false;
            analyticsCookies.checked = preferences.analytics || false;
            marketingCookies.checked = preferences.marketing || false;
            
            return preferences;
        }
        
        // Valores por defecto si no hay preferencias guardadas
        return {
            preference: false,
            analytics: false,
            marketing: false
        };
    }
    
    // Función para mostrar confirmación de cookies
    function showCookieConfirmation(preferences) {
        // Crear elemento de confirmación
        const confirmation = document.createElement('div');
        confirmation.className = 'cookie-confirmation';
        confirmation.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: var(--primary-dark); color: white; padding: 15px 20px; border-radius: var(--border-radius); box-shadow: var(--shadow); z-index: 9999; max-width: 300px;">
                <p style="margin: 0; font-size: 0.9rem;">
                    <i class="fas fa-check-circle" style="color: var(--accent); margin-right: 8px;"></i>
                    Preferencias de cookies guardadas correctamente.
                </p>
            </div>
        `;
        
        document.body.appendChild(confirmation);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            confirmation.remove();
        }, 3000);
    }
    
    // Función para mostrar política de cookies (simulada)
    function showCookiesPolicy() {
        // En una implementación real, esto llevaría a una página de política de cookies
        // Por ahora, mostramos un modal informativo
        alert(`Política de Cookies de CAM Betera

En cumplimiento con la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico, y el Reglamento General de Protección de Datos (RGPD), le informamos sobre las cookies utilizadas en nuestro sitio web.

1. ¿Qué son las cookies?
Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web.

2. Tipos de cookies que utilizamos:
- Cookies técnicas: Necesarias para el funcionamiento del sitio.
- Cookies de preferencias: Permiten recordar sus ajustes.
- Cookies analíticas: Nos ayudan a mejorar el sitio web.
- Cookies de marketing: Para mostrar publicidad relevante.

3. Cómo gestionar las cookies:
Puede configurar sus preferencias en cualquier momento utilizando el botón "Cookies" en la esquina inferior derecha.

Para más información, consulte nuestra Política de Privacidad completa.`);
    }
    
    // Event Listeners para cookies
    
    // Aceptar todas las cookies
    acceptCookiesBtn.addEventListener('click', () => {
        setCookiePreferences({
            preference: true,
            analytics: true,
            marketing: true
        });
    });
    
    // Rechazar todas excepto las técnicas
    rejectCookiesBtn.addEventListener('click', () => {
        setCookiePreferences({
            preference: false,
            analytics: false,
            marketing: false
        });
    });
    
    // Abrir modal de configuración
    configureCookiesBtn.addEventListener('click', () => {
        cookiesModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Cargar preferencias actuales en los checkboxes
        const currentPreferences = loadCookiePreferences();
        preferenceCookies.checked = currentPreferences.preference;
        analyticsCookies.checked = currentPreferences.analytics;
        marketingCookies.checked = currentPreferences.marketing;
    });
    
    // Cerrar modal de cookies
    closeCookiesModal.addEventListener('click', () => {
        cookiesModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    // Guardar preferencias personalizadas
    savePreferencesBtn.addEventListener('click', () => {
        const preferences = {
            preference: preferenceCookies.checked,
            analytics: analyticsCookies.checked,
            marketing: marketingCookies.checked
        };
        
        setCookiePreferences(preferences);
    });
    
    // Aceptar todas desde el modal
    acceptAllModalBtn.addEventListener('click', () => {
        preferenceCookies.checked = true;
        analyticsCookies.checked = true;
        marketingCookies.checked = true;
        
        const preferences = {
            preference: true,
            analytics: true,
            marketing: true
        };
        
        setCookiePreferences(preferences);
    });
    
    // Enlace a política de cookies
    cookiesPolicyLink.addEventListener('click', (e) => {
        e.preventDefault();
        showCookiesPolicy();
    });
    
    // Botón flotante para gestionar cookies
    cookiesManageBtn.addEventListener('click', () => {
        cookiesModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Cargar preferencias actuales
        const currentPreferences = loadCookiePreferences();
        preferenceCookies.checked = currentPreferences.preference;
        analyticsCookies.checked = currentPreferences.analytics;
        marketingCookies.checked = currentPreferences.marketing;
    });
    
    // Cerrar modal de cookies al hacer clic fuera
    cookiesModal.addEventListener('click', (e) => {
        if (e.target === cookiesModal) {
            cookiesModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
    
    // Inicializar sistema de cookies cuando se carga la página
    toggleCookiesBanner();
    
    // Si ya hay consentimiento, cargar preferencias
    if (checkCookieConsent()) {
        const preferences = loadCookiePreferences();
        applyCookiePreferences(preferences);
    }
});