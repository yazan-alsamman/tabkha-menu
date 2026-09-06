import type { CategorySeed, MenuItemSeed, Restaurant } from "../types/menu";

export const restaurant: Restaurant = {
  id: "tabkha-and-more",
  nameAr: "طبخة آند مور",
  nameEn: "Tabkha and More",
  taglineAr: "حيث يلتقي المطبخ الشرقي برقيّ التفاصيل العالمية",
  taglineEn: "Where Eastern cuisine meets the elegance of global detail",
  storyAr:
    "في طبخة آند مور، يعكس اسمنا جوهر التجربة التي نؤمن بها ونقدمها بكل شغف. تحمل كلمة «طبخة» دفء البيت، ورائحة القدور التقليدية، والنكهات التي توارثتها الأجيال، وطمأنينة طبق أُعدّ بعناية ومحبة. أما «آند مور» فهي بوابة الإبداع، والإلهام العالمي، وعالم من النكهات التي تتجاوز المألوف. معاً يرويان حكاية أصالة وتنوّع وخيال طهوي. نُجسّد هذه الحكاية بمزج عمق المطبخ الشرقي مع أناقة التجربة العصرية، حيث تلتقي الألفة مع الرقي.",
  storyEn:
    "At Tabkha & More, our name reflects the soul of the dining experience we stand for. “Tabkha” carries the warmth of home — the aroma rising from traditional pots, the flavors inherited across generations, and the comforting familiarity of a dish made with care. “And More” opens the door to creativity, global inspiration, and a world of flavors that go beyond expectations. Together they tell a story of authenticity, diversity, and culinary imagination. We bring this story to life by blending the richness of Eastern tradition with the elegance of contemporary dining.",
  logo: "/brand/petal-mark.svg",
  currency: "AED",
  currencyLabelAr: "درهم",
};

export const categories: CategorySeed[] = [
  { id: "breakfast", nameAr: "الإفطار", nameEn: "Breakfast", descriptionAr: null, descriptionEn: null, image: "breakfast", displayOrder: 1, surface: "cream", scriptAccent: null },
  { id: "soups", nameAr: "الشوربات", nameEn: "Soups", descriptionAr: null, descriptionEn: null, image: "soups", displayOrder: 2, surface: "cream", scriptAccent: null },
  { id: "salads-east", nameAr: "السلطات الشرقية", nameEn: "Salads East", descriptionAr: null, descriptionEn: null, image: "salads-east", displayOrder: 3, surface: "cream", scriptAccent: null },
  { id: "doughs", nameAr: "المعجنات", nameEn: "Doughs", descriptionAr: null, descriptionEn: null, image: "doughs", displayOrder: 4, surface: "cream", scriptAccent: null },
  { id: "cold-appetizers", nameAr: "المقبلات الباردة", nameEn: "Cold Appetizers", descriptionAr: null, descriptionEn: null, image: "cold-appetizers", displayOrder: 5, surface: "cream", scriptAccent: null },
  { id: "hot-appetizers", nameAr: "المقبلات الساخنة", nameEn: "Hot Appetizers", descriptionAr: null, descriptionEn: null, image: "hot-appetizers", displayOrder: 6, surface: "cream", scriptAccent: null },
  { id: "hot-dishes-eastern", nameAr: "الأطباق الساخنة الشرقية", nameEn: "Hot Dishes Eastern", descriptionAr: null, descriptionEn: null, image: "hot-dishes-eastern", displayOrder: 7, surface: "cream", scriptAccent: null },
  { id: "hot-dishes-western", nameAr: "الأطباق الساخنة الغربية", nameEn: "Hot Dishes Western", descriptionAr: null, descriptionEn: null, image: "hot-dishes-western", displayOrder: 8, surface: "cream", scriptAccent: null },
  { id: "pizza", nameAr: "البيتزا", nameEn: "Pizza", descriptionAr: null, descriptionEn: null, image: "pizza", displayOrder: 9, surface: "cream", scriptAccent: "Delicious hot" },
  { id: "pasta", nameAr: "الباستا", nameEn: "Pasta", descriptionAr: null, descriptionEn: null, image: "pasta", displayOrder: 10, surface: "cream", scriptAccent: "Super Delicious" },
  { id: "sandwich-eastern", nameAr: "السندويش الشرقي", nameEn: "Eastern Sandwich", descriptionAr: null, descriptionEn: null, image: "sandwich-eastern", displayOrder: 11, surface: "forest", scriptAccent: null },
  { id: "sandwich-western", nameAr: "السندويش الغربي", nameEn: "Western Sandwich", descriptionAr: null, descriptionEn: null, image: "sandwich-western", displayOrder: 12, surface: "forest", scriptAccent: null },
  { id: "grills", nameAr: "المشاوي", nameEn: "Grills", descriptionAr: null, descriptionEn: null, image: "grills", displayOrder: 13, surface: "forest", scriptAccent: "Delicious hot" },
  { id: "daily-dish", nameAr: "طبق اليوم", nameEn: "Daily Dish", descriptionAr: null, descriptionEn: null, image: "daily-dish", displayOrder: 14, surface: "forest", scriptAccent: null },
];

