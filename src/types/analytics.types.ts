export interface EventAnalytics {
  totalRevenue: number;
  totalTicketsSold: number;
  totalCapacity: number;
  totalCheckedIn: number;
  totalPendingEntry: number;
}

// --- DEMAND FORECAST ---

export interface DailySales {
  date: string;
  sold: number;
}

export interface ForecastEvaluation {
  source: string;
  eventGroupsTrain: number;
  eventGroupsHoldout: number;
  holdoutSnapshots: number;
  rfSellThroughMAEPercentagePoints: number;
  naivePaceMAEPercentagePoints: number;
  sellOutProbabilityBrierScore: number;
  warning: string;
}

export interface TierPrediction {
  tierId: string;
  tierName: string;
  capacity: number;
  sold: number;
  price: number;
  sold3d: number;
  sold7d: number;
  projectedSold: number;
  naiveProjectedSold: number;
  projectedSellThrough: number;
  sellOutProbability: number;
  estSellOutDate: string | null;
  status: string;
  recommendation: string;
  actualSales: DailySales[];
  projection: DailySales[];
}

export interface HistoricalTier {
  tierId: string;
  tierName: string;
  capacity: number;
  soldTickets: number;
  currentTicketPrice: number;
  faceValueGross: number;
  actualSellThroughPercent: number;
  final3DaysSold: number;
  final7DaysSold: number;
  firstSaleDate: string | null;
  lastSaleDate: string | null;
  peakSalesDate: string | null;
  peakDailyTickets: number;
  insight: string;
  actualSales: DailySales[];
}

export interface ForecastHistorical {
  eventPhase: string;
  salesThroughDate: string;
  totalCapacity: number;
  totalTicketsSold: number;
  overallSellThroughPercent: number;
  recordedOrderGross: number;
  faceValueGross: number;
  topTierId: string | null;
  topTierName: string | null;
  tiers: HistoricalTier[];
}

export interface ReplayTier {
  tierId: string;
  tierName: string;
  predictedSold: number;
  naiveProjectedSold: number;
  actualSold: number;
  absoluteModelErrorTickets: number;
  absoluteNaiveErrorTickets: number;
}

export interface ForecastReplay {
  simulatedAsOf: string;
  note: string;
  modelMeanAbsoluteErrorTickets: number;
  naiveMeanAbsoluteErrorTickets: number;
  tiers: ReplayTier[];
}

export interface DemandForecast {
  eventId: string;
  asOf: string;
  eventDate: string;
  method: string;
  dataWarning?: string | null;
  evaluation: ForecastEvaluation;
  predictions: TierPrediction[];
  viewType: string;
  historical?: ForecastHistorical | null;
  replay?: ForecastReplay | null;
}