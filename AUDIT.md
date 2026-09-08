# Audit 8 September 2026

## Cakupan dan bukti

Repo web dipindai sebelum perubahan: frontend React/CSS, seluruh data dokumentasi dan prompt, API/health, build/TypeScript/Tailwind, metadata/public assets, workflow, lockfile, README dan script pengujian. Inventaris 19 halaman tersedia pada tabel README; `/` merupakan alias overview. Fitur runtime: navigasi/history, search, drawer, simulasi terminal, copy, AI chat, parser rich text, health, SEO, manifest, CI dan hosting.

Source SDK acuan: `akaanakbaik/pterodactyl-gateway` commit `ee1aa8225023a13c907cccd875d5b30596836dce`, package version 1.4.2. Registry npm diperiksa dengan `npm view`: latest **1.0.3**, tidak ada 1.4.2. Package npm 1.4.2 gagal dipasang dengan ETARGET. Klaim rilis npm pada web telah diperbaiki.

## Hasil pengujian

| Pengujian | Hasil |
|---|---|
| Web quality gate | 18/18 regression AI/HTTP lulus, typecheck/build/site smoke lulus |
| Browser → API → Cuki | Pertanyaan beda versi npm/source dijawab dan loading selesai; tanpa error JavaScript |
| SDK source regression | 29/29 lulus; build TypeScript SDK lulus |
| HTTP panel vs SDK | 19 pemeriksaan lulus, tanpa mutation |
| Putaran baca panel | Dua putaran users, servers, nodes, locations, nests, account, client servers; deep equality respons independen |
| Server client | resources, files/list, backups, network/allocations, schedules: respons SDK identik dengan salinan respons wire |
| Manual review respons | Envelope, status HTTP, data/attributes, pagination dan hasil normalisasi dibandingkan dengan implementasi SDK; data pribadi tidak dimasukkan laporan |
| Contoh kode dokumentasi | Schedule builder dan raw request dijalankan terhadap SDK asli memakai mock fetch; payload dan path sesuai |
| AI langsung | Cuki HTTP 200 untuk pertanyaan sederhana; prompt awal >4000 ditolak HTTP 400; setelah perbaikan dua pertanyaan docs mendapat 200 dalam sekitar 4–6 detik |
| Browser mobile | Semua 20 URL sitemap (19 halaman + root) merender article, tanpa gambar rusak atau overflow pada 390px |
| Browser interaksi | Search SMTP membuka `/docs/email`; canonical benar; menu tablet tersedia pada 820px; Escape menutup drawer |
| Dependency | Awal 4 advisory; lockfile diperbaiki, audit 0 vulnerability |

Perbandingan resources yang nilainya berubah dilakukan terhadap salinan respons request yang sama. Daftar inventory dibandingkan lewat dua request independen. Ini menguji keutuhan respons SDK, bukan kebenaran internal data panel. Tidak ada file panel yang dibaca isinya atau diubah; daftar file saja diperiksa.

## Perbaikan

1. Cuki menjadi prioritas bila key environment tersedia; batas prompt disesuaikan dengan batas asli 4000 karakter.
2. Context AI dipilih berdasarkan pertanyaan dari dokumentasi server, bukan dipotong dari awal knowledge base atau dipercaya dari browser.
3. Validasi string, status gagal HTTP 503, method 405, body 400/413, output no-store/nosniff, batas upstream 128KB, timeout dan delapan request aktif per instance.
4. Menolak object/array/HTML/error sebagai jawaban; mempertahankan jawaban troubleshooting yang diawali kata Error.
5. Sensor pola PTLA/PTLC/GitHub/Bearer sebelum provider; source guard juga memindai Markdown/JSON/workflow dan file baru.
6. Dependency qs dipaksa ke patch kompatibel >=6.16.0 karena Express lama membatasi versi transitif rentan. Dependency lain diperbarui lewat audit fix.
7. Menu tablet, hasil search mobile, status tanpa hasil, Ctrl/Cmd+K, dan pengetikan tanpa menambah history.
8. Copy fallback/error feedback, label tombol, batas input, auto-scroll chat, tabel Markdown, timeout browser, Escape dan scroll lock.
9. Terminal diberi label simulasi; menghapus output sukses/self-check palsu yang menggantikan hasil contoh. Timer dibersihkan; reduced motion dihormati terminal.
10. Asset hilang `/manus-storage` dihapus dari UI/CSS/metadata; konfigurasi Tailwind JS duplikat yang berisi sintaks TS dihapus.
11. Metadata route diperbarui; route tidak dikenal menampilkan halaman tidak ditemukan dengan noindex.
12. Contoh smart facade, schedule builder, raw path, resources envelope, auth bot, respons backend tersaring, dan penjelasan idempotency diperbaiki.
13. Jalur build source terpin menggantikan klaim npm 1.4.2; CLI yang belum diimplementasikan tidak lagi dijadikan jalur provisioning utama.
14. Local API runner/proxy ditambahkan; Vercel menggunakan npm ci dan security headers; CI mencakup Node 24 yang dipakai hosting.

## Batas cakupan dan pekerjaan upstream

- Tidak menguji create/delete/reinstall/power pada server aktif, SMTP broadcast, transaksi pembayaran, maupun pengiriman pesan bot. Mutasi berisiko tidak diperlukan untuk audit dokumentasi ini; regression SDK memakai mock untuk sebagian operasi tersebut.
- Source SDK 1.4.2 memiliki gap sendiri: preview/dryRun dapat membuat user jika autoCreateUser aktif; delete server dengan true memanggil force delete; help mengiklankan admin/ids/probe yang tidak ada pada dispatcher. Web telah menjelaskan batas tersebut. Repo SDK tidak diubah atau diterbitkan dalam pembaruan web ini.
- Jawaban AI tetap probabilistik. Review manual menemukan contoh SMTP yang mengarang method/tipe parameter; prompt diperketat dengan signature numerik dan larangan API tambahan. Jangan menganggap jawaban AI sebagai hasil eksekusi atau bukti bahwa semua contoh provider benar.
- Rate/concurrency guard berlaku per instance, bukan perlindungan abuse terdistribusi. Secret redaction berbasis pola tidak mencakup semua format rahasia.
- Cuki memerlukan `CUKI_API_KEY` pada hosting. Vercel CLI workspace belum login; key tidak dimasukkan ke source atau bundle. Health hanya menyatakan konfigurasi, bukan ketersediaan provider.
- Tidak ada klaim bebas bug, audit penetrasi penuh, beban maksimum, ataupun uptime provider. Angka di atas hanya mencakup skenario yang benar-benar dijalankan.

Kredensial pengujian disimpan privat di luar repo, dengan direktori mode 0700 dan file mode 0600. Tidak ada key atau respons panel mentah pada commit, workflow, screenshot, atau laporan ini.
