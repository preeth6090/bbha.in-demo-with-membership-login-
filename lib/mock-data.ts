import { Entity, Document, Membership, Notification, VendorCategory, Vendor, VendorBadge, Announcement, PaymentSubmission, InvoiceSettings } from '@/lib/types'

export const MOCK_ADMIN = { id: 'admin-1', full_name: 'Priya Sharma', email: 'admin@bbha.in', role: 'admin' as const, is_approved: true }
export const MOCK_MEMBER = { id: 'member-1', full_name: 'Rajan Mehta', email: 'rajan@grandhotel.in', role: 'member' as const, is_approved: true }

export const MOCK_ENTITIES: Entity[] = [
  {
    id: 'e1', owner_id: 'member-1', name: 'The Grand Bangalore', type: 'Hotel',
    address: '42 MG Road', city: 'Bangalore', gstin: '29AABCT1332L1ZT',
    fssai_number: '11225523000001', phone: '+91 80 4567 8900', email: 'info@grandblr.in',
    is_active: true, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'e2', owner_id: 'member-2', name: 'Spice Garden QSR', type: 'QSR',
    address: '12 Brigade Road', city: 'Bangalore', gstin: '29AABCT9988L1ZT',
    fssai_number: '11225523000002', phone: '+91 80 2234 5678', email: null,
    is_active: true, created_at: '2024-02-01T00:00:00Z', updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'e3', owner_id: 'member-3', name: 'Namma Bakery', type: 'Bakery',
    address: '7 Indiranagar', city: 'Bangalore', gstin: null,
    fssai_number: '11225523000003', phone: '+91 98765 43210', email: 'hello@nammabakery.in',
    is_active: true, created_at: '2024-03-10T00:00:00Z', updated_at: '2024-03-10T00:00:00Z',
  },
  {
    id: 'e4', owner_id: 'member-4', name: 'Coastal Catch Bar & Grill', type: 'Bar',
    address: '55 Koramangala 5th Block', city: 'Bangalore', gstin: '29AABCT7766L1ZT',
    fssai_number: '11225523000004', phone: '+91 80 6789 0123', email: null,
    is_active: false, created_at: '2024-04-05T00:00:00Z', updated_at: '2024-04-05T00:00:00Z',
  },
  {
    id: 'e5', owner_id: 'member-5', name: 'Biryani House Catering', type: 'Catering',
    address: '18 Whitefield', city: 'Bangalore', gstin: '29AABCT5544L1ZT',
    fssai_number: null, phone: '+91 99887 76655', email: 'orders@biryanihouse.in',
    is_active: true, created_at: '2024-05-20T00:00:00Z', updated_at: '2024-05-20T00:00:00Z',
  },
]

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'd1', entity_id: 'e1', profile_id: 'member-1',
    document_type: 'FSSAI', document_number: '11225523000001',
    issuing_authority: 'FSSAI Regional Office', issue_date: '2023-04-01', expiry_date: '2026-09-30',
    file_url: null, file_name: 'fssai_license.pdf',
    verification_status: 'verified', verified_by: 'admin-1', verified_at: '2024-01-20T10:00:00Z', notes: null,
    custom_document_name: null, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-20T00:00:00Z',
  },
  {
    id: 'd2', entity_id: 'e1', profile_id: 'member-1',
    document_type: 'BBMP_Trade_License', document_number: 'BBMP/TL/2024/98765',
    issuing_authority: 'BBMP Ward 76', issue_date: '2024-04-01', expiry_date: '2026-06-01',
    file_url: null, file_name: 'bbmp_trade_license.pdf',
    verification_status: 'verified', verified_by: 'admin-1', verified_at: '2024-04-05T10:00:00Z', notes: null,
    custom_document_name: null, created_at: '2024-04-01T00:00:00Z', updated_at: '2024-04-05T00:00:00Z',
  },
  {
    id: 'd3', entity_id: 'e1', profile_id: 'member-1',
    document_type: 'Fire_NOC', document_number: 'KA/FIRE/2024/1234',
    issuing_authority: 'Karnataka Fire & Emergency Services', issue_date: '2024-03-15', expiry_date: '2026-05-10',
    file_url: null, file_name: 'fire_noc.pdf',
    verification_status: 'pending', verified_by: null, verified_at: null, notes: null,
    custom_document_name: null, created_at: '2024-03-15T00:00:00Z', updated_at: '2024-03-15T00:00:00Z',
  },
  {
    id: 'd4', entity_id: 'e1', profile_id: 'member-1',
    document_type: 'GST_Certificate', document_number: '29AABCT1332L1ZT',
    issuing_authority: 'GST Council', issue_date: '2023-07-01', expiry_date: '2026-04-29',
    file_url: null, file_name: 'gst_certificate.pdf',
    verification_status: 'verified', verified_by: 'admin-1', verified_at: '2024-01-20T10:00:00Z', notes: null,
    custom_document_name: null, created_at: '2023-07-01T00:00:00Z', updated_at: '2024-01-20T00:00:00Z',
  },
  {
    id: 'd5', entity_id: 'e1', profile_id: 'member-1',
    document_type: 'Health_License', document_number: 'BRUHAT/HL/2023/5678',
    issuing_authority: 'BBMP Health Department', issue_date: '2023-01-10', expiry_date: '2026-04-30',
    file_url: null, file_name: 'health_license.pdf',
    verification_status: 'rejected', verified_by: 'admin-1', verified_at: '2024-02-01T10:00:00Z',
    notes: 'Document unclear — please reupload a higher resolution scan.',
    custom_document_name: null, created_at: '2023-01-10T00:00:00Z', updated_at: '2024-02-01T00:00:00Z',
  },
]

