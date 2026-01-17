// ============ SISTEMA DE AUTENTICACIÓN SIMPLIFICADO ============
console.log("🔐 AuthSystem cargando...");

let auth = null;
let db = null;

document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que Firebase esté completamente listo
    setTimeout(initAuthSystem, 1000);
});

function initAuthSystem() {
    console.log("🔄 Iniciando sistema de autenticación...");
    
    // Verificar que Firebase esté disponible
    if (!window.firebaseAuth || !window.firebaseDb) {
        console.error("❌ Firebase no disponible - reintentando en 2 segundos");
        setTimeout(initAuthSystem, 2000);
        return;
    }
    
    auth = window.firebaseAuth;
    db = window.firebaseDb;
    
    console.log("✅ Firebase auth y db inicializados");
    
    // Configurar eventos solo una vez
    setupAuthEvents(auth, db);
    
    // Verificar si ya hay usuario logueado
    if (auth) {
        auth.onAuthStateChanged(function(user) {
            console.log("📊 Estado auth:", user ? user.email : "no user");
            if (user) {
                updateUI(user.email);
                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('isLoggedIn', 'true');
            } else {
                updateUI(null);
                localStorage.removeItem('userEmail');
                localStorage.removeItem('isLoggedIn');
            }
        });
    } else {
        console.error("❌ Auth no inicializado");
    }
    
    console.log("✅ AuthSystem listo");
}

function setupAuthEvents(auth, db) {
    console.log("🎯 Configurando eventos...");
    
    if (!auth) {
        console.error("❌ Auth no disponible para eventos");
        return;
    }
    
    // 1. Botón para abrir modal SOLO si no hay usuario
    const desktopBtn = document.getElementById('desktopLoginBtn');
    
    if (desktopBtn) {
        desktopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Solo abrir modal si NO hay usuario logueado
            if (!auth.currentUser) {
                openAuthModal();
            }
            // Si hay usuario, no hacer nada (botón oculto)
        });
    }
    
    // 2. Botón móvil
    const mobileBtn = document.getElementById('loginBtn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!auth.currentUser) {
                openAuthModal();
            }
        });
    }
    
    // 3. Cerrar modal
    document.getElementById('closeModal')?.addEventListener('click', closeAuthModal);
    
    // 4. Formularios
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm && auth) {
        loginForm.addEventListener('submit', (e) => handleLogin(e, auth));
    }
    
    if (registerForm && auth && db) {
        registerForm.addEventListener('submit', (e) => handleRegister(e, auth, db));
    }
    
    // 5. Pestañas (login/register)
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            
            // Actualizar pestañas activas
            document.querySelectorAll('.auth-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            // Actualizar formularios activos
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.remove('active');
                if (form.id === `${tabId}Form`) {
                    form.classList.add('active');
                }
            });
        });
    });
    
    // 6. Enlaces para cambiar entre login/register
    document.querySelectorAll('.switch-tab').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            const tabElement = document.querySelector(`.auth-tab[data-tab="${tabId}"]`);
            if (tabElement) {
                tabElement.click();
            }
        });
    });
    
    // 7. Cerrar modal al hacer clic fuera
    document.getElementById('authModal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeAuthModal();
        }
    });
}

