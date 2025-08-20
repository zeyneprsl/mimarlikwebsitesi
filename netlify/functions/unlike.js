const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { projectId } = JSON.parse(event.body);
        const isNetlify = !!process.env.NETLIFY;
        const repoProjectsFile = path.join(__dirname, '../../data/projects.json');
        const tmpDir = '/tmp';
        const tmpProjectsFile = path.join(tmpDir, 'projects.json');
        const projectsFile = isNetlify ? tmpProjectsFile : repoProjectsFile;
        
        let projects = [];
        
        if (fs.existsSync(projectsFile)) {
            const projectsData = fs.readFileSync(projectsFile, 'utf-8');
            projects = JSON.parse(projectsData);
        } else {
            // Varsayılan projeleri oluştur
            projects = [
                {id:1, name:'Teona Bungalov Otel', desc:'Doğanın kalbinde, rahatlık ve estetiği bir araya getirdik.', image:'/uploads/sample1.jpg', tags:['Bungalov','Otel'], likes: 0, likedIps: []},
                {id:2, name:'Ufuktepe Pazar Alanı', desc:'Modern pazar alanı tasarımı.', image:'/uploads/sample2.jpg', tags:['Pazar','Ticari'], likes: 0, likedIps: []},
                {id:3, name:'Yalı Konutları', desc:'Deniz kenarında lüks konutlar.', image:'/uploads/sample3.jpg', tags:['Konut','Lüks'], likes: 0, likedIps: []},
                {id:4, name:'Ofis Plaza', desc:'Çağdaş ofis binası.', image:'/uploads/sample4.jpg', tags:['Ofis','Ticari'], likes: 0, likedIps: []},
                {id:5, name:'Kent Parkı', desc:'Şehir merkezinde yeşil alan.', image:'/uploads/sample5.jpg', tags:['Park','Peyzaj'], likes: 0, likedIps: []},
                {id:6, name:'Rezidans Projesi', desc:'Modern rezidans yaşamı.', image:'/uploads/sample6.jpg', tags:['Rezidans','Konut'], likes: 0, likedIps: []},
                {id:7, name:'Kültür Merkezi', desc:'Sanat ve kültür için modern alan.', image:'/uploads/sample7.jpg', tags:['Kültür','Sanat'], likes: 0, likedIps: []},
                {id:8, name:'Eko Villa', desc:'Sürdürülebilir villa projesi.', image:'/uploads/sample7.jpg', tags:['Villa','Ekolojik'], likes: 0, likedIps: []},
            ];
        }

        const project = projects.find(p => p.id == projectId);
        if (!project) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Proje bulunamadı' })
            };
        }

        // IP adresini al (Netlify'da gerçek IP'yi almak için)
        const ip = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
        
        if (!project.likedIps) project.likedIps = [];
        if (!project.likes) project.likes = 0;
        
        const ipIndex = project.likedIps.indexOf(ip);
        if (ipIndex === -1) {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ likes: project.likes, alreadyUnliked: true })
            };
        }

        project.likes = Math.max(0, project.likes - 1);
        project.likedIps.splice(ipIndex, 1);

        // Projeleri kaydet (Netlify'da /tmp dizinine)
        if (isNetlify) {
            try { if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true }); } catch (e) {}
            fs.writeFileSync(tmpProjectsFile, JSON.stringify(projects, null, 2));
        } else {
            fs.writeFileSync(repoProjectsFile, JSON.stringify(projects, null, 2));
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ likes: project.likes, alreadyUnliked: false })
        };
    } catch (error) {
        console.error('Error in unlike function:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
