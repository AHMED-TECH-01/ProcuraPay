import {
  IProductDiscoveryProvider,
  ProductQuery,
  DiscoveredProduct,
} from './product-discovery.interface';
import { VERIFIED_PRODUCT_CATALOG } from '../../services/research.service';

export class CuratedCatalogProvider implements IProductDiscoveryProvider {
  public readonly providerName = 'Curated Verified B2B Commercial Catalog';

  public isLiveConfigured(): boolean {
    return true; // Always operational as baseline
  }

  public async searchProducts(query: ProductQuery): Promise<DiscoveredProduct[]> {
    const rawList = VERIFIED_PRODUCT_CATALOG;
    const keywords = query.keywords.map((k) => k.toLowerCase());

    const matched = rawList.filter((prod) => {
      // Category filter if present
      if (query.category && query.category !== 'General Procurement') {
        if (prod.category.toLowerCase() !== query.category.toLowerCase()) {
          // allow relaxed match
          if (!prod.category.toLowerCase().includes(query.category.toLowerCase().split(' ')[0])) {
            return false;
          }
        }
      }

      // Keyword match in name, description, brand, or specs
      const fullText = `${prod.name} ${prod.brand} ${prod.description} ${Object.values(prod.specifications).join(' ')}`.toLowerCase();
      const hasKeyword = keywords.some((kw) => fullText.includes(kw));
      if (!hasKeyword && keywords.length > 0) {
        return false;
      }

      // Budget filter: ensure at least one offer meets max budget
      if (query.maxBudgetPerUnit && query.maxBudgetPerUnit > 0) {
        const hasBudgetOffer = prod.offers.some((o) => o.unitPrice <= query.maxBudgetPerUnit! * 1.15);
        if (!hasBudgetOffer) return false;
      }

      return true;
    });

    const resultsToReturn = matched.length > 0 ? matched : rawList.slice(0, 3);

    return resultsToReturn.map((prod) => ({
      id: prod.id,
      name: prod.name,
      brand: prod.brand,
      category: prod.category,
      description: prod.description,
      imageUrl: prod.imageUrl,
      productUrl: prod.productUrl,
      specifications: prod.specifications,
      dataSource: 'VERIFIED_CURATED_CATALOG',
      offers: prod.offers.map((o, idx) => ({
        id: `cat-off-${prod.id}-${idx}`,
        vendor: o.vendor,
        vendorUrl: o.vendorUrl,
        unitPrice: o.unitPrice,
        availability: o.availability,
        deliveryDays: o.deliveryDays,
        deliveryEstimate: o.deliveryEstimate,
        vendorReliabilityScore: o.vendorReliabilityScore,
      })),
    }));
  }

  public async getProductById(id: string): Promise<DiscoveredProduct | null> {
    const found = VERIFIED_PRODUCT_CATALOG.find((p) => p.id === id);
    if (!found) return null;

    return {
      id: found.id,
      name: found.name,
      brand: found.brand,
      category: found.category,
      description: found.description,
      imageUrl: found.imageUrl,
      productUrl: found.productUrl,
      specifications: found.specifications,
      dataSource: 'VERIFIED_CURATED_CATALOG',
      offers: found.offers.map((o, idx) => ({
        id: `cat-off-${found.id}-${idx}`,
        vendor: o.vendor,
        vendorUrl: o.vendorUrl,
        unitPrice: o.unitPrice,
        availability: o.availability,
        deliveryDays: o.deliveryDays,
        deliveryEstimate: o.deliveryEstimate,
        vendorReliabilityScore: o.vendorReliabilityScore,
      })),
    };
  }
}