export const MOCK_MEMBERSHIPS: Membership[] = [
  {
    id: 'm1', entity_id: 'e1', profile_id: 'member-1',
    membership_number: 'BBHA-2024-1042', plan: 'annual',
    payment_status: 'paid', amount_due: 0, amount_paid: 5000,
    due_date: '2024-04-01', paid_date: '2024-03-28',
    payment_reference: 'RZP-20240328-ABCXYZ',
    valid_from: '2024-04-01', valid_until: '2025-03-31',
    created_at: '2024-01-15T00:00:00Z', updated_at: '2024-03-28T00:00:00Z',
  },
  {
    id: 'm2', entity_id: 'e2', profile_id: 'member-2',
    membership_number: 'BBHA-2024-2187', plan: 'annual',
    payment_status: 'overdue', amount_due: 5000, amount_paid: 0,
    due_date: '2024-04-01', paid_date: null, payment_reference: null,
    valid_from: '2024-04-01', valid_until: '2025-03-31',
    created_at: '2024-02-01T00:00:00Z', updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'm3', entity_id: 'e3', profile_id: 'member-3',
    membership_number: 'BBHA-2024-3301', plan: 'annual',
    payment_status: 'pending', amount_due: 5000, amount_paid: 0,
    due_date: '2026-05-15', paid_date: null, payment_reference: null,
    valid_from: '2025-04-01', valid_until: '2026-03-31',
    created_at: '2024-03-10T00:00:00Z', updated_at: '2024-03-10T00:00:00Z',
  },
]

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', profile_id: 'member-1', title: 'Document Expiring Soon', message: 'Your GST Certificate expires in 30 days. Please renew.', type: 'warning', is_read: false, link: '/documents', created_at: '2026-04-25T09:00:00Z' },
  { id: 'n2', profile_id: 'member-1', title: 'Membership Renewed', message: 'Your annual membership has been renewed successfully.', type: 'success', is_read: false, link: '/memberships', created_at: '2026-03-28T12:00:00Z' },
  { id: 'n3', profile_id: 'member-1', title: 'Document Rejected', message: 'Your Health License scan was rejected. Please reupload.', type: 'error', is_read: true, link: '/documents', created_at: '2026-02-01T10:00:00Z' },
]

