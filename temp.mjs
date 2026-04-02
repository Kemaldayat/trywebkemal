
        import { db, ref, get, child } from "./js/firebase-config.js";
        
        const antiBlokir = (url) => {
            if(!url) return '';
            if(url.includes('ibb.co')) {
                return 'https://wsrv.nl/?url=' + encodeURIComponent(url);
            }
            return url;
        };
        let globalWaNumber = "";

        window.beliViaWa = (namaProduk, harga) => {
            if(!globalWaNumber) { alert('Nomor WA Toko belum diatur.'); return; }
            let infoHarga = harga > 0 ? `Harga: Rp ${harga.toLocaleString('id-ID')}` : `Harga: Menyesuaikan Budget`;
            const pesan = `Halo Admin, saya tertarik untuk layanan pengadaan/rakit ini:\n\n*${namaProduk}*\n${infoHarga}\n\nMohon info lebih lanjut.`;
            window.open(`https://wa.me/${globalWaNumber}?text=${encodeURIComponent(pesan)}`, '_blank');
        };

        let currentSlide = 0; let slideInterval; let slides = [];
        function startSlider() { slideInterval = setInterval(() => { currentSlide = (currentSlide + 1) % slides.length; updateSlider(); }, 4000); }
        function stopSlider() { clearInterval(slideInterval); }
        function updateSlider() { const slider = document.getElementById('image-slider'); if(slider && slides.length > 0) slider.style.transform = `translateX(-${currentSlide * 100}%)`; }
        document.getElementById('prev-btn')?.addEventListener('click', () => { stopSlider(); currentSlide = (currentSlide - 1 + slides.length) % slides.length; updateSlider(); startSlider(); });
        document.getElementById('next-btn')?.addEventListener('click', () => { stopSlider(); currentSlide = (currentSlide + 1) % slides.length; updateSlider(); startSlider(); });

        async function loadWebsiteSettings() {
            try {
                const snapshot = await get(ref(db, 'pengaturan_toko'));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    
                    if(data.warnaUtama) document.documentElement.style.setProperty('--color-primary', data.warnaUtama);

                    const nama = data.namaToko || 'Toko Servis';
                    document.title = `Lacak Servis - ${nama}`;
                    document.getElementById('headerNamaToko').innerText = nama; document.getElementById('footerNamaToko').innerText = nama;
                    document.getElementById('mapsNamaToko').innerText = nama; document.getElementById('copyrightText').innerText = `© ${new Date().getFullYear()} ${nama}. All Rights Reserved.`;

                    if(data.logoUrl) {
                        let logoAman = antiBlokir(data.logoUrl);
                        document.getElementById('faviconImg').href = logoAman; 
                        document.getElementById('headerLogo').src = logoAman;
                        document.getElementById('footerLogo').src = logoAman; 
                        document.getElementById('resultLogo').src = logoAman;
                    }

                    if(data.headline) document.getElementById('heroHeadline').innerText = data.headline;
                    if(data.subHeadline) document.getElementById('heroSubHeadline').innerText = data.subHeadline;

                    if (data.nib) {
                        document.getElementById('legalitas-section').classList.remove('hidden');
                        document.getElementById('teksNib').innerText = data.nib;
                        document.getElementById('teksLegalitasDesc').innerText = data.legalitasDesc || 'Usaha ini telah terdaftar resmi secara hukum.';
                    } else {
                        document.getElementById('legalitas-section').classList.add('hidden');
                    }

                    if(data.alamat) { document.getElementById('mapsAlamat').innerText = data.alamat; document.getElementById('footerAlamat').innerText = data.alamat; }
                    if(data.maps) { let mapSrc = data.maps; if(mapSrc.includes('src="')) mapSrc = mapSrc.split('src="')[1].split('"')[0]; document.getElementById('mapsContainer').innerHTML = `<iframe src="${mapSrc}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`; }

                    if(data.wa) {
                        const waNumber = data.wa.replace(/[^0-9]/g, '');
                        globalWaNumber = waNumber;
                        document.getElementById('footerWaLink').innerText = `+${waNumber}`; document.getElementById('footerWaLink').href = `tel:+${waNumber}`;
                        const waLinkText = `https://wa.me/${waNumber}?text=Halo%20Admin,%20saya%20ingin%20konsultasi%20servis.`;
                        document.getElementById('btnFloatingWa').href = waLinkText; document.getElementById('btnReservasiWa').href = waLinkText;
                    }

                    document.getElementById('linkIg').href = data.ig || '#'; document.getElementById('linkTiktok').href = data.tiktok || '#'; document.getElementById('linkYoutube').href = data.youtube || '#';
                    if(!data.ig) document.getElementById('linkIg').style.display = 'none'; if(!data.tiktok) document.getElementById('linkTiktok').style.display = 'none'; if(!data.youtube) document.getElementById('linkYoutube').style.display = 'none';

                    const sliderWrapper = document.getElementById('image-slider');
                    if(data.sliders && data.sliders.length > 0) {
                        sliderWrapper.innerHTML = data.sliders.map(url => `<img src="${antiBlokir(url)}" class="h-full w-full object-cover flex-shrink-0" alt="Banner">`).join('');
                    } else {
                        sliderWrapper.innerHTML = `<img src="images/servislaptop.jpg" class="h-full w-full object-cover flex-shrink-0" alt="Banner"><img src="images/servishp.jpg" class="h-full w-full object-cover flex-shrink-0" alt="Banner">`;
                    }
                    slides = sliderWrapper.querySelectorAll('img'); if(slides.length > 1) startSlider();

                    const layananGrid = document.getElementById('layanan-grid');
                    if(data.layanans && data.layanans.length > 0) {
                        layananGrid.innerHTML = data.layanans.map(l => {
                            let safeIcon = l.icon ? l.icon.trim() : 'fa-tools';
                            safeIcon = safeIcon.replace('fas ', '').replace('fab ', '');
                            
                            return `
                            <div class="service-card bg-white p-8 rounded-2xl shadow-sm">
                                <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-primary text-3xl"><i class="fas ${safeIcon}"></i></div>
                                <h3 class="text-xl font-bold text-slate-800 mb-3">${l.title}</h3>
                                <p class="text-slate-500 leading-relaxed">${l.desc}</p>
                            </div>
                            `;
                        }).join('');
                    }

                    const testimoniGrid = document.getElementById('testimoni-grid');
                    const testimoniSection = document.getElementById('testimoni-section');
                    if(data.testimonis && data.testimonis.length > 0) {
                        testimoniSection.style.display = 'block';
                        testimoniGrid.innerHTML = data.testimonis.map(t => `
                            <div class="bg-white/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl relative">
                                <i class="fas fa-quote-left absolute top-6 right-6 text-5xl text-white/10"></i>
                                <div class="flex text-yellow-400 mb-4 text-sm gap-1"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
                                <p class="italic mb-6 text-slate-200 text-lg leading-relaxed">"${t.teks}"</p>
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold text-white">${t.nama.charAt(0).toUpperCase()}</div>
                                    <div><p class="font-bold text-white leading-none">${t.nama}</p><span class="text-xs text-slate-300">${t.role}</span></div>
                                </div>
                            </div>
                        `).join('');
                    } else { testimoniSection.style.display = 'none'; }

                    const katalogGrid = document.getElementById('katalog-grid');
                    const katalogProduk = (data.katalog && data.katalog.length > 0) ? data.katalog : [];

                    katalogGrid.innerHTML = katalogProduk.map(p => {
                        const mediaHtml = p.img ? `<img src="${antiBlokir(p.img)}" alt="${p.nama}" class="w-full h-full object-cover">` : `<i class="fas fa-desktop text-5xl text-slate-300"></i>`;
                        const hargaHtml = p.harga > 0 ? `Rp ${p.harga.toLocaleString('id-ID')}` : `Menyesuaikan Budget`;
                        
                        return `
                        <div class="product-card">
                            <div class="product-img-box">
                                ${mediaHtml}
                            </div>
                            <div class="p-5 flex flex-col flex-grow">
                                <h3 class="font-bold text-slate-800 mb-1 text-lg leading-tight">${p.nama}</h3>
                                <p class="text-xs text-slate-500 mb-4 flex-grow">${p.desc}</p>
                                <div class="font-bold text-primary mb-4 text-lg">${hargaHtml}</div>
                                <button onclick="beliViaWa('${p.nama}', ${p.harga})" class="w-full bg-green-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2">
                                    <i class="fab fa-whatsapp text-lg"></i> Pesan via WA
                                </button>
                            </div>
                        </div>
                        `;
                    }).join('');

                }
            } catch (error) { console.error("Error CMS:", error); } 
        }

        const pages = document.querySelectorAll('.page-content');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const pageLoader = document.getElementById('page-loader');

        window.showPage = (pageId) => {
            const activePage = document.querySelector('.page-content:not(.hidden)');
            if (activePage) { activePage.classList.remove('page-transition', 'active'); activePage.classList.add('page-transition'); }
            pageLoader.classList.add('show');
            setTimeout(() => {
                pages.forEach(page => page.classList.add('hidden'));
                const newPage = document.getElementById(pageId);
                newPage.classList.remove('hidden'); newPage.classList.add('page-transition');
                setTimeout(() => { newPage.classList.add('active'); pageLoader.classList.remove('show'); document.documentElement.scrollTop = 0; }, 50);
            }, 300);
            mobileMenu.classList.add('hidden');
        };
        mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));

        const formatRupiah = (angka) => { if (!angka || angka == 0) return "<span class='text-slate-400 italic text-sm font-normal bg-slate-100 px-3 py-1 rounded-full'>Menunggu pengecekan / Belum ditentukan</span>"; return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka); };
        window.currentTrackedService = null; window.currentTrackedCode = null;

        window.printCustomerInvoice = async () => {
            if(!window.currentTrackedService || !window.currentTrackedCode) return;
            const service = window.currentTrackedService; const serviceCode = window.currentTrackedCode;
            const tgl = new Date(service.timestamp || Date.now()).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            
            let namaToko = "Toko Servis"; let alamat = "-"; let wa = "-"; let logo = "images/logo.png"; let teksGaransi = "*Garansi servis berlaku 1 minggu.";
            try { const snap = await get(ref(db, 'pengaturan_toko')); if(snap.exists()) { const dt = snap.val(); if(dt.namaToko) namaToko = dt.namaToko; if(dt.alamat) alamat = dt.alamat; if(dt.wa) wa = dt.wa; if(dt.logoUrl) logo = antiBlokir(dt.logoUrl); if(dt.teksGaransi) teksGaransi = dt.teksGaransi; } } catch(e) {}

            const printWindow = window.open('', '_blank');
            const htmlString = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Nota Servis - ${serviceCode}</title><style>body { font-family: 'Courier New', Courier, monospace; color: #000; padding: 20px; font-size: 14px; line-height: 1.5; max-width: 80mm; margin: auto; } .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 15px; margin-bottom: 15px; } .header img { max-width: 80px; margin-bottom: 5px; border-radius: 8px; } .header h1 { font-size: 22px; margin: 0 0 5px 0; font-family: Arial, sans-serif; font-weight: bold;} .header p { margin: 0; font-size: 12px; } .content { margin-bottom: 15px; } .content p { margin: 4px 0; } .table-item { width: 100%; border-collapse: collapse; margin-top: 10px; } .table-item td { vertical-align: top; padding: 4px 0; } .table-item td:first-child { width: 35%; font-weight: bold; } .total-section { border-top: 2px dashed #000; border-bottom: 2px dashed #000; padding: 10px 0; margin-top: 15px; text-align: right; } .total-section h2 { margin: 0; font-size: 18px; } .footer { text-align: center; font-size: 11px; margin-top: 20px; } @media print { @page { margin: 0; } body { margin: 1cm auto; max-width: 100%; } }</style></head><body><div class="header"><img src="${logo}" alt="Logo" onerror="this.style.display='none'"><h1>${namaToko.toUpperCase()}</h1><p>${alamat}</p><p>WhatsApp: ${wa}</p></div><div class="content"><p><strong>Nota:</strong> ${serviceCode}</p><p><strong>Tgl :</strong> ${tgl}</p><table class="table-item"><tr><td>Pelanggan</td><td>: ${service.nama}</td></tr><tr><td>No. HP</td><td>: ${service.nomorHp || '-'}</td></tr><tr><td>Device</td><td>: ${service.device}</td></tr><tr><td>Keluhan</td><td>: ${service.kerusakan}</td></tr><tr><td>Status</td><td>: ${service.status.toUpperCase()}</td></tr></table></div><div class="total-section"><p style="margin:0; font-size: 12px;">Total Tagihan:</p><h2>${formatRupiah(service.biaya)}</h2></div><div class="footer"><p>Terima kasih atas kepercayaan Anda!</p><p><em>${teksGaransi}</em></p></div><script> setTimeout(() => { window.print(); }, 1000); <\/script></body></html>`;
            printWindow.document.write(htmlString); printWindow.document.close();
        };

        window.trackService = async (kodeParam = null) => {
            const searchButton = document.getElementById('searchButton'); 
            const searchButtonText = document.getElementById('searchButtonText'); 
            const searchSpinner = document.getElementById('searchSpinner'); 
            const resultContainer = document.getElementById('resultContainer'); 
            const trackingContent = document.getElementById('trackingContent');
            
            const code = kodeParam || document.getElementById('serviceCode').value.trim().toUpperCase();
            if(!code) return;

            searchButtonText.textContent = 'Mencari...'; 
            searchSpinner.style.display = 'inline-block'; 
            searchButton.disabled = true;
            
            if (!resultContainer.classList.contains('hidden')) { 
                resultContainer.style.opacity = '0'; 
                await new Promise(resolve => setTimeout(resolve, 300)); 
            }
            resultContainer.classList.add('hidden');

            try {
                const snapshot = await get(child(ref(db), `antrian/${code}`));
                if (snapshot.exists()) {
                    const service = snapshot.val(); window.currentTrackedService = service; window.currentTrackedCode = code;
                    let statusBadgeClass = '';
                    switch (service.status) { case 'Menunggu': statusBadgeClass = 'status-waiting'; break; case 'Proses': statusBadgeClass = 'status-process'; break; case 'Selesai': statusBadgeClass = 'status-finished'; break; case 'Diambil': statusBadgeClass = 'status-picked-up'; break; default: statusBadgeClass = 'bg-gray-400'; }
                    
                    let fotoHtml = ''; let rawFotos = service.fotoUrls || service.fotoUrl; let safeFotoArray = [];
                    if (Array.isArray(rawFotos)) safeFotoArray = rawFotos; else if (typeof rawFotos === 'object' && rawFotos !== null) safeFotoArray = Object.values(rawFotos); else if (typeof rawFotos === 'string') safeFotoArray = [rawFotos];

                    if (safeFotoArray.length > 0) {
                        let galleryHtml = safeFotoArray.map(url => `<a href="${antiBlokir(url)}" target="_blank" title="Klik untuk memperbesar" class="block"><img src="${antiBlokir(url)}" alt="Foto Service" class="w-full h-32 object-cover rounded-xl shadow-sm border border-slate-200 hover:opacity-80 transition cursor-pointer"></a>`).join('');
                        fotoHtml = `<div class="flex flex-col md:flex-row md:items-start pb-4 border-b border-slate-100"><div class="font-semibold text-slate-500 md:w-1/3 flex items-center gap-2 mb-3 md:mb-0"><div class="w-8 h-8 rounded-full bg-slate-100 text-primary flex items-center justify-center"><i class="fas fa-camera"></i></div> Lampiran Foto</div><div class="md:w-2/3"><div class="grid grid-cols-2 sm:grid-cols-3 gap-3">${galleryHtml}</div></div></div>`;
                    }
                    
                    const escapeHTML = (str) => String(str || '').replace(/[&<>'"]/g, tag => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[tag]));
                    trackingContent.innerHTML = `
                        <div class="space-y-4">
                            <div class="flex flex-col md:flex-row md:items-start pb-4 border-b border-slate-100"><div class="font-semibold text-slate-500 md:w-1/3 flex items-center gap-2 mb-1 md:mb-0"><div class="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center"><i class="fas fa-user"></i></div> Nama Pelanggan</div><span class="md:w-2/3 text-slate-800 font-medium md:pt-1">${escapeHTML(service.nama)}</span></div>
                            <div class="flex flex-col md:flex-row md:items-start pb-4 border-b border-slate-100"><div class="font-semibold text-slate-500 md:w-1/3 flex items-center gap-2 mb-1 md:mb-0"><div class="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center"><i class="fas fa-laptop"></i></div> Jenis Device</div><span class="md:w-2/3 text-slate-800 md:pt-1">${escapeHTML(service.device) || '-'}</span></div>
                            <div class="flex flex-col md:flex-row md:items-start pb-4 border-b border-slate-100"><div class="font-semibold text-slate-500 md:w-1/3 flex items-center gap-2 mb-1 md:mb-0"><div class="w-8 h-8 rounded-full bg-red-50 text-red-400 flex items-center justify-center"><i class="fas fa-tools"></i></div> Keluhan/Kerusakan</div><span class="md:w-2/3 text-slate-800 md:pt-1">${escapeHTML(service.kerusakan)}</span></div>
                            ${service.keterangan ? `<div class="flex flex-col md:flex-row md:items-start pb-4 border-b border-slate-100"><div class="font-semibold text-slate-500 md:w-1/3 flex items-center gap-2 mb-1 md:mb-0"><div class="w-8 h-8 rounded-full bg-blue-50 text-blue-400 flex items-center justify-center"><i class="fas fa-info-circle"></i></div> Catatan Teknisi</div><span class="md:w-2/3 text-slate-800 md:pt-1">${escapeHTML(service.keterangan)}</span></div>` : ''}
                            ${fotoHtml}
                            <div class="flex flex-col md:flex-row md:items-center pb-4 border-b border-slate-100"><div class="font-semibold text-slate-500 md:w-1/3 flex items-center gap-2 mb-1 md:mb-0"><div class="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center"><i class="fas fa-money-bill-wave"></i></div> Total Biaya</div><span class="md:w-2/3 font-bold text-xl text-primary md:pt-1">${formatRupiah(service.biaya)}</span></div>
                            <div class="flex flex-col md:flex-row md:items-center pt-2"><div class="font-semibold text-slate-500 md:w-1/3 flex items-center gap-2 mb-2 md:mb-0"><div class="w-8 h-8 rounded-full bg-purple-50 text-purple-400 flex items-center justify-center"><i class="fas fa-tasks"></i></div> Status Saat Ini</div><span class="md:w-2/3"><span class="status-badge ${statusBadgeClass} px-4 py-1.5">${service.status}</span></span></div>
                        </div>
                        <div class="mt-8 pt-6 border-t border-slate-200"><button onclick="printCustomerInvoice()" class="w-full bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:bg-slate-900 transition-all flex items-center justify-center gap-2"><i class="fas fa-file-download text-lg"></i> Download / Cetak Nota (PDF)</button></div>
                    `;
                } else { trackingContent.innerHTML = `<div class="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3"><i class="fas fa-search-minus text-xl"></i> <span>Invoice <b>${escapeHTML(code)}</b> tidak ditemukan.</span></div>`; }
            } catch (error) { trackingContent.innerHTML = `<div class="bg-yellow-50 text-yellow-600 p-4 rounded-xl flex items-center gap-3"><i class="fas fa-wifi text-xl"></i> <span>Gangguan koneksi.</span></div>`; } 
            finally { resultContainer.style.opacity = '0'; resultContainer.classList.remove('hidden'); await new Promise(resolve => setTimeout(resolve, 50)); resultContainer.style.opacity = '1'; searchButtonText.textContent = 'Lacak Sekarang'; searchSpinner.style.display = 'none'; searchButton.disabled = false; }
        };

        const checkStatusForm = document.getElementById('checkStatusForm');
        if (checkStatusForm) {
            checkStatusForm.addEventListener('submit', (e) => { 
                e.preventDefault(); 
                window.trackService();
            });
        }

        // ==========================================
        // FITUR AUTO-TRACKING LINK: ?code=KC-xxx
        // ==========================================
        document.addEventListener('DOMContentLoaded', async () => { 
            await loadWebsiteSettings(); // Tunggu pengaturan web beres ditarik dari database
            
            const urlParams = new URLSearchParams(window.location.search);
            const codeFromUrl = urlParams.get('code');
            
            if (codeFromUrl) {
                showPage('tracking-page');
                document.getElementById('serviceCode').value = codeFromUrl.toUpperCase();
                // Beri jeda sebentar agar halaman tampil dulu, baru pencarian berjalan
                setTimeout(() => { 
                    if(typeof window.trackService === 'function') {
                        window.trackService(codeFromUrl.toUpperCase()); 
                    }
                }, 600); 
            } else {
                showPage('home-page'); 
            }
        });
    