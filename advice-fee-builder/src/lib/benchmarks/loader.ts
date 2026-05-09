import rawData from '../../data/benchmarks.json';

interface FuaBandData {
  value_pct: number;
  range: [number, number];
  confidence: string;
}

interface BenchmarkPayload {
  ongoing_fee: {
    typical: { median_ongoing_fee: number; average_ongoing_fee: number };
    simple: { median_ongoing_fee: number; source: string };
    comprehensive: { median_ongoing_fee: number; source: string };
    top_20pct_highly_profitable: { value: number };
  };
  fua_based_fee: {
    under_250k: FuaBandData;
    '250k_to_1m': FuaBandData;
    '1m_to_3m': FuaBandData;
    above_3m: FuaBandData;
  };
  initial_advice_soa: {
    simple: { value: number; range: [number, number] };
    comprehensive: { value: number; range: [number, number] };
  };
}

export const BENCHMARKS: BenchmarkPayload = rawData.benchmarks as BenchmarkPayload;
