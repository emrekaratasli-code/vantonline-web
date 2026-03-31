export type CountryOption = {
    code: string;
    labelTr: string;
    labelEn: string;
};

type ShippingProfile = {
    price: number; // kurus
    estimatedDays: string;
    carrierName: string;
};

export const HIGH_INCOME_COUNTRIES: CountryOption[] = [
    { code: 'TR', labelTr: 'Turkiye', labelEn: 'Turkey' },
    { code: 'DE', labelTr: 'Almanya', labelEn: 'Germany' },
    { code: 'NL', labelTr: 'Hollanda', labelEn: 'Netherlands' },
    { code: 'CH', labelTr: 'Isvicre', labelEn: 'Switzerland' },
    { code: 'SE', labelTr: 'Isvec', labelEn: 'Sweden' },
    { code: 'NO', labelTr: 'Norvec', labelEn: 'Norway' },
    { code: 'DK', labelTr: 'Danimarka', labelEn: 'Denmark' },
    { code: 'AT', labelTr: 'Avusturya', labelEn: 'Austria' },
    { code: 'BE', labelTr: 'Belcika', labelEn: 'Belgium' },
    { code: 'GB', labelTr: 'Birlesik Krallik', labelEn: 'United Kingdom' },
    { code: 'IE', labelTr: 'Irlanda', labelEn: 'Ireland' },
    { code: 'US', labelTr: 'Amerika Birlesik Devletleri', labelEn: 'United States' },
    { code: 'CA', labelTr: 'Kanada', labelEn: 'Canada' },
    { code: 'AU', labelTr: 'Avustralya', labelEn: 'Australia' },
    { code: 'NZ', labelTr: 'Yeni Zelanda', labelEn: 'New Zealand' },
    { code: 'SG', labelTr: 'Singapur', labelEn: 'Singapore' },
    { code: 'JP', labelTr: 'Japonya', labelEn: 'Japan' },
    { code: 'AE', labelTr: 'Birlesik Arap Emirlikleri', labelEn: 'United Arab Emirates' },
    { code: 'QA', labelTr: 'Katar', labelEn: 'Qatar' },
    { code: 'KW', labelTr: 'Kuveyt', labelEn: 'Kuwait' },
];

const CITY_OPTIONS_BY_COUNTRY: Record<string, string[]> = {
    TR: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya'],
    DE: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'],
    NL: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'],
    CH: ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne'],
    SE: ['Stockholm', 'Gothenburg', 'Malmo', 'Uppsala', 'Vasteras'],
    NO: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen'],
    DK: ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg'],
    AT: ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck'],
    BE: ['Brussels', 'Antwerp', 'Ghent', 'Bruges', 'Liege'],
    GB: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow'],
    IE: ['Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford'],
    US: ['New York', 'Los Angeles', 'Miami', 'Chicago', 'San Francisco'],
    CA: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'],
    AU: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
    NZ: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga'],
    SG: ['Singapore'],
    JP: ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Fukuoka'],
    AE: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'],
    QA: ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Lusail'],
    KW: ['Kuwait City', 'Hawalli', 'Farwaniya', 'Salmiya', 'Ahmadi'],
};

const SHIPPING_PROFILE_BY_COUNTRY: Record<string, ShippingProfile> = {
    DE: { price: 14999, estimatedDays: '2-4 business days', carrierName: 'DHL Express' },
    NL: { price: 15999, estimatedDays: '2-4 business days', carrierName: 'DHL Express' },
    CH: { price: 17999, estimatedDays: '2-5 business days', carrierName: 'DHL Express' },
    SE: { price: 16999, estimatedDays: '2-5 business days', carrierName: 'DHL Express' },
    NO: { price: 17999, estimatedDays: '2-5 business days', carrierName: 'DHL Express' },
    DK: { price: 16999, estimatedDays: '2-5 business days', carrierName: 'DHL Express' },
    AT: { price: 16999, estimatedDays: '2-5 business days', carrierName: 'DHL Express' },
    BE: { price: 16999, estimatedDays: '2-5 business days', carrierName: 'DHL Express' },
    GB: { price: 16999, estimatedDays: '2-5 business days', carrierName: 'DHL Express' },
    IE: { price: 17999, estimatedDays: '3-6 business days', carrierName: 'DHL Express' },
    US: { price: 21999, estimatedDays: '3-7 business days', carrierName: 'DHL Express' },
    CA: { price: 22999, estimatedDays: '3-7 business days', carrierName: 'DHL Express' },
    AU: { price: 24999, estimatedDays: '4-8 business days', carrierName: 'DHL Express' },
    NZ: { price: 25999, estimatedDays: '4-8 business days', carrierName: 'DHL Express' },
    SG: { price: 20999, estimatedDays: '3-6 business days', carrierName: 'DHL Express' },
    JP: { price: 20999, estimatedDays: '3-6 business days', carrierName: 'DHL Express' },
    AE: { price: 18999, estimatedDays: '2-5 business days', carrierName: 'DHL Express' },
    QA: { price: 19999, estimatedDays: '2-5 business days', carrierName: 'DHL Express' },
    KW: { price: 19999, estimatedDays: '2-5 business days', carrierName: 'DHL Express' },
};

export type InternationalShippingOption = {
    carrierId: string;
    carrierName: string;
    price: number;
    estimatedDays: string;
    city: string;
    country: string;
    isInternational: true;
};

export function getCityOptionsByCountry(countryCode: string): string[] {
    return CITY_OPTIONS_BY_COUNTRY[countryCode] ?? [];
}

export function buildInternationalShippingOption(countryCode: string, city: string): InternationalShippingOption | null {
    const normalizedCountry = String(countryCode || '').toUpperCase();
    const profile = SHIPPING_PROFILE_BY_COUNTRY[normalizedCountry];
    if (!profile) return null;

    return {
        carrierId: `INTL_DHL_${normalizedCountry}`,
        carrierName: profile.carrierName,
        price: profile.price,
        estimatedDays: profile.estimatedDays,
        city: city?.trim() || 'International',
        country: normalizedCountry,
        isInternational: true,
    };
}
