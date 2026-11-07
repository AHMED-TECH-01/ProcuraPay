import { SpendingPolicy, PolicyValidationResult, ProductOffer } from '../../types';

export class PolicyService {
  /**
   * Deterministically validates an offer and purchase parameters against the organization's spending policy.
   * AI CANNOT OVERRIDE POLICY DECISIONS.
   */
  public static validatePolicy(
    policy: SpendingPolicy,
    params: {
      totalAmount: number; // in cents
      category: string;
      vendor: string;
      vendorUrl?: string;
      selectedOffer?: ProductOffer;
    }
  ): PolicyValidationResult {
    const violations: string[] = [];
    const warnings: string[] = [];

    // 1. Max Purchase Amount Check
    if (params.totalAmount > policy.maxPurchaseAmount) {
      violations.push(
        `Total amount ($${(params.totalAmount / 100).toFixed(2)}) exceeds maximum allowed organization spending policy ($${(policy.maxPurchaseAmount / 100).toFixed(2)})`
      );
    }

    // 2. Blocked Categories Check
    const normalizedCategory = params.category.toLowerCase().trim();
    for (const blocked of policy.blockedCategories) {
      if (normalizedCategory.includes(blocked.toLowerCase().trim())) {
        violations.push(`Category '${params.category}' is strictly prohibited by organization spending policy`);
      }
    }

    // 3. Allowed Vendor Domains Check (if configured)
    if (policy.allowedVendorDomains && policy.allowedVendorDomains.length > 0) {
      const vendorDomain = (params.vendorUrl || params.vendor || '').toLowerCase();
      const domainMatch = policy.allowedVendorDomains.some(d =>
        vendorDomain.includes(d.toLowerCase().trim())
      );
      if (!domainMatch) {
        warnings.push(
          `Vendor '${params.vendor}' is not in the organization's pre-approved supplier domain list. Requires elevated authorization.`
        );
      }
    }

    // 4. Mandatory Human Approval Check
    let requiresApproval = policy.approvalRequired;
    if (params.totalAmount >= policy.requireApprovalAbove) {
      requiresApproval = true;
    }

    return {
      passed: violations.length === 0,
      requiresApproval,
      violations,
      warnings,
      checkedAt: new Date().toISOString(),
    };
  }
}