export const MOCK_PENDING_MEMBERS = [
  { id: 'p1', full_name: 'Suresh Patel', email: 'suresh@lakeview.in', phone: '+91 98765 11111', created_at: '2026-04-24T08:00:00Z' },
  { id: 'p2', full_name: 'Anita Krishnan', email: 'anita@cafekrishna.in', phone: '+91 99887 22222', created_at: '2026-04-26T11:30:00Z' },
]

export const MOCK_VENDOR_CATEGORIES: VendorCategory[] = [
  { id: 'vc1',  name: 'Food & Beverage Supplies',     icon: '🥩', description: 'Meat, dairy, dry goods, fresh produce, beverages' },
  { id: 'vc2',  name: 'Kitchen Equipment',             icon: '🍳', description: 'Commercial cookers, refrigeration, dishwashers, smallwares' },
  { id: 'vc3',  name: 'Linen & Laundry',               icon: '🛏️', description: 'Bed linen, towels, uniforms, laundry services' },
  { id: 'vc4',  name: 'Housekeeping Supplies',         icon: '🧹', description: 'Cleaning chemicals, mops, guest amenities, tissue' },
  { id: 'vc5',  name: 'IT & POS Systems',              icon: '💻', description: 'Property management, point-of-sale, CCTV, networking' },
  { id: 'vc6',  name: 'Pest Control',                  icon: '🐛', description: 'Certified AMC pest management for FSSAI compliance' },
  { id: 'vc7',  name: 'Security Services',             icon: '🔒', description: 'Manpower, access control, fire safety equipment' },
  { id: 'vc8',  name: 'HVAC & Refrigeration',          icon: '❄️', description: 'AC installation, cold room maintenance, AMC contracts' },
  { id: 'vc9',  name: 'Packaging & Disposables',       icon: '📦', description: 'Eco-friendly boxes, tissue, straws, carry bags' },
  { id: 'vc10', name: 'Furniture & Interiors',         icon: '🪑', description: 'Dining chairs, tables, soft furnishings, renovation' },
  { id: 'vc11', name: 'Staffing & Training',           icon: '👨‍🍳', description: 'Hospitality recruitment, chef placement, skill training' },
  { id: 'vc12', name: 'Legal & Compliance',            icon: '⚖️', description: 'FSSAI, BBMP, fire & liquor licence consultants' },
]

