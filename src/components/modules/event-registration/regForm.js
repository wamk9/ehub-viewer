// Helpers for event registration_form_template answers.

const isCheck = (f) => f.type === 'checkbox' || f.type === 'switch'

// Blank answers for a template (checkboxes start unchecked).
export function initialValues(fields) {
  const out = {}
  ;(fields || []).forEach((f) => { out[f.name] = isCheck(f) ? false : '' })
  return out
}

// Required fields left blank; a required checkbox must be ticked.
export function validateAnswers(fields, data) {
  const errors = {}
  ;(fields || []).forEach((f) => {
    if (!f.required) return
    const v = data[f.name]
    if (v === '' || v === null || v === undefined || v === false) errors[f.name] = true
  })
  return errors
}
