// ==================== FIREBASE DATA MANAGER ====================
// Gestión de datos con Firestore para CAM Betera

class FirebaseDataManager {
    constructor() {
        if (typeof firebaseDb === 'undefined') {
            console.error('Firebase Firestore no está disponible');
            return;
        }
        
        this.db = window.firebaseDb;
        console.log('Gestor de datos Firebase inicializado');
    }

    // ==================== EVENTOS ====================
    
    async getEvents(limit = 10) {
        try {
            const { collection, query, orderBy, limit: firestoreLimit, getDocs } = 
                await import("https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js");
            
            const eventsRef = collection(this.db, "eventos");
            const q = query(
                eventsRef, 
                orderBy("fecha", "asc"),
                firestoreLimit(limit)
            );
            
            const querySnapshot = await getDocs(q);
            const events = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                events.push({
                    id: doc.id,
                    titulo: data.titulo || '',
                    descripcion: data.descripcion || '',
                    fecha: data.fecha ? this.formatDate(data.fecha) : '',
                    hora: data.hora || '',
                    lugar: data.lugar || '',
                    tipo: data.tipo || 'concierto',
                    imagen: data.imagen || 'https://via.placeholder.com/400x200?text=Evento+CAM+Betera'
                });
            });
            
            console.log(`Eventos obtenidos: ${events.length}`);
            return events;
            
        } catch (error) {
            console.error('Error al obtener eventos:', error);
            return this.getSampleEvents(); // Datos de ejemplo
        }
    }

    async createEvent(eventData) {
        try {
            const { collection, addDoc, serverTimestamp } = 
                await import("https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js");
            
            const eventsRef = collection(this.db, "eventos");
            
            const newEvent = {
                ...eventData,
                fechaCreacion: serverTimestamp(),
                fechaActualizacion: serverTimestamp()
            };
            
            const docRef = await addDoc(eventsRef, newEvent);
            
            return { 
                success: true, 
                message: 'Evento creado exitosamente',
                eventId: docRef.id 
            };
            
        } catch (error) {
            console.error('Error al crear evento:', error);
            return { success: false, message: 'Error al crear evento' };
        }
    }

    // ==================== CURSOS ====================
    
    async getCourses(limit = 6) {
        try {
            const { collection, query, orderBy, limit: firestoreLimit, getDocs } = 
                await import("https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js");
            
            const coursesRef = collection(this.db, "cursos");
            const q = query(
                coursesRef, 
                orderBy("fechaCreacion", "desc"),
                firestoreLimit(limit)
            );
            
            const querySnapshot = await getDocs(q);
            const courses = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                courses.push({
                    id: doc.id,
                    titulo: data.titulo || '',
                    descripcion: data.descripcion || '',
                    nivel: data.nivel || 'principiante',
                    duracion: data.duracion || 0,
                    precio: data.precio || 0,
                    plazas: data.plazas || 0,
                    instructor: data.instructor || '',
                    fechaInicio: data.fechaInicio ? this.formatDate(data.fechaInicio) : '',
                    fechaFin: data.fechaFin ? this.formatDate(data.fechaFin) : '',
                    imagen: data.imagen || 'https://via.placeholder.com/400x200?text=Curso+Musical'
                });
            });
            
            console.log(`Cursos obtenidos: ${courses.length}`);
            return courses;
            
        } catch (error) {
            console.error('Error al obtener cursos:', error);
            return this.getSampleCourses();
        }
    }

    async enrollInCourse(courseId, userId) {
        try {
            const { doc, setDoc, serverTimestamp } = 
                await import("https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js");
            
            const enrollmentId = `${userId}_${courseId}`;
            
            await setDoc(doc(this.db, "inscripciones", enrollmentId), {
                usuarioId: userId,
                cursoId: courseId,
                fechaInscripcion: serverTimestamp(),
                estado: 'activo'
            });
            
            return { 
                success: true, 
                message: '¡Inscripción exitosa! Te has matriculado en el curso.' 
            };
            
        } catch (error) {
            console.error('Error al inscribirse:', error);
            return { 
                success: false, 
                message: 'Error al realizar la inscripción. Intenta nuevamente.' 
            };
        }
    }

    // ==================== BANDAS/AGRUPACIONES ====================
    
    async getBands() {
        try {
            const { collection, query, orderBy, getDocs } = 
                await import("https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js");
            
            const bandsRef = collection(this.db, "bandas");
            const q = query(bandsRef, orderBy("nombre"));
            
            const querySnapshot = await getDocs(q);
            const bands = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                bands.push({
                    id: doc.id,
                    nombre: data.nombre || '',
                    descripcion: data.descripcion || '',
                    tipo: data.tipo || '',
                    nivel: data.nivel || '',
                    imagen: data.imagen || 'https://via.placeholder.com/400x200?text=Agrupación+Musical'
                });
            });
            
            return bands.length > 0 ? bands : this.getSampleBands();
            
        } catch (error) {
            console.error('Error al obtener bandas:', error);
            return this.getSampleBands();
        }
    }

    // ==================== USUARIOS ====================
    
    async getUserEnrollments(userId) {
        try {
            const { collection, query, where, getDocs } = 
                await import("https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js");
            
            const enrollmentsRef = collection(this.db, "inscripciones");
            const q = query(enrollmentsRef, where("usuarioId", "==", userId));
            
            const querySnapshot = await getDocs(q);
            const enrollments = [];
            
            querySnapshot.forEach((doc) => {
                enrollments.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return enrollments;
            
        } catch (error) {
            console.error('Error al obtener inscripciones:', error);
            return [];
        }
    }

    // ==================== FUNCIONES DE UTILIDAD ====================
    
    formatDate(timestamp) {
        if (!timestamp) return '';
        
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formateando fecha:', error);
            return '';
        }
    }

    // ==================== DATOS DE EJEMPLO ====================
    
    getSampleEvents() {
        return [
            {
                id: '1',
                titulo: 'Concierto de Navidad',
                descripcion: 'Concierto de la Banda Sinfónica de CAM Betera',
                fecha: '21 de diciembre de 2024',
                hora: '20:30h',
                lugar: 'Auditorio Municipal',
                tipo: 'concierto',
                imagen: 'https://www.betera.com/wp-content/uploads/2025/11/IMG_0907-2048x1024.jpeg'
            },
            {
                id: '2',
                titulo: 'Audiciones de Navidad',
                descripcion: 'Pruebas de acceso para nuevos alumnos',
                fecha: '22 de diciembre de 2024',
                hora: '17:00-20:00h',
                lugar: 'Sede CAM Betera',
                tipo: 'audicion',
                imagen: 'https://www.betera.com/wp-content/uploads/2022/11/CAM-5.jpg'
            }
        ];
    }

    getSampleCourses() {
        return [
            {
                id: '1',
                titulo: 'Música Temprana (3-6 años)',
                descripcion: 'Iniciación musical para los más pequeños',
                nivel: 'principiante',
                duracion: 30,
                precio: 45,
                plazas: 15,
                instructor: 'María Gómez',
                fechaInicio: 'Enero 2025',
                fechaFin: 'Junio 2025',
                imagen: 'https://via.placeholder.com/400x200?text=Música+Temprana'
            },
            {
                id: '2',
                titulo: 'Grado Elemental de Piano',
                descripcion: 'Formación reglada para estudiantes de piano',
                nivel: 'intermedio',
                duracion: 60,
                precio: 65,
                plazas: 10,
                instructor: 'Carlos Ruiz',
                fechaInicio: 'Enero 2025',
                fechaFin: 'Junio 2025',
                imagen: 'https://via.placeholder.com/400x200?text=Piano'
            }
        ];
    }

    getSampleBands() {
        return [
            {
                id: '1',
                nombre: 'Banda Sinfónica',
                descripcion: 'Formación principal con más de 70 músicos',
                tipo: 'sinfonica',
                nivel: 'avanzado',
                imagen: 'https://www.betera.com/wp-content/uploads/2025/11/IMG_0907-2048x1024.jpeg'
            },
            {
                id: '2',
                nombre: 'Banda Juvenil',
                descripcion: 'Para jóvenes músicos en formación',
                tipo: 'juvenil',
                nivel: 'intermedio',
                imagen: 'https://www.betera.com/wp-content/uploads/2022/11/CAM-5.jpg'
            }
        ];
    }

    // ==================== FUNCIONES DE RENDERIZADO ====================
    
    async renderEvents(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const events = await this.getEvents();
        
        if (events.length === 0) {
            container.innerHTML = '<p>No hay eventos programados por el momento.</p>';
            return;
        }
        
        let html = '';
        events.forEach(event => {
            html += `
                <div class="event-card">
                    <div class="event-date">
                        <div class="day">${this.getDayFromDate(event.fecha)}</div>
                        <div class="month">${this.getMonthFromDate(event.fecha)}</div>
                    </div>
                    <div class="event-info">
                        <h3>${event.titulo}</h3>
                        <p>${event.descripcion}</p>
                        <div class="event-meta">
                            <span><i class="fas fa-clock"></i> ${event.hora}</span>
                            <span><i class="fas fa-map-marker-alt"></i> ${event.lugar}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    async renderCourses(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const courses = await this.getCourses();
        
        if (courses.length === 0) {
            container.innerHTML = '<p>No hay cursos disponibles por el momento.</p>';
            return;
        }
        
        let html = '';
        courses.forEach(course => {
            html += `
                <div class="service-card">
                    <div class="service-icon">
                        <i class="fas fa-music"></i>
                    </div>
                    <h3>${course.titulo}</h3>
                    <p>${course.descripcion}</p>
                    <p><strong>Nivel:</strong> ${course.nivel}</p>
                    <p><strong>Duración:</strong> ${course.duracion} horas</p>
                    <p><strong>Precio:</strong> ${course.precio}€/mes</p>
                    <button class="btn btn-secondary" onclick="window.firebaseDataManager.enrollInCourse('${course.id}', '${localStorage.getItem('userId') || ''}')">
                        Matricularme
                    </button>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    getDayFromDate(dateString) {
        const match = dateString.match(/\d+/);
        return match ? match[0] : '21';
    }

    getMonthFromDate(dateString) {
        const months = {
            'enero': 'ENE', 'febrero': 'FEB', 'marzo': 'MAR', 'abril': 'ABR',
            'mayo': 'MAY', 'junio': 'JUN', 'julio': 'JUL', 'agosto': 'AGO',
            'septiembre': 'SEP', 'octubre': 'OCT', 'noviembre': 'NOV', 'diciembre': 'DIC'
        };
        
        for (const [full, short] of Object.entries(months)) {
            if (dateString.toLowerCase().includes(full)) {
                return short;
            }
        }
        
        return 'DIC';
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof firebaseDb !== 'undefined' && firebaseDb) {
            window.firebaseDataManager = new FirebaseDataManager();
            
            // Auto-renderizar elementos si existen
            if (document.getElementById('eventsContainer')) {
                window.firebaseDataManager.renderEvents('eventsContainer');
            }
            
            if (document.getElementById('coursesContainer')) {
                window.firebaseDataManager.renderCourses('coursesContainer');
            }
        } else {
            console.warn('Firebase Firestore no está disponible. Los datos no se cargarán.');
        }
    }, 1500);
});

// Exportar para uso global
window.FirebaseDataManager = FirebaseDataManager;