export const MOCK_VENDORS: Vendor[] = [
  { id: 'v1',  category_id: 'vc1',  name: 'Nandini Dairy Distributors',            city: 'Bangalore', pincode: '560078', lat: 12.8633, lng: 77.6107,
    description: 'Authorised bulk distributor for KMF Nandini products — milk, paneer, curd, butter, ghee. Next-day delivery across Bangalore.',
    contact_person: 'Suresh Gowda',    phone: '+91 98450 11001', email: 'orders@nandinidist.in',    website: 'nandinidist.in',     address: 'Dairy Circle, Bannerghatta Road',              is_empanelled: true, created_at: '2024-01-10T00:00:00Z' },
  { id: 'v2',  category_id: 'vc1',  name: 'Bengaluru Agro Fresh',                  city: 'Bangalore', pincode: '560022', lat: 13.0232, lng: 77.5402,
    description: 'Farm-to-kitchen fresh produce sourced directly from Hopcoms and Kolar farmers. Vegetables, fruits, herbs, and micro-greens.',
    contact_person: 'Kavitha Reddy',   phone: '+91 80 4567 2233', email: 'supply@bengaluruagro.in', website: null,                 address: 'APMC Yard, Yeshwanthpur',                      is_empanelled: true, created_at: '2024-01-15T00:00:00Z' },
  { id: 'v3',  category_id: 'vc1',  name: 'South India Meat Traders',              city: 'Bangalore', pincode: '560005', lat: 12.9796, lng: 77.6068,
    description: 'FSSAI-certified supplier of fresh and frozen chicken, mutton, and seafood. Halal-certified. Refrigerated delivery vans.',
    contact_person: 'Riyaz Ahmed',     phone: '+91 99001 33445', email: 'riyaz@simitraders.com',    website: null,                 address: 'Russell Market, Shivajinagar',                  is_empanelled: true, created_at: '2024-02-01T00:00:00Z' },
  { id: 'v4',  category_id: 'vc1',  name: 'Metro Cash & Carry (BBHA Rate)',        city: 'Bangalore', pincode: '560022', lat: 13.0232, lng: 77.5402,
    description: 'Exclusive BBHA member rate card for bulk dry goods, packaged foods, and beverages at Metro wholesale outlets.',
    contact_person: 'B2B Desk',        phone: '+91 80 6789 0000', email: 'b2b.blr@metro.in',        website: 'metro.in',           address: 'Multiple locations — Yeshwanthpur, Marathahalli', is_empanelled: true, created_at: '2024-02-10T00:00:00Z' },
  { id: 'v5',  category_id: 'vc2',  name: 'Hotelcraft Equipment Pvt Ltd',          city: 'Bangalore', pincode: '560058', lat: 13.0282, lng: 77.5171,
    description: 'Commercial kitchen design, supply, and installation. Brands: Blue Star, Winterhalter, Rational. Annual maintenance contracts available.',
    contact_person: 'Dinesh Menon',    phone: '+91 80 2234 5678', email: 'sales@hotelcraft.in',      website: 'hotelcraft.in',      address: '14 Industrial Estate, Peenya',                  is_empanelled: true, created_at: '2024-01-20T00:00:00Z' },
  { id: 'v6',  category_id: 'vc2',  name: 'Combi King India',                      city: 'Bangalore', pincode: '560010', lat: 12.9876, lng: 77.5470,
    description: 'Authorised dealer for Rational combi-steamers and Merrychef speed ovens. Demo kitchen available at showroom.',
    contact_person: 'Pradeep Kumar',   phone: '+91 98440 22334', email: 'info@combikingblr.com',     website: null,                 address: '7th Cross, Rajajinagar Industrial Area',         is_empanelled: true, created_at: '2024-03-01T00:00:00Z' },
  { id: 'v7',  category_id: 'vc3',  name: 'Pristine Linen Services',               city: 'Bangalore', pincode: '560105', lat: 12.7976, lng: 77.6366,
    description: 'Industrial laundry and linen rental for hotels. Pick-up/drop daily. OEKO-TEX certified linen. Thread counts from 200 to 600 TC.',
    contact_person: 'Shalini Bhat',    phone: '+91 80 4411 5566', email: 'ops@pristinelinen.in',     website: 'pristinelinen.in',   address: 'Survey No. 44, Jigani Industrial Area',          is_empanelled: true, created_at: '2024-01-25T00:00:00Z' },
  { id: 'v8',  category_id: 'vc3',  name: 'Star Garment & Uniform House',          city: 'Bangalore', pincode: '560005', lat: 12.9830, lng: 77.6088,
    description: 'Custom hospitality uniforms — front office, F&B, housekeeping, and kitchen. MOQ: 10 sets. Embroidery and logo printing included.',
    contact_person: 'Manjunath S',     phone: '+91 99720 44556', email: 'orders@stargarment.com',    website: null,                 address: 'Commercial Street, Bangalore',                  is_empanelled: true, created_at: '2024-02-15T00:00:00Z' },
  { id: 'v9',  category_id: 'vc4',  name: 'Diversey Bangalore (BBHA Empanelled)',  city: 'Bangalore', pincode: '560037', lat: 12.9592, lng: 77.6985,
    description: 'Professional cleaning and hygiene products for hospitality — room care, F&B sanitisers, floor care. HACCP-compliant formulations.',
    contact_person: 'Asha Nair',       phone: '+91 80 6677 8899', email: 'asha.nair@diversey.com',   website: 'diversey.com',       address: 'Outer Ring Road, Marathahalli',                  is_empanelled: true, created_at: '2024-01-12T00:00:00Z' },
  { id: 'v10', category_id: 'vc4',  name: 'GreenClean Amenities',                  city: 'Bangalore', pincode: '560100', lat: 12.8399, lng: 77.6770,
    description: 'Eco-friendly guest amenities — shampoo, soap, conditioner, body lotion in bulk. Customised branding available. ISO 9001 certified.',
    contact_person: 'Rohit Jain',      phone: '+91 98450 77889', email: 'rohit@greenclean.in',       website: 'greenclean.in',      address: 'Electronics City Phase 2',                       is_empanelled: true, created_at: '2024-03-10T00:00:00Z' },
  { id: 'v11', category_id: 'vc5',  name: 'Posist Technologies',                   city: 'Bangalore', pincode: '560001', lat: 12.9698, lng: 77.5986,
    description: 'Cloud-based restaurant POS and management platform. KOT, billing, inventory, analytics, online order integration. BBHA member discount: 20%.',
    contact_person: 'Sales Team',      phone: '+91 11 4084 6900', email: 'sales@posist.com',         website: 'posist.com',         address: 'MG Road (Cloud — pan-India support)',            is_empanelled: true, created_at: '2024-01-08T00:00:00Z' },
  { id: 'v12', category_id: 'vc5',  name: 'Technowave IT Solutions',               city: 'Bangalore', pincode: '560034', lat: 12.9352, lng: 77.6245,
    description: 'CCTV installation, networking, structured cabling, and server room setup for hotels and restaurants. 24×7 AMC support.',
    contact_person: 'Vijay Rao',       phone: '+91 80 4455 6677', email: 'vijay@technowaveblr.in',   website: null,                 address: 'Koramangala 4th Block',                          is_empanelled: true, created_at: '2024-02-20T00:00:00Z' },
  { id: 'v13', category_id: 'vc6',  name: 'HiCare Pest Control (BBHA Partner)',    city: 'Bangalore', pincode: '560001', lat: 12.9716, lng: 77.5946,
    description: 'FSSAI-compliant integrated pest management for food businesses. Monthly AMC with digital service reports accepted by inspectors.',
    contact_person: 'Service Desk',    phone: '+91 80 6736 2626', email: 'blr@hicare.in',            website: 'hicare.in',          address: 'Pan Bangalore — 12 service zones',               is_empanelled: true, created_at: '2024-01-05T00:00:00Z' },
  { id: 'v14', category_id: 'vc7',  name: 'Securitas India — Hospitality Desk',    city: 'Bangalore', pincode: '560001', lat: 12.9717, lng: 77.5975,
    description: 'Trained hospitality security manpower, access control systems, and fire safety audits. Police-verified guards with hotel protocol training.',
    contact_person: 'Arun Pillai',     phone: '+91 80 2525 3636', email: 'arun.pillai@securitas.com',website: 'securitas.in',       address: 'Lavelle Road, Bangalore',                        is_empanelled: true, created_at: '2024-01-18T00:00:00Z' },
  { id: 'v15', category_id: 'vc8',  name: 'CoolBreeze HVAC Solutions',             city: 'Bangalore', pincode: '560058', lat: 13.0282, lng: 77.5171,
    description: 'Commercial AC installation and AMC — Daikin, Voltas, Blue Star VRF systems. Cold room fabrication and refrigeration repair. 4-hour SLA.',
    contact_person: 'Ramesh Naik',     phone: '+91 98441 55667', email: 'ramesh@coolbreezeblr.com',  website: null,                 address: 'Peenya 2nd Stage',                               is_empanelled: true, created_at: '2024-02-05T00:00:00Z' },
  { id: 'v16', category_id: 'vc9',  name: 'EcoPack India (Bangalore)',             city: 'Bangalore', pincode: '560099', lat: 12.7983, lng: 77.6878,
    description: 'BBMP-compliant biodegradable packaging — boxes, cups, cutlery, carry bags. Bulk pricing for BBHA members. Custom print MOQ: 500 pcs.',
    contact_person: 'Nidhi Sharma',    phone: '+91 80 4100 2200', email: 'nidhi@ecopackindia.com',   website: 'ecopackindia.com',   address: 'Bommasandra Industrial Area',                    is_empanelled: true, created_at: '2024-01-22T00:00:00Z' },
  { id: 'v17', category_id: 'vc10', name: 'Hospitality Furnishings Pvt Ltd',       city: 'Bangalore', pincode: '560080', lat: 13.0050, lng: 77.5705,
    description: 'End-to-end interior design and furniture supply for hotels and restaurants. In-house design studio. 3D renders before production. EMI available.',
    contact_person: 'Lakshmi Iyer',    phone: '+91 99001 88776', email: 'lakshmi@hospfurnish.in',    website: 'hospfurnish.in',     address: '18th Cross, Sadashivanagar',                     is_empanelled: true, created_at: '2024-03-15T00:00:00Z' },
  { id: 'v18', category_id: 'vc11', name: 'Indihire Hospitality Staffing',         city: 'Bangalore', pincode: '560042', lat: 12.9773, lng: 77.6100,
    description: 'Specialist recruitment for chefs, F&B associates, housekeeping, and front office. Background-verified candidates. 90-day replacement guarantee.',
    contact_person: 'Farhan Sheikh',   phone: '+91 80 4900 3300', email: 'farhan@indihire.in',       website: 'indihire.in',        address: 'Dickenson Road, Bangalore',                      is_empanelled: true, created_at: '2024-01-30T00:00:00Z' },
  { id: 'v19', category_id: 'vc12', name: 'Compliancewala — F&B Specialists',      city: 'Bangalore', pincode: '560001', lat: 12.9698, lng: 77.5986,
    description: 'End-to-end licence consulting: FSSAI, BBMP trade, fire NOC, liquor licence, GSTIN. Renewal tracking and document management included.',
    contact_person: 'Adv. Sunita Kamath', phone: '+91 98450 99001', email: 'sunita@compliancewala.in', website: 'compliancewala.in', address: 'MG Road, Bangalore',                            is_empanelled: true, created_at: '2024-01-08T00:00:00Z' },
  { id: 'v20', category_id: 'vc12', name: 'TaxEase GST & Labour Law Consultants', city: 'Bangalore', pincode: '560004', lat: 12.9416, lng: 77.5749,
    description: 'GST filing, ESIC, PF, and labour law compliance for hospitality businesses. Monthly retainer packages starting ₹3,500.',
    contact_person: 'CA Mohan Rao',    phone: '+91 80 2211 4455', email: 'mohan@taxeaseblr.com',     website: null,                 address: 'Basavanagudi, Bangalore',                        is_empanelled: true, created_at: '2024-02-28T00:00:00Z' },
]

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann1',
    message: 'Annual General Meeting on 15 May 2026 at Hotel Lalit, Bangalore — all members are invited. Register by 10 May.',
    type: 'info',
    is_active: true,
    created_by: 'admin-1',
    created_at: '2026-04-20T09:00:00Z',
    expires_at: '2026-05-16T00:00:00Z',
    author_name: 'Priya Sharma',
  },
  {
    id: 'ann2',
    message: 'FSSAI Annual Return deadline: 31 May 2026. Upload and verify all documents on the portal before the due date to avoid penalties.',
    type: 'warning',
    is_active: true,
    created_by: 'admin-1',
    created_at: '2026-04-22T10:00:00Z',
    expires_at: '2026-05-31T00:00:00Z',
    author_name: 'Priya Sharma',
  },
  {
    id: 'ann3',
    message: 'Exclusive BBHA member rates now active at Metro Cash & Carry across all Bangalore outlets — show your membership card at the B2B desk.',
    type: 'promo',
    is_active: true,
    created_by: 'admin-1',
    created_at: '2026-04-25T08:00:00Z',
    expires_at: null,
    author_name: 'Priya Sharma',
  },
]

