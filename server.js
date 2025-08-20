const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'berramimarlik_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 }
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/icons', express.static(path.join(__dirname, 'icons')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const upload = multer({ dest: 'uploads/' });
const PROJECTS_FILE = path.join(__dirname, 'data', 'projects.json');
const SETTINGS_FILE = path.join(__dirname, 'data', 'settings.json');

function readProjects() {
    if (!fs.existsSync(PROJECTS_FILE)) return [];
    return JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
}
function writeProjects(projects) {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}

function defaultSettings() {
    return {
        heroBackgroundUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        heroTitle: 'MİMARİ MÜKEMMELLİK',
        heroSubtitle: 'Geleceğin yapılarını bugün tasarlıyoruz',
        aboutTitle: 'Hakkımızda',
        aboutText: 'Berra Mimarlık olarak, 15 yıllık deneyimimizle modern mimarinin sınırlarını zorlayan, sürdürülebilir ve işlevsel tasarımlar oluşturuyoruz.\nUzman ekibimizle konut, ticari ve endüstriyel projelerde yenilikçi yaklaşımlar benimsiyor, çevreye saygılı ve enerji verimli yapılar tasarlıyoruz.',
        contactAddress: 'Arkt Mimarlık, Ahlatlıbel Mah., 1902 Sok. No:44/3, Çankaya / ANKARA',
        phonePrimary: '+90 312 343 23 33',
        phoneSecondary: '+90 532 435 22 77',
        email: 'info@arkt.com',
        instagramUrl: '#',
        linkedinUrl: '#',
        mapEmbedUrl: 'https://www.google.com/maps?q=Balıkesir&output=embed'
    };
}
function readSettings() {
    if (!fs.existsSync(SETTINGS_FILE)) return defaultSettings();
    try {
        const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return { ...defaultSettings(), ...parsed };
    } catch (e) {
        return defaultSettings();
    }
}
function writeSettings(settings) {
    const merged = { ...defaultSettings(), ...settings };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2));
}

// Basit oturum kontrolü
function requireAuth(req, res, next) {
    if (req.session && req.session.authed) return next();
    return res.redirect('/admin');
}

// Admin Panel Giriş (şifre env'den okunur, yoksa admin123)
app.get('/admin', (req, res) => {
    res.render('login');
});
app.post('/admin', (req, res) => {
    const { password } = req.body;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    if (password === ADMIN_PASSWORD) {
        req.session.authed = true;
        return res.redirect('/admin/panel');
    }
    res.render('login', { error: 'Hatalı şifre!' });
});
app.get('/admin/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/admin'));
});

// Admin Paneli
app.get('/admin/panel', requireAuth, (req, res) => {
    const projects = readProjects();
    const settings = readSettings();
    res.render('panel', { projects, settings });
});

// Site Ayarları Kaydet
app.post('/admin/settings', requireAuth, (req, res) => {
    const { heroBackgroundUrl, heroTitle, heroSubtitle, aboutTitle, aboutText, contactAddress, phonePrimary, phoneSecondary, email, instagramUrl, linkedinUrl, mapEmbedUrl } = req.body;
    writeSettings({ heroBackgroundUrl, heroTitle, heroSubtitle, aboutTitle, aboutText, contactAddress, phonePrimary, phoneSecondary, email, instagramUrl, linkedinUrl, mapEmbedUrl });
    res.redirect('/admin/panel');
});

// Proje Ekleme
app.post('/admin/add', requireAuth, upload.single('imageFile'), (req, res) => {
    const { name, desc, imageUrl, tags } = req.body;
    let image = imageUrl;
    if (req.file) {
        image = '/uploads/' + req.file.filename;
    }
    const projects = readProjects();
    projects.push({
        id: Date.now(),
        name,
        desc,
        image,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        likes: 0,
        likedIps: []
    });
    writeProjects(projects);
    res.redirect('/admin/panel');
});

// Proje Silme
app.post('/admin/delete/:id', requireAuth, (req, res) => {
    let projects = readProjects();
    projects = projects.filter(p => p.id != req.params.id);
    writeProjects(projects);
    res.redirect('/admin/panel');
});

// Proje Düzenleme (GET ve POST)
app.get('/admin/edit/:id', requireAuth, (req, res) => {
    const projects = readProjects();
    const project = projects.find(p => p.id == req.params.id);
    res.render('edit', { project });
});
app.post('/admin/edit/:id', requireAuth, upload.single('imageFile'), (req, res) => {
    let projects = readProjects();
    const idx = projects.findIndex(p => p.id == req.params.id);
    if (idx === -1) return res.redirect('/admin/panel');
    const { name, desc, imageUrl, tags, headerImage, mainImage, year, city, gallery } = req.body;
    let image = imageUrl || projects[idx].image;
    if (req.file) {
        image = '/uploads/' + req.file.filename;
    }
    projects[idx] = {
        ...projects[idx],
        name,
        desc,
        image,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        headerImage,
        mainImage,
        year,
        city,
        gallery: gallery ? gallery.split(',').map(g => g.trim()).filter(Boolean) : []
    };
    writeProjects(projects);
    res.redirect('/admin/panel');
});

// Projeye kalp atma endpointi
app.post('/api/like/:id', (req, res) => {
    const projects = readProjects();
    const project = projects.find(p => p.id == req.params.id);
    if (!project) return res.status(404).json({ error: 'Proje bulunamadı' });
    // IP adresini al
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
    if (!project.likedIps) project.likedIps = [];
    if (!project.likes) project.likes = 0;
    if (project.likedIps.includes(ip)) {
        return res.json({ likes: project.likes, alreadyLiked: true });
    }
    project.likes++;
    project.likedIps.push(ip);
    writeProjects(projects);
    res.json({ likes: project.likes, alreadyLiked: false });
});

// Projeden kalp geri çekme endpointi
app.post('/api/unlike/:id', (req, res) => {
    const projects = readProjects();
    const project = projects.find(p => p.id == req.params.id);
    if (!project) return res.status(404).json({ error: 'Proje bulunamadı' });
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
    if (!project.likedIps) project.likedIps = [];
    if (!project.likes) project.likes = 0;
    const ipIndex = project.likedIps.indexOf(ip);
    if (ipIndex === -1) {
        return res.json({ likes: project.likes, alreadyUnliked: true });
    }
    project.likes = Math.max(0, project.likes - 1);
    project.likedIps.splice(ipIndex, 1);
    writeProjects(projects);
    res.json({ likes: project.likes, alreadyUnliked: false });
});

// API: Projeleri JSON olarak döndür (likes ile birlikte)
app.get('/api/projects', (req, res) => {
    res.json(readProjects());
});

// API: Site ayarları (hero/about)
app.get('/api/settings', (req, res) => {
    res.json(readSettings());
});

// Ana sayfa: Projeleri dinamik olarak göster
app.get('/', (req, res) => {
    const projects = readProjects();
    const settings = readSettings();
    res.render('index', { projects, settings });
});

// Proje Detay Ekranı
app.get('/project/:id', (req, res) => {
    const projects = readProjects();
    const project = projects.find(p => p.id == req.params.id) || {
        name: 'Teona Bungalov Otel',
        desc: 'Doğanın kalbinde, rahatlık ve estetiği bir araya getirdik.',
        image: '/uploads/sample-main.jpg',
        headerImage: '/uploads/sample-header.jpg',
        mainImage: '/uploads/sample-main.jpg'
    };
    res.render('project-detail', { project });
});

app.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
}); 