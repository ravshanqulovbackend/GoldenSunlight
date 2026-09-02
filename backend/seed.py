import os
import sys
import shutil
import django
import random
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from categories.models import Category
from products.models import Product, ProductImage, Brand
from orders.models import Order, OrderItem, Coupon, Address
from reviews.models import Review
from favorites.models import Favorite
from products_catalog_data import PRODUCTS_DATA

User = get_user_model()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SEED_ASSETS_DIR = os.path.join(BASE_DIR, 'seed_assets')


def seed_image(filename, subdir='products'):
    """Copy a real product photo from seed_assets/<subdir>/ (tracked in git) into
    MEDIA_ROOT/<subdir>/ and return the relative path Django's image fields expect."""
    src = os.path.join(SEED_ASSETS_DIR, subdir, filename)
    dst_dir = os.path.join(str(settings.MEDIA_ROOT), subdir)
    os.makedirs(dst_dir, exist_ok=True)
    dst = os.path.join(dst_dir, filename)
    if not os.path.exists(dst):
        shutil.copyfile(src, dst)
    return f'{subdir}/{filename}'


# ─── Create Superadmin (business owner) ───────────────────────
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@goldensunlight.uz', 'admin123', phone='+998901234567', role='superadmin')
    print('Superadmin user created (admin / admin123)')

# ─── Create demo Admin (staff) ──────────────────────────────────
if not User.objects.filter(username='admin1').exists():
    admin1 = User.objects.create_user(
        'admin1', 'admin1@goldensunlight.uz', 'admin1234',
        first_name='Farrux', last_name='Nazarov', phone='+998901230000', role='admin',
    )
    print('Admin (staff) user created (admin1 / admin1234)')

# ─── Create Demo Users (online customers — "staff" role) ──────────
demo_users = [
    {'username': 'user1', 'email': 'user1@example.com', 'first_name': 'Aziz', 'last_name': 'Karimov', 'phone': '+998901112233', 'password': 'user1234'},
    {'username': 'user2', 'email': 'user2@example.com', 'first_name': 'Nodira', 'last_name': 'Aliyeva', 'phone': '+998902223344', 'password': 'user1234'},
    {'username': 'user3', 'email': 'user3@example.com', 'first_name': 'Sardor', 'last_name': 'Rahimov', 'phone': '+998903334455', 'password': 'user1234'},
    {'username': 'user4', 'email': 'user4@example.com', 'first_name': 'Gulnora', 'last_name': 'Toshmatova', 'phone': '+998904445566', 'password': 'user1234'},
    {'username': 'user5', 'email': 'user5@example.com', 'first_name': 'Jamshid', 'last_name': 'Oripov', 'phone': '+998905556677', 'password': 'user1234'},
    {'username': 'user6', 'email': 'user6@example.com', 'first_name': 'Dilnoza', 'last_name': 'Yuldasheva', 'phone': '+998906667788', 'password': 'user1234'},
    {'username': 'user7', 'email': 'user7@example.com', 'first_name': 'Bobur', 'last_name': 'Mirzayev', 'phone': '+998907778899', 'password': 'user1234'},
    {'username': 'user8', 'email': 'user8@example.com', 'first_name': 'Malika', 'last_name': 'Ergasheva', 'phone': '+998908889900', 'password': 'user1234'},
    {'username': 'user9', 'email': 'user9@example.com', 'first_name': 'Suhrob', 'last_name': 'Jumayev', 'phone': '+998909990011', 'password': 'user1234'},
    {'username': 'user10', 'email': 'user10@example.com', 'first_name': 'Nilufar', 'last_name': 'Rashidova', 'phone': '+998900001122', 'password': 'user1234'},
]

users = []
for u_data in demo_users:
    user, created = User.objects.get_or_create(
        username=u_data['username'],
        defaults={
            'email': u_data['email'],
            'first_name': u_data['first_name'],
            'last_name': u_data['last_name'],
            'phone': u_data['phone'],
        }
    )
    if created:
        user.set_password(u_data['password'])
        user.save()
        print(f'  Created user: {user.username}')
    users.append(user)
print(f'Users ready ({len(users)} total)')

