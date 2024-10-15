const travelSummaryDemo = [
  {
    title: "Exploring the Majestic Alps",
    description:
      "This 7-day journey takes you through the heart of the Alps, offering breathtaking views, challenging hikes, and serene landscapes. You'll visit picturesque villages, enjoy local cuisine, and experience the best of mountain life.",
  },
  {
    title: "Tropical Paradise in Bali",
    description:
      "Relax on the pristine beaches of Bali with this 10-day getaway. From cultural tours to exhilarating water sports, enjoy a perfect mix of adventure and relaxation.",
  },
  {
    title: "Discovering the Wonders of Egypt",
    description:
      "Embark on a 12-day adventure through Egypt's ancient wonders, from the pyramids of Giza to the bustling markets of Cairo. Uncover history and immerse yourself in this unique culture.",
  },
  {
    title: "Safari Adventure in Kenya",
    description:
      "Spend 8 days on an unforgettable safari through Kenya’s national parks. Spot the Big Five and enjoy the beauty of African wildlife up close.",
  },
  {
    title: "Cultural Journey through Japan",
    description:
      "Experience the blend of tradition and modernity in Japan on this 14-day tour. From ancient temples to the bright lights of Tokyo, immerse yourself in the rich culture of Japan.",
  },
];

const costData = [
  {
    userType: "Adult",
    price: 10000,
    quantity: 3,
    amount: 30000,
  },
  {
    userType: "Child",
    price: 5000,
    quantity: 1,
    amount: 5000,
  },
];

const hotelInfo = [
  {
    city: "San Francisco",
    hotelName: "Marriott San Francisco",
    rating: 4.5,
    pricePerNight: 150,
  },
];

const detailedIteneraryData = [
  {
    title: "Mountain Hiking Adventure",
    description: [
      "Join us for a thrilling hike through the scenic mountain trails. Expect breathtaking views and a refreshing connection with nature.",
      "This hike is suitable for both beginners and experienced hikers, offering various paths to explore.",
      "A guide will accompany the group to ensure safety and share insights about the surrounding wildlife and ecosystem.",
      "Finish the adventure with a picnic at the summit, enjoying the panoramic landscape views.",
    ],
    images: [
      "https://thumbs.dreamstime.com/b/beautiful-spring-sunrise-river-natural-outdoors-scenery-riga-latvia-northern-europe-beautiful-spring-sunrise-323711696.jpg",
      "https://thumbs.dreamstime.com/b/beautiful-spring-sunrise-river-natural-outdoors-scenery-riga-latvia-northern-europe-beautiful-spring-sunrise-323711696.jpg",
      "https://thumbs.dreamstime.com/b/beautiful-spring-sunrise-river-natural-outdoors-scenery-riga-latvia-northern-europe-beautiful-spring-sunrise-323711696.jpg",
    ],
  },
  {
    title: "City Tour by Night",
    description: [
      "Explore the vibrant city nightlife with our guided night tour. From historical landmarks to modern-day attractions, this tour offers a glimpse into the city's past and present.",
      "Discover hidden gems, local cafes, and bustling night markets as you walk through well-lit streets.",
      "Marvel at the beautifully illuminated skyline, capturing stunning photographs along the way.",
      "The tour includes a stop at a rooftop bar with complimentary drinks, offering a perfect end to the night.",
    ],
    images: [
      "https://thumbs.dreamstime.com/b/beautiful-spring-sunrise-river-natural-outdoors-scenery-riga-latvia-northern-europe-beautiful-spring-sunrise-323711696.jpg",
      "https://thumbs.dreamstime.com/b/beautiful-spring-sunrise-river-natural-outdoors-scenery-riga-latvia-northern-europe-beautiful-spring-sunrise-323711696.jpg",
      "https://thumbs.dreamstime.com/b/beautiful-spring-sunrise-river-natural-outdoors-scenery-riga-latvia-northern-europe-beautiful-spring-sunrise-323711696.jpg",
    ],
  },
  {
    title: "Beach Volleyball Tournament",
    description: [
      "Get ready for some fun in the sun with our beach volleyball tournament. Whether you're an amateur or a pro, there's a place for everyone on the sandy courts.",
      "Teams of all skill levels are welcome, and equipment will be provided on site.",
      "Compete for the championship or just play for fun while soaking up the sun and ocean breeze.",
      "The event will conclude with a beach bonfire and refreshments for all participants.",
    ],
    images: [
      "https://thumbs.dreamstime.com/b/beautiful-spring-sunrise-river-natural-outdoors-scenery-riga-latvia-northern-europe-beautiful-spring-sunrise-323711696.jpg",
      "https://thumbs.dreamstime.com/b/beautiful-spring-sunrise-river-natural-outdoors-scenery-riga-latvia-northern-europe-beautiful-spring-sunrise-323711696.jpg",
      "https://thumbs.dreamstime.com/b/beautiful-spring-sunrise-river-natural-outdoors-scenery-riga-latvia-northern-europe-beautiful-spring-sunrise-323711696.jpg",
    ],
  },
  {
    title: "Cultural Food Tasting",
    description: [
      "Embark on a culinary journey through the region’s traditional foods. From street vendors to gourmet restaurants, this tour offers a taste of the authentic cuisine.",
      "Sample a variety of dishes, including savory snacks, traditional entrees, and local desserts.",
      "Each stop is carefully selected to represent the culinary diversity of the area.",
      "Meet local chefs, hear their stories, and learn about the cultural significance of the dishes you’ll be enjoying.",
    ],
    images: [
      "https://thumbs.dreamstime.com/b/beautiful-spring-sunrise-river-natural-outdoors-scenery-riga-latvia-northern-europe-beautiful-spring-sunrise-323711696.jpg",
      "https://thumbs.dreamstime.com/b/beautiful-spring-sunrise-river-natural-outdoors-scenery-riga-latvia-northern-europe-beautiful-spring-sunrise-323711696.jpg",
      "https://thumbs.dreamstime.com/b/beautiful-spring-sunrise-river-natural-outdoors-scenery-riga-latvia-northern-europe-beautiful-spring-sunrise-323711696.jpg",
    ],
  },
  {
    title: "Sunset Cruise",
    description: [
      "Set sail on a relaxing sunset cruise along the coastline. Enjoy the tranquil atmosphere as you watch the sun dip below the horizon.",
      "The cruise includes a complimentary glass of champagne and light snacks to enhance your experience.",
      "Perfect for couples or families, this cruise offers both relaxation and beautiful scenery.",
      "As the evening sets in, the boat will anchor in a calm bay where you can swim or just enjoy the starry night sky.",
    ],
    images: [
      "https://thumbs.dreamstime.com/b/beautiful-spring-sunrise-river-natural-outdoors-scenery-riga-latvia-northern-europe-beautiful-spring-sunrise-323711696.jpg",
      "https://thumbs.dreamstime.com/b/beautiful-spring-sunrise-river-natural-outdoors-scenery-riga-latvia-northern-europe-beautiful-spring-sunrise-323711696.jpg",
      "https://thumbs.dreamstime.com/b/beautiful-spring-sunrise-river-natural-outdoors-scenery-riga-latvia-northern-europe-beautiful-spring-sunrise-323711696.jpg",
    ],
  },
];

