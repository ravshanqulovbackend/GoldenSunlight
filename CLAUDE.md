# CLAUDE.md

Ushbu fayl ushbu repo ustida ishlaydigan Claude Code (yoki boshqa AI agent) uchun yo'riqnoma.

## Loyiha haqida

**GoldenSunlight** — gigiena va maishiy tozalash mahsulotlari (nam salfetkalar, ayollar
gigienasi, bolalar mahsulotlari, tozalash vositalari) ishlab chiqaruvchi/distribyutor korxona
uchun to'liq stack e-commerce platforma. Korxona **Dubay, BAA**da joylashgan deb hisoblanadi —
barcha foydalanuvchiga ko'rinadigan matn **ingliz tilida**, narxlar **AED** valyutasida
ko'rsatiladi (ilgari O'zbekiston/so'm kontekstida bo'lgan, keyinchalik BAA/AED'ga qayta
brendlangan). Katalog Sunlight, Peri, Rio, Natural Fresh va Comforta brendlarini qamrab oladi.
Asl loyiha nomi: `stitch_modern_shirinliklar_do_koni_platformasi` (loyiha dastlab qandolat
do'koni sifatida boshlangan, keyinchalik haqiqiy mahsulot yo'nalishiga mos ravishda gigiena
tovarlari domeniga qayta brendlangan — kod tuzilishi generik bo'lgani uchun bu asosan
kontent/brending o'zgarishi bo'ldi).

- **Backend:** Django 5 + Django REST Framework — to'liq ishlab chiqilgan, 16 ta app.
- **Frontend:** Next.js 16 (App Router) — **Phase 1 (mijoz-tomon xarid oqimi) to'liq qurilgan va
  brauzerda sinovdan o'tgan, Phase 3 (admin panel) ham asosan qurilgan.** Phase 2 (marketing
  sahifalari) qisman — faqat `/about` bor. Batafsil pastda.
- **DB:** PostgreSQL 16 (prod/docker), SQLite (lokal dev fallback)
- **Cache/Queue:** Redis 7, Celery + Celery Beat
- **Deploy:** Docker Compose, Nginx (reverse proxy)

Eslatma: repo tub papkasida `README.md` yo'q (`.gitignore`da istisno qilingan) — API/sahifalar
haqida to'liq va aniq ma'lumot uchun to'g'ridan-to'g'ri `backend/*/urls.py` va pastdagi "Repo
tuzilishi" / "joriy holat" bo'limlariga tayaning.

## Muhim: joriy holat (2026-09-08 holatiga)