// ============ FUNCIONES PRINCIPALES ============
async function handleLogin(e, auth) {
    e.preventDefault();
    console.log("🔄 Procesando login...");
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Validación básica
    if (!email || !password) {
        showMessage('Por favor, completa todos los campos', 'error');
        return;
    }
    
    const submitBtn = e.target.querySelector('.form-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Iniciando...';
    submitBtn.disabled = true;
    
    try {
        // Importar la función dinámicamente
        const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("✅ Login exitoso:", userCredential.user.email);
        
        showMessage('✅ ¡Inicio de sesión exitoso!', 'success');
        closeAuthModal();
        updateUI(userCredential.user.email);
        
    } catch (error) {
        console.error("❌ Error en login:", error.code, error.message);
        showMessage(getErrorMessage(error.code), 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function handleRegister(e, auth, db) {
    e.preventDefault();
    console.log("🔄 Procesando registro...");
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Validaciones
    if (!name || !email || !password || !confirmPassword) {
        showMessage('Por favor, completa todos los campos', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Las contraseñas no coinciden', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    const submitBtn = e.target.querySelector('.form-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Registrando...';
    submitBtn.disabled = true;
    
    try {
        // Importar funciones dinámicamente
        const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        
        // 1. Crear usuario en Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("✅ Usuario creado:", userCredential.user.uid);
        
        // 2. Guardar datos adicionales en Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
            name: name,
            email: email,
            role: "student",
            createdAt: new Date().toISOString()
        });
        console.log("✅ Datos guardados en Firestore");
        
        showMessage('🎉 ¡Registro exitoso! Bienvenido/a', 'success');
        closeAuthModal();
        updateUI(userCredential.user.email);
        
    } catch (error) {
        console.error("❌ Error en registro:", error.code, error.message);
        showMessage(getErrorMessage(error.code), 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// ============ FUNCIONES AUXILIARES ============
function openAuthModal() {
    console.log("📱 Abriendo modal...");
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = getScrollbarWidth() + 'px';
        
        // Ajustar para responsive
        adjustModalForScreen();
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        document.body.style.paddingRight = '0';
        
        // Limpiar formularios
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        if (loginForm) loginForm.reset();
        if (registerForm) registerForm.reset();
    }
}

function updateUI(email) {
    console.log("🎨 Actualizando UI para:", email || "logout");
    
    const desktopBtn = document.getElementById('desktopLoginBtn');
    const mobileBtn = document.getElementById('loginBtn');
    const panelLink = document.getElementById('panelLink');
    
    if (email) {
        // Usuario CONECTADO
        console.log("✅ Usuario conectado, mostrando panel");
        
        // 1. Ocultar botones de login
        if (desktopBtn) {
            desktopBtn.style.display = 'none';
        }
        if (mobileBtn) {
            mobileBtn.style.display = 'none';
        }
        
        // 2. Mostrar "Mi Panel" en navbar
        if (panelLink) {
            panelLink.style.display = 'flex';
        }
        
    } else {
        // Usuario DESCONECTADO
        console.log("❌ Usuario desconectado, ocultando panel");
        
        // 1. Mostrar botones de login
        if (desktopBtn) {
            desktopBtn.style.display = 'flex';
            desktopBtn.innerHTML = '<i class="fas fa-user"></i> Iniciar Sesión';
        }
        if (mobileBtn) {
            mobileBtn.style.display = 'flex';
            mobileBtn.innerHTML = '<i class="fas fa-user"></i> Iniciar Sesión';
        }
        
        // 2. Ocultar "Mi Panel" en navbar
        if (panelLink) {
            panelLink.style.display = 'none';
        }
    }
}
// Manejar cambios de tamaño de pantalla para mostrar/ocultar panel link
window.addEventListener('resize', function() {
    const userEmail = localStorage.getItem('userEmail');
    const panelLink = document.getElementById('panelLink');
    const footerPanelLink = document.getElementById('footerPanelLink');
    
    if (userEmail) {
        if (window.innerWidth > 992) {
            // Desktop: mostrar en navbar
            if (panelLink) panelLink.style.display = 'flex';
            if (footerPanelLink) footerPanelLink.style.display = 'none';
        } else {
            // Móvil/Tablet: ocultar en navbar, mostrar en footer solo en móvil pequeño
            if (panelLink) panelLink.style.display = 'none';
            if (footerPanelLink) {
                if (window.innerWidth <= 768) {
                    footerPanelLink.style.display = 'block';
                } else {
                    footerPanelLink.style.display = 'none';
                }
            }
        }
    }
});

// Verificar estado al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const userEmail = localStorage.getItem('userEmail');
        
        if (isLoggedIn === 'true' && userEmail) {
            // Si hay usuario en localStorage pero Firebase aún no ha cargado
            updateUI(userEmail);
        }
    }, 1500);
});

// Función para ajustar modal en pantallas pequeñas
function adjustModalForScreen() {
    const modal = document.getElementById('authModal');
    const authModal = document.querySelector('.auth-modal');
    
    if (!modal || !authModal) return;
    
    if (window.innerWidth <= 768) {
        authModal.style.width = '95%';
        authModal.style.maxWidth = '95%';
        authModal.style.margin = '10px';
        authModal.style.maxHeight = '90vh';
        authModal.style.overflowY = 'auto';
        
        // Ajustar inputs para móviles
        document.querySelectorAll('.auth-form input').forEach(input => {
            input.style.fontSize = '16px';
        });
    } else {
        authModal.style.width = '';
        authModal.style.maxWidth = '400px';
        authModal.style.margin = '';
        authModal.style.maxHeight = '';
        authModal.style.overflowY = '';
    }
}

// Calcular ancho de scrollbar
function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
}

async function logout() {
    try {
        // Importar signOut dinámicamente
        const { signOut } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');
        await signOut(window.firebaseAuth);
        showMessage('✅ Sesión cerrada correctamente', 'success');
        updateUI(null);
    } catch (error) {
        console.error("Error en logout:", error);
        showMessage('Error al cerrar sesión', 'error');
    }
}

function getErrorMessage(errorCode) {
    const messages = {
        'auth/email-already-in-use': 'Este email ya está registrado',
        'auth/invalid-email': 'Email inválido',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
        'auth/user-not-found': 'Usuario no encontrado',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
        'auth/operation-not-allowed': 'La autenticación por email no está habilitada. Actívala en Firebase Console'
    };
    return messages[errorCode] || 'Error desconocido. Intenta nuevamente';
}

function showMessage(text, type = 'info') {
    // Eliminar mensajes anteriores
    document.querySelectorAll('.auth-message').forEach(msg => msg.remove());
    
    const message = document.createElement('div');
    message.className = 'auth-message';
    message.textContent = text;
    
    const bgColor = type === 'success' ? '#10b981' : 
                    type === 'error' ? '#ef4444' : '#3b82f6';
    
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 90%;
        word-break: break-word;
    `;
    
    // Añadir animación
    if (!document.querySelector('#auth-animations')) {
        const style = document.createElement('style');
        style.id = 'auth-animations';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(message);
    
    // Auto-eliminar después de 4 segundos
    setTimeout(() => {
        message.style.opacity = '0';
        message.style.transition = 'opacity 0.3s';
        setTimeout(() => message.remove(), 300);
    }, 4000);
}

// Exponer funciones globalmente para HTML
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;

// Ajustar responsive cuando cambie el tamaño de la ventana
window.addEventListener('resize', function() {
    const modal = document.getElementById('authModal');
    if (modal && modal.classList.contains('active')) {
        adjustModalForScreen();
    }
});