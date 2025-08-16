// Proje verileri
const defaultProjects = [
    {id:1, name:'Teona Bungalov Otel', desc:'Doğanın kalbinde, rahatlık ve estetiği bir araya getirdik.', image:'/uploads/sample1.jpg', tags:['Bungalov','Otel'], likes: 0},
    {id:2, name:'Ufuktepe Pazar Alanı', desc:'Modern pazar alanı tasarımı.', image:'/uploads/sample2.jpg', tags:['Pazar','Ticari'], likes: 0},
    {id:3, name:'Yalı Konutları', desc:'Deniz kenarında lüks konutlar.', image:'/uploads/sample3.jpg', tags:['Konut','Lüks'], likes: 0},
    {id:4, name:'Ofis Plaza', desc:'Çağdaş ofis binası.', image:'/uploads/sample4.jpg', tags:['Ofis','Ticari'], likes: 0},
    {id:5, name:'Kent Parkı', desc:'Şehir merkezinde yeşil alan.', image:'/uploads/sample5.jpg', tags:['Park','Peyzaj'], likes: 0},
    {id:6, name:'Rezidans Projesi', desc:'Modern rezidans yaşamı.', image:'/uploads/sample6.jpg', tags:['Rezidans','Konut'], likes: 0},
    {id:7, name:'Kültür Merkezi', desc:'Sanat ve kültür için modern alan.', image:'/uploads/sample7.jpg', tags:['Kültür','Sanat'], likes: 0},
    {id:8, name:'Eko Villa', desc:'Sürdürülebilir villa projesi.', image:'/uploads/sample7.jpg', tags:['Villa','Ekolojik'], likes: 0},
];

// Projeleri yükle
async function loadProjects() {
    try {
        const response = await fetch('/.netlify/functions/projects');
        if (response.ok) {
            const projects = await response.json();
            renderProjects(projects);
        } else {
            renderProjects(defaultProjects);
        }
    } catch (error) {
        console.log('Projeler yüklenemedi, varsayılan projeler kullanılıyor:', error);
        renderProjects(defaultProjects);
    }
}

// Projeleri render et
function renderProjects(projects) {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;
    
    projectsGrid.innerHTML = projects.map((p, idx) => `
        <div class="project-card">
            <div class="project-image-container">
                ${p.image ? `<img src="${p.image}" alt="${p.name}" class="project-image" id="project-img-${idx}">` : '<span style="font-size:3rem; color:#bfa97a;">🏗️</span>'}
                                    <div class="project-hover">
                        <span class="icon magnifier" title="Büyüt" onclick="openModal('${p.image || ''}')"></span>
                        <a href="project.html?id=${p.id}" class="icon link" title="Detay"></a>
                    </div>
            </div>
            <div class="project-info">
                <div class="project-title">${p.name}</div>
                <div class="project-likes">
                    <span class="icon heart" data-id="${p.id}"></span>
                    <span class="like-count" id="like-count-${p.id}">${p.likes || 0}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    // Kalp işlemlerini başlat
    initializeHeartSystem();
}

// Kalp sistemi
function getHearted() {
    return JSON.parse(localStorage.getItem('heartedProjects') || '[]');
}

function setHearted(arr) {
    localStorage.setItem('heartedProjects', JSON.stringify(arr));
}

function updateHeartUI() {
    const hearted = getHearted();
    document.querySelectorAll('.icon.heart').forEach(icon => {
        const id = icon.dataset.id;
        if (hearted.includes(id)) {
            icon.classList.add('hearted');
        } else {
            icon.classList.remove('hearted');
        }
    });
}

function initializeHeartSystem() {
    updateHeartUI();
    document.querySelectorAll('.icon.heart').forEach(icon => {
        icon.addEventListener('click', function() {
            const id = this.dataset.id;
            let hearted = getHearted();
            
            if (hearted.includes(id)) {
                // Unlike işlemi
                unlikeProject(id, this);
            } else {
                // Like işlemi
                likeProject(id, this);
            }
        });
    });
}

async function likeProject(id, heartIcon) {
    try {
        const response = await fetch('/.netlify/functions/like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: id })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (!data.alreadyLiked) {
                let hearted = getHearted();
                hearted.push(id);
                setHearted(hearted);
                document.getElementById('like-count-' + id).textContent = data.likes;
                heartIcon.classList.add('hearted');
            }
        }
    } catch (error) {
        console.log('Like işlemi başarısız:', error);
    }
}

async function unlikeProject(id, heartIcon) {
    try {
        const response = await fetch('/.netlify/functions/unlike', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: id })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (!data.alreadyUnliked) {
                let hearted = getHearted();
                hearted = hearted.filter(pid => pid !== id);
                setHearted(hearted);
                document.getElementById('like-count-' + id).textContent = data.likes;
                heartIcon.classList.remove('hearted');
            }
        }
    } catch (error) {
        console.log('Unlike işlemi başarısız:', error);
    }
}

// Modal işlemleri
function openModal(src) {
    if (!src) return;
    document.getElementById('imgModal').style.display = 'flex';
    document.getElementById('modalImg').src = src;
}

function closeModal() {
    document.getElementById('imgModal').style.display = 'none';
    document.getElementById('modalImg').src = '';
}

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
    
    // Project cards hover effect
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Service cards animation on scroll
    document.querySelectorAll('.service-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
    });
    
    // Projeleri yükle
    loadProjects();
    
    // Contact form
    const contactForm = document.querySelector('.contact-form-modern');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const message = document.querySelector('.form-message');
            
            // Form verilerini işle
            const name = formData.get('name');
            const email = formData.get('email');
            const messageText = formData.get('message');
            
            // Basit validasyon
            if (name && email && messageText) {
                message.style.display = 'block';
                message.textContent = 'Mesajınız gönderildi! En kısa sürede size dönüş yapacağız.';
                message.style.color = '#4CAF50';
                this.reset();
                
                setTimeout(() => {
                    message.style.display = 'none';
                }, 5000);
            } else {
                message.style.display = 'block';
                message.textContent = 'Lütfen tüm alanları doldurun.';
                message.style.color = '#f44336';
            }
        });
    }
});
