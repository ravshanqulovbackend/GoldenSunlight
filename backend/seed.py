import os
import sys
import shutil
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.conf import settings
from categories.models import Category
from products.models import Product, ProductImage, Brand
from orders.models import Coupon
from products_catalog_data import PRODUCTS_DATA

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


# ─── Create Brands ────────────────────────────────────────────
# Peri is the only brand with a clean standalone logo asset among the source
# photography (others only appear embossed on packaging).
brands_data = [
    {'name': 'Sunlight', 'slug': 'sunlight', 'description': 'Flagship brand — wet wipes, paper products, and household cleaning supplies'},
    {'name': 'Peri', 'slug': 'peri', 'description': "Feminine hygiene products — sanitary pads and panty liners"},
    {'name': 'Natural Fresh', 'slug': 'natural-fresh', 'description': 'Wet wipes for babies and the whole family'},
    {'name': 'Rio', 'slug': 'rio', 'description': "Baby and universal wet wipes"},
    {'name': 'Comforta', 'slug': 'comforta', 'description': 'Scented and classic sanitary pads'},
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
    {'name': 'Household Cleaning', 'slug': 'household-cleaning', 'description': 'Disposable cleaning wipes, rolls, and mops'},
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
    {'code': 'WELCOME10', 'discount_percent': 10, 'min_order_amount': 50, 'max_uses': 100},
    {'code': 'NEWYEAR15', 'discount_percent': 15, 'min_order_amount': 100, 'max_uses': 50},
    {'code': 'MEGA20', 'discount_percent': 20, 'min_order_amount': 200, 'max_uses': 30},
]
for c_data in coupons_data:
    Coupon.objects.get_or_create(code=c_data['code'], defaults=c_data)
print('Coupons created')

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
    'description': 'Founded in 2005, GoldenSunlight has grown from a small production workshop into one of the leading manufacturers and distributors of hygiene and household cleaning products in the UAE. Under the Sunlight, Peri, Rio, Natural Fresh, and Comforta brands, we produce wet wipes, feminine hygiene products, baby products, and cleaning supplies for homes across Dubai and the wider Emirates.',
    'mission': 'Bringing cleanliness, trust, and care into every home.',
    'founded_year': 2005,
    'employee_count': '500+',
    'phone': '+971 4 123 4567',
    'email': 'info@goldensunlight.ae',
    'address': 'Al Quoz Industrial Area 3, Dubai, UAE',
    'experience_years': '20+',
    'product_types': '150+',
    'export_countries': '10+',
    'partner_stores': '200+',
})
print('Company info created')

print('\n=== Seed completed successfully! ===')
print('No default users were created — run `python manage.py createsuperuser` to create a real admin account.')