# ─── Create Brands ────────────────────────────────────────────
# Peri is the only brand with a clean standalone logo asset among the source
# photography (others only appear embossed on packaging).
brands_data = [
    {'name': 'Sunlight', 'slug': 'sunlight', 'description': 'Flagship brand — wet wipes, paper products, and household cleaning supplies'},
    {'name': 'Peri', 'slug': 'peri', 'description': "Feminine hygiene products — sanitary pads and panty liners"},
    {'name': 'Natural Fresh', 'slug': 'natural-fresh', 'description': 'Wet wipes for babies and the whole family'},
    {'name': 'Rio', 'slug': 'rio', 'description': "Baby and universal wet wipes"},
    {'name': 'Venzi', 'slug': 'venzi', 'description': "Disposable razors for men"},
    {'name': 'Comforta', 'slug': 'comforta', 'description': 'Scented and classic sanitary pads'},
    {'name': 'Nika', 'slug': 'nika', 'description': "Disposable razors for women"},
]
brands_data[1]['image'] = seed_image('peri.png', subdir='brands')

brands = []
for b_data in brands_data:
    brand, _ = Brand.objects.get_or_create(slug=b_data['slug'], defaults=b_data)
    brands.append(brand)
print(f'Brands created ({len(brands)})')

# ─── Create Categories ────────────────────────────────────────
categories_data = [
    {'name': 'Baby & Kids Wipes', 'slug': 'baby-kids-wipes', 'description': 'Gentle wet wipes formulated for babies and children'},
    {'name': 'Universal & Antibacterial Wipes', 'slug': 'universal-wipes', 'description': 'Everyday, antibacterial, and scented wet wipes for adults'},
    {'name': 'Specialty Wipes', 'slug': 'specialty-wipes', 'description': 'Makeup remover, intimate care, and facial wipes'},
    {'name': "Feminine Hygiene", 'slug': 'feminine-hygiene', 'description': 'Sanitary pads and panty liners'},
    {'name': "Men's Grooming", 'slug': 'mens-grooming', 'description': "Disposable razors and shaving supplies for men"},
    {'name': "Women's Grooming", 'slug': 'womens-grooming', 'description': "Disposable razors for women"},
    {'name': 'Toilet Paper', 'slug': 'toilet-paper', 'description': 'Soft, absorbent toilet paper in multiple scents'},
    {'name': 'Paper Towels', 'slug': 'paper-towels', 'description': 'Kitchen paper towel rolls'},
    {'name': 'Paper Napkins', 'slug': 'paper-napkins', 'description': 'Table and dispenser paper napkins'},
    {'name': 'Facial Tissues', 'slug': 'facial-tissues', 'description': 'Boxed facial tissues in decorative designs'},
    {'name': 'Cotton Pads & Buds', 'slug': 'cotton-care', 'description': '100% cotton pads and cotton buds'},
    {'name': 'Dental Care', 'slug': 'dental-care', 'description': 'Dental floss and dental patient bibs'},
    {'name': 'Household Cleaning', 'slug': 'household-cleaning', 'description': 'Disposable cleaning wipes, rolls, and mops'},
    {'name': 'Laundry Care', 'slug': 'laundry-care', 'description': '3-in-1 laundry detergent capsules'},
    {'name': 'HoReCa Disposables', 'slug': 'horeca-disposables', 'description': 'Disposable non-woven bed sheets for hotels, spas, and clinics'},
]
categories = {}
for cat_data in categories_data:
    cat, _ = Category.objects.get_or_create(slug=cat_data['slug'], defaults=cat_data)
    categories[cat.slug] = cat
print('Categories created')

# ─── Create Products (full catalog — every source photo becomes a product or a
#     gallery image of one, see backend/products_catalog_data.py) ─────────────
products = []
for p_data in PRODUCTS_DATA:
    p_data = dict(p_data)
    cat_slug = p_data.pop('category_slug')
    brand_slug = p_data.pop('brand_slug', '')
    image_file = p_data.pop('image_file')
    gallery_files = p_data.pop('gallery_files', [])
    cat = categories.get(cat_slug)
    brand = next((b for b in brands if b.slug == brand_slug), None)
    product, created = Product.objects.get_or_create(
        slug=p_data['slug'],
        defaults={**p_data, 'category': cat, 'brand': brand, 'image': seed_image(image_file)}
    )
    if created:
        for i, gfile in enumerate(gallery_files):
            ProductImage.objects.create(
                product=product, image=seed_image(gfile), order=i,
                alt_text=f'{product.name} - photo {i + 1}',
            )
    products.append(product)
print(f'Products ready ({len(products)} total)')

