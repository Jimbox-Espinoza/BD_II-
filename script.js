let weeks = [];
let currentEditingWeek = null;

// Inicializar
async function init() {
    await loadWeeks();
    renderWeeks();
    setupNavigation();
}

// Cargar semanas del almacenamiento
async function loadWeeks() {
    try {
        const result = await window.storage.get('weeks-data');
        if (result) {
            weeks = JSON.parse(result.value);
        } else {
            // Crear 16 semanas por defecto
            weeks = [];
            for (let i = 1; i <= 16; i++) {
                weeks.push({
                    number: String(i).padStart(2, '0'),
                    title: `Semana ${i}`,
                    subtitle: '',
                    description: '',
                    tags: [],
                    links: [],
                    badge: 'Nuevo'
                });
            }
            await saveWeeks();
        }
    } catch (error) {
        console.error('Error al cargar semanas:', error);
        weeks = [];
        for (let i = 1; i <= 16; i++) {
            weeks.push({
                number: String(i).padStart(2, '0'),
                title: `Semana ${i}`,
                subtitle: '',
                description: '',
                tags: [],
                links: [],
                badge: 'Nuevo'
            });
        }
    }
}

// Guardar semanas
async function saveWeeks() {
    try {
        await window.storage.set('weeks-data', JSON.stringify(weeks));
    } catch (error) {
        console.error('Error al guardar:', error);
        alert('Error al guardar los cambios');
    }
}

// Renderizar semanas
function renderWeeks() {
    const container = document.getElementById('weeksContainer');
    container.innerHTML = '';

    weeks.forEach((week, index) => {
        const card = document.createElement('div');
        card.className = 'week-card';
        
        const tagsHTML = week.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        const linksHTML = week.links.map(link => 
            `<button class="link-btn" onclick="window.open('${link.url}', '_blank')">${link.text}</button>`
        ).join('');

        card.innerHTML = `
            <div class="week-header">
                <div class="week-number">${week.number}</div>
                <div class="week-title-section">
                    <h3 class="week-title">${week.title}</h3>
                    ${week.subtitle ? `<p class="week-subtitle">${week.subtitle}</p>` : ''}
                    <span class="week-badge">${week.badge}</span>
                </div>
                <button class="edit-btn" onclick="openEditModal(${index})">📝 Editar</button>
            </div>
            ${week.description ? `<p class="week-description">${week.description}</p>` : ''}
            ${week.tags.length > 0 ? `<div class="week-tags">${tagsHTML}</div>` : ''}
            ${week.links.length > 0 ? `<div class="week-links">${linksHTML}</div>` : ''}
        `;

        container.appendChild(card);
    });
}

// Abrir modal de edición
function openEditModal(index) {
    currentEditingWeek = index;
    const week = weeks[index];

    document.getElementById('weekNumber').value = week.number;
    document.getElementById('weekTitle').value = week.title;
    document.getElementById('weekSubtitle').value = week.subtitle;
    document.getElementById('weekDescription').value = week.description;
    document.getElementById('weekTags').value = week.tags.join(', ');
    
    const linksText = week.links.map(link => `${link.text}|${link.url}|${link.type}`).join('\n');
    document.getElementById('weekLinks').value = linksText;

    document.getElementById('editModal').classList.add('active');
}

// Cerrar modal
function closeModal() {
    document.getElementById('editModal').classList.remove('active');
    currentEditingWeek = null;
}

// Guardar cambios
document.getElementById('editForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const week = weeks[currentEditingWeek];
    week.title = document.getElementById('weekTitle').value;
    week.subtitle = document.getElementById('weekSubtitle').value;
    week.description = document.getElementById('weekDescription').value;

    const tagsInput = document.getElementById('weekTags').value;
    week.tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];

    const linksInput = document.getElementById('weekLinks').value;
    week.links = [];
    if (linksInput) {
        const lines = linksInput.split('\n').filter(l => l.trim());
        lines.forEach(line => {
            const parts = line.split('|').map(p => p.trim());
            if (parts.length >= 2) {
                week.links.push({
                    text: parts[0],
                    url: parts[1],
                    type: parts[2] || 'link'
                });
            }
        });
    }

    await saveWeeks();
    renderWeeks();
    closeModal();
    alert('Cambios guardados exitosamente');
});

// Eliminar semana
async function deleteWeek() {
    if (confirm('¿Estás seguro de que quieres eliminar esta semana? Se restablecerán los valores por defecto.')) {
        const week = weeks[currentEditingWeek];
        const weekNum = week.number;
        
        weeks[currentEditingWeek] = {
            number: weekNum,
            title: `Semana ${weekNum}`,
            subtitle: '',
            description: '',
            tags: [],
            links: [],
            badge: 'Nuevo'
        };

        await saveWeeks();
        renderWeeks();
        closeModal();
        alert('Semana eliminada y restablecida');
    }
}

// Navegación
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');

            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(page).classList.add('active');
        });
    });
}

// Cerrar modal al hacer clic fuera
document.getElementById('editModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Iniciar aplicación
init();
