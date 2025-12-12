export interface Partner {
  name: string;
  name_zh?: string;
  slug: string;
  logo: string;
  license: string;
  address: string;
  address_zh?: string;
  owner: string;
  phone: string;
  email: string;
  ownerPhone?: string;
  ownerEmail?: string;
  tourHours: string;
  description: string;
  description_zh?: string;
  images: string[];
  type?: string;
  bookingUrl?: string;
  website?: string;
  googleReviewUrl?: string;
}

export interface BookingFormData {
  parentName: string;
  email: string;
  phone: string;
  childAge: string;
  preferredDate: string;
  message?: string;
}
