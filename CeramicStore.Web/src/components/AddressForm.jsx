function AddressForm({ value, onChange }) {
  function handleChange(event) {
    const { name, value: fieldValue } = event.target;
    onChange({ ...value, [name]: fieldValue });
  }

  return (
    <div className="address-form">
      <label className="form-field">
        <span>نام گیرنده</span>
        <input name="recipientName" value={value.recipientName} onChange={handleChange} />
      </label>

      <label className="form-field">
        <span>شماره تماس گیرنده</span>
        <input
          name="phone"
          value={value.phone}
          onChange={handleChange}
          inputMode="tel"
          autoComplete="tel"
        />
      </label>

      <label className="form-field">
        <span>استان</span>
        <input name="province" value={value.province} onChange={handleChange} />
      </label>

      <label className="form-field">
        <span>شهر</span>
        <input name="city" value={value.city} onChange={handleChange} />
      </label>

      <label className="form-field form-field-wide">
        <span>نشانی کامل</span>
        <textarea
          name="addressLine"
          rows={3}
          value={value.addressLine}
          onChange={handleChange}
          maxLength={400}
        />
      </label>

      <label className="form-field">
        <span>کد پستی (۱۰ رقم)</span>
        <input
          name="postalCode"
          value={value.postalCode}
          onChange={handleChange}
          inputMode="numeric"
          maxLength={10}
        />
      </label>
    </div>
  );
}

export default AddressForm;