# ─── Create Coupons ───────────────────────────────────────────
coupons_data = [
    {'code': 'WELCOME10', 'discount_percent': 10, 'min_order_amount': 50000, 'max_uses': 100},
    {'code': 'NEWYEAR15', 'discount_percent': 15, 'min_order_amount': 100000, 'max_uses': 50},
    {'code': 'MEGA20', 'discount_percent': 20, 'min_order_amount': 200000, 'max_uses': 30},
]
for c_data in coupons_data:
    Coupon.objects.get_or_create(code=c_data['code'], defaults=c_data)
print('Coupons created')

# ─── Create Demo Orders ──────────────────────────────────────
if Order.objects.count() == 0:
    statuses = ['pending', 'confirmed', 'processing', 'packaging', 'delivering', 'delivered', 'cancelled']
    payment_methods = ['cash', 'card']
    now = timezone.now()

    for i in range(30):
        user = random.choice(users)
        product = random.choice(products)
        qty = random.randint(1, 5)
        subtotal = float(product.price) * qty
        delivery_fee = 15000
        total = subtotal + delivery_fee

        order = Order.objects.create(
            user=user,
            status=random.choice(statuses),
            full_name=f'{user.first_name} {user.last_name}',
            phone=user.phone,
            address_text='Tashkent, Amir Temur Street, Building 15',
            payment_method=random.choice(payment_methods),
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total_amount=total,
            created_at=now - timedelta(days=random.randint(0, 60)),
        )
        OrderItem.objects.create(order=order, product=product, product_name=product.name, quantity=qty, price=product.price)
    print('30 demo orders created')
else:
    print('Orders already exist, skipping')

# ─── Create Demo Reviews ──────────────────────────────────────
if Review.objects.count() == 0:
    review_comments = [
        'Very soft and gentle, no irritation at all.',
        "Bought this for my kid, no allergic reaction at all.",
        'Fast, professional delivery.',
        'Great value for the price.',
        'Recommended it to friends, everyone is happy with it.',
        'Well packaged, arrived in perfect condition.',
        'The scent is pleasant but not overpowering.',
        'I always choose this brand now.',
        'Very comfortable, reliable protection even overnight.',
        "Extremely soft, doesn't irritate sensitive skin at all.",
        'Absorbs well, better than I expected.',
        'A loyal customer now — quality is always consistent.',
        'Affordable price, but the quality is excellent.',
        'I always keep antibacterial wipes at home now.',
        'Works great for the car too.',
        'Very sharp razor, no nicks or cuts.',
        'Sturdy paper towels, they don\'t tear easily.',
        "Good quality cotton buds, they don't bend.",
        'Delivered within a day — excellent service.',
        'Lovely chamomile scent, my child loves it.',
        'Large pack, lasts a long time.',
        'Worked great even on sensitive skin, no irritation.',
        'Confirmed this is a genuine, original product.',
        'Ordering online was quick and easy.',
        'I always order from this site now.',
    ]

    for i in range(60):
        user = random.choice(users)
        product = random.choice(products)
        rating = random.choice([3, 4, 4, 4, 5, 5, 5])
        comment = random.choice(review_comments)

        review, created = Review.objects.get_or_create(
            user=user, product=product,
            defaults={'rating': rating, 'comment': comment}
        )
        if created:
            product.review_count = product.reviews.count()
            avg = sum(r.rating for r in product.reviews.all()) / product.review_count
            product.rating = round(avg, 1)
            product.save()
    print('60 demo reviews created')
else:
    print('Reviews already exist, skipping')

# ─── Create Demo Favorites ────────────────────────────────────
if Favorite.objects.count() == 0:
    for user in users[:5]:
        fav_products = random.sample(products, min(5, len(products)))
        for product in fav_products:
            Favorite.objects.get_or_create(user=user, product=product)
    print('Demo favorites created')
else:
    print('Favorites already exist, skipping')

# ─── Create Demo Addresses ────────────────────────────────────
from orders.models import Address as OrderAddress
if OrderAddress.objects.count() == 0:
    for user in users[:5]:
        OrderAddress.objects.get_or_create(
            user=user, title='Home',
            defaults={
                'full_name': f'{user.first_name} {user.last_name}',
                'phone': user.phone,
                'city': 'Tashkent',
                'district': 'Yunusabad',
                'street': 'Amir Temur Street',
                'building': '15',
                'apartment': 'Floor 2',
                'landmark': 'Near the metro station',
                'is_default': True,
            }
        )
    print('Demo addresses created')
else:
    print('Addresses already exist, skipping')