const inclusionData = {
  itemList: [
    {
      title: "Stay",
      description: ["Six night stay at the selected hotel"],
    },
    {
      title: "Meals",
      description: ["Daily breakfast for six days"],
    },
    {
      title: "Transfers",
      description: [
        "Pickup from airport",
        "Drop-off at hotel",
        "Sight seeing as per iteneraries",
        "Full day tour on sharing basis",
      ],
    },
    {
      title: "Support",
      description: [
        "Local Eglish-Speaking tour guide",
        "Twenty Four hours customer service",
      ],
    },
    {
      title: "Experience Covered",
      description: [
        "City walking tour with local guide",
        "Cooking class with renowned chef",
        "Cultural show with traditional music",
        "Private wine tasting session",
        "Sunset cruise along the coast",
        "Exclusive access to historic landmarks",
        "VIP entrance to local festivals",
        "Wildlife safari in nearby national park",
      ],
    },
  ],
};

const exclusionsData = {
  description: [
    "Embark on a thrilling hike through the scenic mountains, where every twist and turn brings a new view of the landscape. Perfect for nature lovers and adventure seekers.",

    "Experience the serene beauty of the sunrise as it paints the sky with hues of orange and pink. ",
    "This moment includes a picnic breakfast with locally sourced ingredients, making the experience both peaceful and refreshing.",

    "Take a relaxing walk by the river. It's a short and easy trail, perfect for families. Enjoy a picnic under the trees, listening to the calming sound of the flowing water.",

    "Unwind at the luxury cabin retreat. After a day of hiking, treat yourself to our wellness sessions, which include personalized massages, yoga classes, and a dip in the hot springs. This is the perfect way to rejuvenate your body and mind.",
  ],
};

const otherInfoData = {
  description: [
    "Embark on a thrilling hike through the scenic mountains, where every twist ",
    "Experience the serene beauty of the sunrise as it paints the sky with hues of orange and pink. ",
    "This moment includes a picnic breakfast with locally sourced ingredients, making the experience both peaceful and refreshing.",

    "Take a relaxing walk by the river. Enjoy a picnic under the trees,  the flowing water.",

    "Unwind at the luxury cabin retreat, which include personalized massages, yoga classes, and a dip in the hot springs. This is the perfect way to rejuvenate your body and mind.",
  ],
};

const hotelData = [
  {
    name: "The Luxury Hotel",
    checkInDate: "2024-12-01",
    checkOutDate: "2024-12-05",
    location: "Riga, Latvia",
    mealPlan: "Breakfast included",
    numberOfGuest: 3,
    roomType: "Family room",
  },
  {
    name: "Ocean View Resort",
    checkInDate: "2024-12-10",
    checkOutDate: "2024-12-15",
    location: "Maldives",
    mealPlan: "All-inclusive",
    numberOfGuest: 2,
    roomType: "Deluxe suite",
  },
  {
    name: "Mountain Retreat Lodge",
    checkInDate: "2024-12-20",
    checkOutDate: "2024-12-25",
    location: "Aspen, USA",
    mealPlan: "Half-board",
    numberOfGuest: 4,
    roomType: "Luxury chalet",
  },
];

module.exports = {
  travelSummaryDemo,
  costData,
  detailedIteneraryData,
  inclusionData,
  exclusionsData,
  otherInfoData,
  hotelData,
};
