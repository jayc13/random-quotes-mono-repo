export interface Quote {
  id: number;
  quote: string;
  author: string;
  categoryId: number;
}

export interface QuoteInput {
  quote: string;
  author: string;
  categoryId: number;
}

export interface GetAllQuotesOptions {
  pagination?: {
    limit?: number;
    offset?: number;
  };
  filter?: {
    categoryId?: number;
  };
}

export interface GetRandomQuoteOptions {
  categoryId?: number;
  lang?: string;
}