# ─── Create News ─────────────────────────────────────────────
from news.models import News
if News.objects.count() == 0:
    news_data = [
        {'title': 'New automated production line launched', 'slug': 'new-production-line-launched', 'summary': 'A new automated production line based on German technology has been launched.', 'content': 'Our company has launched a new automated production line for wet wipes and hygiene products. This line has the capacity to produce 50 million units per year.', 'is_published': True},
        {'title': 'International quality certificate obtained', 'slug': 'international-quality-certificate', 'summary': 'ISO 9001:2015 international quality management certification obtained.', 'content': 'Our company has received the ISO 9001:2015 international quality management system certification, confirming that our products meet international quality standards.', 'is_published': True},
        {'title': 'Export volume grew by 30%', 'slug': 'export-volume-grew', 'summary': 'Export volume grew by 30% this year.', 'content': 'Products from our Sunlight, Peri, and other brands are now exported to more than 10 countries.', 'is_published': True},
    ]
    for n_data in news_data:
        News.objects.get_or_create(slug=n_data['slug'], defaults=n_data)
    print('3 news articles created')

# ─── Create Gallery Categories & Images ─────────────────────
from gallery.models import GalleryCategory, GalleryImage
if GalleryCategory.objects.count() == 0:
    gc1, _ = GalleryCategory.objects.get_or_create(slug='production', defaults={'name': 'Production', 'sort_order': 1})
    gc2, _ = GalleryCategory.objects.get_or_create(slug='products', defaults={'name': 'Products', 'sort_order': 2})
    gc3, _ = GalleryCategory.objects.get_or_create(slug='company', defaults={'name': 'Company', 'sort_order': 3})
    gallery_data = [
        {'title': 'Production line', 'image': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop', 'category': gc1},
        {'title': 'Laboratory', 'image': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=600&fit=crop', 'category': gc1},
        {'title': 'Wet wipe products', 'image': seed_image('photo_2024-09-19_17-15-49.jpg'), 'category': gc2},
        {'title': 'Feminine hygiene products', 'image': seed_image('peri-228.png'), 'category': gc2},
        {'title': 'Company building', 'image': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop', 'category': gc3},
    ]
    for g_data in gallery_data:
        GalleryImage.objects.get_or_create(title=g_data['title'], defaults=g_data)
    print('Gallery categories and images created')

# ─── Create Certificates ────────────────────────────────────
from certificates.models import Certificate
if Certificate.objects.count() == 0:
    cert_data = [
        {'title': 'ISO 9001:2015', 'description': 'Quality management system', 'issued_by': 'ISO', 'is_active': True},
        {'title': 'GOST Conformity Certificate', 'description': 'Compliance with state standards', 'issued_by': 'GOST', 'is_active': True},
        {'title': 'Sanitary-Epidemiological Conclusion', 'description': 'Issued by the Ministry of Health', 'issued_by': 'SanEpidNazorat', 'is_active': True},
        {'title': 'Dermatological Test Certificate', 'description': 'Hypoallergenic — dermatologically tested', 'issued_by': 'Dermatology Center', 'is_active': True},
    ]
    for c_data in cert_data:
        Certificate.objects.get_or_create(title=c_data['title'], defaults=c_data)
    print('Certificates created')

# ─── Create Company ─────────────────────────────────────────
from pages.models import Company
company, _ = Company.objects.get_or_create(pk=1, defaults={
    'name': 'GoldenSunlight',
    'tagline': 'Cleanliness and care by your side every day',
    'description': 'Founded in 2005, GoldenSunlight has grown from a small production workshop into one of the largest manufacturers of hygiene and household cleaning products in Uzbekistan. Under the Sunlight, Peri, Rio, Natural Fresh, Venzi, Comforta, and Nika brands, we produce wet wipes, feminine hygiene products, baby products, and cleaning supplies.',
    'mission': 'Bringing cleanliness, trust, and care into every home.',
    'founded_year': 2005,
    'employee_count': '500+',
    'phone': '+998 71 123 45 67',
    'email': 'info@goldensunlight.uz',
    'address': 'Tashkent, Yunusabad District, Block 5',
    'experience_years': '20+',
    'product_types': '300+',
    'export_countries': '10+',
    'partner_stores': '200+',
})
print('Company info created')

print('\n=== Seed completed successfully! ===')
print('Admin: admin / admin123')
print('User: user1 / user1234 (or user2-user10 / user1234)')
