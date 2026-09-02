from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    help = "Barcha foydalanuvchilarni va ularga bog'langan ma'lumotlarni tozalaydi"

    def handle(self, *args, **options):
        with transaction.atomic():
            user_count = User.objects.count()
            if user_count == 0:
                self.stdout.write(self.style.SUCCESS("Database'da foydalanuvchilar yo'q."))
                return

            self.stdout.write(f"Jami {user_count} ta foydalanuvchi topildi...")

            # Barcha foydalanuvchilarni o'chirish
            # CASCADE orqali bog'langan ma'lumotlar ham o'chiriladi:
            # - orders.Address
            # - orders.Order → orders.OrderItem
            # - orders.Order → payments.Payment
            # - reviews.Review
            # - favorites.Favorite
            # - notifications.Notification
            # - contacts.ContactMessage (SET_NULL, user=None bo'ladi)
            User.objects.all().delete()

        self.stdout.write(self.style.SUCCESS(f"Muvaffaqiyatli tozalandi! {user_count} ta foydalanuvchi o'chirildi."))