// Badge expiry dates anchored to demo date (2026-04-27)
// 3 badges expire in < 7 days (trigger warning), others have future/no expiry
export const MOCK_VENDOR_BADGES: VendorBadge[] = [
  // v1 — Nandini Dairy
  { id: 'b1',  vendor_id: 'v1',  badge_key: 'bbha_recommended',  assigned_by: 'admin-1', assigned_at: '2024-06-01T00:00:00Z', expires_at: null },
  { id: 'b2',  vendor_id: 'v1',  badge_key: 'fssai_approved',    assigned_by: 'admin-1', assigned_at: '2024-06-01T00:00:00Z', expires_at: null },
  // v2 — Bengaluru Agro
  { id: 'b3',  vendor_id: 'v2',  badge_key: 'new_vendor',        assigned_by: 'admin-1', assigned_at: '2026-03-01T00:00:00Z', expires_at: '2026-06-30T00:00:00Z' },
  { id: 'b4',  vendor_id: 'v2',  badge_key: 'bbha_member_rate',  assigned_by: 'admin-1', assigned_at: '2026-01-01T00:00:00Z', expires_at: '2026-05-01T00:00:00Z' }, // 4 days — ⚠️
  // v3 — Meat Traders
  { id: 'b5',  vendor_id: 'v3',  badge_key: 'fssai_approved',    assigned_by: 'admin-1', assigned_at: '2024-06-01T00:00:00Z', expires_at: null },
  { id: 'b6',  vendor_id: 'v3',  badge_key: 'verified_supplier', assigned_by: 'admin-1', assigned_at: '2025-01-01T00:00:00Z', expires_at: '2026-12-31T00:00:00Z' },
  // v4 — Metro
  { id: 'b7',  vendor_id: 'v4',  badge_key: 'bbha_member_rate',  assigned_by: 'admin-1', assigned_at: '2025-04-01T00:00:00Z', expires_at: '2026-04-30T00:00:00Z' }, // 3 days — ⚠️
  { id: 'b8',  vendor_id: 'v4',  badge_key: 'negotiated_price',  assigned_by: 'admin-1', assigned_at: '2025-04-01T00:00:00Z', expires_at: '2026-04-30T00:00:00Z' }, // 3 days — ⚠️
  { id: 'b9',  vendor_id: 'v4',  badge_key: 'top_rated',         assigned_by: 'admin-1', assigned_at: '2025-01-01T00:00:00Z', expires_at: null },
  // v5 — Hotelcraft
  { id: 'b10', vendor_id: 'v5',  badge_key: 'bbha_recommended',  assigned_by: 'admin-1', assigned_at: '2025-01-01T00:00:00Z', expires_at: null },
  { id: 'b11', vendor_id: 'v5',  badge_key: 'gst_registered',    assigned_by: 'admin-1', assigned_at: '2025-01-01T00:00:00Z', expires_at: null },
  // v6 — Combi King
  { id: 'b12', vendor_id: 'v6',  badge_key: 'negotiated_price',  assigned_by: 'admin-1', assigned_at: '2026-01-01T00:00:00Z', expires_at: '2026-07-31T00:00:00Z' },
  // v9 — Diversey
  { id: 'b13', vendor_id: 'v9',  badge_key: 'exclusive_partner', assigned_by: 'admin-1', assigned_at: '2025-04-01T00:00:00Z', expires_at: '2026-04-30T00:00:00Z' }, // 3 days — ⚠️
  { id: 'b14', vendor_id: 'v9',  badge_key: 'bbha_member_rate',  assigned_by: 'admin-1', assigned_at: '2025-04-01T00:00:00Z', expires_at: '2026-09-30T00:00:00Z' },
  // v11 — Posist
  { id: 'b15', vendor_id: 'v11', badge_key: 'bbha_member_rate',  assigned_by: 'admin-1', assigned_at: '2025-06-01T00:00:00Z', expires_at: '2026-05-31T00:00:00Z' },
  { id: 'b16', vendor_id: 'v11', badge_key: 'top_rated',         assigned_by: 'admin-1', assigned_at: '2025-01-01T00:00:00Z', expires_at: null },
  // v13 — HiCare
  { id: 'b17', vendor_id: 'v13', badge_key: 'fssai_approved',    assigned_by: 'admin-1', assigned_at: '2025-01-01T00:00:00Z', expires_at: null },
  { id: 'b18', vendor_id: 'v13', badge_key: 'bbha_recommended',  assigned_by: 'admin-1', assigned_at: '2025-01-01T00:00:00Z', expires_at: null },
  // v14 — Securitas
  { id: 'b19', vendor_id: 'v14', badge_key: 'verified_supplier', assigned_by: 'admin-1', assigned_at: '2025-01-01T00:00:00Z', expires_at: '2026-12-31T00:00:00Z' },
  // v19 — Compliancewala
  { id: 'b20', vendor_id: 'v19', badge_key: 'bbha_recommended',  assigned_by: 'admin-1', assigned_at: '2025-01-01T00:00:00Z', expires_at: null },
  { id: 'b21', vendor_id: 'v19', badge_key: 'exclusive_partner', assigned_by: 'admin-1', assigned_at: '2025-01-01T00:00:00Z', expires_at: '2026-12-31T00:00:00Z' },
]

