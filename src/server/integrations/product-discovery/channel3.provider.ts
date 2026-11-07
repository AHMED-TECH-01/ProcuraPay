import {
  IProductDiscoveryProvider,
  ProductQuery,
  DiscoveredProduct,
} from './product-discovery.interface';

export class Channel3Provider implements IProductDiscoveryProvider {
  public readonly providerName = 'Channel3 B2B Product Discovery API';
  private apiKey: string | undefined;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.CHANNEL3_API_KEY;
    this.baseUrl = process.env.CHANNEL3_BASE_URL || 'https://api.channel3.io/v1';
  }

  public isLiveConfigured(): boolean {
    return !!(this.apiKey && this.apiKey.trim() !== '' && !this.apiKey.includes('MY_CHANNEL3'));
  }

  public async searchProducts(query: ProductQuery): Promise<DiscoveredProduct[]> {
    if (!this.isLiveConfigured()) {
      throw new Error('Channel3 API credentials are not configured in environment.');
    }

    try {
      const q = query.keywords.join(' ');
      const url = new URL(`${this.baseUrl}/products/search`);
      url.searchParams.set('q', q);
      if (query.category) url.searchParams.set('category', query.category);
      if (query.maxBudgetPerUnit) {
        url.searchParams.set('max_price', (query.maxBudgetPerUnit / 100).toFixed(2));
      }

      const res = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
          'User-Agent': 'ProcuraPay-AI/1.0',
        },
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error('Channel3 API unauthorized: check CHANNEL3_API_KEY.');
      }

      if (res.status === 429) {
        throw new Error('Channel3 API rate limit exceeded.');
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Channel3 API error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      const items = Array.isArray(data.items) ? data.items : [];

      return items.map((item: any, idx: number) => ({
        id: `ch3-${item.id || idx}`,
        name: item.title || item.name,
        brand: item.brand || 'Enterprise Supplier',
        category: item.category || query.category || 'General Procurement',
        description: item.description || '',
        imageUrl: item.image_url || item.thumbnail || '',
        productUrl: item.url || '',
        specifications: item.specifications || {},
        dataSource: 'LIVE_CHANNEL3_API',
        offers: (item.offers || []).map((o: any, oIdx: number) => ({
          id: `ch3-off-${item.id || idx}-${oIdx}`,
          vendor: o.merchant_name || o.vendor || 'Authorized Supplier',
          vendorUrl: o.url || item.url || '',
          unitPrice: Math.round(parseFloat(o.price || '0') * 100),
          availability: o.in_stock ? 'in_stock' : 'limited',
          deliveryDays: o.shipping_days || 3,
          deliveryEstimate: `${o.shipping_days || 3} Business Days`,
          vendorReliabilityScore: o.rating ? Math.round(o.rating * 20) : 95,
        })),
      }));
    } catch (err) {
      console.warn('[Channel3Provider] Failed to fetch live products:', err);
      throw err;
    }
  }

  public async getProductById(id: string): Promise<DiscoveredProduct | null> {
    if (!this.isLiveConfigured()) return null;
    try {
      const res = await fetch(`${this.baseUrl}/products/${encodeURIComponent(id)}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) return null;
      const item = await res.json();
      return {
        id: item.id,
        name: item.title,
        brand: item.brand,
        category: item.category,
        description: item.description,
        imageUrl: item.image_url,
        productUrl: item.url,
        specifications: item.specifications || {},
        dataSource: 'LIVE_CHANNEL3_API',
        offers: [],
      };
    } catch {
      return null;
    }
  }
}
