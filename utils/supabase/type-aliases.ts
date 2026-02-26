import type { Database, Tables, TablesInsert, TablesUpdate } from "@/utils/supabase/database.types";

export type PublicTableName = keyof Database["public"]["Tables"];

export type TableRow<T extends PublicTableName> = Tables<T>;
export type TableInsert<T extends PublicTableName> = TablesInsert<T>;
export type TableUpdate<T extends PublicTableName> = TablesUpdate<T>;

export type ArticleRow = TableRow<"articles">;
export type ArticleInsert = TableInsert<"articles">;
export type ArticleUpdate = TableUpdate<"articles">;

export type JobPostingRow = TableRow<"job_postings">;
export type JobPostingInsert = TableInsert<"job_postings">;
export type JobPostingUpdate = TableUpdate<"job_postings">;

export type LogRow = TableRow<"logs">;
export type LogInsert = TableInsert<"logs">;
export type LogUpdate = TableUpdate<"logs">;

export type NewsletterImageRow = TableRow<"newsletter_images">;
export type NewsletterImageInsert = TableInsert<"newsletter_images">;
export type NewsletterImageUpdate = TableUpdate<"newsletter_images">;

export type NewsletterRow = TableRow<"newsletters">;
export type NewsletterInsert = TableInsert<"newsletters">;
export type NewsletterUpdate = TableUpdate<"newsletters">;

export type StockPriceRow = TableRow<"stock_prices">;
export type StockPriceInsert = TableInsert<"stock_prices">;
export type StockPriceUpdate = TableUpdate<"stock_prices">;

export type StockTickerRow = TableRow<"stock_tickers">;
export type StockTickerInsert = TableInsert<"stock_tickers">;
export type StockTickerUpdate = TableUpdate<"stock_tickers">;

export type ToolRow = TableRow<"tools">;
export type ToolInsert = TableInsert<"tools">;
export type ToolUpdate = TableUpdate<"tools">;