✅ **BAA/AED'ga qayta brendlash deyarli tugallangan.** Backend'dagi barcha xato xabarlari,
Django admin action label'lari/`help_text`'lari va `seed.py`dagi kompaniya ma'lumotlari
o'zbekchadan ingliz tiliga o'tkazilgan (frontend UI matni allaqachon ingliz tilida edi).
`SiteSettings.delivery_fee`/`Order.delivery_fee` default qiymati `15000` (so'm) o'rniga `15`
(AED) bo'ldi, `frontend/src/lib/utils/money.ts`dagi `formatPrice()` endi `"78 000 so'm"` emas,
`"AED 78,000.00"` formatida qaytaradi. To'lov usullaridan O'zbekistonga xos `click`/`payme`/
`uzum` olib tashlangan — endi faqat `cash`/`card` qoladi (checkout sahifasida alohida to'lov
usuli tanlash UI'i ham olib tashlangan, `PaymentMethodSelect.tsx` o'chirilgan).

✅ **Admin activity log endi deyarli barcha admin CRUD resurslarini qamraydi.** `common/utils.py`
dagi `log_activity`/`diff_instance` `products`/`categories`dan tashqari endi `certificates`,
`gallery` (ikkala viewset), `news`, `pages.Company`, `orders` (Admin detail/status), `reviews`
(o'chirish) va `users` (Admin update/destroy) view'lariga ham ulangan. `DIFF_EXCLUDE`ga
`password`/`avatar`/`last_login` qo'shilgan — activity log diff'ida parol xeshi ko'rinmaydi.

✅ **Foydalanuvchi rol ierarxiyasi qattiqlashtirilgan.** Endi faqat bitta `superadmin` bo'lishi
mumkin (`User.clean()` + `AdminUserDetailView.update` darajasida tekshiriladi), va oddiy
`admin` boshqa `admin`/`superadmin`ga tegishli hech qanday amalni (ko'rish/o'zgartirish/
o'chirishdan tashqari — bunga umuman ruxsat yo'q) bajara olmaydi — faqat mijozlarni (`staff`)
boshqaradi (`users/views.py`dagi `_guard_actor_vs_target`).

✅ **Frontend Phase 1 tayyor.** `frontend/` — Next.js 16 + TypeScript + Tailwind v4 (App Router,
Server Components + TanStack Query gibrid arxitektura, JWT auth + Zustand, `frontend/Dockerfile`
mavjud). Qurilgan sahifalar: bosh sahifa, mahsulotlar katalogi (filtr/qidiruv/saralash/
sahifalash), mahsulot tafsiloti (galereya/tablar/sharhlar), login/register, savat, checkout
(manzil/kupon/to'lov usuli), buyurtmalar (ro'yxat+tafsilot), profil, sevimlilar. Barcha
`npm run build` va real backend'ga ulangan holda brauzerda (Playwright) sinovdan o'tgan —
to'liq xarid oqimi (ro'yxatdan o'tish → katalog → savat → checkout → buyurtma) ishlaydi.

✅ **Frontend Phase 3 (admin panel) asosan qurilgan.** `frontend/src/app/admin/` — 11 bo'lim
`AdminSidebar`da (`frontend/src/components/admin/AdminSidebar.tsx`): dashboard, orders,
products (+ new/edit), categories, reviews, users (+detail), support, certificates, gallery,
partnerships, settings — plyus faqat `superadmin` uchun ko'rinadigan notifications. Mos ravishda
backend'da endi `products`/`categories`/`gallery`/`certificates`/`news` app'larida
`AdminXViewSet` (`ModelViewSet`, to'liq CRUD) mavjud — CLAUDE.md'ning avvalgi versiyasida
aytilgan "admin CRUD endpoint yo'q" muammosi endi yo'q. `orders`/`users`/`reviews` app'lari esa
alohida `AdminOrder*`/`AdminUser*`/`AdminReview*` generic view'lari orqali boshqariladi.

✅ **Yangi `support` app.** Statik "xabar" emas — mijoz va xodim(lar) orasidagi suhbat (thread)
tizimi: `SupportMessage` (`customer`/`sender`, ikki tomon uchun alohida `is_read`/
`is_read_by_customer`), conversation ro'yxati va unread-count endpoint'lari
(`backend/support/urls.py`). Frontend tomonda `frontend/src/components/support/` va
`/admin/support` sahifasi orqali ishlatiladi.

✅ **Yangi `pages` app orqali hamkorlik oqimi.** `Company` (kompaniya haqida ma'lumot,
`/about` sahifasini quvvatlaydi) va `PartnershipRequest` — mijozlar `/about`dagi
`PartnershipForm` (`frontend/src/components/about/`) orqali so'rov yuboradi,
admin `/admin/partnerships`da ko'radi (`AdminPartnershipRequestListView`).

⏳ **Yo'q narsalar (qolgan ishlar):**
- **Phase 2 qisman.** `/about` bor, lekin `/contact`, `/news`, `/gallery` (storefront tomonda)
  hali yo'q — backend API (`news`/`gallery`/`contacts` app) va admin CRUD tayyor, faqat mijozga
  ko'rinadigan sahifalar qolgan.
- **Admin panelda `/admin/news` sahifasi yo'q** — backend'da `AdminNewsViewSet` allaqachon
  ishlaydi, lekin `AdminSidebar`da yoki `frontend/src/app/admin/`da unga mos frontend sahifa
  hali qurilmagan (ro'yxatdagi yagona "backend tayyor, frontend yo'q" bo'shliq).
- `docker compose up --build` haqiqiy Docker bilan sinovdan o'tkazilmagan (bu muhitda Docker
  o'rnatilmagan) — `next build` standalone chiqishi qo'lda (`node server.js`) ishga tushirilib
  tekshirildi va to'g'ri ishladi, lekin haqiqiy konteynerlashtirilgan holatda birinchi marta
  ishga tushirishda tasdiqlash tavsiya etiladi.

⚠️ **Testlar yo'q.** Backend'dagi barcha 16 ta app'da `tests.py` bo'sh Django shabloniga yaqin
(jami ~48 qator). Frontend'da ham avtomatik test yo'q (faqat qo'lda/Playwright orqali
bir martalik tekshiruv o'tkazilgan, CI'ga ulanmagan).

## Tez-tez ishlatiladigan buyruqlar

### Backend (lokal, Docker'siz)

```bash
cd backend
python3.12 -m venv .venv            # aynan 3.12 — Dockerfile ham shu versiyani ishlatadi
source .venv/bin/activate           # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python seed.py                      # demo katalog ma'lumotlarini yuklaydi (20 mahsulot —
                                     # har biri to'liq arabcha tarjima bilan — brendlar,
                                     # kategoriyalar, kupon, yangiliklar, kompaniya —
                                     # user/admin/buyurtma/sharh ENDI YARATILMAYDI)
python manage.py runserver          # http://localhost:8000
```

Foydali qo'shimcha buyruqlar:
```bash
python manage.py createsuperuser
python manage.py clear_users        # custom command — barcha userlarni tozalaydi
python manage.py makemigrations
python manage.py test               # hozircha bo'sh, lekin ishlaydi
```

### Frontend (lokal, Docker'siz)

```bash
cd frontend
npm install
cp .env.local.example .env.local    # backend alohida ishlayotgan bo'lsa (localhost:8000)
npm run dev                         # http://localhost:3000
npm run build                       # production build + TypeScript tekshiruvi
npm run lint                        # ESLint (next build endi avtomatik lint qilmaydi)
```

### Docker (to'liq stack)

```bash
docker compose up --build -d        # barcha servislarni ishga tushiradi
docker compose logs -f backend      # yoki: frontend / nginx / celery
docker compose exec backend bash
docker compose exec backend python manage.py <command>
docker compose exec db psql -U postgres -d goldensunlight_db
docker compose down                 # to'xtatish
docker compose down -v              # + volume'larni (DB ma'lumotlarini) o'chirish
```

## Repo tuzilishi

```
backend/            Django loyiha — config/ (settings/urls/celery) + 16 domain app
  users/ products/ categories/ cart/ orders/ favorites/ reviews/ payments/
  notifications/ common/ news/ gallery/ certificates/ pages/ contacts/ support/
  seed.py            Demo ma'lumotlar generatori (~640 qator)
frontend/            Next.js 16 — Phase 1 (mijoz-tomon) tayyor, Phase 3 (admin) asosan tayyor
  src/app/(storefront)/          bosh sahifa, katalog, mahsulot tafsiloti (Server Components), about
  src/app/(storefront)/(protected)/  savat/checkout/profil/buyurtmalar/sevimlilar/notifications (RequireAuth)
  src/app/auth/                 login/register
  src/app/admin/                 dashboard/orders/products/categories/reviews/users/support/
                                  certificates/gallery/partnerships/settings/notifications
  src/lib/api/                  axios (auth) + server-fetch (public RSC) + endpoints/*
  src/lib/query/                 TanStack Query hook'lari (masalan useNotifications)
  src/lib/guards/                 PendingRoleGate va RequireAuth kabi marshrut himoyachilari
  src/lib/stores/                authStore (Zustand+persist), toastStore
  src/components/                layout/ ui/ product/ cart/ checkout/ auth/ admin/ about/ support/
frontend_html_reference/   Statik HTML dizayn namunalari (asl referens, DESIGN.md tokenlar manbasi)
nginx/nginx.conf     Reverse proxy config (/, /api/, /django-admin/, /admin/* marshrutlash)
docker-compose.yml   db, redis, backend, celery, celery-beat, frontend, nginx servislari
```

## Konventsiyalar

- Foydalanuvchiga ko'rinadigan matn, model `verbose_name`lari, xato xabarlari — **ingliz tilida**
  (loyiha BAA/Dubay bozoriga qayta brendlangan; avval bu qoida "o'zbek tilida" edi — eski kod
  yoki eski hujjatlarda o'zbekcha matn uchrasa, ingliz tiliga o'tkazing).
- `AUTH_USER_MODEL = users.User`, rollar: `staff` (oddiy mijoz — verbose_name "Mijoz"), `admin`
  (xodim), `superadmin` (korxona egasi). Admin huquqi `role` maydoni orqali tekshiriladi
  (`IsAdminRole`), Django'ning `is_staff`/`is_superuser` bilan ALOQASI YO'Q.
- **Admin huquqi berish ikki bosqichli**: superadmin `/django-admin/` orqali userni tanlab
  "Admin huquqini berish (profil to'ldirilgach faollashadi)" amalini bajaradi — bu `role`ni
  darhol o'zgartirmaydi, `pending_role='admin'` qo'yadi (`users/models.py`, `users/admin.py`).
  User keyingi safar frontend'ga kirganda butun ilovani to'suvchi majburiy ekran ko'rsatiladi
  (`frontend/src/lib/guards/PendingRoleGate.tsx` — root `providers.tsx`da ulangan) va ism/
  familiya/telefon/avatar to'ldirmaguncha hech qayerga o'ta olmaydi. To'ldirilgach
  `ProfileView.perform_update()` (`users/views.py`) `role`ni haqiqatan `pending_role`ga
  o'tkazadi.
- Django admin `/django-admin/` da (odatiy `/admin/` emas — u Next.js admin panelga ajratilgan,
  `settings.py`dagi `ADMIN_URL` orqali sozlangan).
- **Narx/sana formatlash hech qachon `Intl.NumberFormat`/`Intl.DateTimeFormat` orqali qilinmaydi**
  (`frontend/src/lib/utils/money.ts`) — Node (server) va brauzer (client) ICU ma'lumotlari bir
  xil locale uchun ham boshqa-boshqa guruhlash belgisi qaytarishi mumkin, bu esa Next.js
  hydration mismatch xatosiga olib keladi. Buning o'rniga qo'lda, deterministik formatlash
  ishlatiladi. Valyuta — **AED** (`formatPrice()` → `"AED 12,345.00"`), so'm/UZS emas.
- **Faqat bitta `superadmin` bo'lishi mumkin** (`users/models.py`ning `User.clean()`i va
  `AdminUserDetailView.update`) va oddiy `admin` boshqa `admin`/`superadmin`ga tegishli hech
  qanday amal bajara olmaydi — faqat `staff` (mijoz) rolidagi userlarni boshqaradi
  (`users/views.py`dagi `_guard_actor_vs_target`).
- **Admin CRUD amallari `common/utils.py`dagi `log_activity`/`diff_instance` orqali
  loglanadi** — deyarli barcha admin resurslarda (`products`, `categories`, `certificates`,
  `gallery`, `news`, `pages.Company`, `orders`, `reviews`, `users`) qo'llanadi. `DIFF_EXCLUDE`
  to'plamiga kiruvchi maydonlar (`image`, `avatar`, `password`, `last_login`, `created_at`,
  `updated_at`, `rating`, `review_count`) diff'ga kiritilmaydi.
- **To'lov usullari — faqat `cash`/`card`** (`orders/models.py` `Order.PAYMENT_CHOICES`) —
  O'zbekistonga xos `click`/`payme`/`uzum` olib tashlangan. Checkout sahifasida alohida to'lov
  usuli tanlash UI'i yo'q.
- **Logout doim `logoutAndRedirect()` orqali** (`frontend/src/lib/stores/authStore.ts`) — oddiy
  `logout(); router.push(...)` himoyalangan sahifada `RequireAuth`ning reaktiv redirect'i bilan
  poyga qiladi va foydalanuvchini `/auth/login`ga tashlab yuboradi.
- Backend'ning `products`/`brands` rasmlari (`FlexibleImageField`) **nisbiy** yo'l qaytaradi,
  boshqa barcha app (news/gallery/certificates/users) **mutlaq URL** qaytaradi — frontend'da
  `getImageUrl()` (`lib/utils/image.ts`) ikkalasini ham to'g'ri hal qiladi.
- Cache backend: Redis mavjud bo'lsa Django'ning ichki `RedisCache`, aks holda `LocMemCache`
  (`django-redis` paketi `requirements.txt`da bor, lekin ishlatilmaydi — Django 4+ ichki redis
  backend'i ishlatiladi).

## Demo ma'lumotlar (seed.py orqali yaratiladi)

⚠️ `seed.py` endi **demo user/admin/buyurtma/sharh/sevimli/manzil yaratmaydi** — faqat
brendlar, kategoriyalar, mahsulotlar (barcha 6 kategoriya va 5 brendni qamrab oluvchi 20 ta,
har biri `name_ar`/`description_ar`/`ingredients_ar`/`badge_ar` orqali to'liq arabcha
tarjima bilan — `backend/products_catalog_data.py`), kuponlar, yangiliklar va kompaniya
ma'lumotini yuklaydi. Real admin/superadmin akkaunt kerak bo'lsa `python manage.py createsuperuser`
ishlating (yoki Django admin orqali oddiy userga `pending_role='admin'` belgilang — yuqoridagi
"Admin huquqi berish ikki bosqichli" bo'limiga qarang).

Foydali kupon kodlari (seed.py): `WELCOME10` (10%, min 50 AED), `NEWYEAR15` (15%, min 100 AED),
`MEGA20` (20%, min 200 AED).

Faqat lokal/dev muhit uchun. Productionga chiqarishdan oldin albatta o'zgartiring.
