import type { ContractKind } from '../engine/rates';
import { t, type Lang } from '../i18n/strings';
import s from './ContractBar.module.css';

type Props = {
  lang: Lang;
  contract: ContractKind;
  onContract: (contract: ContractKind) => void;
};

const CONTRACTS: ContractKind[] = ['uop', 'zlecenie', 'dzielo'];

/**
 * Variant B's full-width bar, above everything. The contract is the first
 * decision and it changes the meaning of every number below it, so it is read
 * before the amount rather than tucked inside the card with it.
 *
 * `Zlecenie` and `Dzieło` stay Polish in the EN build: they are the legal names
 * of two contract types, and translating them would name something that does
 * not exist on a Polish payslip.
 */
export function ContractBar({ lang, contract, onContract }: Props) {
  return (
    <div className={s.wrap}>
      <span className={s.label} id="contract-label">
        {t(lang, 'field.contract.label')}
      </span>
      <div
        className={s.bar}
        role="radiogroup"
        aria-labelledby="contract-label"
        data-testid="contract-bar"
      >
        {CONTRACTS.map((kind) => (
          <button
            key={kind}
            type="button"
            role="radio"
            aria-checked={contract === kind}
            className={`${s.segment} ${contract === kind ? s.active : ''}`}
            onClick={() => onContract(kind)}
          >
            {t(lang, `contract.${kind}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
