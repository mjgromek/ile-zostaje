// The tax year is DATA, not code. No rate and no threshold may appear as a
// literal in an engine branch; every one of them arrives through this shape,
// carries an official source URL, and carries the date it took effect.
//
// `quote` holds the sentence the source page actually prints. It is what makes
// the citation checkable by a reader rather than a claim about a URL.

export type Cited<T> = {
  value: T;
  /** Verbatim from the source page, in the language the page publishes. */
  quote: string;
  /** Official source: zus.pl, podatki.gov.pl, gov.pl, isap.sejm.gov.pl. */
  source: string;
  sourceTitle: string;
  /** From when this value applies. ISO date. */
  effective: string;
  /** When a builder last opened the page and read the number off it. */
  verified: string;
};

/**
 * A percentage carried as a number with at most two decimal places, e.g. 9.76.
 * The engine converts it to hundredths of a percent and stays in integers, so
 * no rate ever meets a floating-point rounding boundary.
 */
export type PercentRate = Cited<number>;

/** An amount in grosz. Integer. 1 zł = 100 grosz. */
export type GroszAmount = Cited<number>;

export type YearRates = {
  year: number;

  /** Employee-financed share only. The employer's share is not this app's job. */
  contributions: {
    emerytalna: PercentRate;
    rentowa: PercentRate;
    chorobowa: PercentRate;
    zdrowotna: PercentRate;
  };

  pit: {
    firstRatePercent: PercentRate;
    secondRatePercent: PercentRate;
    /** Annual. The monthly advance uses one twelfth of it. */
    thresholdAnnualGrosz: GroszAmount;
    /** Annual kwota zmniejszająca podatek. */
    taxReducingAnnualGrosz: GroszAmount;
    /** The 1/12 a payer applies to a monthly advance, once PIT-2 is filed. */
    taxReducingMonthlyGrosz: GroszAmount;
    /** Zryczałtowane koszty uzyskania przychodu, one employment relationship. */
    deductibleCostsMonthlyGrosz: GroszAmount;
  };

  youthRelief: {
    /** Annual income ceiling of the ulga dla młodych. */
    annualLimitGrosz: GroszAmount;
  };

  minimumWageMonthlyGrosz: GroszAmount;
};
