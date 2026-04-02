// ==========================================
// MESIN TEMA & BAHASA KEMAL COMPUTER
// ==========================================

// 1. Kamus Terjemahan (Silakan tambah kata-kata lain di sini)
const translations = {
    id: {
        menu_beranda: "Beranda",
        menu_reservasi: "Reservasi Servis",
        menu_lacak: "Cek Status",
        btn_lacak: "Lacak Sekarang",
        ph_invoice: "Masukkan Nomor Invoice...",
        menu_antrian: "Antrian Servis",
        menu_pelanggan: "Pelanggan",
        menu_keuangan: "Keuangan",
        btn_keluar: "Keluar",
        btn_simpan: "Simpan Data"
    },
    en: {
        menu_beranda: "Home",
        menu_reservasi: "Book Service",
        menu_lacak: "Track Status",
        btn_lacak: "Track Now",
        ph_invoice: "Enter Invoice Number...",
        menu_antrian: "Service Queue",
        menu_pelanggan: "Customers",
        menu_keuangan: "Finance",
        btn_keluar: "Logout",
        btn_simpan: "Save Data"
    }
};

// 2. Fungsi Terapkan Tema
function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark-mode');
    } else {
        document.documentElement.classList.remove('dark-mode');
    }
    updateToggleButtons();
}

// 3. Fungsi Terapkan Bahasa
function applyLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            // Jika elemen adalah input/textarea, ubah placeholder-nya
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[lang][key];
            } else {
                el.innerHTML = translations[lang][key]; // Ubah teksnya
            }
        }
    });
    document.documentElement.lang = lang;
    updateToggleButtons();
}

// 4. Injeksi Tombol Melayang (Otomatis muncul di semua halaman)
function injectToggles() {
    const toggleContainer = document.createElement('div');
    toggleContainer.style.cssText = `
        position: fixed; bottom: 20px; left: 20px; z-index: 9999;
        display: flex; flex-direction: column; gap: 10px;
    `;

    // Tombol Bahasa
    const langBtn = document.createElement('button');
    langBtn.id = 'langToggleBtn';
    langBtn.style.cssText = `
        background: var(--primary-color, #0d9488); color: white; border: none; 
        padding: 10px; border-radius: 50%; width: 45px; height: 45px; 
        font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    langBtn.onclick = () => {
        let currentLang = localStorage.getItem('app_lang') || 'id';
        let newLang = currentLang === 'id' ? 'en' : 'id';
        localStorage.setItem('app_lang', newLang);
        applyLanguage(newLang);
    };

    // Tombol Tema (Gelap/Terang)
    const themeBtn = document.createElement('button');
    themeBtn.id = 'themeToggleBtn';
    themeBtn.style.cssText = `
        background: #1e293b; color: #fbbf24; border: none; 
        padding: 10px; border-radius: 50%; width: 45px; height: 45px; 
        font-size: 1.2em; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    themeBtn.onclick = () => {
        let currentTheme = localStorage.getItem('app_theme') || 'light';
        let newTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('app_theme', newTheme);
        applyTheme(newTheme);
    };

    toggleContainer.appendChild(langBtn);
    toggleContainer.appendChild(themeBtn);
    document.body.appendChild(toggleContainer);
}

function updateToggleButtons() {
    const langBtn = document.getElementById('langToggleBtn');
    const themeBtn = document.getElementById('themeToggleBtn');
    if(langBtn) langBtn.innerText = (localStorage.getItem('app_lang') || 'id').toUpperCase();
    if(themeBtn) {
        const isDark = (localStorage.getItem('app_theme') === 'dark');
        themeBtn.innerHTML = isDark ? '☀️' : '🌙';
        themeBtn.style.background = isDark ? '#f8fafc' : '#1e293b';
        themeBtn.style.color = isDark ? '#f59e0b' : '#fbbf24';
    }
}

// 5. Jalankan saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    // Setel default
    const savedTheme = localStorage.getItem('app_theme') || 'light';
    const savedLang = localStorage.getItem('app_lang') || 'id';
    
    applyTheme(savedTheme);
    injectToggles();
    applyLanguage(savedLang); // Panggil bahasa setelah tombol terbuat
});
