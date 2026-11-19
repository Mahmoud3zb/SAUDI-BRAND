import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { Category } from "../category/category-model";
import { Product } from "../product/product-model";
import { User, Role } from "../user/user-model";

dotenv.config();

const SEED_CATEGORIES = [
    {
        name: "العطور",
        slug: "perfumes",
        description: "روائح شرقية وفرنسية مميزة تعكس أناقتكِ",
        isActive: true,
    },
    {
        name: "العناية بالبشرة",
        slug: "skincare",
        description: "منتجات متكاملة لبشرة صحية ونضرة بلمسة طبيعية",
        isActive: true,
    },
    {
        name: "العناية بالشعر",
        slug: "haircare",
        description: "أقوى الزيوت والسيرومات لتقوية وتكثيف الشعر",
        isActive: true,
    },
    {
        name: "هاند ميد",
        slug: "handmade",
        description: "قطع وتصاميم يدوية فريدة ومميزة تناسب ذوقكِ الراقي",
        isActive: true,
    },
    {
        name: "الهدايا",
        slug: "gifts",
        description: "بوكسات وبكجات راقية بتغليف مميز لكل مناسبة",
        isActive: true,
    },
    {
        name: "العروض الحصرية",
        slug: "offers",
        description: "أقوى التخفيضات والبكجات التوفيرية لفترة محدودة",
        isActive: true,
    },
];

const SEED_PRODUCTS = [
    {
        name: "عطر يارا لطافة الزهري",
        slug: "yara-lattafa-perfume",
        categorySlug: "perfumes",
        price: 520,
        originalPrice: 650,
        stockQuantity: 25,
        rating: { score: 4.8, count: 124 },
        imageUrl: "/products/prod-1.jpg",
        description: "عطر نسائي شرقي ناعم يجمع بين الفانيليا والزهور الاستوائية لإطلالة تدوم طويلاً.",
        isFeatured: true,
        isActive: true,
    },
    {
        name: "زيت الشعر الهندي الأصلي 108",
        slug: "indian-hair-oil-108",
        categorySlug: "haircare",
        price: 153,
        originalPrice: 200,
        stockQuantity: 40,
        rating: { score: 4.7, count: 89 },
        imageUrl: "/products/prod-2.jpg",
        description: "تركيبة أعشاب هندية تقليدية لتغذية بصيلات الشعر وتقوية الجذور من الأطراف.",
        isFeatured: true,
        isActive: true,
    },
    {
        name: "ماء ميسيلار بيو سوفت المنظف",
        slug: "bio-soft-micellar-water",
        categorySlug: "skincare",
        price: 265,
        originalPrice: 320,
        stockQuantity: 18,
        rating: { score: 4.5, count: 56 },
        imageUrl: "/products/prod-3.jpg",
        description: "منظف لطيف يزيل المكياج والشوائب بلطف مع الحفاظ على ترطيب البشرة الطبيعي.",
        isFeatured: true,
        isActive: true,
    },
    {
        name: "سيروم الهيالورونيك المرطب المركز",
        slug: "hyaluronic-hydrating-serum",
        categorySlug: "skincare",
        price: 340,
        originalPrice: 420,
        stockQuantity: 15,
        rating: { score: 4.9, count: 98 },
        imageUrl: "/products/prod-4.jpg",
        description: "سيروم عالي التركيز لترطيب مكثف ومنح البشرة مظهراً ممتلئاً ومشرقاً طوال اليوم.",
        isFeatured: true,
        isActive: true,
    },
    {
        name: "مجموعة العناية الفائقة بالشعر",
        slug: "complete-haircare-set",
        categorySlug: "haircare",
        price: 490,
        originalPrice: 580,
        stockQuantity: 12,
        rating: { score: 4.6, count: 43 },
        imageUrl: "/products/prod-5.jpg",
        description: "مجموعة علاجية متكاملة لترميم الشعر التالف وإعادة الحيوية واللمعان الطبيعي.",
        isFeatured: true,
        isActive: true,
    },
    {
        name: "عطر خمرة لطافة الفاخر",
        slug: "khamrah-lattafa-perfume",
        categorySlug: "perfumes",
        price: 680,
        originalPrice: 850,
        stockQuantity: 20,
        rating: { score: 4.9, count: 210 },
        imageUrl: "/products/prod-6.jpg",
        description: "مزيج دافئ ومترف من القرفة وجوزة الطيب وخشب الصندل والفانيليا الغنية.",
        isFeatured: true,
        isActive: true,
    },
    {
        name: "كريم الترطيب العميق بالفيتامينات",
        slug: "vitamin-deep-moisturizing-cream",
        categorySlug: "skincare",
        price: 195,
        originalPrice: 240,
        stockQuantity: 30,
        rating: { score: 4.4, count: 37 },
        imageUrl: "/products/prod-7.jpg",
        description: "كريم غني بفيتامين E وخلاصة الألوفيرا لترطيب يدوم 24 ساعة وحماية حاجز البشرة.",
        isFeatured: false,
        isActive: true,
    },
    {
        name: "بكج هدايا الورد الملكي",
        slug: "royal-rose-gift-package",
        categorySlug: "gifts",
        price: 750,
        originalPrice: 920,
        stockQuantity: 8,
        rating: { score: 5.0, count: 65 },
        imageUrl: "/products/prod-8.jpg",
        description: "تنسيق فاخر من عطر الورد مع معطر للجسم وشمعة عطرية بلمسات ناعمة في بوكس مخملي.",
        isFeatured: true,
        isActive: true,
    },
];

export async function seedDatabase() {
    const URI = process.env.DB_URL;
    const DB_NAME = process.env.DB_NAME;

    if (!URI || !DB_NAME) {
        console.error("Seed Error: DB_URL or DB_NAME not defined");
        process.exit(1);
    }

    try {
        await mongoose.connect(URI, { dbName: DB_NAME });
        console.log("Connected to MongoDB for seeding...");

        // 1. Seed Categories
        const categoryMap = new Map<string, mongoose.Types.ObjectId>();
        for (const cat of SEED_CATEGORIES) {
            let existing = await Category.findOne({ slug: cat.slug });
            if (!existing) {
                existing = await Category.create(cat);
                console.log(`Created category: ${cat.name} (${cat.slug})`);
            }
            categoryMap.set(cat.slug, existing._id as mongoose.Types.ObjectId);
        }

        // 2. Seed Products
        for (const prod of SEED_PRODUCTS) {
            const categoryId = categoryMap.get(prod.categorySlug);
            if (!categoryId) continue;

            const existing = await Product.findOne({ slug: prod.slug });
            if (!existing) {
                await Product.create({
                    name: prod.name,
                    slug: prod.slug,
                    categoryID: categoryId,
                    price: prod.price,
                    originalPrice: prod.originalPrice,
                    stockQuantity: prod.stockQuantity,
                    rating: prod.rating,
                    imageUrl: prod.imageUrl,
                    description: prod.description,
                    isFeatured: prod.isFeatured,
                    isActive: prod.isActive,
                });
                console.log(`Created product: ${prod.name}`);
            }
        }

        // 3. Seed Default Admin
        const adminEmail = "admin@saudibrand.com";
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash("admin123", 10);
            await User.create({
                name: "مدير سعودي براند",
                email: adminEmail,
                password: hashedPassword,
                role: Role.ADMIN,
            });
            console.log(`Created default admin: ${adminEmail}`);
        }

        console.log("Database seed completed successfully!");
    } catch (err) {
        console.error("Database seed error:", err);
    } finally {
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
    }
}

if (require.main === module) {
    seedDatabase().then(() => process.exit(0));
}

