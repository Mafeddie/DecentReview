export interface BusinessDetails {
  id: string;
  name: string;
  category: string;
  location: string;
  city: string;
  description: string;
  hours?: string;
  phone?: string;
  website?: string;
  imageUrl?: string;
  averageRating?: number;
  totalReviews?: number;
  priceRange?: string;
  tags?: string[];
}

export const BUSINESS_CATEGORIES = [
  'All Categories',
  'Restaurants',
  'Hotels',
  'Cafes & Coffee',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Banking',
  'Education',
  'Transportation',
  'Technology',
  'Beauty & Spa',
  'Fitness',
  'Automotive',
  'Real Estate'
];

export const KENYAN_BUSINESSES: BusinessDetails[] = [
  // Restaurants
  {
    id: 'carnivore-nairobi',
    name: 'Carnivore Restaurant',
    category: 'Restaurants',
    location: 'Langata Road',
    city: 'Nairobi',
    description: 'Famous for exotic meat and all-you-can-eat experience',
    hours: 'Daily 12:00 PM - 11:00 PM',
    phone: '+254 20 6903000',
    website: 'https://tamarind.co.ke/carnivore/',
    priceRange: 'KSh 2,000-4,000',
    tags: ['nyama choma', 'exotic meat', 'live music', 'tourist attraction'],
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'
  },
  {
    id: 'mama-oliech',
    name: 'Mama Oliech Restaurant',
    category: 'Restaurants',
    location: 'Marcus Garvey Road, Kilimani',
    city: 'Nairobi',
    description: 'Best fish restaurant in Nairobi, famous for tilapia and ugali',
    hours: 'Daily 11:00 AM - 10:00 PM',
    phone: '+254 722 823456',
    priceRange: 'KSh 800-1,500',
    tags: ['fish', 'ugali', 'traditional', 'local cuisine']
  },
  {
    id: 'talisman-restaurant',
    name: 'Talisman Restaurant',
    category: 'Restaurants',
    location: '320 Ngong Road, Karen',
    city: 'Nairobi',
    description: 'Eclectic menu in a beautiful garden setting',
    hours: 'Tue-Sun 12:00 PM - 10:30 PM',
    phone: '+254 735 565652',
    website: 'https://talismanrestaurant.com',
    priceRange: 'KSh 1,500-3,000',
    tags: ['fusion', 'garden dining', 'wine bar', 'romantic']
  },

  // Hotels
  {
    id: 'sarova-stanley',
    name: 'Sarova Stanley Hotel',
    category: 'Hotels',
    location: 'Kenyatta Avenue & Kimathi Street',
    city: 'Nairobi',
    description: 'Historic luxury hotel in the heart of Nairobi CBD',
    hours: '24/7',
    phone: '+254 20 2757000',
    website: 'https://sarovahotels.com/stanley-nairobi/',
    priceRange: 'KSh 12,000-25,000/night',
    tags: ['luxury', 'historic', 'business', 'conference']
  },
  {
    id: 'giraffe-manor',
    name: 'Giraffe Manor',
    category: 'Hotels',
    location: 'Gogo Falls Road, Karen',
    city: 'Nairobi',
    description: 'Boutique hotel famous for breakfast with giraffes',
    hours: '24/7',
    phone: '+254 750 093000',
    website: 'https://giraffemanor.com',
    priceRange: 'KSh 80,000+/night',
    tags: ['luxury', 'wildlife', 'boutique', 'unique experience']
  },
  {
    id: 'villa-rosa-kempinski',
    name: 'Villa Rosa Kempinski',
    category: 'Hotels',
    location: 'Chiromo Road, Westlands',
    city: 'Nairobi',
    description: 'European luxury in the diplomatic district',
    hours: '24/7',
    phone: '+254 703 049000',
    website: 'https://kempinski.com/nairobi',
    priceRange: 'KSh 20,000-50,000/night',
    tags: ['5-star', 'luxury', 'business', 'spa']
  },

  // Cafes & Coffee
  {
    id: 'java-house',
    name: 'Java House',
    category: 'Cafes & Coffee',
    location: 'Multiple Locations',
    city: 'Nairobi',
    description: 'Kenya\'s favorite coffee chain with great food',
    hours: 'Daily 6:30 AM - 10:00 PM',
    phone: '+254 719 089000',
    website: 'https://javahouseafrica.com',
    priceRange: 'KSh 500-1,500',
    tags: ['coffee', 'breakfast', 'wifi', 'meetings']
  },
  {
    id: 'artcaffe',
    name: 'ArtCaffe',
    category: 'Cafes & Coffee',
    location: 'Multiple Locations',
    city: 'Nairobi',
    description: 'Popular cafe chain with extensive menu and great ambiance',
    hours: 'Daily 7:00 AM - 10:00 PM',
    phone: '+254 786 520520',
    website: 'https://artcaffe.co.ke',
    priceRange: 'KSh 600-1,800',
    tags: ['coffee', 'bakery', 'brunch', 'family-friendly']
  },

  // Shopping
  {
    id: 'sarit-center',
    name: 'Sarit Centre',
    category: 'Shopping',
    location: 'Karuna Road, Westlands',
    city: 'Nairobi',
    description: 'Premier shopping mall with international and local brands',
    hours: 'Daily 9:00 AM - 9:00 PM',
    phone: '+254 20 3747274',
    website: 'https://saritcentre.com',
    tags: ['mall', 'shopping', 'dining', 'entertainment']
  },
  {
    id: 'two-rivers-mall',
    name: 'Two Rivers Mall',
    category: 'Shopping',
    location: 'Limuru Road, Ruaka',
    city: 'Nairobi',
    description: 'Largest mall in East Africa with extensive shopping and entertainment',
    hours: 'Daily 10:00 AM - 10:00 PM',
    phone: '+254 709 907000',
    website: 'https://tworiversmall.com',
    tags: ['mall', 'shopping', 'cinema', 'restaurants']
  },
  {
    id: 'maasai-market',
    name: 'Maasai Market',
    category: 'Shopping',
    location: 'Various Locations (High Court parking on Saturdays)',
    city: 'Nairobi',
    description: 'Traditional crafts, artifacts, and souvenirs',
    hours: 'Varies by location',
    priceRange: 'Negotiable',
    tags: ['crafts', 'souvenirs', 'traditional', 'bargaining']
  },

  // Healthcare
  {
    id: 'aga-khan-hospital',
    name: 'Aga Khan University Hospital',
    category: 'Healthcare',
    location: '3rd Parklands Avenue, Limuru Road',
    city: 'Nairobi',
    description: 'Leading private hospital with comprehensive healthcare services',
    hours: '24/7 Emergency',
    phone: '+254 20 3662000',
    website: 'https://hospitals.aku.edu/nairobi',
    tags: ['hospital', 'emergency', 'specialist care', 'pharmacy']
  },
  {
    id: 'nairobi-hospital',
    name: 'The Nairobi Hospital',
    category: 'Healthcare',
    location: 'Argwings Kodhek Road',
    city: 'Nairobi',
    description: 'Premier healthcare facility with modern equipment and specialists',
    hours: '24/7 Emergency',
    phone: '+254 20 2845000',
    website: 'https://nairobihospital.org',
    tags: ['hospital', 'emergency', 'specialist care', 'ICU']
  },

  // Banking
  {
    id: 'equity-bank-mama-ngina',
    name: 'Equity Bank - Mama Ngina Street',
    category: 'Banking',
    location: 'Mama Ngina Street',
    city: 'Nairobi',
    description: 'Leading bank with comprehensive financial services',
    hours: 'Mon-Fri 8:00 AM - 5:00 PM, Sat 8:00 AM - 1:00 PM',
    phone: '+254 763 063000',
    website: 'https://equitybank.co.ke',
    tags: ['banking', 'loans', 'savings', 'mobile banking']
  },
  {
    id: 'kcb-kencom',
    name: 'KCB Bank - Kencom House',
    category: 'Banking',
    location: 'Moi Avenue, Kencom House',
    city: 'Nairobi',
    description: 'Kenya\'s largest bank by assets',
    hours: 'Mon-Fri 8:00 AM - 4:30 PM, Sat 8:00 AM - 1:00 PM',
    phone: '+254 20 3270000',
    website: 'https://kcbgroup.com',
    tags: ['banking', 'mortgages', 'business banking', 'ATM']
  },

  // Technology
  {
    id: 'safaricom-shop-westgate',
    name: 'Safaricom Shop Westgate',
    category: 'Technology',
    location: 'Westgate Mall, Westlands',
    city: 'Nairobi',
    description: 'Official Safaricom retail store for phones and services',
    hours: 'Daily 9:00 AM - 8:00 PM',
    phone: '+254 722 002222',
    website: 'https://safaricom.co.ke',
    tags: ['telecom', 'phones', 'M-PESA', 'internet']
  },
  {
    id: 'ihub-nairobi',
    name: 'iHub Nairobi',
    category: 'Technology',
    location: 'Senteu Plaza, Galana/Lenana Road',
    city: 'Nairobi',
    description: 'Innovation hub for tech entrepreneurs and startups',
    hours: 'Mon-Fri 8:00 AM - 8:00 PM',
    phone: '+254 718 225789',
    website: 'https://ihub.co.ke',
    tags: ['tech hub', 'startups', 'coworking', 'innovation']
  },

  // Entertainment
  {
    id: 'nairobi-national-park',
    name: 'Nairobi National Park',
    category: 'Entertainment',
    location: 'Langata Road',
    city: 'Nairobi',
    description: 'World\'s only national park within a capital city',
    hours: 'Daily 6:00 AM - 6:00 PM',
    phone: '+254 20 2423423',
    website: 'https://kws.go.ke',
    priceRange: 'KSh 430 (Residents), $43 (Non-residents)',
    tags: ['wildlife', 'safari', 'nature', 'photography']
  },
  {
    id: 'giraffe-centre',
    name: 'Giraffe Centre',
    category: 'Entertainment',
    location: 'Duma Road, Hardy, Karen',
    city: 'Nairobi',
    description: 'Conservation center where you can feed and learn about giraffes',
    hours: 'Daily 9:00 AM - 5:00 PM',
    phone: '+254 734 890952',
    website: 'https://giraffecentre.org',
    priceRange: 'KSh 1,500 (Adults), KSh 750 (Children)',
    tags: ['wildlife', 'conservation', 'family-friendly', 'education']
  },

  // Fitness
  {
    id: 'smart-gyms-westlands',
    name: 'Smart Gyms Westlands',
    category: 'Fitness',
    location: 'The Mall, Westlands',
    city: 'Nairobi',
    description: 'Modern gym with latest equipment and professional trainers',
    hours: 'Mon-Fri 5:00 AM - 10:00 PM, Weekends 7:00 AM - 8:00 PM',
    phone: '+254 798 000111',
    website: 'https://smartgyms.co.ke',
    priceRange: 'KSh 6,000-10,000/month',
    tags: ['gym', 'fitness', 'personal training', 'classes']
  },

  // Beauty & Spa
  {
    id: 'susan-spa-beauty',
    name: 'Susan\'s Spa & Beauty',
    category: 'Beauty & Spa',
    location: 'Lenana Road, Kilimani',
    city: 'Nairobi',
    description: 'Luxury spa offering massage, facial, and beauty treatments',
    hours: 'Mon-Sat 9:00 AM - 8:00 PM, Sun 10:00 AM - 6:00 PM',
    phone: '+254 721 456789',
    priceRange: 'KSh 2,000-8,000',
    tags: ['spa', 'massage', 'beauty', 'relaxation']
  }
];

// Helper function to get businesses by category
export const getBusinessesByCategory = (category: string): BusinessDetails[] => {
  if (category === 'All Categories' || !category) {
    return KENYAN_BUSINESSES;
  }
  return KENYAN_BUSINESSES.filter(b => b.category === category);
};

// Helper function to search businesses
export const searchBusinesses = (query: string): BusinessDetails[] => {
  const lowercaseQuery = query.toLowerCase();
  return KENYAN_BUSINESSES.filter(b => 
    b.name.toLowerCase().includes(lowercaseQuery) ||
    b.description.toLowerCase().includes(lowercaseQuery) ||
    b.location.toLowerCase().includes(lowercaseQuery) ||
    b.city.toLowerCase().includes(lowercaseQuery) ||
    b.category.toLowerCase().includes(lowercaseQuery) ||
    (b.tags && b.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
  );
};