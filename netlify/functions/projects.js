const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const projectsFile = path.join(__dirname, '../../data/projects.json');
        
        if (!fs.existsSync(projectsFile)) {
            // Varsayılan projeleri döndür
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
            
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(defaultProjects)
            };
        }

        const projectsData = fs.readFileSync(projectsFile, 'utf-8');
        const projects = JSON.parse(projectsData);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(projects)
        };
    } catch (error) {
        console.error('Error reading projects:', error);
        
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
