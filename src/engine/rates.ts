// The tax year is DATA, not code. No rate and no threshold may appear as a
// literal in an engine branch; every one of them arrives through this shape,
// carries an official source URL, and carries the date it took effect.
//
// `quote` holds the sentence the source page actually prints. It is what makes
// the citation checkable by a reader rather than a claim about a URL.
//
// A RULE is data here too, not only a number. Which contracts the under-26
// relief covers, whether a student under 26 pays ZUS on a zlecenie, whether
// chorobowa is voluntary: each is a cited value, because a rule that lives in
// an `if` cannot be read off the screen and cannot be checked against a page.

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

/** A rule the source states as a yes or a no, carried with its sentence. */
export type CitedRule = Cited<boolean>;

/** The three contract types this app models. */
export type ContractKind = 'uop' | 'zlecenie' | 'dzielo';

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

  /** What changes when the contract is not umowa o pracę. */
  contracts: {
    zlecenie: {
      /** Chorobowa is not compulsory on a zlecenie, so this app models it off. */
      chorobowaVoluntary: CitedRule;
      /** A pupil or student under 26 is outside ZUS entirely on a zlecenie. */
      studentUnder26Exempt: CitedRule;
      /** Koszty uzyskania przychodu as a percentage of the taxed przychód. */
      costsPercent: PercentRate;
    };
    dzielo: {
      /** Umowa o dzieło carries no social and no health contribution at all. */
      outsideZus: CitedRule;
      costsPercent: PercentRate;
      /** The higher rate, earned by transferring copyright in creative work. */
      copyrightCostsPercent: PercentRate;
      /**
       * The annual ceiling on 50% costs. It happens to equal
       * `pit.thresholdAnnualGrosz` and is NOT an alias of it: the source states
       * two facts that are numerically equal, and one may move without the
       * other. Aliasing them would make that day's arithmetic silently wrong.
       */
      copyrightCostsAnnualCapGrosz: GroszAmount;
    };
  };

  youthRelief: {
    /** Annual income ceiling of the ulga dla młodych. */
    annualLimitGrosz: GroszAmount;
    /**
     * The contract types the relief covers, as the source enumerates them. The
     * engine reads this list; it never branches on a contract name. Where a
     * contract is absent, the screen says so rather than ignoring the answer.
     */
    contracts: Cited<ContractKind[]>;
  };

  minimumWageMonthlyGrosz: GroszAmount;
};