type Draft = {
  nameAr: string;
  nameEn: string | null;
  price: number;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  portionNote?: string | null;
  featured?: boolean;
};

function itemsFor(categoryId: string, drafts: Draft[]): MenuItemSeed[] {
  return drafts.map((d, i) => ({
    id: `${categoryId}-${i + 1}`,
    categoryId,
    nameAr: d.nameAr,
    nameEn: d.nameEn,
    descriptionAr: d.descriptionAr ?? null,
    descriptionEn: d.descriptionEn ?? null,
    price: d.price,
    currency: "AED",
    image: null,
    displayOrder: i + 1,
    portionNote: d.portionNote ?? null,
    featured: d.featured ?? false,
    available: true,
    active: true,
  }));
}

const HUMMUS_PORTION = "كيلو و400 (صحن 250 غ)";

export const items: MenuItemSeed[] = [
  ...itemsFor("breakfast", [
    { nameAr: "بيض مسلوق", nameEn: "Boiled Eggs", price: 19 },
    { nameAr: "بيض أومليت", nameEn: "Omelette", price: 19 },
    { nameAr: "بيض أومليت بالخضار", nameEn: "Vegetable Omelette", price: 19 },
    { nameAr: "زعتر", nameEn: "Za'atar", price: 19 },
    { nameAr: "صحن جبنة", nameEn: "Cheese Plate", price: 23 },
    { nameAr: "مربى", nameEn: "Jam", price: 19 },
    { nameAr: "زبدة", nameEn: "Butter", price: 19 },
    { nameAr: "لحومات مشكلة", nameEn: "Mixed Cold Cuts", price: 22 },
    { nameAr: "فول بالزيت", nameEn: "Foul with Olive Oil", price: 19 },
    { nameAr: "فول باللبن", nameEn: null, price: 19 },
    { nameAr: "حمص بالزيت", nameEn: "Hummus with Olive Oil", price: 19, portionNote: HUMMUS_PORTION },
    { nameAr: "حمص باللبن", nameEn: "Hummus with Yogurt", price: 19, portionNote: HUMMUS_PORTION },
    { nameAr: "حمص", nameEn: "Hummus", price: 19, portionNote: HUMMUS_PORTION },
    { nameAr: "مسبحة", nameEn: "Msabbaha", price: 32, portionNote: HUMMUS_PORTION },
    { nameAr: "فتة حمص بالسمنة", nameEn: "Hummus Fatteh with Ghee", price: 32 },
    { nameAr: "فتة دجاج", nameEn: "Chicken Fatteh", price: 37 },
    { nameAr: "فتة لحمة", nameEn: "Meat Fatteh", price: 68 },
    { nameAr: "لبنة", nameEn: "Labneh", price: 19 },
    { nameAr: "زيتون", nameEn: "Olives", price: 19 },
    { nameAr: "كبيس مشكل", nameEn: null, price: 19 },
    { nameAr: "صحن خضار مشكل", nameEn: "Mixed Vegetable Plate", price: 19 },
  ]),

  ...itemsFor("soups", [
    { nameAr: "شوربة العدس", nameEn: "Lentil Soup", price: 21 },
    { nameAr: "شوربة كريم الفطر", nameEn: "Cream of Mushroom Soup", price: 21 },
    { nameAr: "شوربة الدجاج", nameEn: "Chicken Soup", price: 21 },
    { nameAr: "شوربة كريم الدجاج مع الفطر", nameEn: "Creamy Chicken & Mushroom Soup", price: 21 },
    { nameAr: "شوربة كريم الخضرة", nameEn: null, price: 21 },
  ]),

  ...itemsFor("salads-east", [
    { nameAr: "سلطة شرقية", nameEn: "Oriental Salad", price: 25 },
    { nameAr: "فتوش", nameEn: "Fattoush", price: 30 },
    { nameAr: "تبولة", nameEn: "Tabbouleh", price: 30 },
    { nameAr: "سلطة الجرجير", nameEn: "Rocket Salad", price: 30 },
    { nameAr: "سلطة سيزار", nameEn: "Caesar Salad", price: 34 },
    { nameAr: "كراب سلط", nameEn: "Crab Salad", price: 37 },
    { nameAr: "سلطة كينوا", nameEn: "Quinoa Salad", price: 32 },
    { nameAr: "سلطة قريدس بالأفوكادو", nameEn: "Shrimp & Avocado Salad", price: 32 },
  ]),

  ...itemsFor("doughs", [
    { nameAr: "منقوشة زعتر", nameEn: "Za'atar Manousheh", price: 17 },
    { nameAr: "منقوشة زعتر بالجبنة", nameEn: "Za'atar & Cheese Manousheh", price: 21 },
    { nameAr: "منقوشة زعتر بالخضار", nameEn: "Za'atar & Vegetable Manousheh", price: 17 },
    { nameAr: "منقوشة محمرة", nameEn: "Muhammara Manousheh", price: 20 },
    { nameAr: "منقوشة قشقوان", nameEn: "Kashkaval Manousheh", price: 17 },
    { nameAr: "منقوشة محمرة بقشقوان", nameEn: "Muhammara & Kashkaval", price: 21 },
    { nameAr: "منقوشة سبانخ", nameEn: "Spinach Manousheh", price: 20 },
    { nameAr: "منقوشة زيتون", nameEn: "Olive Manousheh", price: 19 },
    { nameAr: "منقوشة لبنة", nameEn: "Labneh Manousheh", price: 17 },
    { nameAr: "منقوشة لبنة بالخيار", nameEn: "Labneh & Cucumber Manousheh", price: 21 },
    { nameAr: "منقوشة لبنة بالزعتر", nameEn: "Labneh & Za'atar Manousheh", price: 23 },
    { nameAr: "جبنة قريش بالعسل", nameEn: "Kraft Cheese & Honey", price: 21 },
    { nameAr: "منقوشة عكاوي", nameEn: null, price: 19 },
    { nameAr: "منقوشة حلوم", nameEn: null, price: 19 },
    { nameAr: "منقوشة موزاريلا", nameEn: "Mozzarella Manousheh", price: 19 },
    { nameAr: "لحمة بالعجين دبس رمان", nameEn: "Lahm Bi Ajeen", price: 53, descriptionAr: "٥ قطع", descriptionEn: "5 pcs" },
    { nameAr: "لحمة بالعجين (مجرمشة بالخضار)", nameEn: "Lahm Bi Ajeen with Vegetables", price: 42 },
    { nameAr: "شرحات بالعجين", nameEn: "Meat Slices Pastry", price: 37, descriptionAr: "٥ قطع", descriptionEn: "5 pcs" },
    { nameAr: "شاميات", nameEn: "Shamiyat", price: 45 },
  ]),

  ...itemsFor("cold-appetizers", [
    { nameAr: "حمص", nameEn: "Hummus", price: 30, portionNote: HUMMUS_PORTION },
    { nameAr: "حمص بالكمون", nameEn: "Hummus with Cumin", price: 30, portionNote: HUMMUS_PORTION },
    { nameAr: "حمص بيروتي", nameEn: "Beiruti Hummus", price: 30, portionNote: HUMMUS_PORTION },
    { nameAr: "متبل", nameEn: "Moutabal", price: 30 },
    { nameAr: "بابا غنوج", nameEn: "Baba Ghanoush", price: 30 },
    { nameAr: "محمرة", nameEn: "Muhammara", price: 30 },
    { nameAr: "يالنجي", nameEn: "Yalanji", price: 32 },
    { nameAr: "سبانخ بالزيت", nameEn: "Spinach with Olive Oil", price: 30 },
  ]),

  ...itemsFor("hot-appetizers", [
    { nameAr: "بطاطا حارة", nameEn: "Spicy Potatoes", price: 32 },
    { nameAr: "كبة السبانخ", nameEn: "Spinach Kibbeh", price: 32, descriptionAr: "٥ قطع", descriptionEn: "5 pcs" },
    { nameAr: "كبة لحمة", nameEn: "Meat Kibbeh", price: 37, descriptionAr: "٥ قطع", descriptionEn: "5 pcs" },
    { nameAr: "برك جبنة", nameEn: "Cheese Sambousek", price: 30, descriptionAr: "٥ قطع", descriptionEn: "5 pcs" },
    { nameAr: "برك لحمة", nameEn: "Meat Sambousek", price: 32, descriptionAr: "٥ قطع", descriptionEn: "5 pcs" },
    { nameAr: "موزاريلا بانيه", nameEn: "Breaded Mozzarella", price: 32, descriptionAr: "٥ قطع", descriptionEn: "5 pcs" },
    { nameAr: "سبرينغ رول", nameEn: "Spring Rolls", price: 30 },
    { nameAr: "بطاطا مقلية", nameEn: "French Fries", price: 26 },
    { nameAr: "دجاج مسخن", nameEn: "Chicken Musakhan Rolls", price: 37, descriptionAr: "٥ قطع", descriptionEn: "5 pcs" },
    { nameAr: "حمص باللحمة", nameEn: "Hummus with Meat", price: 41, portionNote: HUMMUS_PORTION },
  ]),

  ...itemsFor("hot-dishes-eastern", [
    { nameAr: "ورق عنب مع الشرحات", nameEn: "Stuffed Vine Leaves with Meat Slices", price: 84, featured: true },
    { nameAr: "كبة لبنية", nameEn: "Kibbeh in Yogurt", price: 69 },
    { nameAr: "كوسا بلبن", nameEn: "Stuffed Zucchini in Yogurt", price: 63 },
    { nameAr: "شاكرية", nameEn: "Shakriya", price: 73 },
    { nameAr: "شيش برك", nameEn: "Shish Barak", price: 73 },
    { nameAr: "باشا و عساكره", nameEn: "Pasha and Asakir", price: 69 },
    { nameAr: "ملوخية", nameEn: "Molokhia", price: 53 },
    { nameAr: "منسف عربي (رز بالبازيلاء)", nameEn: "Arabic Mansaf (Rice with Peas)", price: 58 },
    { nameAr: "فاصولياء بالموزات", nameEn: "Beans with Lamb Shanks", price: 63 },
    { nameAr: "كباب هندي", nameEn: "Hindi Kebab", price: 69 },
    { nameAr: "مقلوبة بالباذنجان", nameEn: "Eggplant Maqluba", price: 58 },
  ]),

  ...itemsFor("hot-dishes-western", [
    { nameAr: "سالمون فريش مشوي", nameEn: "Grilled Salmon", price: 74 },
    {
      nameAr: "فيليه مشوي",
      nameEn: "Grilled Fillet",
      price: 79,
      descriptionAr: "صوص بوافر / صوص فطر",
      descriptionEn: "Pepper Sauce / Mushroom Sauce",
    },
    { nameAr: "كوردون بلو طبخة أند مور", nameEn: "Tabkha & More Cordon Bleu", price: 63 },
    { nameAr: "اسكالوب", nameEn: "Escalope", price: 53 },
    { nameAr: "اسكالوب ميلانيز", nameEn: "Milanese Escalope", price: 47 },
    {
      nameAr: "صدر دجاج مشوي",
      nameEn: "Grilled Chicken Breast",
      price: 56,
      descriptionAr: "صوص الخردل / كريم",
      descriptionEn: "Mustard sauce / Cream",
    },
  ]),

  ...itemsFor("pizza", [
    { nameAr: "بيتزا فصول", nameEn: "Fasoul Pizza", price: 48 },
    { nameAr: "بيبروني", nameEn: "Pepperoni Pizza", price: 48 },
    { nameAr: "روكا", nameEn: "Rocket Pizza", price: 48 },
    { nameAr: "دجاج", nameEn: "Chicken Pizza", price: 42 },
    { nameAr: "مارغاريتا", nameEn: "Margherita Pizza", price: 42 },
    { nameAr: "البيتزا البيضاء", nameEn: "White Pizza", price: 48 },
  ]),

  ...itemsFor("pasta", [
    { nameAr: "اسباغيتي بولونيز", nameEn: "Spaghetti Bolognese", price: 42 },
    { nameAr: "اسباغيتي بومودورو", nameEn: "Spaghetti Pomodoro", price: 42 },
    { nameAr: "فيتوتشيني الفريدو", nameEn: "Fettuccine Alfredo", price: 63 },
    { nameAr: "فيتوتشيني بالدجاج و الفطر", nameEn: "Fettuccine with Chicken & Mushrooms", price: 48 },
    { nameAr: "فيتوتشيني بالسي فود", nameEn: "Seafood Fettuccine", price: 69 },
    { nameAr: "بيني اربياتا", nameEn: "Penne Arrabbiata", price: 48 },
    { nameAr: "بيني بالاجبان الاربعة", nameEn: null, price: 69 },
  ]),

  ...itemsFor("sandwich-eastern", [
    { nameAr: "تيكا ساندويتش", nameEn: "Tikka Sandwich", price: 34 },
    { nameAr: "سندويش كباب اللحم", nameEn: "Beef Kebab Sandwich", price: 32 },
    { nameAr: "سندويش شيش طاووق", nameEn: "Shish Taouk Sandwich", price: 30 },
  ]),

  ...itemsFor("sandwich-western", [
    { nameAr: "فاهيتا دجاج", nameEn: "Chicken Fajita", price: 37 },
    { nameAr: "فاهيتا لحمة", nameEn: "Beef Fajita", price: 37 },
    { nameAr: "همبرغر دجاج", nameEn: "Chicken Burger", price: 32 },
    { nameAr: "همبرغر لحمة", nameEn: "Beef Burger", price: 37 },
    { nameAr: "فيلادلفيا ساندويتش", nameEn: "Philadelphia Sandwich", price: 41 },
    { nameAr: "كريسبي ساندويتش", nameEn: "Crispy Chicken Sandwich", price: 32 },
  ]),

  ...itemsFor("grills", [
    { nameAr: "نصف فروج على الفحم", nameEn: "Half Charcoal-Grilled Chicken", price: 42 },
    { nameAr: "فروج على الفحم", nameEn: "Whole Charcoal-Grilled Chicken", price: 69, featured: true },
    { nameAr: "شقف مشوية", nameEn: "Grilled Lamb Cubes", price: 63 },
    { nameAr: "كباب مشوي", nameEn: "Grilled Kebab", price: 58 },
    { nameAr: "شيش طاووق", nameEn: "Shish Taouk", price: 53 },
    { nameAr: "مشاوي مشكل فردي", nameEn: "Mixed Grill Platter (Single)", price: 84, featured: true },
    { nameAr: "مشاوي مشكل 1KG", nameEn: "Mixed Grill Platter (1 kg)", price: 263 },
    { nameAr: "كستاليتا مشوية", nameEn: "Grilled Lamb Chops", price: 74 },
  ]),

  ...itemsFor("daily-dish", [
    { nameAr: "بامية بالموزات", nameEn: "Okra with Lamb Shanks", price: 58 },
    {
      nameAr: "كفته (بالطحينة - بالبندورة)",
      nameEn: "Kofta (tahini or tomato)",
      price: 65,
    },
    { nameAr: "برياني الدجاج", nameEn: "Chicken Biryani", price: 53 },
    { nameAr: "كبسة", nameEn: "Kabsa", price: 58 },
    { nameAr: "محشي كوسا وباذنجان", nameEn: "Stuffed Zucchini & Eggplant", price: 53 },
    { nameAr: "فريكة بالدجاج", nameEn: "Freekeh with Chicken", price: 53 },
    { nameAr: "سجق", nameEn: "Sujuk", price: 37 },
    { nameAr: "كبدة", nameEn: "Liver", price: 37 },
    { nameAr: "بسمشكات لحمه", nameEn: "Basmashkat Meat", price: 75 },
    { nameAr: "كبة بالصينية", nameEn: "Baked Kibbeh", price: 65 },
    { nameAr: "دجاج بالفرن", nameEn: "Oven-Baked Chicken", price: 65 },
    { nameAr: "مقلوبة لحمه", nameEn: "Meat Maqluba", price: 65 },
    { nameAr: "فريكة لحمه", nameEn: "Freekeh with Meat", price: 65 },
  ]),
];

export function buildMenuPayload() {
  return {
    restaurant,
    categories: categories.map((category) => ({
      ...category,
      items: items
        .filter((item) => item.categoryId === category.id && item.active)
        .sort((a, b) => a.displayOrder - b.displayOrder),
    })),
  };
}
