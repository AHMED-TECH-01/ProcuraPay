export interface ProductQuery {
  keywords: string[];
  category?: string;
  maxBudgetPerUnit?: number; // cents
  minVendorScore?: number;
  mandatorySpecs?: string[];
}

export interface DiscoveredOffer {
  id: string;
  vendor: string;
  vendorUrl: string;
  unitPrice: number; // in cents
  availability: 'in_stock' | 'limited' | 'backorder';
  deliveryDays: number;
  deliveryEstimate: string;
  vendorReliabilityScore: number;
}

export interface DiscoveredProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  imageUrl: string;
  productUrl: string;
  specifications: Record<string, string>;
  offers: DiscoveredOffer[];
  dataSource: 'LIVE_CHANNEL3_API' | 'VERIFIED_CURATED_CATALOG';
}

export interface IProductDiscoveryProvider {
  readonly providerName: string;
  isLiveConfigured(): boolean;
  searchProducts(query: ProductQuery): Promise<DiscoveredProduct[]>;
  getProductById(id: string): Promise<DiscoveredProduct | null>;
}
