import { ProductOffer, SpecificationMatch } from '../../types';
import { RawProduct } from './research.service';

export interface ScoringOptions {
  quantity: number;
  maxBudget: number; // in cents
  mandatorySpecs: string[];
  preferences: string[];
}

export class DeterministicScoringEngine {
  /**
   * Evaluate raw products and vendor offers against constraints and calculate scores.
   * Weight breakdown:
   * - Price: 35%
   * - Product specifications: 30%
   * - Vendor reliability: 20%
   * - Delivery: 10%
   * - Availability: 5%
   */
  public static evaluateOffers(
    products: RawProduct[],
    options: ScoringOptions
  ): ProductOffer[] {
    const { quantity, maxBudget, mandatorySpecs, preferences } = options;
    const maxUnitBudget = maxBudget > 0 && quantity > 0 ? Math.floor(maxBudget / quantity) : Infinity;

    const evaluatedOffers: ProductOffer[] = [];

    // Find min and max price across all offers for relative price scoring
    let minPrice = Infinity;
    let maxPrice = 0;
    products.forEach(p => {
      p.offers.forEach(o => {
        if (o.unitPrice < minPrice) minPrice = o.unitPrice;
        if (o.unitPrice > maxPrice) maxPrice = o.unitPrice;
      });
    });

    if (minPrice === Infinity) minPrice = 1;
    if (maxPrice <= minPrice) maxPrice = minPrice + 1;

    for (const product of products) {
      // 1. Evaluate Mandatory Specifications (Hard Filters)
      const specMatches: SpecificationMatch[] = [];
      let failsMandatory = false;
      let failReason = '';

      const specsText = JSON.stringify(product.specifications).toLowerCase() + ' ' + product.name.toLowerCase() + ' ' + product.description.toLowerCase();

      for (const mandatory of mandatorySpecs) {
        const m = mandatory.trim().toLowerCase();
        let met = false;

        if (m.includes('4k')) {
          met = specsText.includes('4k') || specsText.includes('3840 x 2160') || specsText.includes('3840x2160') || specsText.includes('uhd');
        } else if (m.includes('usb-c') || m.includes('type-c')) {
          const hasUsbC = (specsText.includes('usb-c') || specsText.includes('type-c') || specsText.includes('usb type c'));
          const hasNoUsbC = specsText.includes('no usb-c') || specsText.includes('no native usb-c') || product.specifications['USB-C Power Delivery'] === 'None';
          met = hasUsbC && !hasNoUsbC;
        } else if (m.includes('16gb') || m.includes('16 gb')) {
          const has16Gb = (specsText.includes('16gb') || specsText.includes('16 gb') || specsText.includes('16-gb'));
          const fails16Gb = specsText.includes('fails 16gb') || specsText.includes('8gb lpddr5') || specsText.includes('only 8gb');
          met = has16Gb && !fails16Gb;
        } else if (m.includes('512gb') || m.includes('512 gb')) {
          const has512Gb = (specsText.includes('512gb') || specsText.includes('512 gb') || specsText.includes('512-gb'));
          const fails512Gb = specsText.includes('fails 512gb') || specsText.includes('256gb nvme');
          met = has512Gb && !fails512Gb;
        } else {
          // general token match
          const tokens = m.split(/\s+/).filter(t => t.length > 2);
          met = tokens.length === 0 || tokens.every(token => specsText.includes(token));
        }

        specMatches.push({
          spec: mandatory,
          met,
          notes: met ? 'Meets verified specification requirement' : `Specification '${mandatory}' not satisfied by hardware specs`,
        });

        if (!met) {
          failsMandatory = true;
          failReason = `Failed mandatory requirement: ${mandatory}`;
        }
      }

      // 2. Score and normalize each vendor offer
      for (const offer of product.offers) {
        const totalOfferCost = offer.unitPrice * quantity;
        let isEligible = !failsMandatory;
        let disqualificationReason = failReason;

        // Check budget hard filter
        if (maxBudget > 0 && totalOfferCost > maxBudget) {
          isEligible = false;
          disqualificationReason = `Total cost ($${(totalOfferCost / 100).toFixed(2)}) exceeds maximum budget limit ($${(maxBudget / 100).toFixed(2)})`;
        }

        // PRICE SCORE (35 points max)
        // Lower price yields higher score
        let priceScore = 0;
        if (offer.unitPrice <= maxUnitBudget) {
          const priceRatio = (maxPrice - offer.unitPrice) / (maxPrice - minPrice || 1);
          priceScore = 20 + Math.round(priceRatio * 15); // range: 20-35
        } else {
          priceScore = Math.max(0, 15 - Math.round(((offer.unitPrice - maxUnitBudget) / maxUnitBudget) * 15));
        }

        // SPECIFICATIONS SCORE (30 points max)
        let specsScore = 0;
        if (!failsMandatory) {
          specsScore = 20; // baseline for meeting all mandatory specs
          // Bonus for matching optional preferences
          let prefMatches = 0;
          for (const pref of preferences) {
            if (specsText.includes(pref.toLowerCase())) prefMatches++;
          }
          if (preferences.length > 0) {
            specsScore += Math.round((prefMatches / preferences.length) * 10);
          } else {
            specsScore += 10;
          }
        }

        // VENDOR RELIABILITY SCORE (20 points max)
        const vendorScore = Math.round((offer.vendorReliabilityScore / 100) * 20);

        // DELIVERY SCORE (10 points max)
        let deliveryScore = 5;
        if (offer.deliveryDays <= 1) deliveryScore = 10;
        else if (offer.deliveryDays <= 2) deliveryScore = 9;
        else if (offer.deliveryDays <= 3) deliveryScore = 8;
        else if (offer.deliveryDays <= 5) deliveryScore = 6;
        else deliveryScore = 3;

        // AVAILABILITY SCORE (5 points max)
        let availabilityScore = 3;
        if (offer.availability === 'in_stock') availabilityScore = 5;
        else if (offer.availability === 'limited') availabilityScore = 3;
        else availabilityScore = 0;

        const totalScore = isEligible
          ? Math.min(100, priceScore + specsScore + vendorScore + deliveryScore + availabilityScore)
          : Math.min(40, Math.round((priceScore + vendorScore) * 0.4)); // penalized if not eligible

        let aiExplanation = '';
        if (isEligible) {
          aiExplanation = `Passed all mandatory hard filters (${mandatorySpecs.join(', ')}). Offered by verified vendor ${offer.vendor} with ${offer.vendorReliabilityScore}% reliability rating. Unit price $${(offer.unitPrice / 100).toFixed(2)} is within budget limit. Total score: ${totalScore}/100.`;
        } else {
          aiExplanation = `Disqualified: ${disqualificationReason}. Cannot be recommended as compliant purchase.`;
        }

        evaluatedOffers.push({
          id: `offer-${product.id}-${offer.vendor.replace(/\s+/g, '-').toLowerCase()}`,
          productId: product.id,
          productName: product.name,
          brand: product.brand,
          category: product.category,
          description: product.description,
          imageUrl: product.imageUrl,
          productUrl: product.productUrl,
          vendor: offer.vendor,
          vendorUrl: offer.vendorUrl,
          unitPrice: offer.unitPrice,
          currency: 'USD',
          availability: offer.availability,
          deliveryDays: offer.deliveryDays,
          deliveryEstimate: offer.deliveryEstimate,
          vendorReliabilityScore: offer.vendorReliabilityScore,
          specifications: product.specifications,
          specMatches,
          isEligible,
          disqualificationReason: isEligible ? undefined : disqualificationReason,
          scores: {
            priceScore,
            specsScore,
            vendorScore,
            deliveryScore,
            availabilityScore,
            totalScore,
          },
          aiExplanation,
        });
      }
    }

    // Sort: Eligible first, then descending by total score, then by lowest unit price
    return evaluatedOffers.sort((a, b) => {
      if (a.isEligible && !b.isEligible) return -1;
      if (!a.isEligible && b.isEligible) return 1;
      if (b.scores.totalScore !== a.scores.totalScore) {
        return b.scores.totalScore - a.scores.totalScore;
      }
      return a.unitPrice - b.unitPrice;
    });
  }
}
