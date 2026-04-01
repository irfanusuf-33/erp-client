"use client"

import React, { useState } from 'react'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { AddClient } from '@/types/crm.types';
import NestedDropdown from '../components/NestedDropdown';

export default function AddClient() {

  const [createTemplate, setCreateTemplate] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [formData, setFormData] = useState<AddClient>({} as AddClient)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const router = useRouter()

  const countries = [
    { value: 'af', label: 'Afghanistan' },
    { value: 'al', label: 'Albania' },
    { value: 'dz', label: 'Algeria' },
    { value: 'ad', label: 'Andorra' },
    { value: 'ao', label: 'Angola' },
    { value: 'ag', label: 'Antigua and Barbuda' },
    { value: 'ar', label: 'Argentina' },
    { value: 'am', label: 'Armenia' },
    { value: 'au', label: 'Australia' },
    { value: 'at', label: 'Austria' },
    { value: 'az', label: 'Azerbaijan' },
    { value: 'bs', label: 'Bahamas' },
    { value: 'bh', label: 'Bahrain' },
    { value: 'bd', label: 'Bangladesh' },
    { value: 'bb', label: 'Barbados' },
    { value: 'by', label: 'Belarus' },
    { value: 'be', label: 'Belgium' },
    { value: 'bz', label: 'Belize' },
    { value: 'bj', label: 'Benin' },
    { value: 'bt', label: 'Bhutan' },
    { value: 'bo', label: 'Bolivia' },
    { value: 'ba', label: 'Bosnia and Herzegovina' },
    { value: 'bw', label: 'Botswana' },
    { value: 'br', label: 'Brazil' },
    { value: 'bn', label: 'Brunei' },
    { value: 'bg', label: 'Bulgaria' },
    { value: 'bf', label: 'Burkina Faso' },
    { value: 'bi', label: 'Burundi' },
    { value: 'cv', label: 'Cabo Verde' },
    { value: 'kh', label: 'Cambodia' },
    { value: 'cm', label: 'Cameroon' },
    { value: 'ca', label: 'Canada' },
    { value: 'cf', label: 'Central African Republic' },
    { value: 'td', label: 'Chad' },
    { value: 'cl', label: 'Chile' },
    { value: 'cn', label: 'China' },
    { value: 'co', label: 'Colombia' },
    { value: 'km', label: 'Comoros' },
    { value: 'cg', label: 'Congo' },
    { value: 'cd', label: 'Congo (Democratic Republic)' },
    { value: 'cr', label: 'Costa Rica' },
    { value: 'hr', label: 'Croatia' },
    { value: 'cu', label: 'Cuba' },
    { value: 'cy', label: 'Cyprus' },
    { value: 'cz', label: 'Czechia' },
    { value: 'dk', label: 'Denmark' },
    { value: 'dj', label: 'Djibouti' },
    { value: 'dm', label: 'Dominica' },
    { value: 'do', label: 'Dominican Republic' },
    { value: 'ec', label: 'Ecuador' },
    { value: 'eg', label: 'Egypt' },
    { value: 'sv', label: 'El Salvador' },
    { value: 'gq', label: 'Equatorial Guinea' },
    { value: 'er', label: 'Eritrea' },
    { value: 'ee', label: 'Estonia' },
    { value: 'sz', label: 'Eswatini' },
    { value: 'et', label: 'Ethiopia' },
    { value: 'fj', label: 'Fiji' },
    { value: 'fi', label: 'Finland' },
    { value: 'fr', label: 'France' },
    { value: 'ga', label: 'Gabon' },
    { value: 'gm', label: 'Gambia' },
    { value: 'ge', label: 'Georgia' },
    { value: 'de', label: 'Germany' },
    { value: 'gh', label: 'Ghana' },
    { value: 'gr', label: 'Greece' },
    { value: 'gd', label: 'Grenada' },
    { value: 'gt', label: 'Guatemala' },
    { value: 'gn', label: 'Guinea' },
    { value: 'gw', label: 'Guinea-Bissau' },
    { value: 'gy', label: 'Guyana' },
    { value: 'ht', label: 'Haiti' },
    { value: 'hn', label: 'Honduras' },
    { value: 'hu', label: 'Hungary' },
    { value: 'is', label: 'Iceland' },
    { value: 'in', label: 'India' },
    { value: 'id', label: 'Indonesia' },
    { value: 'ir', label: 'Iran' },
    { value: 'iq', label: 'Iraq' },
    { value: 'ie', label: 'Ireland' },
    { value: 'il', label: 'Israel' },
    { value: 'it', label: 'Italy' },
    { value: 'jm', label: 'Jamaica' },
    { value: 'jp', label: 'Japan' },
    { value: 'jo', label: 'Jordan' },
    { value: 'kz', label: 'Kazakhstan' },
    { value: 'ke', label: 'Kenya' },
    { value: 'ki', label: 'Kiribati' },
    { value: 'kp', label: 'Korea (North)' },
    { value: 'kr', label: 'Korea (South)' },
    { value: 'kw', label: 'Kuwait' },
    { value: 'kg', label: 'Kyrgyzstan' },
    { value: 'la', label: 'Laos' },
    { value: 'lv', label: 'Latvia' },
    { value: 'lb', label: 'Lebanon' },
    { value: 'ls', label: 'Lesotho' },
    { value: 'lr', label: 'Liberia' },
    { value: 'ly', label: 'Libya' },
    { value: 'li', label: 'Liechtenstein' },
    { value: 'lt', label: 'Lithuania' },
    { value: 'lu', label: 'Luxembourg' },
    { value: 'mg', label: 'Madagascar' },
    { value: 'mw', label: 'Malawi' },
    { value: 'my', label: 'Malaysia' },
    { value: 'mv', label: 'Maldives' },
    { value: 'ml', label: 'Mali' },
    { value: 'mt', label: 'Malta' },
    { value: 'mh', label: 'Marshall Islands' },
    { value: 'mr', label: 'Mauritania' },
    { value: 'mu', label: 'Mauritius' },
    { value: 'mx', label: 'Mexico' },
    { value: 'fm', label: 'Micronesia' },
    { value: 'md', label: 'Moldova' },
    { value: 'mc', label: 'Monaco' },
    { value: 'mn', label: 'Mongolia' },
    { value: 'me', label: 'Montenegro' },
    { value: 'ma', label: 'Morocco' },
    { value: 'mz', label: 'Mozambique' },
    { value: 'mm', label: 'Myanmar' },
    { value: 'na', label: 'Namibia' },
    { value: 'nr', label: 'Nauru' },
    { value: 'np', label: 'Nepal' },
    { value: 'nl', label: 'Netherlands' },
    { value: 'nz', label: 'New Zealand' },
    { value: 'ni', label: 'Nicaragua' },
    { value: 'ne', label: 'Niger' },
    { value: 'ng', label: 'Nigeria' },
    { value: 'mk', label: 'North Macedonia' },
    { value: 'no', label: 'Norway' },
    { value: 'om', label: 'Oman' },
    { value: 'pk', label: 'Pakistan' },
    { value: 'pw', label: 'Palau' },
    { value: 'pa', label: 'Panama' },
    { value: 'pg', label: 'Papua New Guinea' },
    { value: 'py', label: 'Paraguay' },
    { value: 'pe', label: 'Peru' },
    { value: 'ph', label: 'Philippines' },
    { value: 'pl', label: 'Poland' },
    { value: 'pt', label: 'Portugal' },
    { value: 'qa', label: 'Qatar' },
    { value: 'ro', label: 'Romania' },
    { value: 'ru', label: 'Russia' },
    { value: 'rw', label: 'Rwanda' },
    { value: 'kn', label: 'Saint Kitts and Nevis' },
    { value: 'lc', label: 'Saint Lucia' },
    { value: 'vc', label: 'Saint Vincent and the Grenadines' },
    { value: 'ws', label: 'Samoa' },
    { value: 'sm', label: 'San Marino' },
    { value: 'st', label: 'Sao Tome and Principe' },
    { value: 'sa', label: 'Saudi Arabia' },
    { value: 'sn', label: 'Senegal' },
    { value: 'rs', label: 'Serbia' },
    { value: 'sc', label: 'Seychelles' },
    { value: 'sl', label: 'Sierra Leone' },
    { value: 'sg', label: 'Singapore' },
    { value: 'sk', label: 'Slovakia' },
    { value: 'si', label: 'Slovenia' },
    { value: 'sb', label: 'Solomon Islands' },
    { value: 'so', label: 'Somalia' },
    { value: 'za', label: 'South Africa' },
    { value: 'ss', label: 'South Sudan' },
    { value: 'es', label: 'Spain' },
    { value: 'lk', label: 'Sri Lanka' },
    { value: 'sd', label: 'Sudan' },
    { value: 'sr', label: 'Suriname' },
    { value: 'se', label: 'Sweden' },
    { value: 'ch', label: 'Switzerland' },
    { value: 'sy', label: 'Syria' },
    { value: 'tw', label: 'Taiwan' },
    { value: 'tj', label: 'Tajikistan' },
    { value: 'tz', label: 'Tanzania' },
    { value: 'th', label: 'Thailand' },
    { value: 'tl', label: 'Timor-Leste' },
    { value: 'tg', label: 'Togo' },
    { value: 'to', label: 'Tonga' },
    { value: 'tt', label: 'Trinidad and Tobago' },
    { value: 'tn', label: 'Tunisia' },
    { value: 'tr', label: 'Turkey' },
    { value: 'tm', label: 'Turkmenistan' },
    { value: 'tv', label: 'Tuvalu' },
    { value: 'ug', label: 'Uganda' },
    { value: 'ua', label: 'Ukraine' },
    { value: 'ae', label: 'United Arab Emirates' },
    { value: 'gb', label: 'United Kingdom' },
    { value: 'us', label: 'United States' },
    { value: 'uy', label: 'Uruguay' },
    { value: 'uz', label: 'Uzbekistan' },
    { value: 'vu', label: 'Vanuatu' },
    { value: 'va', label: 'Vatican City' },
    { value: 've', label: 'Venezuela' },
    { value: 'vn', label: 'Vietnam' },
    { value: 'ye', label: 'Yemen' },
    { value: 'zm', label: 'Zambia' },
    { value: 'zw', label: 'Zimbabwe' }
  ];

  const leadSource=  [
      { value: 'website', label: 'Website' },
      { value: 'social-media', label: 'Social Media' },
      { value: 'email-campaign', label: 'Email Campaign' },
      { value: 'referral', label: 'Referral' },
      { value: 'cold-call', label: 'Cold Call' },
      { value: 'trade-show', label: 'Trade Show' },
      { value: 'advertisement', label: 'Advertisement' },
      { value: 'partner', label: 'Partner' }
  ];

  const clientType = [
      { value: 'individual', label: 'Individual' },
      { value: 'small-business', label: 'Small Business' },
      { value: 'medium-enterprise', label: 'Medium Enterprise' },
      { value: 'large-enterprise', label: 'Large Enterprise' },
      { value: 'government', label: 'Government' },
      { value: 'non-profit', label: 'Non-Profit' },
      { value: 'startup', label: 'Startup' }
  ];

  const gender = [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'Other', label: 'Other' },
  ]

  const nationality = [
      { value: 'american', label: 'American' },
      { value: 'british', label: 'British' },
      { value: 'canadian', label: 'Canadian' },
      { value: 'australian', label: 'Australian' },
      { value: 'german', label: 'German' },
      { value: 'french', label: 'French' },
      { value: 'indian', label: 'Indian' },
      { value: 'chinese', label: 'Chinese' },
      { value: 'japanese', label: 'Japanese' },
      { value: 'other', label: 'Other' }
  ]

  const industries = [
    {
      type: "Most Popular",
      options: [
        { value: "software", label: "Software" },
        { value: "clothing_and_accessories", label: "Clothing and Accessories" },
        { value: "food_and_beverage", label: "Food & Beverage" },
        { value: "health_and_beauty", label: "Health & Beauty" },
        { value: "consulting_services", label: "Consulting Services" },
        { value: "education", label: "Education" },
        { value: "freelance_services", label: "Freelance / Professional Services" },
        { value: "nonprofit", label: "Nonprofit / Charity" },
        { value: "travel_and_hospitality", label: "Travel & Hospitality" },
        { value: "real_estate", label: "Real Estate" },
      ],
    },
    {
      type: "Retail & E-commerce",
      options: [
        { value: "clothing", label: "Clothing" },
        { value: "electronics", label: "Electronics" },
        { value: "home_goods", label: "Home Goods" },
        { value: "furniture", label: "Furniture" },
        { value: "books_and_media", label: "Books & Media" },
        { value: "jewelry", label: "Jewelry & Accessories" },
        { value: "sporting_goods", label: "Sporting Goods" },
        { value: "grocery", label: "Grocery / Food Retail" },
      ],
    },
    {
      type: "Services",
      options: [
        { value: "consulting", label: "Consulting" },
        { value: "marketing", label: "Marketing / Advertising" },
        { value: "design", label: "Design Services" },
        { value: "it_services", label: "IT Services" },
        { value: "construction", label: "Construction / Contracting" },
        { value: "transportation", label: "Transportation / Logistics" },
        { value: "personal_services", label: "Personal Services" },
        { value: "cleaning_services", label: "Cleaning Services" },
      ],
    },
    {
      type: "Digital & Online",
      options: [
        { value: "saas", label: "Software as a Service (SaaS)" },
        { value: "digital_products", label: "Digital Products" },
        { value: "online_courses", label: "Online Courses" },
        { value: "streaming", label: "Streaming / Content Creation" },
        { value: "subscriptions", label: "Subscription Services" },
        { value: "gaming", label: "Gaming / Esports" },
      ],
    },
    {
      type: "Health & Wellness",
      options: [
        { value: "fitness", label: "Fitness / Gyms" },
        { value: "healthcare", label: "Healthcare" },
        { value: "therapy", label: "Therapy / Counseling" },
        { value: "nutrition", label: "Nutrition / Supplements" },
        { value: "beauty", label: "Beauty / Personal Care" },
      ],
    },
    {
      type: "Entertainment & Media",
      options: [
        { value: "music", label: "Music / Bands" },
        { value: "film_and_video", label: "Film & Video" },
        { value: "events", label: "Events / Ticketing" },
        { value: "art", label: "Art / Photography" },
        { value: "writing", label: "Writing / Publishing" },
      ],
    },
    {
      type: "Financial & Real Estate",
      options: [
        { value: "real_estate_services", label: "Real Estate Services" },
        { value: "investment", label: "Investment / Financial Services" },
        { value: "insurance", label: "Insurance" },
        { value: "accounting", label: "Accounting / Bookkeeping" },
        { value: "legal", label: "Legal Services" },
      ],
    },
    {
      type: "Other",
      options: [
        { value: "nonprofit_charity", label: "Nonprofit / Charity" },
        { value: "education_institution", label: "Education Institution" },
        { value: "government", label: "Government / Public Sector" },
        { value: "other", label: "Other" },
      ],
    },
  ];

  const handleAddClient = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.legalName) newErrors.productId = "Legal Name is required";
    if (!formData.industry) newErrors.displayName = "Industry is required";
    if (!formData.email?.length) newErrors.category = "Email addressis required";
    if (!formData.country) newErrors.category = "Country is required";
    if (!formData.buildingName) newErrors.category = "Building Name is required";
    if (!formData.city) newErrors.category = "City is required";
    if (!formData.state) newErrors.category = "State is required";
    if (!formData.zipCode) newErrors.category = "Zip code is required";
    if (!formData.leadSource) newErrors.category = "Lead source is required";
    if (!formData.clientType) newErrors.category = "Client type is required";
    if (!formData.lastContactedDate) newErrors.category = "Last contacted date is required";
    if (!formData.firstName) newErrors.category = "First name is required";
    if (!formData.lastName) newErrors.category = "Last name is required";
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    if (!formData.pointOfContactEmail) newErrors.pointOfContactEmail = 'email is required';
    if (!formData.pointOfContactLinkedIn) newErrors.nationality = 'LinkDin is required';

    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    const finalValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [id]: finalValue }));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Add Client</h1>

      <form onSubmit={handleAddClient}>
        {/* Company Details */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-1">Company Details</h2>
          <p className="text-sm text-gray-500 mb-4">*Required field</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Legal Name <span className="text-red-500">*</span></label>
              <Input id='legalName' placeholder="Enter legal name" value={formData.legalName || ""} onChange={handleChange} required />
              {errors.legalName && <p className="mt-1 text-xs text-red-500">{errors.legalName}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Industry<span className="text-red-500">*</span></label>
              <NestedDropdown data={industries} onChange={(value) => setFormData({ ...formData, industry: value })} />
              {errors.industry && <p className="mt-1 text-xs text-red-500">{errors.industry}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Company Website</label>
              <Input id='website' placeholder="Enter Website URL" type='url' value={formData.website || ""} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Business Name</label>
              <Input id='businessName' placeholder="Enter business name" value={formData.businessName || ""} onChange={handleChange} />
            </div>

          </div>
        </div>

        {/* Contact Details Management */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Contact details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Email Address <span className="text-red-500">*</span></label>
              <Input id='email' placeholder="Enter email address" value={formData.email || ""} onChange={handleChange} required />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Phone Number</label>
              <Input id='phone' placeholder="Enter email address" value={formData.phone || ""} onChange={handleChange} required />
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6 mb-6">
          <h2 className="text-lg font-semibold">Address Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Country<span className="text-red-500">*</span></label>
              <select id="country" className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm" value={formData.country || ""} onChange={handleChange}>
                <option value="">Select Country</option>
                {countries.map((u, i) => <option key={i} value={u.value}>{u.label}</option>)}
              </select>
              {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Building Name <span className="text-red-500">*</span></label>
              <Input id='buildingName' placeholder="Enter building Name" value={formData.buildingName || ""} onChange={handleChange} required />
              {errors.buildingName && <p className="mt-1 text-xs text-red-500">{errors.buildingName}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Street Number</label>
              <Input id='streetNumber' placeholder="Enter Street Number" type='number' value={formData.streetNumber || ""} onChange={handleChange} required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Street Name <span className="text-red-500">*</span></label>
              <Input id='streetName' placeholder="Enter Street Name" value={formData.streetName || ""} onChange={handleChange} required />
              {errors.streetName && <p className="mt-1 text-xs text-red-500">{errors.streetName}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Unit Number</label>
              <Input id='unitNumber' placeholder="Enter Unit Number" type='number' value={formData.unitNumber || ""} onChange={handleChange} required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">City <span className="text-red-500">*</span></label>
              <Input id='city' placeholder="Enter city" value={formData.city || ""} onChange={handleChange} required />
              {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">State/Province <span className="text-red-500">*</span></label>
              <Input id='state' placeholder="Enter State" value={formData.state || ""} onChange={handleChange} required />
              {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Zip/Postal Code <span className="text-red-500">*</span></label>
              <Input id='zipCode' placeholder="Enter Zip code" value={formData.zipCode || ""} onChange={handleChange} required />
              {errors.zipCode && <p className="mt-1 text-xs text-red-500">{errors.zipCode}</p>}
            </div>
          </div>


        </div>


        {/* Lead Details */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Lead details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Lead Source <span className="text-red-500">*</span></label>
              <select id="leadSource" className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm" value={formData.leadSource || ""} onChange={handleChange}>
                <option value="">Select an Option</option>
                {leadSource.map((u, i) => <option key={i} value={u.value}>{u.label}</option>)}
              </select>
              {/* <Input id='leadSource' placeholder="Enter email address" value={formData.leadSource || ""} onChange={handleChange} required /> */}
              {errors.leadSource && <p className="mt-1 text-xs text-red-500">{errors.leadSource}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Client Type <span className="text-red-500">*</span></label>
              <select id="clientType" className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm" value={formData.clientType || ""} onChange={handleChange}>
                <option value="">Select an Option</option>
                {clientType.map((u, i) => <option key={i} value={u.value}>{u.label}</option>)}
              </select>
              {/* <Input id='clientType' placeholder="Enter email address" value={formData.clientType || ""} onChange={handleChange} required /> */}
              {errors.clientType && <p className="mt-1 text-xs text-red-500">{errors.clientType}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Last Contacted Date<span className="text-red-500">*</span></label>
              <Input id='lastContactedDate' type='date' placeholder="Enter Last Contacted Date" value={formData.lastContactedDate || ""} onChange={handleChange} required />
              {errors.lastContactedDate && <p className="mt-1 text-xs text-red-500">{errors.lastContactedDate}</p>}
            </div>
          </div>
        </div>

        {/* Point Of Contact Details */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Point Of Contact details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">First Name <span className="text-red-500">*</span></label>
              <Input id='firstName' placeholder="Enter first name" value={formData.firstName || ""} onChange={handleChange} required />
              {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Last Name <span className="text-red-500">*</span></label>
              <Input id='lastName' placeholder="Enter last name" value={formData.lastName || ""} onChange={handleChange} required />
              {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Gender<span className="text-red-500">*</span></label>
              <select id="gender" className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm" value={formData.gender || ""} onChange={handleChange}>
                <option value="">Select Gender</option>
                {gender.map((u, i) => <option key={i} value={u.value}>{u.label}</option>)}
              </select>
              {/* <Input id='gender' placeholder="Enter email address" value={formData.gender || ""} onChange={handleChange} required /> */}
              {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Nationality<span className="text-red-500">*</span></label>
              <select id="nationality" className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm" value={formData.nationality || ""} onChange={handleChange}>
                <option value="">Select Nationality</option>
                {nationality.map((u, i) => <option key={i} value={u.value}>{u.label}</option>)}
              </select>
              {/* <Input id='nationality' placeholder="Enter email address" value={formData.nationality || ""} onChange={handleChange} required /> */}
              {errors.nationality && <p className="mt-1 text-xs text-red-500">{errors.nationality}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Email Address<span className="text-red-500">*</span></label>
              <Input id='pointOfContactEmail' placeholder="Enter email address" value={formData.pointOfContactEmail || ""} onChange={handleChange} required />
              {errors.pointOfContactEmail && <p className="mt-1 text-xs text-red-500">{errors.pointOfContactEmail}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Phone Number</label>
              <Input id='contactPhone' placeholder="Enter phone number" value={formData.contactPhone || ""} onChange={handleChange} required />
              {errors.contactPhone && <p className="mt-1 text-xs text-red-500">{errors.contactPhone}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">LinkdIn<span className="text-red-500">*</span></label>
              <Input id='pointOfContactLinkedIn' placeholder="Enter email address" value={formData.pointOfContactLinkedIn || ""} onChange={handleChange} required />
              {errors.pointOfContactLinkedIn && <p className="mt-1 text-xs text-red-500">{errors.pointOfContactLinkedIn}</p>}
            </div>

          </div>
        </div>


        {/* Notes*/}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Notes/Remarks</label>
              <textarea id='notes' className="w-full border border-input rounded-md px-2.5 py-1 text-sm" rows={3} value={formData.notes} onChange={handleChange} placeholder="Enter notes" />
              {errors.notes && <p className="mt-1 text-xs text-red-500">{errors.notes}</p>}
            </div>
          </div>
        </div>



        {/* Form Actions */}
        <div className="flex items-center justify-between">

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={createTemplate} onChange={(e) => setCreateTemplate(e.target.checked)} />
            Do you want to create a new template
          </label>

          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" type="button" onClick={() => router.push("/crm/manage-clients")}>Cancel</Button>
            {createTemplate ? (
              <Button size="sm" type="button" onClick={() => setShowTemplateModal(true)} disabled={isSubmitting}>
                {isSubmitting ? "Saving Template..." : "Create Template"}
              </Button>
            ) : (
              <Button size="sm" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving Product..." : "Save Product"}
              </Button>
            )}
          </div>
        </div>

      </form>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="font-semibold text-lg mb-4">Save Template</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Template Name</label>
                <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Enter template name" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Template Description</label>
                <textarea className="w-full border border-input rounded-md px-2.5 py-1 text-sm" rows={3} value={templateDesc} onChange={(e) => setTemplateDesc(e.target.value)} placeholder="Enter template description" />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" size="sm" onClick={() => setShowTemplateModal(false)}>Cancel</Button>
              <Button size="sm" onClick={() => { }} disabled={!templateName.trim() || isSubmitting}>Save Template</Button>
            </div>
          </div>
        </div>
      )}
    </div>

  )
}
