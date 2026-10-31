import { showSuccessPopup } from './successPopup'

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

/**
 * The footer newsletter form, ported from the source's form binder (main.js `vo`, bound by
 * `yo` to every `.footer-ronn__newsletter-form`): native constraint validation with the
 * field's `data-error-*` messages, shown on blur and cleared on input once valid; the
 * consent checkbox (`[data-consent-gate]`) only appears once the email is valid; the submit
 * button carries `aria-disabled` while the form is invalid; an invalid submit shows every
 * error and focuses the first invalid field.
 *
 * Unlike the source, a valid submit sends nothing anywhere (no reCAPTCHA, no request): it
 * shows the same "Thank you for subscribing!" toast the source shows on success, anchored
 * to the form, then resets the form.
 */
export function initNewsletterForm(form: HTMLFormElement) {
  const submit = form.querySelector<HTMLElement>('button[type="submit"], [type="submit"]')
  const fields = [...form.elements].filter(
    (element): element is Field =>
      'willValidate' in element &&
      (element as Field).willValidate &&
      (element as Field).type !== 'submit' &&
      (element as Field).type !== 'button' &&
      (element as Field).name !== 'website',
  )
  const isFormValid = () => fields.every((field) => field.validity.valid)
  const consentGate = form.querySelector<HTMLElement>('[data-consent-gate]')
  const gatedBy = fields.filter((field) => field.type !== 'checkbox' && field.type !== 'radio')

  const updateConsentGate = () => {
    if (consentGate) consentGate.hidden = !gatedBy.every((field) => field.validity.valid)
  }

  const errorMessage = (field: Field) => {
    const { validity } = field
    if (validity.valid) return ''
    if (validity.valueMissing) return field.dataset.errorRequired || field.validationMessage
    if (validity.typeMismatch) return field.dataset.errorType || field.validationMessage
    return (
      ((validity.patternMismatch || validity.tooShort || validity.tooLong) &&
        field.dataset.errorPattern) ||
      field.validationMessage
    )
  }

  const errorElement = (field: Field) => {
    const id = field.getAttribute('aria-describedby')
    if (id) {
      const element = document.getElementById(id)
      if (element) return element
    }
    return field.closest('div, label')?.querySelector<HTMLElement>('[data-field-error]') ?? null
  }

  const showError = (field: Field) => {
    const isInvalid = !field.validity.valid
    field.setAttribute('aria-invalid', isInvalid ? 'true' : 'false')
    const element = errorElement(field)
    if (element) element.textContent = isInvalid ? errorMessage(field) : ''
  }

  const clearErrors = () => {
    fields.forEach((field) => {
      field.setAttribute('aria-invalid', 'false')
      const element = errorElement(field)
      if (element) element.textContent = ''
    })
  }

  const updateState = () => {
    submit?.setAttribute('aria-disabled', isFormValid() ? 'false' : 'true')
    updateConsentGate()
  }

  const cleanups = fields.map((field) => {
    const isChoice = field.type === 'checkbox' || field.type === 'radio'
    if (isChoice) {
      const onChange = () => {
        showError(field)
        updateState()
      }
      field.addEventListener('change', onChange)
      return () => field.removeEventListener('change', onChange)
    }
    const onInput = () => {
      if (field.validity.valid) showError(field)
      updateState()
    }
    const onBlur = () => {
      showError(field)
      updateState()
    }
    field.addEventListener('input', onInput)
    field.addEventListener('blur', onBlur)
    return () => {
      field.removeEventListener('input', onInput)
      field.removeEventListener('blur', onBlur)
    }
  })

  updateState()

  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault()
    if (!isFormValid()) {
      fields.forEach(showError)
      fields.find((field) => !field.validity.valid)?.focus()
      updateState()
      return
    }
    // Local no-op: nothing is sent. Show the source's success toast instead.
    const toast = document.querySelector<HTMLElement>('[data-form-success="newsletter"]')
    if (toast) showSuccessPopup(toast, { anchor: form })
    form.reset()
    clearErrors()
    updateState()
  }
  form.addEventListener('submit', onSubmit)

  return () => {
    cleanups.forEach((cleanup) => cleanup())
    form.removeEventListener('submit', onSubmit)
  }
}
