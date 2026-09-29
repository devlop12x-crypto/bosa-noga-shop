import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import type { OrderOwner } from '../../core/order';
import { Preloader } from '../../shared/ui/Preloader';
import { useStorefront } from '../../storefront';

interface OrderFormProps {
  isSubmitting: boolean;
  /** Заказ заблокирован расхождениями в корзине */
  isBlocked: boolean;
  error: string | null;
  onSubmit: (owner: OrderOwner) => void;
}

type Field = 'phone' | 'address' | 'agreement';

/**
 * Телефон и адрес живут только в состоянии формы: в localStorage их не пишем
 * (любой XSS или чужой человек за компьютером прочитал бы их). Запомнить данные
 * помогает браузер — через autocomplete, это надёжнее самодельного хранения.
 */
export function OrderForm({ isSubmitting, isBlocked, error, onSubmit }: OrderFormProps) {
  const { order } = useStorefront();
  const id = useId();
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [agreement, setAgreement] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedPhone = order.normalizePhone(phone);
    const trimmedAddress = address.trim();
    const nextErrors: Partial<Record<Field, string>> = {};
    if (!normalizedPhone) nextErrors.phone = 'Проверьте номер телефона';
    if (!trimmedAddress) nextErrors.address = 'Укажите адрес доставки';
    if (!agreement) nextErrors.agreement = 'Нужно согласие с правилами доставки';

    setErrors(nextErrors);
    if (normalizedPhone && trimmedAddress && agreement) {
      onSubmit({ phone: normalizedPhone, address: trimmedAddress });
    }
  };

  const invalid = (field: Field) => (errors[field] ? ' is-invalid' : '');
  const describedBy = (field: Field) => (errors[field] ? `${id}-${field}-error` : undefined);

  return (
    <div className="card" style={{ maxWidth: '30rem', margin: '0 auto' }}>
      <form className="card-body" noValidate onSubmit={handleSubmit}>
        <fieldset disabled={isSubmitting}>
          <div className="form-group">
            <label htmlFor={`${id}-phone`}>Телефон</label>
            <input
              id={`${id}-phone`}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className={`form-control${invalid('phone')}`}
              placeholder={order.phonePlaceholder}
              value={phone}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={describedBy('phone')}
              onChange={(event) => setPhone(event.target.value)}
            />
            {errors.phone && (
              <div id={`${id}-phone-error`} className="invalid-feedback">
                {errors.phone}
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor={`${id}-address`}>Адрес доставки</label>
            <input
              id={`${id}-address`}
              autoComplete="street-address"
              className={`form-control${invalid('address')}`}
              placeholder="Адрес доставки"
              value={address}
              aria-invalid={Boolean(errors.address)}
              aria-describedby={describedBy('address')}
              onChange={(event) => setAddress(event.target.value)}
            />
            {errors.address && (
              <div id={`${id}-address-error`} className="invalid-feedback">
                {errors.address}
              </div>
            )}
          </div>
          <div className="form-group form-check">
            <input
              id={`${id}-agreement`}
              type="checkbox"
              className={`form-check-input${invalid('agreement')}`}
              checked={agreement}
              aria-invalid={Boolean(errors.agreement)}
              aria-describedby={describedBy('agreement')}
              onChange={(event) => setAgreement(event.target.checked)}
            />
            <label className="form-check-label" htmlFor={`${id}-agreement`}>
              Согласен с правилами доставки
            </label>
            {errors.agreement && (
              <div id={`${id}-agreement-error`} className="invalid-feedback">
                {errors.agreement}
              </div>
            )}
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error} Данные формы сохранены — нажмите «Оформить» ещё раз.
            </div>
          )}
          {isSubmitting && <Preloader label="Оформляем заказ" />}

          <button type="submit" className="btn btn-outline-secondary" disabled={isBlocked}>
            Оформить
          </button>
          {isBlocked && (
            <small className="form-text text-muted">
              Сначала разберитесь с изменениями в корзине.
            </small>
          )}
        </fieldset>
      </form>
    </div>
  );
}
