export interface ParsedProcurementIntent {
  title: string;
  category: string;
  quantity: number;
  maxBudget: number; // in cents
  mandatorySpecs: string[];
  preferences: string[];
  suggestedSearchKeywords: string[];
  confidenceScore: number;
}

export interface OfferEvaluationScore {
  specFitScore: number;
  priceScore: number;
  deliveryScore: number;
  vendorReliabilityScore: number;
  warrantyScore: number;
  overallScore: number;
  reasoning: string;
}

export interface IAIProvider {
  readonly providerName: string;
  isAvailable(): boolean;
  parseProcurementIntent(prompt: string): Promise<ParsedProcurementIntent>;
  evaluateOffer(
    requirements: ParsedProcurementIntent,
    offerDetails: {
      productName: string;
      vendor: string;
      unitPrice: number;
      specs: Record<string, string>;
      deliveryDays: number;
    }
  ): Promise<OfferEvaluationScore>;
}
