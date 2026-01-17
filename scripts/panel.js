// ============ PANEL DE USUARIO ============
console.log("👤 Panel de usuario cargando...");

// Esperar a que Firebase esté listo
setTimeout(initPanel, 1000);

function initPanel() {
    console.log("🔄 Inicializando panel...");
    
    // Verificar autenticación
    if (!window.firebaseAuth) {
        console.error("❌ Firebase no disponible");
        redirectToLogin();
        return;
    }
    
    const auth = window.firebaseAuth;
    const db = window.firebaseDb;
    
    // Escuchar cambios en autenticación
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log("✅ Usuario autenticado:", user.email);
            loadUserData(user.uid, db);
            setupPanelEvents(auth, db);
        } else {
            console.log("❌ Usuario no autenticado");
            redirectToLogin();
        }
    });
    
    // Configurar navegación entre secciones
    setupNavigation();
}

function redirectToLogin() {
    console.log("🔒 Redirigiendo a login...");
    window.location.href = "index.html#login";
}

async function loadUserData(userId, db) {
    console.log("📊 Cargando datos del usuario:", userId);
    
    try {
        // Actualizar UI básica
        const user = window.firebaseAuth.currentUser;
        document.getElementById('userName').textContent = user.email.split('@')[0];
        document.getElementById('profileName').textContent = user.email.split('@')[0];
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('userId').textContent = userId.substring(0, 8) + '...';
        
        // Cargar datos de Firestore
        if (db) {
            const userDoc = await db.collection("users").doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                
                // Mostrar nombre si existe en Firestore
                if (userData.name) {
                    document.getElementById('userName').textContent = userData.name;
                    document.getElementById('profileName').textContent = userData.name;
                }
                
                // Mostrar fecha de registro
                if (userData.createdAt) {
                    const date = new Date(userData.createdAt);
                    document.getElementById('joinDate').textContent = 
                        date.toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        });
                }
                
                // Mostrar rol
                if (userData.role) {
                    document.getElementById('profileRole').textContent = 
                        userData.role === 'student' ? 'Estudiante' : 
                        userData.role === 'teacher' ? 'Profesor' : 'Administrador';
                }
            }
        }
        
    } catch (error) {
        console.error("❌ Error cargando datos:", error);
        showMessage("Error cargando datos del perfil", "error");
    }
}

function setupPanelEvents(auth, db) {
    console.log("🎯 Configurando eventos del panel...");
    
    // Botón de logout
    document.getElementById('logoutBtn').addEventListener('click', async function() {
        try {
            await auth.signOut();
            window.location.href = "index.html";
        } catch (error) {
            console.error("Error en logout:", error);
            showMessage("Error al cerrar sesión", "error");
        }
    });
    
    // Botón para editar perfil (podrías añadirlo después)
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-primary';
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Editar Perfil';
    editBtn.style.marginTop = '15px';
    editBtn.onclick = () => showMessage("Edición de perfil (próximamente)", "info");
    
    const profileDetails = document.querySelector('.profile-details');
    if (profileDetails) {
        profileDetails.appendChild(editBtn);
    }
}

function setupNavigation() {
    console.log("🗺️ Configurando navegación...");
    
    // Navegación entre secciones
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            
            // Actualizar elementos activos
            document.querySelectorAll('.nav-item').forEach(nav => {
                nav.classList.remove('active');
            });
            this.classList.add('active');
            
            // Mostrar sección correspondiente
            document.querySelectorAll('.panel-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

function showMessage(text, type = 'info') {
    const message = document.createElement('div');
    message.className = 'panel-message';
    message.textContent = text;
    
    const bgColor = type === 'error' ? '#ef4444' : 
                   type === 'success' ? '#10b981' : '#3b82f6';
    
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
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 4000);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ DOM del panel cargado");
});