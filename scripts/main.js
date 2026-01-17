// Funciones generales y animaciones
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ DOM cargado - CAM Betera");
    
    // Elementos del menú móvil
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // Elementos del carrusel de testimonios
    const testimonialTrack = document.getElementById('testimonialTrack');
    const navDots = document.querySelectorAll('.nav-dot');
    let currentTestimonial = 0;
    const totalTestimonials = document.querySelectorAll('.testimonial-card').length;
    let testimonialInterval;
    
    // Menú móvil
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Cerrar menú móvil al hacer clic en un enlace
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 992) {
                navMenu.classList.remove('active');
            }
        });
    });
    
    // CARRUSEL DE TESTIMONIOS
    function goToTestimonial(index) {
        if (totalTestimonials === 0) return;
        
        if (index < 0) {
            currentTestimonial = totalTestimonials - 1;
        } else if (index >= totalTestimonials) {
            currentTestimonial = 0;
        } else {
            currentTestimonial = index;
        }
        
        if (testimonialTrack) {
            testimonialTrack.style.transform = `translateX(-${currentTestimonial * 33.333}%)`;
        }
        
        navDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentTestimonial);
        });
    }
    
    // Agregar event listeners a los puntos de navegación
    navDots.forEach(dot => {
        dot.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            goToTestimonial(index);
            resetTestimonialInterval();
        });
    });
    
    // Función para reiniciar el intervalo automático
    function resetTestimonialInterval() {
        clearInterval(testimonialInterval);
        if (totalTestimonials > 0) {
            testimonialInterval = setInterval(() => {
                goToTestimonial(currentTestimonial + 1);
            }, 5000);
        }
    }
    
    // Iniciar el cambio automático de testimonios (si hay testimonios)
    if (totalTestimonials > 0) {
        testimonialInterval = setInterval(() => {
            goToTestimonial(currentTestimonial + 1);
        }, 5000);
        
        // Pausar el carrusel cuando el usuario interactúa con él
        if (testimonialTrack) {
            testimonialTrack.addEventListener('mouseenter', () => {
                clearInterval(testimonialInterval);
            });
            
            testimonialTrack.addEventListener('mouseleave', () => {
                resetTestimonialInterval();
            });
        }
    }
    
    // Scroll suave para enlaces internos - VERSIÓN CORREGIDA
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Solo procesar si el href no es solo "#" (enlace vacío)
            if (href && href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
            // Si href es "#" o vacío, no hacer nada
        });
    });
    
    // Animación al hacer scroll
    function checkScroll() {
        const elements = document.querySelectorAll('.service-card, .band-card, .event-card, .timeline-item');
        elements.forEach(el => {
            const position = el.getBoundingClientRect().top;
            if (position < window.innerHeight - 100) {
                el.classList.add('animate');
            }
        });
    }
    
    window.addEventListener('scroll', checkScroll);
    checkScroll();
    
    // Efecto header al hacer scroll
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (header) {
            if (window.scrollY > 50) {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            } else {
                header.style.background = '#ffffff';
                header.style.boxShadow = 'none';
            }
        }
    });
    
    // Newsletter form simple
    const newsletterForm = document.querySelector('.newsletter form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email && email.includes('@')) {
                alert('¡Gracias por suscribirte! Te hemos añadido a nuestra lista de newsletter.');
                emailInput.value = '';
            } else {
                alert('Por favor, introduce un email válido.');
            }
        });
    }
    
    console.log("🎉 Todas las funciones cargadas correctamente");
});