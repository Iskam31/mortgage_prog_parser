export interface Bank {
  id?: number;
  name: string;
  domain: string;
  logoUrl?: string;
  mortgageUrl?: string;
}

export interface MortgageProgram {
  type: 'new_building' | 'secondary' | 'refinancing';
  regionCode?: string;
  rateMin: number;
  rateMax: number;
  initialPaymentMin?: number;
  initialPaymentMax?: number;
  loanTermMin?: number;
  loanTermMax?: number;
  isSpecial: boolean;
  specialName?: string;
  sourceUrl: string;
}

export interface ParseResult {
  domain: string;
  status: 'success' | 'error';
  programs?: MortgageProgram[];
  error?: string;
}

export interface ParseRequest {
  region: string;
  banks: Array<{
    domain: string;
    url: string;
  }>;
}

export interface ParseResponse {
  results: ParseResult[];
}
