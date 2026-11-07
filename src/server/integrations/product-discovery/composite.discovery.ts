import {
  IProductDiscoveryProvider,
  ProductQuery,
  DiscoveredProduct,
} from './product-discovery.interface';
import { Channel3Provider } from './channel3.provider';
import { CuratedCatalogProvider } from './catalog.provider';

export class CompositeDiscoveryProvider implements IProductDiscoveryProvider {
  public readonly providerName = 'Composite Product Discovery Router (Channel3 + Verified Catalog)';
  private channel3: Channel3Provider;
  private catalog: CuratedCatalogProvider;

  constructor() {
    this.channel3 = new Channel3Provider();
    this.catalog = new CuratedCatalogProvider();
  }

  public isLiveConfigured(): boolean {
    return this.channel3.isLiveConfigured();
  }

  public async searchProducts(query: ProductQuery): Promise<DiscoveredProduct[]> {
    if (this.channel3.isLiveConfigured()) {
      try {
        const liveResults = await this.channel3.searchProducts(query);
        if (liveResults && liveResults.length > 0) {
          console.log(`[Discovery] Retrieved ${liveResults.length} live products via Channel3 API`);
          return liveResults;
        }
      } catch (err) {
        console.warn('[Discovery] Channel3 API query failed, falling back to Verified B2B Catalog:', err);
      }
    }

    // Default to verified catalog
    return this.catalog.searchProducts(query);
  }

  public async getProductById(id: string): Promise<DiscoveredProduct | null> {
    if (id.startsWith('ch3-') && this.channel3.isLiveConfigured()) {
      return this.channel3.getProductById(id);
    }
    return this.catalog.getProductById(id);
  }
}