export const MOCK_PAYMENT_SUBMISSIONS: PaymentSubmission[] = [
  {
    id: 'ps1', membership_id: 'm1', profile_id: 'member-1',
    utr_number: 'HDFC0000123456789', amount_paid: 5900, payment_method: 'upi',
    status: 'verified', rejection_reason: null,
    invoice_number: 'BBHA/2025/0042',
    submitted_at: '2024-03-28T10:15:00Z', verified_at: '2024-03-28T14:30:00Z',
    verified_by: 'admin-1', notes: null,
  },
  {
    id: 'ps2', membership_id: 'm2', profile_id: 'member-2',
    utr_number: 'ICICI9988776655441', amount_paid: 5900, payment_method: 'neft',
    status: 'pending', rejection_reason: null,
    invoice_number: null,
    submitted_at: '2026-04-20T09:45:00Z', verified_at: null,
    verified_by: null, notes: null,
  },
  {
    id: 'ps3', membership_id: 'm3', profile_id: 'member-3',
    utr_number: 'SBI334455667788990', amount_paid: 5900, payment_method: 'imps',
    status: 'rejected', rejection_reason: 'UTR not found in bank records. Please recheck and resubmit.',
    invoice_number: null,
    submitted_at: '2026-04-15T16:00:00Z', verified_at: '2026-04-16T10:00:00Z',
    verified_by: 'admin-1', notes: null,
  },
]

export const MOCK_INVOICE_SETTINGS: InvoiceSettings = {
  id: 'settings-1',
  bbha_name: 'Bangalore Hotels Association (Regd.)',
  bbha_gstin: '29AAATB0945Q1ZF',
  bbha_address: 'No. 87, Shreshta Bhoomi, Bangalore – 560 004, Karnataka',
  bbha_phone: '080-26674444',
  bbha_email: 'info@bbha.in',
  sac_code: '997221',
  membership_fee: 5000,
  gst_rate: 18,
  invoice_prefix: 'BBHA',
  invoice_counter: 42,
  upi_id: 'bbha@sbi',
  bank_name: 'State Bank of India',
  bank_account: '39876543210',
  bank_ifsc: 'SBIN0040177',
  logo_url: null,
  updated_at: '2026-04-01T00:00:00Z',
  updated_by: 'admin-1',
}
